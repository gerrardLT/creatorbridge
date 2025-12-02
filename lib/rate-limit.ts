import { NextRequest, NextResponse } from 'next/server';

// 简单的内存速率限制器
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // 时间窗口（毫秒）
  maxRequests: number;  // 最大请求数
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 分钟
  maxRequests: 60,  // 每分钟 60 次请求
};

// 获取客户端 IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// 检查速率限制
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request);
  const now = Date.now();
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // 新窗口
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  record.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// 速率限制响应
export function rateLimitResponse(resetTime: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}

// 添加速率限制头
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  limit: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  return response;
}

// 清理过期记录（定期调用）
export function cleanupRateLimitMap(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// 每 5 分钟清理一次
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

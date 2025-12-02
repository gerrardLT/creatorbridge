# Next.js Build 错误修复：Dynamic Server Usage

## 🚨 错误信息

```
Error: Dynamic server usage: Route /api/transactions couldn't be rendered statically 
because it used `request.url`.
```

---

## 🔍 问题原因

Next.js 14 使用 **App Router** 时，默认会尝试静态生成（Static Generation）所有路由，包括 API 路由。

当 API 路由使用了以下**动态特性**时，会导致构建失败：
- `request.url` - 获取请求 URL
- `request.headers` - 读取请求头
- `searchParams` - 查询参数
- 动态路由参数 `[id]`
- Cookie 操作

Next.js 无法在构建时确定这些值，因此需要明确告诉它这些路由需要**动态渲染**。

---

## ✅ 解决方案

在每个使用动态特性的 API 路由文件顶部添加：

```typescript
export const dynamic = 'force-dynamic';
```

这会告诉 Next.js：
- ✅ 不要尝试静态生成此路由
- ✅ 始终在服务器端动态处理请求
- ✅ 允许使用 `request.url`、`searchParams` 等动态特性

---

## 🔧 已修复的文件

### 1. **使用 `request.url` 的路由**

| 文件 | 说明 |
|------|------|
| `app/api/transactions/route.ts` | 获取用户交易记录 |
| `app/api/indexer/route.ts` | 查询索引器数据 |
| `app/api/user/route.ts` | 用户认证和查询 |
| `app/api/ip/route.ts` | IP 资产列表和创建 |
| `app/api/templates/route.ts` | 许可证模板列表 |
| `app/api/license/route.ts` | 许可证购买和查询 |

### 2. **使用动态路由参数 `[id]` 的路由**

| 文件 | 说明 |
|------|------|
| `app/api/ip/[id]/route.ts` | IP 资产详情和删除 |
| `app/api/derivatives/[ipId]/route.ts` | 衍生作品查询 |
| `app/api/royalties/[ipId]/route.ts` | 收益数据查询 |
| `app/api/templates/[id]/route.ts` | 模板更新和删除 |

### 3. **使用 POST 请求体的路由**

| 文件 | 说明 |
|------|------|
| `app/api/derivatives/route.ts` | 衍生作品注册 |

---

## 📝 修复示例

### 修复前（会报错）

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); // ❌ 使用了 request.url
  const userId = searchParams.get('userId');
  
  // ... 处理逻辑
}
```

### 修复后（正常工作）

```typescript
import { NextRequest, NextResponse } from 'next/server';

// ✅ 添加动态渲染配置
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); // ✅ 现在可以使用
  const userId = searchParams.get('userId');
  
  // ... 处理逻辑
}
```

---

## 🎯 验证修复

运行构建命令验证：

```bash
npm run build
```

**预期成功输出**：

```
✓ Compiled successfully
✓ Linting and checking validity of types    
✓ Collecting page data    
✓ Generating static pages (9/9)
✓ Collecting build traces    
✓ Finalizing page optimization    

Route (app)                              Size     First Load JS
┌ ○ /                                    4.45 kB        98.5 kB
├ ○ /_not-found                          873 B          88.1 kB
├ ƒ /api/derivatives                     0 B                0 B
├ ƒ /api/derivatives/[ipId]              0 B                0 B
├ ƒ /api/indexer                         0 B                0 B
├ ƒ /api/ip                              0 B                0 B
├ ƒ /api/ip/[id]                         0 B                0 B
├ ƒ /api/license                         0 B                0 B
├ ƒ /api/royalties/[ipId]                0 B                0 B
├ ƒ /api/templates                       0 B                0 B
├ ƒ /api/templates/[id]                  0 B                0 B
├ ƒ /api/transactions                    0 B                0 B
├ ƒ /api/user                            0 B                0 B
...

○  (Static)  prerendered as static content
ƒ  (Dynamic) server-rendered on demand
```

**✅ 构建成功确认**：
- ✓ 所有 API 路由显示为 `ƒ (Dynamic)`
- ✓ 静态页面显示为 `○ (Static)`
- ✓ 没有 "Dynamic server usage" 错误
- ✓ Prisma Client 生成成功

---

## 📚 Next.js 渲染模式说明

### Static Generation（静态生成）
- ✅ 构建时生成 HTML
- ✅ 性能最优
- ❌ 无法使用动态数据（request、cookies 等）

### Dynamic Rendering（动态渲染）
- ✅ 请求时生成内容
- ✅ 可以使用动态数据
- ⚠️ 性能略低于静态生成

### 何时使用 `export const dynamic = 'force-dynamic'`

**必须使用**：
- ✅ API 路由使用 `request.url`、`searchParams`
- ✅ 动态路由参数 `[id]`、`[slug]`
- ✅ 需要读取 cookies 或 headers
- ✅ 数据频繁变化，需要实时查询

**不需要使用**：
- ❌ 纯静态页面（如关于我们、帮助文档）
- ❌ 使用 ISR（Incremental Static Regeneration）
- ❌ 客户端渲染的页面

---

## 🔗 相关配置

### Route Segment Config Options

Next.js 提供了多种路由配置选项：

```typescript
// 强制动态渲染
export const dynamic = 'force-dynamic';

// 强制静态生成
export const dynamic = 'force-static';

// 自动选择（默认）
export const dynamic = 'auto';

// 错误时使用静态生成
export const dynamic = 'error';
```

### 其他有用的配置

```typescript
// 设置重新验证时间（ISR）
export const revalidate = 60; // 60 秒

// 运行时环境
export const runtime = 'nodejs'; // 'edge' | 'nodejs'

// 最大持续时间（Serverless 函数）
export const maxDuration = 5; // 秒
```

---

## 🆘 常见问题

### Q1: 为什么 API 路由不能静态生成？

**A**: API 路由本质上是服务器端点，需要处理动态请求。即使没有使用 `request.url`，如果路由需要处理 POST、PUT、DELETE 等请求，也应该使用动态渲染。

### Q2: 添加 `export const dynamic = 'force-dynamic'` 会影响性能吗？

**A**: 对于 API 路由，影响很小。API 路由本来就是动态的，这个配置只是明确告诉 Next.js 不要尝试静态生成。

### Q3: 所有 API 路由都需要添加吗？

**A**: 推荐做法是**所有 API 路由都添加**，除非你确定某个路由可以静态生成（这种情况非常少见）。

### Q4: 前端页面也需要添加吗？

**A**: 取决于页面是否使用动态数据：
- ✅ 需要：使用 `searchParams`、`cookies`、`headers` 的页面
- ❌ 不需要：纯静态内容的页面

---

## 📚 参考资料

- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Dynamic Server Usage Error](https://nextjs.org/docs/messages/dynamic-server-error)

---

**✨ 修复完成！现在你的项目应该能正常构建了。**

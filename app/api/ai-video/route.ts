import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for video generation

interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  mode?: string;
  error?: string;
  provider?: string;
  taskId?: string;
  status?: string;
}

const ZHIPUAI_API_KEY = process.env.ZHIPUAI_API_KEY;
const ZHIPUAI_VIDEO_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/videos/generations';
const ZHIPUAI_RESULT_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/async-result';

export async function POST(request: NextRequest): Promise<NextResponse<VideoGenerationResponse>> {
  try {
    const { prompt, duration = 5, mode = 'speed' } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating video with prompt:', prompt);
    console.log('ZhipuAI API Key configured:', !!ZHIPUAI_API_KEY);

    // Try ZhipuAI CogVideoX-3
    if (ZHIPUAI_API_KEY) {
      try {
        const result = await generateWithZhipuAI(prompt, duration, mode);
        return NextResponse.json(result);
      } catch (zhipuError) {
        console.error('ZhipuAI generation failed:', zhipuError);
        console.log('Falling back to Pollinations...');
      }
    }

    // Fallback: Use Pollinations (generates image, not real video)
    const imageUrl = await generateWithPollinations(prompt);

    return NextResponse.json({
      success: true,
      videoUrl: imageUrl,
      thumbnailUrl: imageUrl,
      duration: 5,
      mode: 'image-fallback',
      provider: 'Pollinations AI (Image fallback)',
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate video using ZhipuAI CogVideoX-3
 * This is an async API - we submit the task and poll for results
 */
async function generateWithZhipuAI(
  prompt: string,
  duration: number = 5,
  mode: string = 'speed'
): Promise<VideoGenerationResponse> {
  console.log('Calling ZhipuAI CogVideoX-3 API...');

  // Step 1: Submit video generation task
  const submitResponse = await fetch(ZHIPUAI_VIDEO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZHIPUAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'cogvideox-3',
      prompt: prompt,
      quality: mode === 'quality' ? 'quality' : 'speed',
      duration: duration <= 5 ? 5 : 10,
      fps: 30,
      size: '1280x720', // 720p for faster generation
    }),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    console.error('ZhipuAI submit error:', submitResponse.status, errorText);
    throw new Error(`ZhipuAI API error: ${submitResponse.status} - ${errorText}`);
  }

  const submitData = await submitResponse.json();
  console.log('ZhipuAI submit response:', submitData);

  // Get task ID
  const taskId = submitData.id;
  if (!taskId) {
    throw new Error('No task ID returned from ZhipuAI');
  }

  console.log('Video generation task submitted, ID:', taskId);

  // Step 2: Poll for results (with timeout)
  const maxWaitTime = 180000; // 3 minutes
  const pollInterval = 3000; // 3 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const resultResponse = await fetch(`${ZHIPUAI_RESULT_ENDPOINT}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ZHIPUAI_API_KEY}`,
      },
    });

    if (!resultResponse.ok) {
      const errorText = await resultResponse.text();
      console.error('ZhipuAI result query error:', resultResponse.status, errorText);
      continue;
    }

    const resultData = await resultResponse.json();
    console.log('ZhipuAI result:', resultData);

    // Check task status
    const taskStatus = resultData.task_status;

    if (taskStatus === 'SUCCESS') {
      // Video generation completed
      const videoResults = resultData.video_result || [];
      if (videoResults.length > 0) {
        const originalVideoUrl = videoResults[0].url;
        const originalCoverUrl = videoResults[0].cover_image_url || originalVideoUrl;

        // Use proxy to bypass CORS
        const videoUrl = `/api/video-proxy?url=${encodeURIComponent(originalVideoUrl)}`;
        const coverUrl = `/api/video-proxy?url=${encodeURIComponent(originalCoverUrl)}`;

        return {
          success: true,
          videoUrl: videoUrl,
          thumbnailUrl: coverUrl,
          duration: duration <= 5 ? 5 : 10,
          mode: mode,
          provider: 'ZhipuAI CogVideoX-3',
          taskId: taskId,
          status: 'completed',
        };
      }
    } else if (taskStatus === 'FAIL') {
      throw new Error(`Video generation failed: ${resultData.message || 'Unknown error'}`);
    }

    // Still processing, continue polling
    console.log(`Task ${taskId} still processing, status: ${taskStatus}`);
  }

  // Timeout
  throw new Error('Video generation timed out. Please try again.');
}

/**
 * Fallback: Generate image using Pollinations free API
 */
async function generateWithPollinations(prompt: string): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Date.now();
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&enhance=true&model=flux&seed=${seed}`;

  console.log('Generating image fallback from Pollinations:', imageUrl);

  return imageUrl;
}

/**
 * GET endpoint: Health check
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'AI Video Generation API is running',
    zhipuai_configured: !!ZHIPUAI_API_KEY,
    primary_provider: ZHIPUAI_API_KEY ? 'ZhipuAI CogVideoX-3' : 'Pollinations (Image only)',
    model: ZHIPUAI_API_KEY ? 'cogvideox-3' : 'None',
    features: ZHIPUAI_API_KEY
      ? ['Text-to-Video', 'Real video generation', '5s or 10s clips', 'Up to 4K resolution', 'AI Audio']
      : ['Text-to-Image', 'Fallback mode'],
    supported_durations: [5, 10],
    supported_qualities: ['speed', 'quality'],
  });
}

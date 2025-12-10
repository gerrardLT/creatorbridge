import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy endpoint to fetch video/images from external URLs
 * This bypasses CORS restrictions for ZhipuAI and other providers
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get('url');

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        console.log('Proxying video from:', videoUrl);

        // Fetch the video from the external URL
        const response = await fetch(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch video: ${response.status}` },
                { status: response.status }
            );
        }

        // Get content type
        const contentType = response.headers.get('content-type') || 'video/mp4';

        // Stream the response
        const videoBuffer = await response.arrayBuffer();

        return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': videoBuffer.byteLength.toString(),
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Video proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy video' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Default tags for the platform
const DEFAULT_TAGS = [
    { name: 'Art', slug: 'art', color: '#8b5cf6', icon: '🎨' },
    { name: 'Music', slug: 'music', color: '#ec4899', icon: '🎵' },
    { name: 'Video', slug: 'video', color: '#f97316', icon: '🎬' },
    { name: 'Photography', slug: 'photography', color: '#06b6d4', icon: '📷' },
    { name: '3D', slug: '3d', color: '#10b981', icon: '🧊' },
    { name: 'AI Generated', slug: 'ai-generated', color: '#6366f1', icon: '🤖' },
    { name: 'Illustration', slug: 'illustration', color: '#f43f5e', icon: '✏️' },
    { name: 'Animation', slug: 'animation', color: '#a855f7', icon: '🎞️' },
    { name: 'Game Asset', slug: 'game-asset', color: '#22c55e', icon: '🎮' },
    { name: 'Design', slug: 'design', color: '#0ea5e9', icon: '🎯' },
];

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
    try {
        let tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { ipAssets: true }
                }
            }
        });

        // If no tags exist, create default ones
        if (tags.length === 0) {
            await prisma.tag.createMany({
                data: DEFAULT_TAGS,
                skipDuplicates: true
            });

            tags = await prisma.tag.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { ipAssets: true }
                    }
                }
            });
        }

        const formattedTags = tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
            icon: tag.icon,
            count: tag._count.ipAssets
        }));

        return NextResponse.json({ tags: formattedTags });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

// POST /api/tags - Create a new tag (admin only in production)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, color, icon } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Tag name is required' },
                { status: 400 }
            );
        }

        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const tag = await prisma.tag.create({
            data: {
                name,
                slug,
                color: color || '#6366f1',
                icon: icon || null
            }
        });

        return NextResponse.json({ tag }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Tag already exists' },
                { status: 409 }
            );
        }
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}

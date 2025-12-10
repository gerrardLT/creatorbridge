import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/follow - Get follow status or follower/following list
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const targetId = searchParams.get('targetId');
        const type = searchParams.get('type'); // 'followers' | 'following' | 'check'

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if user follows a specific target
        if (targetId && type === 'check') {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetId
                    }
                }
            });
            return NextResponse.json({ isFollowing: !!follow });
        }

        // Get followers
        if (type === 'followers') {
            const followers = await prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            walletAddress: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({
                followers: followers.map(f => f.follower),
                count: followers.length
            });
        }

        // Get following
        if (type === 'following') {
            const following = await prisma.follow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            walletAddress: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({
                following: following.map(f => f.following),
                count: following.length
            });
        }

        // Get both counts
        const [followersCount, followingCount] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } })
        ]);

        return NextResponse.json({ followersCount, followingCount });
    } catch (error) {
        console.error('Error fetching follow data:', error);
        return NextResponse.json({ error: 'Failed to fetch follow data' }, { status: 500 });
    }
}

// POST /api/follow - Follow a user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { followerId, followingId } = body;

        if (!followerId || !followingId) {
            return NextResponse.json({ error: 'Both follower and following IDs are required' }, { status: 400 });
        }

        if (followerId === followingId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        const follow = await prisma.follow.create({
            data: { followerId, followingId }
        });

        return NextResponse.json({ success: true, follow }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Already following this user' }, { status: 409 });
        }
        console.error('Error creating follow:', error);
        return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }
}

// DELETE /api/follow - Unfollow a user
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const followerId = searchParams.get('followerId');
        const followingId = searchParams.get('followingId');

        if (!followerId || !followingId) {
            return NextResponse.json({ error: 'Both follower and following IDs are required' }, { status: 400 });
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Not following this user' }, { status: 404 });
        }
        console.error('Error deleting follow:', error);
        return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }
}

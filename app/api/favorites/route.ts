import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/favorites - Get user's favorites or check favorite status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const ipAssetId = searchParams.get('ipAssetId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if specific asset is favorited
        if (ipAssetId) {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_ipAssetId: {
                        userId,
                        ipAssetId
                    }
                }
            });
            return NextResponse.json({ isFavorited: !!favorite });
        }

        // Get all user's favorites
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                ipAsset: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                walletAddress: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedFavorites = favorites.map(f => ({
            id: f.ipAsset.id,
            title: f.ipAsset.title,
            description: f.ipAsset.description,
            imageUrl: f.ipAsset.imageUrl,
            priceEth: f.ipAsset.priceEth,
            licenseType: f.ipAsset.licenseType,
            mintingFee: f.ipAsset.mintingFee,
            createdAt: f.ipAsset.createdAt.toISOString(),
            favoritedAt: f.createdAt.toISOString(),
            creator: f.ipAsset.creator
        }));

        return NextResponse.json({
            favorites: formattedFavorites,
            count: formattedFavorites.length
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ipAssetId } = body;

        if (!userId || !ipAssetId) {
            return NextResponse.json({ error: 'User ID and IP Asset ID are required' }, { status: 400 });
        }

        const favorite = await prisma.favorite.create({
            data: { userId, ipAssetId }
        });

        return NextResponse.json({ success: true, favorite }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Already favorited' }, { status: 409 });
        }
        console.error('Error creating favorite:', error);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const ipAssetId = searchParams.get('ipAssetId');

        if (!userId || !ipAssetId) {
            return NextResponse.json({ error: 'User ID and IP Asset ID are required' }, { status: 400 });
        }

        await prisma.favorite.delete({
            where: {
                userId_ipAssetId: {
                    userId,
                    ipAssetId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Not in favorites' }, { status: 404 });
        }
        console.error('Error deleting favorite:', error);
        return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
}

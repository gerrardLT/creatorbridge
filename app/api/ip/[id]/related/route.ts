import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/ip/:id/related - Get related IP assets
 * Returns IPs from same creator or with similar characteristics
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '8');

        // Get the current IP asset
        const currentAsset = await prisma.iPAsset.findUnique({
            where: { id },
            select: {
                id: true,
                creatorId: true,
                licenseType: true,
                priceEth: true
            }
        });

        if (!currentAsset) {
            return NextResponse.json(
                { error: 'IP asset not found' },
                { status: 404 }
            );
        }

        // Find related assets:
        // 1. Same creator (excluding current asset)
        // 2. Same license type
        // 3. Similar price range (±50%)
        const relatedAssets = await prisma.iPAsset.findMany({
            where: {
                AND: [
                    { id: { not: id } }, // Exclude current asset
                    {
                        OR: [
                            { creatorId: currentAsset.creatorId }, // Same creator
                            { licenseType: currentAsset.licenseType }, // Same license type
                            {
                                AND: [
                                    { priceEth: { gte: currentAsset.priceEth * 0.5 } },
                                    { priceEth: { lte: currentAsset.priceEth * 1.5 } }
                                ]
                            }
                        ]
                    }
                ]
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        walletAddress: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: [
                // Prioritize same creator
                { createdAt: 'desc' }
            ],
            take: limit
        });

        // Format response
        const formattedAssets = relatedAssets.map(asset => ({
            id: asset.id,
            title: asset.title,
            description: asset.description,
            imageUrl: asset.imageUrl,
            priceEth: asset.priceEth,
            createdAt: asset.createdAt.toISOString(),
            txHash: asset.txHash,
            licenseType: asset.licenseType,
            mintingFee: asset.mintingFee,
            commercialRevShare: asset.commercialRevShare,
            creator: {
                id: asset.creator.id,
                name: asset.creator.name || 'Unknown',
                walletAddress: asset.creator.walletAddress,
                avatarUrl: asset.creator.avatarUrl || ''
            }
        }));

        return NextResponse.json({
            relatedAssets: formattedAssets,
            total: formattedAssets.length
        });

    } catch (error) {
        console.error('Failed to fetch related assets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch related assets' },
            { status: 500 }
        );
    }
}

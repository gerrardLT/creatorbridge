import { NextRequest, NextResponse } from 'next/server';
import { findIPAssetById } from '@/lib/db';

// GET /api/ip/[id] - Get single IP asset
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await findIPAssetById(params.id);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      asset: {
        id: asset.id,
        title: asset.title,
        description: asset.description,
        imageUrl: asset.imageUrl,
        priceEth: asset.priceEth,
        createdAt: asset.createdAt.toISOString(),
        txHash: asset.txHash,
        creator: {
          id: asset.creator.id,
          name: asset.creator.name || 'Unknown',
          walletAddress: asset.creator.walletAddress,
          avatarUrl: asset.creator.avatarUrl || ''
        }
      }
    });
  } catch (error) {
    console.error('Error fetching IP asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP asset' },
      { status: 500 }
    );
  }
}

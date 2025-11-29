import { NextRequest, NextResponse } from 'next/server';
import { queryIPAssets, searchIPAssets, isIndexerAvailable } from '@/lib/goldsky';
import { findAllIPAssets } from '@/lib/db';

// GET /api/indexer - Query indexed assets with fallback to database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const owner = searchParams.get('owner') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check if indexer is available
    const indexerAvailable = await isIndexerAvailable();

    if (indexerAvailable) {
      // Use Goldsky indexer
      if (search) {
        const assets = await searchIPAssets(search, limit);
        return NextResponse.json({
          assets,
          total: assets.length,
          page: 1,
          totalPages: 1,
          source: 'indexer',
        });
      }

      const result = await queryIPAssets({
        first: limit,
        skip: (page - 1) * limit,
        owner,
      });

      return NextResponse.json({
        assets: result.assets,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
        source: 'indexer',
      });
    }

    // Fallback to database
    const { assets, total } = await findAllIPAssets({
      search,
      creatorId: owner,
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedAssets = assets.map(asset => ({
      id: asset.id,
      ipId: asset.ipId,
      owner: asset.creator.walletAddress,
      name: asset.title,
      description: asset.description,
      imageUrl: asset.imageUrl,
      registrationDate: asset.createdAt.toISOString(),
      blockNumber: '0',
      transactionHash: asset.txHash,
    }));

    return NextResponse.json({
      assets: formattedAssets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      source: 'database',
    });
  } catch (error) {
    console.error('Error querying indexed assets:', error);
    return NextResponse.json(
      { error: 'Failed to query assets' },
      { status: 500 }
    );
  }
}

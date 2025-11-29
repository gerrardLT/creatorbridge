import { NextRequest, NextResponse } from 'next/server';
import { findAllIPAssets, createIPAsset } from '@/lib/db';
import { generateTxHash } from '@/lib/utils';
import { registerIP } from '@/lib/story-protocol';
import { Address } from 'viem';

// GET /api/ip - List all IP assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const verified = searchParams.get('verified') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { assets, total } = await findAllIPAssets({
      search,
      creatorId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      verified: verified || undefined,
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform to match frontend expected format
    const formattedAssets = assets.map(asset => ({
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
    }));

    return NextResponse.json({ 
      assets: formattedAssets, 
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching IP assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP assets' },
      { status: 500 }
    );
  }
}

// POST /api/ip - Register new IP asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priceEth, imageUrl, creatorId } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (typeof priceEth !== 'number' || priceEth < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    // Try to register on Story Protocol if configured
    let txHash = generateTxHash();
    let ipId = `ip_${Date.now()}`;
    let onChain = false;

    const nftContract = body.nftContract as Address | undefined;
    const tokenId = body.tokenId as string | undefined;

    if (process.env.STORY_PRIVATE_KEY && nftContract && tokenId) {
      try {
        const result = await registerIP({
          nftContract,
          tokenId,
          metadata: {
            name: title.trim(),
            description: description.trim(),
            image: imageUrl || 'https://picsum.photos/800/600',
            contentType: 'image',
          },
        });

        if (result.success && result.ipId && result.txHash) {
          ipId = result.ipId;
          txHash = result.txHash;
          onChain = true;
        }
      } catch (error) {
        console.warn('Story Protocol registration failed, using local storage:', error);
      }
    }

    const asset = await createIPAsset({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || 'https://picsum.photos/800/600',
      priceEth,
      creatorId,
      ipId,
      txHash
    });

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
      },
      ipId,
      txHash,
      onChain
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating IP asset:', error);
    return NextResponse.json(
      { error: 'Failed to register IP asset' },
      { status: 500 }
    );
  }
}

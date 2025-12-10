import { NextRequest, NextResponse } from 'next/server';
import { findAllIPAssets, createIPAsset } from '@/lib/db';
import { generateTxHash } from '@/lib/utils';
import { registerIP, mintAndRegisterIPWithLicense } from '@/lib/story-protocol';
import { constructIPMetadata } from '@/lib/license-utils';
import { Address } from 'viem';
import { LicenseType } from '@/lib/types/license';
import { validateLicenseConfig } from '@/lib/validation';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/ip - List all IP assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const verified = searchParams.get('verified') === 'true';
    const licenseType = searchParams.get('licenseType') || undefined;
    const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'price_asc' | 'price_desc' | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { assets, total } = await findAllIPAssets({
      search,
      creatorId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      verified: verified || undefined,
      licenseType,
      sortBy,
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
      // License fields
      licenseType: asset.licenseType,
      mintingFee: asset.mintingFee,
      commercialRevShare: asset.commercialRevShare,
      licenseTermsId: asset.licenseTermsId,
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

// POST /api/ip - Register new IP asset with license
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      priceEth,
      imageUrl,
      creatorId,
      walletAddress,
      licenseType,
      mintingFee,
      commercialRevShare
    } = body;

    // Basic validation
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

    // Validate license configuration if provided
    if (licenseType) {
      const licenseValidation = validateLicenseConfig({
        licenseType,
        mintingFee,
        commercialRevShare
      });
      if (!licenseValidation.valid) {
        return NextResponse.json({
          error: 'Invalid license configuration',
          details: licenseValidation.errors
        }, { status: 400 });
      }
    }

    // Initialize response data
    let txHash = generateTxHash();
    let ipId = `ip_${Date.now()}`;
    let tokenId: string | undefined;
    let licenseTermsIds: string[] | undefined;
    let spgNftContract: string | undefined;
    let onChain = false;

    // Try to mint and register on Story Protocol if configured
    if (process.env.STORY_PRIVATE_KEY && walletAddress && licenseType) {
      try {
        const ipMetadata = constructIPMetadata(
          title.trim(),
          description.trim(),
          imageUrl || 'https://picsum.photos/800/600'
        );

        const result = await mintAndRegisterIPWithLicense({
          recipient: walletAddress as Address,
          licenseType: licenseType as LicenseType,
          mintingFee,
          commercialRevShare,
          ipMetadata,
        });

        if (result.success && result.ipId && result.txHash) {
          ipId = result.ipId;
          txHash = result.txHash;
          tokenId = result.tokenId;
          licenseTermsIds = result.licenseTermsIds;
          spgNftContract = result.spgNftContract;
          onChain = true;
        }
      } catch (error) {
        console.warn('Story Protocol registration failed, using local storage:', error);
      }
    }

    // Create database record
    const asset = await createIPAsset({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || 'https://picsum.photos/800/600',
      priceEth,
      creatorId,
      ipId,
      tokenId,
      txHash,
      licenseType,
      mintingFee,
      commercialRevShare,
      licenseTermsId: licenseTermsIds?.[0],
      spgNftContract,
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
        licenseType: asset.licenseType,
        mintingFee: asset.mintingFee,
        commercialRevShare: asset.commercialRevShare,
        licenseTermsId: asset.licenseTermsId,
        creator: {
          id: asset.creator.id,
          name: asset.creator.name || 'Unknown',
          walletAddress: asset.creator.walletAddress,
          avatarUrl: asset.creator.avatarUrl || ''
        }
      },
      ipId,
      tokenId,
      txHash,
      licenseTermsIds,
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

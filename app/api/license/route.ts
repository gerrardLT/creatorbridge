import { NextRequest, NextResponse } from 'next/server';
import { createLicense, findLicensesByBuyer, findIPAssetById, createTransaction } from '@/lib/db';
import { generateTxHash } from '@/lib/utils';
import { mintLicense } from '@/lib/story-protocol';
import { Address } from 'viem';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST /api/license - Purchase license
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

    const { ipAssetId, buyerId } = body;

    if (!ipAssetId || typeof ipAssetId !== 'string') {
      return NextResponse.json({ error: 'IP Asset ID is required' }, { status: 400 });
    }

    if (!buyerId || typeof buyerId !== 'string') {
      return NextResponse.json({ error: 'Buyer ID is required' }, { status: 400 });
    }

    // Find the asset
    const asset = await findIPAssetById(ipAssetId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Prevent creator from buying their own IP
    if (asset.creatorId === buyerId) {
      return NextResponse.json({ error: 'You cannot purchase a license for your own IP' }, { status: 400 });
    }

    // Try to mint license on Story Protocol if configured
    let txHash = generateTxHash();
    let licenseId = `license_${Date.now()}`;
    let onChain = false;

    const { receiverAddress } = body;
    // Use the stored licenseTermsId from the asset
    const storedLicenseTermsId = asset.licenseTermsId;

    if (process.env.STORY_PRIVATE_KEY && asset.ipId && storedLicenseTermsId && receiverAddress) {
      try {
        const result = await mintLicense(
          asset.ipId as Address,
          storedLicenseTermsId,
          1,
          receiverAddress as Address
        );

        if (result.success && result.txHash) {
          txHash = result.txHash;
          if (result.licenseTokenIds && result.licenseTokenIds.length > 0) {
            licenseId = result.licenseTokenIds[0].toString();
          }
          onChain = true;
        }
      } catch (error) {
        console.warn('Story Protocol license minting failed, using local storage:', error);
      }
    }

    // Determine the license price
    const licensePrice = asset.mintingFee
      ? parseFloat(asset.mintingFee)
      : asset.priceEth;

    // Create license record
    const license = await createLicense({
      ipAssetId,
      buyerId,
      licenseId,
      txHash
    });

    // Create transaction record for buyer
    await createTransaction({
      type: 'PURCHASE',
      amount: licensePrice,
      txHash,
      userId: buyerId,
      assetId: ipAssetId,
      assetTitle: asset.title
    });

    // Create transaction record for creator (sale)
    await createTransaction({
      type: 'SALE',
      amount: licensePrice,
      txHash,
      userId: asset.creatorId,
      assetId: ipAssetId,
      assetTitle: asset.title
    });

    return NextResponse.json({
      license: {
        id: license.id,
        licenseId: license.licenseId,
        txHash: license.txHash,
        purchasedAt: license.purchasedAt.toISOString(),
        ipAssetId: license.ipAssetId
      },
      status: 'confirmed',
      onChain
    }, { status: 201 });
  } catch (error) {
    console.error('Error purchasing license:', error);
    return NextResponse.json(
      { error: 'Failed to purchase license' },
      { status: 500 }
    );
  }
}

// GET /api/license - Get user's licenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json({ error: 'Buyer ID is required' }, { status: 400 });
    }

    const licenses = await findLicensesByBuyer(buyerId);

    const formattedLicenses = licenses.map(license => ({
      id: license.id,
      licenseId: license.licenseId,
      txHash: license.txHash,
      purchasedAt: license.purchasedAt.toISOString(),
      ipAsset: {
        id: license.ipAsset.id,
        title: license.ipAsset.title,
        imageUrl: license.ipAsset.imageUrl,
        priceEth: license.ipAsset.priceEth,
        licenseType: license.ipAsset.licenseType,
        mintingFee: license.ipAsset.mintingFee
      }
    }));

    return NextResponse.json({ licenses: formattedLicenses });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

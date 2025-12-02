import { NextRequest, NextResponse } from 'next/server';
import { validateDerivativeRegistration } from '@/lib/derivative-utils';
import { createDerivativeRelation } from '@/lib/db/derivatives';
import { registerDerivative, mintAndRegisterIPWithLicense } from '@/lib/story-protocol';
import { constructIPMetadata } from '@/lib/license-utils';
import { Address } from 'viem';
import { LicenseType } from '@/lib/types/license';
import prisma from '@/lib/prisma';

/**
 * POST /api/derivatives - Register a derivative IP
 */
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
      parentIpId, 
      childTitle, 
      childDescription, 
      childImageUrl, 
      creatorId,
      walletAddress,
      licenseType,
      mintingFee,
      commercialRevShare
    } = body;

    // Validate required fields
    if (!parentIpId || !childTitle || !childDescription || !childImageUrl || !creatorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate derivative registration
    const validation = await validateDerivativeRegistration(parentIpId, creatorId);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: 'VALIDATION_FAILED' },
        { status: 403 }
      );
    }

    // Initialize variables for on-chain data
    let childIpId: string | undefined;
    let childTokenId: string | undefined;
    let childTxHash: string | undefined;
    let licenseTermsIds: string[] | undefined;
    let spgNftContract: string | undefined;
    let licenseTokenIds: string[] | undefined;
    let onChain = false;

    // Try to register on Story Protocol if configured
    if (process.env.STORY_PRIVATE_KEY && walletAddress && validation.parentIp) {
      try {
        // Step 1: Mint and register the child IP with license terms
        const ipMetadata = constructIPMetadata(
          childTitle,
          childDescription,
          childImageUrl
        );

        const childResult = await mintAndRegisterIPWithLicense({
          recipient: walletAddress as Address,
          licenseType: (licenseType || validation.parentIp.licenseType || LicenseType.COMMERCIAL_REMIX) as LicenseType,
          mintingFee: mintingFee || validation.parentIp.mintingFee,
          commercialRevShare: commercialRevShare || validation.parentIp.commercialRevShare,
          ipMetadata,
          spgNftContract: validation.parentIp.spgNftContract as Address | undefined,
        });

        if (childResult.success && childResult.ipId && validation.parentIp.ipId) {
          childIpId = childResult.ipId;
          childTokenId = childResult.tokenId;
          childTxHash = childResult.txHash;
          licenseTermsIds = childResult.licenseTermsIds;
          spgNftContract = childResult.spgNftContract;

          // Step 2: Register the derivative relationship on-chain
          const parentIpIdOnChain = validation.parentIp.ipId as Address;
          const parentLicenseTermsId = validation.parentIp.licenseTermsId;

          if (parentLicenseTermsId) {
            const derivativeResult = await registerDerivative(
              childIpId as Address,
              [parentIpIdOnChain],
              [parentLicenseTermsId]
            );

            if (derivativeResult.success) {
              onChain = true;
              console.log('✅ Derivative registered on-chain:', derivativeResult.txHash);
            } else {
              console.warn('⚠️ Derivative IP created but relationship registration failed:', derivativeResult.error);
            }
          } else {
            console.warn('⚠️ Parent IP has no license terms ID, skipping derivative registration');
          }
        }
      } catch (error) {
        console.error('Story Protocol derivative registration failed:', error);
        // Continue with local storage even if on-chain fails
      }
    }

    // Create the child IP asset in database
    const childIp = await prisma.iPAsset.create({
      data: {
        title: childTitle,
        description: childDescription,
        imageUrl: childImageUrl,
        priceEth: 0,
        creatorId,
        ipId: childIpId,
        tokenId: childTokenId,
        txHash: childTxHash,
        licenseType: licenseType || validation.parentIp?.licenseType,
        mintingFee: mintingFee || validation.parentIp?.mintingFee,
        commercialRevShare: commercialRevShare || validation.parentIp?.commercialRevShare,
        licenseTermsId: licenseTermsIds?.[0],
        spgNftContract,
      },
      include: {
        creator: true,
      }
    });

    // Create derivative relationship in database
    const relation = await createDerivativeRelation(
      parentIpId,
      childIp.id,
      licenseTokenIds?.[0],
      childTxHash
    );

    return NextResponse.json({
      success: true,
      childIp,
      relation,
      onChain,
      ipId: childIpId,
      tokenId: childTokenId,
      txHash: childTxHash,
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to register derivative:', error);
    return NextResponse.json(
      { error: 'Failed to register derivative' },
      { status: 500 }
    );
  }
}

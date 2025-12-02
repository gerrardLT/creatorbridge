import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDerivativesByParent } from '@/lib/db/derivatives';
import { getRoyaltyData } from '@/lib/story-protocol';
import { Address } from 'viem';

interface RouteParams {
  params: Promise<{ ipId: string }>;
}

/**
 * GET /api/royalties/:ipId - Get royalty data for an IP
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { ipId } = await params;

    // Get IP asset
    const ip = await prisma.iPAsset.findUnique({
      where: { id: ipId },
      include: {
        licenses: true,
      }
    });

    if (!ip) {
      return NextResponse.json(
        { error: 'IP not found' },
        { status: 404 }
      );
    }

    // Get derivatives
    const derivatives = await getDerivativesByParent(ipId);

    // Initialize royalty amounts
    let accumulatedRoyalties = '0';
    let onChainDataAvailable = false;

    // Try to query on-chain royalty data if IP is registered on-chain
    if (ip.ipId && process.env.STORY_PRIVATE_KEY) {
      try {
        const royaltyResult = await getRoyaltyData(ip.ipId as Address);
        
        if (royaltyResult.success && royaltyResult.royaltyTokens) {
          accumulatedRoyalties = royaltyResult.royaltyTokens;
          onChainDataAvailable = true;
        }
      } catch (error) {
        console.warn('Failed to fetch on-chain royalty data, using local data:', error);
      }
    }

    // Calculate estimated royalties from derivatives if no on-chain data
    let estimatedDerivativeRoyalties = 0;
    if (!onChainDataAvailable && ip.commercialRevShare && derivatives.length > 0) {
      // This is an estimation based on local data
      // In production, this would come from actual derivative sales tracked on-chain
      estimatedDerivativeRoyalties = derivatives.length * 0.1; // Placeholder calculation
    }

    // Calculate royalty data
    const royaltyData = {
      ipId,
      ipIdOnChain: ip.ipId || null,
      revSharePercentage: ip.commercialRevShare || 0,
      totalLicensesSold: ip.licenses.length,
      derivativeCount: derivatives.length,
      accumulatedRoyalties,
      currency: 'WIP',
      onChainDataAvailable,
      // Breakdown by source
      breakdown: {
        directLicenses: ip.licenses.length,
        derivativeRoyalties: onChainDataAvailable ? parseFloat(accumulatedRoyalties) : estimatedDerivativeRoyalties,
      },
      // Derivative details
      derivatives: derivatives.map(d => ({
        childIpId: d.childIpId,
        registeredAt: d.registeredAt,
        txHash: d.txHash,
      })),
    };

    return NextResponse.json({ royaltyData });

  } catch (error) {
    console.error('Failed to fetch royalty data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch royalty data' },
      { status: 500 }
    );
  }
}

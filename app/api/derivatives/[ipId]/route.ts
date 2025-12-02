import { NextRequest, NextResponse } from 'next/server';
import { getDerivativesByParent, getDerivativeCount } from '@/lib/db/derivatives';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ ipId: string }>;
}

/**
 * GET /api/derivatives/:ipId - Get derivatives of an IP
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { ipId } = await params;

    // Get derivative relations
    const relations = await getDerivativesByParent(ipId);
    const count = await getDerivativeCount(ipId);

    // Get full IP details for each derivative
    const derivativeIds = relations.map(r => r.childIpId);
    const derivatives = await prisma.iPAsset.findMany({
      where: { id: { in: derivativeIds } },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Map relations to include full derivative data
    const derivativesWithRelations = relations.map(relation => {
      const derivative = derivatives.find(d => d.id === relation.childIpId);
      return {
        ...relation,
        derivative,
      };
    });

    return NextResponse.json({
      derivatives: derivativesWithRelations,
      count,
    });

  } catch (error) {
    console.error('Failed to fetch derivatives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch derivatives' },
      { status: 500 }
    );
  }
}

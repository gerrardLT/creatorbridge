import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ip/:id - Get single IP asset details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const asset = await prisma.iPAsset.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
            avatarUrl: true,
          }
        },
        licenses: true,
        parentRelations: {
          include: {
            parentIp: {
              include: {
                creator: true,
              }
            }
          }
        },
        childRelations: {
          include: {
            childIp: {
              include: {
                creator: true,
              }
            }
          }
        }
      }
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'IP asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ asset });

  } catch (error) {
    console.error('Failed to fetch IP asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP asset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ip/:id - Delete an IP asset
 * Only the creator can delete their own IP
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if IP exists and user is the creator
    const asset = await prisma.iPAsset.findUnique({
      where: { id },
      include: {
        licenses: true,
        childRelations: true,
        parentRelations: true,
      }
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'IP asset not found' },
        { status: 404 }
      );
    }

    if (asset.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Only the creator can delete this IP' },
        { status: 403 }
      );
    }

    // Check if this IP has derivatives (children)
    if (asset.childRelations.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete IP with derivative works. Delete derivatives first.',
          hasDerivatives: true,
          derivativeCount: asset.childRelations.length
        },
        { status: 409 }
      );
    }

    // Delete in transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // 1. Delete all licenses associated with this IP
      await tx.license.deleteMany({
        where: { ipAssetId: id }
      });

      // 2. Delete all transactions referencing this IP
      await tx.transaction.deleteMany({
        where: { assetId: id }
      });

      // 3. Delete parent-child relationships (where this IP is the child)
      await tx.derivativeRelation.deleteMany({
        where: { childIpId: id }
      });

      // 4. Finally, delete the IP asset itself
      await tx.iPAsset.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'IP asset deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete IP asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete IP asset' },
      { status: 500 }
    );
  }
}

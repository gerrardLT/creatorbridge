import { NextRequest, NextResponse } from 'next/server';
import { getLineageTree, lineageToGraphData, getExtendedLineageTree } from '@/lib/db/derivatives';

interface RouteParams {
  params: Promise<{ ipId: string }>;
}

/**
 * GET /api/lineage/:ipId - Get lineage tree for an IP
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { ipId } = await params;
    const { searchParams } = new URL(request.url);
    const extended = searchParams.get('extended') === 'true';
    const maxDepth = parseInt(searchParams.get('maxDepth') || '3', 10);

    if (extended) {
      // Get extended multi-level lineage
      const graphData = await getExtendedLineageTree(ipId, maxDepth);
      
      if (graphData.nodes.length === 0) {
        return NextResponse.json(
          { error: 'IP not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ graphData });
    }

    // Get immediate lineage (parents and children only)
    const lineage = await getLineageTree(ipId);

    if (!lineage) {
      return NextResponse.json(
        { error: 'IP not found' },
        { status: 404 }
      );
    }

    // Convert to graph data for visualization
    const graphData = lineageToGraphData(lineage);

    return NextResponse.json({
      lineage,
      graphData,
    });

  } catch (error) {
    console.error('Failed to fetch lineage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lineage' },
      { status: 500 }
    );
  }
}

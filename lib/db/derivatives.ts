import prisma from '@/lib/prisma';
import { 
  DerivativeRelation, 
  IPLineage, 
  IPLineageNode,
  LineageGraphData,
  GraphNode,
  GraphEdge
} from '@/lib/types/derivative';
import { LicenseType } from '@/lib/types/license';

/**
 * Create a new derivative relationship
 */
export async function createDerivativeRelation(
  parentIpId: string,
  childIpId: string,
  licenseTokenId?: string,
  txHash?: string
): Promise<DerivativeRelation> {
  const relation = await prisma.derivativeRelation.create({
    data: {
      parentIpId,
      childIpId,
      licenseTokenId: licenseTokenId || null,
      txHash: txHash || null,
    },
  });

  return mapToDerivativeRelation(relation);
}

/**
 * Get all derivatives of a parent IP
 */
export async function getDerivativesByParent(parentIpId: string): Promise<DerivativeRelation[]> {
  const relations = await prisma.derivativeRelation.findMany({
    where: { parentIpId },
    orderBy: { registeredAt: 'desc' },
  });

  return relations.map(mapToDerivativeRelation);
}

/**
 * Get the parent relationship for a child IP
 */
export async function getParentByChild(childIpId: string): Promise<DerivativeRelation | null> {
  const relation = await prisma.derivativeRelation.findFirst({
    where: { childIpId },
  });

  return relation ? mapToDerivativeRelation(relation) : null;
}

/**
 * Get derivative count for an IP
 */
export async function getDerivativeCount(parentIpId: string): Promise<number> {
  return prisma.derivativeRelation.count({
    where: { parentIpId },
  });
}

/**
 * Check if a derivative relationship exists
 */
export async function derivativeRelationExists(
  parentIpId: string, 
  childIpId: string
): Promise<boolean> {
  const count = await prisma.derivativeRelation.count({
    where: { parentIpId, childIpId },
  });
  return count > 0;
}

/**
 * Get full lineage tree for an IP
 */
export async function getLineageTree(ipId: string): Promise<IPLineage | null> {
  const ip = await prisma.iPAsset.findUnique({
    where: { id: ipId },
    include: {
      creator: true,
      parentRelations: {
        include: {
          parentIp: {
            include: { creator: true }
          }
        }
      },
      childRelations: {
        include: {
          childIp: {
            include: { creator: true }
          }
        }
      }
    }
  });

  if (!ip) return null;

  // Build parent nodes
  const parents: IPLineageNode[] = ip.parentRelations.map(rel => ({
    ipId: rel.parentIp.id,
    title: rel.parentIp.title,
    imageUrl: rel.parentIp.imageUrl,
    creator: rel.parentIp.creator.name || rel.parentIp.creator.walletAddress,
    licenseType: rel.parentIp.licenseType as LicenseType | null,
    depth: -1,
  }));

  // Build child nodes
  const children: IPLineageNode[] = ip.childRelations.map(rel => ({
    ipId: rel.childIp.id,
    title: rel.childIp.title,
    imageUrl: rel.childIp.imageUrl,
    creator: rel.childIp.creator.name || rel.childIp.creator.walletAddress,
    licenseType: rel.childIp.licenseType as LicenseType | null,
    depth: 1,
  }));

  return {
    ipId: ip.id,
    title: ip.title,
    imageUrl: ip.imageUrl,
    creator: ip.creator.name || ip.creator.walletAddress,
    licenseType: ip.licenseType as LicenseType | null,
    parents,
    children,
  };
}

/**
 * Convert lineage to graph data for visualization
 */
export function lineageToGraphData(lineage: IPLineage): LineageGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add root node
  nodes.push({
    id: lineage.ipId,
    label: lineage.title,
    image: lineage.imageUrl,
    type: 'root',
  });

  // Add parent nodes and edges
  lineage.parents.forEach(parent => {
    nodes.push({
      id: parent.ipId,
      label: parent.title,
      image: parent.imageUrl,
      type: 'parent',
    });
    edges.push({
      source: parent.ipId,
      target: lineage.ipId,
    });
  });

  // Add child nodes and edges
  lineage.children.forEach(child => {
    nodes.push({
      id: child.ipId,
      label: child.title,
      image: child.imageUrl,
      type: 'child',
    });
    edges.push({
      source: lineage.ipId,
      target: child.ipId,
    });
  });

  return { nodes, edges };
}

/**
 * Get extended lineage tree (multiple levels)
 */
export async function getExtendedLineageTree(
  ipId: string, 
  maxDepth: number = 3
): Promise<LineageGraphData> {
  const visited = new Set<string>();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  async function traverse(currentId: string, depth: number, isRoot: boolean) {
    if (visited.has(currentId) || Math.abs(depth) > maxDepth) return;
    visited.add(currentId);

    const ip = await prisma.iPAsset.findUnique({
      where: { id: currentId },
      include: {
        parentRelations: { include: { parentIp: true } },
        childRelations: { include: { childIp: true } },
      }
    });

    if (!ip) return;

    // Add node
    nodes.push({
      id: ip.id,
      label: ip.title,
      image: ip.imageUrl,
      type: isRoot ? 'root' : (depth < 0 ? 'parent' : 'child'),
    });

    // Traverse parents
    for (const rel of ip.parentRelations) {
      if (!visited.has(rel.parentIp.id)) {
        edges.push({ source: rel.parentIp.id, target: ip.id });
        await traverse(rel.parentIp.id, depth - 1, false);
      }
    }

    // Traverse children
    for (const rel of ip.childRelations) {
      if (!visited.has(rel.childIp.id)) {
        edges.push({ source: ip.id, target: rel.childIp.id });
        await traverse(rel.childIp.id, depth + 1, false);
      }
    }
  }

  await traverse(ipId, 0, true);

  return { nodes, edges };
}

/**
 * Map Prisma model to DerivativeRelation interface
 */
function mapToDerivativeRelation(relation: any): DerivativeRelation {
  return {
    id: relation.id,
    parentIpId: relation.parentIpId,
    childIpId: relation.childIpId,
    licenseTokenId: relation.licenseTokenId,
    txHash: relation.txHash,
    registeredAt: relation.registeredAt,
  };
}

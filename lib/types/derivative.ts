import { LicenseType } from './license';

/**
 * Derivative relationship stored in database
 */
export interface DerivativeRelation {
  id: string;
  parentIpId: string;
  childIpId: string;
  licenseTokenId: string | null;
  txHash: string | null;
  registeredAt: Date;
}

/**
 * IP lineage information
 */
export interface IPLineage {
  ipId: string;
  title: string;
  imageUrl: string;
  creator: string;
  licenseType: LicenseType | null;
  parents: IPLineageNode[];
  children: IPLineageNode[];
}

/**
 * Node in the IP lineage tree
 */
export interface IPLineageNode {
  ipId: string;
  title: string;
  imageUrl: string;
  creator: string;
  licenseType: LicenseType | null;
  depth: number;
}

/**
 * Graph data for visualization
 */
export interface LineageGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Node in the lineage graph
 */
export interface GraphNode {
  id: string;
  label: string;
  image: string;
  type: 'root' | 'parent' | 'child';
}

/**
 * Edge in the lineage graph
 */
export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

/**
 * Parameters for registering a derivative IP
 */
export interface RegisterDerivativeParams {
  parentIpId: string;
  childTitle: string;
  childDescription: string;
  childImageUrl: string;
  creatorId: string;
  walletAddress: string;
  licenseTokenId?: string;
}

/**
 * Result of derivative registration
 */
export interface RegisterDerivativeResult {
  success: boolean;
  derivativeRelation?: DerivativeRelation;
  childIpAsset?: any;
  txHash?: string;
  error?: string;
}

/**
 * Derivative validation result
 */
export interface DerivativeValidationResult {
  valid: boolean;
  error?: string;
  parentIp?: any;
  hasLicense?: boolean;
  allowsDerivatives?: boolean;
}

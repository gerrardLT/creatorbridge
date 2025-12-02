import * as fc from 'fast-check';
import { LicenseType } from '@/lib/types/license';
import { licenseAllowsDerivatives } from '@/lib/derivative-utils';
import { LineageGraphData, GraphNode, GraphEdge, IPLineage, IPLineageNode } from '@/lib/types/derivative';

// Mock data structures for testing
interface MockIPAsset {
  id: string;
  title: string;
  imageUrl: string;
  creatorId: string;
  licenseType: LicenseType | null;
  licenses: { buyerId: string }[];
}

interface MockDerivativeRelation {
  parentIpId: string;
  childIpId: string;
}

// Mock derivative store
class MockDerivativeStore {
  private ipAssets: Map<string, MockIPAsset> = new Map();
  private relations: MockDerivativeRelation[] = [];

  addIP(ip: MockIPAsset) {
    this.ipAssets.set(ip.id, ip);
  }

  getIP(id: string) {
    return this.ipAssets.get(id) || null;
  }

  addRelation(parentIpId: string, childIpId: string) {
    this.relations.push({ parentIpId, childIpId });
  }

  getDerivatives(parentIpId: string) {
    return this.relations.filter(r => r.parentIpId === parentIpId);
  }

  getParent(childIpId: string) {
    return this.relations.find(r => r.childIpId === childIpId) || null;
  }

  getDerivativeCount(parentIpId: string) {
    return this.relations.filter(r => r.parentIpId === parentIpId).length;
  }

  validateDerivative(parentIpId: string, creatorId: string): { valid: boolean; error?: string } {
    const parentIp = this.ipAssets.get(parentIpId);
    
    if (!parentIp) {
      return { valid: false, error: 'Parent IP not found' };
    }

    // Check if derivatives are allowed
    if (!licenseAllowsDerivatives(parentIp.licenseType)) {
      return { valid: false, error: 'This IP does not allow derivative works' };
    }

    // Check if creator is the owner or has a license
    if (parentIp.creatorId === creatorId) {
      return { valid: true };
    }

    const hasLicense = parentIp.licenses.some(l => l.buyerId === creatorId);
    if (!hasLicense) {
      return { valid: false, error: 'You need a valid license to create derivatives' };
    }

    return { valid: true };
  }

  clear() {
    this.ipAssets.clear();
    this.relations = [];
  }
}

// Graph data builder
function buildGraphData(
  rootIp: MockIPAsset,
  parents: MockIPAsset[],
  children: MockIPAsset[]
): LineageGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add root
  nodes.push({
    id: rootIp.id,
    label: rootIp.title,
    image: rootIp.imageUrl,
    type: 'root',
  });

  // Add parents
  parents.forEach(p => {
    nodes.push({
      id: p.id,
      label: p.title,
      image: p.imageUrl,
      type: 'parent',
    });
    edges.push({ source: p.id, target: rootIp.id });
  });

  // Add children
  children.forEach(c => {
    nodes.push({
      id: c.id,
      label: c.title,
      image: c.imageUrl,
      type: 'child',
    });
    edges.push({ source: rootIp.id, target: c.id });
  });

  return { nodes, edges };
}

// Generators
const licenseTypeArb = fc.constantFrom(
  LicenseType.NON_COMMERCIAL,
  LicenseType.COMMERCIAL_USE,
  LicenseType.COMMERCIAL_REMIX
);

const mockIPArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  imageUrl: fc.webUrl(),
  creatorId: fc.uuid(),
  licenseType: fc.option(licenseTypeArb, { nil: null }),
  licenses: fc.array(fc.record({ buyerId: fc.uuid() }), { minLength: 0, maxLength: 5 }),
});

describe('Derivative Properties', () => {
  let store: MockDerivativeStore;

  beforeEach(() => {
    store = new MockDerivativeStore();
  });

  /**
   * Property 5: Derivative registration requires parent
   * For any derivative IP registration attempt without a valid parent IP specified,
   * the system should reject the registration with an appropriate error.
   * **Validates: Requirements 3.1**
   */
  test('Property 5: Derivative registration requires parent', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (nonExistentParentId, creatorId) => {
        // Don't add any IP to the store - parent doesn't exist
        const result = store.validateDerivative(nonExistentParentId, creatorId);
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Parent IP not found');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Derivative registration requires license
   * For any derivative IP registration where the creator does not hold a valid license
   * for the parent IP, the system should reject the registration.
   * **Validates: Requirements 3.2**
   */
  test('Property 6: Derivative registration requires license', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        fc.uuid(),
        (parentIp, attemptingCreatorId) => {
          // Ensure parent allows derivatives
          parentIp.licenseType = LicenseType.COMMERCIAL_REMIX;
          // Ensure attempting creator is NOT the owner
          fc.pre(parentIp.creatorId !== attemptingCreatorId);
          // Ensure attempting creator does NOT have a license
          parentIp.licenses = parentIp.licenses.filter(l => l.buyerId !== attemptingCreatorId);

          store.addIP(parentIp);
          const result = store.validateDerivative(parentIp.id, attemptingCreatorId);

          expect(result.valid).toBe(false);
          expect(result.error).toContain('license');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Non-derivative license blocks derivatives
   * For any parent IP with a NON_COMMERCIAL or COMMERCIAL_USE license,
   * attempting to register a derivative should fail with an error.
   * **Validates: Requirements 3.5**
   */
  test('Property 7: Non-derivative license blocks derivatives', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        fc.constantFrom(LicenseType.NON_COMMERCIAL, LicenseType.COMMERCIAL_USE),
        (parentIp, nonDerivativeLicense) => {
          parentIp.licenseType = nonDerivativeLicense;
          store.addIP(parentIp);

          // Even the owner should not be able to create derivatives
          const result = store.validateDerivative(parentIp.id, parentIp.creatorId);

          expect(result.valid).toBe(false);
          expect(result.error).toContain('does not allow derivative');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Derivative relationship persistence
   * For any successfully registered derivative IP, the parent-child relationship
   * should be queryable from both directions.
   * **Validates: Requirements 3.4, 4.4**
   */
  test('Property 8: Derivative relationship persistence', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        mockIPArb,
        (parentIp, childIp) => {
          fc.pre(parentIp.id !== childIp.id);

          store.addIP(parentIp);
          store.addIP(childIp);
          store.addRelation(parentIp.id, childIp.id);

          // Query from parent's perspective
          const derivatives = store.getDerivatives(parentIp.id);
          expect(derivatives.some(d => d.childIpId === childIp.id)).toBe(true);

          // Query from child's perspective
          const parent = store.getParent(childIp.id);
          expect(parent).not.toBeNull();
          expect(parent!.parentIpId).toBe(parentIp.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Derivative count accuracy
   * For any IP asset, the displayed derivative count should equal the actual
   * number of derivative relationships where that IP is the parent.
   * **Validates: Requirements 4.1**
   */
  test('Property 9: Derivative count accuracy', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        fc.array(mockIPArb, { minLength: 0, maxLength: 10 }),
        (parentIp, childIps) => {
          // Ensure unique IDs
          const uniqueChildren = childIps.filter((c, i, arr) => 
            c.id !== parentIp.id && arr.findIndex(x => x.id === c.id) === i
          );

          store.addIP(parentIp);
          uniqueChildren.forEach(child => {
            store.addIP(child);
            store.addRelation(parentIp.id, child.id);
          });

          const count = store.getDerivativeCount(parentIp.id);
          expect(count).toBe(uniqueChildren.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 10: Graph node completeness
   * For any IP lineage graph, every IP in the lineage tree should have
   * a corresponding node with title and image data.
   * **Validates: Requirements 5.2**
   */
  test('Property 10: Graph node completeness', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        fc.array(mockIPArb, { minLength: 0, maxLength: 5 }),
        fc.array(mockIPArb, { minLength: 0, maxLength: 5 }),
        (rootIp, parentIps, childIps) => {
          // Ensure unique IDs
          const allIds = new Set([rootIp.id]);
          const uniqueParents = parentIps.filter(p => {
            if (allIds.has(p.id)) return false;
            allIds.add(p.id);
            return true;
          });
          const uniqueChildren = childIps.filter(c => {
            if (allIds.has(c.id)) return false;
            allIds.add(c.id);
            return true;
          });

          const graphData = buildGraphData(rootIp, uniqueParents, uniqueChildren);

          // Every IP should have a node
          const expectedNodeCount = 1 + uniqueParents.length + uniqueChildren.length;
          expect(graphData.nodes.length).toBe(expectedNodeCount);

          // Every node should have title and image
          graphData.nodes.forEach(node => {
            expect(node.label).toBeDefined();
            expect(node.label.length).toBeGreaterThan(0);
            expect(node.image).toBeDefined();
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 11: Graph edge correctness
   * For any IP lineage graph, edges should only exist between IPs that have
   * a direct parent-child relationship, with direction from parent to child.
   * **Validates: Requirements 5.3**
   */
  test('Property 11: Graph edge correctness', () => {
    fc.assert(
      fc.property(
        mockIPArb,
        fc.array(mockIPArb, { minLength: 0, maxLength: 5 }),
        fc.array(mockIPArb, { minLength: 0, maxLength: 5 }),
        (rootIp, parentIps, childIps) => {
          // Ensure unique IDs
          const allIds = new Set([rootIp.id]);
          const uniqueParents = parentIps.filter(p => {
            if (allIds.has(p.id)) return false;
            allIds.add(p.id);
            return true;
          });
          const uniqueChildren = childIps.filter(c => {
            if (allIds.has(c.id)) return false;
            allIds.add(c.id);
            return true;
          });

          const graphData = buildGraphData(rootIp, uniqueParents, uniqueChildren);

          // Expected edges: parents -> root, root -> children
          const expectedEdgeCount = uniqueParents.length + uniqueChildren.length;
          expect(graphData.edges.length).toBe(expectedEdgeCount);

          // Verify edge directions
          graphData.edges.forEach(edge => {
            const isParentToRoot = uniqueParents.some(p => p.id === edge.source) && edge.target === rootIp.id;
            const isRootToChild = edge.source === rootIp.id && uniqueChildren.some(c => c.id === edge.target);
            
            expect(isParentToRoot || isRootToChild).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

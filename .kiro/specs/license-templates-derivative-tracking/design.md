# Design Document: License Templates & Derivative Tracking

## Overview

This feature extends CreatorBridge with two major capabilities:
1. **License Templates** - Allow creators to save, manage, and reuse license configurations
2. **Derivative Tracking** - Track and visualize IP lineage relationships using Story Protocol's on-chain data

## Architecture

```mermaid
graph TB
    subgraph Frontend
        CreatePage[Create IP Page]
        ProfilePage[Profile Page]
        IPDetailPage[IP Detail Page]
        GraphView[Lineage Graph View]
    end
    
    subgraph Components
        TemplateSelector[Template Selector]
        TemplateManager[Template Manager]
        DerivativeList[Derivative List]
        LineageGraph[Lineage Graph]
    end
    
    subgraph API
        TemplateAPI[/api/templates]
        DerivativeAPI[/api/derivatives]
        RoyaltyAPI[/api/royalties]
    end
    
    subgraph Services
        TemplateService[Template Service]
        DerivativeService[Derivative Service]
        StoryProtocol[Story Protocol SDK]
    end
    
    subgraph Database
        TemplateTable[(License Templates)]
        IPAssetTable[(IP Assets)]
        DerivativeTable[(Derivative Relations)]
    end
    
    CreatePage --> TemplateSelector
    ProfilePage --> TemplateManager
    IPDetailPage --> DerivativeList
    IPDetailPage --> GraphView
    GraphView --> LineageGraph
    
    TemplateSelector --> TemplateAPI
    TemplateManager --> TemplateAPI
    DerivativeList --> DerivativeAPI
    LineageGraph --> DerivativeAPI
    
    TemplateAPI --> TemplateService
    DerivativeAPI --> DerivativeService
    DerivativeService --> StoryProtocol
    
    TemplateService --> TemplateTable
    DerivativeService --> IPAssetTable
    DerivativeService --> DerivativeTable
```

## Components and Interfaces

### License Template Types

```typescript
interface LicenseTemplate {
  id: string;
  userId: string;
  name: string;
  licenseType: LicenseType;
  mintingFee: string | null;
  commercialRevShare: number | null;
  customTerms: PILCustomTerms | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PILCustomTerms {
  territories?: string[];        // Geographic restrictions
  channels?: string[];           // Distribution channels
  expiration?: Date;             // License expiration
  attribution?: boolean;         // Require attribution
  aiTraining?: boolean;          // Allow AI training use
}

interface CreateTemplateParams {
  name: string;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
  customTerms?: PILCustomTerms;
}
```

### Derivative Tracking Types

```typescript
interface DerivativeRelation {
  id: string;
  parentIpId: string;
  childIpId: string;
  licenseTokenId: string;
  registeredAt: Date;
  txHash: string;
}

interface IPLineage {
  ip: IPAsset;
  parents: IPLineageNode[];
  children: IPLineageNode[];
}

interface IPLineageNode {
  ipId: string;
  title: string;
  imageUrl: string;
  creator: string;
  licenseType: LicenseType;
  depth: number;
}

interface LineageGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  label: string;
  image: string;
  type: 'root' | 'parent' | 'child';
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}
```

### API Interfaces

```typescript
// Template API
POST /api/templates - Create new template
GET /api/templates - List user's templates
PUT /api/templates/:id - Update template
DELETE /api/templates/:id - Delete template

// Derivative API
POST /api/derivatives - Register derivative IP
GET /api/derivatives/:ipId - Get derivatives of an IP
GET /api/lineage/:ipId - Get full lineage tree

// Royalty API
GET /api/royalties/:ipId - Get royalty data for IP tree
```

## Data Models

### Prisma Schema Updates

```prisma
model LicenseTemplate {
  id                 String   @id @default(cuid())
  userId             String
  name               String
  licenseType        String
  mintingFee         String?
  commercialRevShare Int?
  customTerms        Json?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  user               User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, name])
}

model DerivativeRelation {
  id             String   @id @default(cuid())
  parentIpId     String
  childIpId      String
  licenseTokenId String?
  txHash         String?
  registeredAt   DateTime @default(now())
  
  parentIp       IPAsset  @relation("ParentIP", fields: [parentIpId], references: [id])
  childIp        IPAsset  @relation("ChildIP", fields: [childIpId], references: [id])
  
  @@unique([parentIpId, childIpId])
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Template persistence round-trip
*For any* valid license template configuration, saving and then loading the template should return an equivalent configuration with all fields preserved.
**Validates: Requirements 1.2, 2.2**

### Property 2: Template field population
*For any* saved template, selecting it in the form should populate all license fields with values matching the template's stored values.
**Validates: Requirements 1.4**

### Property 3: Template list completeness
*For any* user with saved templates, querying their templates should return all templates they have created, with no duplicates and no missing entries.
**Validates: Requirements 2.1, 2.4**

### Property 4: Template deletion removes data
*For any* template that is deleted, subsequent queries for that template should return not found, and it should not appear in the user's template list.
**Validates: Requirements 2.3**

### Property 5: Derivative registration requires parent
*For any* derivative IP registration attempt without a valid parent IP specified, the system should reject the registration with an appropriate error.
**Validates: Requirements 3.1**

### Property 6: Derivative registration requires license
*For any* derivative IP registration where the creator does not hold a valid license for the parent IP, the system should reject the registration.
**Validates: Requirements 3.2**

### Property 7: Non-derivative license blocks derivatives
*For any* parent IP with a NON_COMMERCIAL or COMMERCIAL_USE license (derivatives not allowed), attempting to register a derivative should fail with an error.
**Validates: Requirements 3.5**

### Property 8: Derivative relationship persistence
*For any* successfully registered derivative IP, the parent-child relationship should be queryable from both directions (parent's children and child's parent).
**Validates: Requirements 3.4, 4.4**

### Property 9: Derivative count accuracy
*For any* IP asset, the displayed derivative count should equal the actual number of derivative relationships where that IP is the parent.
**Validates: Requirements 4.1**

### Property 10: Graph node completeness
*For any* IP lineage graph, every IP in the lineage tree should have a corresponding node with title and image data.
**Validates: Requirements 5.2**

### Property 11: Graph edge correctness
*For any* IP lineage graph, edges should only exist between IPs that have a direct parent-child relationship, with direction from parent to child.
**Validates: Requirements 5.3**

### Property 12: Royalty aggregation accuracy
*For any* IP with derivatives, the total royalty amount should equal the sum of royalties from all direct and indirect derivatives.
**Validates: Requirements 6.2**

## Error Handling

| Error Scenario | Response | User Message |
|---------------|----------|--------------|
| Duplicate template name | 409 Conflict | "A template with this name already exists. Overwrite?" |
| Template not found | 404 Not Found | "Template not found" |
| Parent IP not found | 404 Not Found | "Parent IP not found" |
| No license for parent | 403 Forbidden | "You need a valid license to create derivatives" |
| Derivatives not allowed | 403 Forbidden | "This IP does not allow derivative works" |
| Story Protocol error | 500 Internal | "Failed to register on-chain. Please try again" |
| Graph data too large | 413 Payload Too Large | "Lineage tree too large to display" |

## Testing Strategy

### Unit Tests
- Template CRUD operations
- Derivative validation logic
- Graph data transformation
- Royalty calculation

### Property-Based Tests
Using fast-check library:
- Property 1: Template round-trip persistence
- Property 2: Template field population
- Property 3: Template list completeness
- Property 4: Template deletion
- Property 5-7: Derivative registration validation
- Property 8: Relationship bidirectional query
- Property 9: Derivative count accuracy
- Property 10-11: Graph data correctness
- Property 12: Royalty aggregation

### Integration Tests
- Story Protocol derivative registration
- Lineage query from subgraph
- End-to-end template workflow
- End-to-end derivative registration


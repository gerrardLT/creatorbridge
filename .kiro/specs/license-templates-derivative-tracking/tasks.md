# Implementation Plan

## 1. Database Schema Updates

- [ ] 1.1 Add LicenseTemplate model to Prisma schema
  - Add fields: id, userId, name, licenseType, mintingFee, commercialRevShare, customTerms, timestamps
  - Add unique constraint on [userId, name]
  - Add relation to User model
  - Run `npx prisma db push`
  - _Requirements: 1.2, 2.1_

- [ ] 1.2 Add DerivativeRelation model to Prisma schema
  - Add fields: id, parentIpId, childIpId, licenseTokenId, txHash, registeredAt
  - Add unique constraint on [parentIpId, childIpId]
  - Add relations to IPAsset model (ParentIP, ChildIP)
  - Run `npx prisma db push`
  - _Requirements: 3.4, 4.1_

- [ ] 1.3 Update IPAsset model for derivative relations
  - Add parentRelations and childRelations fields
  - _Requirements: 3.4, 4.4_

## 2. License Template Types and Service

- [ ] 2.1 Create template type definitions
  - Create `lib/types/template.ts`
  - Define LicenseTemplate, PILCustomTerms, CreateTemplateParams interfaces
  - _Requirements: 1.2_

- [ ] 2.2 Implement template database operations
  - Create `lib/db/templates.ts`
  - Implement createTemplate, getTemplatesByUser, getTemplateById, updateTemplate, deleteTemplate
  - _Requirements: 1.2, 2.1, 2.2, 2.3_

- [ ] 2.3 Write property test for template persistence round-trip
  - **Property 1: Template persistence round-trip**
  - **Validates: Requirements 1.2, 2.2**

- [ ] 2.4 Write property test for template list completeness
  - **Property 3: Template list completeness**
  - **Validates: Requirements 2.1, 2.4**

- [ ] 2.5 Write property test for template deletion
  - **Property 4: Template deletion removes data**
  - **Validates: Requirements 2.3**

## 3. Template API Routes

- [ ] 3.1 Create template API route
  - Create `app/api/templates/route.ts`
  - Implement POST (create) and GET (list) handlers
  - Add user authentication check
  - _Requirements: 1.2, 2.1_

- [ ] 3.2 Create template detail API route
  - Create `app/api/templates/[id]/route.ts`
  - Implement PUT (update) and DELETE handlers
  - Verify template ownership before operations
  - _Requirements: 2.2, 2.3_

## 4. Template Frontend Components

- [ ] 4.1 Create TemplateSelector component
  - Create `components/TemplateSelector.tsx`
  - Fetch user's templates on mount
  - Display dropdown with template names
  - Emit selected template data to parent
  - _Requirements: 1.3, 1.4_

- [ ] 4.2 Write property test for template field population
  - **Property 2: Template field population**
  - **Validates: Requirements 1.4**

- [ ] 4.3 Create SaveTemplateModal component
  - Create `components/SaveTemplateModal.tsx`
  - Input for template name
  - Handle duplicate name confirmation
  - _Requirements: 1.1, 1.5_

- [ ] 4.4 Integrate templates into Create page
  - Add TemplateSelector to create page
  - Add "Save as Template" button
  - Wire up template selection to populate form
  - _Requirements: 1.1, 1.3, 1.4_

- [ ] 4.5 Create TemplateManager component
  - Create `components/TemplateManager.tsx`
  - Display list of user's templates
  - Add edit and delete buttons
  - Show template details (name, type, pricing)
  - _Requirements: 2.1, 2.4_

- [ ] 4.6 Add template management to Profile page
  - Create or update profile page with templates section
  - Integrate TemplateManager component
  - _Requirements: 2.1_

## 5. Checkpoint - Template Feature Complete

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 6. Derivative Types and Service

- [ ] 6.1 Create derivative type definitions
  - Create `lib/types/derivative.ts`
  - Define DerivativeRelation, IPLineage, IPLineageNode, LineageGraphData interfaces
  - _Requirements: 3.4, 5.2_

- [ ] 6.2 Implement derivative database operations
  - Create `lib/db/derivatives.ts`
  - Implement createDerivativeRelation, getDerivativesByParent, getParentByChild, getLineageTree
  - _Requirements: 3.4, 4.1, 4.3, 4.4_

- [ ] 6.3 Implement derivative validation functions
  - Create `lib/derivative-utils.ts`
  - Implement validateDerivativeRegistration (check license ownership, check derivatives allowed)
  - _Requirements: 3.2, 3.5_

- [ ] 6.4 Write property test for derivative requires parent
  - **Property 5: Derivative registration requires parent**
  - **Validates: Requirements 3.1**

- [ ] 6.5 Write property test for derivative requires license
  - **Property 6: Derivative registration requires license**
  - **Validates: Requirements 3.2**

- [ ] 6.6 Write property test for non-derivative license blocks
  - **Property 7: Non-derivative license blocks derivatives**
  - **Validates: Requirements 3.5**

## 7. Story Protocol Derivative Integration

- [ ] 7.1 Implement registerDerivativeIP function
  - Update `lib/story-protocol.ts`
  - Use Story Protocol SDK registerDerivative (or newer API)
  - Return txHash and relationship data
  - _Requirements: 3.3_

- [ ] 7.2 Implement getDerivativesFromChain function
  - Query Story Protocol for derivative relationships
  - Use Goldsky subgraph if available
  - _Requirements: 4.2_

- [ ] 7.3 Write property test for relationship persistence
  - **Property 8: Derivative relationship persistence**
  - **Validates: Requirements 3.4, 4.4**

## 8. Derivative API Routes

- [ ] 8.1 Create derivatives API route
  - Create `app/api/derivatives/route.ts`
  - Implement POST handler for registering derivatives
  - Validate license ownership and derivative permission
  - Call Story Protocol and save to database
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.2 Create derivatives query API route
  - Create `app/api/derivatives/[ipId]/route.ts`
  - Implement GET handler to return derivatives of an IP
  - Include derivative count
  - _Requirements: 4.1, 4.3_

- [ ] 8.3 Create lineage API route
  - Create `app/api/lineage/[ipId]/route.ts`
  - Implement GET handler to return full lineage tree
  - Transform to graph data format
  - _Requirements: 5.2, 5.3_

## 9. Derivative Frontend Components

- [ ] 9.1 Create DerivativeList component
  - Create `components/DerivativeList.tsx`
  - Display list of derivative IPs with thumbnails
  - Link to derivative detail pages
  - Show derivative count
  - _Requirements: 4.1, 4.3_

- [ ] 9.2 Write property test for derivative count accuracy
  - **Property 9: Derivative count accuracy**
  - **Validates: Requirements 4.1**

- [ ] 9.3 Create ParentIPInfo component
  - Create `components/ParentIPInfo.tsx`
  - Display parent IP information for derivatives
  - Link to parent detail page
  - _Requirements: 4.4_

- [ ] 9.4 Update IP detail page with derivative info
  - Add DerivativeList to IP detail page
  - Add ParentIPInfo for derivative IPs
  - Add "Create Derivative" button for eligible IPs
  - _Requirements: 4.1, 4.3, 4.4_

## 10. Lineage Graph Visualization

- [ ] 10.1 Install React Flow
  - Add reactflow package
  - Configure in project
  - _Requirements: 5.1_

- [ ] 10.2 Create LineageGraph component
  - Create `components/LineageGraph.tsx`
  - Use React Flow for visualization
  - Render nodes with IP title and thumbnail
  - Render directed edges for parent-child relationships
  - Support zoom and pan
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 10.3 Write property test for graph node completeness
  - **Property 10: Graph node completeness**
  - **Validates: Requirements 5.2**

- [ ] 10.4 Write property test for graph edge correctness
  - **Property 11: Graph edge correctness**
  - **Validates: Requirements 5.3**

- [ ] 10.5 Create LineageGraphModal component
  - Create `components/LineageGraphModal.tsx`
  - Full-screen modal for graph view
  - Handle node click navigation
  - _Requirements: 5.4_

- [ ] 10.6 Add graph view to IP detail page
  - Add "View Lineage" button
  - Open LineageGraphModal on click
  - _Requirements: 5.1_

## 11. Royalty Tracking

- [ ] 11.1 Implement royalty query function
  - Update `lib/story-protocol.ts`
  - Query Story Protocol for royalty data
  - Aggregate royalties from derivative tree
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.2 Create royalty API route
  - Create `app/api/royalties/[ipId]/route.ts`
  - Return royalty data for IP and its derivatives
  - _Requirements: 6.2, 6.3_

- [ ] 11.3 Write property test for royalty aggregation
  - **Property 12: Royalty aggregation accuracy**
  - **Validates: Requirements 6.2**

- [ ] 11.4 Create RoyaltyInfo component
  - Create `components/RoyaltyInfo.tsx`
  - Display revenue share percentage
  - Show accumulated royalties
  - _Requirements: 6.1, 6.2_

- [ ] 11.5 Add royalty info to IP detail page
  - Integrate RoyaltyInfo component
  - Show for IPs with derivatives
  - _Requirements: 6.1, 6.2_

## 12. Derivative Registration UI

- [ ] 12.1 Create DerivativeRegistrationForm component
  - Create `components/DerivativeRegistrationForm.tsx`
  - Parent IP selector (search/select)
  - Show parent license requirements
  - Validate license ownership
  - _Requirements: 3.1, 3.2_

- [ ] 12.2 Create derivative registration page
  - Create `app/create/derivative/page.tsx`
  - Integrate DerivativeRegistrationForm
  - Handle registration flow
  - Show success/error states
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

## 13. Final Checkpoint

- [ ] 13. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.


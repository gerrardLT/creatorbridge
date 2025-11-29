# Implementation Plan

## Phase 1: Project Setup

- [x] 1. Initialize Next.js project structure




  - [x] 1.1 Create new Next.js 14 project with App Router in `creatorbridge-next` folder

    - Use `create-next-app` with TypeScript, Tailwind CSS, ESLint
    - Configure `next.config.js` for image domains and environment variables
    - _Requirements: 1.1, 1.4, 1.5_
  - [x] 1.2 Set up Prisma ORM and database schema

    - Install Prisma and initialize with SQLite for development
    - Create schema with User, IPAsset, License, Transaction models
    - Generate Prisma client
    - _Requirements: 7.1, 7.2_

  - [x] 1.3 Create environment configuration

    - Create `.env.example` with all required variables
    - Set up environment validation on startup
    - _Requirements: 8.1, 8.3, 8.4_
  - [ ]* 1.4 Write property test for environment validation
    - **Property 10: Payload validation rejects malformed data** (adapted for env vars)
    - **Validates: Requirements 8.3**

- [x] 2. Checkpoint - Ensure project builds and database connects


  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Core Types and Utilities

- [x] 3. Set up shared types and utilities


  - [x] 3.1 Create TypeScript type definitions

    - Migrate and extend types from original project
    - Add Story Protocol specific types (IPMetadata, LicenseTerms)
    - _Requirements: 1.5_

  - [x] 3.2 Create utility functions


    - Address validation, formatting helpers
    - Error handling utilities
    - _Requirements: 6.4_
  - [ ]* 3.3 Write property tests for utility functions
    - **Property 9: API error handling returns proper status codes**
    - **Validates: Requirements 6.4**


## Phase 3: Service Layer Implementation

- [x] 4. Implement Story Protocol service




  - [x] 4.1 Create Story Protocol SDK wrapper

    - Install `@story-protocol/core-sdk`
    - Implement `registerIP`, `getIPDetails`, `mintLicense` functions
    - Handle blockchain errors gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  - [x]* 4.2 Write property test for IP registration

    - **Property 1: IP Registration produces valid response**
    - **Validates: Requirements 2.1, 2.2**
  - [ ]* 4.3 Write property test for license minting
    - **Property 4: Payment confirmation triggers license minting**



    - **Validates: Requirements 4.3**

- [x] 5. Implement Wallet service

  - [ ] 5.1 Create Coinbase Embedded Wallet integration
    - Install Coinbase SDK dependencies
    - Implement connect, disconnect, signMessage functions
    - _Requirements: 3.1, 3.2_
  - [ ]* 5.2 Write property test for wallet authentication
    - **Property 2: Authentication produces wallet association**




    - **Validates: Requirements 3.2, 3.4**
  - [ ]* 5.3 Write property test for logout
    - **Property 3: Logout clears session state**
    - **Validates: Requirements 3.5**

- [x] 6. Implement Goldsky indexer service


  - [ ] 6.1 Create Goldsky client wrapper
    - Set up GraphQL client for Goldsky
    - Implement queryIPAssets, getIPById functions
    - Add fallback to direct RPC when indexer unavailable
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [ ]* 6.2 Write property test for indexer fallback
    - **Property 8: Indexer fallback behavior**
    - **Validates: Requirements 5.5**

- [ ] 7. Checkpoint - Ensure services work correctly
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: API Routes


- [x] 8. Implement IP asset API routes

  - [x] 8.1 Create `/api/ip` route handlers

    - GET: List all IP assets with pagination and filters
    - POST: Register new IP asset (calls Story Protocol service)

    - _Requirements: 6.1, 2.1_
  - [x] 8.2 Create `/api/ip/[id]` route handlers

    - GET: Fetch single IP details





    - _Requirements: 6.1, 2.3_
  - [ ]* 8.3 Write property test for API validation
    - **Property 10: Payload validation rejects malformed data**

    - **Validates: Requirements 6.5**


- [ ] 9. Implement authentication API routes
  - [ ] 9.1 Set up NextAuth with Coinbase provider
    - Configure NextAuth with custom Coinbase wallet provider
    - Implement session handling with wallet address
    - _Requirements: 6.2, 3.3_


- [x] 10. Implement license API routes


  - [ ] 10.1 Create `/api/license` route handlers
    - POST: Purchase license (calls Story Protocol service)
    - GET: List user's licenses
    - _Requirements: 6.3, 4.3_
  - [ ]* 10.2 Write property test for transaction status
    - **Property 5: Transaction status feedback**
    - **Validates: Requirements 4.4**



  - [ ]* 10.3 Write property test for payment failure
    - **Property 6: Payment failure handling**


    - **Validates: Requirements 4.5**


- [ ] 11. Implement indexer API routes
  - [ ] 11.1 Create `/api/indexer` route handlers
    - GET: Query indexed assets with filters
    - _Requirements: 5.3_
  - [ ]* 11.2 Write property test for search performance
    - **Property 7: Search queries use indexed data**
    - **Validates: Requirements 5.4**

- [x] 12. Checkpoint - Ensure all API routes work

  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Database Operations


- [x] 13. Implement database operations

  - [ ] 13.1 Create user repository functions
    - findByWalletAddress, create, update

    - _Requirements: 7.2_
  - [ ] 13.2 Create IP asset repository functions
    - findAll, findById, create, update
    - _Requirements: 7.3_
  - [ ] 13.3 Create transaction repository functions
    - create, findByUserId
    - _Requirements: 7.4_
  - [ ]* 13.4 Write property test for user-wallet linkage
    - **Property 11: User profile wallet linkage**
    - **Validates: Requirements 7.2**
  - [ ]* 13.5 Write property test for transaction history
    - **Property 12: Transaction history completeness**

    - **Validates: Requirements 7.4**



- [ ] 14. Checkpoint - Ensure database operations work
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Frontend Pages Migration

- [x] 15. Create root layout and providers


  - [x] 15.1 Set up app/layout.tsx with providers

    - Add AuthProvider, WalletProvider, QueryClientProvider
    - Include global styles and Tailwind config
    - _Requirements: 1.2_

- [x] 16. Migrate Home page

  - [x] 16.1 Convert Home component to Next.js page

    - Create `app/page.tsx` with server/client components
    - Migrate all UI and animations
    - Update navigation to use Next.js Link
    - _Requirements: 1.3_





- [ ] 17. Migrate Explore page
  - [x] 17.1 Convert Explore component to Next.js page

    - Create `app/explore/page.tsx`
    - Implement server-side data fetching for initial load
    - Add client-side filtering and pagination
    - _Requirements: 1.3, 5.4_

- [ ] 18. Migrate Create IP page
  - [x] 18.1 Convert CreateIP component to Next.js page



    - Create `app/create/page.tsx`
    - Integrate with Story Protocol service for registration
    - Handle file upload and form submission
    - _Requirements: 1.3, 2.1_

- [x] 19. Migrate IP Details page


  - [ ] 19.1 Convert IPDetails component to Next.js page
    - Create `app/ip/[id]/page.tsx` with dynamic routing
    - Fetch IP data server-side
    - Integrate license purchase flow
    - _Requirements: 1.3, 2.3, 4.1_


- [x] 20. Migrate Profile page

  - [ ] 20.1 Convert Profile component to Next.js page
    - Create `app/profile/page.tsx`
    - Display user's IP assets and transaction history
    - Integrate with authentication
    - _Requirements: 1.3, 7.4_

- [ ] 21. Migrate shared components
  - [x] 21.1 Convert Navbar component





    - Update to use Next.js navigation
    - Integrate wallet connection UI
    - _Requirements: 1.3, 3.4_

  - [x] 21.2 Convert IPCard and other UI components


    - Migrate all reusable components
    - Ensure consistent styling

    - _Requirements: 1.3, 1.4_

- [ ] 22. Checkpoint - Ensure all pages render correctly
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Security and Rate Limiting


- [ ] 23. Implement security measures
  - [ ] 23.1 Add rate limiting to API routes
    - Install and configure rate limiting middleware
    - Apply to public API endpoints
    - _Requirements: 8.5_
  - [ ]* 23.2 Write property test for rate limiting
    - **Property 13: Rate limiting enforcement**
    - **Validates: Requirements 8.5**
  - [ ] 23.3 Ensure no secrets exposed to client
    - Audit code for client-side secret exposure
    - Use server-only imports where needed
    - _Requirements: 8.2_

- [ ] 24. Final Checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

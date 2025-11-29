# Design Document: CreatorBridge Next.js Full-Stack Migration

## Overview

本设计文档描述将 CreatorBridge 从 Vite React SPA 迁移到 Next.js 14 全栈架构的技术方案。新架构将集成 Story Protocol SDK、Coinbase Embedded Wallets、支付解决方案和 Goldsky 数据索引服务。

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Application                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (App Router)          │  Backend (API Routes)          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │ app/                    │   │  │ app/api/                │   │
│  │ ├── page.tsx (Home)     │   │  │ ├── ip/route.ts         │   │
│  │ ├── explore/page.tsx    │   │  │ ├── auth/[...]/route.ts │   │
│  │ ├── create/page.tsx     │   │  │ ├── license/route.ts    │   │
│  │ ├── ip/[id]/page.tsx    │   │  │ └── indexer/route.ts    │   │
│  │ └── profile/page.tsx    │   │  └─────────────────────────┘   │
│  └─────────────────────────┘   │                                 │
├─────────────────────────────────────────────────────────────────┤
│                         Services Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ StoryProtocol│ │ CoinbaseWallet│ │ Goldsky     │             │
│  │ Service      │ │ Service       │ │ Service     │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                         Data Layer                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Prisma ORM + PostgreSQL/SQLite                            │   │
│  │ - Users, IPAssets, Transactions, Licenses                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Story Protocol│ │ Coinbase     │ │ Goldsky     │             │
│  │ Blockchain   │ │ Auth/Wallet  │ │ Indexer     │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 项目目录结构

```
creatorbridge-next/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── explore/
│   │   └── page.tsx            # Explore marketplace
│   ├── create/
│   │   └── page.tsx            # Create IP asset
│   ├── ip/
│   │   └── [id]/
│   │       └── page.tsx        # IP details page
│   ├── profile/
│   │   └── page.tsx            # User profile
│   └── api/
│       ├── ip/
│       │   ├── route.ts        # GET all, POST create
│       │   └── [id]/route.ts   # GET, PUT, DELETE single
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── license/
│       │   └── route.ts        # License operations
│       └── indexer/
│           └── route.ts        # Goldsky queries
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── Navbar.tsx
│   ├── IPCard.tsx
│   └── ...
├── lib/
│   ├── story-protocol.ts       # Story Protocol SDK wrapper
│   ├── coinbase-wallet.ts      # Coinbase wallet integration
│   ├── goldsky.ts              # Goldsky client
│   ├── prisma.ts               # Prisma client
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useIPAssets.ts
│   └── useWallet.ts
├── types/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

### 2. Service Interfaces

```typescript
// lib/story-protocol.ts
interface StoryProtocolService {
  registerIP(metadata: IPMetadata): Promise<{ ipId: string; txHash: string }>;
  getIPDetails(ipId: string): Promise<IPAsset>;
  mintLicense(ipId: string, licenseTerms: LicenseTerms): Promise<{ licenseId: string; txHash: string }>;
  getLicenses(ipId: string): Promise<License[]>;
}

// lib/coinbase-wallet.ts
interface WalletService {
  connect(): Promise<{ address: string; provider: any }>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  sendTransaction(tx: TransactionRequest): Promise<string>;
}

// lib/goldsky.ts
interface IndexerService {
  queryIPAssets(filters: IPFilters): Promise<IPAsset[]>;
  getIPById(id: string): Promise<IPAsset | null>;
  getTransactionHistory(address: string): Promise<Transaction[]>;
}
```

### 3. API Route Specifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ip` | GET | List all IP assets with pagination/filters |
| `/api/ip` | POST | Register new IP asset |
| `/api/ip/[id]` | GET | Get single IP details |
| `/api/license` | POST | Purchase/mint license |
| `/api/license/[id]` | GET | Get license details |
| `/api/auth/[...nextauth]` | * | NextAuth handlers |
| `/api/indexer/assets` | GET | Query indexed assets |

## Data Models

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  name          String?
  email         String?   @unique
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  ipAssets      IPAsset[]
  transactions  Transaction[]
}

model IPAsset {
  id            String    @id @default(cuid())
  ipId          String?   @unique  // Story Protocol IP ID
  title         String
  description   String
  imageUrl      String
  priceEth      Float
  txHash        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  creatorId     String
  creator       User      @relation(fields: [creatorId], references: [id])
  licenses      License[]
}

model License {
  id            String    @id @default(cuid())
  licenseId     String?   @unique  // Story Protocol License ID
  txHash        String?
  purchasedAt   DateTime  @default(now())
  
  ipAssetId     String
  ipAsset       IPAsset   @relation(fields: [ipAssetId], references: [id])
  buyerId       String
}

model Transaction {
  id            String    @id @default(cuid())
  type          String    // REGISTER, PURCHASE, SALE
  amount        Float
  txHash        String
  createdAt     DateTime  @default(now())
  
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  assetId       String?
  assetTitle    String
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties have been identified:

### Property 1: IP Registration produces valid response
*For any* valid IP registration request with title, description, and image, the system SHALL return a response containing both `ipId` and `txHash` fields that are non-empty strings.
**Validates: Requirements 2.1, 2.2**

### Property 2: Authentication produces wallet association
*For any* successful user authentication, the resulting user session SHALL contain a valid wallet address in the format of an Ethereum address (0x followed by 40 hex characters).
**Validates: Requirements 3.2, 3.4**

### Property 3: Logout clears session state
*For any* logged-in user who performs logout, the session state SHALL become null/undefined and no wallet address SHALL be accessible.
**Validates: Requirements 3.5**

### Property 4: Payment confirmation triggers license minting
*For any* confirmed payment transaction, the system SHALL invoke the license minting function with the correct IP ID and return a valid license ID.
**Validates: Requirements 4.3**

### Property 5: Transaction status feedback
*For any* transaction (registration, purchase), the system SHALL provide status updates that include one of: 'pending', 'confirmed', 'failed'.
**Validates: Requirements 4.4**

### Property 6: Payment failure handling
*For any* failed payment attempt, the system SHALL return an error response with a message field and the original transaction state SHALL remain unchanged.
**Validates: Requirements 4.5**

### Property 7: Search queries use indexed data
*For any* asset search/filter request, the response time SHALL be under a reasonable threshold (indicating indexed data usage vs direct RPC).
**Validates: Requirements 5.4**

### Property 8: Indexer fallback behavior
*For any* request when the indexer service is unavailable, the system SHALL still return valid data (from fallback source) rather than failing completely.
**Validates: Requirements 5.5**

### Property 9: API error handling returns proper status codes
*For any* invalid API request (malformed payload, missing required fields), the system SHALL return appropriate HTTP status codes (400 for bad request, 401 for unauthorized, 404 for not found).
**Validates: Requirements 6.4**

### Property 10: Payload validation rejects malformed data
*For any* API request with invalid payload (missing required fields, wrong types), the system SHALL reject the request before processing and return validation errors.
**Validates: Requirements 6.5**

### Property 11: User profile wallet linkage
*For any* user stored in the database, querying by wallet address SHALL return the same user profile as querying by user ID.
**Validates: Requirements 7.2**

### Property 12: Transaction history completeness
*For any* transaction created in the system, it SHALL appear in the user's transaction history when queried.
**Validates: Requirements 7.4**

### Property 13: Rate limiting enforcement
*For any* client making requests exceeding the rate limit threshold, subsequent requests SHALL receive 429 status codes until the rate limit window resets.
**Validates: Requirements 8.5**

## Error Handling

### Error Categories

1. **Blockchain Errors**: Transaction failures, gas estimation errors, network issues
2. **Authentication Errors**: Invalid credentials, expired sessions, wallet connection failures
3. **Validation Errors**: Invalid input data, missing required fields
4. **External Service Errors**: Goldsky unavailable, Story Protocol RPC issues
5. **Database Errors**: Connection failures, constraint violations

### Error Response Format

```typescript
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Example responses
{ code: 'VALIDATION_ERROR', message: 'Title is required' }
{ code: 'BLOCKCHAIN_ERROR', message: 'Transaction failed', details: { txHash: '0x...' } }
{ code: 'AUTH_ERROR', message: 'Session expired' }
```

## Testing Strategy

### Unit Testing
- Use Jest for unit tests
- Test individual service functions (Story Protocol wrapper, Goldsky client)
- Test utility functions and data transformations
- Mock external dependencies

### Property-Based Testing
- Use fast-check library for property-based tests
- Test API payload validation with generated inputs
- Test error handling with various failure scenarios
- Each property test SHALL run minimum 100 iterations
- Each property test SHALL be tagged with format: `**Feature: nextjs-fullstack-migration, Property {number}: {property_text}**`

### Integration Testing
- Test API routes with supertest
- Test database operations with test database
- Test authentication flows end-to-end

### E2E Testing (Optional)
- Use Playwright for critical user flows
- Test wallet connection flow
- Test IP registration flow
- Test license purchase flow

# Requirements Document

## Introduction

本文档定义了将 CreatorBridge 从 Vite React SPA 改造为 Next.js 全栈项目的需求。新架构将集成 Story Protocol SDK 进行链上 IP 管理、Coinbase Embedded Wallets 进行用户认证、支付解决方案以及链上数据索引服务。

## Glossary

- **Story Protocol**: 用于在区块链上注册、管理和链接知识产权的协议
- **Next.js**: React 全栈框架，支持 SSR/SSG 和 API Routes
- **Coinbase Embedded Wallets**: 通过社交登录提供无缝钱包创建的服务
- **Goldsky**: 链上数据索引服务，用于高效查询区块链事件
- **IP Asset**: 在 Story Protocol 上注册的知识产权资产
- **License**: IP 资产的使用授权许可

## Requirements

### Requirement 1: Next.js 项目架构

**User Story:** As a developer, I want to migrate the project to Next.js App Router architecture, so that I can leverage server-side rendering and API routes for a full-stack application.

#### Acceptance Criteria

1. THE system SHALL use Next.js 14+ with App Router directory structure
2. THE system SHALL implement server components for data fetching where appropriate
3. THE system SHALL maintain all existing UI components and pages functionality
4. THE system SHALL use Tailwind CSS for styling consistent with current design
5. THE system SHALL support TypeScript throughout the codebase

### Requirement 2: Story Protocol SDK 集成

**User Story:** As a creator, I want to register my IP assets on Story Protocol blockchain, so that I have verifiable on-chain ownership.

#### Acceptance Criteria

1. WHEN a user registers an IP asset THEN the system SHALL call Story Protocol SDK to mint the IP on-chain
2. WHEN an IP is registered THEN the system SHALL store the IP ID and transaction hash
3. WHEN viewing IP details THEN the system SHALL fetch on-chain metadata from Story Protocol
4. THE system SHALL provide API routes to interact with Story Protocol SDK
5. WHEN a license is purchased THEN the system SHALL record the license on Story Protocol

### Requirement 3: Coinbase Embedded Wallets 认证

**User Story:** As a user, I want to login with my social accounts and automatically get a wallet, so that I can interact with Web3 without complexity.

#### Acceptance Criteria

1. WHEN a user clicks login THEN the system SHALL present social login options (Google, Email)
2. WHEN a user authenticates THEN the system SHALL create or retrieve their embedded wallet
3. THE system SHALL store user session securely using NextAuth or similar
4. WHEN a user is logged in THEN the system SHALL display their wallet address
5. WHEN a user logs out THEN the system SHALL clear the session and wallet connection

### Requirement 4: 支付解决方案

**User Story:** As a buyer, I want to purchase IP licenses with a simple payment flow, so that I can acquire rights without complex crypto transactions.

#### Acceptance Criteria

1. WHEN a user initiates license purchase THEN the system SHALL display payment options
2. THE system SHALL support crypto payments via connected wallet
3. WHEN payment is confirmed THEN the system SHALL trigger license minting on Story Protocol
4. THE system SHALL provide transaction status feedback to users
5. IF payment fails THEN the system SHALL display error message and allow retry

### Requirement 5: 链上数据索引 (Goldsky)

**User Story:** As a user, I want to browse IP assets with fast loading times, so that I can discover content efficiently.

#### Acceptance Criteria

1. THE system SHALL use indexed data for listing IP assets instead of direct RPC calls
2. WHEN new IP is registered THEN the indexer SHALL capture the event within reasonable time
3. THE system SHALL provide GraphQL or REST API for querying indexed data
4. WHEN filtering/searching assets THEN the system SHALL query indexed data for performance
5. THE system SHALL fallback to direct RPC if indexer is unavailable

### Requirement 6: API Routes 架构

**User Story:** As a developer, I want well-structured API routes, so that frontend and external services can interact with the backend.

#### Acceptance Criteria

1. THE system SHALL provide `/api/ip` routes for IP asset CRUD operations
2. THE system SHALL provide `/api/auth` routes for authentication flows
3. THE system SHALL provide `/api/license` routes for license operations
4. THE system SHALL implement proper error handling and status codes
5. THE system SHALL validate request payloads before processing

### Requirement 7: 数据库集成

**User Story:** As a system, I want to persist user and asset data, so that information is retained across sessions.

#### Acceptance Criteria

1. THE system SHALL use a database (Prisma + PostgreSQL/SQLite) for data persistence
2. THE system SHALL store user profiles linked to wallet addresses
3. THE system SHALL cache IP asset metadata for faster retrieval
4. THE system SHALL store transaction history for user dashboard
5. WHEN database is unavailable THEN the system SHALL gracefully degrade functionality

### Requirement 8: 环境配置与安全

**User Story:** As a developer, I want secure configuration management, so that sensitive keys are protected.

#### Acceptance Criteria

1. THE system SHALL use environment variables for all sensitive configuration
2. THE system SHALL not expose private keys or API secrets to client-side code
3. THE system SHALL validate environment variables on startup
4. THE system SHALL provide example .env file for development setup
5. THE system SHALL implement rate limiting on public API routes

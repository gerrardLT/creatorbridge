# CreatorBridge

> A programmable IP licensing platform built on Story Protocol, empowering creators to protect, monetize, and share their digital intellectual property with automated royalty distribution and derivative work tracking.

## Overview

CreatorBridge is the first **Agent-Native IP Marketplace** designed for the Agentic Economy. Transform static digital assets into programmable liquidity with on-chain provenance, automated royalty splits, and machine-readable license terms. Built for both human creators and autonomous agents to discover, negotiate, and license creative works in milliseconds.

## Key Features

**Core Capabilities**
- **One-Click IP Registration** - Register images, audio, video, and documents on Story Protocol blockchain with immutable proof of ownership
- **Programmable IP Licenses** - Choose from Non-Commercial, Commercial Use, or Commercial Remix licenses with customizable terms
- **Automated Royalty Distribution** - Smart contracts handle instant revenue splits for direct licenses and derivative works
- **Derivative Work Registry** - On-chain relationship graphs automatically track remixes and attribute original creators
- **License Template System** - Save and reuse custom licensing configurations for bulk operations

**User Experience**
- **Zero-Knowledge Wallet** - Coinbase Smart Wallet integration with Passkey login (Face ID/Touch ID/Windows Hello)
- **AI Content Generation** - Built-in AI image generation for rapid prototyping and instant registration
- **Real-Time Analytics** - Live dashboard tracking earnings from licenses, derivatives, and royalty splits
- **Multi-Format Support** - Upload and protect images, audio files, videos, and documents
- **Transparent Lineage** - Visual IP family trees showing derivative relationships and attribution chains

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|----------|
| Framework | Next.js 14 App Router | Server-side rendering, API routes |
| Language | TypeScript | Type safety, developer experience |
| Styling | Tailwind CSS | Responsive UI, custom design system |
| Database | Prisma + PostgreSQL (Neon) | Serverless database, data modeling |
| Blockchain | Story Protocol (Aeneid Testnet) | Programmable IP licensing infrastructure |
| Smart Contracts | Story Protocol SDK v1.4.2 | IP registration, license minting, derivatives |
| Wallet | Coinbase Smart Wallet SDK | Passkey authentication, gasless transactions |
| Indexer | Goldsky Subgraph | On-chain data indexing and queries |
| Testing | Jest + Property-based Testing | Unit tests, fuzz testing with fast-check |
| Authentication | NextAuth.js | Session management, wallet-based auth |

## Quick Start

### 1. Clone the Repository

```bash
git clone <repo-url>
cd creatorbridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the required configurations:

```env
# Database
DATABASE_URL="your-neon-database-url"

# Story Protocol
STORY_RPC_URL="https://aeneid.storyrpc.io"
STORY_PRIVATE_KEY="0xYourTestWalletPrivateKey"

# Coinbase
NEXT_PUBLIC_CDP_CLIENT_API_KEY="YourCDPClientAPIKey"

# NextAuth
NEXTAUTH_SECRET="RandomlyGeneratedSecret"
NEXTAUTH_URL="http://localhost:3001"
```

> For detailed configuration guide, see [docs/NEON_DATABASE_SETUP.md](docs/NEON_DATABASE_SETUP.md)

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3001

## Project Structure

```
creatorbridge/
├── app/                           # Next.js App Router pages
│   ├── page.tsx                  # Landing page with animated hero
│   ├── explore/                  # Marketplace and IP discovery
│   ├── create/                   # IP registration wizard
│   │   └── derivative/           # Derivative work registration
│   ├── profile/                  # User dashboard, templates, analytics
│   ├── ip/[id]/                  # IP detail page with lineage graph
│   └── api/                      # RESTful API endpoints
│       ├── ip/                   # IP asset CRUD operations
│       ├── license/              # License minting and management
│       ├── derivatives/          # Derivative registration
│       ├── royalties/            # Royalty calculations
│       ├── templates/            # License template management
│       ├── lineage/              # IP relationship graphs
│       ├── transactions/         # Transaction history
│       ├── indexer/              # Goldsky data queries
│       └── auth/                 # NextAuth endpoints
│
├── components/                    # Reusable React components
│   ├── IPCard.tsx                # IP asset display card
│   ├── LicenseSelector.tsx       # License type picker
│   ├── TemplateManager.tsx       # Template CRUD interface
│   ├── LineageGraph.tsx          # ReactFlow derivative visualization
│   ├── RoyaltyInfo.tsx           # Revenue distribution display
│   └── providers/                # Context providers
│
├── lib/                           # Core business logic
│   ├── story-protocol.ts         # Story Protocol SDK integration
│   ├── license-utils.ts          # PIL terms configuration
│   ├── derivative-utils.ts       # Derivative validation logic
│   ├── wallet.ts                 # Wallet connection management
│   ├── goldsky.ts                # Subgraph queries
│   ├── db/                       # Database operations
│   │   ├── ip.ts                 # IP asset queries
│   │   ├── licenses.ts           # License queries
│   │   ├── derivatives.ts        # Derivative relations
│   │   └── templates.ts          # Template CRUD
│   ├── types/                    # TypeScript type definitions
│   │   ├── license.ts            # License types and enums
│   │   ├── derivative.ts         # Derivative types
│   │   └── template.ts           # Template types
│   └── __tests__/                # Property-based tests
│
├── prisma/
│   ├── schema.prisma             # Database schema (PostgreSQL)
│   └── seed.ts                   # Database seeding script
│
├── subgraph/                      # Goldsky Subgraph (optional)
│   ├── schema.graphql            # GraphQL schema
│   └── subgraph.yaml             # Subgraph configuration
│
└── docs/                          # Documentation
    ├── NEON_DATABASE_SETUP.md    # Database configuration guide
    ├── TEMPLATE_FEATURE_GUIDE.md # License template usage
    └── PRESENTATION_SPEECH_TEXT.md # Project pitch deck
```

## API Endpoints

**IP Asset Management**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ip` | GET | List all IP assets with pagination and filters |
| `/api/ip` | POST | Register new IP asset with metadata and license terms |
| `/api/ip/[id]` | GET | Get IP asset details including licenses and derivatives |
| `/api/ip/[id]` | DELETE | Delete IP asset (soft delete) |

**License Operations**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/license` | GET | Get user's purchased licenses |
| `/api/license` | POST | Mint and purchase license for an IP asset |

**Derivative Works**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/derivatives` | POST | Register derivative IP with parent relationship |
| `/api/derivatives/[ipId]` | GET | Get all derivatives of an IP asset |
| `/api/lineage/[ipId]` | GET | Get complete IP lineage tree (parents and children) |

**Royalty & Analytics**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/royalties/[ipId]` | GET | Get royalty distribution breakdown for an IP |
| `/api/transactions` | GET | Get user's transaction history |

**Template Management**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/templates` | GET | Get user's license templates |
| `/api/templates` | POST | Create new license template |
| `/api/templates/[id]` | PATCH | Update license template |
| `/api/templates/[id]` | DELETE | Delete license template |

**Indexer & Authentication**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/indexer` | GET | Query on-chain data via Goldsky subgraph |
| `/api/user` | POST | Create or update user profile |
| `/api/auth/*` | * | NextAuth wallet-based authentication |

## Story Protocol Integration

CreatorBridge leverages Story Protocol's programmable IP infrastructure for on-chain intellectual property management.

**Core SDK Operations**
- `mintAndRegisterIpAssetWithPilTerms` - Register IP asset with Programmable IP License (PIL) terms in a single transaction
- `registerDerivative` - Establish parent-child relationships for derivative works on-chain
- `mintLicenseTokens` - Mint license NFTs for IP asset usage rights
- `attachLicenseTerms` - Attach PIL terms to existing IP assets
- `registerIpAndMakeDerivative` - Atomically register derivative and link to parent IP

**Programmable IP License (PIL) System**

Three license types mapped to PIL flavors:

1. **Non-Commercial (PIL_FLAVOR: NON_COMMERCIAL_SOCIAL_REMIXING)**
   - Commercial Use: No
   - Derivatives Allowed: Yes
   - Revenue Share: 0%
   - Minting Fee: Free
   - Use Case: Creative commons, portfolio work, social sharing

2. **Commercial Use (PIL_FLAVOR: COMMERCIAL_USE)**
   - Commercial Use: Yes
   - Derivatives Allowed: No
   - Revenue Share: N/A
   - Minting Fee: Creator-defined (in WIP tokens)
   - Use Case: Licensed assets, stock media, exclusive rights

3. **Commercial Remix (PIL_FLAVOR: COMMERCIAL_REMIX)**
   - Commercial Use: Yes
   - Derivatives Allowed: Yes
   - Revenue Share: 0-100% (creator-defined)
   - Minting Fee: Creator-defined (in WIP tokens)
   - Use Case: Remix culture, collaborative projects, royalty-generating assets

**Derivative Work System**
- Automatic lineage tracking via `DerivativeRelation` model
- Parent-child relationships stored on-chain and indexed in database
- License validation ensures only Commercial Remix licenses permit derivatives
- Revenue share automatically flows to original creators
- Visual lineage graphs using ReactFlow for IP family tree visualization

**Smart Contract Addresses (Aeneid Testnet)**
- SPG NFT Factory: Manages IP asset NFT collections
- Royalty Policy LAP: Handles automated royalty distribution
- License Registry: Tracks license terms and minted licenses
- WIP Token: Native currency for license fees and royalties

## Wallet & Authentication

**Coinbase Smart Wallet Integration**

Seamless wallet experience with no browser extensions required:

- **Passkey Authentication** - Biometric login via Windows Hello, Touch ID, or Face ID
- **Mobile QR Login** - Scan with Coinbase Wallet mobile app for instant connection
- **Session Persistence** - Automatic reconnection with NextAuth.js session management
- **Gasless Transactions** - Coinbase handles gas fees for improved UX
- **Multi-Device Support** - Same wallet accessible across desktop and mobile

**Security Features**
- Wallet address stored as unique identifier in user database
- No private key management required from users
- Signature-based authentication for API requests
- Automatic session expiration and refresh

## Network Configuration

**Current Network**
| Network | Chain ID | RPC URL | Block Explorer |
|---------|----------|---------|----------------|
| Aeneid (Testnet) | 1315 | https://aeneid.storyrpc.io | https://aeneid.storyscan.io |

**Mainnet (Future)**
| Network | Chain ID | RPC URL | Block Explorer |
|---------|----------|---------|----------------|
| Story Mainnet | 1514 | https://mainnet.storyrpc.io | https://storyscan.io |

**Network Details**
- Native Token: IP (for gas fees)
- License Currency: WIP (Wrapped IP for license fees)
- Block Time: ~2 seconds
- Consensus: Proof of Stake
- EVM Compatible: Yes

## Architecture Highlights

**Property-Based Testing**
- Comprehensive test coverage using Jest and fast-check
- Fuzz testing for license terms, derivative validation, and royalty calculations
- Tests validate critical business logic properties (e.g., "derivative requires parent", "license determines derivative rights")

**Database Design**
- PostgreSQL via Neon serverless platform
- Optimized schema with proper indexing on wallet addresses and IP IDs
- Relationship tracking: User → IPAsset → License → DerivativeRelation
- License template system for bulk operations

**Performance Optimizations**
- Server-side rendering for SEO and initial load performance
- API route caching with rate limiting
- Optimized Prisma queries with selective field loading
- Image optimization via Next.js Image component

## Deployment

**Vercel Deployment**

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in Vercel Dashboard:
```env
DATABASE_URL=postgresql://...
STORY_RPC_URL=https://aeneid.storyrpc.io
STORY_PRIVATE_KEY=0x...
NEXT_PUBLIC_CDP_CLIENT_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.vercel.app
```

3. Deploy:
```bash
vercel deploy --prod
```

**Database Migration**
```bash
npx prisma generate
npx prisma db push
```

## Roadmap

**Phase 1: Core Features (Completed)**
- IP asset registration with PIL terms
- License minting and purchasing
- Derivative work registration
- License template system
- Real-time royalty dashboard
- AI image generation

**Phase 2: Advanced Features (Q1 2025)**
- Batch IP registration
- Multi-chain expansion (Ethereum, Polygon, Base)
- Advanced analytics and insights
- Collaborative IP co-ownership
- Audio and video format support

**Phase 3: Agent Economy (Q2 2025)**
- AI agent SDK for programmatic licensing
- Autonomous license negotiation
- Smart content monitoring and detection
- Predictive pricing via ML models
- Content authenticity verification

**Phase 4: Ecosystem Growth (Q3-Q4 2025)**
- Public IP marketplace with discovery
- Platform integrations (Adobe, Figma, Canva)
- White-label solutions for enterprises
- Legal oracle network for real-world enforcement
- Cross-chain IP portability

## Use Cases

**Digital Artists**
- Register artwork with 10% derivative revenue share
- Automatic royalties when others create remixes or derivative works
- Build passive income as your IP gains cultural impact

**Music Producers**
- License beats with automated royalty splits
- Track sample usage across derivative tracks
- Monetize every downstream use of your compositions

**AI Content Creators**
- Prove authorship of AI-generated content
- Protect creative prompts and outputs
- License AI art for commercial use with clear terms

**Brands & Businesses**
- Manage brand assets with programmatic licensing
- Enable controlled derivative use (e.g., fan art)
- Track usage and ensure compliance automatically

**Developers & AI Agents**
- Programmatic license discovery and negotiation
- Machine-readable terms for autonomous decision-making
- API-first design for integration into AI workflows

## License

MIT License - See LICENSE file for details

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/creatorbridge/issues)
- Discord: [Join our community](https://discord.gg/creatorbridge)
- Email: support@creatorbridge.io

## Acknowledgments

- Built with [Story Protocol](https://www.storyprotocol.xyz/)
- Powered by [Coinbase Smart Wallet](https://www.coinbase.com/wallet)
- Deployed on [Vercel](https://vercel.com)
- Database by [Neon](https://neon.tech)

Made with ❤️ for the creator economy

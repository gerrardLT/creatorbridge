# CreatorBridge

> An IP asset management platform built on Story Protocol, enabling creators to easily register, manage, and license their digital intellectual property.

## Features

- **Coinbase Smart Wallet** - One-click login with Passkey, no extension required
- **IP Asset Registration** - Register creative works on Story Protocol blockchain
- **License Management** - Purchase and manage IP usage licenses
- **Asset Browsing** - Explore and search registered IP assets
- **Personal Dashboard** - View assets, transaction history, and earnings statistics

### New Features ✨

- **AI Video Generation** - Generate real videos using ZhipuAI CogVideoX-3 model
  - Text-to-video generation (5s or 10s clips)
  - Up to 4K resolution support
  - Automatic CORS proxy for video playback
  
- **License Templates** - Save and reuse license configurations
  - Create templates from current license settings
  - Load templates with one click
  - Clear button to reset to defaults
  
- **Advanced Explore Filters** - Enhanced marketplace filtering
  - Filter by license type (All/Non-Commercial/Commercial Use/Commercial Remix)
  - Sort by newest, price, or popularity
  - Custom styled dropdown components
  
- **Draft Auto-Save** - Never lose your work
  - Automatically saves form data to localStorage
  - Recovery modal on page reload
  
- **Video Support in Cards** - Hover-to-play video previews
  - IPCard components detect video URLs
  - Auto-play on hover in explore page
  - Full controls in detail page

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma + PostgreSQL (Neon) |
| Blockchain | Story Protocol (Aeneid Testnet) |
| Wallet | Coinbase Smart Wallet |
| Indexer | Goldsky (Optional) |
| Authentication | NextAuth.js |
| AI Video | ZhipuAI CogVideoX-3 |

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
├── app/                      # Next.js pages
│   ├── page.tsx             # Home page
│   ├── explore/             # Marketplace
│   ├── create/              # Create IP
│   ├── profile/             # User profile
│   ├── ip/[id]/             # IP details
│   └── api/                 # API routes
│       ├── ip/              # IP asset API
│       ├── license/         # License API
│       ├── user/            # User API
│       ├── indexer/         # Indexer API
│       └── auth/            # Authentication API
│
├── components/              # React components
├── context/                 # Global state management
├── lib/                     # Core services
│   ├── story-protocol.ts   # Story Protocol SDK
│   ├── coinbase-wallet.ts  # Coinbase wallet
│   ├── goldsky.ts          # Goldsky indexer
│   ├── auth.ts             # NextAuth config
│   └── db/                 # Database operations
│
├── prisma/                  # Database schema
├── subgraph/                # Goldsky Subgraph (Optional)
└── types/                   # TypeScript types
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ip` | GET | Get IP asset list with filters |
| `/api/ip` | POST | Register new IP asset |
| `/api/ip/[id]` | GET | Get IP details |
| `/api/ip/[id]` | DELETE | Delete IP asset |
| `/api/ip/[id]/related` | GET | Get related IP recommendations |
| `/api/license` | GET | Get user licenses |
| `/api/license` | POST | Purchase license |
| `/api/user` | POST | Create/update user |
| `/api/user` | PATCH | Update user profile |
| `/api/templates` | GET/POST/PUT/DELETE | License template CRUD |
| `/api/ai-video` | POST | Generate AI video (CogVideoX-3) |
| `/api/video-proxy` | GET | Proxy external video URLs |
| `/api/tags` | GET/POST | Tag management |
| `/api/favorites` | GET/POST/DELETE | Favorite IP management |
| `/api/follow` | GET/POST/DELETE | User follow management |
| `/api/transactions` | GET | Transaction history with filters |
| `/api/indexer` | GET | Query indexed data |
| `/api/auth/*` | * | NextAuth authentication |

## Story Protocol Integration

The project integrates Story Protocol SDK, supporting the following on-chain operations:

- **registerIP** - Register IP assets on-chain
- **mintLicense** - Mint license NFTs
- **attachLicenseTerms** - Attach license terms
- **registerDerivative** - Register derivative works

## Wallet Connection

Using Coinbase Smart Wallet, supporting:

- **Passkey Login** - Use Windows Hello / Touch ID / Face ID
- **Mobile Scan** - Scan with Coinbase App to login

## Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Aeneid (Testnet) | 1315 | https://aeneid.storyrpc.io |
| Mainnet | 1514 | https://mainnet.storyrpc.io |

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

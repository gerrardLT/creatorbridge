# CreatorBridge - Smart Contract Addresses

## Network Information

- **Blockchain**: Story Protocol
- **Network**: Aeneid Testnet
- **Chain ID**: 1315
- **RPC URL**: https://aeneid.storyrpc.io
- **Block Explorer**: https://aeneid.storyscan.xyz

---

## Story Protocol Core Contracts (Deployed by Story Protocol)

These are the official Story Protocol contracts that CreatorBridge integrates with:

### 1. IP Asset Registry
**Address**: `0x77319B4031e6eF1250907aa00018B8B1c67a244b`
- **Purpose**: Core contract for IP asset registration and management
- **Function**: 
  - Register new IP assets on-chain
  - Store IP metadata and ownership
  - Track IP lineage and relationships
- **Used By**: `mintAndRegisterIpAssetWithPilTerms()`, `registerDerivative()`
- **Explorer**: https://aeneid.storyscan.xyz/address/0x77319B4031e6eF1250907aa00018B8B1c67a244b

### 2. License Registry
**Address**: `0x529a750E02d8E2f15649c13D69a465286a780e24`
- **Purpose**: Tracks and manages all license terms and minted licenses
- **Function**:
  - Store license term configurations
  - Track minted license NFTs
  - Manage license permissions
- **Used By**: License minting and verification
- **Explorer**: https://aeneid.storyscan.xyz/address/0x529a750E02d8E2f15649c13D69a465286a780e24

### 3. Licensing Module
**Address**: `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f`
- **Purpose**: Handles license creation and NFT minting
- **Function**:
  - Mint license NFT tokens
  - Attach license terms to IPs
  - Execute license transfers
- **Used By**: `mintLicenseTokens()`, `attachLicenseTerms()`
- **Explorer**: https://aeneid.storyscan.xyz/address/0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f

### 4. PIL Template (Programmable IP License)
**Address**: `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316`
- **Purpose**: Defines Programmable IP License (PIL) term templates
- **Function**:
  - Non-Commercial Social Remixing (PIL_FLAVOR: 1)
  - Commercial Use (PIL_FLAVOR: 2)
  - Commercial Remix (PIL_FLAVOR: 3)
- **Used By**: License term configuration
- **Explorer**: https://aeneid.storyscan.xyz/address/0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316

### 5. Royalty Policy LAP (Liquid Absolute Percentage)
**Address**: `0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E`
- **Purpose**: Automated royalty distribution to IP creators
- **Function**:
  - Calculate royalty splits for each sale
  - Distribute funds to original creators
  - Handle revenue share for derivatives (0-100%)
- **Used By**: All commercial license types
- **Explorer**: https://aeneid.storyscan.xyz/address/0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E

### 6. Registration Workflows
**Address**: `0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424`
- **Purpose**: Streamlined registration workflows (SPG - Story Protocol Gateway)
- **Function**:
  - Simplify multi-step registration processes
  - Combine NFT minting + IP registration + License attachment
- **Used By**: SPG collection creation
- **Explorer**: https://aeneid.storyscan.xyz/address/0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424

### 7. WIP Token (Wrapped IP)
**Address**: `0x1514000000000000000000000000000000000000`
- **Purpose**: Native token for license fees and royalties
- **Function**:
  - Pay minting fees for commercial licenses
  - Receive royalty payouts
  - Currency for all license transactions
- **Type**: ERC-20 Token
- **Used By**: All commercial license payments
- **Explorer**: https://aeneid.storyscan.xyz/address/0x1514000000000000000000000000000000000000

---

## CreatorBridge Deployed Collections

### SPG NFT Collections
These collections are created dynamically when users register their first IP:

**Collection Name**: `CreatorBridge IP Collection`
**Symbol**: `CBIP`
**Type**: SPG (Story Protocol Gateway) NFT Collection
**Maximum Supply**: 10,000
**Minting**: Public (enabled)

- Each IP asset gets minted as an NFT in this collection
- NFTs serve as proof of IP ownership
- Each NFT can have multiple license terms attached

**Example**: When a creator registers artwork, the system:
1. Creates/uses an SPG NFT collection
2. Mints an NFT in that collection
3. Registers the NFT as an IP asset
4. Attaches PIL terms to the IP
5. Returns the IP ID and Token ID

---

## Integration Points

### Story Protocol SDK Usage

```typescript
// Example: Register IP with Commercial Remix license
const result = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
  spgNftContract: SPG_COLLECTION_ADDRESS,  // Dynamic SPG collection
  pilType: PILFlavor.COMMERCIAL_REMIX,
  commercialRevShare: 10,  // 10% to original creator
  mintingFee: parseEther("0.01"),  // 0.01 WIP tokens
  currency: WIP_TOKEN_ADDRESS,  // 0x1514...
  royaltyPolicy: ROYALTY_POLICY_LAP,  // 0xBe54...
  recipient: creatorAddress,
  ipMetadata: { name, description, image }
});
```

### Contract Interactions

**Registration Flow**:
```
User Upload
    ↓
[Licensing Module] → Mint NFT in SPG Collection
    ↓
[IP Asset Registry] → Register IP asset
    ↓
[PIL Template] → Configure license terms
    ↓
[License Registry] → Record license configuration
    ↓
[Royalty Policy LAP] → Setup revenue distribution
```

**License Purchase Flow**:
```
User Purchases License
    ↓
[Licensing Module] → Mint License NFT
    ↓
[WIP Token] → Transfer minting fee
    ↓
[Royalty Policy LAP] → Calculate and distribute royalties
    ↓
[License Registry] → Record license ownership
```

**Derivative Registration Flow**:
```
User Creates Derivative
    ↓
[Licensing Module] → Validate parent license allows derivatives
    ↓
[IP Asset Registry] → Register child IP
    ↓
[IP Asset Registry] → Link child to parent (registerDerivative)
    ↓
[License Registry] → Inherit parent license terms
    ↓
[Royalty Policy LAP] → Setup derivative revenue split
```

---

## Contract Verification

All contracts can be verified and viewed on the Story Protocol block explorer:

| Contract | Explorer Link |
|----------|---------------|
| IP Asset Registry | https://aeneid.storyscan.xyz/address/0x77319B4031e6eF1250907aa00018B8B1c67a244b |
| License Registry | https://aeneid.storyscan.xyz/address/0x529a750E02d8E2f15649c13D69a465286a780e24 |
| Licensing Module | https://aeneid.storyscan.xyz/address/0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f |
| PIL Template | https://aeneid.storyscan.xyz/address/0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316 |
| Royalty Policy LAP | https://aeneid.storyscan.xyz/address/0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E |
| Registration Workflows | https://aeneid.storyscan.xyz/address/0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424 |
| WIP Token | https://aeneid.storyscan.xyz/address/0x1514000000000000000000000000000000000000 |

---

## License Types & PIL Flavors

### 1. Non-Commercial (PIL_FLAVOR: 1)
- **Smart Contract**: Non-Commercial Social Remixing
- **Features**:
  - Free to use
  - Derivatives allowed with attribution
  - No commercial use permitted
  - 0% revenue share (N/A for non-commercial)
  - 0 WIP token minting fee

### 2. Commercial Use (PIL_FLAVOR: 2)
- **Smart Contract**: Commercial Use
- **Features**:
  - Paid licensing (customizable fee in WIP)
  - Commercial use permitted
  - Derivatives NOT allowed
  - Revenue share: N/A
  - Minting fee: Creator-defined

### 3. Commercial Remix (PIL_FLAVOR: 3)
- **Smart Contract**: Commercial Remix
- **Features**:
  - Paid licensing (customizable fee in WIP)
  - Commercial use permitted
  - Derivatives ALLOWED with revenue share
  - Revenue share: 0-100% to original creator
  - Minting fee: Creator-defined
  - Uses Royalty Policy LAP for automatic distribution

---

## Transaction Examples

### Example 1: Register IP with Commercial Remix License

**Contracts Involved**:
- IP Asset Registry
- Licensing Module
- PIL Template
- Royalty Policy LAP

**Transaction Details**:
```
Function: mintAndRegisterIpAssetWithPilTerms()
Parameters:
  - spgNftContract: SPG collection address
  - pilType: PIL_FLAVOR.commercialRemix
  - defaultMintingFee: 0.01 WIP (10^16 wei)
  - commercialRevShare: 15 (15% to creator)
  - currency: WIP_TOKEN (0x1514...)
  - royaltyPolicy: ROYALTY_POLICY_LAP (0xBe54...)
  
Returns:
  - ipId: Registered IP ID
  - tokenId: NFT token ID in SPG collection
  - txHash: Transaction hash
```

### Example 2: Purchase License

**Contracts Involved**:
- Licensing Module
- WIP Token (ERC-20 transfer)
- Royalty Policy LAP

**Transaction Details**:
```
Function: mintLicenseTokens()
Parameters:
  - licensorIpId: Original creator's IP
  - licenseTermsId: License configuration ID
  - amount: 1 (one license)
  - receiver: Buyer's wallet address
  
Events:
  - WIP token transfer from buyer to contract
  - LicenseTokensMinted event
  - Royalty distribution triggered
```

### Example 3: Register Derivative

**Contracts Involved**:
- IP Asset Registry
- License Registry
- PIL Template
- Royalty Policy LAP

**Transaction Details**:
```
Function: registerDerivative()
Parameters:
  - childIpId: New derivative IP
  - parentIpIds: [Original creator's IP]
  - licenseTermsIds: License ID from parent
  
Validates:
  - Parent license allows derivatives
  - Child IP exists and is registered
  - Caller has proper license
  
Updates:
  - Parent-child relationship in IP Asset Registry
  - Royalty split configuration in Royalty Policy LAP
  - License terms inheritance in License Registry
```

---

## Environment Variables (for API Integration)

The following environment variables point to these contracts:

```env
# Story Protocol Network
STORY_RPC_URL=https://aeneid.storyrpc.io
STORY_NETWORK_ID=1315

# Contract Addresses (embedded in Story Protocol SDK)
# The SDK automatically uses these contract addresses:
# - IP_ASSET_REGISTRY: 0x77319B4031e6eF1250907aa00018B8B1c67a244b
# - LICENSE_REGISTRY: 0x529a750E02d8E2f15649c13D69a465286a780e24
# - LICENSING_MODULE: 0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f
# - PIL_TEMPLATE: 0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316
# - ROYALTY_POLICY_LAP: 0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E
# - WIP_TOKEN: 0x1514000000000000000000000000000000000000

# Creator private key (for backend operations)
STORY_PRIVATE_KEY=0x...
```

---

## Summary

**Total Contracts Used**: 7
- **7 Story Protocol Core Contracts** (deployed and maintained by Story Protocol)
- **0 Custom Contracts** (CreatorBridge uses Story Protocol's infrastructure)

**Why No Custom Contracts?**
CreatorBridge leverages Story Protocol's complete and mature contract suite. We don't need custom contracts because:
1. IP Asset Registry handles all IP registration and lineage
2. Licensing Module handles all license operations
3. PIL Template provides pre-built license types (Non-Commercial, Commercial Use, Commercial Remix)
4. Royalty Policy LAP handles automated revenue distribution
5. Story Protocol SDK abstracts all complex interactions

**Deployment Status**: ✅ Fully Deployed & Operational
- All contracts are live on Aeneid Testnet
- All transactions verified on block explorer
- Production-ready for IP asset operations

---

**Last Updated**: December 2024  
**Network**: Story Protocol Aeneid Testnet (Chain ID: 1315)  
**Status**: Active & Operational

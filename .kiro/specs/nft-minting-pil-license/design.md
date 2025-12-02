# Design Document: NFT Minting + PIL License

## Overview

本设计文档描述如何为 CreatorBridge 平台实现完整的链上 NFT 铸造和 PIL 许可证功能。核心目标是使用 Story Protocol SPG（Simplified Protocol Gateway）在单次交易中完成 NFT 铸造、IP 资产注册和许可证条款附加。

### 核心流程

```
用户上传作品 → 选择许可证类型 → 配置定价 → 提交交易 → 链上注册完成
```

## Architecture

```mermaid
graph TB
    subgraph Frontend
        CreatePage[Create Page]
        LicenseSelector[License Selector]
        PricingForm[Pricing Form]
    end
    
    subgraph API Layer
        IPRoute[/api/ip]
        LicenseRoute[/api/license]
    end
    
    subgraph Services
        StoryService[Story Protocol Service]
        NFTClient[NFT Client]
        IPAssetClient[IP Asset Client]
        LicenseClient[License Client]
    end
    
    subgraph Story Protocol
        SPG[SPG Gateway]
        PIL[PIL Template]
        Registry[IP Registry]
    end
    
    subgraph Database
        IPAssetTable[IPAsset Table]
        LicenseTable[License Table]
    end
    
    CreatePage --> LicenseSelector
    LicenseSelector --> PricingForm
    PricingForm --> IPRoute
    IPRoute --> StoryService
    StoryService --> NFTClient
    StoryService --> IPAssetClient
    NFTClient --> SPG
    IPAssetClient --> SPG
    SPG --> Registry
    SPG --> PIL
    IPRoute --> IPAssetTable
    LicenseRoute --> LicenseClient
    LicenseClient --> SPG
    LicenseRoute --> LicenseTable
```

## Components and Interfaces

### 1. License Types Enum

```typescript
// lib/types/license.ts
export enum LicenseType {
  NON_COMMERCIAL = 'NON_COMMERCIAL',
  COMMERCIAL_USE = 'COMMERCIAL_USE',
  COMMERCIAL_REMIX = 'COMMERCIAL_REMIX'
}

export interface LicenseConfig {
  type: LicenseType;
  mintingFee?: string;        // ETH amount as string
  commercialRevShare?: number; // 0-100 percentage
}

export interface PILTermsConfig {
  commercialUse: boolean;
  commercialAttribution: boolean;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  commercialRevShare: number;
  defaultMintingFee: bigint;
  currency: Address;
}
```

### 2. Story Protocol Service Enhancement

```typescript
// lib/story-protocol.ts (enhanced)
export interface MintAndRegisterParams {
  spgNftContract?: Address;
  recipient: Address;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: `0x${string}`;
    nftMetadataURI: string;
    nftMetadataHash: `0x${string}`;
  };
}

export interface MintAndRegisterResult {
  success: boolean;
  ipId?: string;
  tokenId?: string;
  txHash?: string;
  licenseTermsIds?: string[];
  spgNftContract?: string;
  error?: string;
}

// Core functions
export async function createSPGCollection(name: string, symbol: string): Promise<{spgNftContract: Address, txHash: string}>
export async function mintAndRegisterIPWithLicense(params: MintAndRegisterParams): Promise<MintAndRegisterResult>
export async function getLicenseTermsFromType(type: LicenseType, mintingFee?: string, revShare?: number): PILTermsConfig
```

### 3. API Route Enhancement

```typescript
// app/api/ip/route.ts (POST body)
interface CreateIPRequest {
  title: string;
  description: string;
  imageUrl: string;
  creatorId: string;
  walletAddress: string;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
}

interface CreateIPResponse {
  asset: IPAsset;
  ipId: string;
  tokenId: string;
  txHash: string;
  licenseTermsIds: string[];
  onChain: boolean;
}
```

### 4. Database Schema Enhancement

```prisma
model IPAsset {
  id              String    @id @default(cuid())
  ipId            String?   @unique
  tokenId         String?
  title           String
  description     String
  imageUrl        String
  priceEth        Float
  txHash          String?
  
  // New license fields
  licenseType     String?   // NON_COMMERCIAL | COMMERCIAL_USE | COMMERCIAL_REMIX
  mintingFee      String?   // Fee in WIP/ETH
  commercialRevShare Int?   // 0-100 percentage
  licenseTermsId  String?   // Story Protocol license terms ID
  spgNftContract  String?   // SPG NFT collection address
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  creatorId       String
  creator         User      @relation(fields: [creatorId], references: [id])
  licenses        License[]
}
```

### 5. Frontend Components

```typescript
// components/LicenseSelector.tsx
interface LicenseSelectorProps {
  value: LicenseType;
  onChange: (type: LicenseType) => void;
}

// components/PricingForm.tsx
interface PricingFormProps {
  licenseType: LicenseType;
  mintingFee: string;
  commercialRevShare: number;
  onMintingFeeChange: (fee: string) => void;
  onRevShareChange: (share: number) => void;
}
```

## Data Models

### License Type to PIL Terms Mapping

| License Type | commercialUse | derivativesAllowed | commercialRevShare | mintingFee |
|--------------|---------------|--------------------|--------------------|------------|
| NON_COMMERCIAL | false | true | 0 | 0 |
| COMMERCIAL_USE | true | false | 0 | user-defined |
| COMMERCIAL_REMIX | true | true | user-defined | user-defined |

### Story Protocol Constants (Aeneid Testnet)

```typescript
export const STORY_CONSTANTS = {
  WIP_TOKEN_ADDRESS: '0x1514000000000000000000000000000000000000',
  ROYALTY_POLICY_LAP: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
  PIL_TEMPLATE: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316',
  IP_ASSET_REGISTRY: '0x77319B4031e6eF1250907aa00018B8B1c67a244b',
  REGISTRATION_WORKFLOWS: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424',
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: License type maps to correct PIL terms

*For any* license type selection (NON_COMMERCIAL, COMMERCIAL_USE, COMMERCIAL_REMIX), the generated PIL terms SHALL have the correct `commercialUse`, `derivativesAllowed`, and `commercialRevShare` values according to the mapping table.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 2: Pricing validation

*For any* minting fee input, the system SHALL accept only positive numbers. *For any* revenue share percentage input, the system SHALL accept only values between 0 and 100 inclusive.

**Validates: Requirements 3.3, 3.4**

### Property 3: Pricing conversion to Story Protocol format

*For any* valid minting fee string (e.g., "0.01"), converting to Story Protocol format and back SHALL produce an equivalent value. The conversion uses `parseEther` for fees and integer representation for percentages.

**Validates: Requirements 3.5**

### Property 4: Metadata construction completeness

*For any* IP registration with title, description, and image, the constructed metadata object SHALL contain all four required fields: `ipMetadataURI`, `ipMetadataHash`, `nftMetadataURI`, and `nftMetadataHash`.

**Validates: Requirements 4.2, 4.3**

### Property 5: Successful registration persists all required data

*For any* successful mint and register transaction, the database record SHALL contain the `ipId`, `tokenId`, `txHash`, `licenseType`, and `licenseTermsId` returned from the blockchain.

**Validates: Requirements 1.3, 2.5**

### Property 6: License display matches stored type

*For any* IP asset with a stored license type, the displayed badge and pricing information SHALL correctly reflect the license type: Non-Commercial shows no pricing, Commercial shows minting fee, Commercial Remix shows both fee and revenue share.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 7: Purchase creates complete records

*For any* successful license purchase, the system SHALL create both a License record (with `licenseTokenId`, `txHash`) and Transaction records for both buyer and creator.

**Validates: Requirements 6.2, 6.4**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Network unavailable | Show error toast, disable submit button |
| Transaction failed | Show error message with retry option |
| Insufficient funds | Show specific error with required amount |
| Invalid metadata | Highlight missing fields, prevent submission |
| SPG collection creation failed | Retry with exponential backoff |

## Testing Strategy

### Unit Testing

使用 Jest 进行单元测试：

1. **License mapping tests** - 验证 `getLicenseTermsFromType` 函数对每种许可证类型返回正确的 PIL 配置
2. **Validation tests** - 验证 `validateMintingFee` 和 `validateRevShare` 函数正确处理边界情况
3. **Metadata construction tests** - 验证 `constructIPMetadata` 函数生成完整的元数据对象

### Property-Based Testing

使用 **fast-check** 库进行属性测试：

1. **License type mapping property** - 生成随机许可证类型，验证输出 PIL 配置符合映射表
2. **Pricing validation property** - 生成随机数值，验证验证函数正确接受/拒绝输入
3. **Pricing conversion round-trip** - 生成随机有效价格，验证转换后再转换回来值相等
4. **Metadata completeness property** - 生成随机标题/描述/图片，验证输出包含所有必需字段
5. **Database persistence property** - 模拟成功交易响应，验证数据库记录包含所有必需字段

### Integration Testing

1. **End-to-end registration flow** - 测试完整的注册流程（需要测试网）
2. **License purchase flow** - 测试许可证购买流程
3. **API route tests** - 测试 API 端点的请求/响应格式

### Test Configuration

```typescript
// Property tests should run minimum 100 iterations
fc.assert(
  fc.property(fc.constantFrom(...Object.values(LicenseType)), (licenseType) => {
    const terms = getLicenseTermsFromType(licenseType);
    // assertions...
  }),
  { numRuns: 100 }
);
```

每个属性测试必须使用注释标注对应的正确性属性：
```typescript
// **Feature: nft-minting-pil-license, Property 1: License type maps to correct PIL terms**
```

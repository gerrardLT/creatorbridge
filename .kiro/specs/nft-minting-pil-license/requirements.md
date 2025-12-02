# Requirements Document

## Introduction

本功能为 CreatorBridge 平台添加完整的链上 NFT 铸造和 PIL（Programmable IP License）许可证功能。用户将能够通过 Story Protocol SPG（Simplified Protocol Gateway）一次性完成 NFT 铸造、IP 资产注册和许可证条款附加，实现真正的链上 IP 资产管理。

## Glossary

- **SPG (Simplified Protocol Gateway)**: Story Protocol 提供的简化网关，允许在单次交易中完成 NFT 铸造和 IP 注册
- **PIL (Programmable IP License)**: Story Protocol 的可编程 IP 许可证系统
- **IP Asset**: 在 Story Protocol 上注册的知识产权资产
- **License Terms**: 定义 IP 使用权限的许可证条款
- **WIP Token**: Story Protocol 的原生代币，用于支付铸造费用和版税
- **SPG NFT Collection**: 通过 SPG 创建的 NFT 合约集合
- **Commercial Rev Share**: 商业收入分成比例

## Requirements

### Requirement 1

**User Story:** As a creator, I want to mint an NFT and register it as an IP asset in a single transaction, so that I can efficiently protect my creative work on-chain.

#### Acceptance Criteria

1. WHEN a creator submits IP registration with valid metadata THEN the System SHALL mint an NFT and register it as an IP asset in a single blockchain transaction
2. WHEN the creator does not have an SPG NFT collection THEN the System SHALL create a new collection before minting
3. WHEN the minting transaction succeeds THEN the System SHALL store the ipId, tokenId, and txHash in the local database
4. WHEN the minting transaction fails THEN the System SHALL display an error message and allow retry
5. IF the blockchain network is unavailable THEN the System SHALL notify the user and prevent submission

### Requirement 2

**User Story:** As a creator, I want to select license terms for my IP asset, so that I can control how others use my work.

#### Acceptance Criteria

1. WHEN a creator registers an IP asset THEN the System SHALL display three license type options: Non-Commercial, Commercial Use, and Commercial Remix
2. WHEN the creator selects Non-Commercial license THEN the System SHALL apply PIL terms with commercialUse=false and derivativesAllowed=true
3. WHEN the creator selects Commercial Use license THEN the System SHALL require a minting fee input and apply PIL terms with commercialUse=true
4. WHEN the creator selects Commercial Remix license THEN the System SHALL require both minting fee and revenue share percentage inputs
5. WHEN license terms are attached THEN the System SHALL store the licenseTermsId in the database

### Requirement 3

**User Story:** As a creator, I want to set pricing for my IP licenses, so that I can monetize my creative work.

#### Acceptance Criteria

1. WHEN a creator selects Commercial Use or Commercial Remix license THEN the System SHALL display a minting fee input field
2. WHEN a creator selects Commercial Remix license THEN the System SHALL display a revenue share percentage input (0-100)
3. WHEN the creator enters a minting fee THEN the System SHALL validate the value is a positive number
4. WHEN the creator enters a revenue share percentage THEN the System SHALL validate the value is between 0 and 100
5. WHEN pricing is configured THEN the System SHALL convert values to the correct format for Story Protocol (parseEther for fees, integer for percentage)

### Requirement 4

**User Story:** As a creator, I want to upload metadata for my IP asset, so that my work is properly described on-chain.

#### Acceptance Criteria

1. WHEN a creator uploads an image file THEN the System SHALL generate a preview and prepare metadata
2. WHEN the creator provides title and description THEN the System SHALL include them in the IP metadata
3. WHEN registering the IP asset THEN the System SHALL construct ipMetadata with ipMetadataURI, ipMetadataHash, nftMetadataURI, and nftMetadataHash
4. WHEN metadata is incomplete THEN the System SHALL prevent submission and highlight missing fields

### Requirement 5

**User Story:** As a user, I want to see the license type of IP assets, so that I can understand the usage terms before purchasing.

#### Acceptance Criteria

1. WHEN displaying an IP asset THEN the System SHALL show the license type badge (Non-Commercial, Commercial, Commercial Remix)
2. WHEN displaying a Commercial or Commercial Remix IP THEN the System SHALL show the minting fee in ETH/WIP
3. WHEN displaying a Commercial Remix IP THEN the System SHALL show the revenue share percentage
4. WHEN a user views IP details THEN the System SHALL display all license terms in a readable format

### Requirement 6

**User Story:** As a buyer, I want to purchase a license for an IP asset, so that I can legally use the creator's work.

#### Acceptance Criteria

1. WHEN a buyer clicks purchase on a Commercial IP THEN the System SHALL initiate a license minting transaction
2. WHEN the license minting succeeds THEN the System SHALL store the license record with licenseTokenId and txHash
3. WHEN the buyer has insufficient funds THEN the System SHALL display an appropriate error message
4. WHEN the purchase completes THEN the System SHALL update the transaction history for both buyer and creator

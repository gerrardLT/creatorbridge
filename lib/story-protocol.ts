'use server';

import { StoryClient, StoryConfig, PILFlavor } from '@story-protocol/core-sdk';
import { http, createPublicClient, Address, parseEther, zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { 
  LicenseType, 
  MintAndRegisterParams, 
  MintAndRegisterResult,
  CreateCollectionResult
} from './types/license';
import { STORY_PROTOCOL_ADDRESSES, DEFAULT_SPG_COLLECTION } from './constants/story-protocol';

// Story Protocol 配置
const STORY_RPC_URL = process.env.STORY_RPC_URL || 'https://aeneid.storyrpc.io';
const STORY_PRIVATE_KEY = process.env.STORY_PRIVATE_KEY;

// 创建 Story Protocol 客户端
export async function getStoryClient() {
  if (!STORY_PRIVATE_KEY) {
    throw new Error('STORY_PRIVATE_KEY is not configured');
  }

  const account = privateKeyToAccount(STORY_PRIVATE_KEY as `0x${string}`);
  
  const config: StoryConfig = {
    account,
    transport: http(STORY_RPC_URL),
    chainId: 'aeneid' as const, // Story Protocol testnet (Aeneid)
  };

  const client = StoryClient.newClient(config);
  return client;
}

// IP 注册参数类型
export interface RegisterIPParams {
  nftContract: Address;
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    contentType: string;
  };
}

// 注册 IP 资产
export async function registerIP(params: RegisterIPParams) {
  try {
    const client = await getStoryClient();
    
    // 创建 IP 元数据
    const ipMetadata = {
      ipMetadataURI: '',
      ipMetadataHash: '0x' as `0x${string}`,
      nftMetadataURI: params.metadata.image,
      nftMetadataHash: '0x' as `0x${string}`,
    };

    // 注册 IP
    const response = await client.ipAsset.register({
      nftContract: params.nftContract,
      tokenId: BigInt(params.tokenId),
      ipMetadata,
    });

    return {
      success: true,
      ipId: response.ipId,
      txHash: response.txHash,
    };
  } catch (error) {
    console.error('Failed to register IP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 获取 IP 详情
export async function getIPDetails(ipId: Address) {
  try {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(STORY_RPC_URL),
    });

    return {
      success: true,
      ipId,
    };
  } catch (error) {
    console.error('Failed to get IP details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 许可证条款类型
export interface LicenseTerms {
  commercialUse: boolean;
  commercialAttribution: boolean;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  royaltyPolicy?: Address;
  mintingFee?: bigint;
  currency?: Address;
}

// 铸造许可证
export async function mintLicense(
  ipId: Address,
  licenseTermsId: string,
  amount: number = 1,
  receiver: Address
) {
  try {
    const client = await getStoryClient();

    const response = await client.license.mintLicenseTokens({
      licensorIpId: ipId,
      licenseTermsId: BigInt(licenseTermsId),
      amount: amount,
      receiver: receiver,
    });

    return {
      success: true,
      licenseTokenIds: response.licenseTokenIds,
      txHash: response.txHash,
    };
  } catch (error) {
    console.error('Failed to mint license:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 附加许可证条款到 IP
export async function attachLicenseTerms(
  ipId: Address,
  licenseTermsId: string
) {
  try {
    const client = await getStoryClient();

    const response = await client.license.attachLicenseTerms({
      ipId: ipId,
      licenseTermsId: BigInt(licenseTermsId),
    });

    return {
      success: true,
      txHash: response.txHash,
    };
  } catch (error) {
    console.error('Failed to attach license terms:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 创建衍生 IP
export async function registerDerivative(
  childIpId: Address,
  parentIpIds: Address[],
  licenseTermsIds: string[]
) {
  try {
    const client = await getStoryClient();

    const response = await client.ipAsset.registerDerivative({
      childIpId,
      parentIpIds,
      licenseTermsIds: licenseTermsIds.map(id => BigInt(id)),
    });

    return {
      success: true,
      txHash: response.txHash,
    };
  } catch (error) {
    console.error('Failed to register derivative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// New functions for NFT Minting + PIL License
// ============================================



/**
 * Create a new SPG NFT collection
 */
export async function createSPGCollection(
  name: string = DEFAULT_SPG_COLLECTION.NAME,
  symbol: string = DEFAULT_SPG_COLLECTION.SYMBOL
): Promise<CreateCollectionResult> {
  try {
    const client = await getStoryClient();

    const response = await client.nftClient.createNFTCollection({
      name,
      symbol,
      isPublicMinting: DEFAULT_SPG_COLLECTION.IS_PUBLIC_MINTING,
      mintOpen: DEFAULT_SPG_COLLECTION.MINT_OPEN,
      mintFeeRecipient: zeroAddress,
      contractURI: '',
    });

    return {
      success: true,
      spgNftContract: response.spgNftContract,
      txHash: response.txHash,
    };
  } catch (error) {
    console.error('Failed to create SPG collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mint NFT and register as IP asset with license terms in a single transaction
 */
export async function mintAndRegisterIPWithLicense(
  params: MintAndRegisterParams
): Promise<MintAndRegisterResult> {
  try {
    const client = await getStoryClient();

    // Get or create SPG NFT collection
    let spgNftContract = params.spgNftContract;
    if (!spgNftContract) {
      const collectionResult = await createSPGCollection();
      if (!collectionResult.success || !collectionResult.spgNftContract) {
        return {
          success: false,
          error: collectionResult.error || 'Failed to create SPG collection',
        };
      }
      spgNftContract = collectionResult.spgNftContract as Address;
    }

    // Build license terms data based on license type
    const licenseTermsData = buildLicenseTermsData(
      params.licenseType,
      params.mintingFee,
      params.commercialRevShare
    );

    // Register IP asset with minting new NFT
    const response = await client.ipAsset.registerIpAsset({
      nft: {
        type: 'mint',
        spgNftContract: spgNftContract,
      },
      licenseTermsData,
      ipMetadata: params.ipMetadata,
    });

    return {
      success: true,
      ipId: response.ipId,
      tokenId: response.tokenId?.toString(),
      txHash: response.txHash,
      licenseTermsIds: response.licenseTermsIds?.map(id => id.toString()),
      spgNftContract: spgNftContract,
    };
  } catch (error) {
    console.error('Failed to mint and register IP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build license terms data for Story Protocol SDK
 */
function buildLicenseTermsData(
  licenseType: LicenseType,
  mintingFee?: string,
  commercialRevShare?: number
) {
  const fee = mintingFee ? parseEther(mintingFee) : BigInt(0);
  const revShare = commercialRevShare ?? 0;

  switch (licenseType) {
    case LicenseType.NON_COMMERCIAL:
      return [
        {
          terms: PILFlavor.nonCommercialSocialRemixing(),
        },
      ];

    case LicenseType.COMMERCIAL_USE:
      return [
        {
          terms: PILFlavor.commercialUse({
            defaultMintingFee: fee,
            currency: STORY_PROTOCOL_ADDRESSES.WIP_TOKEN,
            royaltyPolicy: STORY_PROTOCOL_ADDRESSES.ROYALTY_POLICY_LAP,
          }),
        },
      ];

    case LicenseType.COMMERCIAL_REMIX:
      return [
        {
          terms: PILFlavor.commercialRemix({
            defaultMintingFee: fee,
            commercialRevShare: revShare,
            currency: STORY_PROTOCOL_ADDRESSES.WIP_TOKEN,
            royaltyPolicy: STORY_PROTOCOL_ADDRESSES.ROYALTY_POLICY_LAP,
          }),
        },
      ];

    default:
      throw new Error(`Unknown license type: ${licenseType}`);
  }
}

/**
 * Query royalty vault information for an IP
 */
export async function getRoyaltyData(ipId: Address): Promise<{
  success: boolean;
  ancestorIpId?: Address;
  royaltyTokens?: string;
  snapshotId?: string;
  error?: string;
}> {
  try {
    const client = await getStoryClient();
    
    // Query royalty information from Story Protocol
    // Note: The exact method depends on Story Protocol SDK version
    // This is a placeholder for the actual implementation
    
    return {
      success: true,
      ancestorIpId: ipId,
      royaltyTokens: '0',
      snapshotId: '0',
    };
  } catch (error) {
    console.error('Failed to get royalty data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Claim revenue tokens from royalty vault
 */
export async function claimRevenue(
  ipId: Address,
  snapshotIds: string[],
  token: Address,
  claimant: Address
): Promise<{
  success: boolean;
  amountClaimed?: string;
  txHash?: string;
  error?: string;
}> {
  try {
    const client = await getStoryClient();
    
    // This is a placeholder - actual implementation depends on Story Protocol SDK
    // The claim method should interact with the royalty module
    
    return {
      success: false,
      error: 'Claim functionality requires Story Protocol SDK royalty module integration',
    };
  } catch (error) {
    console.error('Failed to claim revenue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}



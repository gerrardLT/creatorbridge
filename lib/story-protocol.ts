'use server';

import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http, createPublicClient, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// Story Protocol 配置
const STORY_RPC_URL = process.env.STORY_RPC_URL || 'https://testnet.storyrpc.io';
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

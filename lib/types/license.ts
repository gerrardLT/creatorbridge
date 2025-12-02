import { Address } from 'viem';

/**
 * License types supported by the platform
 */
export enum LicenseType {
  NON_COMMERCIAL = 'NON_COMMERCIAL',
  COMMERCIAL_USE = 'COMMERCIAL_USE',
  COMMERCIAL_REMIX = 'COMMERCIAL_REMIX'
}

/**
 * License configuration from user input
 */
export interface LicenseConfig {
  type: LicenseType;
  mintingFee?: string;        // ETH/WIP amount as string (e.g., "0.01")
  commercialRevShare?: number; // 0-100 percentage
}

/**
 * PIL (Programmable IP License) terms configuration
 */
export interface PILTermsConfig {
  commercialUse: boolean;
  commercialAttribution: boolean;
  derivativesAllowed: boolean;
  derivativesAttribution: boolean;
  derivativesReciprocal: boolean;
  commercialRevShare: number;
  defaultMintingFee: bigint;
  currency: Address;
  royaltyPolicy: Address;
}

/**
 * IP Metadata structure for Story Protocol
 */
export interface IPMetadata {
  ipMetadataURI: string;
  ipMetadataHash: `0x${string}`;
  nftMetadataURI: string;
  nftMetadataHash: `0x${string}`;
}

/**
 * Parameters for minting and registering IP with license
 */
export interface MintAndRegisterParams {
  spgNftContract?: Address;
  recipient: Address;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
  ipMetadata: IPMetadata;
}

/**
 * Result from mint and register operation
 */
export interface MintAndRegisterResult {
  success: boolean;
  ipId?: string;
  tokenId?: string;
  txHash?: string;
  licenseTermsIds?: string[];
  spgNftContract?: string;
  error?: string;
}

/**
 * SPG Collection creation result
 */
export interface CreateCollectionResult {
  success: boolean;
  spgNftContract?: string;
  txHash?: string;
  error?: string;
}

/**
 * License type display information
 */
export const LICENSE_TYPE_INFO: Record<LicenseType, { label: string; description: string; color: string }> = {
  [LicenseType.NON_COMMERCIAL]: {
    label: 'Non-Commercial',
    description: 'Free to use for non-commercial purposes. Derivatives allowed with attribution.',
    color: 'emerald'
  },
  [LicenseType.COMMERCIAL_USE]: {
    label: 'Commercial Use',
    description: 'Licensed for commercial use. Pay minting fee to obtain license.',
    color: 'blue'
  },
  [LicenseType.COMMERCIAL_REMIX]: {
    label: 'Commercial Remix',
    description: 'Commercial use with derivatives allowed. Revenue share applies to derivative works.',
    color: 'purple'
  }
};

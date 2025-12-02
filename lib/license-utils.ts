import { parseEther, zeroAddress, toHex } from 'viem';
import { LicenseType, PILTermsConfig, IPMetadata } from './types/license';
import { STORY_PROTOCOL_ADDRESSES } from './constants/story-protocol';

/**
 * Get PIL terms configuration based on license type
 * Maps LicenseType to the correct PIL flavor parameters
 */
export function getLicenseTermsFromType(
  type: LicenseType,
  mintingFee?: string,
  commercialRevShare?: number
): PILTermsConfig {
  const baseFee = mintingFee ? parseEther(mintingFee) : BigInt(0);
  const revShare = commercialRevShare ?? 0;

  switch (type) {
    case LicenseType.NON_COMMERCIAL:
      return {
        commercialUse: false,
        commercialAttribution: false,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        commercialRevShare: 0,
        defaultMintingFee: BigInt(0),
        currency: zeroAddress,
        royaltyPolicy: zeroAddress,
      };

    case LicenseType.COMMERCIAL_USE:
      return {
        commercialUse: true,
        commercialAttribution: true,
        derivativesAllowed: false,
        derivativesAttribution: false,
        derivativesReciprocal: false,
        commercialRevShare: 0,
        defaultMintingFee: baseFee,
        currency: STORY_PROTOCOL_ADDRESSES.WIP_TOKEN,
        royaltyPolicy: STORY_PROTOCOL_ADDRESSES.ROYALTY_POLICY_LAP,
      };

    case LicenseType.COMMERCIAL_REMIX:
      return {
        commercialUse: true,
        commercialAttribution: true,
        derivativesAllowed: true,
        derivativesAttribution: true,
        derivativesReciprocal: true,
        commercialRevShare: revShare,
        defaultMintingFee: baseFee,
        currency: STORY_PROTOCOL_ADDRESSES.WIP_TOKEN,
        royaltyPolicy: STORY_PROTOCOL_ADDRESSES.ROYALTY_POLICY_LAP,
      };

    default:
      throw new Error(`Unknown license type: ${type}`);
  }
}

/**
 * Simple hash function for metadata
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and pad to 32 bytes (64 hex chars)
  const hexHash = Math.abs(hash).toString(16).padStart(64, '0');
  return `0x${hexHash}`;
}

/**
 * Construct IP metadata from user input
 */
export function constructIPMetadata(
  title: string,
  description: string,
  imageUrl: string
): IPMetadata {
  // Create metadata JSON
  const metadataJson = JSON.stringify({
    name: title,
    description: description,
    image: imageUrl,
  });

  // Generate hash using simple hash function (in production, use keccak256)
  const metadataHash = simpleHash(metadataJson) as `0x${string}`;

  return {
    ipMetadataURI: imageUrl, // In production, upload to IPFS
    ipMetadataHash: metadataHash,
    nftMetadataURI: imageUrl,
    nftMetadataHash: metadataHash,
  };
}

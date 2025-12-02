import { Address } from 'viem';

/**
 * Story Protocol contract addresses for Aeneid Testnet
 * @see https://docs.story.foundation/developers/deployed-smart-contracts
 */
export const STORY_PROTOCOL_ADDRESSES = {
  // Protocol Core
  IP_ASSET_REGISTRY: '0x77319B4031e6eF1250907aa00018B8B1c67a244b' as Address,
  LICENSE_REGISTRY: '0x529a750E02d8E2f15649c13D69a465286a780e24' as Address,
  LICENSING_MODULE: '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f' as Address,
  PIL_TEMPLATE: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316' as Address,
  
  // Royalty
  ROYALTY_POLICY_LAP: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E' as Address,
  
  // Protocol Periphery
  REGISTRATION_WORKFLOWS: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424' as Address,
  
  // Tokens
  WIP_TOKEN: '0x1514000000000000000000000000000000000000' as Address,
} as const;

/**
 * Pre-registered license terms IDs
 */
export const PRE_REGISTERED_LICENSE_TERMS = {
  NON_COMMERCIAL_SOCIAL_REMIXING: '1', // Already registered in protocol
} as const;

/**
 * Story Protocol network configuration
 */
export const STORY_NETWORK = {
  CHAIN_ID: 1315,
  NAME: 'Aeneid Testnet',
  RPC_URL: 'https://aeneid.storyrpc.io',
  EXPLORER_URL: 'https://aeneid.storyscan.xyz',
} as const;

/**
 * Default SPG NFT collection settings
 */
export const DEFAULT_SPG_COLLECTION = {
  NAME: 'CreatorBridge IP Collection',
  SYMBOL: 'CBIP',
  MAX_SUPPLY: 10000,
  IS_PUBLIC_MINTING: false,
  MINT_OPEN: true,
} as const;

/**
 * Get Story Protocol explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${STORY_NETWORK.EXPLORER_URL}/tx/${txHash}`;
}

/**
 * Get Story Protocol explorer URL for an IP asset
 */
export function getExplorerIpUrl(ipId: string): string {
  return `${STORY_NETWORK.EXPLORER_URL}/address/${ipId}`;
}

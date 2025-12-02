import { parseEther, formatEther } from 'viem';

/**
 * Validate minting fee input
 * Accepts only positive numbers
 */
export function validateMintingFee(fee: string): boolean {
  if (!fee || fee.trim() === '') {
    return false;
  }
  
  const num = parseFloat(fee);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate revenue share percentage
 * Accepts only values between 0 and 100 inclusive
 */
export function validateRevShare(share: number): boolean {
  return typeof share === 'number' && 
         !isNaN(share) && 
         isFinite(share) && 
         share >= 0 && 
         share <= 100 &&
         Number.isInteger(share);
}

/**
 * Convert fee string to Story Protocol format (bigint)
 * Uses parseEther for conversion
 */
export function convertToStoryFormat(fee: string): bigint {
  if (!validateMintingFee(fee)) {
    throw new Error('Invalid minting fee');
  }
  return parseEther(fee);
}

/**
 * Convert Story Protocol format (bigint) back to string
 * Uses formatEther for conversion
 */
export function convertFromStoryFormat(fee: bigint): string {
  return formatEther(fee);
}

/**
 * Validate complete license configuration
 */
export function validateLicenseConfig(config: {
  licenseType: string;
  mintingFee?: string;
  commercialRevShare?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check license type
  const validTypes = ['NON_COMMERCIAL', 'COMMERCIAL_USE', 'COMMERCIAL_REMIX'];
  if (!validTypes.includes(config.licenseType)) {
    errors.push('Invalid license type');
  }

  // For commercial licenses, validate minting fee
  if (config.licenseType === 'COMMERCIAL_USE' || config.licenseType === 'COMMERCIAL_REMIX') {
    if (config.mintingFee !== undefined && !validateMintingFee(config.mintingFee)) {
      errors.push('Minting fee must be a positive number');
    }
  }

  // For commercial remix, validate revenue share
  if (config.licenseType === 'COMMERCIAL_REMIX') {
    if (config.commercialRevShare !== undefined && !validateRevShare(config.commercialRevShare)) {
      errors.push('Revenue share must be an integer between 0 and 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

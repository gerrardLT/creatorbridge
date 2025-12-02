import prisma from '@/lib/prisma';
import { LicenseType } from '@/lib/types/license';
import { DerivativeValidationResult } from '@/lib/types/derivative';

/**
 * License types that allow derivative works
 */
const DERIVATIVE_ALLOWED_LICENSES = [LicenseType.COMMERCIAL_REMIX];

/**
 * Validate if a derivative can be registered
 */
export async function validateDerivativeRegistration(
  parentIpId: string,
  creatorId: string
): Promise<DerivativeValidationResult> {
  // Check if parent IP exists
  const parentIp = await prisma.iPAsset.findUnique({
    where: { id: parentIpId },
    include: {
      licenses: true,
    }
  });

  if (!parentIp) {
    return {
      valid: false,
      error: 'Parent IP not found',
    };
  }

  // Check if parent IP allows derivatives
  const allowsDerivatives = parentIp.licenseType 
    ? DERIVATIVE_ALLOWED_LICENSES.includes(parentIp.licenseType as LicenseType)
    : false;

  if (!allowsDerivatives) {
    return {
      valid: false,
      error: 'This IP does not allow derivative works. Only Commercial Remix licenses permit derivatives.',
      parentIp,
      allowsDerivatives: false,
    };
  }

  // Check if creator has a license for the parent IP
  // Creator of the parent IP automatically has rights
  if (parentIp.creatorId === creatorId) {
    return {
      valid: true,
      parentIp,
      hasLicense: true,
      allowsDerivatives: true,
    };
  }

  // Check if creator has purchased a license
  const hasLicense = parentIp.licenses.some(
    license => license.buyerId === creatorId
  );

  if (!hasLicense) {
    return {
      valid: false,
      error: 'You need a valid license to create derivatives of this IP',
      parentIp,
      hasLicense: false,
      allowsDerivatives: true,
    };
  }

  return {
    valid: true,
    parentIp,
    hasLicense: true,
    allowsDerivatives: true,
  };
}

/**
 * Check if a license type allows derivatives
 */
export function licenseAllowsDerivatives(licenseType: LicenseType | string | null): boolean {
  if (!licenseType) return false;
  return DERIVATIVE_ALLOWED_LICENSES.includes(licenseType as LicenseType);
}

/**
 * Get license requirements for creating a derivative
 */
export function getDerivativeLicenseRequirements(parentLicenseType: LicenseType | null): {
  requiresLicense: boolean;
  requiresAttribution: boolean;
  requiresRevShare: boolean;
  revSharePercentage?: number;
} {
  if (!parentLicenseType) {
    return {
      requiresLicense: true,
      requiresAttribution: true,
      requiresRevShare: false,
    };
  }

  switch (parentLicenseType) {
    case LicenseType.COMMERCIAL_REMIX:
      return {
        requiresLicense: true,
        requiresAttribution: true,
        requiresRevShare: true,
      };
    default:
      return {
        requiresLicense: true,
        requiresAttribution: true,
        requiresRevShare: false,
      };
  }
}

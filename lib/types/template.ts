import { LicenseType } from './license';

/**
 * Custom PIL terms for advanced license configuration
 */
export interface PILCustomTerms {
  territories?: string[];        // Geographic restrictions
  channels?: string[];           // Distribution channels
  expiration?: string;           // License expiration date (ISO string)
  attribution?: boolean;         // Require attribution
  aiTraining?: boolean;          // Allow AI training use
}

/**
 * License template stored in database
 */
export interface LicenseTemplate {
  id: string;
  userId: string;
  name: string;
  licenseType: LicenseType;
  mintingFee: string | null;
  commercialRevShare: number | null;
  customTerms: PILCustomTerms | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parameters for creating a new license template
 */
export interface CreateTemplateParams {
  userId: string;
  name: string;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
  customTerms?: PILCustomTerms;
}

/**
 * Parameters for updating an existing license template
 */
export interface UpdateTemplateParams {
  name?: string;
  licenseType?: LicenseType;
  mintingFee?: string | null;
  commercialRevShare?: number | null;
  customTerms?: PILCustomTerms | null;
}

/**
 * Template summary for list display
 */
export interface TemplateSummary {
  id: string;
  name: string;
  licenseType: LicenseType;
  mintingFee: string | null;
  commercialRevShare: number | null;
}

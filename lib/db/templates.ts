import prisma from '@/lib/prisma';
import { 
  LicenseTemplate, 
  CreateTemplateParams, 
  UpdateTemplateParams,
  PILCustomTerms 
} from '@/lib/types/template';
import { LicenseType } from '@/lib/types/license';

/**
 * Create a new license template
 */
export async function createTemplate(params: CreateTemplateParams): Promise<LicenseTemplate> {
  const template = await prisma.licenseTemplate.create({
    data: {
      userId: params.userId,
      name: params.name,
      licenseType: params.licenseType,
      mintingFee: params.mintingFee || null,
      commercialRevShare: params.commercialRevShare || null,
      customTerms: params.customTerms ? JSON.stringify(params.customTerms) : null,
    },
  });

  return mapToLicenseTemplate(template);
}

/**
 * Get all templates for a user
 */
export async function getTemplatesByUser(userId: string): Promise<LicenseTemplate[]> {
  const templates = await prisma.licenseTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return templates.map(mapToLicenseTemplate);
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string): Promise<LicenseTemplate | null> {
  const template = await prisma.licenseTemplate.findUnique({
    where: { id },
  });

  return template ? mapToLicenseTemplate(template) : null;
}

/**
 * Get a template by user ID and name
 */
export async function getTemplateByName(
  userId: string, 
  name: string
): Promise<LicenseTemplate | null> {
  const template = await prisma.licenseTemplate.findUnique({
    where: { 
      userId_name: { userId, name } 
    },
  });

  return template ? mapToLicenseTemplate(template) : null;
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  id: string, 
  params: UpdateTemplateParams
): Promise<LicenseTemplate> {
  const updateData: any = {};
  
  if (params.name !== undefined) updateData.name = params.name;
  if (params.licenseType !== undefined) updateData.licenseType = params.licenseType;
  if (params.mintingFee !== undefined) updateData.mintingFee = params.mintingFee;
  if (params.commercialRevShare !== undefined) updateData.commercialRevShare = params.commercialRevShare;
  if (params.customTerms !== undefined) {
    updateData.customTerms = params.customTerms ? JSON.stringify(params.customTerms) : null;
  }

  const template = await prisma.licenseTemplate.update({
    where: { id },
    data: updateData,
  });

  return mapToLicenseTemplate(template);
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    await prisma.licenseTemplate.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a template exists for a user with the given name
 */
export async function templateExists(userId: string, name: string): Promise<boolean> {
  const count = await prisma.licenseTemplate.count({
    where: { userId, name },
  });
  return count > 0;
}

/**
 * Map Prisma model to LicenseTemplate interface
 */
function mapToLicenseTemplate(template: any): LicenseTemplate {
  let customTerms: PILCustomTerms | null = null;
  
  if (template.customTerms) {
    try {
      customTerms = JSON.parse(template.customTerms);
    } catch {
      customTerms = null;
    }
  }

  return {
    id: template.id,
    userId: template.userId,
    name: template.name,
    licenseType: template.licenseType as LicenseType,
    mintingFee: template.mintingFee,
    commercialRevShare: template.commercialRevShare,
    customTerms,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

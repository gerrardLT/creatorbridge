import prisma from '@/lib/prisma';

export async function createLicense(data: {
  ipAssetId: string;
  buyerId: string;
  licenseId?: string;
  txHash?: string;
}) {
  return prisma.license.create({
    data,
    include: { ipAsset: true }
  });
}

export async function findLicensesByBuyer(buyerId: string) {
  return prisma.license.findMany({
    where: { buyerId },
    include: { ipAsset: { include: { creator: true } } },
    orderBy: { purchasedAt: 'desc' }
  });
}

export async function findLicensesByAsset(ipAssetId: string) {
  return prisma.license.findMany({
    where: { ipAssetId },
    orderBy: { purchasedAt: 'desc' }
  });
}

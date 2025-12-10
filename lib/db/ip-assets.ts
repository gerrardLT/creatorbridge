import prisma from '@/lib/prisma';

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export async function findAllIPAssets(options?: {
  search?: string;
  creatorId?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  licenseType?: string;
  sortBy?: SortOption;
  skip?: number;
  take?: number;
}) {
  const where: any = {};

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search } },
      { description: { contains: options.search } }
    ];
  }

  if (options?.creatorId) {
    where.creatorId = options.creatorId;
  }

  if (options?.minPrice !== undefined) {
    where.priceEth = { ...where.priceEth, gte: options.minPrice };
  }

  if (options?.maxPrice !== undefined) {
    where.priceEth = { ...where.priceEth, lte: options.maxPrice };
  }

  if (options?.verified) {
    where.txHash = { not: null };
  }

  if (options?.licenseType) {
    where.licenseType = options.licenseType;
  }

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' };
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { priceEth: 'asc' };
        break;
      case 'price_desc':
        orderBy = { priceEth: 'desc' };
        break;
    }
  }

  const [assets, total] = await Promise.all([
    prisma.iPAsset.findMany({
      where,
      include: { creator: true },
      orderBy,
      skip: options?.skip,
      take: options?.take
    }),
    prisma.iPAsset.count({ where })
  ]);

  return { assets, total };
}

export async function findIPAssetById(id: string) {
  return prisma.iPAsset.findUnique({
    where: { id },
    include: { creator: true, licenses: true }
  });
}

export async function createIPAsset(data: {
  title: string;
  description: string;
  imageUrl: string;
  priceEth: number;
  creatorId: string;
  ipId?: string;
  tokenId?: string;
  txHash?: string;
  // License fields
  licenseType?: string;
  mintingFee?: string;
  commercialRevShare?: number;
  licenseTermsId?: string;
  spgNftContract?: string;
}) {
  return prisma.iPAsset.create({
    data,
    include: { creator: true }
  });
}

export async function updateIPAsset(id: string, data: {
  title?: string;
  description?: string;
  priceEth?: number;
  ipId?: string;
  txHash?: string;
}) {
  return prisma.iPAsset.update({
    where: { id },
    data,
    include: { creator: true }
  });
}

export async function findIPAssetsByCreator(creatorId: string) {
  return prisma.iPAsset.findMany({
    where: { creatorId },
    include: { creator: true },
    orderBy: { createdAt: 'desc' }
  });
}

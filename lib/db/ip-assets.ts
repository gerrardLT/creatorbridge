import prisma from '@/lib/prisma';

export async function findAllIPAssets(options?: {
  search?: string;
  creatorId?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
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

  const [assets, total] = await Promise.all([
    prisma.iPAsset.findMany({
      where,
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
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
  txHash?: string;
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

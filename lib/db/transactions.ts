import prisma from '@/lib/prisma';

export async function createTransaction(data: {
  type: string;
  amount: number;
  txHash: string;
  userId: string;
  assetId?: string;
  assetTitle: string;
}) {
  return prisma.transaction.create({ data });
}

export async function findTransactionsByUser(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function findTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { user: true }
  });
}

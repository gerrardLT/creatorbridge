import prisma from '@/lib/prisma';

export async function findUserByWallet(walletAddress: string) {
  return prisma.user.findUnique({
    where: { walletAddress }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function createUser(data: {
  walletAddress: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}) {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  avatarUrl?: string;
}) {
  return prisma.user.update({
    where: { id },
    data
  });
}

export async function upsertUser(data: {
  walletAddress: string;
  name?: string;
  avatarUrl?: string;
}) {
  return prisma.user.upsert({
    where: { walletAddress: data.walletAddress },
    update: { name: data.name, avatarUrl: data.avatarUrl },
    create: data
  });
}

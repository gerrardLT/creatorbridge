import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const alice = await prisma.user.upsert({
    where: { walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
    update: {},
    create: {
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      name: 'Alice Creator',
      avatarUrl: 'https://picsum.photos/id/64/100/100'
    }
  });

  const bob = await prisma.user.upsert({
    where: { walletAddress: '0xB2C7656EC7ab88b098defB751B7401B5f6d81234' },
    update: {},
    create: {
      walletAddress: '0xB2C7656EC7ab88b098defB751B7401B5f6d81234',
      name: 'Bob Artist',
      avatarUrl: 'https://picsum.photos/id/1005/100/100'
    }
  });

  const charlie = await prisma.user.upsert({
    where: { walletAddress: '0xC3C7656EC7ab88b098defB751B7401B5f6d85678' },
    update: {},
    create: {
      walletAddress: '0xC3C7656EC7ab88b098defB751B7401B5f6d85678',
      name: 'Charlie Design',
      avatarUrl: 'https://picsum.photos/id/1025/100/100'
    }
  });

  const dana = await prisma.user.upsert({
    where: { walletAddress: '0xD4C7656EC7ab88b098defB751B7401B5f6d89012' },
    update: {},
    create: {
      walletAddress: '0xD4C7656EC7ab88b098defB751B7401B5f6d89012',
      name: 'Dana Lens',
      avatarUrl: 'https://picsum.photos/id/1011/100/100'
    }
  });

  console.log('Created users:', { alice: alice.id, bob: bob.id, charlie: charlie.id, dana: dana.id });

  // Create IP assets
  const asset1 = await prisma.iPAsset.upsert({
    where: { ipId: 'ip_seed_1' },
    update: {},
    create: {
      ipId: 'ip_seed_1',
      title: 'Neon Cyberpunk City',
      description: 'A high-resolution concept art piece depicting a futuristic Tokyo. Perfect for sci-fi game backgrounds.',
      imageUrl: 'https://picsum.photos/id/122/800/600',
      priceEth: 0.05,
      txHash: '0x8f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      creatorId: bob.id
    }
  });

  const asset2 = await prisma.iPAsset.upsert({
    where: { ipId: 'ip_seed_2' },
    update: {},
    create: {
      ipId: 'ip_seed_2',
      title: 'Abstract Emotion Series #4',
      description: 'Digital oil painting exploring the concept of melancholy. Registered on Story Protocol for authentic provenance.',
      imageUrl: 'https://picsum.photos/id/104/800/800',
      priceEth: 0.02,
      txHash: '0x9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
      creatorId: charlie.id
    }
  });

  const asset3 = await prisma.iPAsset.upsert({
    where: { ipId: 'ip_seed_3' },
    update: {},
    create: {
      ipId: 'ip_seed_3',
      title: 'Mountain Serenity',
      description: 'Photography captured in the Swiss Alps. High dynamic range. Licensed for commercial advertising.',
      imageUrl: 'https://picsum.photos/id/29/800/600',
      priceEth: 0.08,
      txHash: '0x1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      creatorId: dana.id
    }
  });

  console.log('Created IP assets:', { asset1: asset1.id, asset2: asset2.id, asset3: asset3.id });

  // Create a sample transaction
  await prisma.transaction.create({
    data: {
      type: 'PURCHASE',
      amount: 0.08,
      txHash: '0x1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      userId: alice.id,
      assetId: asset3.id,
      assetTitle: 'Mountain Serenity'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

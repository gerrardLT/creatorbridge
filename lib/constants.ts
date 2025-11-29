import { IPAsset } from '@/types';

export const MOCK_USER = {
  id: 'u_1',
  name: 'Alice Creator',
  walletAddress: '0x71C...9A23',
  avatarUrl: 'https://picsum.photos/id/64/100/100'
};

export const INITIAL_IPS: IPAsset[] = [
  {
    id: 'ip_1',
    title: 'Neon Cyberpunk City',
    description: 'A high-resolution concept art piece depicting a futuristic Tokyo. Perfect for sci-fi game backgrounds.',
    imageUrl: 'https://picsum.photos/id/122/800/600',
    creator: {
      id: 'u_2',
      name: 'Bob Artist',
      walletAddress: '0xB2...1234',
      avatarUrl: 'https://picsum.photos/id/1005/100/100'
    },
    priceEth: 0.05,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    txHash: '0x8f2...3a1'
  },
  {
    id: 'ip_2',
    title: 'Abstract Emotion Series #4',
    description: 'Digital oil painting exploring the concept of melancholy. Registered on Story Protocol for authentic provenance.',
    imageUrl: 'https://picsum.photos/id/104/800/800',
    creator: {
      id: 'u_3',
      name: 'Charlie Design',
      walletAddress: '0xC3...5678',
      avatarUrl: 'https://picsum.photos/id/1025/100/100'
    },
    priceEth: 0.02,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    txHash: '0x9d1...2b4'
  },
  {
    id: 'ip_3',
    title: 'Mountain Serenity',
    description: 'Photography captured in the Swiss Alps. High dynamic range. Licensed for commercial advertising.',
    imageUrl: 'https://picsum.photos/id/29/800/600',
    creator: {
      id: 'u_4',
      name: 'Dana Lens',
      walletAddress: '0xD4...9012',
      avatarUrl: 'https://picsum.photos/id/1011/100/100'
    },
    priceEth: 0.08,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    txHash: '0x1c4...5e9'
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_init_1',
    type: 'PURCHASE' as const,
    assetId: 'ip_3',
    assetTitle: 'Mountain Serenity',
    amount: 0.08,
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    hash: '0x1c4...5e9',
    otherParty: 'Dana Lens'
  }
];

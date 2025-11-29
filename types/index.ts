export interface User {
  id: string;
  name: string;
  walletAddress: string;
  avatarUrl: string;
}

export interface IPAsset {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creator: User;
  priceEth: number;
  createdAt: string;
  txHash?: string;
}

export interface Transaction {
  id: string;
  type: 'PURCHASE' | 'SALE' | 'REGISTER';
  assetId: string;
  assetTitle: string;
  amount: number;
  date: string;
  hash: string;
  otherParty?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, IPAsset, Notification, Transaction } from '@/types';
import { connectWallet, disconnectWallet, getConnectedAddress } from '@/lib/coinbase-wallet';

interface AppContextType {
  user: User | null;
  ips: IPAsset[];
  transactions: Transaction[];
  isLoading: boolean;
  notifications: Notification[];
  isConnected: boolean;
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => void;
  registerIP: (title: string, description: string, price: number, imageUrl: string) => Promise<void>;
  buyLicense: (ipId: string) => Promise<void>;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  refreshIPs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ips, setIps] = useState<IPAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const refreshIPs = async () => {
    try {
      const res = await fetch('/api/ip');
      const data = await res.json();
      if (data.assets) {
        setIps(data.assets);
      }
    } catch (error) {
      console.error('Failed to fetch IPs:', error);
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      const res = await fetch(`/api/transactions?userId=${userId}`);
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const syncUserWithWallet = async (address: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          name: `User_${address.substring(0, 6)}`,
          avatarUrl: `https://picsum.photos/seed/${address}/100/100`
        })
      });

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        await fetchTransactions(data.user.id);
      }
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  };

  // Load IPs on mount
  useEffect(() => {
    refreshIPs();
  }, []);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const address = await getConnectedAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        await syncUserWithWallet(address);
      }
    };
    checkConnection();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        await syncUserWithWallet(address);
        addNotification('success', 'Wallet connected successfully');
      } else {
        addNotification('error', 'Failed to connect wallet');
      }
    } catch (error) {
      addNotification('error', 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    disconnectWallet();
    setWalletAddress(null);
    setIsConnected(false);
    setUser(null);
    setTransactions([]);
    addNotification('info', 'Wallet disconnected');
  };

  const registerIP = async (title: string, description: string, price: number, imageUrl: string) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priceEth: price,
          imageUrl,
          creatorId: user.id
        })
      });

      const data = await res.json();
      
      if (res.ok && data.asset) {
        await refreshIPs();
        await fetchTransactions(user.id);
        addNotification('success', 'IP Registered on Story Protocol successfully!');
      } else {
        throw new Error(data.error || 'Failed to register IP');
      }
    } catch (error) {
      addNotification('error', 'Failed to register IP');
    } finally {
      setIsLoading(false);
    }
  };

  const buyLicense = async (ipId: string) => {
    if (!user) {
      addNotification('error', 'Please connect wallet to purchase');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAssetId: ipId,
          buyerId: user.id
        })
      });

      const data = await res.json();
      
      if (res.ok && data.license) {
        await fetchTransactions(user.id);
        addNotification('success', 'License acquired! Transaction confirmed.');
      } else {
        throw new Error(data.error || 'Failed to purchase license');
      }
    } catch (error) {
      addNotification('error', 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        ips,
        transactions,
        isLoading,
        notifications,
        isConnected,
        walletAddress,
        login,
        logout,
        registerIP,
        buyLicense,
        addNotification,
        refreshIPs
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

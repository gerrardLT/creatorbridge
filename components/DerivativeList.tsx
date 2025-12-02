'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitBranch, Loader2, ExternalLink } from 'lucide-react';

interface Derivative {
  id: string;
  childIpId: string;
  registeredAt: string;
  derivative: {
    id: string;
    title: string;
    imageUrl: string;
    creator: {
      name: string | null;
      walletAddress: string;
      avatarUrl: string | null;
    };
  };
}

interface DerivativeListProps {
  ipId: string;
}

export default function DerivativeList({ ipId }: DerivativeListProps) {
  const [derivatives, setDerivatives] = useState<Derivative[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDerivatives();
  }, [ipId]);

  const fetchDerivatives = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/derivatives/${ipId}`);
      const data = await res.json();
      if (data.derivatives) {
        setDerivatives(data.derivatives);
        setCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch derivatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (derivatives.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">No derivative works yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          Derivative Works
        </h3>
        <span className="text-sm text-zinc-500">{count} derivative{count !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-3">
        {derivatives.map((item) => (
          <Link
            key={item.id}
            href={`/ip/${item.derivative.id}`}
            className="flex items-center gap-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-purple-500/50 transition-colors group"
          >
            <img
              src={item.derivative.imageUrl}
              alt={item.derivative.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                {item.derivative.title}
              </h4>
              <p className="text-sm text-zinc-500">
                by {item.derivative.creator.name || item.derivative.creator.walletAddress.slice(0, 8)}...
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {new Date(item.registeredAt).toLocaleDateString()}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

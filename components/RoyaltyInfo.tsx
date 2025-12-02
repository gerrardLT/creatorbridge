'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Users, GitBranch, Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface RoyaltyData {
  ipId: string;
  ipIdOnChain?: string | null;
  revSharePercentage: number;
  totalLicensesSold: number;
  derivativeCount: number;
  accumulatedRoyalties: string;
  currency: string;
  onChainDataAvailable?: boolean;
  breakdown: {
    directLicenses: number;
    derivativeRoyalties: number;
  };
  derivatives?: Array<{
    childIpId: string;
    registeredAt: string;
    txHash?: string | null;
  }>;
}

interface RoyaltyInfoProps {
  ipId: string;
}

export default function RoyaltyInfo({ ipId }: RoyaltyInfoProps) {
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoyaltyData();
  }, [ipId]);

  const fetchRoyaltyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/royalties/${ipId}`);
      const data = await res.json();
      if (data.royaltyData) {
        setRoyaltyData(data.royaltyData);
      }
    } catch (error) {
      console.error('Failed to fetch royalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!royaltyData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-400" />
            Royalty Information
          </h3>
          {royaltyData.onChainDataAvailable !== undefined && (
            <div className="flex items-center gap-1.5 text-xs">
              {royaltyData.onChainDataAvailable ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-medium">On-Chain Data</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Local Estimate</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Revenue Share */}
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Revenue Share
            </div>
            <p className="text-2xl font-bold text-white">
              {royaltyData.revSharePercentage}%
            </p>
          </div>

          {/* Licenses Sold */}
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              Licenses Sold
            </div>
            <p className="text-2xl font-bold text-white">
              {royaltyData.totalLicensesSold}
            </p>
          </div>

          {/* Derivatives */}
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <GitBranch className="w-4 h-4" />
              Derivatives
            </div>
            <p className="text-2xl font-bold text-white">
              {royaltyData.derivativeCount}
            </p>
          </div>

          {/* Accumulated Royalties */}
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Coins className="w-4 h-4" />
              Total Earned
            </div>
            <p className="text-2xl font-bold text-indigo-400">
              {royaltyData.accumulatedRoyalties} {royaltyData.currency}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        {(royaltyData.breakdown.directLicenses > 0 || royaltyData.breakdown.derivativeRoyalties > 0) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-zinc-400 mb-2">Revenue Breakdown</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Direct Licenses</span>
                <span className="text-white font-medium">{royaltyData.breakdown.directLicenses}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Derivative Royalties</span>
                <span className="text-indigo-400 font-medium">
                  {royaltyData.breakdown.derivativeRoyalties.toFixed(4)} {royaltyData.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {royaltyData.derivativeCount > 0 && (
          <p className="text-xs text-zinc-500 mt-4">
            🔗 Royalties from derivative works are automatically distributed via Story Protocol
          </p>
        )}
      </div>

      {/* Derivatives List */}
      {royaltyData.derivatives && royaltyData.derivatives.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            Derivative Works ({royaltyData.derivatives.length})
          </h4>
          <div className="space-y-2">
            {royaltyData.derivatives.map((derivative, index) => (
              <div 
                key={derivative.childIpId} 
                className="bg-zinc-800/30 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-400">Derivative #{index + 1}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {derivative.childIpId.slice(0, 8)}...{derivative.childIpId.slice(-6)}
                    </p>
                  </div>
                  {derivative.txHash && (
                    <a
                      href={`https://aeneid.storyscan.xyz/tx/${derivative.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      title="View on Explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  Registered: {new Date(derivative.registeredAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

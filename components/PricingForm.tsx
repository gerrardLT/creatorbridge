'use client';

import { LicenseType } from '@/lib/types/license';
import { validateMintingFee, validateRevShare } from '@/lib/validation';
import { DollarSign, Percent, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PricingFormProps {
  licenseType: LicenseType;
  mintingFee: string;
  commercialRevShare: number;
  onMintingFeeChange: (fee: string) => void;
  onRevShareChange: (share: number) => void;
}

export default function PricingForm({
  licenseType,
  mintingFee,
  commercialRevShare,
  onMintingFeeChange,
  onRevShareChange,
}: PricingFormProps) {
  const [feeError, setFeeError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const showMintingFee = licenseType === LicenseType.COMMERCIAL_USE || 
                         licenseType === LicenseType.COMMERCIAL_REMIX;
  const showRevShare = licenseType === LicenseType.COMMERCIAL_REMIX;

  // Validate minting fee
  useEffect(() => {
    if (showMintingFee && mintingFee) {
      if (!validateMintingFee(mintingFee)) {
        setFeeError('Please enter a valid positive number');
      } else {
        setFeeError(null);
      }
    } else {
      setFeeError(null);
    }
  }, [mintingFee, showMintingFee]);

  // Validate revenue share
  useEffect(() => {
    if (showRevShare) {
      if (!validateRevShare(commercialRevShare)) {
        setShareError('Must be a whole number between 0 and 100');
      } else {
        setShareError(null);
      }
    } else {
      setShareError(null);
    }
  }, [commercialRevShare, showRevShare]);

  if (licenseType === LicenseType.NON_COMMERCIAL) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-sm text-emerald-400">
          Non-commercial licenses are free. Users can use your work for non-commercial purposes with attribution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Minting Fee */}
      {showMintingFee && (
        <div className="space-y-2 group">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Minting Fee (WIP)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign 
                size={18} 
                className={`transition-colors ${feeError ? 'text-red-500' : 'text-zinc-600 group-focus-within:text-blue-500'}`} 
              />
            </div>
            <input
              type="number"
              step="0.001"
              min="0"
              value={mintingFee}
              onChange={(e) => onMintingFeeChange(e.target.value)}
              className={`
                block w-full pl-11 pr-16 py-4 bg-zinc-900/50 border rounded-xl 
                text-white placeholder-zinc-600 transition-all focus:bg-black font-mono text-lg
                ${feeError 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                  : 'border-zinc-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
                }
              `}
              placeholder="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-zinc-500 font-bold">WIP</span>
            </div>
          </div>
          {feeError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              <span>{feeError}</span>
            </div>
          )}
          <p className="text-xs text-zinc-500">
            The fee users pay to mint a license for your IP
          </p>
        </div>
      )}

      {/* Revenue Share */}
      {showRevShare && (
        <div className="space-y-2 group">
          <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            Revenue Share
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Percent 
                size={18} 
                className={`transition-colors ${shareError ? 'text-red-500' : 'text-zinc-600 group-focus-within:text-purple-500'}`} 
              />
            </div>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={commercialRevShare}
              onChange={(e) => onRevShareChange(parseInt(e.target.value) || 0)}
              className={`
                block w-full pl-11 pr-12 py-4 bg-zinc-900/50 border rounded-xl 
                text-white placeholder-zinc-600 transition-all focus:bg-black font-mono text-lg
                ${shareError 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                  : 'border-zinc-800 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500'
                }
              `}
              placeholder="10"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-zinc-500 font-bold">%</span>
            </div>
          </div>
          {shareError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              <span>{shareError}</span>
            </div>
          )}
          <p className="text-xs text-zinc-500">
            Percentage of revenue from derivative works you'll receive
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
        <h4 className="text-sm font-bold text-zinc-300">License Summary</h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Commercial use: <span className="text-white">Allowed</span></li>
          {showRevShare ? (
            <>
              <li>• Derivatives: <span className="text-white">Allowed</span></li>
              <li>• Revenue share: <span className="text-purple-400">{commercialRevShare}%</span></li>
            </>
          ) : (
            <li>• Derivatives: <span className="text-zinc-500">Not allowed</span></li>
          )}
          <li>• Minting fee: <span className="text-blue-400">{mintingFee || '0'} WIP</span></li>
        </ul>
      </div>
    </div>
  );
}

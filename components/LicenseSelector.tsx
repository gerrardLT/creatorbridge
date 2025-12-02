'use client';

import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';
import { Shield, DollarSign, GitBranch } from 'lucide-react';

interface LicenseSelectorProps {
  value: LicenseType;
  onChange: (type: LicenseType) => void;
}

const ICONS = {
  [LicenseType.NON_COMMERCIAL]: Shield,
  [LicenseType.COMMERCIAL_USE]: DollarSign,
  [LicenseType.COMMERCIAL_REMIX]: GitBranch,
};

const COLORS = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    borderActive: 'border-emerald-500',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/50',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    borderActive: 'border-blue-500',
    text: 'text-blue-400',
    ring: 'ring-blue-500/50',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    borderActive: 'border-purple-500',
    text: 'text-purple-400',
    ring: 'ring-purple-500/50',
  },
};

export default function LicenseSelector({ value, onChange }: LicenseSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
        License Type
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(LicenseType).map((type) => {
          const info = LICENSE_TYPE_INFO[type];
          const Icon = ICONS[type];
          const colors = COLORS[info.color as keyof typeof COLORS];
          const isSelected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `${colors.borderActive} ${colors.bg} ring-2 ${colors.ring}` 
                  : `border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900`
                }
              `}
            >
              <div className="flex flex-col items-start text-left space-y-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? colors.bg : 'bg-zinc-800'}
                `}>
                  <Icon 
                    size={20} 
                    className={isSelected ? colors.text : 'text-zinc-500'} 
                  />
                </div>
                <div>
                  <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {info.label}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {info.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

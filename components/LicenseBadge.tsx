'use client';

import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';
import { Shield, DollarSign, GitBranch } from 'lucide-react';

interface LicenseBadgeProps {
  licenseType?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ICONS = {
  [LicenseType.NON_COMMERCIAL]: Shield,
  [LicenseType.COMMERCIAL_USE]: DollarSign,
  [LicenseType.COMMERCIAL_REMIX]: GitBranch,
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const ICON_SIZES = {
  sm: 10,
  md: 12,
  lg: 14,
};

export default function LicenseBadge({ 
  licenseType, 
  size = 'sm',
  showIcon = true 
}: LicenseBadgeProps) {
  // Default to NON_COMMERCIAL if not specified
  const type = (licenseType as LicenseType) || LicenseType.NON_COMMERCIAL;
  const info = LICENSE_TYPE_INFO[type] || LICENSE_TYPE_INFO[LicenseType.NON_COMMERCIAL];
  const Icon = ICONS[type] || Shield;

  const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const colors = colorClasses[info.color as keyof typeof colorClasses] || colorClasses.emerald;

  return (
    <span className={`
      inline-flex items-center space-x-1 font-bold rounded-full border
      ${SIZES[size]}
      ${colors}
    `}>
      {showIcon && <Icon size={ICON_SIZES[size]} />}
      <span>{info.label}</span>
    </span>
  );
}

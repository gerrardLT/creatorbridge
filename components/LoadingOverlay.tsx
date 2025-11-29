'use client';

import { useApp } from '@/context/AppContext';

export function LoadingOverlay() {
  const { isLoading } = useApp();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-white font-medium">Processing...</p>
      </div>
    </div>
  );
}

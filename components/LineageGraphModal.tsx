'use client';

import { useRouter } from 'next/navigation';
import { X, Maximize2 } from 'lucide-react';
import LineageGraph from './LineageGraph';

interface LineageGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipId: string;
  ipTitle: string;
}

export default function LineageGraphModal({ 
  isOpen, 
  onClose, 
  ipId, 
  ipTitle 
}: LineageGraphModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNodeClick = (nodeId: string) => {
    if (nodeId !== ipId) {
      onClose();
      router.push(`/ip/${nodeId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-[90vw] h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Maximize2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">IP Lineage Graph</h3>
              <p className="text-sm text-zinc-500">{ipTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Graph */}
        <div className="h-[calc(100%-80px)]">
          <LineageGraph ipId={ipId} onNodeClick={handleNodeClick} />
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-lg p-3">
          <p className="text-xs text-zinc-400 mb-2">Legend</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500/50 border border-purple-500" />
              <span className="text-zinc-300">Parent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500/50 border border-indigo-500" />
              <span className="text-zinc-300">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/50 border border-green-500" />
              <span className="text-zinc-300">Derivative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

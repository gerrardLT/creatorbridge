'use client';

import Link from 'next/link';
import { IPAsset } from '@/types';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

interface IPCardProps {
  asset: IPAsset;
}

export function IPCard({ asset }: IPCardProps) {
  return (
    <Link 
      href={`/ip/${asset.id}`}
      className="group relative bg-zinc-900/60 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-lg transition-all duration-500 cursor-pointer h-full flex flex-col hover:border-indigo-500/30 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] hover:-translate-y-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        <img 
          src={asset.imageUrl} 
          alt={asset.title} 
          className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            target.previousElementSibling?.remove();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-20" />
        
        <div className="absolute bottom-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            View Details
          </span>
        </div>

        <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1 border border-white/10 shadow-lg">
          <ShieldCheck size={10} className="text-emerald-400" />
          <span className="tracking-wider">VERIFIED</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-white line-clamp-1 text-lg group-hover:text-indigo-400 transition-colors">{asset.title}</h3>
        </div>
        
        <p className="text-zinc-400 text-sm line-clamp-2 mb-4 leading-relaxed font-light">
          {asset.description}
        </p>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2 group/creator">
            {asset.creator.avatarUrl ? (
              <img src={asset.creator.avatarUrl} className="w-6 h-6 rounded-full ring-2 ring-black group-hover/creator:ring-indigo-500 transition-all" alt="Creator" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                <UserIcon size={12} className="text-zinc-500" />
              </div>
            )}
            <span className="text-xs font-medium text-zinc-500 truncate max-w-[100px] group-hover/creator:text-indigo-400 transition-colors">{asset.creator.name}</span>
          </div>
          <span className="bg-white/5 border border-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold font-mono group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-all">
            {asset.priceEth} ETH
          </span>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Share2, Shield, CheckCircle2, Copy, Cpu, Zap } from 'lucide-react';

export default function IPDetailsPage() {
  const params = useParams();
  const { ips, buyLicense, user } = useApp();
  
  const asset = ips.find(ip => ip.id === params.id);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-white">
        <p className="text-zinc-500 mb-4">Asset not found.</p>
        <Link href="/explore" className="text-indigo-400 font-medium hover:text-white transition-colors">
          Return to Base
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-black/60 z-10" />
         <img src={asset.imageUrl} className="w-full h-full object-cover blur-[80px] opacity-40 scale-110" alt="Background" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-20" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <Link href="/explore" className="flex items-center text-zinc-400 hover:text-white transition-colors mb-8 group bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 w-fit">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Explore</span>
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8 animate-fadeInUp">
             <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group bg-zinc-900">
                <img src={asset.imageUrl} alt={asset.title} className="w-full h-auto object-cover" />
                <div className="absolute top-4 right-4 flex space-x-2">
                   <button className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white hover:text-black transition-colors">
                      <Share2 size={18} />
                   </button>
                </div>
             </div>

             <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Cpu className="mr-3 text-indigo-400" size={20} /> 
                  Asset Metadata
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Standard</span>
                      <span className="font-mono text-sm">ERC-721 / Story Protocol</span>
                   </div>
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Created</span>
                      <span className="font-mono text-sm">{new Date(asset.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="col-span-2 bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-colors">
                      <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Transaction Hash</span>
                        <span className="font-mono text-sm text-zinc-300">{asset.txHash || 'Pending...'}</span>
                      </div>
                      <Copy size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
             <div>
                <div className="flex items-center space-x-3 mb-4">
                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center">
                      <Shield size={12} className="mr-1.5" /> VERIFIED ASSET
                   </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{asset.title}</h1>
                <div className="flex items-center space-x-3">
                   <img src={asset.creator.avatarUrl} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                   <span className="text-zinc-400">Created by <span className="text-white font-bold">{asset.creator.name}</span></span>
                </div>
             </div>

             <div className="prose prose-invert">
                <p className="text-zinc-300 text-lg leading-relaxed">{asset.description}</p>
             </div>

             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                   <div className="bg-white/5 border-b border-white/5 p-6 flex justify-between items-center">
                      <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest">Commercial License</span>
                      <Zap className="text-yellow-400 fill-yellow-400" size={18} />
                   </div>
                   <div className="p-8 space-y-6">
                      <div className="flex flex-col space-y-4">
                         <div className="flex items-start">
                            <CheckCircle2 size={20} className="text-indigo-400 mr-3 mt-0.5 shrink-0" />
                            <div>
                               <span className="text-white font-medium block">Global Commercial Rights</span>
                               <span className="text-zinc-500 text-sm">Unlimited usage in digital and physical media.</span>
                            </div>
                         </div>
                         <div className="flex items-start">
                            <CheckCircle2 size={20} className="text-indigo-400 mr-3 mt-0.5 shrink-0" />
                            <div>
                               <span className="text-white font-medium block">AI Remixing Permitted</span>
                               <span className="text-zinc-500 text-sm">Approved for training and derivative generation.</span>
                            </div>
                         </div>
                      </div>
                      <div className="h-px bg-white/10 w-full my-6 flex items-center justify-center">
                         <div className="bg-zinc-900 px-3 text-zinc-500 text-xs uppercase tracking-widest">Pricing</div>
                      </div>
                      <div className="flex items-end justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm text-zinc-500">One-time payment</span>
                            <span className="text-4xl font-bold text-white tracking-tight">{asset.priceEth} ETH</span>
                         </div>
                      </div>
                      {user && user.id === asset.creator.id ? (
                         <div className="w-full py-4 bg-zinc-800 text-zinc-400 font-medium text-lg rounded-xl flex items-center justify-center border border-zinc-700">
                            <Shield size={20} className="mr-2" />
                            <span>This is your IP</span>
                         </div>
                      ) : (
                         <button onClick={() => buyLicense(asset.id)} className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center">
                            <span>Purchase License</span>
                            <ArrowLeft className="ml-2 rotate-180" size={20} />
                         </button>
                      )}
                      {!user && <p className="text-center text-xs text-red-400">Wallet connection required</p>}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

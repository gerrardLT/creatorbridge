'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { IPCard } from '@/components/IPCard';
import { User, Wallet, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, Layers, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { user, ips, transactions, login } = useApp();
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#050505] text-white pt-20">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 text-center max-w-md animate-fadeInUp">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <User size={32} className="text-zinc-400" />
           </div>
           <h2 className="text-2xl font-bold mb-2">Guest Access</h2>
           <p className="text-zinc-500 mb-6">Connect your wallet to access your creator dashboard.</p>
           <button onClick={login} className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors">
             Connect Wallet
           </button>
        </div>
      </div>
    );
  }

  const myIPs = ips.filter(ip => ip.creator.id === user.id);
  const myTransactions = transactions;
  
  // 计算真实的交易量
  const totalVolume = myTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20">
      <div className="h-64 w-full bg-[#0a0a0a] relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 mix-blend-screen" />
         <div className="absolute inset-0 grid-bg opacity-30" />
         <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-glow"></div>
         <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl animate-fadeInUp">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
             <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#050505] shadow-xl">
                   <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border border-zinc-800">
                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                </div>
             </div>
             
             <div className="flex-grow text-center md:text-left mb-2">
                <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-zinc-400">
                   <span className="font-mono bg-black/40 px-3 py-1 rounded-lg border border-white/5 flex items-center">
                      <Wallet size={14} className="mr-2" />
                      {user.walletAddress}
                   </span>
                   <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white" title="Copy">
                      <Copy size={14} />
                   </button>
                </div>
             </div>

             <div className="flex gap-4">
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl min-w-[140px] backdrop-blur-sm">
                   <div className="flex items-center space-x-2 text-zinc-500 mb-1 text-xs font-bold uppercase tracking-wider">
                      <Layers size={14} />
                      <span>Assets</span>
                   </div>
                   <div className="text-2xl font-bold text-white">{myIPs.length}</div>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl min-w-[140px] backdrop-blur-sm">
                   <div className="flex items-center space-x-2 text-zinc-500 mb-1 text-xs font-bold uppercase tracking-wider">
                      <Activity size={14} />
                      <span>Volume</span>
                   </div>
                   <div className="text-2xl font-bold text-white">{totalVolume.toFixed(2)} ETH</div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex space-x-8 border-b border-white/10 mb-8 px-4">
           <button onClick={() => setActiveTab('assets')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'assets' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
             My Assets
           </button>
           <button onClick={() => setActiveTab('history')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'history' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
             Ledger
           </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'assets' ? (
            <div className="animate-fadeInUp">
              {myIPs.length === 0 ? (
                 <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 mb-6">No assets registered yet.</p>
                    <Link href="/create" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white font-bold transition-all inline-block">
                      Create First Asset
                    </Link>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {myIPs.map((ip) => (
                      <IPCard key={ip.id} asset={ip} />
                    ))}
                 </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/30 rounded-3xl border border-white/5 overflow-hidden animate-fadeInUp">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {myTransactions.map((tx) => (
                       <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                         <td className="px-6 py-4">
                           <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${tx.type === 'REGISTER' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : tx.type === 'PURCHASE' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                             {tx.type === 'REGISTER' && <ArrowUpRight size={12} className="mr-1.5" />}
                             {tx.type === 'PURCHASE' && <ArrowDownLeft size={12} className="mr-1.5" />}
                             {tx.type}
                           </div>
                         </td>
                         <td className="px-6 py-4 font-medium text-white group-hover:text-indigo-300 transition-colors">{tx.assetTitle}</td>
                         <td className="px-6 py-4 font-mono text-zinc-400">{tx.amount > 0 ? `${tx.amount} ETH` : '-'}</td>
                         <td className="px-6 py-4 text-zinc-500 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_#10b981]"></div>
                              <span className="text-xs font-bold text-zinc-400">Confirmed</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <a href="#" className="flex items-center text-zinc-500 hover:text-white text-xs font-mono transition-colors">
                               {tx.hash.substring(0, 8)}...
                               <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                         </td>
                       </tr>
                     ))}
                     {myTransactions.length === 0 && (
                       <tr>
                         <td colSpan={6} className="px-6 py-20 text-center text-zinc-600">No transactions recorded.</td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

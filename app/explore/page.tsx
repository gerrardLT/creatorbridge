'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { IPCard } from '@/components/IPCard';
import { SkeletonIPCard } from '@/components/SkeletonIPCard';
import { Search, Filter, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function ExplorePage() {
  const { ips } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
    setIsFetching(true);
    const timer = setTimeout(() => setIsFetching(false), 800);
    return () => clearTimeout(timer);
  }, [searchTerm, creatorFilter, minPrice, maxPrice, verifiedOnly]);

  useEffect(() => {
    const timer = setTimeout(() => setIsFetching(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredIps = useMemo(() => {
    return ips.filter(ip => {
      const matchesSearch = ip.title.toLowerCase().includes(searchTerm.toLowerCase()) || ip.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCreator = creatorFilter === '' || ip.creator.name.toLowerCase().includes(creatorFilter.toLowerCase());
      const price = ip.priceEth;
      const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);
      const matchesVerified = !verifiedOnly || !!ip.txHash;
      return matchesSearch && matchesCreator && matchesMinPrice && matchesMaxPrice && matchesVerified;
    });
  }, [ips, searchTerm, creatorFilter, minPrice, maxPrice, verifiedOnly]);

  const totalPages = Math.ceil(filteredIps.length / ITEMS_PER_PAGE);
  const paginatedIps = filteredIps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow"></div>
        <div className="absolute top-[100px] left-[-100px] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="grid-bg absolute inset-0 opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 animate-slideDown">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" />
              <span className="text-indigo-400 font-bold tracking-[0.2em] text-xs uppercase">Marketplace</span>
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">Explore Assets</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:flex-grow-0 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-lg"
                />
             </div>
             <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 border rounded-xl shadow-lg transition-all ${showFilters ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
             >
               <Filter size={20} />
             </button>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mb-10' : 'max-h-0 opacity-0'}`}>
           <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Creator</label>
                <input type="text" placeholder="Filter by Creator Name" value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Min Price (ETH)</label>
                <input type="number" placeholder="0.00" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Max Price (ETH)</label>
                <input type="number" placeholder="10.00" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 w-full transition-colors border border-transparent hover:border-white/10">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${verifiedOnly ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-zinc-600'}`}>
                    {verifiedOnly && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="hidden" />
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-indigo-400 transition-colors">Verified Only</span>
                </label>
              </div>
           </div>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
                <SkeletonIPCard />
              </div>
            ))}
          </div>
        ) : filteredIps.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-800 animate-fadeInUp">
            <div className="w-20 h-20 bg-zinc-900 text-zinc-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No assets found</h3>
            <p className="text-zinc-500 mb-6">Try adjusting your filters to find what you&apos;re looking for.</p>
            <button onClick={() => { setSearchTerm(''); setCreatorFilter(''); setMinPrice(''); setMaxPrice(''); setVerifiedOnly(false); }} className="px-6 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {paginatedIps.map((ip, index) => (
                <div key={ip.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                  <IPCard asset={ip} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 animate-fadeInUp">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-zinc-900">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/10'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-zinc-900">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { IPCard } from '@/components/IPCard';
import { SkeletonIPCard } from '@/components/SkeletonIPCard';
import { Search, Filter, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';

const ITEMS_PER_PAGE = 8;

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const LICENSE_FILTERS: { value: string; label: string; color: string }[] = [
  { value: '', label: 'All Licenses', color: 'zinc' },
  { value: LicenseType.NON_COMMERCIAL, label: 'Non-Commercial', color: 'emerald' },
  { value: LicenseType.COMMERCIAL_USE, label: 'Commercial Use', color: 'blue' },
  { value: LicenseType.COMMERCIAL_REMIX, label: 'Commercial Remix', color: 'purple' },
];

interface IPAsset {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  priceEth: number;
  createdAt: string;
  txHash: string | null;
  licenseType: string | null;
  mintingFee: string | null;
  commercialRevShare: number | null;
  licenseTermsId: string | null;
  creator: {
    id: string;
    name: string;
    walletAddress: string;
    avatarUrl: string;
  };
}

export default function ExplorePage() {
  const [ips, setIps] = useState<IPAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(true);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API
  const fetchIPs = useCallback(async () => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (creatorFilter) params.append('creatorId', creatorFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (verifiedOnly) params.append('verified', 'true');
      if (licenseTypeFilter) params.append('licenseType', licenseTypeFilter);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());

      const res = await fetch(`/api/ip?${params.toString()}`);
      const data = await res.json();

      if (data.assets) {
        setIps(data.assets);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch IPs:', error);
    } finally {
      setIsFetching(false);
    }
  }, [debouncedSearch, creatorFilter, minPrice, maxPrice, verifiedOnly, licenseTypeFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchIPs();
  }, [fetchIPs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, creatorFilter, minPrice, maxPrice, verifiedOnly, licenseTypeFilter, sortBy]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchTerm('');
    setCreatorFilter('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setLicenseTypeFilter('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow"></div>
        <div className="absolute top-[100px] left-[-100px] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="grid-bg absolute inset-0 opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 animate-slideDown">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" />
              <span className="text-indigo-400 font-bold tracking-[0.2em] text-xs uppercase">Marketplace</span>
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">Explore Assets</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
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

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 border rounded-xl shadow-lg transition-all ${showFilters ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* License Type Quick Filters + Sort */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* License Type Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {LICENSE_FILTERS.map((license) => (
              <button
                key={license.value}
                onClick={() => setLicenseTypeFilter(license.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${licenseTypeFilter === license.value
                  ? license.value === ''
                    ? 'bg-white text-black'
                    : `bg-${license.color}-500/20 border border-${license.color}-500/50 text-${license.color}-400`
                  : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
                  }`}
              >
                {license.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-zinc-700 mx-2 hidden md:block"></div>

          {/* Sort Dropdown - Custom */}
          <div className="relative ml-auto min-w-[200px]">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="w-full flex items-center justify-between gap-2 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-indigo-400" />
                <span className="font-medium whitespace-nowrap">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              </div>
              <svg className={`w-4 h-4 text-zinc-400 transition-transform flex-shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeInUp">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${sortBy === option.value
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {sortBy === option.value && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mb-10' : 'max-h-0 opacity-0'}`}>
          <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Creator</label>
              <input
                type="text"
                placeholder="Filter by creator"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Min Price (WIP)</label>
              <input
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Max Price (WIP)</label>
              <input
                type="number"
                placeholder="10.00"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 w-full transition-colors border border-transparent hover:border-white/10">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${verifiedOnly ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-zinc-600'}`}>
                  {verifiedOnly && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-indigo-400 transition-colors">On-chain verified only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500">
            <span className="text-white font-medium">{total}</span> assets found
            {licenseTypeFilter && (
              <span className="ml-2 text-indigo-400">
                · {LICENSE_FILTERS.find(l => l.value === licenseTypeFilter)?.label}
              </span>
            )}
          </p>
          {(searchTerm || creatorFilter || minPrice || maxPrice || verifiedOnly || licenseTypeFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Grid */}
        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
                <SkeletonIPCard />
              </div>
            ))}
          </div>
        ) : ips.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-800 animate-fadeInUp">
            <div className="w-20 h-20 bg-zinc-900 text-zinc-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No assets found</h3>
            <p className="text-zinc-500 mb-6">Try adjusting your filters to find what you're looking for</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {ips.map((ip, index) => (
                <div key={ip.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                  <IPCard asset={ip as any} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 animate-fadeInUp">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-zinc-900"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-1">
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/10'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-zinc-900"
                >
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

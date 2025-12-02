'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Share2, Shield, CheckCircle2, Copy, Cpu, Zap, ExternalLink, XCircle, Loader2, GitBranch, Network, Trash2 } from 'lucide-react';
import LicenseBadge from '@/components/LicenseBadge';
import DerivativeList from '@/components/DerivativeList';
import ParentIPInfo from '@/components/ParentIPInfo';
import RoyaltyInfo from '@/components/RoyaltyInfo';
import LineageGraphModal from '@/components/LineageGraphModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';
import { getExplorerTxUrl, getExplorerIpUrl } from '@/lib/constants/story-protocol';
import { useState } from 'react';

export default function IPDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { ips, buyLicense, user, isLoading, walletAddress } = useApp();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showLineageGraph, setShowLineageGraph] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<{ hasDerivatives?: boolean; derivativeCount?: number } | null>(null);
  
  const asset = ips.find(ip => ip.id === params.id) as any;

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

  const licenseType = (asset.licenseType as LicenseType) || LicenseType.NON_COMMERCIAL;
  const licenseInfo = LICENSE_TYPE_INFO[licenseType];
  const isNonCommercial = licenseType === LicenseType.NON_COMMERCIAL;
  const isCommercialRemix = licenseType === LicenseType.COMMERCIAL_REMIX;
  const displayPrice = isNonCommercial ? '0' : (asset.mintingFee || asset.priceEth);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setPurchaseError(null);
    try {
      await buyLicense(asset.id);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/ip/${asset.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success - redirect to explore page
        router.push('/explore');
      } else {
        // Handle errors
        if (data.hasDerivatives) {
          setDeleteError({
            hasDerivatives: true,
            derivativeCount: data.derivativeCount,
          });
        } else {
          throw new Error(data.error || 'Failed to delete IP');
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleteError({ hasDerivatives: false });
    } finally {
      setIsDeleting(false);
    }
  };

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

             {/* Parent IP Info (if this is a derivative) */}
             <ParentIPInfo childIpId={asset.id} />

             {/* Derivative List */}
             <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                <DerivativeList ipId={asset.id} />
                
                {/* View Lineage Graph Button */}
                <button
                  onClick={() => setShowLineageGraph(true)}
                  className="w-full mt-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <Network className="w-4 h-4" />
                  View Lineage Graph
                </button>
             </div>

             {/* Royalty Info */}
             <RoyaltyInfo ipId={asset.id} />

             {/* Delete Button (Owner Only) */}
             {user && user.id === asset.creator.id && (
               <div className="bg-zinc-900/40 backdrop-blur-xl border border-red-500/10 rounded-3xl p-6">
                 <button
                   onClick={() => setShowDeleteModal(true)}
                   className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group"
                 >
                   <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                   Delete IP Asset
                 </button>
                 <p className="text-xs text-zinc-500 text-center mt-2">
                   Permanently remove this IP from the platform
                 </p>
               </div>
             )}

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
                   {asset.ipId && (
                     <div className="col-span-2 bg-black/40 p-4 rounded-xl border border-white/5">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">IP Asset ID</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-zinc-300 truncate mr-2">{asset.ipId}</span>
                          <a 
                            href={getExplorerIpUrl(asset.ipId)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                     </div>
                   )}
                   <div 
                     className="col-span-2 bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-colors"
                     onClick={() => asset.txHash && copyToClipboard(asset.txHash)}
                   >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Transaction Hash</span>
                        <span className="font-mono text-sm text-zinc-300 truncate block">{asset.txHash || 'Pending...'}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Copy size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                        {asset.txHash && (
                          <a 
                            href={getExplorerTxUrl(asset.txHash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
             <div>
                <div className="flex items-center space-x-3 mb-4">
                   <LicenseBadge licenseType={asset.licenseType} size="md" />
                   {asset.txHash && (
                     <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center">
                        <Shield size={12} className="mr-1.5" /> ON-CHAIN
                     </span>
                   )}
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

             {/* License Terms Card */}
             <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${
                  isNonCommercial ? 'from-emerald-500 to-teal-500' :
                  isCommercialRemix ? 'from-purple-500 to-pink-500' :
                  'from-blue-500 to-indigo-500'
                } rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
                <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                   <div className="bg-white/5 border-b border-white/5 p-6 flex justify-between items-center">
                      <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest">{licenseInfo.label} License</span>
                      <Zap className={`${
                        isNonCommercial ? 'text-emerald-400' :
                        isCommercialRemix ? 'text-purple-400' :
                        'text-blue-400'
                      }`} size={18} />
                   </div>
                   <div className="p-8 space-y-6">
                      {/* License Features */}
                      <div className="flex flex-col space-y-4">
                         <div className="flex items-start">
                            {isNonCommercial ? (
                              <XCircle size={20} className="text-zinc-500 mr-3 mt-0.5 shrink-0" />
                            ) : (
                              <CheckCircle2 size={20} className="text-indigo-400 mr-3 mt-0.5 shrink-0" />
                            )}
                            <div>
                               <span className="text-white font-medium block">Commercial Use</span>
                               <span className="text-zinc-500 text-sm">
                                 {isNonCommercial ? 'Not permitted for commercial purposes' : 'Licensed for commercial applications'}
                               </span>
                            </div>
                         </div>
                         <div className="flex items-start">
                            {licenseType === LicenseType.COMMERCIAL_USE ? (
                              <XCircle size={20} className="text-zinc-500 mr-3 mt-0.5 shrink-0" />
                            ) : (
                              <CheckCircle2 size={20} className="text-indigo-400 mr-3 mt-0.5 shrink-0" />
                            )}
                            <div>
                               <span className="text-white font-medium block">Derivative Works</span>
                               <span className="text-zinc-500 text-sm">
                                 {licenseType === LicenseType.COMMERCIAL_USE 
                                   ? 'Derivatives not permitted' 
                                   : 'Create remixes and derivative works with attribution'}
                               </span>
                            </div>
                         </div>
                         {isCommercialRemix && asset.commercialRevShare && (
                           <div className="flex items-start">
                              <CheckCircle2 size={20} className="text-purple-400 mr-3 mt-0.5 shrink-0" />
                              <div>
                                 <span className="text-white font-medium block">Revenue Share</span>
                                 <span className="text-zinc-500 text-sm">
                                   {asset.commercialRevShare}% of derivative revenue goes to original creator
                                 </span>
                              </div>
                           </div>
                         )}
                      </div>

                      <div className="h-px bg-white/10 w-full my-6 flex items-center justify-center">
                         <div className="bg-zinc-900 px-3 text-zinc-500 text-xs uppercase tracking-widest">Pricing</div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm text-zinc-500">
                              {isNonCommercial ? 'Free license' : 'One-time payment'}
                            </span>
                            <span className={`text-4xl font-bold tracking-tight ${
                              isNonCommercial ? 'text-emerald-400' : 'text-white'
                            }`}>
                              {isNonCommercial ? 'FREE' : `${displayPrice} WIP`}
                            </span>
                         </div>
                         {asset.licenseTermsId && (
                           <div className="text-right">
                             <span className="text-xs text-zinc-500 block">License Terms ID</span>
                             <span className="font-mono text-sm text-zinc-400">#{asset.licenseTermsId}</span>
                           </div>
                         )}
                      </div>

                      {/* Purchase Error */}
                      {purchaseError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                          {purchaseError}
                        </div>
                      )}

                      {/* Action Button */}
                      {user && user.id === asset.creator.id ? (
                         <div className="w-full py-4 bg-zinc-800 text-zinc-400 font-medium text-lg rounded-xl flex items-center justify-center border border-zinc-700">
                            <Shield size={20} className="mr-2" />
                            <span>This is your IP</span>
                         </div>
                      ) : (
                         <button 
                           onClick={handlePurchase} 
                           disabled={isPurchasing || isLoading}
                           className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isPurchasing ? (
                             <>
                               <Loader2 className="mr-2 animate-spin" size={20} />
                               Processing...
                             </>
                           ) : (
                             <>
                               <span>{isNonCommercial ? 'Get Free License' : 'Purchase License'}</span>
                               <ArrowLeft className="ml-2 rotate-180" size={20} />
                             </>
                           )}
                         </button>
                      )}
                      {!user && <p className="text-center text-xs text-red-400">Wallet connection required</p>}

                      {/* Create Derivative Button (only for Commercial Remix) */}
                      {licenseType === LicenseType.COMMERCIAL_REMIX && user && (
                        <Link
                          href={`/create/derivative?parentId=${asset.id}`}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-3"
                        >
                          <GitBranch className="w-4 h-4" />
                          Create Derivative Work
                        </Link>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Lineage Graph Modal */}
      <LineageGraphModal
        isOpen={showLineageGraph}
        onClose={() => setShowLineageGraph(false)}
        ipId={asset.id}
        ipTitle={asset.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${asset.title}"?`}
        message="This will permanently remove this IP asset and all associated data from the platform."
        isDeleting={isDeleting}
        hasDerivatives={deleteError?.hasDerivatives || false}
        derivativeCount={deleteError?.derivativeCount || 0}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import LicenseBadge from './LicenseBadge';

interface RelatedIP {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    priceEth: number;
    licenseType: string | null;
    mintingFee: string | null;
    creator: {
        id: string;
        name: string;
        avatarUrl: string;
    };
}

interface RelatedIPsProps {
    ipId: string;
    currentCreatorId?: string;
}

export default function RelatedIPs({ ipId, currentCreatorId }: RelatedIPsProps) {
    const [relatedIPs, setRelatedIPs] = useState<RelatedIP[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRelatedIPs();
    }, [ipId]);

    const fetchRelatedIPs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/ip/${ipId}/related?limit=4`);
            const data = await res.json();
            if (data.relatedAssets) {
                setRelatedIPs(data.relatedAssets);
            }
        } catch (error) {
            console.error('Failed to fetch related IPs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">Related Works</h3>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (relatedIPs.length === 0) {
        return null;
    }

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">Related Works</h3>
                </div>
                <Link
                    href="/explore"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                    View More
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedIPs.map((ip) => (
                    <Link
                        key={ip.id}
                        href={`/ip/${ip.id}`}
                        className="group bg-zinc-800/50 rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1"
                    >
                        <div className="relative aspect-square overflow-hidden">
                            <img
                                src={ip.imageUrl}
                                alt={ip.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute top-2 right-2">
                                <LicenseBadge licenseType={ip.licenseType} size="sm" />
                            </div>
                            {currentCreatorId && ip.creator.id === currentCreatorId && (
                                <div className="absolute bottom-2 left-2">
                                    <span className="bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        Same Creator
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h4 className="font-medium text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                                {ip.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-zinc-500 truncate">
                                    {ip.creator.name}
                                </span>
                                <span className="text-xs font-mono text-indigo-400">
                                    {ip.mintingFee || ip.priceEth} WIP
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

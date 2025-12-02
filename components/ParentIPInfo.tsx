'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ParentInfo {
  ipId: string;
  title: string;
  imageUrl: string;
  creator: string;
  licenseType: string | null;
}

interface ParentIPInfoProps {
  childIpId: string;
}

export default function ParentIPInfo({ childIpId }: ParentIPInfoProps) {
  const [parent, setParent] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParent();
  }, [childIpId]);

  const fetchParent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lineage/${childIpId}`);
      const data = await res.json();
      if (data.lineage?.parents?.length > 0) {
        setParent(data.lineage.parents[0]);
      }
    } catch (error) {
      console.error('Failed to fetch parent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!parent) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-3">
        <ArrowUp className="w-4 h-4" />
        Derivative of
      </div>
      
      <Link
        href={`/ip/${parent.ipId}`}
        className="flex items-center gap-4 group"
      >
        <img
          src={parent.imageUrl}
          alt={parent.title}
          className="w-14 h-14 rounded-lg object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
            {parent.title}
          </h4>
          <p className="text-sm text-zinc-500">
            by {parent.creator}
          </p>
        </div>
      </Link>
    </div>
  );
}

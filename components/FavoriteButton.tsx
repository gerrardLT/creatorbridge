'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';

interface FavoriteButtonProps {
    ipAssetId: string;
    userId?: string;
    initialFavorited?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
    ipAssetId,
    userId,
    initialFavorited = false,
    size = 'md',
    showCount = false,
    onToggle
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    useEffect(() => {
        if (userId) {
            checkFavoriteStatus();
        }
    }, [userId, ipAssetId]);

    const checkFavoriteStatus = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/favorites?userId=${userId}&ipAssetId=${ipAssetId}`);
            const data = await res.json();
            setIsFavorited(data.isFavorited || false);
        } catch (error) {
            console.error('Failed to check favorite status:', error);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId || isLoading) return;

        setIsLoading(true);
        try {
            if (isFavorited) {
                await fetch(`/api/favorites?userId=${userId}&ipAssetId=${ipAssetId}`, {
                    method: 'DELETE'
                });
                setIsFavorited(false);
                setFavoriteCount(prev => Math.max(0, prev - 1));
            } else {
                await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, ipAssetId })
                });
                setIsFavorited(true);
                setFavoriteCount(prev => prev + 1);
            }
            onToggle?.(!isFavorited);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24
    };

    if (!userId) {
        return null;
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center gap-1
        transition-all duration-200
        ${isFavorited
                    ? 'bg-pink-500/20 border border-pink-500/50 text-pink-400 hover:bg-pink-500/30'
                    : 'bg-black/50 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={iconSizes[size] - 4} />
            ) : (
                <Heart
                    size={iconSizes[size]}
                    className={isFavorited ? 'fill-pink-400' : ''}
                />
            )}
            {showCount && favoriteCount > 0 && (
                <span className="text-xs font-medium">{favoriteCount}</span>
            )}
        </button>
    );
}

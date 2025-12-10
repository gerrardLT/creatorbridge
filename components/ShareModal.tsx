'use client';

import { useState } from 'react';
import { X, Link2, Copy, Check, Twitter, Send } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
    imageUrl?: string;
}

export default function ShareModal({ isOpen, onClose, title, url, imageUrl }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareText = `Check out "${title}" on CreatorBridge - The Programmable IP Layer for the Agentic Economy`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const shareToTelegram = () => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank', 'width=600,height=400');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeInUp">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Share</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6">
                    {imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{title}</p>
                        <p className="text-xs text-zinc-500 truncate mt-1">{url}</p>
                    </div>
                </div>

                {/* Copy Link */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Link
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={url}
                            readOnly
                            className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none"
                        />
                        <button
                            onClick={copyLink}
                            className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Social Share */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                        Share to
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={shareToTwitter}
                            className="flex-1 py-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 text-[#1DA1F2] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Twitter className="w-5 h-5" />
                            Twitter
                        </button>
                        <button
                            onClick={shareToTelegram}
                            className="flex-1 py-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 text-[#0088cc] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            Telegram
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

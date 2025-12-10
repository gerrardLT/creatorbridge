'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Upload, GitBranch, Loader2, AlertTriangle, CheckCircle2, Music } from 'lucide-react';

function DerivativePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId');

  const { user, addNotification } = useApp();

  const [parentIp, setParentIp] = useState<any>(null);
  const [isLoadingParent, setIsLoadingParent] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parentId) {
      fetchParentIP();
    }
  }, [parentId]);

  const fetchParentIP = async () => {
    setIsLoadingParent(true);
    try {
      const res = await fetch(`/api/ip/${parentId}`);
      const data = await res.json();

      if (data.asset) {
        setParentIp(data.asset);

        // Check if derivatives are allowed
        if (data.asset.licenseType !== 'COMMERCIAL_REMIX') {
          setValidationError('This IP does not allow derivative works. Only Commercial Remix licenses permit derivatives.');
        }
      } else {
        setValidationError('Parent IP not found');
      }
    } catch (error) {
      setValidationError('Failed to load parent IP');
    } finally {
      setIsLoadingParent(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];

      if (audioExtensions.includes(fileExtension || '')) {
        setFileType('audio');
      } else {
        setFileType('image');
      }

      setFile(selectedFile);

      // Convert to Base64 for persistent storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !preview || !parentId || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/derivatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentIpId: parentId,
          childTitle: title,
          childDescription: description,
          childImageUrl: preview,
          creatorId: user.id,
          walletAddress: user.walletAddress,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const message = data.onChain
          ? '🎉 Derivative registered on Story Protocol! Transaction confirmed.'
          : '✅ Derivative saved locally. Configure Story Protocol for on-chain registration.';
        addNotification('success', message);

        // Show transaction hash if available
        if (data.txHash) {
          console.log('✅ Transaction Hash:', data.txHash);
          console.log('🔗 View on Explorer:', `https://aeneid.storyscan.xyz/tx/${data.txHash}`);
        }

        router.push(`/ip/${data.childIp.id}`);
      } else {
        throw new Error(data.error || 'Failed to register derivative');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register derivative');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#050505] text-white pt-20">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
          <p className="text-zinc-400 mb-6">Connect your wallet to create derivative works.</p>
        </div>
      </div>
    );
  }

  if (!parentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#050505] text-white pt-20">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">No Parent IP Selected</h2>
          <p className="text-zinc-400 mb-6">Please select an IP to create a derivative from.</p>
          <Link href="/explore" className="text-indigo-400 hover:text-white transition-colors">
            Browse IP Assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href={`/ip/${parentId}`} className="flex items-center text-zinc-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Parent IP</span>
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Create Derivative Work</h1>
          </div>
          <p className="text-zinc-500">Register a new IP based on an existing work</p>
        </div>

        {/* Parent IP Info */}
        {isLoadingParent ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : validationError ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-400 mb-1">Cannot Create Derivative</h3>
                <p className="text-red-300/70">{validationError}</p>
              </div>
            </div>
          </div>
        ) : parentIp && (
          <>
            {/* Parent IP Card */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-8">
              <p className="text-sm text-purple-400 mb-3">Creating derivative of:</p>
              <div className="flex items-center gap-4">
                <img
                  src={parentIp.imageUrl}
                  alt={parentIp.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{parentIp.title}</h3>
                  <p className="text-sm text-zinc-400">by {parentIp.creator?.name}</p>
                  {parentIp.commercialRevShare && (
                    <p className="text-xs text-purple-400 mt-1">
                      {parentIp.commercialRevShare}% revenue share to original creator
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Derivative Artwork
                </label>
                <div
                  className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,audio/*"
                    onChange={handleFileChange}
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <div className="relative z-0">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                        {fileType === 'audio' ? (
                          <Music className="text-purple-400" size={24} />
                        ) : (
                          <Upload className="text-purple-400" size={24} />
                        )}
                      </div>
                      <p className="text-lg font-medium text-white mb-1">{file ? file.name : "Upload your derivative work"}</p>
                      <p className="text-sm text-zinc-500">Images (PNG, JPG, WEBP) & Audio (MP3, WAV, OGG)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  placeholder="Your derivative work title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Describe how your work builds upon the original..."
                  required
                />
              </div>

              {/* Attribution Notice */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-zinc-300 font-medium">Attribution Required</p>
                    <p className="text-zinc-500 mt-1">
                      Your derivative work will be linked to the original IP on-chain.
                      Revenue sharing will be automatically enforced via Story Protocol.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || !title || !description || isSubmitting}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering Derivative...
                  </>
                ) : (
                  <>
                    <GitBranch className="w-5 h-5" />
                    Register Derivative Work
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function DerivativePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <DerivativePageContent />
    </Suspense>
  );
}

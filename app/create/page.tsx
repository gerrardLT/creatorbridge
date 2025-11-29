'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Upload, DollarSign, FileText, Sparkles, ArrowUpRight, ScanLine } from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const { registerIP, user } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0.01');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && price && preview) {
      await registerIP(title, description, parseFloat(price), preview);
      router.push('/explore');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#050505] text-white pt-20">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 text-center max-w-md animate-fadeInUp">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
          <p className="text-zinc-400 mb-6">Connect your Coinbase wallet to access the Creation Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Digital Studio</h1>
            <p className="text-zinc-500">Register new intellectual property on Story Protocol.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Asset File</label>
                <div 
                  className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  {isScanning && (
                    <div className="absolute inset-0 bg-indigo-500/10 z-10 pointer-events-none">
                       <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] absolute animate-scan"></div>
                    </div>
                  )}
                  <div className="relative z-0">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                      <Upload className="text-indigo-400" size={24} />
                    </div>
                    <p className="text-lg font-medium text-white mb-1">{file ? file.name : "Drop your masterpiece here"}</p>
                    <p className="text-sm text-zinc-500">Supports PNG, JPG, WEBP (Max 50MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Title</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FileText size={18} className="text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                     </div>
                     <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full pl-11 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all focus:bg-black" placeholder="e.g., Neon Genesis #001" required />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all focus:bg-black resize-none" placeholder="Describe the provenance and intended usage..." required />
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">License Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign size={18} className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input type="number" step="0.001" value={price} onChange={(e) => setPrice(e.target.value)} className="block w-full pl-11 pr-16 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all focus:bg-black font-mono text-lg" required />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-zinc-500 font-bold">ETH</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={!file || !title || !description} className="w-full py-5 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                   Mint to Story Protocol <ArrowUpRight className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </button>
            </form>
          </div>

          <div className="hidden lg:block sticky top-32 perspective-container">
             <div className="relative transform-style-3d transition-transform duration-500 hover:rotate-0" style={{ transform: 'rotateY(-5deg) rotateX(5deg)' }}>
                <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full pointer-events-none mix-blend-screen" />
                <div className="bg-black border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
                  <div className="h-8 bg-zinc-900 border-b border-white/5 flex items-center px-4 space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="relative aspect-square bg-zinc-900/50 overflow-hidden flex items-center justify-center group">
                    {preview ? (
                      <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center space-x-2">
                           <ScanLine size={14} className="text-indigo-400 animate-pulse" />
                           <span className="text-xs font-mono text-white">AI_SCAN: COMPLETE</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-zinc-700 flex flex-col items-center">
                        <div className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center mb-4">
                           <Sparkles size={24} />
                        </div>
                        <span className="font-mono text-sm uppercase tracking-widest">Awaiting Input</span>
                      </div>
                    )}
                  </div>
                  <div className="p-8 space-y-6 bg-zinc-950">
                    <div>
                       <h3 className={`text-2xl font-bold text-white mb-2 ${!title && 'opacity-30'}`}>{title || "Untitled Asset"}</h3>
                       <p className={`text-zinc-500 leading-relaxed ${!description && 'opacity-30'}`}>{description || "Asset description will appear here..."}</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                       <div className="flex items-center space-x-3">
                          <img src={user?.avatarUrl} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                          <div className="flex flex-col">
                             <span className="text-xs text-zinc-500 uppercase tracking-wider">Creator</span>
                             <span className="text-sm font-bold text-white">{user?.name}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider block">Floor Price</span>
                          <span className="text-xl font-mono font-bold text-indigo-400">{price} ETH</span>
                       </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Upload, FileText, Sparkles, ArrowUpRight, ScanLine, Loader2, Save, Wand2, Music, Image as ImageIcon } from 'lucide-react';
import LicenseSelector from '@/components/LicenseSelector';
import PricingForm from '@/components/PricingForm';
import TemplateSelector from '@/components/TemplateSelector';
import SaveTemplateModal from '@/components/SaveTemplateModal';
import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';
import { LicenseTemplate } from '@/lib/types/template';

export default function CreatePage() {
  const router = useRouter();
  const { registerIP, user, addNotification } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Generation state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // License state
  const [licenseType, setLicenseType] = useState<LicenseType>(LicenseType.NON_COMMERCIAL);
  const [mintingFee, setMintingFee] = useState('0.01');
  const [commercialRevShare, setCommercialRevShare] = useState(10);
  
  // Template state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateRefreshKey, setTemplateRefreshKey] = useState(0);

  // Handle template selection
  const handleTemplateSelect = (template: LicenseTemplate) => {
    setLicenseType(template.licenseType);
    if (template.mintingFee) setMintingFee(template.mintingFee);
    if (template.commercialRevShare !== null && template.commercialRevShare !== undefined) {
      setCommercialRevShare(template.commercialRevShare);
    }
  };

  // Handle save template
  const handleSaveTemplate = async (name: string, overwrite?: boolean) => {
    if (!user) throw new Error('Not authenticated');
    
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name,
        licenseType,
        mintingFee: licenseType !== LicenseType.NON_COMMERCIAL ? mintingFee : null,
        commercialRevShare: licenseType === LicenseType.COMMERCIAL_REMIX ? commercialRevShare : null,
      }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      const error = new Error(data.error || 'Failed to save template');
      (error as any).code = data.code;
      throw error;
    }
    
    // Show success notification and refresh template list
    addNotification('success', `✅ Template "${name}" saved successfully!`);
    setTemplateRefreshKey(prev => prev + 1); // 触发模板列表刷新
  };

  const processFile = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (audioExtensions.includes(fileExtension || '')) {
      setFileType('audio');
    } else if (imageExtensions.includes(fileExtension || '')) {
      setFileType('image');
    } else {
      setError('Unsupported file type. Please upload an image or audio file.');
      return;
    }
    
    setFile(selectedFile);
    
    // 转换为 Base64 以便持久化存储
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    
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

  // Handle AI image generation
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt for AI generation');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Using Pollinations AI (free API)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1024&height=1024&nologo=true`;
      
      // Fetch the image and convert to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
      
      setFile(file);
      setPreview(imageUrl);
      setFileType('image');
      setShowAIGenerator(false);
      setAiPrompt('');
      addNotification('success', '✨ AI image generated successfully!');
    } catch (err) {
      setError('Failed to generate AI image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get price based on license type
  const getDisplayPrice = () => {
    if (licenseType === LicenseType.NON_COMMERCIAL) return '0';
    return mintingFee || '0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !preview) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await registerIP(
        title, 
        description, 
        parseFloat(getDisplayPrice()), 
        preview,
        licenseType,
        licenseType !== LicenseType.NON_COMMERCIAL ? mintingFee : undefined,
        licenseType === LicenseType.COMMERCIAL_REMIX ? commercialRevShare : undefined
      );
      router.push('/explore');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register IP. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const licenseInfo = LICENSE_TYPE_INFO[licenseType];

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
              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Asset File</label>
                  <button
                    type="button"
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    {showAIGenerator ? 'Upload File' : 'AI Generate'}
                  </button>
                </div>
                
                {showAIGenerator ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe the image you want to create..."
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-purple-500/30 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                        onKeyPress={(e) => e.key === 'Enter' && handleAIGenerate()}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,audio/*" onChange={handleFileChange} />
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-500/10 z-10 pointer-events-none">
                         <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] absolute animate-scan"></div>
                      </div>
                    )}
                    <div className="relative z-0">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/5">
                        {fileType === 'audio' ? (
                          <Music className="text-indigo-400" size={24} />
                        ) : (
                          <Upload className="text-indigo-400" size={24} />
                        )}
                      </div>
                      <p className="text-lg font-medium text-white mb-1">{file ? file.name : "Drop your masterpiece here"}</p>
                      <p className="text-sm text-zinc-500">Supports Images (PNG, JPG, WEBP) & Audio (MP3, WAV, OGG) - Max 50MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
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
              </div>

              {/* Template Selector - 放在许可证配置之前 */}
              <TemplateSelector
                key={templateRefreshKey}
                userId={user?.id || null}
                onSelect={handleTemplateSelect}
                disabled={isSubmitting}
              />

              {/* License Selection */}
              <LicenseSelector 
                value={licenseType} 
                onChange={setLicenseType} 
              />

              {/* Pricing Form */}
              <PricingForm
                licenseType={licenseType}
                mintingFee={mintingFee}
                commercialRevShare={commercialRevShare}
                onMintingFeeChange={setMintingFee}
                onRevShareChange={setCommercialRevShare}
              />

              {/* Save as Template Button */}
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(true)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Save className="w-4 h-4" />
                Save License as Template
              </button>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={!file || !title || !description || isSubmitting} 
                className="w-full py-5 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Minting on Story Protocol...
                    </>
                  ) : (
                    <>
                      Mint to Story Protocol <ArrowUpRight className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </button>
            </form>
          </div>

          {/* Preview Card */}
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
                        {fileType === 'audio' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8">
                            <Music className="w-24 h-24 text-indigo-400 mb-4" />
                            <p className="text-white font-medium mb-2">{file?.name}</p>
                            <audio controls className="w-full mt-4">
                              <source src={preview} type={file?.type} />
                            </audio>
                          </div>
                        ) : (
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        )}
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
                       <div className="flex items-center space-x-2 mb-2">
                         <h3 className={`text-2xl font-bold text-white ${!title && 'opacity-30'}`}>{title || "Untitled Asset"}</h3>
                         <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-${licenseInfo.color}-500/20 text-${licenseInfo.color}-400`}>
                           {licenseInfo.label}
                         </span>
                       </div>
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
                          <span className="text-xs text-zinc-500 uppercase tracking-wider block">License Fee</span>
                          <span className="text-xl font-mono font-bold text-indigo-400">{getDisplayPrice()} WIP</span>
                       </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
        licenseType={licenseType}
        mintingFee={licenseType !== LicenseType.NON_COMMERCIAL ? mintingFee : undefined}
        commercialRevShare={licenseType === LicenseType.COMMERCIAL_REMIX ? commercialRevShare : undefined}
      />
    </div>
  );
}

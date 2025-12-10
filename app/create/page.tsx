'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Upload, FileText, Sparkles, ArrowUpRight, ScanLine, Loader2, Save, Wand2, Music, Image as ImageIcon, Video, RotateCcw, X } from 'lucide-react';
import LicenseSelector from '@/components/LicenseSelector';
import PricingForm from '@/components/PricingForm';
import TemplateSelector from '@/components/TemplateSelector';
import SaveTemplateModal from '@/components/SaveTemplateModal';
import { LicenseType, LICENSE_TYPE_INFO } from '@/lib/types/license';
import { LicenseTemplate } from '@/lib/types/template';

const DRAFT_KEY = 'creatorbridge_create_draft';

interface DraftData {
  title: string;
  description: string;
  preview: string | null;
  fileType: 'image' | 'audio' | 'video' | null;
  licenseType: LicenseType;
  mintingFee: string;
  commercialRevShare: number;
  savedAt: number;
}

export default function CreatePage() {
  const router = useRouter();
  const { registerIP, user, addNotification } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft recovery state
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [savedDraft, setSavedDraft] = useState<DraftData | null>(null);

  // AI Generation state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Video Generation state
  const [showAIVideoGenerator, setShowAIVideoGenerator] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoMode, setVideoMode] = useState<'fast' | 'quality' | 'local'>('fast');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // License state
  const [licenseType, setLicenseType] = useState<LicenseType>(LicenseType.NON_COMMERCIAL);
  const [mintingFee, setMintingFee] = useState('0.01');
  const [commercialRevShare, setCommercialRevShare] = useState(10);

  // Template state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateRefreshKey, setTemplateRefreshKey] = useState(0);

  // Check for saved draft on mount
  useEffect(() => {
    const draftStr = localStorage.getItem(DRAFT_KEY);
    if (draftStr) {
      try {
        const draft: DraftData = JSON.parse(draftStr);
        // Only show recovery modal if draft is less than 24 hours old
        const hoursSinceSave = (Date.now() - draft.savedAt) / (1000 * 60 * 60);
        if (hoursSinceSave < 24 && (draft.title || draft.description || draft.preview)) {
          setSavedDraft(draft);
          setShowDraftModal(true);
        }
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (!title && !description && !preview) return;

    const draft: DraftData = {
      title,
      description,
      preview,
      fileType,
      licenseType,
      mintingFee,
      commercialRevShare,
      savedAt: Date.now()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, description, preview, fileType, licenseType, mintingFee, commercialRevShare]);

  // Restore draft
  const restoreDraft = () => {
    if (savedDraft) {
      setTitle(savedDraft.title);
      setDescription(savedDraft.description);
      if (savedDraft.preview) setPreview(savedDraft.preview);
      if (savedDraft.fileType) setFileType(savedDraft.fileType);
      setLicenseType(savedDraft.licenseType);
      setMintingFee(savedDraft.mintingFee);
      setCommercialRevShare(savedDraft.commercialRevShare);
      addNotification('success', '✅ Draft restored');
    }
    setShowDraftModal(false);
  };

  // Discard draft
  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setSavedDraft(null);
    setShowDraftModal(false);
  };

  // Clear draft after successful submit
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  // Handle template selection
  const handleTemplateSelect = (template: LicenseTemplate) => {
    console.log('Template selected:', template);
    console.log('Setting licenseType to:', template.licenseType);

    // Ensure licenseType is a valid enum value
    const newLicenseType = template.licenseType as LicenseType;
    setLicenseType(newLicenseType);

    if (template.mintingFee !== null && template.mintingFee !== undefined) {
      console.log('Setting mintingFee to:', template.mintingFee);
      setMintingFee(String(template.mintingFee));
    }
    if (template.commercialRevShare !== null && template.commercialRevShare !== undefined) {
      console.log('Setting commercialRevShare to:', template.commercialRevShare);
      setCommercialRevShare(Number(template.commercialRevShare));
    }
    addNotification('success', `✅ Template "${template.name}" applied!`);
  };

  // Handle template clear - reset to defaults
  const handleTemplateClear = () => {
    setLicenseType(LicenseType.NON_COMMERCIAL);
    setMintingFee('0.01');
    setCommercialRevShare(10);
    addNotification('info', 'Template cleared, reset to defaults');
  };

  // Handle save template
  const handleSaveTemplate = async (name: string, overwrite?: boolean) => {
    if (!user) throw new Error('Not authenticated');

    const templateData = {
      userId: user.id,
      name,
      licenseType,
      mintingFee: licenseType !== LicenseType.NON_COMMERCIAL ? mintingFee : null,
      commercialRevShare: licenseType === LicenseType.COMMERCIAL_REMIX ? commercialRevShare : null,
    };

    console.log('Saving template with data:', templateData);

    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.error || 'Failed to save template');
      (error as any).code = data.code;
      throw error;
    }

    // Show success notification and refresh template list
    addNotification('success', `✅ Template "${name}" saved successfully!`);
    setTemplateRefreshKey(prev => prev + 1); // Trigger template list refresh
  };

  const processFile = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];

    if (audioExtensions.includes(fileExtension || '')) {
      setFileType('audio');
    } else if (imageExtensions.includes(fileExtension || '')) {
      setFileType('image');
    } else if (videoExtensions.includes(fileExtension || '')) {
      setFileType('video');
    } else {
      setError('Unsupported file type. Please upload an image, audio, or video file.');
      return;
    }

    setFile(selectedFile);

    // Convert to Base64 for persistent storage
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

  // Handle AI video generation
  const handleAIVideoGenerate = async () => {
    if (!videoPrompt.trim()) {
      setError('Please enter a prompt for video generation');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, videoMode === 'fast' ? 3000 : 6000);

      const response = await fetch('/api/ai-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          duration: videoDuration,
          mode: videoMode,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      setVideoProgress(100);

      if (!data.success || !data.videoUrl) {
        throw new Error('No video URL returned');
      }

      // Fetch video and convert to File object
      const videoBlob = await fetch(data.videoUrl).then(r => r.blob());
      const videoFile = new File(
        [videoBlob],
        `ai-video-${Date.now()}.mp4`,
        { type: 'video/mp4' }
      );

      setFile(videoFile);
      setPreview(data.videoUrl);
      setFileType('video');
      setShowAIVideoGenerator(false);
      setVideoPrompt('');
      setVideoProgress(0);
      addNotification('success', `✨ AI video generated successfully! Duration: ${data.duration}s`);
    } catch (err) {
      console.error('Video generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video. Please try again.');
    } finally {
      setIsGeneratingVideo(false);
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
      clearDraft(); // Clear draft after successful submit
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAIGenerator(!showAIGenerator);
                        setShowAIVideoGenerator(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-medium rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image AI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAIVideoGenerator(!showAIVideoGenerator);
                        setShowAIGenerator(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 text-xs font-medium rounded-lg transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video AI
                    </button>
                  </div>
                </div>

                {showAIVideoGenerator ? (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30">
                    <h3 className="font-semibold text-white text-lg">AI Video Generator</h3>

                    {/* Prompt Input */}
                    <div>
                      <label className="text-sm text-zinc-300 font-medium block mb-2">
                        Video Prompt
                      </label>
                      <textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Describe the video... e.g., 'A drone flying over mountains at sunset with cinematic atmosphere'"
                        className="w-full px-4 py-3 bg-zinc-800/70 border border-purple-500/30 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none h-24"
                        disabled={isGeneratingVideo}
                      />
                    </div>

                    {/* Duration Slider */}
                    <div>
                      <label className="text-sm text-zinc-300 font-medium block mb-3">
                        Duration: <span className="text-purple-400">{videoDuration}s</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="5"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        disabled={isGeneratingVideo}
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-2">
                        <span>10s</span>
                        <span>30s</span>
                        <span>60s</span>
                        <span>90s</span>
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div>
                      <label className="text-sm text-zinc-300 font-medium block mb-3">
                        Quality Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoMode('fast')}
                          disabled={isGeneratingVideo}
                          className={`p-3 rounded-xl border transition-all ${videoMode === 'fast'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <div className="text-lg mb-1">⚡</div>
                          <div className="text-xs font-medium">Fast</div>
                          <div className="text-[10px] text-zinc-500">~30s</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVideoMode('quality')}
                          disabled={isGeneratingVideo}
                          className={`p-3 rounded-xl border transition-all ${videoMode === 'quality'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <div className="text-lg mb-1">✨</div>
                          <div className="text-xs font-medium">Quality</div>
                          <div className="text-[10px] text-zinc-500">~2min</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVideoMode('local')}
                          disabled={isGeneratingVideo}
                          className={`p-3 rounded-xl border transition-all ${videoMode === 'local'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <div className="text-lg mb-1">🎬</div>
                          <div className="text-xs font-medium">Local</div>
                          <div className="text-[10px] text-zinc-500">~1min</div>
                        </button>
                      </div>

                      <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        <p className="text-xs text-zinc-400">
                          {videoMode === 'fast' && '⚡ Quick generation with Pollinations. Best for rapid prototyping.'}
                          {videoMode === 'quality' && '✨ Premium quality with Runway ML. Requires API key.'}
                          {videoMode === 'local' && '🎬 Open-source with Hugging Face. Requires GPU server.'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isGeneratingVideo && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">Generating video...</span>
                          <span className="text-purple-400 font-mono">{videoProgress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>
                            {videoProgress < 30 && 'Initializing AI model...'}
                            {videoProgress >= 30 && videoProgress < 60 && 'Generating frames...'}
                            {videoProgress >= 60 && videoProgress < 90 && 'Composing video...'}
                            {videoProgress >= 90 && 'Finalizing...'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      type="button"
                      onClick={handleAIVideoGenerate}
                      disabled={isGeneratingVideo || !videoPrompt.trim()}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20"
                    >
                      {isGeneratingVideo ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating... ({videoMode === 'quality' ? '2-3 min' : videoMode === 'local' ? '1 min' : '30s'})
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Video
                        </>
                      )}
                    </button>
                  </div>
                ) : showAIGenerator ? (
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
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,audio/*,video/*" onChange={handleFileChange} />
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
                      <p className="text-sm text-zinc-500">Supports Images (PNG, JPG, WEBP), Audio (MP3, WAV, OGG) & Video (MP4, MOV, WEBM) - Max 50MB</p>
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

              {/* Template Selector - Before license configuration */}
              <TemplateSelector
                key={templateRefreshKey}
                userId={user?.id || null}
                onSelect={handleTemplateSelect}
                onClear={handleTemplateClear}
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
                      ) : fileType === 'video' ? (
                        <div className="w-full h-full relative">
                          <video
                            src={preview}
                            controls
                            autoPlay
                            loop
                            muted
                            className="w-full h-full object-contain bg-black"
                          >
                            Your browser does not support the video tag.
                          </video>
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

      {/* Draft Recovery Modal */}
      {showDraftModal && savedDraft && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Draft Found</h3>
              </div>
              <button
                onClick={discardDraft}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <p className="text-zinc-400 mb-4">
              You have an unsaved draft. Would you like to restore it?
            </p>

            {savedDraft.title && (
              <div className="bg-zinc-800/50 p-3 rounded-lg mb-4">
                <p className="text-sm text-zinc-300 font-medium truncate">{savedDraft.title}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Saved {new Date(savedDraft.savedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={discardDraft}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                Discard
              </button>
              <button
                onClick={restoreDraft}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

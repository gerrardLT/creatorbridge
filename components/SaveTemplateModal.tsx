'use client';

import { useState } from 'react';
import { X, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { LicenseType } from '@/lib/types/license';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, overwrite?: boolean) => Promise<void>;
  licenseType: LicenseType;
  mintingFee?: string;
  commercialRevShare?: number;
}

export default function SaveTemplateModal({
  isOpen,
  onClose,
  onSave,
  licenseType,
  mintingFee,
  commercialRevShare,
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (overwrite = false) => {
    if (!name.trim()) {
      setError('Please enter a template name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(name.trim(), overwrite);
      handleClose();
    } catch (err: any) {
      if (err.code === 'DUPLICATE_NAME' && !overwrite) {
        setShowOverwriteConfirm(true);
      } else {
        setError(err.message || 'Failed to save template');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    setShowOverwriteConfirm(false);
    onClose();
  };

  const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
    [LicenseType.NON_COMMERCIAL]: 'Non-Commercial',
    [LicenseType.COMMERCIAL_USE]: 'Commercial Use',
    [LicenseType.COMMERCIAL_REMIX]: 'Commercial Remix',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h3 className="text-lg font-semibold text-white">Save as Template</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {showOverwriteConfirm ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-200 font-medium">Template already exists</p>
                  <p className="text-amber-200/70 text-sm mt-1">
                    A template named "{name}" already exists. Do you want to overwrite it?
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOverwriteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Overwrite'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Template Name Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My License Template"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-zinc-800/30 rounded-xl space-y-2">
                <p className="text-sm text-zinc-400">Template will save:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-white">
                    <span className="text-zinc-500">License Type:</span> {LICENSE_TYPE_LABELS[licenseType]}
                  </p>
                  {mintingFee && (
                    <p className="text-white">
                      <span className="text-zinc-500">Minting Fee:</span> {mintingFee} WIP
                    </p>
                  )}
                  {commercialRevShare !== undefined && (
                    <p className="text-white">
                      <span className="text-zinc-500">Revenue Share:</span> {commercialRevShare}%
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={isSaving || !name.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

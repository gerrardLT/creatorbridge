'use client';

import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
  hasDerivatives?: boolean;
  derivativeCount?: number;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
  hasDerivatives = false,
  derivativeCount = 0,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-red-500/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-lg font-semibold text-white mb-2">{title}</p>
            <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
          </div>

          {hasDerivatives && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-medium text-sm">
                    Cannot Delete - Has Derivatives
                  </p>
                  <p className="text-amber-300/70 text-xs mt-1">
                    This IP has {derivativeCount} derivative work{derivativeCount !== 1 ? 's' : ''}. 
                    You must delete all derivative works before deleting the parent IP.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-zinc-400">
              <strong className="text-red-400">Warning:</strong> This action cannot be undone. 
              The following will be permanently deleted:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              <li>• IP asset metadata and image</li>
              <li>• All associated licenses</li>
              <li>• Transaction history</li>
              <li>• Derivative relationships (if child IP)</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-zinc-900/50 border-t border-zinc-800 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting || hasDerivatives}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

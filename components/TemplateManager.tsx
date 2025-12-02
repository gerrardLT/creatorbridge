'use client';

import { useState, useEffect } from 'react';
import { FileText, Pencil, Trash2, Loader2, Plus } from 'lucide-react';
import { LicenseTemplate } from '@/lib/types/template';
import { LicenseType } from '@/lib/types/license';

interface TemplateManagerProps {
  userId: string | null;
  onEdit?: (template: LicenseTemplate) => void;
}

const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  [LicenseType.NON_COMMERCIAL]: 'Non-Commercial',
  [LicenseType.COMMERCIAL_USE]: 'Commercial Use',
  [LicenseType.COMMERCIAL_REMIX]: 'Commercial Remix',
};

const LICENSE_TYPE_COLORS: Record<LicenseType, string> = {
  [LicenseType.NON_COMMERCIAL]: 'bg-green-500/20 text-green-400',
  [LicenseType.COMMERCIAL_USE]: 'bg-blue-500/20 text-blue-400',
  [LicenseType.COMMERCIAL_REMIX]: 'bg-purple-500/20 text-purple-400',
};

export default function TemplateManager({ userId, onEdit }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<LicenseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchTemplates();
    }
  }, [userId]);

  const fetchTemplates = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/templates?userId=${userId}`);
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setDeletingId(templateId);
    try {
      const res = await fetch(`/api/templates/${templateId}?userId=${userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  if (!userId) {
    return (
      <div className="text-center py-8 text-zinc-500">
        Connect your wallet to manage templates
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-400 mb-2">No templates yet</h3>
        <p className="text-zinc-500 text-sm mb-4">
          Save your license configurations as templates when creating IP assets
        </p>
        <a
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create IP Asset
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">License Templates</h2>
        <span className="text-sm text-zinc-500">{templates.length} template{templates.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${LICENSE_TYPE_COLORS[template.licenseType]}`}>
                    {LICENSE_TYPE_LABELS[template.licenseType]}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                  {template.mintingFee && (
                    <span>
                      <span className="text-zinc-500">Fee:</span> {template.mintingFee} WIP
                    </span>
                  )}
                  {template.commercialRevShare !== null && template.commercialRevShare !== undefined && (
                    <span>
                      <span className="text-zinc-500">Rev Share:</span> {template.commercialRevShare}%
                    </span>
                  )}
                  {template.customTerms && (
                    <span className="text-indigo-400">Custom terms</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(template)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Edit template"
                  >
                    <Pencil className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={deletingId === template.id}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete template"
                >
                  {deletingId === template.id ? (
                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

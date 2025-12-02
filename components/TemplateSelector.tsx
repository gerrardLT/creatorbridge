'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, FileText, Loader2 } from 'lucide-react';
import { LicenseTemplate } from '@/lib/types/template';
import { LicenseType } from '@/lib/types/license';

interface TemplateSelectorProps {
  userId: string | null;
  onSelect: (template: LicenseTemplate) => void;
  disabled?: boolean;
}

const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  [LicenseType.NON_COMMERCIAL]: 'Non-Commercial',
  [LicenseType.COMMERCIAL_USE]: 'Commercial Use',
  [LicenseType.COMMERCIAL_REMIX]: 'Commercial Remix',
};

export default function TemplateSelector({ userId, onSelect, disabled }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<LicenseTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LicenseTemplate | null>(null);

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

  const handleSelect = (template: LicenseTemplate) => {
    setSelectedTemplate(template);
    setIsOpen(false);
    onSelect(template);
  };

  if (!userId || templates.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-zinc-400 mb-2">
        Load from Template
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-left hover:border-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          ) : (
            <FileText className="w-5 h-5 text-zinc-500" />
          )}
          <span className={selectedTemplate ? 'text-white' : 'text-zinc-500'}>
            {selectedTemplate ? selectedTemplate.name : 'Select a template...'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelect(template)}
                className="w-full px-4 py-3 text-left hover:bg-zinc-700/50 transition-colors border-b border-zinc-700/50 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{template.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">
                    {LICENSE_TYPE_LABELS[template.licenseType]}
                  </span>
                </div>
                {(template.mintingFee || template.commercialRevShare) && (
                  <div className="mt-1 text-sm text-zinc-400">
                    {template.mintingFee && <span>{template.mintingFee} WIP</span>}
                    {template.mintingFee && template.commercialRevShare && <span> · </span>}
                    {template.commercialRevShare && <span>{template.commercialRevShare}% rev share</span>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

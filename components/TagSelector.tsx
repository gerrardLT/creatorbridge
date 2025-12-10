'use client';

import { useState, useEffect } from 'react';
import { Tag as TagIcon, X, Loader2 } from 'lucide-react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string | null;
    count?: number;
}

interface TagSelectorProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    disabled?: boolean;
    maxTags?: number;
}

export default function TagSelector({
    selectedTags,
    onChange,
    disabled = false,
    maxTags = 5
}: TagSelectorProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const data = await res.json();
            if (data.tags) {
                setTags(data.tags);
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        if (disabled) return;

        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter(id => id !== tagId));
        } else {
            if (selectedTags.length >= maxTags) {
                return; // Max tags reached
            }
            onChange([...selectedTags, tagId]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <TagIcon size={14} />
                    Tags
                </label>
                <span className="text-xs text-zinc-500">
                    {selectedTags.length}/{maxTags} selected
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);

                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            disabled={disabled || (!isSelected && selectedTags.length >= maxTags)}
                            className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                flex items-center gap-1.5
                ${isSelected
                                    ? 'text-white shadow-lg'
                                    : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:bg-zinc-700/50 hover:text-white'
                                }
                ${disabled || (!isSelected && selectedTags.length >= maxTags)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                }
              `}
                            style={isSelected ? { backgroundColor: tag.color } : undefined}
                        >
                            {tag.icon && <span>{tag.icon}</span>}
                            {tag.name}
                            {isSelected && (
                                <X size={14} className="ml-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedTags.length >= maxTags && (
                <p className="text-xs text-amber-400">
                    Maximum tags limit reached
                </p>
            )}
        </div>
    );
}

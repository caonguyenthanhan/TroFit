import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { getTags, addCustomTag } from '../lib/tags';

export default function TagSelect({ selectedTags = [], onChange }) {
  const [availableTags, setAvailableTags] = useState([]);
  const [newTagLabel, setNewTagLabel] = useState('');

  useEffect(() => {
    setAvailableTags(getTags());
  }, []);

  const handleToggle = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    let newSelected;
    if (isSelected) {
      newSelected = selectedTags.filter(id => id !== tagId);
    } else {
      newSelected = [...selectedTags, tagId];
    }
    onChange(newSelected);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;
    
    const added = addCustomTag(newTagLabel);
    if (added) {
      setAvailableTags(getTags()); // Reload available tags
      if (!selectedTags.includes(added.id)) {
        onChange([...selectedTags, added.id]); // Auto select
      }
      setNewTagLabel('');
    }
  };

  const getCategoryStyles = (category, isActive) => {
    const colors = {
      security: isActive 
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/5',
      convenience: isActive 
        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/5',
      rule: isActive 
        ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-violet-500/30 hover:bg-violet-500/5',
      space: isActive 
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-cyan-500/30 hover:bg-cyan-500/5',
      aesthetic: isActive 
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-500/5',
      location: isActive 
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-amber-500/30 hover:bg-amber-500/5',
      custom: isActive 
        ? 'bg-slate-500/20 text-slate-300 border-slate-500/50' 
        : 'border-slate-800 text-slate-400 hover:border-slate-500/30 hover:bg-slate-500/5'
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="space-y-4">
      {/* List tag chips */}
      <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
        {availableTags.map((tag) => {
          const isActive = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggle(tag.id)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold select-none cursor-pointer transition-all duration-200 ${getCategoryStyles(tag.category, isActive)}`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Input thêm tag mới */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Tag className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={newTagLabel}
            onChange={(e) => setNewTagLabel(e.target.value)}
            className="glass-input w-full pl-9 py-2 text-xs"
            placeholder="Thêm tiện ích khác (VD: Gần phòng Gym, Máy giặt riêng...)"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustom}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

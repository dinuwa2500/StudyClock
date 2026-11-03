import React, { useState, useEffect } from 'react';
import { X, BookMarked, Palette, Check } from 'lucide-react';
import { Subject } from '../../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  editingSubject?: Subject | null;
}

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink / Rose
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F43F5E', // Red
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#64748B', // Slate
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubject,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setColor(editingSubject.color);
    } else {
      setName('');
      setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    }
    setError('');
  }, [editingSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }
    onSave(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                Organize your study time by academic discipline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Organic Chemistry, Algorithms, World History..."
              className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            />
            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-2">
              Color Accent
            </label>
            <div className="grid grid-cols-6 gap-2.5">
              {COLOR_PRESETS.map((c) => {
                const isSelected = color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-slate-400">Custom Hex:</span>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-28 rounded-lg bg-navy-850 border border-slate-750 px-2.5 py-1 text-xs font-mono text-white dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            />
            <div
              className="h-6 w-6 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: color }}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-end gap-3 dark:border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500"
            >
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


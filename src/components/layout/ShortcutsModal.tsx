import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start, Pause or Resume Study Timer' },
    { key: 'F', desc: 'Finish Current Study Session' },
    { key: 'R', desc: 'Reset Timer (with confirmation)' },
    { key: 'M', desc: 'Toggle Fullscreen Focus Mode' },
    { key: 'D / 1', desc: 'Go to Dashboard' },
    { key: 'T / 2', desc: 'Go to Study Timer' },
    { key: 'A / 3', desc: 'Go to Analytics & Charts' },
    { key: 'H / 4', desc: 'Go to Study Session History' },
    { key: 'S / 5', desc: 'Go to Subject Management' },
    { key: 'G / 6', desc: 'Go to Goals & Streaks' },
    { key: '?', desc: 'Open / Close this shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close open dialogs or exit focus mode' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                Speed up your study workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-navy-850/60 border border-slate-800/80 hover:border-slate-700 transition-colors dark:bg-navy-850/60 dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200"
            >
              <span className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                {sc.desc}
              </span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-lg shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center text-[11px] text-slate-400 dark:border-slate-800 light:border-slate-200">
          Tip: Shortcuts are active unless typing in an input field.
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  Database,
  CheckCircle2,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportDataBackup } from '../../utils/export';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    resetAllData,
    restoreData,
    refreshFromDB,
    dbConnected,
    isSyncing,
    sessions,
    subjects,
    goals,
  } = useData();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportDataBackup({ sessions, subjects, goals });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        restoreData(parsed);
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    resetAllData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-slate-750 p-6 sm:p-7 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">
                Preferences & Database
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                Configure StudyClock settings and view MongoDB status
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

        <div className="mt-5 space-y-5">
          
          {/* MongoDB Cloud Database Status */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-navy-850 to-purple-950/20 border border-purple-500/30 dark:bg-navy-850 dark:border-purple-500/30 light:bg-purple-50/50 light:border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                      MongoDB Atlas Cluster
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[260px]">
                    cluster0.mndhh.mongodb.net
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshFromDB}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>

          {/* General: Theme & Sound */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              General
            </h4>

            {/* Theme Toggle Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850 border border-slate-800 dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
                <div>
                  <div className="text-xs font-semibold text-white dark:text-white light:text-slate-900">Theme Mode</div>
                  <div className="text-[11px] text-slate-400">Currently in {theme === 'dark' ? 'Dark Navy' : 'Light Clean'} mode</div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-navy-800 border border-slate-700 text-slate-200 hover:text-white dark:bg-navy-800 light:bg-white light:border-slate-300 light:text-slate-800"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Audio Toggle Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850 border border-slate-800 dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="h-5 w-5 text-purple-400" /> : <VolumeX className="h-5 w-5 text-rose-400" />}
                <div>
                  <div className="text-xs font-semibold text-white dark:text-white light:text-slate-900">Sound Effects & Alerts</div>
                  <div className="text-[11px] text-slate-400">Audio chimes when sessions finish or buttons are pressed</div>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  soundEnabled
                    ? 'bg-purple-600 text-white'
                    : 'bg-navy-800 border border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Backup & Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Data Portability
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-850 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-colors dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200 light:text-slate-800"
              >
                <Download className="h-4 w-4 text-purple-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-850 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-colors dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200 light:text-slate-800"
              >
                <Upload className="h-4 w-4 text-blue-400" />
                <span>Import Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> {importStatus}
              </p>
            )}
          </div>

          {/* Reset All Data Section */}
          <div className="pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All Data & Clear Storage</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Warning: All sessions, custom subjects and goals will be cleared from database and storage.</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-md shadow-rose-600/30"
                  >
                    Yes, Reset Everything
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

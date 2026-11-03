import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  CheckCircle,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Keyboard,
  Settings,
  Sparkles,
  Menu,
  X,
  Flame,
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useData } from '../../context/DataContext';
import { formatMsToHHMMSS } from '../../utils/time';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenShortcuts,
  onOpenSettings,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { status, elapsedMs, pauseTimer, resumeTimer, finishSession, subjectId } = useTimer();
  const { subjects, theme, toggleTheme, soundEnabled, toggleSound, stats } = useData();
  const [currentWallTime, setCurrentWallTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentWallTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-navy-950/80 light:border-slate-200 light:bg-white/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-600"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5 text-white" />
              {status === 'running' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-purple-200 light:from-slate-900 light:via-indigo-900 light:to-purple-900">
                  StudyClock
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Precision Study Tracker
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Timer Pill (Persistent across all tabs!) */}
        <div className="hidden md:flex items-center">
          {status !== 'idle' ? (
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-navy-900/90 border border-purple-500/30 shadow-lg shadow-purple-500/10 backdrop-blur-sm dark:bg-navy-900/90 light:bg-slate-100 light:border-purple-300">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: activeSubject?.color || '#8B5CF6' }}
                />
                <span className="text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 max-w-[100px] truncate">
                  {activeSubject?.name || 'Studying'}
                </span>
                {status === 'running' ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Paused
                  </span>
                )}
              </div>

              <div className="font-mono text-base font-bold text-white tracking-wider dark:text-white light:text-slate-900 min-w-[70px]">
                {formatMsToHHMMSS(elapsedMs)}
              </div>

              <div className="flex items-center gap-1 border-l border-slate-750 pl-2 dark:border-slate-750 light:border-slate-300">
                {status === 'running' ? (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    title="Pause timer (Space)"
                    className="p-1 rounded-md text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeTimer}
                    title="Resume timer (Space)"
                    className="p-1 rounded-md text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={finishSession}
                  title="Finish session (F)"
                  className="p-1 rounded-md text-purple-400 hover:bg-purple-400/10 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/40 border border-slate-800 text-xs text-slate-400 dark:bg-navy-900/40 light:bg-slate-100 light:border-slate-200">
              <span className="font-mono">{currentWallTime}</span>
              {stats.currentStreakDays > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="h-3.5 w-3.5 fill-amber-400" />
                    {stats.currentStreakDays} {stats.currentStreakDays === 1 ? 'day' : 'days'} streak
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Sound, Theme, Shortcuts, Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-rose-400" />}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Keyboard shortcuts */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors hidden sm:block dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
          >
            <Keyboard className="h-5 w-5" />
          </button>

          {/* Settings / Reset / Data modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings & Data Management"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Quick Start / Focus button */}
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className="ml-1 sm:ml-2 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Study Timer</span>
          </button>
        </div>

      </div>
    </header>
  );
};


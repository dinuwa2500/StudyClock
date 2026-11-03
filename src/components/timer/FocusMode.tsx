import React from 'react';
import { Play, Pause, CheckCircle2, RotateCcw, Minimize2, Sparkles, BookOpen } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useData } from '../../context/DataContext';
import { formatMsToHHMMSS, formatDurationFriendly } from '../../utils/time';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';

export const FocusMode: React.FC = () => {
  const {
    isFocusMode,
    toggleFocusMode,
    status,
    elapsedMs,
    pauseTimer,
    resumeTimer,
    finishSession,
    resetTimer,
    subjectId,
    notes,
  } = useTimer();

  const { subjects } = useData();

  if (!isFocusMode) return null;

  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-navy-950 p-6 sm:p-12 text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
            style={{ backgroundColor: `${currentSubject?.color}33`, color: currentSubject?.color }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">
                {currentSubject?.name}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Focus Mode
              </span>
            </div>
            {notes && (
              <p className="text-xs text-slate-400 max-w-md truncate">
                {notes}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Focus Mode (Esc or M)"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="hidden sm:inline">Exit Fullscreen</span>
        </button>
      </div>

      {/* Main Center Stage: Huge Digital Clock */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative group">
          {/* Pulsing ambient glow */}
          <div
            className={`pointer-events-none absolute -inset-8 rounded-full blur-3xl transition-opacity duration-1000 ${
              status === 'running' ? 'opacity-40 bg-purple-600/30' : 'opacity-10 bg-slate-600/20'
            }`}
          />

          <div className="relative font-mono font-black text-6xl sm:text-8xl md:text-9xl tracking-tight text-white drop-shadow-2xl select-none">
            {formatMsToHHMMSS(elapsedMs)}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-400">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span>{status === 'running' ? 'Session in progress' : 'Session paused'}</span>
          <span>•</span>
          <span className="text-purple-300 font-mono">
            {formatDurationFriendly(Math.round(elapsedMs / 1000))} studied
          </span>
        </div>

        {/* Large Controls */}
        <div className="mt-12 flex items-center gap-4 sm:gap-6">
          {status === 'running' ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-base hover:bg-amber-500/30 shadow-lg shadow-amber-500/10 transition-all hover:scale-105"
            >
              <Pause className="h-6 w-6" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
            >
              <Play className="h-6 w-6" />
              <span>Resume Study</span>
            </button>
          )}

          <button
            onClick={finishSession}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-750 text-slate-200 font-semibold text-base hover:bg-slate-800 hover:text-white transition-all hover:scale-105"
          >
            <CheckCircle2 className="h-6 w-6 text-purple-400" />
            <span>Finish Session</span>
          </button>
        </div>
      </div>

      {/* Bottom bar with shortcuts tip */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 border-t border-slate-900 pt-4">
        <span>Space: Pause / Resume • F: Finish Session • Esc: Exit Focus Mode</span>
        <div className="max-w-md w-full">
          <AmbientSoundPlayer />
        </div>
      </div>

    </div>
  );
};


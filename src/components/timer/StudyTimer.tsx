import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  BookOpen,
  FileText,
  Volume2,
  Flame,
  Clock,
  Sparkles,
  Timer as TimerIcon,
  AlertTriangle,
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useData } from '../../context/DataContext';
import { formatMsToHHMMSS, formatDurationFriendly, formatClockTime } from '../../utils/time';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { FinishModal } from './FinishModal';
import { FocusMode } from './FocusMode';

export const StudyTimer: React.FC = () => {
  const {
    status,
    mode,
    elapsedMs,
    subjectId,
    notes,
    targetMs,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishSession,
    setSubjectId,
    setNotes,
    setMode,
    toggleFocusMode,
  } = useTimer();

  const { subjects, stats } = useData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';

  // For countdown mode: calculate remaining ms
  const displayMs = mode === 'countdown' && targetMs
    ? Math.max(0, targetMs - elapsedMs)
    : elapsedMs;

  const handleStart = () => {
    startTimer(subjectId);
  };

  const handleReset = () => {
    resetTimer();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <FinishModal />
      <FocusMode />

      {/* Main Stopwatch / Timer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-purple-950/20 border border-purple-500/20 p-6 sm:p-10 shadow-2xl dark:from-navy-900 dark:via-navy-850 dark:to-purple-950/20 dark:border-purple-500/20 light:from-white light:via-purple-50/30 light:to-indigo-50/40 light:border-purple-200">
        
        {/* Top bar inside card */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          
          {/* Mode switch: Stopwatch vs Countdown */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-950/70 border border-slate-800 text-xs dark:bg-navy-950/70 dark:border-slate-800 light:bg-slate-100 light:border-slate-200">
            <button
              type="button"
              onClick={() => isIdle && setMode('stopwatch')}
              disabled={!isIdle}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'stopwatch'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-50'
              }`}
            >
              Stopwatch
            </button>
            <button
              type="button"
              onClick={() => isIdle && setMode('countdown', 25)}
              disabled={!isIdle}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mode === 'countdown' && targetMs === 25 * 60 * 1000
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-50'
              }`}
            >
              25m Pomodoro
            </button>
            <button
              type="button"
              onClick={() => isIdle && setMode('countdown', 45)}
              disabled={!isIdle}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all hidden sm:inline-block ${
                mode === 'countdown' && targetMs === 45 * 60 * 1000
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-50'
              }`}
            >
              45m Deep Work
            </button>
            <button
              type="button"
              onClick={() => isIdle && setMode('countdown', 60)}
              disabled={!isIdle}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all hidden md:inline-block ${
                mode === 'countdown' && targetMs === 60 * 60 * 1000
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 disabled:opacity-50'
              }`}
            >
              60m Sprint
            </button>
          </div>

          {/* Right actions: Focus Mode toggle */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950/70 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors dark:bg-navy-950/70 dark:border-slate-800 light:bg-slate-100 light:border-slate-200 light:text-slate-700"
            title="Open distraction-free fullscreen mode (M)"
          >
            <Maximize2 className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">Focus Mode</span>
          </button>
        </div>

        {/* Center: Massive Digital Clock Display */}
        <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
          
          {/* Active Status Badge */}
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border shadow-sm">
            {isRunning ? (
              <span className="inline-flex items-center gap-2 text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Active Study Session
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-2 text-amber-400 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Session Paused
              </span>
            ) : (
              <span className="text-slate-400 border-slate-700 bg-slate-800/60 px-2 py-0.5 rounded-full">
                Ready to Study
              </span>
            )}

            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentSubject?.color }} />
              {currentSubject?.name}
            </span>
          </div>

          {/* Large Digital Stopwatch Numbers */}
          <div className="relative font-mono font-black text-6xl sm:text-7xl md:text-8xl tracking-tight text-white select-none drop-shadow-xl dark:text-white light:text-slate-900">
            {formatMsToHHMMSS(displayMs)}
          </div>

          <div className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">
            {mode === 'countdown' ? 'Remaining in target sprint' : 'Elapsed focus time'}
            {elapsedMs > 0 && (
              <span className="text-purple-400 ml-2 font-mono">
                ({formatDurationFriendly(Math.round(elapsedMs / 1000))})
              </span>
            )}
          </div>

          {/* Big Control Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            
            {/* Start Button (when idle) */}
            {isIdle && (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Start Session</span>
              </button>
            )}

            {/* Pause Button (when running) */}
            {isRunning && (
              <button
                type="button"
                onClick={pauseTimer}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-base hover:bg-amber-500/30 shadow-lg shadow-amber-500/10 transition-all hover:scale-105"
              >
                <Pause className="h-5 w-5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {/* Resume Button (when paused) */}
            {isPaused && (
              <button
                type="button"
                onClick={resumeTimer}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            {/* Finish Session Button (when running or paused) */}
            {!isIdle && (
              <button
                type="button"
                onClick={finishSession}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all hover:scale-105"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Finish & Record</span>
              </button>
            )}

            {/* Reset Button (when paused or running) */}
            {!isIdle && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-navy-800 border border-slate-750 text-slate-300 font-semibold text-xs hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-all dark:bg-navy-800 dark:border-slate-750 light:bg-slate-100 light:border-slate-200 light:text-slate-700"
                title="Discard session"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}

          </div>

          {/* Reset Confirmation Prompt */}
          {showResetConfirm && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-left">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Are you sure you want to discard this active timer session?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                >
                  Yes, Discard
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 rounded-lg text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Configuration Bar: Subject Selector & Notes */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 dark:border-slate-800 light:border-slate-200">
          
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
              Select Study Subject
            </label>
            <div className="relative">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900 cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
              Session Goal / Notes (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Chapter 4 practice questions, formula sheet review..."
                className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Ambient Sound Player Component */}
      <AmbientSoundPlayer />
    </div>
  );
};


import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { TimerStatus, TimerMode, ActiveTimerState, StudySession } from '../types';
import {
  loadActiveTimerState,
  saveActiveTimerState,
  clearActiveTimerState,
} from '../utils/storage';
import { soundEngine } from '../utils/sound';
import { useData } from './DataContext';
import confetti from 'canvas-confetti';

interface TimerContextType {
  status: TimerStatus;
  mode: TimerMode;
  elapsedMs: number;
  elapsedSeconds: number;
  subjectId: string;
  notes: string;
  targetMs?: number;
  isFinishModalOpen: boolean;
  isFocusMode: boolean;
  startTimer: (subjectId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  finishSession: () => void;
  confirmFinishSession: (notes?: string, rating?: number) => StudySession | null;
  cancelFinishModal: () => void;
  setSubjectId: (id: string) => void;
  setNotes: (notes: string) => void;
  setMode: (mode: TimerMode, targetMinutes?: number) => void;
  toggleFocusMode: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { subjects, addSession } = useData();

  // Load persistent timer state or default
  const [timerState, setTimerState] = useState<ActiveTimerState>(() => {
    const loaded = loadActiveTimerState();
    // Default subject to first available if not set
    if (!loaded.subjectId && subjects.length > 0) {
      loaded.subjectId = subjects[0].id;
    }
    return loaded;
  });

  const [elapsedMs, setElapsedMs] = useState<number>(() => {
    if (timerState.status === 'running' && timerState.startTime) {
      return timerState.accumulatedMs + Math.max(0, Date.now() - timerState.startTime);
    }
    return timerState.accumulatedMs;
  });

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveActiveTimerState(timerState);
  }, [timerState]);

  // Reliable timestamp-based ticker
  useEffect(() => {
    if (timerState.status !== 'running' || !timerState.startTime) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const currentSegment = Math.max(0, now - (timerState.startTime || now));
      const total = timerState.accumulatedMs + currentSegment;
      setElapsedMs(total);

      // Check countdown target
      if (timerState.mode === 'countdown' && timerState.targetMs && total >= timerState.targetMs) {
        soundEngine.playChime();
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
        // Auto-pause and open finish modal
        setTimerState((prev) => ({
          ...prev,
          status: 'paused',
          accumulatedMs: total,
          startTime: null,
        }));
        setIsFinishModalOpen(true);
      }
    };

    updateTimer(); // immediate run
    const intervalId = window.setInterval(updateTimer, 200);

    return () => clearInterval(intervalId);
  }, [timerState.status, timerState.startTime, timerState.accumulatedMs, timerState.mode, timerState.targetMs]);

  // Start timer
  const startTimer = useCallback((subId?: string) => {
    const now = Date.now();
    soundEngine.playStartBeep();
    setTimerState((prev) => ({
      ...prev,
      status: 'running',
      startTime: now,
      accumulatedMs: 0,
      subjectId: subId || prev.subjectId || (subjects[0]?.id ?? 'sub-math'),
    }));
    setElapsedMs(0);
  }, [subjects]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerState.status !== 'running') return;
    const now = Date.now();
    const additional = timerState.startTime ? Math.max(0, now - timerState.startTime) : 0;
    const newAccumulated = timerState.accumulatedMs + additional;

    soundEngine.playPauseBeep();
    setTimerState((prev) => ({
      ...prev,
      status: 'paused',
      startTime: null,
      accumulatedMs: newAccumulated,
    }));
    setElapsedMs(newAccumulated);
  }, [timerState.status, timerState.startTime, timerState.accumulatedMs]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (timerState.status !== 'paused') return;
    const now = Date.now();
    soundEngine.playStartBeep();
    setTimerState((prev) => ({
      ...prev,
      status: 'running',
      startTime: now,
    }));
  }, [timerState.status]);

  // Reset timer
  const resetTimer = useCallback(() => {
    clearActiveTimerState();
    setTimerState((prev) => ({
      ...prev,
      status: 'idle',
      startTime: null,
      accumulatedMs: 0,
      notes: '',
    }));
    setElapsedMs(0);
    setIsFinishModalOpen(false);
  }, []);

  // Request finish session (opens modal)
  const finishSession = useCallback(() => {
    if (timerState.status === 'running') {
      pauseTimer();
    }
    setIsFinishModalOpen(true);
  }, [timerState.status, pauseTimer]);

  // Confirm and persist finished session
  const confirmFinishSession = useCallback((finalNotes?: string, rating?: number): StudySession | null => {
    const totalSeconds = Math.round(elapsedMs / 1000);
    if (totalSeconds < 5) {
      alert('Session duration is less than 5 seconds. Continue studying a bit more to record a session!');
      return null;
    }

    const currentSub = subjects.find((s) => s.id === timerState.subjectId) || subjects[0] || {
      id: 'sub-other',
      name: 'Other',
      color: '#64748B',
    };

    const endTime = Date.now();
    const startTime = endTime - (totalSeconds * 1000);

    const saved = addSession({
      subjectId: currentSub.id,
      subjectName: currentSub.name,
      subjectColor: currentSub.color,
      startTime,
      endTime,
      durationSeconds: totalSeconds,
      notes: finalNotes !== undefined ? finalNotes : timerState.notes,
      rating: rating || 5,
    });

    // Play celebration audio and confetti
    soundEngine.playChime();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#EC4899'],
      });
    } catch {
      // ignore
    }

    // Reset timer
    resetTimer();
    setIsFinishModalOpen(false);
    return saved;
  }, [elapsedMs, subjects, timerState.subjectId, timerState.notes, addSession, resetTimer]);

  const cancelFinishModal = useCallback(() => {
    setIsFinishModalOpen(false);
  }, []);

  const setSubjectId = useCallback((id: string) => {
    setTimerState((prev) => ({ ...prev, subjectId: id }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setTimerState((prev) => ({ ...prev, notes }));
  }, []);

  const setMode = useCallback((mode: TimerMode, targetMinutes?: number) => {
    const targetMs = targetMinutes ? targetMinutes * 60 * 1000 : undefined;
    setTimerState((prev) => ({ ...prev, mode, targetMs }));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return (
    <TimerContext.Provider
      value={{
        status: timerState.status,
        mode: timerState.mode,
        elapsedMs,
        elapsedSeconds,
        subjectId: timerState.subjectId,
        notes: timerState.notes,
        targetMs: timerState.targetMs,
        isFinishModalOpen,
        isFocusMode,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        finishSession,
        confirmFinishSession,
        cancelFinishModal,
        setSubjectId,
        setNotes,
        setMode,
        toggleFocusMode,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};


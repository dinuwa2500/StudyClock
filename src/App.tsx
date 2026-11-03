import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { TimerProvider, useTimer } from './context/TimerContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ShortcutsModal } from './components/layout/ShortcutsModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudyTimer } from './components/timer/StudyTimer';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SessionHistory } from './components/history/SessionHistory';
import { SubjectList } from './components/subjects/SubjectList';
import { GoalManager } from './components/goals/GoalManager';
import { ActiveTab } from './types';
import { AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const {
    status,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishSession,
    resetTimer,
    toggleFocusMode,
    isFocusMode,
  } = useTimer();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsSettingsOpen(false);
        setIsDiscardModalOpen(false);
        if (isFocusMode) {
          toggleFocusMode();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (status === 'running') {
          pauseTimer();
        } else if (status === 'paused') {
          resumeTimer();
        } else {
          startTimer();
        }
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        if (status !== 'idle') {
          finishSession();
        }
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        if (status !== 'idle') {
          setIsDiscardModalOpen(true);
        }
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        toggleFocusMode();
        return;
      }

      // Tab navigation shortcuts
      if (e.key === '1' || e.key.toLowerCase() === 'd') {
        setActiveTab('dashboard');
      } else if (e.key === '2' || e.key.toLowerCase() === 't') {
        setActiveTab('timer');
      } else if (e.key === '3' || e.key.toLowerCase() === 'a') {
        setActiveTab('analytics');
      } else if (e.key === '4' || e.key.toLowerCase() === 'h') {
        setActiveTab('history');
      } else if (e.key === '5' || e.key.toLowerCase() === 's') {
        setActiveTab('subjects');
      } else if (e.key === '6' || e.key.toLowerCase() === 'g') {
        setActiveTab('goals');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    status,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishSession,
    resetTimer,
    toggleFocusMode,
    isFocusMode,
  ]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col dark:bg-navy-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-800 transition-colors">
      {/* Modals */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Non-blocking Discard Confirmation Modal */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                  Discard Active Session?
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                  Are you sure you want to discard current timer progress?
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetTimer();
                  setIsDiscardModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30"
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'timer' && <StudyTimer />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'history' && <SessionHistory />}
          {activeTab === 'subjects' && <SubjectList setActiveTab={setActiveTab} />}
          {activeTab === 'goals' && <GoalManager />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DataProvider>
      <TimerProvider>
        <MainLayout />
      </TimerProvider>
    </DataProvider>
  );
};

export default App;

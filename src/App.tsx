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

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          if (confirm('Are you sure you want to discard this active timer session?')) {
            resetTimer();
          }
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


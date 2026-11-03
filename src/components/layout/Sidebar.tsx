import React from 'react';
import {
  LayoutDashboard,
  Timer,
  BarChart3,
  History,
  BookMarked,
  Target,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useData } from '../../context/DataContext';
import { useTimer } from '../../context/TimerContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { stats, goals } = useData();
  const { status } = useTimer();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'timer' as ActiveTab,
      label: 'Study Timer',
      icon: Timer,
      badge: status === 'running' ? 'LIVE' : status === 'paused' ? 'PAUSED' : undefined,
      badgeColor: status === 'running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Study History',
      icon: History,
      badge: stats.totalSessions > 0 ? String(stats.totalSessions) : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'subjects' as ActiveTab,
      label: 'Subjects',
      icon: BookMarked,
      badge: undefined,
    },
    {
      id: 'goals' as ActiveTab,
      label: 'Goals & Streaks',
      icon: Target,
      badge: `${stats.dailyGoalCompletionPercent}%`,
      badgeColor: stats.dailyGoalCompletionPercent >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-300',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-navy-900 border-r border-slate-800/80 p-4 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 dark:bg-navy-900 dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="space-y-6">
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 lg:hidden dark:border-slate-800 light:border-slate-200">
            <span className="font-bold text-white text-base dark:text-white light:text-slate-900">
              StudyClock Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white border border-purple-500/30 shadow-md shadow-purple-500/5 dark:text-white light:bg-purple-50 light:text-purple-900 light:border-purple-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-500/30 text-purple-300 dark:text-purple-300 light:bg-purple-600 light:text-white'
                          : 'text-slate-400 group-hover:text-slate-200 dark:text-slate-400 dark:group-hover:text-slate-200 light:text-slate-500 light:group-hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quick Card: Daily Progress Widget */}
        <div className="pt-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-850 border border-slate-750 shadow-inner dark:from-navy-800 dark:to-navy-850 dark:border-slate-750 light:from-white light:to-slate-100 light:border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                Daily Goal
              </span>
              <span className="font-mono text-purple-400 font-bold dark:text-purple-400 light:text-purple-600">
                {stats.dailyGoalCompletionPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden dark:bg-slate-700/50 light:bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.dailyGoalCompletionPercent)}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
              <span>{(stats.todaySeconds / 3600).toFixed(1)}h studied</span>
              <span>Target {goals.dailyHours}h</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};


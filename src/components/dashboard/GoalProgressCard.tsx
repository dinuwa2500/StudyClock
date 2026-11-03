import React from 'react';
import { Target, CheckCircle, Flame, ArrowRight, Trophy } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDurationFriendly } from '../../utils/time';
import { ActiveTab } from '../../types';

interface GoalProgressCardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ setActiveTab }) => {
  const { stats, goals } = useData();

  const dailyProgress = Math.min(100, stats.dailyGoalCompletionPercent);
  const weeklyProgress = Math.min(100, stats.weeklyGoalCompletionPercent);

  const isDailyGoalMet = stats.dailyGoalCompletionPercent >= 100;
  const isWeeklyGoalMet = stats.weeklyGoalCompletionPercent >= 100;

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              Study Goals & Consistency
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              Track daily and weekly milestones
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('goals')}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Manage</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <div className="p-4 rounded-xl bg-navy-850 border border-slate-750/80 dark:bg-navy-850 dark:border-slate-750/80 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
              Today's Goal ({goals.dailyHours} hrs)
            </span>
            <div className="flex items-center gap-1.5">
              {isDailyGoalMet && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="h-3 w-3" /> Met!
                </span>
              )}
              <span className="font-mono text-xs font-bold text-purple-400 dark:text-purple-400 light:text-purple-600">
                {stats.dailyGoalCompletionPercent}%
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-700/60 rounded-full overflow-hidden dark:bg-slate-700/60 light:bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDailyGoalMet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            <span>{formatDurationFriendly(stats.todaySeconds)} completed</span>
            <span>
              {isDailyGoalMet
                ? 'Great job!'
                : `${formatDurationFriendly(Math.max(0, goals.dailyHours * 3600 - stats.todaySeconds))} remaining`}
            </span>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="p-4 rounded-xl bg-navy-850 border border-slate-750/80 dark:bg-navy-850 dark:border-slate-750/80 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
              Weekly Goal ({goals.weeklyHours} hrs)
            </span>
            <div className="flex items-center gap-1.5">
              {isWeeklyGoalMet && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Trophy className="h-3 w-3" /> Met!
                </span>
              )}
              <span className="font-mono text-xs font-bold text-blue-400 dark:text-blue-400 light:text-blue-600">
                {stats.weeklyGoalCompletionPercent}%
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-700/60 rounded-full overflow-hidden dark:bg-slate-700/60 light:bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isWeeklyGoalMet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            <span>{(stats.weeklySeconds / 3600).toFixed(1)}h completed</span>
            <span>
              {isWeeklyGoalMet
                ? 'Target achieved!'
                : `${Math.max(0, Number((goals.weeklyHours - stats.weeklySeconds / 3600).toFixed(1)))}h remaining`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


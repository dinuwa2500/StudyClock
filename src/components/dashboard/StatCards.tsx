import React from 'react';
import {
  Clock,
  Calendar,
  Flame,
  Award,
  Layers,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDurationFriendly, formatSecondsToHHMMSS } from '../../utils/time';

export const StatCards: React.FC = () => {
  const { stats, goals } = useData();

  const cards = [
    {
      title: "Today's Study Time",
      value: formatDurationFriendly(stats.todaySeconds),
      subtext: `${formatSecondsToHHMMSS(stats.todaySeconds)} total`,
      comparison: `${stats.dailyGoalCompletionPercent}% of ${goals.dailyHours}h target`,
      icon: Clock,
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      accentColor: 'text-purple-400',
    },
    {
      title: "Weekly Study Time",
      value: formatDurationFriendly(stats.weeklySeconds),
      subtext: `${(stats.weeklySeconds / 3600).toFixed(1)} hrs this week`,
      comparison: `${stats.weeklyGoalCompletionPercent}% of ${goals.weeklyHours}h target`,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      accentColor: 'text-blue-400',
    },
    {
      title: "Study Streak",
      value: `${stats.currentStreakDays} ${stats.currentStreakDays === 1 ? 'Day' : 'Days'}`,
      subtext: `Best streak: ${stats.bestStreakDays} ${stats.bestStreakDays === 1 ? 'day' : 'days'}`,
      comparison: stats.currentStreakDays > 0 ? 'Consistent habit!' : 'Study today to build streak',
      icon: Flame,
      color: 'from-amber-500 to-rose-600',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      accentColor: 'text-amber-400',
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions.toString(),
      subtext: `${(stats.allTimeSeconds / 3600).toFixed(1)} hrs all-time`,
      comparison: `Avg ${(stats.averageDailySeconds / 3600).toFixed(1)}h / active day`,
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      accentColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200"
          >
            {/* Ambient subtle corner glow on hover */}
            <div className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.color} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
                {card.title}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md shadow-purple-500/10 group-hover:scale-110 transition-transform`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900">
                {card.value}
              </div>
              <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                {card.subtext}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs dark:border-slate-800/80 light:border-slate-100">
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 truncate mr-2">
                {card.comparison}
              </span>
              <ArrowUpRight className={`h-3.5 w-3.5 ${card.accentColor} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};


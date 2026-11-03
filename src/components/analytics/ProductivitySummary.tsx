import React from 'react';
import { Award, Clock, Flame, Calendar, Layers, BarChart2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDurationFriendly } from '../../utils/time';

export const ProductivitySummary: React.FC = () => {
  const { stats } = useData();

  const metrics = [
    {
      title: 'Most Productive Day',
      value: stats.mostProductiveDayName,
      subtext: `${(stats.mostProductiveDaySeconds / 3600).toFixed(1)} hrs peak`,
      icon: Award,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Daily Average',
      value: formatDurationFriendly(stats.averageDailySeconds),
      subtext: 'across active study days',
      icon: Clock,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'All-Time Hours',
      value: `${(stats.allTimeSeconds / 3600).toFixed(1)} hrs`,
      subtext: `${stats.totalSessions} total recorded sessions`,
      icon: BarChart2,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Study Habit Streak',
      value: `${stats.currentStreakDays} ${stats.currentStreakDays === 1 ? 'day' : 'days'}`,
      subtext: `All-time high: ${stats.bestStreakDays} days`,
      icon: Flame,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">
                {m.title}
              </span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900">
                {m.value}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {m.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


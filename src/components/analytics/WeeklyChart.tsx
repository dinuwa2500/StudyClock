import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useData } from '../../context/DataContext';

export const WeeklyChart: React.FC = () => {
  const { sessions, goals, theme } = useData();
  const isDark = theme === 'dark';

  const weeklyData = useMemo(() => {
    const weeks: { name: string; hours: number; count: number }[] = [];
    const now = new Date();
    const oneWeekMs = 7 * 24 * 3600 * 1000;

    for (let i = 7; i >= 0; i--) {
      const weekEnd = now.getTime() - i * oneWeekMs;
      const weekStart = weekEnd - oneWeekMs;

      let weekSeconds = 0;
      let sessionCount = 0;

      sessions.forEach((s) => {
        if (s.startTime >= weekStart && s.startTime < weekEnd) {
          weekSeconds += s.durationSeconds;
          sessionCount++;
        }
      });

      const labelDate = new Date(weekEnd);
      weeks.push({
        name: i === 0 ? 'This Wk' : i === 1 ? 'Last Wk' : `${labelDate.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}`,
        hours: Number((weekSeconds / 3600).toFixed(1)),
        count: sessionCount,
      });
    }
    return weeks;
  }, [sessions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-navy-950 border border-blue-500/30 p-3 shadow-xl text-xs dark:bg-navy-950 light:bg-white light:border-slate-200">
          <p className="font-bold text-white dark:text-white light:text-slate-900">{data.name}</p>
          <p className="text-blue-400 font-semibold mt-1">
            {data.hours} hours ({data.count} sessions)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
            Weekly Study Time (Last 8 Weeks)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Weekly total volume vs your {goals.weeklyHours}h weekly target
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Target: <span className="text-blue-400 font-bold">{goals.weeklyHours}h / week</span>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="h"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={goals.weeklyHours}
              stroke="#06B6D4"
              strokeDasharray="4 4"
              label={{ value: 'Goal', fill: '#06B6D4', fontSize: 10, position: 'right' }}
            />
            <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


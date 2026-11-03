import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useData } from '../../context/DataContext';

export const DailyChart: React.FC = () => {
  const { daySummaries, goals, theme } = useData();

  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-navy-950 border border-purple-500/30 p-3 shadow-xl text-xs dark:bg-navy-950 light:bg-white light:border-slate-200">
          <p className="font-bold text-white dark:text-white light:text-slate-900">{data.date}</p>
          <p className="text-purple-400 font-semibold mt-1">
            {data.totalHours} hours studied
          </p>
          <p className="text-slate-400 text-[11px]">
            {data.sessionCount} {data.sessionCount === 1 ? 'session' : 'sessions'}
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
            Daily Study Time (Last 14 Days)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Daily tracked focus hours compared to your {goals.dailyHours}h daily goal
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple-500 inline-block" />
            Study Hours
          </span>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis
              dataKey="formattedDate"
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
            <Bar dataKey="totalHours" radius={[6, 6, 0, 0]}>
              {daySummaries.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.totalHours >= goals.dailyHours ? '#8B5CF6' : '#6366F1'}
                  opacity={entry.totalHours > 0 ? 0.9 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


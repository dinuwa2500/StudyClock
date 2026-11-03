import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useData } from '../../context/DataContext';

export const MonthlyChart: React.FC = () => {
  const { sessions, theme } = useData();
  const isDark = theme === 'dark';

  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Past 6 calendar months
    const result: { name: string; hours: number; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthStart = new Date(yr, mIdx, 1).getTime();
      const monthEnd = new Date(yr, mIdx + 1, 1).getTime();

      let monthSecs = 0;
      let count = 0;

      sessions.forEach((s) => {
        if (s.startTime >= monthStart && s.startTime < monthEnd) {
          monthSecs += s.durationSeconds;
          count++;
        }
      });

      result.push({
        name: `${months[mIdx]} ${yr !== currentYear ? String(yr).slice(2) : ''}`,
        hours: Number((monthSecs / 3600).toFixed(1)),
        count,
      });
    }

    return result;
  }, [sessions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-navy-950 border border-purple-500/30 p-3 shadow-xl text-xs dark:bg-navy-950 light:bg-white light:border-slate-200">
          <p className="font-bold text-white dark:text-white light:text-slate-900">{data.name}</p>
          <p className="text-purple-400 font-semibold mt-1">
            {data.hours} hours logged
          </p>
          <p className="text-slate-400 text-[11px]">{data.count} sessions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
          Monthly Study Trend
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
          Long-term aggregate monthly focus trajectory
        </p>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#monthlyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


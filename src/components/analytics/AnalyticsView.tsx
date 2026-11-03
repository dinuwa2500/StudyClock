import React, { useState } from 'react';
import { BarChart3, Calendar, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { ProductivitySummary } from './ProductivitySummary';
import { DailyChart } from './DailyChart';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { SubjectPieChart } from './SubjectPieChart';

export const AnalyticsView: React.FC = () => {
  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            Study Analytics & Insights
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Deep dive into your focus consistency, duration trends, and subject breakdown
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-900 border border-slate-800 text-xs dark:bg-navy-900 dark:border-slate-800 light:bg-slate-100 light:border-slate-200">
          <button
            onClick={() => setChartTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              chartTab === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            All Charts
          </button>
          <button
            onClick={() => setChartTab('daily')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              chartTab === 'daily'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setChartTab('weekly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              chartTab === 'weekly'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setChartTab('monthly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              chartTab === 'monthly'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <ProductivitySummary />

      {/* Charts Grid */}
      <div className="space-y-6">
        {(chartTab === 'all' || chartTab === 'daily') && <DailyChart />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(chartTab === 'all' || chartTab === 'weekly') && <WeeklyChart />}
          {(chartTab === 'all' || chartTab === 'monthly') && <MonthlyChart />}
        </div>

        <SubjectPieChart />
      </div>
    </div>
  );
};


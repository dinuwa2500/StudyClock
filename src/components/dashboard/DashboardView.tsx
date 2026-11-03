import React from 'react';
import { LiveClock } from './LiveClock';
import { StatCards } from './StatCards';
import { GoalProgressCard } from './GoalProgressCard';
import { QuickStart } from './QuickStart';
import { RecentActivity } from './RecentActivity';
import { ActiveTab } from '../../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Large Digital Clock */}
      <LiveClock />

      {/* 2. Key Metrics Stat Cards */}
      <StatCards />

      {/* 3. Goal Progress & Quick Study Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalProgressCard setActiveTab={setActiveTab} />
        <QuickStart setActiveTab={setActiveTab} />
      </div>

      {/* 4. Recent Study Activity */}
      <RecentActivity setActiveTab={setActiveTab} />
    </div>
  );
};


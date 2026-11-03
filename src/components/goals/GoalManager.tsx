import React, { useState } from 'react';
import { Target, Trophy, Flame, CheckCircle, Sparkles, Award, Zap } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDurationFriendly } from '../../utils/time';
import confetti from 'canvas-confetti';

export const GoalManager: React.FC = () => {
  const { goals, updateGoals, stats } = useData();

  const [dailyHours, setDailyHours] = useState(goals.dailyHours.toString());
  const [weeklyHours, setWeeklyHours] = useState(goals.weeklyHours.toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(dailyHours) || 1;
    const w = parseFloat(weeklyHours) || 5;

    updateGoals({
      dailyHours: d,
      weeklyHours: w,
    });

    setIsSaved(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const dailyPct = Math.min(100, stats.dailyGoalCompletionPercent);
  const weeklyPct = Math.min(100, stats.weeklyGoalCompletionPercent);

  const streakMilestones = [
    { days: 3, label: 'Ignition', desc: '3 Days Consecutive', achieved: stats.bestStreakDays >= 3 },
    { days: 7, label: 'Habit Builder', desc: '7 Days Consecutive', achieved: stats.bestStreakDays >= 7 },
    { days: 14, label: 'Unstoppable', desc: '14 Days Consecutive', achieved: stats.bestStreakDays >= 14 },
    { days: 30, label: 'Master Scholar', desc: '30 Days Master Streak', achieved: stats.bestStreakDays >= 30 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
          Study Goals & Consistency Streaks
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
          Configure daily and weekly study targets and build unbreakable study habits
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Goal Card */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Target Progress
            </span>
            <span className="font-mono text-sm font-extrabold text-purple-400">
              {stats.dailyGoalCompletionPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white dark:text-white light:text-slate-900">
              {formatDurationFriendly(stats.todaySeconds)}
            </span>
            <span className="text-sm text-slate-400">
              / {goals.dailyHours} hrs goal
            </span>
          </div>

          <div className="mt-4 w-full h-3 bg-slate-800 rounded-full overflow-hidden dark:bg-slate-800 light:bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                dailyPct >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>

          <div className="mt-3 text-xs text-slate-400">
            {dailyPct >= 100 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Goal reached today! Outstanding dedication.
              </span>
            ) : (
              <span>
                {formatDurationFriendly(Math.max(0, goals.dailyHours * 3600 - stats.todaySeconds))} needed to reach today's target.
              </span>
            )}
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Target Progress
            </span>
            <span className="font-mono text-sm font-extrabold text-blue-400">
              {stats.weeklyGoalCompletionPercent}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white dark:text-white light:text-slate-900">
              {(stats.weeklySeconds / 3600).toFixed(1)} hrs
            </span>
            <span className="text-sm text-slate-400">
              / {goals.weeklyHours} hrs goal
            </span>
          </div>

          <div className="mt-4 w-full h-3 bg-slate-800 rounded-full overflow-hidden dark:bg-slate-800 light:bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                weeklyPct >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${weeklyPct}%` }}
            />
          </div>

          <div className="mt-3 text-xs text-slate-400">
            {weeklyPct >= 100 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> Weekly goal conquered!
              </span>
            ) : (
              <span>
                {Math.max(0, Number((goals.weeklyHours - stats.weeklySeconds / 3600).toFixed(1)))} hrs remaining this week.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Goal Settings Form */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
        <div className="pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
            Update Study Targets
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                Daily Goal (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Recommended: 2.0 to 4.0 hours / day</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                Weekly Goal (Hours)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="168"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Recommended: 15 to 30 hours / week</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle className="h-4 w-4" />
                Goals updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-[1.02]"
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>

      {/* Streak Milestones Badges */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
          <Flame className="h-5 w-5 text-amber-400 fill-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              Consistency Milestone Badges
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              Current Streak: {stats.currentStreakDays} days • Best Streak: {stats.bestStreakDays} days
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {streakMilestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-center transition-all ${
                m.achieved
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-200 shadow-md shadow-purple-500/10'
                  : 'bg-navy-850 border-slate-800 text-slate-500 opacity-60 dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200'
              }`}
            >
              <div className="flex justify-center mb-2">
                <div
                  className={`p-2.5 rounded-2xl ${
                    m.achieved ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                {m.label}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {m.desc}
              </p>
              <span
                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  m.achieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {m.achieved ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};


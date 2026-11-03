import React from 'react';
import { Play, Sparkles, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTimer } from '../../context/TimerContext';
import { ActiveTab } from '../../types';

interface QuickStartProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuickStart: React.FC<QuickStartProps> = ({ setActiveTab }) => {
  const { subjects } = useData();
  const { status, startTimer, setSubjectId, subjectId } = useTimer();

  const handleStartWithSubject = (id: string) => {
    setSubjectId(id);
    if (status !== 'running') {
      startTimer(id);
    }
    setActiveTab('timer');
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <div>
          <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Quick Study Launcher
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Pick a subject and begin tracking immediately
          </p>
        </div>

        <button
          onClick={() => setActiveTab('subjects')}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Subject</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {subjects.map((sub) => {
          const isSelected = subjectId === sub.id && status === 'running';

          return (
            <button
              key={sub.id}
              onClick={() => handleStartWithSubject(sub.id)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 group ${
                isSelected
                  ? 'border-purple-500/80 bg-purple-500/15 shadow-md shadow-purple-500/10'
                  : 'border-slate-800/80 bg-navy-850 hover:border-slate-700 hover:bg-navy-800 dark:border-slate-800/80 dark:bg-navy-850 dark:hover:bg-navy-800 light:border-slate-200 light:bg-slate-50 light:hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <div className="p-1 rounded-full bg-slate-800/60 text-slate-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                  <Play className="h-3 w-3 fill-current" />
                </div>
              </div>

              <span className="text-xs font-semibold text-white dark:text-white light:text-slate-900 truncate w-full">
                {sub.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">
                Start session
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


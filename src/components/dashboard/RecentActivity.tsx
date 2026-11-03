import React from 'react';
import { History, ArrowRight, Clock, Star, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDisplayDate, formatDurationFriendly, formatShortTime } from '../../utils/time';
import { ActiveTab } from '../../types';

interface RecentActivityProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ setActiveTab }) => {
  const { sessions } = useData();

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              Recent Sessions
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              Your latest recorded study intervals
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('history')}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View all ({sessions.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        {recentSessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-400 light:text-slate-500">
            No study sessions recorded yet. Start your first session!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-100">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 hover:bg-slate-850/40 rounded-xl px-2 transition-colors dark:hover:bg-slate-850/40 light:hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: session.subjectColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                        {session.subjectName}
                      </span>
                      {session.rating && (
                        <div className="flex items-center text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span className="text-[10px] ml-0.5 font-semibold">{session.rating}</span>
                        </div>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 line-clamp-1 max-w-md mt-0.5">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 light:text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{formatDisplayDate(session.startTime)}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      ({formatShortTime(session.startTime)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    <Clock className="h-3 w-3 text-purple-400" />
                    <span>{formatDurationFriendly(session.durationSeconds)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


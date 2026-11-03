import React, { useState } from 'react';
import { CheckCircle2, Star, Clock, Calendar, Sparkles, X } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useData } from '../../context/DataContext';
import { formatMsToHHMMSS, formatDurationFriendly, formatClockTime } from '../../utils/time';

export const FinishModal: React.FC = () => {
  const { isFinishModalOpen, cancelFinishModal, confirmFinishSession, elapsedMs, notes: initialNotes, subjectId } = useTimer();
  const { subjects } = useData();

  const [notes, setNotes] = useState(initialNotes || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  if (!isFinishModalOpen) return null;

  const currentSubject = subjects.find((s) => s.id === subjectId) || subjects[0];
  const now = Date.now();
  const calculatedStartTime = now - elapsedMs;

  const handleConfirm = () => {
    confirmFinishSession(notes, rating);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-navy-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl dark:bg-navy-900 dark:border-purple-500/30 light:bg-white light:border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={cancelFinishModal}
          className="absolute top-5 right-5 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-500"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white dark:text-white light:text-slate-900">
              Session Finished!
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              Great focus session! Review and record your study entry.
            </p>
          </div>
        </div>

        {/* Duration Highlights Card */}
        <div className="mt-6 rounded-2xl bg-navy-850 border border-slate-750 p-5 text-center dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Study Duration
          </span>
          <div className="font-mono text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-white mt-1 dark:from-purple-300 dark:via-indigo-200 dark:to-white light:from-purple-700 light:via-indigo-700 light:to-slate-900">
            {formatMsToHHMMSS(elapsedMs)}
          </div>
          <div className="mt-1 text-xs text-purple-400 font-medium">
            ≈ {formatDurationFriendly(Math.round(elapsedMs / 1000))} of focused work
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400 dark:border-slate-800 light:border-slate-200">
            <div>
              <span className="block text-[11px] text-slate-500">Subject</span>
              <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-1.5 justify-center mt-0.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentSubject?.color }} />
                {currentSubject?.name}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-200" />
            <div>
              <span className="block text-[11px] text-slate-500">Started</span>
              <span className="font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 mt-0.5 block">
                {formatClockTime(calculatedStartTime)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800 dark:bg-slate-800 light:border-slate-200" />
            <div>
              <span className="block text-[11px] text-slate-500">Ended</span>
              <span className="font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 mt-0.5 block">
                {formatClockTime(now)}
              </span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
            How was your focus during this session?
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-125 transition-transform"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400 drop-shadow'
                      : 'text-slate-700 dark:text-slate-700 light:text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs text-slate-400">
              {rating === 5 ? '🔥 Peak Flow!' : rating === 4 ? '✨ Great Focus' : rating === 3 ? '👍 Good' : '💭 Distracted'}
            </span>
          </div>
        </div>

        {/* Notes input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
            Session Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What concepts did you review? Solved problem sets, chapter pages covered..."
            className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={cancelFinishModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-600"
          >
            Resume Session
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Save Study Session</span>
          </button>
        </div>

      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { X, Edit3, Clock, Calendar, Star } from 'lucide-react';
import { StudySession, Subject } from '../../types';
import { useData } from '../../context/DataContext';
import { toISODateString } from '../../utils/time';

interface EditSessionModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: StudySession) => void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
}) => {
  const { subjects } = useData();

  const [subjectId, setSubjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (session) {
      setSubjectId(session.subjectId);
      setDurationMinutes(Math.round(session.durationSeconds / 60));
      setNotes(session.notes || '');
      setRating(session.rating || 5);
      setDateStr(toISODateString(session.startTime));
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenSub = subjects.find((s) => s.id === subjectId) || subjects[0];
    const durSecs = Math.max(1, durationMinutes * 60);

    // Calculate new start and end timestamps based on dateStr and previous time of day
    const origDate = new Date(session.startTime);
    const [y, m, d] = dateStr.split('-').map(Number);
    const newStart = new Date(y, m - 1, d, origDate.getHours(), origDate.getMinutes(), origDate.getSeconds()).getTime();
    const newEnd = newStart + durSecs * 1000;

    onSave({
      ...session,
      subjectId: chosenSub.id,
      subjectName: chosenSub.name,
      subjectColor: chosenSub.color,
      startTime: newStart,
      endTime: newEnd,
      durationSeconds: durSecs,
      notes: notes.trim(),
      rating,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                Edit Study Session
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                Update details for this past entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
              Focus Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700 dark:text-slate-700 light:text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes..."
              className="w-full rounded-xl bg-navy-850 border border-slate-750 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-end gap-3 dark:border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


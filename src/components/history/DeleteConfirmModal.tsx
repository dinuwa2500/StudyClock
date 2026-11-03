import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { StudySession } from '../../types';
import { formatDisplayDate, formatDurationFriendly } from '../../utils/time';

interface DeleteConfirmModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              Delete Study Session?
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-navy-850 border border-slate-800 text-xs text-slate-300 dark:bg-navy-850 dark:border-slate-800 light:bg-slate-50 light:border-slate-200 light:text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-white dark:text-white light:text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: session.subjectColor }} />
            {session.subjectName}
          </div>
          <div className="mt-1 flex items-center justify-between text-slate-400">
            <span>{formatDisplayDate(session.startTime)}</span>
            <span className="font-mono">{formatDurationFriendly(session.durationSeconds)}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/30 hover:bg-rose-500"
          >
            Delete Session
          </button>
        </div>

      </div>
    </div>
  );
};


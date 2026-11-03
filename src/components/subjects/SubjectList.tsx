import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Play, BookOpen, Clock, Layers, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTimer } from '../../context/TimerContext';
import { Subject, ActiveTab } from '../../types';
import { SubjectModal } from './SubjectModal';
import { formatDurationFriendly } from '../../utils/time';

interface SubjectListProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({ setActiveTab }) => {
  const { subjects, subjectSummaries, addSubject, updateSubject, deleteSubject, stats } = useData();
  const { startTimer, setSubjectId, status } = useTimer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleSave = (name: string, color: string) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, name, color);
    } else {
      addSubject(name, color);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    const res = deleteSubject(deleteId);
    if (!res.success) {
      setErrorMessage(res.message || 'Cannot delete subject.');
    } else {
      setDeleteId(null);
      setErrorMessage('');
    }
  };

  const handleStartStudy = (subId: string) => {
    setSubjectId(subId);
    if (status !== 'running') {
      startTimer(subId);
    }
    setActiveTab('timer');
  };

  // Map summaries by id
  const summaryMap = new Map(subjectSummaries.map((s) => [s.subjectId, s]));

  return (
    <div className="space-y-6">
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingSubject={editingSubject}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            Subject Management
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Track and compare your study distribution across topics
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Delete Confirmation Alert */}
      {deleteId && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-xs">
              Are you sure? Existing sessions using this subject will be reassigned.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => {
                setDeleteId(null);
                setErrorMessage('');
              }}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const summary = summaryMap.get(sub.id) || {
            totalSeconds: 0,
            totalHours: 0,
            sessionCount: 0,
            percentage: 0,
          };

          return (
            <div
              key={sub.id}
              className="relative overflow-hidden rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-lg transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200 flex flex-col justify-between"
            >
              {/* Top Accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: sub.color }}
              />

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 rounded-md shrink-0 shadow-sm"
                      style={{ backgroundColor: sub.color }}
                    />
                    <h3 className="font-bold text-base text-white dark:text-white light:text-slate-900 truncate max-w-[170px]">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      title="Edit subject"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-500"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => setDeleteId(sub.id)}
                        title="Delete subject"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors dark:hover:bg-slate-800 light:hover:bg-slate-100 light:text-slate-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Statistics for this subject */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-navy-850 border border-slate-750/80 dark:bg-navy-850 dark:border-slate-750/80 light:bg-slate-50 light:border-slate-200">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Total Hours</span>
                    <div className="font-mono text-base font-extrabold text-white dark:text-white light:text-slate-900 mt-0.5">
                      {summary.totalHours} hrs
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {formatDurationFriendly(summary.totalSeconds)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Sessions</span>
                    <div className="font-mono text-base font-extrabold text-white dark:text-white light:text-slate-900 mt-0.5">
                      {summary.sessionCount}
                    </div>
                    <span className="text-[10px] text-purple-400">
                      {summary.percentage}% of total
                    </span>
                  </div>
                </div>

                {/* Progress bar of total study share */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden dark:bg-slate-800 light:bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: sub.color,
                        width: `${Math.max(summary.percentage, 3)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Start Session CTA Button */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between dark:border-slate-800 light:border-slate-100">
                <span className="text-xs text-slate-400">Ready to learn?</span>
                <button
                  onClick={() => handleStartStudy(sub.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-transform hover:scale-105 shadow-sm"
                  style={{ backgroundColor: sub.color }}
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Start Timer</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};


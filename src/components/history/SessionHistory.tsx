import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Star,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StudySession } from '../../types';
import {
  formatDisplayDate,
  formatClockTime,
  formatDurationFriendly,
  formatSecondsToHHMMSS,
  toISODateString,
} from '../../utils/time';
import { exportSessionsToCSV } from '../../utils/export';
import { EditSessionModal } from './EditSessionModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const SessionHistory: React.FC = () => {
  const { sessions, subjects, updateSession, deleteSession } = useData();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc'>('date-desc');

  // Modals state
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState<StudySession | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 3600 * 1000;
    const todayStr = toISODateString(now);

    return sessions.filter((s) => {
      // Search filter
      const matchesSearch =
        s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Subject filter
      if (selectedSubjectId !== 'all' && s.subjectId !== selectedSubjectId) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        return toISODateString(s.startTime) === todayStr;
      }
      if (dateFilter === '7days') {
        return s.startTime >= now - 7 * oneDayMs;
      }
      if (dateFilter === '30days') {
        return s.startTime >= now - 30 * oneDayMs;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return b.startTime - a.startTime;
      if (sortBy === 'date-asc') return a.startTime - b.startTime;
      if (sortBy === 'duration-desc') return b.durationSeconds - a.durationSeconds;
      if (sortBy === 'duration-asc') return a.durationSeconds - b.durationSeconds;
      return 0;
    });
  }, [sessions, searchTerm, selectedSubjectId, dateFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenEdit = (session: StudySession) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (session: StudySession) => {
    setDeletingSession(session);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingSession) {
      deleteSession(deletingSession.id);
    }
  };

  const handleExportCSV = () => {
    exportSessionsToCSV(filteredSessions, 'studyclock_history');
  };

  return (
    <div className="space-y-6">
      <EditSessionModal
        isOpen={isEditModalOpen}
        session={editingSession}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateSession}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        session={deletingSession}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Header and Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            Study History & Logs
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Detailed log of all recorded study sessions with timestamps and durations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-navy-850 border border-slate-750 text-slate-200 hover:text-white hover:border-purple-500/50 shadow-md transition-all dark:bg-navy-850 dark:border-slate-750 light:bg-white light:border-slate-200 light:text-slate-700"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search notes or subject..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="duration-asc">Shortest Duration</option>
            </select>
          </div>

        </div>

        {/* Filter Stats Pill */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white dark:text-white light:text-slate-900">{filteredSessions.length}</strong> {filteredSessions.length === 1 ? 'session' : 'sessions'}
          </span>
          {(searchTerm || selectedSubjectId !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubjectId('all');
                setDateFilter('all');
                setCurrentPage(1);
              }}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-hidden rounded-2xl bg-navy-900 border border-slate-800 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
        {filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No study sessions matched your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-navy-950/70 dark:border-slate-800 light:bg-slate-50 light:border-slate-200 light:text-slate-600">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Interval</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Focus</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-100">
                {paginatedSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-850/40 transition-colors dark:hover:bg-slate-850/40 light:hover:bg-slate-50"
                  >
                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: session.subjectColor }}
                        />
                        <span className="font-bold text-white dark:text-white light:text-slate-900">
                          {session.subjectName}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-300 dark:text-slate-300 light:text-slate-700 whitespace-nowrap">
                      {formatDisplayDate(session.startTime)}
                    </td>

                    {/* Start Time & End Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      <span>{formatClockTime(session.startTime)}</span>
                      <span className="mx-1 text-slate-600">→</span>
                      <span>{formatClockTime(session.endTime)}</span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {formatSecondsToHHMMSS(session.durationSeconds)}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs">
                      {session.notes ? (
                        <p className="truncate" title={session.notes}>
                          {session.notes}
                        </p>
                      ) : (
                        <span className="text-slate-600 italic">No notes</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 text-center">
                      {session.rating ? (
                        <div className="inline-flex items-center gap-0.5 text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span className="font-semibold text-[11px]">{session.rating}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(session)}
                          title="Edit session"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(session)}
                          title="Delete session"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:border-slate-800 light:border-slate-200">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-750 disabled:opacity-30 hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-750 disabled:opacity-30 hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


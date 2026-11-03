import { StudySession, Subject, StudyGoals } from '../types';
import { formatClockTime, formatSecondsToHHMMSS, toISODateString } from './time';

/**
 * Export study sessions to CSV file and trigger browser download
 */
export function exportSessionsToCSV(sessions: StudySession[], filenamePrefix = 'studyclock_sessions'): void {
  if (!sessions || sessions.length === 0) {
    alert('No sessions to export.');
    return;
  }

  const headers = [
    'Session ID',
    'Date',
    'Subject',
    'Start Time',
    'End Time',
    'Duration (HH:MM:SS)',
    'Duration (Minutes)',
    'Duration (Seconds)',
    'Notes',
    'Rating (1-5)'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sessions.map(session => {
    const dateStr = toISODateString(session.startTime);
    const startStr = formatClockTime(session.startTime);
    const endStr = formatClockTime(session.endTime);
    const durationHHMMSS = formatSecondsToHHMMSS(session.durationSeconds);
    const durationMinutes = (session.durationSeconds / 60).toFixed(1);

    return [
      escapeCSV(session.id),
      escapeCSV(dateStr),
      escapeCSV(session.subjectName),
      escapeCSV(startStr),
      escapeCSV(endStr),
      escapeCSV(durationHHMMSS),
      escapeCSV(durationMinutes),
      escapeCSV(session.durationSeconds),
      escapeCSV(session.notes || ''),
      escapeCSV(session.rating ? `${session.rating}/5` : 'N/A')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${toISODateString(Date.now())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full backup as JSON
 */
export function exportDataBackup(data: {
  sessions: StudySession[];
  subjects: Subject[];
  goals: StudyGoals;
}): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `studyclock_backup_${toISODateString(Date.now())}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


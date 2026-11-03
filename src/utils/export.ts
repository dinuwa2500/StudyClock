import { StudySession, Subject, StudyGoals } from '../types';
import { formatClockTime, formatSecondsToHHMMSS, toISODateString } from './time';

/**
 * Sanitize and escape string to prevent CSV formula injection (CWE-1236)
 * If cell starts with `=, +, -, @, \t, \r`, prepends a single quote so spreadsheets treat it as literal text.
 */
function sanitizeCSVField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  let str = String(val).replace(/"/g, '""');

  // Prevent spreadsheet formula / DDE injection
  if (/^[=+@\-\t\r]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str}"`;
}

/**
 * Export study sessions to CSV file and trigger browser download
 */
export function exportSessionsToCSV(sessions: StudySession[], filenamePrefix = 'studyclock_sessions'): void {
  if (!sessions || sessions.length === 0) {
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

  const rows = sessions.map(session => {
    const dateStr = toISODateString(session.startTime);
    const startStr = formatClockTime(session.startTime);
    const endStr = formatClockTime(session.endTime);
    const durationHHMMSS = formatSecondsToHHMMSS(session.durationSeconds);
    const durationMinutes = (session.durationSeconds / 60).toFixed(1);

    return [
      sanitizeCSVField(session.id),
      sanitizeCSVField(dateStr),
      sanitizeCSVField(session.subjectName),
      sanitizeCSVField(startStr),
      sanitizeCSVField(endStr),
      sanitizeCSVField(durationHHMMSS),
      sanitizeCSVField(durationMinutes),
      sanitizeCSVField(session.durationSeconds),
      sanitizeCSVField(session.notes || ''),
      sanitizeCSVField(session.rating ? `${session.rating}/5` : 'N/A')
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

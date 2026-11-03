import { StudySession } from '../types';

/**
 * Format total seconds into HH:MM:SS
 */
export function formatSecondsToHHMMSS(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format milliseconds into HH:MM:SS
 */
export function formatMsToHHMMSS(ms: number): string {
  return formatSecondsToHHMMSS(Math.floor(ms / 1000));
}

/**
 * Format seconds into a friendly string like "2h 30m" or "45m 12s" or "15s"
 */
export function formatDurationFriendly(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Format seconds into decimal hours (e.g. 2.5)
 */
export function secondsToHoursDecimal(totalSeconds: number): number {
  return Number((totalSeconds / 3600).toFixed(1));
}

/**
 * Format a timestamp to clock time e.g. "03:45 PM"
 */
export function formatClockTime(timestamp: number | Date): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/**
 * Format a timestamp to short clock time e.g. "03:45 PM"
 */
export function formatShortTime(timestamp: number | Date): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Format timestamp to friendly date e.g. "Today, Nov 3" or "Oct 28, 2026"
 */
export function formatDisplayDate(timestamp: number | Date): string {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameCalendarDay(d, today)) {
    return `Today, ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  }
  if (isSameCalendarDay(d, yesterday)) {
    return `Yesterday, ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  }

  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Check if two dates fall on the same calendar day
 */
export function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get date string YYYY-MM-DD
 */
export function toISODateString(timestamp: number | Date): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate study streak in consecutive days
 */
export function calculateStudyStreak(sessions: StudySession[]): { currentStreak: number; bestStreak: number } {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Extract unique sorted calendar date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(sessions.map((s) => toISODateString(s.startTime)))
  ).sort().reverse(); // newest first

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = toISODateString(Date.now());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toISODateString(yesterday);

  let currentStreak = 0;
  let checkDate = new Date();

  // If haven't studied today, can still be on a streak if studied yesterday
  if (uniqueDates[0] === todayStr) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (uniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 2);
  } else {
    // Streak broken
    currentStreak = 0;
  }

  if (currentStreak > 0) {
    const datesSet = new Set(uniqueDates);
    while (datesSet.has(toISODateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate best streak historically
  let bestStreak = currentStreak;
  let tempStreak = 0;
  const sortedAsc = [...uniqueDates].sort();

  for (let i = 0; i < sortedAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedAsc[i - 1]);
      const currDate = new Date(sortedAsc[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { currentStreak, bestStreak };
}


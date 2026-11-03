import { Subject, StudySession, StudyGoals, ActiveTimerState } from '../types';

export const STORAGE_KEYS = {
  SESSIONS: 'studyclock_sessions_v1',
  SUBJECTS: 'studyclock_subjects_v1',
  GOALS: 'studyclock_goals_v1',
  TIMER_STATE: 'studyclock_active_timer_v1',
  THEME: 'studyclock_theme_v1',
  SOUND_ENABLED: 'studyclock_sound_enabled_v1',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-math', name: 'Mathematics', color: '#3B82F6', createdAt: 1700000000000 },
  { id: 'sub-sci', name: 'Science', color: '#10B981', createdAt: 1700000000001 },
  { id: 'sub-eng', name: 'English', color: '#F59E0B', createdAt: 1700000000002 },
  { id: 'sub-ict', name: 'ICT', color: '#8B5CF6', createdAt: 1700000000003 },
  { id: 'sub-hist', name: 'History', color: '#EC4899', createdAt: 1700000000004 },
  { id: 'sub-other', name: 'Other', color: '#64748B', createdAt: 1700000000005 },
];

export const DEFAULT_GOALS: StudyGoals = {
  dailyHours: 3.5,
  weeklyHours: 20,
  monthlyHours: 85,
};

export const DEFAULT_TIMER_STATE: ActiveTimerState = {
  status: 'idle',
  mode: 'stopwatch',
  startTime: null,
  accumulatedMs: 0,
  subjectId: 'sub-math',
  notes: '',
};

/**
 * Generate initial realistic seed sessions for realistic experience
 */
export function generateSeedSessions(): StudySession[] {
  const sessions: StudySession[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const mockConfigs = [
    // Today
    { daysAgo: 0, hoursAgo: 4, durationMins: 75, subject: DEFAULT_SUBJECTS[0], note: 'Calculus differential equations review', rating: 5 },
    { daysAgo: 0, hoursAgo: 1.5, durationMins: 45, subject: DEFAULT_SUBJECTS[3], note: 'TypeScript generics & async patterns practice', rating: 4 },
    // Yesterday
    { daysAgo: 1, hoursAgo: 6, durationMins: 90, subject: DEFAULT_SUBJECTS[1], note: 'Physics mechanics problem sets', rating: 5 },
    { daysAgo: 1, hoursAgo: 2, durationMins: 50, subject: DEFAULT_SUBJECTS[2], note: 'Essay structure and vocabulary review', rating: 4 },
    // 2 days ago
    { daysAgo: 2, hoursAgo: 5, durationMins: 110, subject: DEFAULT_SUBJECTS[0], note: 'Linear algebra matrix transformations', rating: 5 },
    { daysAgo: 2, hoursAgo: 2, durationMins: 40, subject: DEFAULT_SUBJECTS[4], note: 'Cold War timeline & cause-effect analysis', rating: 4 },
    // 3 days ago
    { daysAgo: 3, hoursAgo: 4, durationMins: 85, subject: DEFAULT_SUBJECTS[3], note: 'Database schema normalization & SQL queries', rating: 4 },
    // 4 days ago
    { daysAgo: 4, hoursAgo: 5, durationMins: 120, subject: DEFAULT_SUBJECTS[1], note: 'Organic chemistry reaction mechanisms', rating: 5 },
    { daysAgo: 4, hoursAgo: 1, durationMins: 35, subject: DEFAULT_SUBJECTS[5], note: 'General academic planning and reading', rating: 4 },
    // 5 days ago
    { daysAgo: 5, hoursAgo: 4, durationMins: 95, subject: DEFAULT_SUBJECTS[0], note: 'Integration techniques & improper integrals', rating: 4 },
    // 6 days ago
    { daysAgo: 6, hoursAgo: 7, durationMins: 60, subject: DEFAULT_SUBJECTS[2], note: 'Grammar exercises & comprehension quiz', rating: 4 },
    { daysAgo: 6, hoursAgo: 3, durationMins: 75, subject: DEFAULT_SUBJECTS[3], note: 'Data structures: binary search trees', rating: 5 },
    // 7 days ago
    { daysAgo: 7, hoursAgo: 4, durationMins: 105, subject: DEFAULT_SUBJECTS[1], note: 'Cellular respiration biology notes', rating: 5 },
    // 8-12 days ago for monthly chart richness
    { daysAgo: 8, hoursAgo: 5, durationMins: 90, subject: DEFAULT_SUBJECTS[4], note: 'Industrial revolution primary sources', rating: 4 },
    { daysAgo: 9, hoursAgo: 6, durationMins: 130, subject: DEFAULT_SUBJECTS[0], note: 'Probability theory & random variables', rating: 5 },
    { daysAgo: 10, hoursAgo: 4, durationMins: 80, subject: DEFAULT_SUBJECTS[3], note: 'Computer networking: TCP/IP stack', rating: 4 },
    { daysAgo: 11, hoursAgo: 5, durationMins: 115, subject: DEFAULT_SUBJECTS[1], note: 'Electromagnetism practice problems', rating: 5 },
    { daysAgo: 12, hoursAgo: 3, durationMins: 70, subject: DEFAULT_SUBJECTS[2], note: 'Literature critique analysis', rating: 4 },
  ];

  mockConfigs.forEach((cfg, idx) => {
    const end = now - (cfg.daysAgo * dayMs) - (cfg.hoursAgo * 3600 * 1000);
    const start = end - (cfg.durationMins * 60 * 1000);
    sessions.push({
      id: `session-seed-${idx + 1}`,
      subjectId: cfg.subject.id,
      subjectName: cfg.subject.name,
      subjectColor: cfg.subject.color,
      startTime: start,
      endTime: end,
      durationSeconds: cfg.durationMins * 60,
      notes: cfg.note,
      rating: cfg.rating,
      createdAt: start,
    });
  });

  return sessions;
}

export function loadSavedSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      const initial = generateSeedSessions();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load sessions from localStorage', err);
    return [];
  }
}

export function saveSessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions to localStorage', err);
  }
}

export function loadSavedSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBJECTS;
  } catch (err) {
    console.error('Failed to load subjects', err);
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (err) {
    console.error('Failed to save subjects', err);
  }
}

export function loadSavedGoals(): StudyGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      return DEFAULT_GOALS;
    }
    const parsed = JSON.parse(raw);
    return {
      dailyHours: parsed.dailyHours || DEFAULT_GOALS.dailyHours,
      weeklyHours: parsed.weeklyHours || DEFAULT_GOALS.weeklyHours,
      monthlyHours: parsed.monthlyHours || DEFAULT_GOALS.monthlyHours,
    };
  } catch (err) {
    console.error('Failed to load goals', err);
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: StudyGoals): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save goals', err);
  }
}

export function loadActiveTimerState(): ActiveTimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!raw) return DEFAULT_TIMER_STATE;
    const parsed = JSON.parse(raw);
    return {
      status: parsed.status || 'idle',
      mode: parsed.mode || 'stopwatch',
      startTime: parsed.startTime || null,
      accumulatedMs: Number(parsed.accumulatedMs) || 0,
      targetMs: parsed.targetMs,
      subjectId: parsed.subjectId || DEFAULT_SUBJECTS[0].id,
      notes: parsed.notes || '',
    };
  } catch (err) {
    console.error('Failed to load timer state', err);
    return DEFAULT_TIMER_STATE;
  }
}

export function saveActiveTimerState(state: ActiveTimerState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save timer state', err);
  }
}

export function clearActiveTimerState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (err) {
    console.error('Failed to clear timer state', err);
  }
}


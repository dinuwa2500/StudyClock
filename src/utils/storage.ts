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

export function loadSavedSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      return []; // Clean empty start - no mock data!
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

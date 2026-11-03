export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerMode = 'stopwatch' | 'countdown';

export interface Subject {
  id: string;
  name: string;
  color: string; // hex code like #3B82F6
  icon?: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  startTime: number; // timestamp ms
  endTime: number;   // timestamp ms
  durationSeconds: number; // calculated exact seconds
  notes?: string;
  rating?: number; // 1 to 5 focus rating
  createdAt: number;
}

export interface StudyGoals {
  dailyHours: number;   // e.g. 3.5
  weeklyHours: number;  // e.g. 20
  monthlyHours: number; // e.g. 80
}

export interface ActiveTimerState {
  status: TimerStatus;
  mode: TimerMode;
  startTime: number | null;       // timestamp ms when last started/resumed
  accumulatedMs: number;          // milliseconds accumulated before current segment
  targetMs?: number;              // for countdown mode
  subjectId: string;
  notes: string;
}

export interface DayStudySummary {
  date: string; // YYYY-MM-DD
  formattedDate: string; // "Mon, Nov 3"
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
}

export interface SubjectStudySummary {
  subjectId: string;
  subjectName: string;
  color: string;
  totalSeconds: number;
  totalHours: number;
  sessionCount: number;
  percentage: number;
}

export interface ProductivityStats {
  todaySeconds: number;
  weeklySeconds: number;
  monthlySeconds: number;
  allTimeSeconds: number;
  totalSessions: number;
  currentStreakDays: number;
  bestStreakDays: number;
  averageDailySeconds: number;
  mostProductiveDayName: string;
  mostProductiveDaySeconds: number;
  dailyGoalCompletionPercent: number;
  weeklyGoalCompletionPercent: number;
}

export type ActiveTab = 'dashboard' | 'timer' | 'analytics' | 'history' | 'subjects' | 'goals';


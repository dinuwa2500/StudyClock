import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  StudySession,
  Subject,
  StudyGoals,
  ProductivityStats,
  DayStudySummary,
  SubjectStudySummary,
} from '../types';
import {
  loadSavedSessions,
  saveSessions,
  loadSavedSubjects,
  saveSubjects,
  loadSavedGoals,
  saveGoals,
  DEFAULT_SUBJECTS,
  DEFAULT_GOALS,
  STORAGE_KEYS,
  clearActiveTimerState,
} from '../utils/storage';
import {
  toISODateString,
  calculateStudyStreak,
} from '../utils/time';
import { soundEngine } from '../utils/sound';
import {
  fetchSessionsFromDB,
  saveSessionToDB,
  updateSessionInDB,
  deleteSessionFromDB,
  fetchSubjectsFromDB,
  saveSubjectToDB,
  updateSubjectInDB,
  deleteSubjectFromDB,
  fetchGoalsFromDB,
  saveGoalsToDB,
} from '../utils/api';

interface DataContextType {
  sessions: StudySession[];
  subjects: Subject[];
  goals: StudyGoals;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  dbConnected: boolean;
  isSyncing: boolean;
  stats: ProductivityStats;
  daySummaries: DayStudySummary[];
  subjectSummaries: SubjectStudySummary[];
  addSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => StudySession;
  updateSession: (session: StudySession) => void;
  deleteSession: (id: string) => void;
  addSubject: (name: string, color: string) => Subject;
  updateSubject: (id: string, name: string, color: string) => void;
  deleteSubject: (id: string) => { success: boolean; message?: string };
  updateGoals: (goals: Partial<StudyGoals>) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  resetAllData: () => void;
  restoreData: (data: { sessions?: StudySession[]; subjects?: Subject[]; goals?: StudyGoals }) => void;
  refreshFromDB: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<StudySession[]>(loadSavedSessions);
  const [subjects, setSubjects] = useState<Subject[]>(loadSavedSubjects);
  const [goals, setGoals] = useState<StudyGoals>(loadSavedGoals);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Dark navy default
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return saved !== null ? saved === 'true' : true;
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync sound setting
  useEffect(() => {
    soundEngine.setSoundEnabled(soundEnabled);
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(soundEnabled));
  }, [soundEnabled]);

  // Initial fetch and synchronization from MongoDB
  const refreshFromDB = async () => {
    setIsSyncing(true);
    try {
      const [remoteSessions, remoteSubjects, remoteGoals] = await Promise.all([
        fetchSessionsFromDB(),
        fetchSubjectsFromDB(),
        fetchGoalsFromDB(),
      ]);

      if (remoteSessions !== null) {
        setSessions(remoteSessions);
        saveSessions(remoteSessions);
        setDbConnected(true);
      }
      if (remoteSubjects !== null && remoteSubjects.length > 0) {
        setSubjects(remoteSubjects);
        saveSubjects(remoteSubjects);
        setDbConnected(true);
      }
      if (remoteGoals !== null) {
        setGoals(remoteGoals);
        saveGoals(remoteGoals);
        setDbConnected(true);
      }
    } catch (err) {
      console.warn('MongoDB sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshFromDB();
  }, []);

  // Save sessions on change locally
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Save subjects on change locally
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  // Save goals on change locally
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  // Add session (writes to state, localStorage, and MongoDB)
  const addSession = (sessionData: Omit<StudySession, 'id' | 'createdAt'>): StudySession => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);

    // Send to MongoDB in background
    saveSessionToDB(newSession).then((ok) => {
      if (ok) setDbConnected(true);
    });

    return newSession;
  };

  // Update session
  const updateSession = (updatedSession: StudySession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );

    // Sync to MongoDB
    updateSessionInDB(updatedSession).then((ok) => {
      if (ok) setDbConnected(true);
    });
  };

  // Delete session
  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // Sync to MongoDB
    deleteSessionFromDB(id).then((ok) => {
      if (ok) setDbConnected(true);
    });
  };

  // Add subject
  const addSubject = (name: string, color: string): Subject => {
    const newSub: Subject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      color,
      createdAt: Date.now(),
    };
    setSubjects((prev) => [...prev, newSub]);

    // Sync to MongoDB
    saveSubjectToDB(newSub).then((ok) => {
      if (ok) setDbConnected(true);
    });

    return newSub;
  };

  // Update subject
  const updateSubject = (id: string, name: string, color: string) => {
    setSubjects((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, name: name.trim(), color } : sub))
    );
    // Also update historical session subject metadata
    setSessions((prev) =>
      prev.map((s) =>
        s.subjectId === id
          ? { ...s, subjectName: name.trim(), subjectColor: color }
          : s
      )
    );

    // Sync to MongoDB
    updateSubjectInDB(id, name, color).then((ok) => {
      if (ok) setDbConnected(true);
    });
  };

  // Delete subject
  const deleteSubject = (id: string): { success: boolean; message?: string } => {
    if (subjects.length <= 1) {
      return { success: false, message: 'You must maintain at least one subject.' };
    }
    const fallbackSubject = subjects.find((s) => s.id !== id) || DEFAULT_SUBJECTS[DEFAULT_SUBJECTS.length - 1];
    setSessions((prev) =>
      prev.map((s) =>
        s.subjectId === id
          ? {
              ...s,
              subjectId: fallbackSubject.id,
              subjectName: fallbackSubject.name,
              subjectColor: fallbackSubject.color,
            }
          : s
      )
    );
    setSubjects((prev) => prev.filter((sub) => sub.id !== id));

    // Sync to MongoDB
    deleteSubjectFromDB(id).then((ok) => {
      if (ok) setDbConnected(true);
    });

    return { success: true };
  };

  // Update goals
  const updateGoals = (newGoals: Partial<StudyGoals>) => {
    const updated = {
      ...goals,
      ...newGoals,
    };
    setGoals(updated);

    // Sync to MongoDB
    saveGoalsToDB(updated).then((ok) => {
      if (ok) setDbConnected(true);
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const resetAllData = () => {
    setSessions([]);
    setSubjects(DEFAULT_SUBJECTS);
    setGoals(DEFAULT_GOALS);
    clearActiveTimerState();
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);

    // Also delete remotely
    sessions.forEach((s) => deleteSessionFromDB(s.id));
    saveGoalsToDB(DEFAULT_GOALS);
  };

  const restoreData = (data: { sessions?: StudySession[]; subjects?: Subject[]; goals?: StudyGoals }) => {
    if (data.sessions && Array.isArray(data.sessions)) {
      setSessions(data.sessions);
      saveSessions(data.sessions);
      data.sessions.forEach((s) => saveSessionToDB(s));
    }
    if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
      setSubjects(data.subjects);
      saveSubjects(data.subjects);
      data.subjects.forEach((sub) => saveSubjectToDB(sub));
    }
    if (data.goals) {
      const g = {
        dailyHours: data.goals.dailyHours || DEFAULT_GOALS.dailyHours,
        weeklyHours: data.goals.weeklyHours || DEFAULT_GOALS.weeklyHours,
        monthlyHours: data.goals.monthlyHours || DEFAULT_GOALS.monthlyHours,
      };
      setGoals(g);
      saveGoals(g);
      saveGoalsToDB(g);
    }
  };

  // Compute Aggregated Stats
  const { stats, daySummaries, subjectSummaries } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of this week (Monday)
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let todaySeconds = 0;
    let weeklySeconds = 0;
    let monthlySeconds = 0;
    let allTimeSeconds = 0;

    const dayTotalsMap = new Map<string, { totalSeconds: number; count: number; dateObj: Date }>();
    const dayNameTotalsMap = new Map<string, number>();
    const subjectMap = new Map<string, { seconds: number; count: number }>();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayNames.forEach((d) => dayNameTotalsMap.set(d, 0));

    sessions.forEach((session) => {
      const dur = session.durationSeconds;
      allTimeSeconds += dur;

      if (session.startTime >= today) {
        todaySeconds += dur;
      }
      if (session.startTime >= startOfWeek) {
        weeklySeconds += dur;
      }
      if (session.startTime >= startOfMonth) {
        monthlySeconds += dur;
      }

      const dateKey = toISODateString(session.startTime);
      const existingDay = dayTotalsMap.get(dateKey) || {
        totalSeconds: 0,
        count: 0,
        dateObj: new Date(session.startTime),
      };
      existingDay.totalSeconds += dur;
      existingDay.count += 1;
      dayTotalsMap.set(dateKey, existingDay);

      const sessionDayName = dayNames[new Date(session.startTime).getDay()];
      dayNameTotalsMap.set(sessionDayName, (dayNameTotalsMap.get(sessionDayName) || 0) + dur);

      const existingSub = subjectMap.get(session.subjectId) || { seconds: 0, count: 0 };
      existingSub.seconds += dur;
      existingSub.count += 1;
      subjectMap.set(session.subjectId, existingSub);
    });

    const { currentStreak, bestStreak } = calculateStudyStreak(sessions);

    let mostProductiveDayName = 'None';
    let mostProductiveDaySeconds = 0;
    dayNameTotalsMap.forEach((seconds, name) => {
      if (seconds > mostProductiveDaySeconds) {
        mostProductiveDaySeconds = seconds;
        mostProductiveDayName = name;
      }
    });

    const activeDaysCount = Math.max(dayTotalsMap.size, 1);
    const averageDailySeconds = allTimeSeconds > 0 ? Math.round(allTimeSeconds / activeDaysCount) : 0;

    const dailyTargetSeconds = goals.dailyHours * 3600;
    const weeklyTargetSeconds = goals.weeklyHours * 3600;
    const dailyGoalCompletionPercent = dailyTargetSeconds > 0
      ? Math.min(100, Math.round((todaySeconds / dailyTargetSeconds) * 100))
      : 0;
    const weeklyGoalCompletionPercent = weeklyTargetSeconds > 0
      ? Math.min(100, Math.round((weeklySeconds / weeklyTargetSeconds) * 100))
      : 0;

    const statsObj: ProductivityStats = {
      todaySeconds,
      weeklySeconds,
      monthlySeconds,
      allTimeSeconds,
      totalSessions: sessions.length,
      currentStreakDays: currentStreak,
      bestStreakDays: bestStreak,
      averageDailySeconds,
      mostProductiveDayName,
      mostProductiveDaySeconds,
      dailyGoalCompletionPercent,
      weeklyGoalCompletionPercent,
    };

    const daysArr: DayStudySummary[] = [];
    for (let i = 13; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateKey = toISODateString(targetDate);
      const dayData = dayTotalsMap.get(dateKey);

      daysArr.push({
        date: dateKey,
        formattedDate: i === 0 ? 'Today' : i === 1 ? 'Yest' : targetDate.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
        totalSeconds: dayData ? dayData.totalSeconds : 0,
        totalHours: dayData ? Number((dayData.totalSeconds / 3600).toFixed(2)) : 0,
        sessionCount: dayData ? dayData.count : 0,
      });
    }

    const subSummaries: SubjectStudySummary[] = subjects.map((sub) => {
      const data = subjectMap.get(sub.id) || { seconds: 0, count: 0 };
      const pct = allTimeSeconds > 0 ? Math.round((data.seconds / allTimeSeconds) * 100) : 0;
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        color: sub.color,
        totalSeconds: data.seconds,
        totalHours: Number((data.seconds / 3600).toFixed(1)),
        sessionCount: data.count,
        percentage: pct,
      };
    }).sort((a, b) => b.totalSeconds - a.totalSeconds);

    return {
      stats: statsObj,
      daySummaries: daysArr,
      subjectSummaries: subSummaries,
    };
  }, [sessions, subjects, goals]);

  return (
    <DataContext.Provider
      value={{
        sessions,
        subjects,
        goals,
        theme,
        soundEnabled,
        dbConnected,
        isSyncing,
        stats,
        daySummaries,
        subjectSummaries,
        addSession,
        updateSession,
        deleteSession,
        addSubject,
        updateSubject,
        deleteSubject,
        updateGoals,
        toggleTheme,
        toggleSound,
        resetAllData,
        restoreData,
        refreshFromDB,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

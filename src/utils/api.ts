import { StudySession, Subject, StudyGoals } from '../types';

const API_BASE = '/api';
const AUTH_TOKEN_KEY = 'studyclock_auth_token_v1';
const USER_INFO_KEY = 'studyclock_user_info_v1';

export interface UserProfile {
  userId: string;
  username: string;
  displayName?: string;
  isAnonymous?: boolean;
}

/**
 * Get current stored authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set stored authentication token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Get stored user profile
 */
export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set stored user profile
 */
export function setStoredUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_INFO_KEY);
  }
}

/**
 * Ensure the client has an active token (either signed-in user or instant isolated guest session)
 */
export async function ensureAuthToken(): Promise<string | null> {
  let token = getAuthToken();
  if (token) return token;

  try {
    const res = await fetch(`${API_BASE}/auth?action=anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'anonymous' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        setAuthToken(data.token);
        if (data.user) setStoredUser(data.user);
        return data.token;
      }
    }
  } catch (err) {
    console.warn('Anonymous auth init deferred (offline):', err);
  }
  return null;
}

/**
 * Log in with username and password
 */
export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  try {
    const res = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    if (data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: 'Token missing in response' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during login' };
  }
}

/**
 * Register a new user account
 */
export async function registerUser(username: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/auth?action=register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'register', username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }

    if (data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: 'Token missing in response' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during registration' };
  }
}

/**
 * Log out
 */
export function logoutUser(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * Helper to perform authenticated fetch
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await ensureAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

/**
 * Fetch all study sessions from MongoDB
 */
export async function fetchSessionsFromDB(): Promise<StudySession[] | null> {
  try {
    const res = await authFetch(`${API_BASE}/sessions`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return null;
  }
}

/**
 * Save new study session to MongoDB
 */
export async function saveSessionToDB(session: StudySession): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Update study session in MongoDB
 */
export async function updateSessionInDB(session: StudySession): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/sessions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Delete study session in MongoDB
 */
export async function deleteSessionFromDB(id: string): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/sessions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch subjects from MongoDB
 */
export async function fetchSubjectsFromDB(): Promise<Subject[] | null> {
  try {
    const res = await authFetch(`${API_BASE}/subjects`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (err) {
    return null;
  }
}

/**
 * Create subject in MongoDB
 */
export async function saveSubjectToDB(subject: Subject): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Update subject in MongoDB
 */
export async function updateSubjectInDB(id: string, name: string, color: string): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/subjects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, color }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Delete subject from MongoDB
 */
export async function deleteSubjectFromDB(id: string): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/subjects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch goals from MongoDB
 */
export async function fetchGoalsFromDB(): Promise<StudyGoals | null> {
  try {
    const res = await authFetch(`${API_BASE}/goals`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Save goals to MongoDB
 */
export async function saveGoalsToDB(goals: StudyGoals): Promise<boolean> {
  try {
    const res = await authFetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

import React, { useState } from 'react';
import { X, Lock, User, CheckCircle2, AlertCircle, ArrowRight, LogOut, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser, logoutUser, UserProfile } from '../../utils/api';
import { useData } from '../../context/DataContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const { refreshFromDB } = useData();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (tab === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = tab === 'login'
        ? await loginUser(username.trim(), password)
        : await registerUser(username.trim(), password);

      if (!res.success || !res.user) {
        setError(res.error || 'Authentication failed. Please try again.');
      } else {
        onAuthSuccess(res.user);
        await refreshFromDB();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutUser();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-slate-750 p-6 shadow-2xl dark:bg-navy-900 dark:border-slate-750 light:bg-white light:border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">
                {currentUser && !currentUser.isAnonymous ? 'Account & Security' : 'User Authentication'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
                Secure your data with private account isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* If user is already signed in with a real account */}
        {currentUser && !currentUser.isAnonymous ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-navy-850 border border-slate-750 text-center dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold text-lg mb-2">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-bold text-base text-white dark:text-white light:text-slate-900">
                {currentUser.displayName || currentUser.username}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {currentUser.userId}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Isolated MongoDB Tenant</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {currentUser?.isAnonymous && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
                <span className="font-semibold">Guest Session Active:</span>
                <span className="text-[11px] text-slate-400">Register below to lock and protect your account with a password.</span>
              </div>
            )}

            {/* Tab selector */}
            <div className="flex rounded-xl bg-navy-850 p-1 border border-slate-800 text-xs font-semibold dark:bg-navy-850 dark:border-slate-800 light:bg-slate-100 light:border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  tab === 'login'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  tab === 'register'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex_study"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
                  />
                </div>
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-850 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none dark:bg-navy-850 dark:border-slate-750 light:bg-slate-50 light:border-slate-200 light:text-slate-900"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In' : 'Create Protected Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};


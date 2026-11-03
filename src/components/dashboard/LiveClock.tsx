import React, { useState, useEffect } from 'react';
import { Calendar, Compass, Sparkles } from 'lucide-react';

export const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const rawHours12 = hours % 12 || 12;
  const hoursStr = String(rawHours12).padStart(2, '0');
  const minutesStr = String(time.getMinutes()).padStart(2, '0');
  const secondsStr = String(time.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const dayOfWeek = time.toLocaleDateString([], { weekday: 'long' });
  const dateFormatted = time.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Timezone string
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    if (hours < 12) return { text: 'Good morning', quote: 'Small daily steps compound into massive success.' };
    if (hours < 17) return { text: 'Good afternoon', quote: 'Stay immersed in your rhythm of deep focus.' };
    return { text: 'Good evening', quote: 'Reflect on today’s progress and keep the momentum alive.' };
  };

  const greeting = getGreeting();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-purple-950/30 border border-purple-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-md dark:from-navy-900 dark:via-navy-850 dark:to-purple-950/30 dark:border-purple-500/20 light:from-white light:via-purple-50/40 light:to-indigo-50/50 light:border-purple-200">
      {/* Decorative gradient glow orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Left: Greeting & Date */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-3 dark:text-purple-300 light:text-purple-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{greeting.text}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            {dayOfWeek}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              {dateFormatted}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              {timezone}
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-400/90 italic max-w-sm hidden sm:block dark:text-slate-400/90 light:text-slate-500">
            "{greeting.quote}"
          </p>
        </div>

        {/* Right: Big Digital Clock Display */}
        <div className="flex flex-col items-start md:items-end">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md dark:text-white light:text-slate-900">
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300 light:from-slate-900 light:via-slate-800 light:to-slate-700">
                {hoursStr}
              </span>
              <span className="animate-pulse text-purple-400 mx-0.5">:</span>
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300 light:from-slate-900 light:via-slate-800 light:to-slate-700">
                {minutesStr}
              </span>
              <span className="animate-pulse text-indigo-400 mx-0.5">:</span>
              <span className="text-purple-400">
                {secondsStr}
              </span>
            </div>

            <span className="font-mono text-lg sm:text-2xl font-bold uppercase tracking-wider text-purple-300 dark:text-purple-300 light:text-purple-600">
              {ampm}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-400 font-mono">
              Realtime Synced
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};


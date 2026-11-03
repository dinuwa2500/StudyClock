import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Wind, Coffee, Radio, Play, Square } from 'lucide-react';
import { soundEngine } from '../../utils/sound';

export const AmbientSoundPlayer: React.FC = () => {
  const [activeSound, setActiveSound] = useState<string | null>(soundEngine.getCurrentAmbientType());
  const [volume, setVolume] = useState<number>(0.25);

  const sounds = [
    { id: 'rain', label: 'Gentle Rain', icon: CloudRain },
    { id: 'brownnoise', label: 'Deep Focus', icon: Radio },
    { id: 'whitenoise', label: 'White Noise', icon: Wind },
    { id: 'cafe', label: 'Library / Cafe', icon: Coffee },
  ];

  const handleToggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      soundEngine.stopAmbientSound();
      setActiveSound(null);
    } else {
      soundEngine.startAmbientSound(soundId as any, volume);
      setActiveSound(soundId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundEngine.setAmbientVolume(newVol);
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-slate-900">
              Ambient Focus Noise
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
              Synthesized background audio to mask distractions
            </p>
          </div>
        </div>

        {activeSound && (
          <button
            onClick={() => {
              soundEngine.stopAmbientSound();
              setActiveSound(null);
            }}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Square className="h-3 w-3 fill-rose-400" />
            <span>Stop Audio</span>
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sounds.map((s) => {
          const Icon = s.icon;
          const isPlaying = activeSound === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleToggleSound(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                isPlaying
                  ? 'bg-purple-600/25 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10'
                  : 'bg-navy-850 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 dark:bg-navy-850 dark:border-slate-800 dark:text-slate-400 light:bg-slate-50 light:border-slate-200 light:text-slate-600'
              }`}
            >
              <Icon className={`h-4 w-4 ${isPlaying ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {activeSound && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-medium">Volume</span>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="font-mono text-[11px] text-purple-400 font-bold min-w-[32px]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};


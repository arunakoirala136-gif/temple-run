import React from 'react';
import { GameStats } from '../types';
import { Pause, Volume2, VolumeX, Flame } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface HUDProps {
  stats: GameStats;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, onPause, isMuted, onToggleMute }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-start z-10">
      {/* Left: Score & Distance */}
      <div className="flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 rounded-xl px-4 py-2 shadow-lg shadow-black/40">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Score</span>
          <span className="text-2xl font-black tracking-tight text-white font-mono">
            {stats.score.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-slate-700/50 rounded-lg px-3 py-1 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Distance:</span>
          <span className="font-bold text-white font-mono">{stats.distance}m</span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-amber-400 flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            {stats.coins}
          </span>
          {stats.gems > 0 && (
            <>
              <span className="text-slate-600">|</span>
              <span className="font-semibold text-rose-400 flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rotate-45 bg-rose-500"></span>
                {stats.gems}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Speed / Difficulty Meter */}
      <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-md border border-orange-500/30 rounded-full px-3 py-1 text-xs text-orange-300 pointer-events-auto">
        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
        <span className="font-bold font-mono">{(stats.speed / 370).toFixed(1)}x Speed</span>
      </div>

      {/* Right: Best Score & Control Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {stats.highScore > 0 && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-yellow-600/40 rounded-xl px-3 py-1.5 text-xs text-amber-300">
            <span className="text-amber-500 font-bold">BEST:</span>
            <span className="font-mono font-bold text-white">{stats.highScore}</span>
          </div>
        )}

        <button
          id="hud-mute-btn"
          onClick={onToggleMute}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl shadow-md transition-all active:scale-95"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          id="hud-pause-btn"
          onClick={onPause}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl shadow-md transition-all active:scale-95"
          title="Pause Game (Esc / P)"
          aria-label="Pause Game"
        >
          <Pause className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { GameStats } from '../types';

interface PauseModalProps {
  stats: GameStats;
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-white">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h3 className="text-2xl font-black text-amber-400 mb-1 tracking-tight">GAME PAUSED</h3>
        <p className="text-xs text-slate-400 mb-6">Take a breather, the beast waits.</p>

        {/* Quick Current Stats */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-6 text-xs flex justify-around">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Score</div>
            <div className="font-mono font-bold text-white text-base">{stats.score}</div>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Distance</div>
            <div className="font-mono font-bold text-amber-400 text-base">{stats.distance}m</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME (Esc / Space)</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Run</span>
          </button>

          <button
            id="pause-mute-btn"
            onClick={onToggleMute}
            className="w-full py-2 px-4 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Sound Muted' : 'Sound Enabled'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

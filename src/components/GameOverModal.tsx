import React from 'react';
import { GameStats } from '../types';
import { RotateCcw, Trophy, Skull, Code2, Sparkles, Footprints, Coins, Gem } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenUnityCode: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenUnityCode,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md text-white animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col items-center text-center">
        
        {/* Monster Caught Header */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-rose-500 animate-bounce" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300">
          CAUGHT BY THE BEAST!
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          The ancient temple guardian claimed another explorer.
        </p>

        {/* New High Score Celebratory Banner */}
        {stats.newHighScore && (
          <div className="w-full mb-4 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-yellow-500/50 flex items-center justify-center gap-2 text-yellow-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
            <span>NEW HIGH SCORE RECORD!</span>
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
          </div>
        )}

        {/* Score Summary Box */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Score
          </div>
          <div className="text-4xl font-black font-mono text-amber-400">
            {stats.score.toLocaleString()}
          </div>

          {/* Breakdown stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-0.5">
                <Footprints className="w-3 h-3 text-slate-400" /> Distance
              </div>
              <span className="font-bold text-white font-mono">{stats.distance}m</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-400 text-[11px] mb-0.5">
                <Coins className="w-3 h-3 text-amber-400" /> Coins
              </div>
              <span className="font-bold text-white font-mono">{stats.coins}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-rose-400 text-[11px] mb-0.5">
                <Gem className="w-3 h-3 text-rose-400" /> Gems
              </div>
              <span className="font-bold text-white font-mono">{stats.gems}</span>
            </div>
          </div>

          {/* Best Record */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Best Score:
            </span>
            <span className="font-mono font-bold text-amber-300">
              {stats.highScore.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="gameover-restart-btn"
            onClick={onRestart}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-orange-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-amber-300/40 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN (Space / R)</span>
          </button>

          <button
            id="gameover-unity-btn"
            onClick={onOpenUnityCode}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>View Unity C# Code & Setup Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};

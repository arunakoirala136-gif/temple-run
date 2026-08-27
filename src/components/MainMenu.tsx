import React from 'react';
import { Play, Trophy, Code2, Sparkles, Volume2, VolumeX, ArrowUp, ArrowDown } from 'lucide-react';

interface MainMenuProps {
  highScore: number;
  onStartGame: () => void;
  onOpenUnityCode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  onStartGame,
  onOpenUnityCode,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/75 backdrop-blur-sm text-white">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Ancient Temple Emblem & Title */}
        <div className="relative mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 2D Endless Runner
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            TEMPLE ESCAPE
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Outrun the beast, dodge ancient traps, and collect gold relics!
          </p>
        </div>

        {/* High Score Card */}
        {highScore > 0 ? (
          <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl px-5 py-2.5 mb-6 shadow-lg shadow-black/40">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">All-Time Best Score</div>
              <div className="text-xl font-black text-white font-mono">{highScore.toLocaleString()} pts</div>
            </div>
          </div>
        ) : (
          <div className="h-4 mb-2"></div>
        )}

        {/* Primary Action Button */}
        <button
          id="main-menu-play-btn"
          onClick={onStartGame}
          className="group w-full max-w-xs py-4 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-amber-300/40 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current transition-transform group-hover:scale-110" />
          <span>START RUN</span>
        </button>

        {/* Controls Quick Summary */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
              <ArrowUp className="w-3.5 h-3.5" /> JUMP
            </div>
            <span className="text-[11px] text-slate-400">Space / Up Arrow</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Leap over spikes & totems</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs mb-1">
              <ArrowDown className="w-3.5 h-3.5" /> SLIDE
            </div>
            <span className="text-[11px] text-slate-400">Down Arrow / S</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Duck under stone arches</span>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            id="view-unity-code-btn"
            onClick={onOpenUnityCode}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Unity C# Scripts</span>
          </button>

          <button
            id="toggle-sound-btn"
            onClick={onToggleMute}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

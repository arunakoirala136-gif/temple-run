import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ControlsGuideProps {
  onJump: () => void;
  onSlide: () => void;
  isTouchDevice?: boolean;
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ onJump, onSlide }) => {
  return (
    <>
      {/* Desktop Keyboard Hints at Bottom */}
      <div className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none items-center gap-4 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 rounded-full px-4 py-1.5 text-xs text-slate-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-amber-400 font-bold shadow-sm">
            Space
          </kbd>
          <span className="text-slate-400">or</span>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-amber-400 font-bold shadow-sm">
            ↑
          </kbd>
          <span className="font-semibold text-white">Jump</span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-orange-400 font-bold shadow-sm">
            ↓
          </kbd>
          <span className="text-slate-400">or</span>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-orange-400 font-bold shadow-sm">
            S
          </kbd>
          <span className="font-semibold text-white">Slide</span>
        </div>

        <span className="text-slate-600">|</span>

        <div className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-300 shadow-sm">
            Esc
          </kbd>
          <span className="text-slate-400">Pause</span>
        </div>
      </div>

      {/* Mobile / Touch On-Screen Touch Buttons (Large, high-contrast, responsive touch targets) */}
      <div className="sm:hidden absolute bottom-4 left-4 right-4 z-10 flex justify-between pointer-events-auto">
        <button
          id="touch-slide-btn"
          onTouchStart={(e) => { e.preventDefault(); onSlide(); }}
          onMouseDown={onSlide}
          className="w-24 h-24 rounded-2xl bg-orange-600/90 active:bg-orange-500 text-white font-black flex flex-col items-center justify-center gap-1 shadow-2xl border-2 border-orange-400/50 backdrop-blur-md active:scale-90 transition-transform select-none cursor-pointer"
        >
          <ArrowDown className="w-8 h-8" />
          <span className="text-xs uppercase tracking-wider">SLIDE</span>
        </button>

        <button
          id="touch-jump-btn"
          onTouchStart={(e) => { e.preventDefault(); onJump(); }}
          onMouseDown={onJump}
          className="w-24 h-24 rounded-2xl bg-amber-500/90 active:bg-amber-400 text-slate-950 font-black flex flex-col items-center justify-center gap-1 shadow-2xl border-2 border-amber-300/60 backdrop-blur-md active:scale-90 transition-transform select-none cursor-pointer"
        >
          <ArrowUp className="w-8 h-8" />
          <span className="text-xs uppercase tracking-wider">JUMP</span>
        </button>
      </div>
    </>
  );
};

import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UnityCodeViewer } from './components/UnityCodeViewer';
import { Code2, Sparkles, Trophy, Gamepad2, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [isUnityViewerOpen, setIsUnityViewerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 select-none">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                TEMPLE ESCAPE 2D
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider">
                Unity 2D Runner
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Side-scrolling endless runner with procedural traps, chasing beast & high score saving
            </p>
          </div>
        </div>

        {/* Unity C# Code Inspector Button */}
        <button
          id="header-unity-scripts-btn"
          onClick={() => setIsUnityViewerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Unity C# Project & Scripts</span>
          <span className="sm:hidden">C# Scripts</span>
        </button>
      </header>

      {/* Main Playable Game Viewport */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center my-auto">
        <GameCanvas onOpenUnityCode={() => setIsUnityViewerOpen(true)} />
      </main>

      {/* Footer Feature Matrix & Quick Specs */}
      <footer className="w-full max-w-5xl mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Procedural Spawns & Collision
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Dynamic Speed Ramping
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Local High Score Persistence
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUnityViewerOpen(true)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            Inspect Unity 2D (C#) Architecture & Guide →
          </button>
        </div>
      </footer>

      {/* Unity C# Scripts Modal */}
      <UnityCodeViewer
        isOpen={isUnityViewerOpen}
        onClose={() => setIsUnityViewerOpen(false)}
      />
    </div>
  );
}

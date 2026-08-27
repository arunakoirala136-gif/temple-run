import React, { useState } from 'react';
import { UNITY_SCRIPTS } from '../game/unityScripts';
import { X, Copy, Check, FileCode, Layers, BookOpen, Download, Terminal } from 'lucide-react';

interface UnityCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnityCodeViewer: React.FC<UnityCodeViewerProps> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  if (!isOpen) return null;

  const currentScript = UNITY_SCRIPTS[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentScript.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentScript.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md text-white">
      <div className="max-w-4xl w-full h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Unity 2D C# Scripts & Architecture
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Unity 2022+ / 6 LTS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete, production-ready C# code ready to copy or import directly into Unity.
              </p>
            </div>
          </div>

          <button
            id="close-unity-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Guide Toggle */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 min-w-max">
            {UNITY_SCRIPTS.map((script, idx) => (
              <button
                key={script.filename}
                onClick={() => {
                  setSelectedIdx(idx);
                  setShowSetupGuide(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 ${
                  !showSetupGuide && selectedIdx === idx
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                {script.filename}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 min-w-max ${
              showSetupGuide
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Unity Setup Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs">
          {showSetupGuide ? (
            <div className="space-y-6 text-slate-300 font-sans">
              <div>
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5" /> Unity Scene & Project Setup Checklist
                </h3>
                <p className="text-sm text-slate-400">
                  Follow these step-by-step instructions to create or test this exact 2D Endless Runner in the Unity Editor:
                </p>
              </div>

              {/* Step 1: Tags & Layers */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 text-amber-300">1. Tags & Layers</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li>Create Tags: <code className="text-cyan-300">Player</code>, <code className="text-cyan-300">Obstacle</code>, <code className="text-cyan-300">OverheadObstacle</code>, <code className="text-cyan-300">Coin</code>.</li>
                  <li>Create Layers: <code className="text-cyan-300">Ground</code> (for terrain ground checking), <code className="text-cyan-300">Player</code>, <code className="text-cyan-300">Obstacles</code>.</li>
                </ul>
              </div>

              {/* Step 2: Player Setup */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 text-amber-300">2. Player GameObject Setup</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li>Add <code className="text-cyan-300">Rigidbody2D</code>: Collision Detection: <em>Continuous</em>, Interpolate: <em>Interpolate</em>, Freeze Rotation Z: <em>Checked</em>.</li>
                  <li>Add <code className="text-cyan-300">BoxCollider2D</code>: Size: (0.8, 1.6), Offset: (0, 0.8).</li>
                  <li>Attach child Transform <code className="text-cyan-300">GroundCheck</code> at the player's feet (y: 0).</li>
                  <li>Attach <code className="text-cyan-300">PlayerController.cs</code> and assign the references.</li>
                </ul>
              </div>

              {/* Step 3: Chaser Monster Setup */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 text-amber-300">3. Chaser Monster Setup</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li>Place the Monster behind the player at (X: -7.5, Y: -1.0).</li>
                  <li>Attach <code className="text-cyan-300">ChaserMonster.cs</code> and drag the Player Transform into the <code className="text-cyan-300">Target Player</code> slot.</li>
                </ul>
              </div>

              {/* Step 4: Obstacle Prefabs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="font-bold text-white text-sm mb-2 text-amber-300">4. Obstacle Prefabs</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  <li><strong>Ground Spikes / Totem:</strong> BoxCollider2D (Is Trigger: <em>false</em> or <em>true</em>), Tag: <code className="text-cyan-300">Obstacle</code>.</li>
                  <li><strong>Overhead Arch:</strong> Suspended high with BoxCollider2D positioned at Y: 0.5 to 1.5 (leaves 0.8 clearance at bottom for slide!), Tag: <code className="text-cyan-300">OverheadObstacle</code>.</li>
                  <li><strong>Coin Prefab:</strong> CircleCollider2D (Is Trigger: <em>true</em>), Tag: <code className="text-cyan-300">Coin</code>, attach <code className="text-cyan-300">CoinCollectible.cs</code>.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-slate-400">
                <div>
                  <span className="text-white font-bold">{currentScript.title}</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">{currentScript.description}</p>
                </div>

                <div className="flex items-center gap-2 font-sans">
                  <button
                    onClick={handleDownloadFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .cs</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      copied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>

              {/* Code display with syntax line numbers */}
              <pre className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-x-auto text-emerald-300 leading-relaxed">
                <code>{currentScript.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 font-sans">
          <span>Target Platform: PC Standalone / Mobile 2D (C#)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};

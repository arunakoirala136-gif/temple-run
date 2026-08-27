import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameState, GameStats } from '../types';
import { HUD } from './HUD';
import { MainMenu } from './MainMenu';
import { GameOverModal } from './GameOverModal';
import { PauseModal } from './PauseModal';
import { ControlsGuide } from './ControlsGuide';
import { soundManager } from '../audio/SoundManager';

interface GameCanvasProps {
  onOpenUnityCode: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onOpenUnityCode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coins: 0,
    gems: 0,
    speed: 370,
    highScore: 0,
    newHighScore: false,
  });
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Set initial internal resolution
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 450;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onStateChange = (newState, newStats) => {
      setGameState(newState);
      setStats(newStats);
    };

    engine.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    engine.start();

    // ResizeObserver for fluid responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          engine.resize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      engine.stop();
      resizeObserver.disconnect();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Prevent scrolling for game controls
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyS', 'KeyW'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (engine.state === 'PLAYING') {
          engine.handleJump();
        } else if (engine.state === 'MENU') {
          engine.startGame();
        } else if (engine.state === 'GAMEOVER') {
          engine.restart();
        } else if (engine.state === 'PAUSED') {
          engine.resumeGame();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (engine.state === 'PLAYING') {
          engine.handleSlide();
        }
      } else if (e.code === 'KeyR' && engine.state === 'GAMEOVER') {
        engine.restart();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (engine.state === 'PLAYING') {
          engine.pauseGame();
        } else if (engine.state === 'PAUSED') {
          engine.resumeGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch Swipe Handlers for mobile
  const touchStartY = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;
    const engine = engineRef.current;
    if (!engine || engine.state !== 'PLAYING') return;

    if (diffY < -30) {
      // Swiped Up -> Jump
      engine.handleJump();
    } else if (diffY > 30) {
      // Swiped Down -> Slide
      engine.handleSlide();
    }
  };

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleStartGame = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.restart();
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.pauseGame();
  }, []);

  const handleResume = useCallback(() => {
    engineRef.current?.resumeGame();
  }, []);

  const handleJump = useCallback(() => {
    engineRef.current?.handleJump();
  }, []);

  const handleSlide = useCallback(() => {
    engineRef.current?.handleSlide();
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-viewport-container"
      className="relative w-full h-full min-h-[420px] max-h-[750px] aspect-[16/9] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 2D HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        id="runner-canvas"
        className="w-full h-full block cursor-pointer"
        onClick={() => {
          if (engineRef.current?.state === 'PLAYING') {
            engineRef.current.handleJump();
          }
        }}
      />

      {/* Real-time HUD (active during PLAYING) */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            stats={stats}
            onPause={handlePause}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
          <ControlsGuide onJump={handleJump} onSlide={handleSlide} />
        </>
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={stats.highScore}
          onStartGame={handleStartGame}
          onOpenUnityCode={onOpenUnityCode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onOpenUnityCode={onOpenUnityCode}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          stats={stats}
          onResume={handleResume}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}
    </div>
  );
};

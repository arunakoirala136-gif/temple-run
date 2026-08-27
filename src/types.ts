export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type ObstacleType = 
  | 'GROUND_SPIKE'
  | 'ANCIENT_TOTEM'
  | 'OVERHEAD_ARCH'
  | 'SWINGING_BLADE'
  | 'ROLLING_BOULDER'
  | 'LAVA_PIT';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
  requiresSlide: boolean;
  requiresJump: boolean;
  animFrame?: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  size: number;
  collected: boolean;
  value: number;
  isGem?: boolean;
  sparkleTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'spark' | 'smoke' | 'star';
}

export interface BackgroundLayer {
  speedMultiplier: number;
  offset: number;
  type: 'sky' | 'mountains' | 'temple_ruins' | 'jungle_trees' | 'ground' | 'foreground_vines';
}

export interface GameStats {
  score: number;
  distance: number;
  coins: number;
  gems: number;
  speed: number;
  highScore: number;
  newHighScore: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  runFrame: number;
  animTime: number;
  hurt: boolean;
}

export interface ChaserState {
  x: number;
  y: number;
  targetDistance: number;
  actualDistance: number;
  frame: number;
  animTime: number;
  jawOpen: number;
  roaring: boolean;
  lungeProgress: number;
}

export interface UnityScriptInfo {
  filename: string;
  title: string;
  description: string;
  code: string;
}

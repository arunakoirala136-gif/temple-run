import { GameState, Obstacle, Coin, Particle, PlayerState, ChaserState, GameStats, ObstacleType } from '../types';
import { soundManager } from '../audio/SoundManager';
import { drawPlayer, drawChaser, drawObstacle, drawCoin, drawParticles, drawParallaxBackground } from './sprites';
import confetti from 'canvas-confetti';

const STORAGE_KEY_HIGHSCORE = 'temple_runner_highscore';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  private lastTime: number = 0;

  // Game Dimensions & Metrics
  public width: number = 800;
  public height: number = 450;
  public groundY: number = 360;

  // State
  public state: GameState = 'MENU';
  public onStateChange?: (state: GameState, stats: GameStats) => void;
  public onStatsUpdate?: (stats: GameStats) => void;

  // Player & Chaser
  public player: PlayerState = {
    x: 180,
    y: 308,
    vy: 0,
    width: 34,
    height: 52,
    isGrounded: true,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    runFrame: 0,
    animTime: 0,
    hurt: false,
  };

  public chaser: ChaserState = {
    x: 40,
    y: 280,
    targetDistance: 140,
    actualDistance: 140,
    frame: 0,
    animTime: 0,
    jawOpen: 6,
    roaring: false,
    lungeProgress: 0,
  };

  // World & Spawns
  public obstacles: Obstacle[] = [];
  public coins: Coin[] = [];
  public particles: Particle[] = [];

  private nextObstacleDistance: number = 400;
  private nextCoinDistance: number = 200;
  private nextId: number = 1;

  // Physics Constants
  private gravity: number = 1850;
  private jumpVelocity: number = -660;
  private slideDuration: number = 0.65; // Seconds
  private baseSpeed: number = 370;      // Pixels/sec
  public currentSpeed: number = 370;

  // Scoring
  public distanceTraveled: number = 0; // In meters (distance / 10)
  public coinCount: number = 0;
  public gemCount: number = 0;
  public score: number = 0;
  public highScore: number = 0;
  public isNewHighScore: boolean = false;

  // FX
  private screenShake: number = 0;
  private totalTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.loadHighScore();
    this.resize(canvas.width, canvas.height);
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGHSCORE);
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore() {
    try {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.isNewHighScore = true;
        localStorage.setItem(STORAGE_KEY_HIGHSCORE, this.highScore.toString());
      }
    } catch {
      // Storage error fallback
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.groundY = Math.floor(height * 0.80);
    this.player.y = this.groundY - this.player.height;
    this.chaser.y = this.groundY - 70;
  }

  public start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    soundManager.stopBGM();
  }

  public startGame() {
    this.state = 'PLAYING';
    this.distanceTraveled = 0;
    this.coinCount = 0;
    this.gemCount = 0;
    this.score = 0;
    this.isNewHighScore = false;
    this.currentSpeed = this.baseSpeed;
    this.screenShake = 0;
    this.totalTime = 0;

    // Reset Player
    this.player.x = Math.max(120, this.width * 0.22);
    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.isJumping = false;
    this.player.isSliding = false;
    this.player.slideTimer = 0;
    this.player.runFrame = 0;
    this.player.animTime = 0;
    this.player.hurt = false;

    // Reset Chaser
    this.chaser.x = this.player.x - 140;
    this.chaser.y = this.groundY - 70;
    this.chaser.targetDistance = 140;
    this.chaser.actualDistance = 140;
    this.chaser.animTime = 0;
    this.chaser.roaring = false;
    this.chaser.lungeProgress = 0;

    // Clear world
    this.obstacles = [];
    this.coins = [];
    this.particles = [];
    this.nextObstacleDistance = 450;
    this.nextCoinDistance = 250;

    // Start background music
    soundManager.startBGM(1.0);

    this.notifyState();
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      soundManager.stopBGM();
      this.notifyState();
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      soundManager.startBGM(this.currentSpeed / this.baseSpeed);
      this.notifyState();
    }
  }

  public restart() {
    this.startGame();
  }

  // --- CONTROLS ---

  public handleJump() {
    if (this.state !== 'PLAYING') return;

    // Allow jump if grounded
    if (this.player.isGrounded) {
      this.player.vy = this.jumpVelocity;
      this.player.isGrounded = false;
      this.player.isJumping = true;
      this.player.isSliding = false; // Cancel slide if jumped
      this.player.slideTimer = 0;
      soundManager.playJump();

      // Jump dust burst particles
      this.spawnParticles(this.player.x + 16, this.groundY, '#d97706', 8, 'smoke');
    }
  }

  public handleSlide() {
    if (this.state !== 'PLAYING') return;

    if (this.player.isGrounded) {
      this.player.isSliding = true;
      this.player.slideTimer = this.slideDuration;
      soundManager.playSlide();

      // Slide gravel sparks
      this.spawnParticles(this.player.x + 20, this.groundY - 4, '#facc15', 10, 'spark');
    } else {
      // Fast fall down stomp if airborne
      this.player.vy = Math.max(this.player.vy, 450);
    }
  }

  // --- GAME LOOP ---

  private loop = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Clamp dt to prevent tunneling
    this.lastTime = now;

    if (this.state === 'PLAYING') {
      this.update(dt);
    } else if (this.state === 'GAMEOVER') {
      this.updateGameOver(dt);
    } else if (this.state === 'MENU') {
      this.updateMenu(dt);
    }

    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  private updateMenu(dt: number) {
    this.totalTime += dt;
    this.chaser.animTime += dt;
    this.player.animTime += dt;
    this.player.runFrame += dt * 8;
  }

  private update(dt: number) {
    this.totalTime += dt;

    // 1. Ramp difficulty / speed
    const distanceMeters = Math.floor(this.distanceTraveled);
    this.currentSpeed = this.baseSpeed + Math.min(distanceMeters * 0.22, 420);
    soundManager.updateBGMSpeed(this.currentSpeed / this.baseSpeed);

    // 2. Advance distance & score
    const frameDistance = this.currentSpeed * dt;
    this.distanceTraveled += frameDistance * 0.05; // Scale distance
    this.score = Math.floor(this.distanceTraveled) + (this.coinCount * 10) + (this.gemCount * 50);

    // 3. Player Physics
    this.player.animTime += dt;

    if (this.player.isSliding) {
      this.player.slideTimer -= dt;
      if (this.player.slideTimer <= 0) {
        this.player.isSliding = false;
      }
      // Continuous slide smoke
      if (Math.random() < 0.35) {
        this.spawnParticles(this.player.x + 4, this.groundY - 2, '#ca8a04', 2, 'smoke');
      }
    } else {
      this.player.runFrame += dt * (this.currentSpeed * 0.024);
    }

    if (!this.player.isGrounded) {
      this.player.vy += this.gravity * dt;
      this.player.y += this.player.vy * dt;

      // Ground collision
      if (this.player.y >= this.groundY - this.player.height) {
        this.player.y = this.groundY - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;

        // Landing dust
        this.spawnParticles(this.player.x + 16, this.groundY, '#94a3b8', 6, 'smoke');
      }
    }

    // 4. Chaser Monster tracking & animation
    this.chaser.animTime += dt;
    const targetX = this.player.x - this.chaser.targetDistance;
    this.chaser.x += (targetX - this.chaser.x) * dt * 4;

    // Random monster growl / roar fx occasionally
    if (Math.random() < 0.003 && !this.chaser.roaring) {
      this.chaser.roaring = true;
      soundManager.playMonsterRoar();
      setTimeout(() => { this.chaser.roaring = false; }, 1000);
    }

    // 5. Procedural Spawning
    this.handleSpawning(frameDistance);

    // 6. Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= frameDistance;

      // Check collision
      if (this.checkPlayerObstacleCollision(obs)) {
        this.triggerGameOver();
        return;
      }

      // Despawn offscreen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }

    // 7. Update Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.x -= frameDistance;

      // Check collection
      if (!coin.collected && this.checkPlayerCoinCollision(coin)) {
        coin.collected = true;
        if (coin.isGem) {
          this.gemCount++;
          soundManager.playGem();
          this.spawnParticles(coin.x, coin.y, '#f43f5e', 14, 'star');
        } else {
          this.coinCount++;
          soundManager.playCoin();
          this.spawnParticles(coin.x, coin.y, '#facc15', 10, 'spark');
        }
      }

      // Despawn
      if (coin.x < -60 || coin.collected) {
        this.coins.splice(i, 1);
      }
    }

    // 8. Update Particles
    this.updateParticles(dt);

    // 9. Update FX
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Notify HUD
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.getStats());
    }
  }

  private updateGameOver(dt: number) {
    this.totalTime += dt;
    this.chaser.animTime += dt;
    this.chaser.lungeProgress = Math.min(1.0, this.chaser.lungeProgress + dt * 3.5);
    this.updateParticles(dt);
  }

  private handleSpawning(frameDistance: number) {
    this.nextObstacleDistance -= frameDistance;
    this.nextCoinDistance -= frameDistance;

    // Obstacle Spawner
    if (this.nextObstacleDistance <= 0) {
      this.spawnProceduralObstacle();
      // Difficulty: Obstacle gap decreases slightly as speed increases
      const minGap = Math.max(280, 520 - Math.min(this.distanceTraveled * 0.15, 200));
      const maxGap = minGap + 240;
      this.nextObstacleDistance = minGap + Math.random() * (maxGap - minGap);
    }

    // Coin & Gem Spawner
    if (this.nextCoinDistance <= 0) {
      this.spawnCoinPattern();
      this.nextCoinDistance = 300 + Math.random() * 350;
    }
  }

  private spawnProceduralObstacle() {
    const types: ObstacleType[] = [
      'GROUND_SPIKE',
      'ANCIENT_TOTEM',
      'OVERHEAD_ARCH',
      'SWINGING_BLADE',
      'ROLLING_BOULDER',
      'LAVA_PIT',
    ];

    // Pick type based on distance difficulty
    let type: ObstacleType = 'GROUND_SPIKE';
    const rand = Math.random();

    if (this.distanceTraveled < 100) {
      // Early game: simpler ground spikes and arches
      type = rand < 0.6 ? 'GROUND_SPIKE' : 'OVERHEAD_ARCH';
    } else if (this.distanceTraveled < 300) {
      if (rand < 0.35) type = 'GROUND_SPIKE';
      else if (rand < 0.70) type = 'OVERHEAD_ARCH';
      else type = 'ANCIENT_TOTEM';
    } else {
      // Full variety
      type = types[Math.floor(Math.random() * types.length)];
    }

    let width = 36;
    let height = 44;
    let y = this.groundY - height;
    let requiresSlide = false;
    let requiresJump = true;

    switch (type) {
      case 'GROUND_SPIKE':
        width = 38;
        height = 36;
        y = this.groundY - height;
        requiresJump = true;
        break;

      case 'ANCIENT_TOTEM':
        width = 34;
        height = 54;
        y = this.groundY - height;
        requiresJump = true;
        break;

      case 'OVERHEAD_ARCH':
        // Suspended overhead block - player MUST slide underneath!
        width = 68;
        height = 42;
        // Positioned leaving a ~34px clearance beneath
        y = this.groundY - 76;
        requiresSlide = true;
        requiresJump = false;
        break;

      case 'SWINGING_BLADE':
        width = 46;
        height = 46;
        y = this.groundY - 72;
        requiresSlide = true;
        requiresJump = false;
        break;

      case 'ROLLING_BOULDER':
        width = 48;
        height = 48;
        y = this.groundY - height;
        requiresJump = true;
        break;

      case 'LAVA_PIT':
        width = 70;
        height = 18;
        y = this.groundY - 4;
        requiresJump = true;
        break;
    }

    const obs: Obstacle = {
      id: this.nextId++,
      x: this.width + 50,
      y,
      width,
      height,
      type,
      passed: false,
      requiresSlide,
      requiresJump,
    };

    this.obstacles.push(obs);

    // Spawn bonus coins above ground obstacles (incentivize high jump)
    if (requiresJump && Math.random() < 0.7) {
      this.coins.push({
        id: this.nextId++,
        x: obs.x + width / 2,
        y: obs.y - 45,
        size: 18,
        collected: false,
        value: 10,
        sparkleTimer: 0,
      });
    }
  }

  private spawnCoinPattern() {
    const patternType = Math.random();
    const startX = this.width + 60;
    const isGemSpawn = Math.random() < 0.22; // 22% chance for high-value Gem

    if (patternType < 0.4) {
      // 1. Arch pattern (jump trail)
      for (let i = 0; i < 5; i++) {
        const cx = startX + i * 36;
        const cy = this.groundY - 50 - Math.sin((i / 4) * Math.PI) * 55;
        this.coins.push({
          id: this.nextId++,
          x: cx,
          y: cy,
          size: 18,
          collected: false,
          value: 10,
          sparkleTimer: 0,
        });
      }
    } else if (patternType < 0.75) {
      // 2. Straight line on ground or slide lane
      const groundLine = Math.random() < 0.5;
      const cy = groundLine ? this.groundY - 24 : this.groundY - 60;
      for (let i = 0; i < 4; i++) {
        this.coins.push({
          id: this.nextId++,
          x: startX + i * 34,
          y: cy,
          size: 18,
          collected: false,
          value: 10,
          sparkleTimer: 0,
        });
      }
    } else if (isGemSpawn) {
      // 3. Floating Ruby Gem
      this.coins.push({
        id: this.nextId++,
        x: startX,
        y: this.groundY - 70,
        size: 24,
        collected: false,
        value: 50,
        isGem: true,
        sparkleTimer: 0,
      });
    }
  }

  // --- COLLISION DETECTION ---

  private checkPlayerObstacleCollision(obs: Obstacle): boolean {
    // Determine player hitbox based on state
    let px = this.player.x;
    let py = this.player.y;
    let pw = this.player.width;
    let ph = this.player.height;

    if (this.player.isSliding) {
      // Sliding reduces player hitbox height significantly and lowers center
      pw = 42;
      ph = 20;
      py = this.groundY - ph;
      px = this.player.x - 4;
    } else {
      // Normal / Jump hitbox with slight padding for fairness
      px += 6;
      pw -= 12;
      py += 4;
      ph -= 6;
    }

    // AABB intersection check
    const collision = (
      px < obs.x + obs.width &&
      px + pw > obs.x &&
      py < obs.y + obs.height &&
      py + ph > obs.y
    );

    return collision;
  }

  private checkPlayerCoinCollision(coin: Coin): boolean {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.isSliding ? this.groundY - 12 : this.player.y + this.player.height / 2;
    const radius = coin.size;

    const dx = px - coin.x;
    const dy = py - coin.y;
    const distSq = dx * dx + dy * dy;

    return distSq < (radius + 24) * (radius + 24);
  }

  // --- PARTICLES ---

  private spawnParticles(x: number, y: number, color: string, count: number, shape: Particle['shape'] = 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed - (shape === 'smoke' ? 40 : 0),
        vy: Math.sin(angle) * speed - (shape === 'smoke' ? 30 : 0),
        size: 3 + Math.random() * 5,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.4,
        shape,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = 1.0 - (p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- GAME OVER ---

  private triggerGameOver() {
    this.state = 'GAMEOVER';
    this.player.hurt = true;
    this.screenShake = 14;

    soundManager.stopBGM();
    soundManager.playHit();
    soundManager.playMonsterRoar();
    soundManager.playGameOver();

    // Death explosion FX
    this.spawnParticles(this.player.x + 16, this.player.y + 24, '#ef4444', 24, 'square');
    this.spawnParticles(this.player.x + 16, this.player.y + 24, '#f59e0b', 16, 'spark');

    // Save and check high score
    const prevHigh = this.highScore;
    this.saveHighScore();

    if (this.score > prevHigh && this.score > 0) {
      this.isNewHighScore = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    this.notifyState();
  }

  private notifyState() {
    const stats = this.getStats();
    if (this.onStateChange) {
      this.onStateChange(this.state, stats);
    }
    if (this.onStatsUpdate) {
      this.onStatsUpdate(stats);
    }
  }

  public getStats(): GameStats {
    return {
      score: this.score,
      distance: Math.floor(this.distanceTraveled),
      coins: this.coinCount,
      gems: this.gemCount,
      speed: Math.floor(this.currentSpeed),
      highScore: this.highScore,
      newHighScore: this.isNewHighScore,
    };
  }

  // --- RENDER ---

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Parallax background
    drawParallaxBackground(
      ctx,
      this.width,
      this.height,
      this.groundY,
      this.distanceTraveled * 10,
      this.totalTime
    );

    // 2. Collectible Coins & Gems
    for (const coin of this.coins) {
      drawCoin(ctx, coin, this.totalTime);
    }

    // 3. Obstacles
    for (const obs of this.obstacles) {
      drawObstacle(ctx, obs, this.totalTime);
    }

    // 4. Chasing Monster Beast (behind player)
    drawChaser(ctx, this.chaser, this.state === 'GAMEOVER');

    // 5. Player Character
    drawPlayer(ctx, this.player);

    // 6. Particles
    drawParticles(ctx, this.particles);

    ctx.restore();
  }
}

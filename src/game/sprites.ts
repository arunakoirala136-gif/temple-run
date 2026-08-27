import { Obstacle, Coin, Particle, PlayerState, ChaserState } from '../types';

/**
 * Procedural 2D Sprite & Vector Renderer
 * Renders all game characters, obstacles, coins, particles, and background layers with high visual polish.
 */

// Draw Player Explorer Character
export function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
  ctx.save();
  ctx.translate(player.x, player.y);

  if (player.hurt) {
    // Hurt / knockback state
    ctx.rotate(0.4);
    ctx.fillStyle = '#ef4444';
  }

  const isSliding = player.isSliding;
  const isJumping = player.isJumping || !player.isGrounded;
  const runCycle = Math.sin(player.runFrame * 1.2);
  const legCycle = Math.cos(player.runFrame * 1.2);

  if (isSliding) {
    // --- SLIDING POSE ---
    // Slide dust streak
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-15, player.height - 4, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (low horizontal profile)
    ctx.fillStyle = '#b45309'; // Khaki brown jacket
    ctx.beginPath();
    ctx.roundRect(-4, player.height - 24, 46, 18, 6);
    ctx.fill();

    // Head tilted back
    ctx.fillStyle = '#fbcfe8'; // Face
    ctx.beginPath();
    ctx.arc(32, player.height - 18, 9, 0, Math.PI * 2);
    ctx.fill();

    // Explorer Fedora Hat
    ctx.fillStyle = '#78350f';
    ctx.fillRect(24, player.height - 28, 18, 4); // Brim
    ctx.fillRect(28, player.height - 34, 10, 8); // Crown

    // Red Scarf trailing
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(26, player.height - 16);
    ctx.lineTo(8, player.height - 18 + Math.sin(player.animTime * 15) * 3);
    ctx.stroke();

    // Sliding Legs stretched
    ctx.fillStyle = '#1e3a8a'; // Blue pants
    ctx.fillRect(-14, player.height - 12, 22, 10);

    // Boots
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-18, player.height - 14, 8, 12);
  } else {
    // --- STANDING / RUNNING / JUMPING POSE ---
    const bob = isJumping ? 0 : Math.abs(Math.sin(player.runFrame * 1.5)) * 3;

    // Shadow on ground if jumping
    if (isJumping) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(player.width / 2, player.height + 25, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Legs
    ctx.fillStyle = '#1e3a8a'; // Blue adventurous denim pants
    if (isJumping) {
      // Tucked jump legs
      ctx.beginPath();
      ctx.roundRect(4, player.height - 22, 10, 16, 4);
      ctx.roundRect(16, player.height - 18, 10, 14, 4);
      ctx.fill();

      // Boots
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, player.height - 8, 10, 7);
      ctx.fillRect(16, player.height - 6, 10, 7);
    } else {
      // Animated Running Legs
      const leg1Angle = legCycle * 0.65;
      const leg2Angle = -legCycle * 0.65;

      // Back leg
      ctx.save();
      ctx.translate(12, player.height - 24);
      ctx.rotate(leg2Angle);
      ctx.fillStyle = '#172554';
      ctx.fillRect(-4, 0, 8, 18);
      ctx.fillStyle = '#451a03'; // Boot
      ctx.fillRect(-4, 16, 10, 7);
      ctx.restore();

      // Front leg
      ctx.save();
      ctx.translate(18, player.height - 24);
      ctx.rotate(leg1Angle);
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(-4, 0, 8, 18);
      ctx.fillStyle = '#78350f'; // Boot
      ctx.fillRect(-4, 16, 11, 7);
      ctx.restore();
    }

    // Torso / Jacket
    ctx.fillStyle = '#d97706'; // Explorer Khaki / Ochre
    ctx.beginPath();
    ctx.roundRect(6, 18 - bob, 20, 24, 5);
    ctx.fill();

    // Vest Details & Belt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 38 - bob, 20, 4); // Belt
    ctx.fillStyle = '#f59e0b'; // Belt buckle
    ctx.fillRect(14, 37 - bob, 4, 6);

    // Explorer Satchel bag strap
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 19 - bob);
    ctx.lineTo(24, 38 - bob);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fde047'; // Skin tone
    ctx.beginPath();
    ctx.arc(16, 11 - bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // Focused Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(20, 9 - bob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Explorer Fedora Hat
    ctx.fillStyle = '#78350f'; // Hat brown
    ctx.beginPath();
    ctx.ellipse(16, 4 - bob, 16, 4, 0, 0, Math.PI * 2); // Brim
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(9, -7 - bob, 14, 10, [4, 4, 0, 0]); // Crown
    ctx.fill();
    ctx.fillStyle = '#b45309'; // Hat band
    ctx.fillRect(9, 0 - bob, 14, 3);

    // Trailing Red Scarf
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(14, 16 - bob);
    ctx.quadraticCurveTo(
      4 - Math.abs(runCycle) * 8,
      14 - bob + Math.sin(player.animTime * 12) * 5,
      -8 - Math.abs(runCycle) * 12,
      12 - bob + Math.cos(player.animTime * 12) * 4
    );
    ctx.stroke();

    // Arms
    ctx.fillStyle = '#b45309';
    if (isJumping) {
      // Raised arms
      ctx.beginPath();
      ctx.roundRect(20, 14 - bob, 6, 14, 3);
      ctx.roundRect(4, 14 - bob, 6, 14, 3);
      ctx.fill();
    } else {
      // Swinging arms
      ctx.save();
      ctx.translate(16, 22 - bob);
      ctx.rotate(-runCycle * 0.7);
      ctx.fillRect(-3, 0, 6, 14);
      ctx.fillStyle = '#fde047'; // Hand
      ctx.arc(0, 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

// Draw Chasing Demon / Monster
export function drawChaser(ctx: CanvasRenderingContext2D, chaser: ChaserState, isGameOver: boolean) {
  ctx.save();
  ctx.translate(chaser.x, chaser.y);

  const bob = Math.sin(chaser.animTime * 8) * 6;
  const lunge = isGameOver ? Math.min(1, chaser.lungeProgress) * 45 : 0;
  const armReach = Math.sin(chaser.animTime * 10) * 15 + lunge;

  // Dark evil smoke aura behind monster
  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.beginPath();
  ctx.arc(-20, 20 + bob, 45, 0, Math.PI * 2);
  ctx.arc(-35, 0 + bob, 35, 0, Math.PI * 2);
  ctx.fill();

  // Menacing Shadow Beast Body
  ctx.fillStyle = '#1e1b4b'; // Deep void purple/black
  ctx.beginPath();
  ctx.roundRect(-25 + lunge * 0.4, -10 + bob, 58, 70, 16);
  ctx.fill();

  // Stone Demon Chest Plates / Runes
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-5 + lunge * 0.4, 15 + bob);
  ctx.lineTo(15 + lunge * 0.4, 25 + bob);
  ctx.lineTo(-5 + lunge * 0.4, 35 + bob);
  ctx.stroke();

  // Demon Horns
  ctx.fillStyle = '#991b1b';
  // Left Horn
  ctx.beginPath();
  ctx.moveTo(-10 + lunge * 0.4, -10 + bob);
  ctx.quadraticCurveTo(-25 + lunge * 0.4, -35 + bob, -15 + lunge * 0.4, -40 + bob);
  ctx.quadraticCurveTo(-5 + lunge * 0.4, -25 + bob, 0 + lunge * 0.4, -10 + bob);
  ctx.fill();

  // Right Horn
  ctx.beginPath();
  ctx.moveTo(15 + lunge * 0.4, -10 + bob);
  ctx.quadraticCurveTo(35 + lunge * 0.4, -35 + bob, 25 + lunge * 0.4, -40 + bob);
  ctx.quadraticCurveTo(15 + lunge * 0.4, -25 + bob, 25 + lunge * 0.4, -10 + bob);
  ctx.fill();

  // Head
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-15 + lunge * 0.5, -22 + bob, 45, 34, 12);
  ctx.fill();

  // Glowing Crimson Evil Eyes
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(8 + lunge * 0.5, -12 + bob, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.ellipse(22 + lunge * 0.5, -12 + bob, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye pupils (angry slashes)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(9 + lunge * 0.5, -14 + bob, 2, 5);
  ctx.fillRect(23 + lunge * 0.5, -14 + bob, 2, 5);

  // Snapping Jaws / Sharp Teeth
  const jawOpen = isGameOver ? 18 : 6 + Math.abs(Math.sin(chaser.animTime * 6)) * 8;
  ctx.fillStyle = '#020617';
  ctx.fillRect(5 + lunge * 0.5, -4 + bob, 28, jawOpen);

  // Sharp white teeth
  ctx.fillStyle = '#f8fafc';
  for (let i = 0; i < 4; i++) {
    // Upper teeth
    ctx.beginPath();
    ctx.moveTo(7 + i * 7 + lunge * 0.5, -4 + bob);
    ctx.lineTo(10 + i * 7 + lunge * 0.5, 2 + bob);
    ctx.lineTo(13 + i * 7 + lunge * 0.5, -4 + bob);
    ctx.fill();
    // Lower teeth
    ctx.beginPath();
    ctx.moveTo(7 + i * 7 + lunge * 0.5, -4 + jawOpen + bob);
    ctx.lineTo(10 + i * 7 + lunge * 0.5, -10 + jawOpen + bob);
    ctx.lineTo(13 + i * 7 + lunge * 0.5, -4 + jawOpen + bob);
    ctx.fill();
  }

  // Giant Clawed Arms reaching forward
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.roundRect(15 + armReach, 12 + bob, 32, 14, 6);
  ctx.fill();

  // Claws
  ctx.fillStyle = '#f43f5e';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(46 + armReach, 12 + i * 5 + bob);
    ctx.lineTo(56 + armReach, 14 + i * 5 + bob);
    ctx.lineTo(46 + armReach, 17 + i * 5 + bob);
    ctx.fill();
  }

  // Heavy Stomping Legs
  const legCycle = Math.sin(chaser.animTime * 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-15, 52 + legCycle * 8, 14, 22);
  ctx.fillRect(8, 52 - legCycle * 8, 14, 22);

  // Claws on feet
  ctx.fillStyle = '#475569';
  ctx.fillRect(-18, 70 + legCycle * 8, 18, 8);
  ctx.fillRect(5, 70 - legCycle * 8, 18, 8);

  ctx.restore();
}

// Draw Obstacles
export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  switch (obs.type) {
    case 'GROUND_SPIKE': {
      // Ancient stone spike cluster
      ctx.fillStyle = '#475569';
      // Spike 1
      ctx.beginPath();
      ctx.moveTo(0, obs.height);
      ctx.lineTo(obs.width * 0.3, 0);
      ctx.lineTo(obs.width * 0.6, obs.height);
      ctx.fill();
      // Spike 2
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(obs.width * 0.35, obs.height);
      ctx.lineTo(obs.width * 0.75, 4);
      ctx.lineTo(obs.width, obs.height);
      ctx.fill();

      // Blood / Rune markings
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(obs.width * 0.26, 12, 3, 14);
      ctx.fillRect(obs.width * 0.7, 16, 3, 12);
      break;
    }

    case 'ANCIENT_TOTEM': {
      // Carved Stone Idol Totem
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(0, 0, obs.width, obs.height, 6);
      ctx.fill();

      // Stone cracks and Aztec carvings
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, 8, obs.width - 8, 6);
      ctx.fillRect(4, 22, obs.width - 8, 6);
      ctx.fillRect(4, obs.height - 16, obs.width - 8, 8);

      // Glowing Totem Eyes
      ctx.fillStyle = '#06b6d4'; // Cyan glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(8, 12, 6, 6);
      ctx.fillRect(obs.width - 14, 12, 6, 6);
      ctx.shadowBlur = 0;

      // Carved mouth
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, 26, obs.width - 20, 10);
      break;
    }

    case 'OVERHEAD_ARCH': {
      // Hanging Ancient Stone Archway (Requires Slide!)
      // Top solid stone beam
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(0, 0, obs.width, obs.height, [6, 6, 2, 2]);
      ctx.fill();

      // Stone block joints
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, obs.width - 4, obs.height - 4);

      // Hanging moss / stalactites at the bottom edge
      ctx.fillStyle = '#15803d'; // Green moss
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(4 + i * 12, obs.height);
        ctx.lineTo(9 + i * 12, obs.height + 8 + (i % 2) * 6);
        ctx.lineTo(14 + i * 12, obs.height);
        ctx.fill();
      }

      // Warning glowing red danger glyph
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▼ SLIDE', obs.width / 2, obs.height - 8);
      break;
    }

    case 'SWINGING_BLADE': {
      // Overhead Razor Pendulum / Spinning Blade
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(obs.width / 2, obs.height / 2, obs.width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Blade edges
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spinning spoke effect
      const rot = time * 8;
      ctx.save();
      ctx.translate(obs.width / 2, obs.height / 2);
      ctx.rotate(rot);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-obs.width / 2, -2, obs.width, 4);
      ctx.fillRect(-2, -obs.height / 2, 4, obs.height);
      ctx.restore();
      break;
    }

    case 'ROLLING_BOULDER': {
      // Giant Cracked Aztec Stone Sphere
      const r = obs.width / 2;
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(-time * 6); // Rolling spin

      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Glowing lava cracks
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(r * 0.2, -r * 0.4);
      ctx.lineTo(r * 0.6, r * 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'LAVA_PIT': {
      // Fiery Ground Lava Pit
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, obs.width, obs.height);

      // Bubbling hot magma
      ctx.fillStyle = '#facc15';
      const bubble = Math.sin(time * 10) * 4;
      ctx.beginPath();
      ctx.arc(obs.width * 0.3, bubble, 6, 0, Math.PI * 2);
      ctx.arc(obs.width * 0.7, -bubble, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// Draw Collectible Coins & Gems
export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin, time: number) {
  if (coin.collected) return;
  ctx.save();
  ctx.translate(coin.x, coin.y);

  const bob = Math.sin(time * 6 + coin.id) * 4;
  const spin = Math.cos(time * 7 + coin.id * 0.5); // 3D Coin flip effect

  if (coin.isGem) {
    // --- SPECIAL RUBY GEM (+50 pts) ---
    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(Math.abs(spin) * 0.4 + 0.6, 1);

    // Glowing Aura
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;

    // Diamond Gem Shape
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(0, -coin.size / 2);
    ctx.lineTo(coin.size / 2, 0);
    ctx.lineTo(0, coin.size / 2);
    ctx.lineTo(-coin.size / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Gem Facet Highlights
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.moveTo(0, -coin.size / 2);
    ctx.lineTo(coin.size / 4, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(-coin.size / 4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  } else {
    // --- ANCIENT GOLD SUN COIN ---
    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(Math.abs(spin), 1); // 3D spin compression

    // Outer Gold Rim
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner Shiny Face
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, coin.size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Sun Icon / Star in center
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(-2, -5, 4, 10);
    ctx.fillRect(-5, -2, 10, 4);

    // Sparkle shimmer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-coin.size / 5, -coin.size / 5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

// Draw Particles
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.shape === 'star') {
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }
}

// Draw Parallax Background Layers
export function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  distance: number,
  time: number
) {
  // Layer 1: Mystical Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#090d16');   // Midnight space
  skyGrad.addColorStop(0.4, '#1e1b4b'); // Deep twilight indigo
  skyGrad.addColorStop(0.7, '#4c1d95'); // Mystic purple
  skyGrad.addColorStop(1, '#831843');   // Warm horizon crimson
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Distant Golden Eclipse / Moon
  ctx.save();
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(width * 0.75, height * 0.28, 48, 0, Math.PI * 2);
  ctx.fill();
  // Moon craters
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(width * 0.75 - 12, height * 0.28 - 8, 10, 0, Math.PI * 2);
  ctx.arc(width * 0.75 + 14, height * 0.28 + 12, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Distant Stars twinkling
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 25; i++) {
    const sx = ((i * 67 + 23) % width);
    const sy = ((i * 41 + 17) % (height * 0.45));
    const starAlpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 2 + i));
    ctx.globalAlpha = starAlpha;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1.0;

  // Layer 2: Distant Mountain Silhouettes (Slow Scroll: 0.1x)
  const mountainOffset = (distance * 0.08) % 600;
  ctx.fillStyle = '#2e1065';
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = -600; x < width + 600; x += 150) {
    const peakX = x - mountainOffset;
    const peakY = groundY - 140 - Math.sin((x + 100) * 0.01) * 70;
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(peakX + 75, groundY - 70);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Layer 3: Ancient Temple Pyramids & Jungle Canopy (Mid Scroll: 0.35x)
  const templeOffset = (distance * 0.28) % 800;
  ctx.fillStyle = '#1c1917';
  for (let x = -800; x < width + 800; x += 400) {
    const tx = x - templeOffset;
    // Temple stepped pyramid
    ctx.beginPath();
    ctx.moveTo(tx - 120, groundY);
    ctx.lineTo(tx - 80, groundY - 60);
    ctx.lineTo(tx - 40, groundY - 60);
    ctx.lineTo(tx - 30, groundY - 95);
    ctx.lineTo(tx + 30, groundY - 95);
    ctx.lineTo(tx + 40, groundY - 60);
    ctx.lineTo(tx + 80, groundY - 60);
    ctx.lineTo(tx + 120, groundY);
    ctx.closePath();
    ctx.fill();

    // Jungle Trees & Vines
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(tx + 180, groundY - 80, 45, 0, Math.PI * 2);
    ctx.arc(tx + 220, groundY - 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
  }

  // Layer 4: Temple Ground / Stone Path & Slabs (Full Speed: 1.0x)
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
  groundGrad.addColorStop(0, '#44403c'); // Stone gray-brown
  groundGrad.addColorStop(0.25, '#292524');
  groundGrad.addColorStop(1, '#0c0a09');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, width, height - groundY);

  // Cobblestone tiles and decorative lines
  const tileOffset = distance % 60;
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, groundY, width, 4); // Top edge line

  // Stone tiles
  for (let x = -60; x < width + 60; x += 60) {
    const gx = x - tileOffset;
    ctx.fillStyle = '#78716c';
    ctx.fillRect(gx + 2, groundY + 4, 56, 12);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(gx + 2, groundY + 18, 26, 14);
    ctx.fillRect(gx + 30, groundY + 18, 28, 14);

    // Ancient Aztec Glyphs on pavement
    if (Math.floor((x + distance) / 120) % 3 === 0) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(gx + 20, groundY + 8, 16, 4);
    }
  }

  // Burning Ancient Torches along the pathway
  const torchOffset = (distance * 0.8) % 350;
  for (let x = -350; x < width + 350; x += 350) {
    const tox = x - torchOffset;
    // Wooden / Stone Torch post
    ctx.fillStyle = '#451a03';
    ctx.fillRect(tox, groundY - 45, 8, 45);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(tox - 4, groundY - 50, 16, 8);

    // Dancing Fire Flame
    const fireFlicker = Math.sin(time * 18 + x) * 3;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(tox + 4, groundY - 56 + fireFlicker, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(tox + 4, groundY - 55 + fireFlicker, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

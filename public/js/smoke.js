// ==============================================================================
// 💨 LETEĆI ROĐA & AIGAD — VOLUMETRIC SMOKE & EMBER ENGINE (v5.0-GODMODE)
// Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)
// Physical Smoke Simulation with Audio-Reactive Turbulence & Drifting Embers
// ==============================================================================

class SmokeParticle {
  constructor(x, y, isRing = false, tintColor = "rgba(168, 85, 247, ") {
    this.x = x;
    this.y = y;
    this.isRing = isRing;
    this.tintColor = tintColor;

    this.life = 0;
    this.maxLife = isRing ? 120 + Math.random() * 50 : 180 + Math.random() * 80;

    // Physical upward velocity
    this.vx = (Math.random() - 0.5) * 0.9;
    this.vy = -(1.1 + Math.random() * 1.6);

    // Size and diffusion
    this.initialSize = isRing ? 10 : 6 + Math.random() * 8;
    this.size = this.initialSize;
    this.growthRate = isRing ? 0.45 : 0.28 + Math.random() * 0.2;

    // Wave oscillation
    this.waveOffset = Math.random() * Math.PI * 2;
    this.waveSpeed = 0.025 + Math.random() * 0.02;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
  }

  update(windFactor = 0, bassIntensity = 0) {
    this.life++;

    // Turbulence & sway
    this.x += this.vx + Math.sin(this.life * this.waveSpeed + this.waveOffset) * 0.7 + windFactor;
    this.y += this.vy * (1 + bassIntensity * 0.6);

    // Expansion & rotation
    this.size += this.growthRate * (1 + bassIntensity * 0.35);
    this.rotation += this.rotSpeed;

    return this.life < this.maxLife;
  }

  draw(ctx) {
    const progress = this.life / this.maxLife;
    let alpha = 0;
    if (progress < 0.15) {
      alpha = (progress / 0.15) * 0.42;
    } else {
      alpha = (1 - progress) * 0.42;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isRing) {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, this.size * 0.18);
      ctx.strokeStyle = `${this.tintColor}${alpha})`;
      ctx.stroke();
    } else {
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, `${this.tintColor}${alpha * 0.95})`);
      grad.addColorStop(0.45, `rgba(180, 160, 220, ${alpha * 0.35})`);
      grad.addColorStop(1, "rgba(10, 8, 20, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class EmberParticle {
  constructor(x, y, color = "#ffaa40") {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 15;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = -(1.5 + Math.random() * 2.2);
    this.life = 0;
    this.maxLife = 70 + Math.random() * 60;
    this.size = 1.2 + Math.random() * 2.2;
    this.color = color;
  }

  update(windFactor = 0, bassIntensity = 0) {
    this.life++;
    this.x += this.vx + windFactor * 0.5 + Math.sin(this.life * 0.08) * 0.4;
    this.y += this.vy * (1 + bassIntensity * 0.7);
    return this.life < this.maxLife;
  }

  draw(ctx) {
    const alpha = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class SmokeEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.embers = [];
    this.maxParticles = 140;
    this.emitter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.tintColor = "rgba(168, 85, 247, "; // Neon purple
    this.emberColor = "#ec4899"; // Electric pink embers
    this.bassIntensity = 0;
    this.wind = 0;

    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setEmitter(x, y) {
    this.emitter.x = x;
    this.emitter.y = y;
  }

  setTint(colorString, emberColor = "#ec4899") {
    this.tintColor = colorString;
    this.emberColor = emberColor;
  }

  setMaxParticles(count) {
    this.maxParticles = count;
  }

  setBassIntensity(intensity) {
    this.bassIntensity = Math.min(1.0, Math.max(0, intensity));
  }

  emitContinuous() {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(new SmokeParticle(
        this.emitter.x + (Math.random() - 0.5) * 10,
        this.emitter.y + (Math.random() - 0.5) * 8,
        Math.random() < 0.18,
        this.tintColor
      ));
    }

    // Occasional glowing ember
    if (Math.random() < 0.25) {
      this.embers.push(new EmberParticle(this.emitter.x, this.emitter.y, this.emberColor));
    }
  }

  triggerPuff(big = false) {
    const count = big ? 24 : 12;
    for (let i = 0; i < count; i++) {
      const isRing = i % 3 === 0;
      this.particles.push(new SmokeParticle(
        this.emitter.x + (Math.random() - 0.5) * 20,
        this.emitter.y + (Math.random() - 0.5) * 14,
        isRing,
        this.tintColor
      ));
      if (i % 2 === 0) {
        this.embers.push(new EmberParticle(this.emitter.x, this.emitter.y, this.emberColor));
      }
    }
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.emitContinuous();

    this.wind = Math.sin(Date.now() * 0.0012) * 0.35;

    // Update & draw smoke
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const alive = p.update(this.wind, this.bassIntensity);
      if (!alive) {
        this.particles.splice(i, 1);
      } else {
        p.draw(this.ctx);
      }
    }

    // Update & draw embers
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const e = this.embers[i];
      const alive = e.update(this.wind, this.bassIntensity);
      if (!alive) {
        this.embers.splice(i, 1);
      } else {
        e.draw(this.ctx);
      }
    }
  }

  clear() {
    this.particles = [];
    this.embers = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.SmokeEngine = SmokeEngine;

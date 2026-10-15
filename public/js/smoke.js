// ==============================================================================
// 💨 LETEĆI ROĐA — VOLUMETRIC SMOKE PARTICLE ENGINE
// Konglomerat Preduzeće™ & The Chief Architect
// Physical Smoke Simulation with Audio-Reactive Turbulence
// ==============================================================================

class SmokeParticle {
  constructor(x, y, isRing = false, tintColor = "rgba(192, 132, 252, ") {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.isRing = isRing;
    this.tintColor = tintColor;

    this.life = 0;
    this.maxLife = isRing ? 120 + Math.random() * 40 : 180 + Math.random() * 60;
    
    // Physical velocity
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -(1.2 + Math.random() * 1.5);
    
    // Size and diffusion
    this.initialSize = isRing ? 8 : 4 + Math.random() * 6;
    this.size = this.initialSize;
    this.growthRate = isRing ? 0.4 : 0.25 + Math.random() * 0.15;
    
    // Wave oscillation
    this.waveOffset = Math.random() * Math.PI * 2;
    this.waveSpeed = 0.03 + Math.random() * 0.02;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
  }

  update(windFactor = 0, bassIntensity = 0) {
    this.life++;
    
    // Turbulence & sway
    this.x += this.vx + Math.sin(this.life * this.waveSpeed + this.waveOffset) * 0.6 + windFactor;
    this.y += this.vy * (1 + bassIntensity * 0.5);
    
    // Expansion & rotation
    this.size += this.growthRate * (1 + bassIntensity * 0.3);
    this.rotation += this.rotSpeed;

    return this.life < this.maxLife;
  }

  draw(ctx) {
    const progress = this.life / this.maxLife;
    // Bell curve alpha
    let alpha = 0;
    if (progress < 0.15) {
      alpha = progress / 0.15 * 0.45;
    } else {
      alpha = (1 - progress) * 0.45;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isRing) {
      // Ring smoke formation
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, this.size * 0.2);
      ctx.strokeStyle = `${this.tintColor}${alpha})`;
      ctx.stroke();
    } else {
      // Volumetric cloud puff with radial gradient
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, `${this.tintColor}${alpha * 0.9})`);
      grad.addColorStop(0.5, `rgba(200, 200, 220, ${alpha * 0.4})`);
      grad.addColorStop(1, "rgba(20, 10, 30, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class SmokeEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.maxParticles = 120;
    this.emitter = { x: 0, y: 0 };
    this.tintColor = "rgba(192, 132, 252, "; // Default neon purple
    this.bassIntensity = 0;
    this.wind = 0;
  }

  setEmitter(x, y) {
    this.emitter.x = x;
    this.emitter.y = y;
  }

  setTint(colorString) {
    this.tintColor = colorString;
  }

  setMaxParticles(count) {
    this.maxParticles = count;
  }

  setBassIntensity(intensity) {
    this.bassIntensity = Math.min(1.0, Math.max(0, intensity));
  }

  emitContinuous() {
    if (this.particles.length < this.maxParticles) {
      // Continuous gentle blunt tip smoke
      this.particles.push(new SmokeParticle(
        this.emitter.x + (Math.random() - 0.5) * 6,
        this.emitter.y + (Math.random() - 0.5) * 4,
        Math.random() < 0.15, // 15% chance of ring
        this.tintColor
      ));
    }
  }

  triggerPuff(big = false) {
    const count = big ? 18 : 8;
    for (let i = 0; i < count; i++) {
      const isRing = i % 2 === 0;
      this.particles.push(new SmokeParticle(
        this.emitter.x + (Math.random() - 0.5) * 12,
        this.emitter.y + (Math.random() - 0.5) * 8,
        isRing,
        this.tintColor
      ));
    }
  }

  updateAndDraw() {
    this.emitContinuous();

    // Subtle wind oscillation
    this.wind = Math.sin(Date.now() * 0.001) * 0.3;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const alive = p.update(this.wind, this.bassIntensity);
      if (!alive) {
        this.particles.splice(i, 1);
      } else {
        p.draw(this.ctx);
      }
    }
  }

  clear() {
    this.particles = [];
  }
}

window.SmokeEngine = SmokeEngine;

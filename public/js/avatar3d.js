// ==============================================================================
// 🛸 MINI Y!APPI — SLEEK 3D STYLIZED PROGRAMMER AVATAR & PHYSICS
// Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)
// Spec: Black Hoodie, Burgundy Bandana, Matrix Shades, Laptop with Terminal
// ==============================================================================

class Avatar3D {
  constructor(canvas, smokeEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.smokeEngine = smokeEngine;

    this.width = canvas.width;
    this.height = canvas.height;

    // Position & Physics
    this.baseX = this.width / 2;
    this.baseY = this.height / 2;
    this.currentX = this.baseX;
    this.currentY = this.baseY;
    
    // Physics parameters
    this.time = 0;
    this.hoverAmplitude = 15;
    this.hoverFrequency = 2.4;
    this.tiltX = 0;
    this.tiltY = 0;
    this.targetTiltX = 0;
    this.targetTiltY = 0;

    // Interactive Drag
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Mode colors
    this.mode = "chill"; // "chill" | "ninja"
    this.haloAngle = 0;

    this.initEvents();
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.baseX = w / 2;
    this.baseY = h / 2 - 10;
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === "ninja") {
      this.smokeEngine.setTint("rgba(52, 211, 153, "); // Emerald
    } else {
      this.smokeEngine.setTint("rgba(192, 132, 252, "); // Purple
    }
  }

  initEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        this.currentX = mouseX - this.dragOffsetX;
        this.currentY = mouseY - this.dragOffsetY;
      } else {
        // Smooth 3D parallax look-at
        this.targetTiltX = (mouseX - this.width / 2) / (this.width / 2) * 0.35;
        this.targetTiltY = (mouseY - this.height / 2) / (this.height / 2) * 0.35;
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dist = Math.hypot(mouseX - this.currentX, mouseY - this.currentY);
      if (dist < 110) {
        this.isDragging = true;
        this.dragOffsetX = mouseX - this.currentX;
        this.dragOffsetY = mouseY - this.currentY;
        this.smokeEngine.triggerPuff(true);
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.targetTiltX = 0;
      this.targetTiltY = 0;
    });
  }

  resetPosition() {
    this.currentX = this.baseX;
    this.currentY = this.baseY;
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.smokeEngine.triggerPuff(true);
  }

  render(deltaTime, bassIntensity = 0) {
    this.time += deltaTime;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth return to base if not dragging
    if (!this.isDragging) {
      this.currentX += (this.baseX - this.currentX) * 0.05;
      this.currentY += (this.baseY - this.currentY) * 0.05;
    }

    // Parallax tilt interpolation
    this.tiltX += (this.targetTiltX - this.tiltX) * 0.08;
    this.tiltY += (this.targetTiltY - this.tiltY) * 0.08;

    // Bobbing physics
    const bobOffset = Math.sin(this.time * this.hoverFrequency) * (this.hoverAmplitude + bassIntensity * 8);
    const avatarY = this.currentY + bobOffset;
    const avatarX = this.currentX;

    // 1. SMOKE DRAW (Back layer)
    this.smokeEngine.updateAndDraw();

    this.ctx.save();
    this.ctx.translate(avatarX, avatarY);
    this.ctx.rotate(this.tiltX * 0.35);

    const isNinja = this.mode === "ninja";
    const primaryNeon = isNinja ? "#10b981" : "#a855f7";
    const secondaryNeon = isNinja ? "#059669" : "#ec4899";

    // 2. ORBITAL NEON HALO RING
    this.haloAngle += 0.03 + bassIntensity * 0.04;
    this.ctx.save();
    this.ctx.scale(1, 0.32);
    this.ctx.beginPath();
    this.ctx.arc(0, 100, 95 + Math.sin(this.time * 3) * 4, 0, Math.PI * 2);
    this.ctx.lineWidth = 3.5 + bassIntensity * 3;
    this.ctx.strokeStyle = primaryNeon;
    this.ctx.shadowColor = primaryNeon;
    this.ctx.shadowBlur = 18;
    this.ctx.stroke();

    const sparkX = Math.cos(this.haloAngle) * 95;
    const sparkY = Math.sin(this.haloAngle) * 95 + 100;
    this.ctx.beginPath();
    this.ctx.arc(sparkX, sparkY, 4.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.shadowBlur = 20;
    this.ctx.fill();
    this.ctx.restore();

    // 3. BLACK HOODIE TORSO (STYLIZED CYBERPUNK SLEEK)
    this.ctx.fillStyle = "#09090b"; // Deep Matte Black Hoodie
    this.ctx.shadowColor = primaryNeon;
    this.ctx.shadowBlur = 10;
    // Rounded shoulders and chest
    this.ctx.beginPath();
    this.ctx.roundRect(-32, 28, 64, 48, [12, 12, 6, 6]);
    this.ctx.fill();

    // Hoodie strings & neon seam
    this.ctx.strokeStyle = primaryNeon;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 32);
    this.ctx.lineTo(-10, 48);
    this.ctx.moveTo(10, 32);
    this.ctx.lineTo(10, 48);
    this.ctx.stroke();

    // 4. OVERSIZED SNEAKERS (FLOATING BENEATH HOODIE)
    this.ctx.fillStyle = "#ffffff"; // Chunky Cyber Sneaker Soles
    this.ctx.shadowBlur = 0;
    this.ctx.fillRect(-28, 80, 22, 10);
    this.ctx.fillRect(6, 80, 22, 10);
    // Sneaker uppers (Black/Burgundy)
    this.ctx.fillStyle = isNinja ? "#064e3b" : "#881337";
    this.ctx.fillRect(-26, 74, 18, 8);
    this.ctx.fillRect(8, 74, 18, 8);

    // 5. ATTACHED CYBER LAPTOP WITH GREEN TERMINAL SCREEN
    this.ctx.save();
    this.ctx.translate(0, 42);
    // Laptop base
    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(-26, 4, 52, 6);
    // Laptop screen (tilted forward)
    this.ctx.fillStyle = "#020617";
    this.ctx.fillRect(-24, -20, 48, 24);
    // Green Terminal code glow!
    this.ctx.fillStyle = "#10b981";
    this.ctx.shadowColor = "#10b981";
    this.ctx.shadowBlur = 8;
    this.ctx.font = "bold 6px monospace";
    this.ctx.fillText("root@yappi:~$", -20, -12);
    this.ctx.fillText("G-GODMODE [OK]", -20, -5);
    this.ctx.restore();

    // 6. STYLIZED HEAD & MISCHIEVOUS SMILE
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = "#b45309"; // Warm stylized skin tone
    this.ctx.beginPath();
    this.ctx.roundRect(-30, -42, 60, 62, 14);
    this.ctx.fill();

    // Mischievous smirk/smile at corner of mouth
    this.ctx.strokeStyle = "#451a03";
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(4, 8, 8, 0.1 * Math.PI, 0.7 * Math.PI);
    this.ctx.stroke();

    // 7. BURGUNDY BANDANA (SIGNATURE SPEC)
    this.ctx.fillStyle = "#881337"; // Deep Rich Burgundy
    this.ctx.beginPath();
    this.ctx.roundRect(-32, -44, 64, 20, [10, 10, 2, 2]);
    this.ctx.fill();

    // Bandana knot & hanging ends on the side
    this.ctx.fillStyle = "#9f1239";
    this.ctx.fillRect(28, -38, 12, 10);
    this.ctx.fillRect(32, -30, 8, 18);

    // Bandana paisley dots pattern
    this.ctx.fillStyle = "#fecdd3";
    for (let i = -24; i < 28; i += 10) {
      this.ctx.fillRect(i, -36, 3, 3);
    }

    // 8. MATRIX / CYBER SUNGLASSES (SHADES WITH NEON REFLECTION)
    this.ctx.fillStyle = "#020617";
    this.ctx.beginPath();
    this.ctx.roundRect(-26, -20, 52, 16, 4);
    this.ctx.fill();

    // Emerald/Purple reflection glares
    this.ctx.fillStyle = primaryNeon;
    this.ctx.shadowColor = primaryNeon;
    this.ctx.shadowBlur = 12;
    this.ctx.fillRect(-22, -17, 18, 10);
    this.ctx.fillRect(4, -17, 18, 10);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(-20, -16, 5, 2);
    this.ctx.fillRect(6, -16, 5, 2);
    this.ctx.shadowBlur = 0;

    // 9. THE BURNING BLUNT AT THE CORNER OF THE SMIRK
    const bluntAngle = -0.15;
    this.ctx.save();
    this.ctx.translate(12, 10);
    this.ctx.rotate(bluntAngle);
    
    // Tobacco / paper body
    this.ctx.fillStyle = "#78350f";
    this.ctx.fillRect(0, -3, 28, 6);
    this.ctx.fillStyle = "#92400e";
    this.ctx.fillRect(4, -2, 20, 4);

    // Glowing ember burning tip
    const emberPulse = 0.75 + Math.sin(this.time * 6) * 0.25 + bassIntensity * 0.6;
    this.ctx.fillStyle = `rgba(249, 115, 22, ${emberPulse})`;
    this.ctx.shadowColor = "#f97316";
    this.ctx.shadowBlur = 20;
    this.ctx.fillRect(24, -4, 6, 8);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(27, -2, 3, 4);

    // Smoke emitter anchor
    const emberScreenX = avatarX + 12 + Math.cos(bluntAngle) * 30;
    const emberScreenY = avatarY + 10 + Math.sin(bluntAngle) * 30;
    this.smokeEngine.setEmitter(emberScreenX, emberScreenY);

    this.ctx.restore();

    this.ctx.restore();
  }
}

window.Avatar3D = Avatar3D;

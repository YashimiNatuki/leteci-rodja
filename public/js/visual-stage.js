// Leteći Rođa — avatar/smoke lifecycle with low-power and reduced-motion guards.
class RodjaVisualStage {
  constructor({ canvas, smokeCount, mode }) {
    this.canvas = canvas; this.smokeCount = smokeCount; this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; this.visible = true;
    this.smoke = new window.SmokeEngine(canvas); this.smoke.setMaxParticles(this.reduced ? 8 : 32); this.avatar = new window.Avatar3D(canvas, this.smoke); this.setMode(mode);
    this.observer = new IntersectionObserver(entries => { this.visible = entries[0]?.isIntersecting !== false; }, { threshold: 0.05 }); this.observer.observe(canvas);
    document.getElementById("btn-puff-smoke").addEventListener("click", () => this.smoke.triggerPuff(true)); document.getElementById("btn-reset-view").addEventListener("click", () => this.avatar.resetPosition());
    document.getElementById("smoke-density").addEventListener("input", event => { const value = Math.min(96, Number(event.target.value)); this.smoke.setMaxParticles(value); document.getElementById("smoke-density-output").textContent = String(value); });
  }
  setMode(mode) { this.avatar.setMode(mode === "ninja" ? "ninja" : "chill"); }
  resize() { const rect = this.canvas.parentElement.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 1.5); this.canvas.width = Math.max(1, Math.floor(rect.width * dpr)); this.canvas.height = Math.max(1, Math.floor(rect.height * dpr)); this.canvas.style.width = `${rect.width}px`; this.canvas.style.height = `${rect.height}px`; this.avatar.resize(this.canvas.width, this.canvas.height); }
  render(delta, bass = 0) { if (!this.visible) return; this.smoke.setBassIntensity(bass); this.avatar.render(this.reduced ? 0 : delta, bass); this.smokeCount.textContent = `${this.smoke.particles.length} čestica`; }
}
window.RodjaVisualStage = RodjaVisualStage;

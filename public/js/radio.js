// Leteći Rođa — radio composition and lazy visualizer lifecycle.
class RodjaRadio {
  constructor({ audio, canvas }) { this.player = new window.BoomboxPlayer(audio, canvas); this.canvas = canvas; this.lastDraw = 0; }
  async init() { await this.player.loadPlaylist(); }
  tick(now) { if (this.player.isPlaying && now - this.lastDraw > 100) { this.player.updateVisualizer(); this.lastDraw = now; } else if (!this.player.isPlaying) { this.player.getBassIntensity(); } return this.player.getBassIntensity(); }
}
window.RodjaRadio = RodjaRadio;

// ==============================================================================
// 📻 LETEĆI ROĐA — BOOMBOX MP3 & AUDIO SPECTRUM VISUALIZER
// Konglomerat Preduzeće™ & The Chief Architect
// Web Audio API Frequency Analyser with Bass-Reactive Physics Hook
// ==============================================================================

class BoomboxPlayer {
  constructor(audioElement, visualizerCanvas) {
    this.audio = audioElement;
    this.canvas = visualizerCanvas;
    this.ctx = visualizerCanvas.getContext("2d");

    this.tracks = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.bassIntensity = 0;

    // Web Audio API state
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;

    // UI elements
    this.trackNameLabel = document.getElementById("current-track-name");
    this.timeLabel = document.getElementById("audio-time-label");
    this.statusBadge = document.getElementById("audio-status-badge");
    this.playBtn = document.getElementById("btn-play-pause");
    this.trackSelect = document.getElementById("track-select");
    this.volumeSlider = document.getElementById("volume-slider");

    this.initEvents();
  }

  async loadPlaylist() {
    try {
      const res = await fetch("/api/tracks");
      if (res.ok) {
        const data = await res.json();
        const locals = (data.local_tracks || []).map(t => ({ ...t, isStream: false }));
        const streams = (data.streams || []).map(t => ({ ...t, isStream: true }));
        this.tracks = [...locals, ...streams];

        // Populate dropdown
        this.trackSelect.innerHTML = "";
        this.tracks.forEach((track, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = `${track.isStream ? '🌐 ' : '🎵 '} ${track.title}`;
          this.trackSelect.appendChild(opt);
        });

        if (this.tracks.length > 0) {
          this.selectTrack(0, false);
        }
      }
    } catch (e) {
      console.warn("[AUDIO_INIT_ERR]", e);
    }
  }

  initAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;

      try {
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } catch (err) {
        // media source already connected
      }

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  selectTrack(index, autoPlay = true) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;
    const track = this.tracks[index];

    this.audio.src = track.file;
    this.trackNameLabel.textContent = track.title;
    this.trackSelect.value = index;

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.initAudioContext();
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.playBtn.textContent = "⏸";
      this.statusBadge.textContent = "ROKA GAS";
      this.statusBadge.className = "font-mono text-[10px] px-2 py-0.5 rounded bg-pink-900/60 border border-pink-400 text-pink-200 animate-pulse";
    }).catch(e => {
      console.warn("[PLAY_BLOCKED_OR_ERROR]", e);
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.playBtn.textContent = "▶";
    this.statusBadge.textContent = "PAUSED";
    this.statusBadge.className = "font-mono text-[10px] px-2 py-0.5 rounded bg-pink-950/40 border border-pink-500/30 text-pink-300";
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    const nextIdx = (this.currentIndex + 1) % this.tracks.length;
    this.selectTrack(nextIdx, true);
  }

  prev() {
    const prevIdx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.selectTrack(prevIdx, true);
  }

  getBassIntensity() {
    return this.bassIntensity;
  }

  updateVisualizer() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    if (!this.analyser || !this.isPlaying) {
      this.bassIntensity = 0;
      // Draw idle flat line
      this.ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, h / 2);
      this.ctx.lineTo(w, h / 2);
      this.ctx.stroke();
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    // Compute bass energy from low bins (0 to 4)
    let lowSum = 0;
    for (let i = 0; i < 5; i++) {
      lowSum += this.dataArray[i];
    }
    const rawBass = lowSum / (5 * 255);
    this.bassIntensity = Math.pow(rawBass, 1.8); // exponential punch

    // Draw cyberpunk frequency bars
    const barCount = this.dataArray.length;
    const barWidth = (w / barCount) * 1.5;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
      const val = this.dataArray[i];
      const barHeight = (val / 255) * h * 0.9;

      const grad = this.ctx.createLinearGradient(0, h, 0, h - barHeight);
      grad.addColorStop(0, "rgba(236, 72, 153, 0.4)");
      grad.addColorStop(0.5, "rgba(168, 85, 247, 0.8)");
      grad.addColorStop(1, "rgba(52, 211, 153, 1)");

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);
      x += barWidth;
    }
  }

  initEvents() {
    this.playBtn.addEventListener("click", () => this.togglePlay());
    document.getElementById("btn-next-track").addEventListener("click", () => this.next());
    document.getElementById("btn-prev-track").addEventListener("click", () => this.prev());

    this.trackSelect.addEventListener("change", (e) => {
      this.selectTrack(parseInt(e.target.value, 10), true);
    });

    this.volumeSlider.addEventListener("input", (e) => {
      this.audio.volume = parseFloat(e.target.value);
    });

    this.audio.addEventListener("timeupdate", () => {
      if (!isNaN(this.audio.duration)) {
        const curM = Math.floor(this.audio.currentTime / 60);
        const curS = Math.floor(this.audio.currentTime % 60).toString().padStart(2, "0");
        const durM = Math.floor(this.audio.duration / 60);
        const durS = Math.floor(this.audio.duration % 60).toString().padStart(2, "0");
        this.timeLabel.textContent = `${curM}:${curS} / ${durM}:${durS}`;
      } else {
        this.timeLabel.textContent = "LIVE";
      }
    });

    this.audio.addEventListener("ended", () => {
      this.next();
    });
  }
}

window.BoomboxPlayer = BoomboxPlayer;

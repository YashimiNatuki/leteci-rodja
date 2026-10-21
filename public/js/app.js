// ==============================================================================
// 🚀 LETEĆI ROĐA — MASTER APPLICATION ORCHESTRATOR
// Konglomerat Preduzeće™ & The Chief Architect
// 60FPS Render Loop, Streaming Chat Bus & Audio-Reactive Physics
// ==============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("rodja-canvas");
  const visualizerCanvas = document.getElementById("visualizer-canvas");
  const audioElement = document.getElementById("audio-engine");

  // Resize canvas properly
  function resizeCanvases() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const visRect = visualizerCanvas.parentElement.getBoundingClientRect();
    visualizerCanvas.width = visRect.width;
    visualizerCanvas.height = visRect.height;
  }
  resizeCanvases();
  window.addEventListener("resize", () => {
    resizeCanvases();
    if (avatar) avatar.resize(canvas.width, canvas.height);
  });

  // 1. Initialize Subsystems
  const smoke = new window.SmokeEngine(canvas);
  const avatar = new window.Avatar3D(canvas, smoke);
  const boombox = new window.BoomboxPlayer(audioElement, visualizerCanvas);
  await boombox.loadPlaylist();

  // 2. Discover Ollama & System Health
  const ollamaBadge = document.getElementById("ollama-badge");
  const modelSelect = document.getElementById("model-select");

  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        if (data.ollama && data.ollama.status === "online") {
          ollamaBadge.textContent = "ONLINE (" + (data.ollama.active_model || "qwen") + ")";
          ollamaBadge.className = "text-emerald-400 font-bold";

          // Populate available models if returned
          if (data.ollama.available_models && data.ollama.available_models.length > 0) {
            modelSelect.innerHTML = "";
            data.ollama.available_models.forEach(m => {
              const opt = document.createElement("option");
              opt.value = m;
              opt.textContent = m;
              if (m.includes("qwen2.5-coder")) opt.selected = true;
              modelSelect.appendChild(opt);
            });
          }
        } else {
          ollamaBadge.textContent = "OFFLINE (FALLBACK READY)";
          ollamaBadge.className = "text-amber-400 font-bold";
        }
      }
    } catch (e) {
      ollamaBadge.textContent = "STANDALONE READY";
      ollamaBadge.className = "text-purple-400 font-bold";
    }
  }
  checkHealth();

  // 3. UI Mode Switching (KAFANA CHILL vs NINJA SHAOLIN)
  const btnChill = document.getElementById("btn-mode-chill");
  const btnNinja = document.getElementById("btn-mode-ninja");

  function setMode(mode) {
    const active = window.RODJA_MINDSET.setMode(mode);
    avatar.setMode(active);

    if (active === "ninja") {
      btnNinja.className = "mode-btn active-ninja px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center space-x-1.5";
      btnChill.className = "mode-btn px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center space-x-1.5 text-gray-400 hover:text-purple-400";
      appendSystemNotice("🥷 [NINJA SHAOLIN MOD AKTIVIRAN] Hirurški precizan kod, Hoare verifikacija, nula TODO komentara.");
    } else {
      btnChill.className = "mode-btn active-chill px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center space-x-1.5";
      btnNinja.className = "mode-btn px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center space-x-1.5 text-gray-400 hover:text-emerald-400";
      appendSystemNotice("☕ [KAFANA CHILL MOD AKTIVIRAN] Opušteno rođo, bije bas, dim kulja, sve pod kontrolom.");
    }
  }

  btnChill.addEventListener("click", () => setMode("chill"));
  btnNinja.addEventListener("click", () => setMode("ninja"));

  // 4. Floating & Smoke Controls
  const particlesCountLabel = document.getElementById("smoke-particles-count");
  const btnPuff = document.getElementById("btn-puff-smoke");
  const btnReset = document.getElementById("btn-reset-view");
  const smokeSlider = document.getElementById("smoke-density");

  btnPuff.addEventListener("click", () => {
    smoke.triggerPuff(true);
  });

  btnReset.addEventListener("click", () => {
    avatar.resetPosition();
  });

  smokeSlider.addEventListener("input", (e) => {
    smoke.setMaxParticles(parseInt(e.target.value, 10));
  });

  // 5. Chat & Streaming Bus
  const chatLog = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const promptInput = document.getElementById("prompt-input");

  function appendSystemNotice(text) {
    const div = document.createElement("div");
    div.className = "p-2 rounded-lg bg-black/40 border border-purple-500/20 text-[11px] text-gray-400 font-mono";
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function appendUserMessage(text) {
    const div = document.createElement("div");
    div.className = "chat-msg p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-100 self-end ml-6";
    div.innerHTML = `<span class="text-pink-400 font-bold">TI:</span> ${escapeHtml(text)}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function createRodjaResponseContainer() {
    const div = document.createElement("div");
    div.className = "chat-msg rodja-msg p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-gray-100 mr-6";
    const mode = window.RODJA_MINDSET.currentMode;
    const modeBadge = mode === "ninja" ? "<span class='text-emerald-400 font-bold'>[NINJA]</span>" : "<span class='text-pink-400 font-bold'>[CHILL]</span>";
    
    div.innerHTML = `
      <div class="flex items-center space-x-1.5 text-xs mb-1">
        <span>🛸</span>
        <span class="font-bold text-purple-300">LETEĆI ROĐA</span>
        ${modeBadge}
      </div>
      <div class="content-body leading-relaxed whitespace-pre-wrap"></div>
    `;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div.querySelector(".content-body");
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' }[s];
    });
  }

  async function handleSend(promptText) {
    if (!promptText || promptText.trim().length === 0) return;
    const prompt = promptText.trim();
    promptInput.value = "";
    appendUserMessage(prompt);
    // Forward user message to avatar for AI‑driven reactions
    if (avatar && typeof avatar.processInput === "function") {
      avatar.processInput(prompt);
    }
    // Big puff of smoke on question!
    smoke.triggerPuff(false);
    // Check macro first
    const macroResult = window.RODJA_MINDSET.checkMacro(prompt);
    if (macroResult) {
      const container = createRodjaResponseContainer();
      let currentText = "";
      for (const char of macroResult) {
        currentText += char;
        container.textContent = currentText;
        chatLog.scrollTop = chatLog.scrollHeight;
        await new Promise(r => setTimeout(r, 6));
      }
      return;
    }

    // Proxy request to backend Ollama streaming
    const container = createRodjaResponseContainer();
    container.innerHTML = "<span class='text-purple-400 animate-pulse'>Rođa mota odgovor u dimu...</span>";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          mode: window.RODJA_MINDSET.currentMode,
          model: modelSelect.value,
          system: window.RODJA_MINDSET.getSystemPrompt()
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      container.textContent = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") break;
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              container.textContent += data.token;
              chatLog.scrollTop = chatLog.scrollHeight;
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      container.textContent = `Esi mi dobar rođo! Mala kočnica sa serverom (${err.message}), ali G te čuje i dim se ne gasi. Probaj ponovo ili overi makro dugmad iznad!`;
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend(promptInput.value);
  });

  // Macro quick buttons
  document.querySelectorAll(".macro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const macro = btn.getAttribute("data-macro");
      handleSend(macro);
    });
  });

  // 6. Master 60FPS Render Loop
  let lastTime = performance.now();

  function loop(now) {
    const deltaTime = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Update audio visualizer & get realtime bass energy
    boombox.updateVisualizer();
    const bass = boombox.getBassIntensity();

    // Render avatar + smoke
    avatar.render(deltaTime, bass);

    // Update telemetry UI
    particlesCountLabel.textContent = `${smoke.particles.length} čestica`;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});

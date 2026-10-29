// ==============================================================================
// 🚀 LETEĆI ROĐA & AIGAD — MASTER APPLICATION ORCHESTRATOR (v5.0-GODMODE)
// Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)
// 60FPS WebGL Loop, Fullscreen Floating Physics & Real-Time Speech Sync
// ==============================================================================

import { Companion3DStage } from './companion-stage.mjs';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Core DOM References
  const companionContainer = document.getElementById("floating-companion");
  const companionStageBox = document.getElementById("companion-stage");
  const companionBadge = document.getElementById("companion-badge");
  const companionAgentName = document.getElementById("companion-agent-name");
  const companionStateLabel = document.getElementById("companion-state-label");
  const smokeCanvas = document.getElementById("smoke-canvas");
  const visualizerCanvas = document.getElementById("visualizer-canvas");
  const audioElement = document.getElementById("audio-engine");

  // 2. Initialize Smoke & Ember Simulation Engine
  const smoke = new window.SmokeEngine(smokeCanvas);
  window.addEventListener("resize", () => {
    smoke.resize();
  });

  // 3. Initialize 3D WebGL Companion Stage (AiGad / ChatBrat / Noir / Holo)
  const companionStage = new Companion3DStage(companionStageBox, {
    agent: "aigad",
    state: "idle",
    mode: "auto"
  });

  // 4. Initialize Boombox Audio Deck
  const boombox = new window.BoomboxPlayer(audioElement, visualizerCanvas);
  await boombox.loadPlaylist();

  // 5. Physics & Full-Screen Floating Levitation State
  let posX = Math.max(20, (window.innerWidth - 340) / 2);
  let posY = Math.max(70, (window.innerHeight - 440) / 2);
  let velX = 0;
  let velY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastClientX = 0;
  let lastClientY = 0;
  let hoverTime = 0;

  // Apply initial position
  companionContainer.style.left = `${posX}px`;
  companionContainer.style.top = `${posY}px`;

  // Pointer & Touch Drag Handlers
  function onPointerDown(e) {
    // If clicked on buttons inside the dock, don't drag
    if (e.target.closest(".companion-pill-dock")) return;

    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragStartX = clientX - posX;
    dragStartY = clientY - posY;
    lastClientX = clientX;
    lastClientY = clientY;
    velX = 0;
    velY = 0;

    companionContainer.style.transition = "none";
  }

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate parallax tilt relative to companion center
    const centerX = posX + 170;
    const centerY = posY + 200;
    const tiltX = (clientY - centerY) / (window.innerHeight * 0.5);
    const tiltY = (clientX - centerX) / (window.innerWidth * 0.5);
    companionStage.setParallaxTilt(tiltX * 0.4, tiltY * 0.4);

    if (!isDragging) return;

    velX = clientX - lastClientX;
    velY = clientY - lastClientY;
    lastClientX = clientX;
    lastClientY = clientY;

    posX = clientX - dragStartX;
    posY = clientY - dragStartY;

    // Soft clamp within viewport
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 380;
    posX = Math.max(-50, Math.min(maxX, posX));
    posY = Math.max(20, Math.min(maxY, posY));

    companionContainer.style.left = `${posX}px`;
    companionContainer.style.top = `${posY}px`;
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
  }

  companionContainer.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  companionContainer.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);

  // 6. Drawers & Modals Management
  const drawerChat = document.getElementById("drawer-chat");
  const drawerMandates = document.getElementById("drawer-mandates");
  const modalRadio = document.getElementById("modal-radio");
  const modalMacros = document.getElementById("modal-macros");
  const modalCharacter = document.getElementById("modal-character");
  const modalAndroid = document.getElementById("modal-android");

  function closeAllModals() {
    modalRadio.classList.remove("open");
    modalMacros.classList.remove("open");
    modalCharacter.classList.remove("open");
    modalAndroid.classList.remove("open");
  }

  // Pill Dock Toggle Buttons
  document.getElementById("dock-btn-chat").addEventListener("click", () => {
    closeAllModals();
    drawerChat.classList.toggle("open");
    document.getElementById("dock-btn-chat").classList.toggle("active", drawerChat.classList.contains("open"));
  });

  document.getElementById("dock-btn-mandates").addEventListener("click", () => {
    closeAllModals();
    drawerMandates.classList.toggle("open");
    document.getElementById("dock-btn-mandates").classList.toggle("active", drawerMandates.classList.contains("open"));
  });

  document.getElementById("dock-btn-macros").addEventListener("click", () => {
    const isOpen = modalMacros.classList.contains("open");
    closeAllModals();
    if (!isOpen) modalMacros.classList.add("open");
  });

  document.getElementById("dock-btn-radio").addEventListener("click", () => {
    const isOpen = modalRadio.classList.contains("open");
    closeAllModals();
    if (!isOpen) modalRadio.classList.add("open");
  });

  document.getElementById("dock-btn-character").addEventListener("click", () => {
    const isOpen = modalCharacter.classList.contains("open");
    closeAllModals();
    if (!isOpen) modalCharacter.classList.add("open");
  });

  document.getElementById("dock-btn-puff").addEventListener("click", () => {
    smoke.triggerPuff(true);
    companionStage.setState("speaking");
    setTimeout(() => {
      if (companionStage.state === "speaking") companionStage.setState("idle");
    }, 1500);
  });

  // Close buttons
  document.getElementById("btn-close-chat").addEventListener("click", () => {
    drawerChat.classList.remove("open");
    document.getElementById("dock-btn-chat").classList.remove("active");
  });

  document.getElementById("btn-close-mandates").addEventListener("click", () => {
    drawerMandates.classList.remove("open");
    document.getElementById("dock-btn-mandates").classList.remove("active");
  });

  document.getElementById("btn-close-macros").addEventListener("click", () => {
    modalMacros.classList.remove("open");
  });

  document.getElementById("btn-close-character").addEventListener("click", () => {
    modalCharacter.classList.remove("open");
  });

  document.getElementById("btn-close-android").addEventListener("click", () => {
    modalAndroid.classList.remove("open");
  });

  document.getElementById("btn-phone-status").addEventListener("click", () => {
    closeAllModals();
    modalAndroid.classList.add("open");
  });

  // 7. Zen Mode Toggle (Collapse Everything -> Pure Floating 3D Companion in Smoke)
  function setZenMode(enable) {
    if (enable) {
      document.body.classList.add("zen-mode");
      closeAllModals();
      drawerChat.classList.remove("open");
      drawerMandates.classList.remove("open");
      document.getElementById("dock-btn-chat").classList.remove("active");
      document.getElementById("dock-btn-mandates").classList.remove("active");
    } else {
      document.body.classList.remove("zen-mode");
    }
  }

  document.getElementById("btn-zen-mode").addEventListener("click", () => {
    setZenMode(true);
  });

  document.getElementById("dock-btn-zen").addEventListener("click", () => {
    setZenMode(true);
  });

  document.getElementById("btn-zen-restore").addEventListener("click", () => {
    setZenMode(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "z" || e.key === "Z") {
      const isZen = document.body.classList.contains("zen-mode");
      setZenMode(!isZen);
    }
  });

  // 8. Character Selection
  const charNames = {
    aigad: "AiGad 3D",
    chatbrat: "ChatBrat 3D",
    leteci: "Leteći Rođa Noir",
    airodja: "AiRodja Holo"
  };

  const charColors = {
    aigad: "rgba(168, 85, 247, ",
    chatbrat: "rgba(239, 68, 68, ",
    leteci: "rgba(236, 72, 153, ",
    airodja: "rgba(6, 182, 212, "
  };

  document.querySelectorAll(".char-select-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const charId = btn.getAttribute("data-char");
      companionStage.setAgent(charId);
      companionAgentName.textContent = charNames[charId] || charId;
      smoke.setTint(charColors[charId] || "rgba(168, 85, 247, ");
      modalCharacter.classList.remove("open");
      smoke.triggerPuff(true);
    });
  });

  // 9. Dual Mode Switcher (Kafana Chill vs Ninja Shaolin)
  const btnChill = document.getElementById("btn-mode-chill");
  const btnNinja = document.getElementById("btn-mode-ninja");

  function setMode(mode) {
    const active = window.RODJA_MINDSET.setMode(mode);

    if (active === "ninja") {
      btnNinja.className = "mode-btn active-ninja";
      btnNinja.style.background = "";
      btnNinja.style.color = "";
      btnChill.className = "mode-btn";
      btnChill.style.background = "transparent";
      btnChill.style.color = "#94a3b8";
      smoke.setTint("rgba(16, 185, 129, ", "#34d399"); // Emerald tint
      appendSystemNotice("🥷 [NINJA SHAOLIN AKTIVIRAN] O(1) hes lookup, Hoare logika {P} C {Q}, zero-TODO garancija.");
    } else {
      btnChill.className = "mode-btn active-chill";
      btnChill.style.background = "";
      btnChill.style.color = "";
      btnNinja.className = "mode-btn";
      btnNinja.style.background = "transparent";
      btnNinja.style.color = "#94a3b8";
      smoke.setTint("rgba(168, 85, 247, ", "#ec4899"); // Purple tint
      appendSystemNotice("☕ [KAFANA CHILL AKTIVIRAN] Opušteno rođo, bije bas, dim kulja, sve pod kontrolom.");
    }
  }

  btnChill.addEventListener("click", () => setMode("chill"));
  btnNinja.addEventListener("click", () => setMode("ninja"));

  // 10. Chat & Streaming Bus with Ollama
  const chatLog = document.getElementById("chat-log");
  const chatForm = document.getElementById("chat-form");
  const promptInput = document.getElementById("prompt-input");
  const modelSelect = document.getElementById("model-select");
  const ollamaBadge = document.getElementById("ollama-badge");

  // Health & Model Discovery
  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        if (data.ollama && data.ollama.status === "online") {
          ollamaBadge.textContent = "ONLINE (" + (data.ollama.active_model || "qwen") + ")";
          ollamaBadge.style.color = "#34d399";

          if (data.ollama.available_models && data.ollama.available_models.length > 0) {
            modelSelect.innerHTML = "";
            data.ollama.available_models.forEach(m => {
              const opt = document.createElement("option");
              opt.value = m;
              opt.textContent = m;
              if (m.includes("qwen2.5-coder") || m.includes("qwen")) opt.selected = true;
              modelSelect.appendChild(opt);
            });
          }
        } else {
          ollamaBadge.textContent = "STANDALONE READY";
          ollamaBadge.style.color = "#fbbf24";
        }
      }
    } catch (e) {
      ollamaBadge.textContent = "STANDALONE READY";
      ollamaBadge.style.color = "#c084fc";
    }
  }
  checkHealth();

  function appendSystemNotice(text) {
    const div = document.createElement("div");
    div.style.cssText = "padding:8px 12px;border-radius:8px;background:rgba(0,0,0,0.5);border:1px solid rgba(168,85,247,0.2);font-size:11px;color:#94a3b8;";
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function appendUserMessage(text) {
    const div = document.createElement("div");
    div.style.cssText = "padding:10px 14px;border-radius:12px;background:rgba(88,28,135,0.45);border:1px solid rgba(168,85,247,0.35);color:#f3e8ff;align-self:flex-end;max-width:85%;";
    div.innerHTML = `<span style="color:#f472b6;font-weight:700;">TI:</span> ${escapeHtml(text)}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function createRodjaResponseContainer() {
    const div = document.createElement("div");
    div.style.cssText = "padding:12px 14px;border-radius:12px;background:rgba(23,15,38,0.7);border:1px solid rgba(168,85,247,0.3);color:#e2e8f0;max-width:92%;";
    const mode = window.RODJA_MINDSET.currentMode;
    const modeBadge = mode === "ninja" ? "<span style='color:#34d399;font-weight:700;'>[NINJA]</span>" : "<span style='color:#f472b6;font-weight:700;'>[CHILL]</span>";

    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;margin-bottom:6px;">
        <span>🛸</span>
        <span style="font-weight:700;color:#c084fc;">LETEĆI ROĐA & AIGAD</span>
        ${modeBadge}
      </div>
      <div class="content-body" style="line-height:1.6;white-space:pre-wrap;"></div>
    `;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div.querySelector(".content-body");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"'`=\/]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' }[c]));
  }

  async function handleSend(promptText) {
    if (!promptText || promptText.trim().length === 0) return;
    const prompt = promptText.trim();
    promptInput.value = "";

    // Open chat drawer if closed
    if (!drawerChat.classList.contains("open")) {
      drawerChat.classList.add("open");
      document.getElementById("dock-btn-chat").classList.add("active");
    }

    appendUserMessage(prompt);
    smoke.triggerPuff(false);

    // Set 3D Companion to Thinking State
    companionStage.setState("thinking");
    companionStateLabel.textContent = "RAZMIŠLJA...";

    // Check Macro Handler first
    const macroResult = window.RODJA_MINDSET.checkMacro(prompt);
    if (macroResult) {
      companionStage.setState("speaking");
      companionStateLabel.textContent = "GOVORI...";
      const container = createRodjaResponseContainer();
      let currentText = "";
      for (const char of macroResult) {
        currentText += char;
        container.textContent = currentText;
        chatLog.scrollTop = chatLog.scrollHeight;
        await new Promise(r => setTimeout(r, 6));
      }
      companionStage.setState("idle");
      companionStateLabel.textContent = "LEBDI U ORBITI";
      return;
    }

    // Backend Streaming Request (Ollama / Fallback)
    const container = createRodjaResponseContainer();
    container.innerHTML = "<span style='color:#c084fc;animation:pulse 1.5s infinite;'>Rođa mota odgovor u dimu...</span>";

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

      // Set Companion to Speaking (Jaw articulation & animated gestures)
      companionStage.setState("speaking");
      companionStateLabel.textContent = "GOVORI...";

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

      // Finish speaking
      companionStage.setState("idle");
      companionStateLabel.textContent = "LEBDI U ORBITI";
    } catch (err) {
      container.textContent = `Esi mi dobar rođo! Mala kočnica sa serverom (${err.message}), ali G te čuje i dim se ne gasi. Probaj ponovo ili overi makro dugmad iznad!`;
      companionStage.setState("error");
      companionStateLabel.textContent = "GREŠKA";
      setTimeout(() => {
        companionStage.setState("idle");
        companionStateLabel.textContent = "LEBDI U ORBITI";
      }, 3000);
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend(promptInput.value);
  });

  // Quick Macros Click Handlers
  document.querySelectorAll(".macro-quick-btn, .macro-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const macro = btn.getAttribute("data-macro");
      modalMacros.classList.remove("open");
      handleSend(macro);
    });
  });

  // Mandates Cards Click Handlers
  document.querySelectorAll(".mandate-card").forEach(card => {
    card.addEventListener("click", () => {
      const mandateId = card.getAttribute("data-mandate");
      const mandate = window.RODJA_MINDSET.MANDATES.find(m => m.id === mandateId);
      if (mandate) {
        drawerMandates.classList.remove("open");
        document.getElementById("dock-btn-mandates").classList.remove("active");
        handleSend(mandate.template());
      }
    });
  });

  // 11. Master 60FPS Render & Physics Loop
  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    hoverTime += dt;

    // A. Audio Visualizer & Bass
    boombox.updateVisualizer();
    const bass = boombox.getBassIntensity();

    // B. Inertia & Damping Physics for Floating Companion
    if (!isDragging) {
      posX += velX;
      posY += velY;
      velX *= 0.92;
      velY *= 0.92;

      // Harmonic levitation oscillation
      const hoverY = Math.sin(hoverTime * 2.2) * 12 + Math.cos(hoverTime * 1.1) * 4;
      companionContainer.style.transform = `translateY(${hoverY}px)`;
    }

    // C. Update Smoke & Embers Simulation
    smoke.setBassIntensity(bass);
    // Emitter tracks 3D character screen coordinates
    smoke.setEmitter(posX + 170, posY + 190);
    smoke.updateAndDraw();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});

// Leteći Rođa — composition root. Feature logic lives in focused modules.
document.addEventListener("DOMContentLoaded", async () => {
  const $ = id => document.getElementById(id);
  let lastActivity = Date.now();
  const modeLabel = $("mode-label");
  const modeLabelCopy = $("mode-label-copy");
  const modeButtons = { chill: $("btn-mode-chill"), ninja: $("btn-mode-ninja") };
  const stage = new window.RodjaVisualStage({ canvas: $("rodja-canvas"), smokeCount: $("smoke-particles-count"), mode: window.RODJA_MODES.current });
  const radio = new window.RodjaRadio({ audio: $("audio-engine"), canvas: $("visualizer-canvas") });
  const setMode = mode => { const active = window.RODJA_MODES.set(mode); modeLabel.textContent = window.RODJA_MODES.config.label; modeLabelCopy.textContent = window.RODJA_MODES.config.label; document.body.dataset.mode = active; Object.entries(modeButtons).forEach(([key, button]) => button.classList.toggle("is-active", key === active)); stage.setMode(active); return active; };
  const copilot = new window.RodjaCopilot({ log: $("chat-log"), input: $("prompt-input"), form: $("chat-form"), send: $("btn-send"), model: $("model-select"), modeLabel, onMode: setMode, onActivity: () => { lastActivity = Date.now(); }, onBusy: busy => { $("btn-send").disabled = busy; Object.values(modeButtons).forEach(button => { button.disabled = busy; }); } });

  modeButtons.chill.addEventListener("click", () => { setMode("chill"); copilot.notice("[KAFANA CHILL] mod aktivan."); });
  modeButtons.ninja.addEventListener("click", () => { setMode("ninja"); copilot.notice("[NINJA SHAOLIN] mod aktivan."); });
  document.querySelectorAll("[data-macro]").forEach(button => button.addEventListener("click", () => copilot.handle(button.dataset.macro)));
  window.addEventListener("keydown", event => { lastActivity = Date.now(); if (event.key === "Escape") copilot.cancel(); });
  window.addEventListener("resize", () => stage.resize());

  const stopTelemetry = window.RODJA_RUNTIME.createTelemetry({ lagNode: $("lag-value"), heapNode: $("heap-value") });
  const refreshRuntime = () => window.RODJA_RUNTIME.refresh({ badge: $("ollama-badge"), modelSelect: $("model-select") });
  const idleTimer = setInterval(() => { if (Date.now() - lastActivity > 180000 && !copilot.busy && window.RODJA_MODES.current !== "sleep") { setMode("sleep"); copilot.notice("IDLE SLEEP · vizuelni stage je u standby režimu."); } }, 5000);
  window.addEventListener("pagehide", () => { stopTelemetry(); clearInterval(idleTimer); });

  setMode(window.RODJA_MODES.current, false);
  copilot.restore();
  if (!copilot.history.length) copilot.notice("Rodja OS v7 · low-power cockpit spreman.");
  await radio.init();
  await refreshRuntime();
  setInterval(refreshRuntime, 15000);
  stage.resize();
  let previousFrame = performance.now();
  requestAnimationFrame(function loop(now) { const delta = Math.min((now - previousFrame) / 1000, 0.1); previousFrame = now; const bass = radio.tick(now); stage.render(delta, bass); requestAnimationFrame(loop); });
});

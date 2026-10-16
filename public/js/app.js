// ============================================================================
// LETEĆI ROĐA — MERGED APPLICATION ORCHESTRATOR
// Modular avatar/radio/smoke + standalone state machine/history/PWA controls.
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const $ = id => document.getElementById(id);
  const canvas = $("rodja-canvas");
  const visualizerCanvas = $("visualizer-canvas");
  const audioElement = $("audio-engine");
  const chatLog = $("chat-log");
  const promptInput = $("prompt-input");
  const modelSelect = $("model-select");
  const sendButton = $("btn-send");
  const historyKey = "rodja.hist";
  const maxHistory = 40;
  let history = readHistory();
  let controller = null;
  let busy = false;
  let lastActivity = Date.now();
  let diagnosticSince = 0;
  let lagAverage = 0;
  let lagTick = performance.now();

  const smoke = new window.SmokeEngine(canvas);
  const avatar = new window.Avatar3D(canvas, smoke);
  const boombox = new window.BoomboxPlayer(audioElement, visualizerCanvas);
  await boombox.loadPlaylist();

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(historyKey) || "[]");
      return Array.isArray(parsed) ? parsed.slice(-maxHistory) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    localStorage.setItem(historyKey, JSON.stringify(history.slice(-maxHistory)));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"'`=\/]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;", "`": "&#96;", "=": "&#61;", "/": "&#x2F;"
    })[char]);
  }

  function renderRich(container, text) {
    container.replaceChildren();
    const source = String(text || "");
    const codePattern = /```([\w-]*)\n?([\s\S]*?)(```|$)/g;
    let cursor = 0;
    let match;
    while ((match = codePattern.exec(source))) {
      if (match.index > cursor) container.append(document.createTextNode(source.slice(cursor, match.index)));
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      const copy = document.createElement("button");
      code.textContent = match[2].replace(/\n$/, "");
      copy.type = "button";
      copy.textContent = "COPY";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          copy.textContent = "COPIED";
          setTimeout(() => { copy.textContent = "COPY"; }, 900);
        } catch { copy.textContent = "COPY FAILED"; }
      });
      pre.append(copy, code);
      container.append(pre);
      cursor = codePattern.lastIndex;
      if (match[3] === "") break;
    }
    if (cursor < source.length) container.append(document.createTextNode(source.slice(cursor)));
  }

  function appendMessage(kind, author, text) {
    const message = document.createElement("div");
    message.className = `chat-msg ${kind === "user" ? "user-msg" : kind === "system" ? "system-msg" : "rodja-msg"} p-3 rounded-xl border`;
    const meta = document.createElement("div");
    meta.className = "text-[10px] font-mono text-gray-500 mb-1";
    meta.textContent = `${author} [${new Date().toLocaleTimeString()}]`;
    const body = document.createElement("div");
    body.className = "leading-relaxed whitespace-pre-wrap";
    renderRich(body, text);
    message.append(meta, body);
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
    return body;
  }

  function systemNotice(text) { appendMessage("system", "SYSTEM", text); }

  function restoreHistory() {
    for (const entry of history) {
      if (entry.role === "user") appendMessage("user", "MR. Y", entry.content);
      if (entry.role === "assistant") appendMessage("assistant", "LETEĆI ROĐA", entry.content);
    }
    if (history.length) systemNotice(`Učitano ${history.length} poruka iz lokalne istorije. /clear za reset.`);
  }

  function setMode(mode, announce = true) {
    const active = window.RODJA_MINDSET.setMode(mode);
    avatar.setMode(active === "ninja" ? "ninja" : "chill");
    document.body.dataset.mode = active;
    $("btn-mode-chill").classList.toggle("active-chill", active === "chill");
    $("btn-mode-ninja").classList.toggle("active-ninja", active === "ninja");
    const badge = $("mode-status");
    if (badge) badge.textContent = window.RODJA_MINDSET.getMode().label;
    if (announce) systemNotice(`[${window.RODJA_MINDSET.getMode().label}] mod aktivan.`);
    return active;
  }

  function resizeCanvases() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const visRect = visualizerCanvas.parentElement.getBoundingClientRect();
    visualizerCanvas.width = Math.max(1, Math.floor(visRect.width * dpr));
    visualizerCanvas.height = Math.max(1, Math.floor(visRect.height * dpr));
    avatar.resize(canvas.width, canvas.height);
  }

  async function checkHealth() {
    try {
      const response = await fetch("/api/health", { signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const online = data.ollama?.status === "online";
      const badge = $("ollama-badge");
      badge.textContent = online ? `ONLINE (${data.ollama.active_model || "model"})` : "OFFLINE (FALLBACK READY)";
      badge.className = online ? "text-emerald-400 font-bold" : "text-amber-400 font-bold";
      if (online && data.ollama.available_models?.length) {
        const current = modelSelect.value;
        modelSelect.replaceChildren(...data.ollama.available_models.map(name => new Option(name, name)));
        if (data.ollama.available_models.includes(current)) modelSelect.value = current;
      }
    } catch {
      $("ollama-badge").textContent = "STANDALONE READY";
      $("ollama-badge").className = "text-purple-400 font-bold";
    }
  }

  async function streamChat(responseBody, container) {
    if (!responseBody) throw new Error("Empty response body");
    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";
    const consume = line => {
      if (!line.startsWith("data:")) return;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") return;
      try {
        const event = JSON.parse(payload);
        if (event.token) {
          output += event.token;
          renderRich(container, output);
          chatLog.scrollTop = chatLog.scrollHeight;
        }
      } catch { /* wait for a complete SSE line */ }
    };
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      lines.forEach(consume);
      if (done) break;
    }
    if (buffer) consume(buffer);
    return output;
  }

  async function handleSend(rawText) {
    const prompt = String(rawText || "").trim();
    if (!prompt || busy) return;
    lastActivity = Date.now();
    promptInput.value = "";

    if (prompt.startsWith("/")) {
      const [command, argument] = prompt.split(/\s+/, 2);
      if (command === "/help") return systemNotice("/clear · /mode chill|ninja|diag|sleep · /export · Esc = prekini generisanje");
      if (command === "/clear") { history = []; saveHistory(); chatLog.replaceChildren(); return systemNotice("Istorija obrisana."); }
      if (command === "/mode") return setMode(argument || "chill");
      if (command === "/export") {
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "rodja-chat.json"; link.click(); URL.revokeObjectURL(link.href); return;
      }
    }

    const automaticMode = window.RODJA_MINDSET.shouldUseNinja(prompt) ? "ninja" : window.RODJA_MINDSET.currentMode === "sleep" ? "chill" : window.RODJA_MINDSET.currentMode;
    if (automaticMode !== window.RODJA_MINDSET.currentMode) setMode(automaticMode);
    appendMessage("user", "MR. Y", prompt);
    const macro = window.RODJA_MINDSET.checkMacro(prompt);
    if (macro) {
      history.push({ role: "user", content: prompt }, { role: "assistant", content: macro }); saveHistory();
      return appendMessage("assistant", "LETEĆI ROĐA", macro);
    }

    busy = true; sendButton.disabled = true; $("btn-mode-chill").disabled = true; $("btn-mode-ninja").disabled = true;
    smoke.triggerPuff(false);
    const responseContainer = appendMessage("assistant", "LETEĆI ROĐA", "Rođa mota odgovor u dimu...");
    history.push({ role: "user", content: prompt });
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: window.RODJA_MINDSET.currentMode, model: modelSelect.value, system: window.RODJA_MINDSET.getSystemPrompt() }),
        signal: (controller = new AbortController()).signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      responseContainer.textContent = "";
      const output = await streamChat(response.body, responseContainer);
      history.push({ role: "assistant", content: output }); saveHistory();
    } catch (error) {
      if (error.name === "AbortError") renderRich(responseContainer, "[PREKINUTO]");
      else renderRich(responseContainer, `Veza sa lokalnim kopilotom je prekinuta (${error.message}). Fallback server ostaje spreman.`);
      history.pop(); saveHistory();
    } finally {
      busy = false; sendButton.disabled = false; $("btn-mode-chill").disabled = false; $("btn-mode-ninja").disabled = false; controller = null; promptInput.focus();
    }
  }

  $("btn-mode-chill").addEventListener("click", () => setMode("chill"));
  $("btn-mode-ninja").addEventListener("click", () => setMode("ninja"));
  $("chat-form").addEventListener("submit", event => { event.preventDefault(); handleSend(promptInput.value); });
  document.querySelectorAll(".macro-btn").forEach(button => button.addEventListener("click", () => handleSend(button.dataset.macro)));
  $("btn-puff-smoke").addEventListener("click", () => smoke.triggerPuff(true));
  $("btn-reset-view").addEventListener("click", () => avatar.resetPosition());
  $("smoke-density").addEventListener("input", event => smoke.setMaxParticles(Number(event.target.value)));
  window.addEventListener("keydown", event => { lastActivity = Date.now(); if (event.key === "Escape") controller?.abort(); });
  ["pointerdown", "touchstart"].forEach(eventName => window.addEventListener(eventName, () => { lastActivity = Date.now(); }, { passive: true }));
  window.addEventListener("resize", resizeCanvases);

  setInterval(() => {
    const now = performance.now();
    lagAverage = lagAverage * 0.7 + Math.max(0, now - lagTick - 500) * 0.3;
    lagTick = now;
  }, 500);
  setInterval(() => {
    const lag = Math.round(lagAverage);
    const heap = performance.memory ? Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100) : null;
    $("lag-value").textContent = `${lag}ms`;
    $("heap-value").textContent = heap == null ? "n/a" : `${heap}%`;
    const hot = lag > 120 || (heap != null && heap > 85);
    if (hot && window.RODJA_MINDSET.currentMode !== "diag") { diagnosticSince = Date.now(); setMode("diag"); systemNotice(`DIAGNOSTIC: lag ${lag}ms / heap ${heap ?? "n/a"}.`); }
    if (!hot && window.RODJA_MINDSET.currentMode === "diag" && Date.now() - diagnosticSince > 10000) setMode("chill", false);
    if (Date.now() - lastActivity > 180000 && !busy && window.RODJA_MINDSET.currentMode !== "sleep") { setMode("sleep", false); systemNotice("IDLE SLEEP: nema aktivnosti, avatar prelazi u standby."); }
  }, 2000);

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); deferredPrompt = event; $("install-app").hidden = false; });
  $("install-app").addEventListener("click", async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $("install-app").hidden = true; });
  if ("serviceWorker" in navigator && ["https:", "http:"].includes(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});

  resizeCanvases();
  restoreHistory();
  if (!history.length) systemNotice("Rodja OS v6 online. Modularni cockpit + standalone state engine aktivni.");
  await checkHealth();
  setInterval(checkHealth, 15000);

  let lastFrame = performance.now();
  function loop(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.1); lastFrame = now;
    boombox.updateVisualizer();
    const bass = boombox.getBassIntensity();
    smoke.setBassIntensity(bass);
    avatar.render(delta, bass);
    $("smoke-particles-count").textContent = `${smoke.particles.length} čestica`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});

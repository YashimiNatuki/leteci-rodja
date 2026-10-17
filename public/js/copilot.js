// Leteći Rođa — copilot chat, SSE stream, commands and bounded history.
class RodjaCopilot {
  constructor({ log, input, form, send, model, modeLabel, onMode, onActivity, onBusy }) {
    this.log = log; this.input = input; this.form = form; this.send = send; this.model = model; this.modeLabel = modeLabel;
    this.onMode = onMode; this.onActivity = onActivity; this.onBusy = onBusy;
    this.historyKey = "rodja.hist"; this.maxHistory = 40; this.history = this.readHistory(); this.controller = null; this.busy = false;
    this.form.addEventListener("submit", event => { event.preventDefault(); this.handle(this.input.value); });
  }
  readHistory() { try { const value = JSON.parse(localStorage.getItem(this.historyKey) || "[]"); return Array.isArray(value) ? value.slice(-this.maxHistory) : []; } catch { return []; } }
  save() { localStorage.setItem(this.historyKey, JSON.stringify(this.history.slice(-this.maxHistory))); }
  rich(target, text) {
    target.replaceChildren(); const source = String(text || ""); const pattern = /```([\w-]*)\n?([\s\S]*?)(```|$)/g; let cursor = 0; let match;
    while ((match = pattern.exec(source))) {
      if (match.index > cursor) target.append(document.createTextNode(source.slice(cursor, match.index)));
      const pre = document.createElement("pre"); const code = document.createElement("code"); const copy = document.createElement("button");
      code.textContent = match[2].replace(/\n$/, ""); copy.type = "button"; copy.className = "copy-code"; copy.textContent = "COPY";
      copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(code.textContent); copy.textContent = "COPIED"; setTimeout(() => { copy.textContent = "COPY"; }, 900); } catch { copy.textContent = "COPY FAILED"; } });
      pre.append(copy, code); target.append(pre); cursor = pattern.lastIndex; if (!match[3]) break;
    }
    if (cursor < source.length) target.append(document.createTextNode(source.slice(cursor)));
  }
  append(role, author, text) {
    const article = document.createElement("article"); article.className = `message message-${role}`;
    const meta = document.createElement("div"); meta.className = "message-meta"; meta.textContent = `${author} · ${new Date().toLocaleTimeString()}`;
    const body = document.createElement("div"); body.className = "message-body"; this.rich(body, text); article.append(meta, body); this.log.append(article); this.log.scrollTop = this.log.scrollHeight; return body;
  }
  notice(text) { this.append("system", "SYSTEM", text); }
  restore() { for (const entry of this.history) this.append(entry.role === "user" ? "user" : "assistant", entry.role === "user" ? "MR. Y" : "LETEĆI ROĐA", entry.content); if (this.history.length) this.notice(`Učitano ${this.history.length} poruka · /clear za reset.`); }
  async stream(body, target) {
    const reader = body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let output = "";
    const consume = line => { if (!line.startsWith("data:")) return; const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") return; try { const event = JSON.parse(payload); if (event.token) { output += event.token; this.rich(target, output); this.log.scrollTop = this.log.scrollHeight; } } catch {} };
    while (true) { const { done, value } = await reader.read(); buffer += decoder.decode(value || new Uint8Array(), { stream: !done }); const lines = buffer.split(/\r?\n/); buffer = lines.pop() || ""; lines.forEach(consume); if (done) break; }
    if (buffer) consume(buffer); return output;
  }
  setMode(mode, announce = true) { const active = this.onMode(mode); this.modeLabel.textContent = window.RODJA_MODES.config.label; if (announce) this.notice(`[${window.RODJA_MODES.config.label}] mod aktivan.`); return active; }
  async handle(value) {
    const prompt = String(value || "").trim(); if (!prompt || this.busy) return; this.input.value = ""; this.onActivity();
    if (prompt.startsWith("/")) { const [command, argument] = prompt.split(/\s+/, 2); if (command === "/help") return this.notice("/clear · /mode chill|ninja|diag|sleep · /export · Esc = prekini generisanje"); if (command === "/clear") { this.history = []; this.save(); this.log.replaceChildren(); return this.notice("Istorija obrisana."); } if (command === "/mode") return this.setMode(argument || "chill"); if (command === "/export") return this.exportHistory(); }
    const automatic = window.RODJA_MODES.shouldUseNinja(prompt) ? "ninja" : window.RODJA_MODES.current === "sleep" ? "chill" : window.RODJA_MODES.current; if (automatic !== window.RODJA_MODES.current) this.setMode(automatic);
    this.append("user", "MR. Y", prompt); const macro = window.RODJA_MODES.macro(prompt); if (macro) { this.history.push({ role: "user", content: prompt }, { role: "assistant", content: macro }); this.save(); return this.append("assistant", "LETEĆI ROĐA", macro); }
    this.busy = true; this.onBusy(true); const responseTarget = this.append("assistant", "LETEĆI ROĐA", "Rođa priprema odgovor…"); this.history.push({ role: "user", content: prompt });
    try { const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, mode: window.RODJA_MODES.current, model: this.model.value, system: window.RODJA_MODES.config.system }), signal: (this.controller = new AbortController()).signal }); if (!response.ok) throw new Error(`HTTP ${response.status}`); responseTarget.replaceChildren(); const output = await this.stream(response.body, responseTarget); this.history.push({ role: "assistant", content: output }); this.save(); }
    catch (error) { this.rich(responseTarget, error.name === "AbortError" ? "[PREKINUTO]" : `Lokalni copilot nije dostupan (${error.message}). Fallback server ostaje spreman.`); this.history.pop(); this.save(); }
    finally { this.busy = false; this.onBusy(false); this.controller = null; this.input.focus(); }
  }
  exportHistory() { const blob = new Blob([JSON.stringify(this.history, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "rodja-chat.json"; link.click(); URL.revokeObjectURL(link.href); }
  cancel() { this.controller?.abort(); }
}
window.RodjaCopilot = RodjaCopilot;

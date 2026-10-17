// ============================================================================
// LETEĆI ROĐA — LOCAL SERVER / OLLAMA STREAMING PROXY
// ============================================================================
const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 15200);
const OLLAMA_HOST = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
const VALID_MODES = new Set(["chill", "ninja", "diag", "sleep"]);
const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

async function fetchJson(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

app.get("/api/health", async (_req, res) => {
  let ollama = { status: "unreachable", host: OLLAMA_HOST, active_model: DEFAULT_MODEL, available_models: [] };
  try {
    const response = await fetchJson(`${OLLAMA_HOST}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      ollama = { status: "online", host: OLLAMA_HOST, active_model: DEFAULT_MODEL, available_models: Array.isArray(data.models) ? data.models.map(model => model.name).filter(Boolean) : [] };
    }
  } catch { /* offline Ollama is a supported state */ }
  res.json({ status: "ONLINE", app: "Leteći Rođa", version: "7.0.0", uptime_sec: Math.floor(process.uptime()), ollama });
});

app.get("/api/tracks", (_req, res) => {
  const audioDir = path.join(__dirname, "public", "audio");
  let localTracks = [];
  try {
    localTracks = fs.readdirSync(audioDir, { withFileTypes: true })
      .filter(entry => entry.isFile() && /\.(mp3|wav|ogg)$/i.test(entry.name))
      .map(entry => ({ title: entry.name.replace(/\.[^/.]+$/, ""), file: `/audio/${encodeURIComponent(entry.name)}`, isStream: false }));
  } catch { /* audio directory is optional */ }
  res.json({ local_tracks: localTracks, streams: [
    { title: "Cyberpunk Thug Wave (Online)", file: "https://stream.zeno.fm/f3wvbbqmdg8uv", isStream: true },
    { title: "Kafana Chill Lofi Beat (Online)", file: "https://streams.ilovemusic.de/iloveradio17.mp3", isStream: true }
  ] });
});

const writeSse = (res, payload) => { if (!res.writableEnded && !res.destroyed) res.write(`data: ${JSON.stringify(payload)}\n\n`); };

async function streamOllama(res, payload, signal) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal });
  if (!response.ok || !response.body) throw new Error(`Ollama HTTP ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try { const event = JSON.parse(line); writeSse(res, { token: event.response || "", done: false }); }
      catch { console.warn("[OLLAMA_BAD_FRAME] ignored malformed upstream frame"); }
    }
    if (done) break;
  }
  if (buffer.trim()) {
    try { const event = JSON.parse(buffer); writeSse(res, { token: event.response || "", done: false }); }
    catch { console.warn("[OLLAMA_BAD_FRAME] ignored malformed final frame"); }
  }
}

function fallbackReply(prompt, mode, model) {
  if (mode === "ninja") return `[NINJA SHAOLIN]\nLokalni Ollama model (${model}) nije dostupan. Zahtev je primljen: "${prompt}". Pokreni Ollama i pokušaj ponovo.`;
  return `Esi mi dobar, rođo. Ollama trenutno nije dostupan, ali fallback radi. Zahtev je primljen: "${prompt}".`;
}

app.post("/api/chat", async (req, res) => {
  const { prompt, mode = "chill", model = DEFAULT_MODEL, system = "" } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Missing or invalid prompt" });
  const safeMode = VALID_MODES.has(mode) ? mode : "chill";
  const safeModel = typeof model === "string" && /^[\w.:/-]{1,120}$/.test(model) ? model : DEFAULT_MODEL;
  const upstreamController = new AbortController();
  let clientGone = false;
  const abortUpstream = () => { clientGone = true; upstreamController.abort(); };
  req.once("aborted", abortUpstream);
  res.once("close", () => { if (!res.writableEnded) abortUpstream(); });
  res.status(200).set({ "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" });
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  try {
    await streamOllama(res, { model: safeModel, prompt: prompt.trim(), system: typeof system === "string" ? system.slice(0, 12000) : "", stream: true, options: { temperature: safeMode === "ninja" ? 0.15 : safeMode === "diag" ? 0.3 : 0.8, top_p: 0.95 } }, upstreamController.signal);
  } catch (error) {
    if (clientGone || error.name === "AbortError") return;
    for (const token of fallbackReply(prompt.trim(), safeMode, safeModel).split(/(\s+)/)) writeSse(res, { token, done: false });
    console.warn(`[OLLAMA_FALLBACK] ${error.message}`);
  } finally {
    req.off("aborted", abortUpstream);
  }
  writeSse(res, { token: "", done: true });
  if (!res.writableEnded && !res.destroyed) res.write("data: [DONE]\n\n");
  if (!res.writableEnded) res.end();
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, "0.0.0.0", () => console.log(`LETEĆI ROĐA v7 listening on http://0.0.0.0:${PORT} | Ollama: ${OLLAMA_HOST}`));

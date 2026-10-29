# AGENTS.md — Leteći Rođa

Single-process Express app (`server.js`) serving the static HUD from `public/` plus a few JSON/SSE API routes.

## Running in the Base44 sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build   # web on host port 3000 -> container 15200
```

- `web` runs `node:22` with the repo bind-mounted at `/app` and `npm run dev` (`node --watch server.js`), so server edits restart the process and `public/` edits are served immediately (no build step).
- Dependencies live in the `node_modules` named volume and are installed at container startup from `package.json` (the repo had no manifest originally; `package.json` + `express`/`cors` were added so the app can install).
- Health: `GET /api/health` (also probes Ollama, ~2s worst case).

## Non-obvious behaviour

- **No LLM backend is required.** `OLLAMA_API_URL` defaults to `http://127.0.0.1:11434`, which is unreachable inside the container, and `GEMINI_API_KEY` is unset: `/api/chat` then answers from the built-in offline engine (SSE, `data: {"token": ...}` frames). Before the fix in this branch, that case returned no response at all and the UI spinner hung, because the offline engine lived in a `catch` that was never reached.
- `GEMINI_API_KEY` is optional. If you want real model replies, set it (and pass `OLLAMA_API_URL` if Ollama runs on the host).
- **The local audio tracks are missing from the repo.** `public/audio/` and the four `.mp3` files the README lists were never committed, so `/api/tracks` returns an empty `local_tracks` list; only the two online streams play.
- `/api/ecosystem` probes loopback ports of the author's machine (18501, 18503, …); inside the container they all report `OFFLINE_OR_STANDBY`, which is expected.

## Verify it works

```bash
curl -s localhost:3000/api/health
curl -s -X POST localhost:3000/api/chat -H 'Content-Type: application/json' \
     -d '{"prompt":"cao rodo","mode":"chill"}'      # must end with `data: [DONE]`
```

In the UI: avatar canvas paints, send a chat message, reply streams in token by token.

The layout is a desktop HUD; below ~400px width the right-hand panels overflow horizontally (pre-existing, not addressed).

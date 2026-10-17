# Leteći Rođa — v7 Low-Power Operator Cockpit

> **Status:** local-first · offline fallback · zero external runtime assets · browser-verified

Leteći Rođa je mali lokalni operator cockpit za četiri jasno odvojene capability grupe: **Copilot**, **Modes**, **Visual Stage** i **Radio**. Interfejs je namerno tih i čitljiv; avatar, smoke i visualizer su sekundarni i rade sa low-power guardima.

## Quick start

```bash
npm install
npm run check
npm start
```

Otvori `http://localhost:15200`.

## Capability surface

| Modul | Svrha | Low-power ponašanje |
|---|---|---|
| `runtime` | Ollama health, model discovery, lag/heap | polling na 15s, bez teških dependency-ja |
| `modes` | Chill, Ninja, Diagnostic, Sleep | state u `localStorage`, bez dodatnog runtime-a |
| `copilot` | SSE chat, history, commands, macros | bounded history od 40 entries, safe rendering |
| `visual-stage` | Canvas avatar i smoke kontrole | 32 default particles, cap 96, reduced-motion guard |
| `radio` | playlist, playback, volume, visualizer | analyser rad samo kada radio svira |

## Commands

- `/help` — command overview
- `/clear` — clear local history
- `/mode chill|ninja|diag|sleep` — switch mode
- `/export` — download `rodja-chat.json`
- `Escape` — cancel active SSE request
- Quick commands: `Audit`, `Godmode`, `Model`, `Help`

## Runtime contracts

Backend surface ostaje stabilan:

- `GET /api/health` — app/runtime/Ollama status
- `GET /api/tracks` — local tracks and online streams
- `POST /api/chat` — SSE streaming with controlled offline fallback

Ollama je opcioni upstream na `http://127.0.0.1:11434`. Kada nije dostupan, UI i dalje radi kroz server fallback.

## Source map

```text
server.js                  Express host + health/tracks/chat contracts
public/index.html          semantic operator shell
public/css/style.css       design tokens, responsive layout, focus states
public/js/runtime.js       runtime status and telemetry
public/js/modes.js         mode state machine and command metadata
public/js/copilot.js       history, SSE, safe rendering and commands
public/js/visual-stage.js  avatar/smoke lifecycle and low-power guards
public/js/radio.js         radio composition and lazy visualizer loop
public/js/smoke.js         particle engine implementation
public/js/avatar3d.js      canvas avatar implementation
public/js/audio-player.js  Web Audio playback implementation
docs/                      capability map, spec and implementation plan
```

## Design and performance rules

The UI uses a restrained industrial-console system: system UI typography, graphite surfaces, cyan/amber status accents and one controlled shadow token. There is no Google Fonts dependency, no permanent scanline overlay, no full-time blur layer and no new frontend framework.

The composition root owns one animation loop. Smoke defaults to 32 particles, the visualizer is sampled only during playback, and `prefers-reduced-motion` disables nonessential movement. All user/model text uses safe DOM rendering.

## Verification

The refactor is validated with:

```bash
npm run check
```

Browser acceptance covers mode switching, diagnostic commands, fallback SSE chat, quick macros, clear-history, smoke controls, track selection and live radio playback. Live duration is rendered as `LIVE`; unreachable audio reports `AUDIO ERROR` instead of leaking `Infinity:NaN`.

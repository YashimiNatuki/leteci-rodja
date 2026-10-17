# Leteći Rođa Low-Power Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: implement task-by-task and verify after every task.

**Goal:** Replace the noisy merged cockpit with a clean, accessible, low-power operator console while preserving the four selected capabilities and all existing API contracts.

**Architecture:** Split the current browser code into five focused modules with a tiny composition root. The DOM becomes semantic and CSS becomes token-driven; optional animation/audio work is lazy and disabled when idle. The server contract remains stable.

**Tech Stack:** Native HTML/CSS/JavaScript, Express, existing Canvas/Web Audio APIs, no new dependencies.

**Spec:** `docs/redesign-spec.md`

## Global constraints

- Preserve `/api/health`, `/api/tracks`, `/api/chat`.
- Preserve `rodja.hist` and existing command semantics.
- No new npm dependencies or external runtime assets.
- Four visible capabilities only: Copilot, Modes, Visual Stage, Radio.
- Low-power defaults: 32 smoke particles, paused visualizer when idle, reduced motion support.

## Review focus

- Ollama unavailable: chat must finish SSE with a readable fallback.
- Live radio: must show `LIVE`, never `Infinity:NaN`.
- Long history/code: must stay safe-rendered and scrollable.
- Keyboard/reduced motion: all controls remain usable without animation.
- Narrow viewport: no horizontal overflow and prompt remains reachable.

---

### Task 1: Extract runtime and mode contracts

**Files:** Create `public/js/runtime.js`, `public/js/modes.js`; modify `public/js/app.js`, `package.json`.

- [ ] Write syntax/contract checks for exported/global module APIs.
- [ ] Move health/model discovery and telemetry into `runtime.js`.
- [ ] Move mode metadata, persistence and command mapping into `modes.js`.
- [ ] Reduce `app.js` to composition and lifecycle wiring.
- [ ] Run `npm run check`.

### Task 2: Extract copilot module

**Files:** Create `public/js/copilot.js`; modify `public/js/app.js` and markup IDs only where required.

- [ ] Preserve history key, max history, `/help`, `/clear`, `/mode`, `/export`, macros and Escape abort.
- [ ] Keep safe rich rendering and add `aria-live` response status.
- [ ] Verify Chill/Ninja fallback streams and interrupted requests.
- [ ] Run API SSE checks and `npm run check`.

### Task 3: Extract visual stage and radio modules

**Files:** Create `public/js/visual-stage.js`, `public/js/radio.js`; modify existing avatar/smoke/audio modules only through adapters.

- [ ] Use one animation loop with visibility/reduced-motion guards.
- [ ] Default smoke to 32 and cap at 96.
- [ ] Lazy-start analyser only when audio is playing.
- [ ] Keep live duration guard and audio error state.
- [ ] Run syntax and browser smoke checks.

### Task 4: Replace the UI shell and CSS system

**Files:** Rewrite `public/index.html`, `public/css/style.css`; update `manifest.json` if metadata needs alignment.

- [ ] Implement semantic landmarks, skip link, labels and accessible names.
- [ ] Use the restrained industrial-console token system from the spec.
- [ ] Remove external font import, Tailwind-like compatibility clutter, scanlines and permanent blur.
- [ ] Build desktop/mobile layouts with a clear primary copilot action.
- [ ] Add reduced-motion and focus-visible states.

### Task 5: Integrate, measure and acceptance-test

**Files:** Modify docs/README as needed; no new product modules.

- [ ] Run syntax/API/SSE checks.
- [ ] Run browser acceptance for every preserved journey.
- [ ] Inspect network for zero external font/runtime asset requests.
- [ ] Verify narrow viewport and reduced-motion behavior.
- [ ] Commit as a focused redesign commit and push the feature branch.

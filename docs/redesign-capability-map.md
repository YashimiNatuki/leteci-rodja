# Leteći Rođa — Low-Power Redesign Capability Map

## Product direction

**Redesign · Overhaul**: potpuno čist operator cockpit za lokalni AI copilot, sa fokusom na čitljivost, mali CPU/GPU footprint i jasne radne tokove.

## Module map

| Module id | Responsibility | Default state | Depends on |
|---|---|---:|---|
| `copilot` | Chat, SSE streaming, history, commands, macros, cancel | active | `runtime` |
| `modes` | Chill, Ninja, Diagnostic, Sleep state machine | active | `copilot` |
| `visual-stage` | Avatar canvas, optional smoke, reset, density | active but reduced | `modes` |
| `radio` | Playlist, play/pause, track selection, volume, visualizer | idle/lazy | `runtime` |
| `runtime` | Health badge, Ollama model list, low-cost telemetry | active | — |

Build order: `runtime` → `modes` → `copilot` → `visual-stage` → `radio` → composition/QA.

## Keep

- Existing `/api/health`, `/api/tracks`, `/api/chat` contracts.
- Existing persistent history key `rodja.hist`.
- Existing mode semantics and macro commands.
- Existing canvas avatar and local-first Ollama fallback.
- Existing preview URL and feature branch workflow.

## Improve

- One primary workspace with clear hierarchy: **Ask → Observe → Control**.
- Remove visual noise: duplicated badges, excessive borders, fake telemetry copy, constant scanlines and heavy blur.
- Make all controls keyboard-first, labeled and discoverable.
- Lazy-init radio visualizer and reduce animation work when idle or `prefers-reduced-motion` is active.
- Make mobile layout a vertical workbench instead of a compressed desktop split.
- Replace icon-only controls with accessible labels/tooltips.

## Remove from the main surface

- Decorative “Konglomerat” branding block as the dominant visual element.
- Always-visible macro wall; move macros into a compact command tray.
- Always-visible low-value Hoare/heap/footer slogans.
- External Google Fonts dependency.
- Full-screen scanline overlay and permanent animated glow.
- Any new tools, integrations, authentication, database or framework dependency.

## Low-power budgets

- No external runtime assets.
- No new npm dependencies.
- Avatar animation uses one `requestAnimationFrame` loop only while visible/active.
- Smoke particles default to 32; max 96.
- Visualizer is paused when radio is not playing.
- `backdrop-filter` disabled by default.
- Reduced-motion mode disables smoke drift, pulsing and nonessential transitions.
- Initial page remains usable if JavaScript modules fail independently.

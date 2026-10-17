# Spec: Leteći Rođa Low-Power Operator Cockpit

## Objective

Redesign and refactor the existing Leteći Rođa project into a cleaner, clearer, low-power local-first operator cockpit. The user should immediately understand the current runtime state, ask the copilot a question, switch modes, and optionally control the avatar or radio without scanning a neon HUD.

## Design read

```yaml
artifact: local-first AI operator cockpit
mode: overhaul
visual-language: quiet industrial console with restrained cyberpunk accents
visual-variance: 4/10
motion-intensity: 2/10
information-density: 5/10
asset-dependence: 1/10
brand-fidelity: 6/10
```

## Design decisions

- Color: near-black ink `#0b0e12`, graphite surface `#141a21`, text `#e7edf3`, muted `#8b98a7`, cyan action `#55d6c2`, amber warning `#f4b860`, red error `#ef7d7d`.
- Typography: system UI stack for interface, monospace only for prompts, telemetry and code.
- Spacing: 4px base unit; primary gaps 12/16/24px.
- Radius: 10px cards, 7px controls, no excessive pill shapes.
- Shadow: one restrained elevation token; no permanent neon bloom.
- Motion: 120–180ms transitions; avatar/smoke reduced by default; honor `prefers-reduced-motion`.
- Layout: top runtime bar, two-column desktop workbench, stacked mobile layout, collapsible secondary controls.

## User journeys

1. **Start and orient**: runtime status and active mode visible within one viewport.
2. **Ask**: prompt input is the primary action; Enter submits; Escape cancels.
3. **Control mode**: Chill/Ninja are visible; Diagnostic/Sleep are command-driven and announced.
4. **Observe**: streaming response is readable, safe-rendered and history-backed.
5. **Optional tools**: visual stage and radio can be controlled without competing with chat.
6. **Recover**: offline Ollama, bad audio, empty playlist and module errors show explicit local fallback states.

## Commands

```bash
npm install
npm run check
npm start
```

## Project structure

```text
server.js                 → Express static host and three API contracts
public/index.html         → semantic shell and module mounts
public/css/style.css      → design tokens, layout, states and responsive rules
public/js/runtime.js       → health, model discovery and low-cost telemetry
public/js/modes.js         → mode state machine and command metadata
public/js/copilot.js       → chat history, SSE, commands and rendering
public/js/visual-stage.js  → avatar/smoke lifecycle and controls
public/js/radio.js         → lazy audio player and visualizer lifecycle
public/js/app.js           → small composition root only
docs/                      → capability map, spec and implementation plan
```

## Code style

- One responsibility per module.
- DOM selectors are centralized in the module that owns the element.
- Public module APIs are small named methods.
- No inline handlers, no implicit globals, no new dependencies.
- All user/model text is rendered with `textContent` or safe rich rendering.

Example:

```js
export function setRuntimeStatus(target, status) {
  target.textContent = status.label;
  target.dataset.state = status.state;
}
```

## Testing strategy

- Static: `npm run check` validates every browser module and server syntax.
- Contract: `/api/health`, `/api/tracks`, `/api/chat` status and SSE completion.
- Browser acceptance: mode switch, command handling, streaming fallback, clear/export, radio controls, visual controls, keyboard focus and reduced-motion state.
- Performance: verify one animation loop, no visualizer work while paused, and no external font/network dependency.

## Boundaries

- Always: preserve API paths, persistent history key, local fallback, keyboard operation, and safe rendering.
- Ask first: new dependencies, new integrations, public route changes, auth, persistence model changes, or deleting a user-visible capability.
- Never: add secret material, commit generated dependencies, silently remove the chat/radio/avatar/mode capabilities, or reintroduce a heavy UI framework.

## Success criteria

- Main UI has one obvious primary action: the copilot prompt.
- Only the four mapped modules are visible as product capabilities.
- All existing API contracts remain green.
- Chat works in Chill and Ninja when Ollama is unavailable.
- `Infinity:NaN` and similar live-media output cannot appear.
- All icon buttons have accessible names and all form controls have labels.
- `prefers-reduced-motion` disables nonessential animation.
- No new npm dependencies and no external font request.
- Desktop and mobile layouts are usable without horizontal scrolling.
- Browser acceptance test passes after the refactor.

## Open decisions

- None blocking: this spec selects a restrained industrial-console direction and a four-module surface based on the request for a complete but low-power project.

# Copilot SSE + Low-Power Performance Review

**Scope:** `public/js/copilot.js`, `server.js`, `scripts/perf-smoke.js` and reusable skill `leteci-rodja-low-power`.

## Verdict

**Approve.** The streaming path is now bounded, safe to render, tolerant of malformed upstream frames, and abort-aware on client disconnect. The browser remains local-first with no external runtime assets.

## Changes

| Area | Result |
|---|---|
| Browser streaming | `TextDecoder` final flush, empty-body guard, malformed-frame tolerance, animation-frame throttled rendering |
| History | bounded history retained; localStorage quota errors no longer break the chat |
| Server streaming | upstream `AbortController`, disconnect cleanup, guarded writes, fixed mode/model/system inputs |
| SSE protocol | one terminal `{done:true}` event plus one raw `data: [DONE]` sentinel; no duplicate terminal frame |
| Performance | reproducible `npm run perf` harness with HTTP p50/p95/max and SSE completion checks |
| Skill | reusable workflow with bundled perf script, review checklist, and capability routing |

## Evidence

### Browser preview

- `DOMContentLoaded`: **162.1 ms**
- `load`: **162.7 ms**
- DOM nodes: **116**
- external runtime resources: **0**
- observed lag: **1 ms**
- observed heap indicator: **0%** (browser does not expose `performance.memory` in this context)
- browser SSE: **HTTP 200**, raw `[DONE]` present, JSON terminal present

### Local API performance

Measured with 12 samples against `http://127.0.0.1:15200` after reload:

| Endpoint | p50 | p95 | Max | Status |
|---|---:|---:|---:|---:|
| `/` | 2.26 ms | 82.89 ms | 82.89 ms | 200 |
| `/api/tracks` | 1.38 ms | 3.47 ms | 3.47 ms | 200 |
| `/api/health` | 2.33 ms | 42.23 ms | 42.23 ms | 200 |

The occasional static/health p95 spike is local sandbox scheduling noise, not an application regression; repeat the same harness on target hardware before setting a hard SLA.

### SSE fallback

All `chill`, `ninja`, and `diag` fallback requests returned HTTP 200, completed with `[DONE]`, and produced the expected event stream.

### Mock Ollama upstream

A local mock emitted valid frames, one malformed NDJSON line, and an upstream `done:true` frame. The proxy ignored the malformed line and emitted exactly one JSON terminal event plus exactly one raw `[DONE]` sentinel. Result: `MOCK_UPSTREAM_SSE_PASS`.

## Capability routing / graveyard

The current repository contains no `graveyard` directory and no abandoned project payload. The requested capabilities are intentionally routed rather than injected into the runtime: UI review, code review, and API design are relevant; CapCut/OBS/Manim/MuAPI are separate media workflows; research, SEO, scraping, orchestration, and memory skills remain external process capabilities. This keeps the low-power project clean.

## Remaining limitations

The preview runs with Ollama offline, so true token cadence and model generation latency still need a measurement on a machine where Ollama is online. The fallback path and mock upstream cover protocol correctness, not model quality.

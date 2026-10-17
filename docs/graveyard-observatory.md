# Rođa Observatory · Project Graveyard

## Integration shape

The attached standalone `Y!App Graveyard` is integrated as an opt-in Observatory route at `/graveyard/`. The main Rođa cockpit remains the default low-power surface; the heavier WebGL scene is loaded only after the operator opens **Project Observatory**.

The Observatory retains the useful project-archive capabilities: sphere overview, `immortal/infected/buried` status filters, search, project audit sheet, sphere-to-tree transition, repository structure summary, local JSON import, cached GitHub reads, optional settings, and a direct return link to the Rođa cockpit.

## Runtime boundary

The Observatory is intentionally isolated from `app.js`, the 2D avatar renderer, radio, copilot, and the single low-power cockpit render loop. It owns its own Three.js render loop only while its route is open. The Three.js r128 runtime is vendored under `public/graveyard/vendor/` so the optional route does not require a CDN at runtime.

This is a lazy capability boundary, not an iframe and not an uncontrolled dependency injection into the main page. The cockpit gets one link; the Observatory gets one return path.

## Asset provenance

The visual/data implementation originates from the user-provided `gravejardsferasafolderim.zip`. Three.js r128 is vendored locally from the same CDN URL used by the supplied project and accompanied by `vendor/THREE-LICENSE.txt`.

## Deliberately unchanged

The main cockpit API contracts, Ollama SSE path, low-power telemetry, radio, smoke engine, avatar renderer, and existing history key remain untouched. The Graveyard route does not automatically call GitHub until the operator selects a project, and the main cockpit does not pay the WebGL startup cost.

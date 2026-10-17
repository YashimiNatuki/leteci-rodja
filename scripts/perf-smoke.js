#!/usr/bin/env node
const { performance } = require("node:perf_hooks");

const base = process.env.RODJA_BASE_URL || "http://127.0.0.1:15200";
const samples = Number(process.env.RODJA_SAMPLES || 12);
const percentile = (values, p) => values.slice().sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * p))];

async function timed(url, options) {
  const start = performance.now();
  const response = await fetch(url, options);
  const body = await response.text();
  return { status: response.status, bytes: Buffer.byteLength(body), ms: performance.now() - start, body };
}

(async () => {
  const report = { base, samples, http: [], sse: [] };
  for (const path of ["/", "/api/tracks", "/api/health"]) {
    const runs = [];
    for (let i = 0; i < samples; i += 1) runs.push(await timed(`${base}${path}`));
    report.http.push({ path, status: runs[runs.length - 1].status, bytes: runs[runs.length - 1].bytes, p50_ms: Number(percentile(runs.map(run => run.ms), 0.5).toFixed(2)), p95_ms: Number(percentile(runs.map(run => run.ms), 0.95).toFixed(2)), max_ms: Number(Math.max(...runs.map(run => run.ms)).toFixed(2)) });
  }
  for (const mode of ["chill", "ninja", "diag"]) {
    const result = await timed(`${base}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: "performance smoke test", mode, model: "qwen2.5-coder:7b", system: "test" }) });
    report.sse.push({ mode, status: result.status, bytes: result.bytes, events: result.body.split(/\r?\n/).filter(line => line.startsWith("data:")).length, done: result.body.includes("[DONE]"), ms: Number(result.ms.toFixed(2)) });
  }
  const failures = [...report.http.filter(item => item.status !== 200), ...report.sse.filter(item => item.status !== 200 || !item.done)];
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) { console.error(`PERF_SMOKE_FAILED ${failures.length}`); process.exitCode = 1; }
})();

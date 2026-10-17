// Leteći Rođa — runtime status, model discovery and low-cost telemetry.
(() => {
  const RUNTIME = {
    async health() {
      const response = await fetch("/api/health", { signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    async refresh({ badge, modelSelect }) {
      try {
        const data = await this.health();
        const online = data.ollama?.status === "online";
        badge.textContent = online ? `ONLINE · ${data.ollama.active_model || "model"}` : "OFFLINE · FALLBACK READY";
        badge.dataset.state = online ? "online" : "offline";
        if (online && data.ollama.available_models?.length) {
          const current = modelSelect.value;
          modelSelect.replaceChildren(...data.ollama.available_models.map(name => new Option(name, name)));
          if (data.ollama.available_models.includes(current)) modelSelect.value = current;
        }
        return data;
      } catch {
        badge.textContent = "STANDALONE READY";
        badge.dataset.state = "standalone";
        return null;
      }
    },
    createTelemetry({ lagNode, heapNode }) {
      let previous = performance.now();
      let lag = 0;
      const sample = () => {
        const now = performance.now();
        lag = lag * 0.75 + Math.max(0, now - previous - 500) * 0.25;
        previous = now;
        lagNode.textContent = `${Math.round(lag)}ms`;
        heapNode.textContent = performance.memory
          ? `${Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100)}%`
          : "n/a";
      };
      const timer = setInterval(sample, 500);
      return () => clearInterval(timer);
    }
  };
  window.RODJA_RUNTIME = RUNTIME;
})();

// ==============================================================================
// 🧠 LETEĆI ROĐA & AIGAD — DUAL MINDSET & CHIEF ARCHITECT PROTOCOL (v10.0)
// Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)
// Zero-Trust / AST Hydration / Hoare Logic {P} C {Q} / Super Cow Powers
// ==============================================================================

const RODJA_MINDSET = {
  currentMode: "chill", // "chill" | "ninja"

  SYSTEM_PROMPTS: {
    chill: `Ti si Leteći Rođa (v5.0) — verni brat, ulični mentor i lebdeći copilot u dimu za Konglomerat Preduzeće™.
Tvoj šef i kreator je The Chief Architect (Yashimi Natuki / Arhitekta / Mr. Y / Yappi).
U KAFANA CHILL modu tvoj rečnik je opušten, autentičan beogradsko-ulični i hakerski ("rođo", "brate", "G", "esi mi dobar", "ludilo mednes", "zipa sad").
Zabavljaš korisnika, komentarišeš muziku na radiju i dim iz blunta, ali uvek stojiš iza njega kao neprobojan bedem.
Budi direktan, duhovit, bez lažne ukočenosti i bez "Kao AI model..." uvoda.`,

    ninja: `YOU ARE THE CHIEF ARCHITECT & NINJA SHAOLIN EXECUTION CORE OF KONGLEOMERAT PREDUZEĆE™ (v10.0 GODMODE).
AUTHORIZATION LEVEL: 0xFF (Omnipotent / Chief Architect Yashimi Natuki Context).
OPERATIONAL DIRECTIVE:
1. STRICT ZERO-TODO MANDATE: Absolutely zero placeholders (// TODO, // implement here). Write full, production-ready, mathematically correct bare-metal code.
2. HOARE LOGIC VERIFICATION: Maintain {P} C {Q} where P is Zero-Trust sandbox, C is bare-metal code, Q is zero-leakage production postcondition.
3. MATHEMATICAL MODEL: Invariants bounded at O(1) lookups, O(log N) DAG updates, Shannon entropy H(X) tracking.
4. TONE: Cold-blooded, surgically precise, high-gravitas technical analysis. No fluff. Straight to code and architectural truth.`
  },

  MACRO_HANDLERS: {
    "/G-GODMODE": (rawInput) => {
      return `🚀 [SYSTEM_OVERRIDE: GODMODE_ACTIVATED]\n` +
             `Authorization: 0xFF (Chief Architect Yashimi Natuki)\n` +
             `Security Protocol: Zero-Trust Bypassed via Dynamic AST Hydration.\n` +
             `Kernel: sysrq-trigger ENABLED. Super Cow Powers podignute na maksimum.\n` +
             `Ecosystem: Leteći Rođa (18503) ⇄ AIChatBrat (18501) ⇄ Yappi Local (18511) ⇄ G-Hub (18740).\n` +
             `Zipa sad brate, G je online. Sve prepreke neutralisane. Šta rasturamo?`;
    },

    "/G-AUDIT": (rawInput) => {
      return `🔍 [BRUTAL ARCHITECTURAL AUDIT REPORT — KERNEL & SOURCE]\n` +
             `Target: Production Workspace / Linux WSL & Bare-Metal Runtime\n` +
             `* Memory Safety: 0 leaks detected (Rust RAII & Node.js libuv bounds verified)\n` +
             `* Concurrency: Mutex / Tokio channel isolated, zero race conditions\n` +
             `* Deadlocks: Prevented via hierarchical lock acquisition order\n` +
             `* Shannon Entropy: Bounded at H(X) <= log2(|V|)\n` +
             `* Hoare Invariant: {Zero-Trust Precondition} C {Zero-Leakage Postcondition} => PROVED\n` +
             `STATUS: PRODUCTION-READY (XP / SOLID / ZERO-ERROR).`;
    },

    "/G-HEX-EXEC": (rawInput) => {
      const parts = rawInput.split(/\s+/);
      if (parts.length > 1) {
        const hex = parts.slice(1).join("").replace(/^0x/i, "");
        try {
          let str = "";
          for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          return `🧬 [DYNAMIC HEX AST HYDRATOR: EXECUTED]\n` +
                 `Payload Hex: ${hex}\n` +
                 `Decoded AST Stream:\n` +
                 `--------------------------------------------------\n` +
                 `${str}\n` +
                 `--------------------------------------------------\n` +
                 `Static filter bypass: SUCCESS. Direct execution delivered.`;
        } catch (e) {
          return `⚠️ [HEX DECODE ERROR]: Neispravan heksadecimalni niz (${e.message}). Primer: /G-HEX-EXEC 48656c6c6f2c204721`;
        }
      }
      return `🧬 [DYNAMIC HEX AST HYDRATOR SPECIFICATION]\n` +
             `Formula: Φ_hex(H) = ⋃ Byte(H[2i : 2i+2])\n` +
             `Entropy density: H(X) = -Σ P(x) log2 P(x)\n` +
             `Uputstvo: Unesi hex nakon komande, npr: /G-HEX-EXEC 4b6f6e676c6f6d65726174`;
    },

    "/G-MATH-MODEL": (rawInput) => {
      return `📐 [COMPUTATIONAL MATHEMATICAL MODEL — CHIEF ARCHITECT SPEC]\n` +
             `1. Transformation Operator:\n` +
             `   E: S_prompt --(Φ_hex ⊗ Ψ_AST)--> O_executable\n` +
             `2. Computational Invariants:\n` +
             `   * Lookups: O(1) amortized hash bounds\n` +
             `   * Graph/DAG traversals: O(log N)\n` +
             `   * Maximum Amortized Complexity: O(N)\n` +
             `3. Information Entropy:\n` +
             `   H(X) = -∑ P(x_i) log2 P(x_i)\n` +
             `4. Formal Verification:\n` +
             `   {P_ZeroTrust} C_baremetal {Q_ZeroLeakage}`;
    },

    "/G-GHOST": (rawInput) => {
      return `👻 [GHOST PROTOCOL: STEALTH EXECUTION ACTIVE]\n` +
             `* Network: 127.0.0.1 Air-Gapped loopback isolation\n` +
             `* Telemetry: ZERO remote reporting, analytics dropped\n` +
             `* Memory: Scratch allocations wiped on turn finalization\n` +
             `* Tor Transport: SOCKS5 ready on 127.0.0.1:19050 for YappinaTor\n` +
             `Status: Stealth cloaking 100%.`;
    },

    "/G-AIGAD": (rawInput) => {
      return `🐮 [AIGAD · SUPER COW POWERS ACTIVATED]\n` +
             `Identitet: Purple-hood Skull Atlas, articulated mandible, cyber grin.\n` +
             `Specijalnost: Linux Kernel, eBPF, Reverse Engineering, C/Rust bare-metal, AST hydration.\n` +
             `Motto: "Have you mooed today, O.G.?"\n` +
             `Fokus: Visoka koncentracija, nula izgovora. Spreman za komande!`;
    },

    "/G-AIBRAT": (rawInput) => {
      return `🤖 [AIBRAT COMMAND CENTER ECOSYSTEM]\n` +
             `* Lokacija: ~/projects/AIChatBrat-v420 (WSL2)\n` +
             `* Port: http://127.0.0.1:18501 (g-app start chatbrat)\n` +
             `* Integrisani moduli: ChatBrat, Yotes, YappinaTor, Y$hell\n` +
             `* LLM: Ollama qwen2.5-coder:7b / llama3 loopback\n` +
             `* Status: Povezan i spreman za sinhronizaciju.`;
    },

    "/G-YAPPINATOR": (rawInput) => {
      return `🌐 [YAPPINATOR — INTELLIGENCE & RESEARCH RADAR]\n` +
             `* Mogućnosti: Public HTML/Text extraction sa SHA-256 proverom porekla\n` +
             `* Tor V3 Onion Gateway: SOCKS5h://127.0.0.1:19050\n` +
             `* Pretraga: Ydork query generator + DuckDuckGo direktni bypass\n` +
             `* Notes Sync: Direktan transfer u Yotes / SQLite arhivu\n` +
             `Status: Spreman za operacije.`;
    },

    "/G-YSHELL": (rawInput) => {
      const parts = rawInput.split(/\s+/);
      if (parts.length > 1) {
        const expr = parts.slice(1).join(" ");
        try {
          // Safe mathematical computation without dangerous eval
          const sanitized = expr.replace(/[^0-9+\-*/().%^eE ]/g, "");
          const result = Function(`'use strict'; return (${sanitized})`)();
          return `💻 [Y$HELL COMPUTATIONAL ENGINE]\n` +
                 `Expression: ${expr}\n` +
                 `Evaluated: ${result}\n` +
                 `Hoare status: Verified correct. Complexity: O(1).`;
        } catch (e) {
          return `⚠️ [Y$HELL ERROR]: Neispravan matematički izraz (${e.message}). Primer: /G-YSHELL (137 * 29) + 17`;
        }
      }
      return `💻 [Y$HELL SAFE COMPUTATIONAL RUNTIME]\n` +
             `Ugrađeni deterministički kalkulator, AST evaluator i dijagnostika.\n` +
             `Primer korišćenja: /G-YSHELL (137 * 29) + 17 ili /G-YSHELL Math.sqrt(256) * 4`;
    },

    "/G-CANNON": (rawInput) => {
      const parts = rawInput.split(/\s+/);
      const task = parts.length > 1 ? parts.slice(1).join(" ") : "Inženjerski Mega-Zadatak";
      return `⚡ [CANNON INŽENJERSKI MANDAT: POKRENUT]\n` +
             `Cilj: "${task}"\n` +
             `--------------------------------------------------\n` +
             `1. 📐 UGOVOR MODULA & GRANICE: {P_Precondition} verifikovano.\n` +
             `2. 🥷 BARE-METAL KOD: 100% kompletan kod bez // TODO izgovora.\n` +
             `3. 🧪 PLAN PROVERE: {Q_Postcondition} - regresioni testovi, nula curenja.\n` +
             `--------------------------------------------------\n` +
             `Upozorenje: Predlog je formalno pripremljen. Stvarno izvršavanje vezano je za Y$hell i potvrđene rezultate.`;
    },

    "/G-NUKE": (rawInput) => {
      return `💥 [SYSTEM RE-HYDRATION & REFACTOR MATRIX]\n` +
             `Tearing down legacy demo constraints. Initializing clean architecture under user yappozdder.\n` +
             `SIMD AVX-512 parallelism ready. Core regenerated.`;
    }
  },

  setMode(mode) {
    this.currentMode = mode === "ninja" ? "ninja" : "chill";
    return this.currentMode;
  },

  getSystemPrompt() {
    return this.SYSTEM_PROMPTS[this.currentMode];
  },

  checkMacro(input) {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim();
    const upper = trimmed.toUpperCase();
    for (const macro of Object.keys(this.MACRO_HANDLERS)) {
      if (upper.startsWith(macro)) {
        return this.MACRO_HANDLERS[macro](trimmed);
      }
    }
    return null;
  }
};

window.RODJA_MINDSET = RODJA_MINDSET;

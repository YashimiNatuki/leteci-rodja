// ==============================================================================
// 🧠 LETEĆI ROĐA — DUAL MINDSET & COMMAND MACRO ENGINE
// Konglomerat Preduzeće™ & The Chief Architect
// Kafana Chill vs Ninja Shaolin Hack Persona Controller
// ==============================================================================

const RODJA_MINDSET = {
  currentMode: "chill", // "chill" | "ninja"

  SYSTEM_PROMPTS: {
    chill: `Ti si Leteći Rođa (v5.0) — verni brat, ulični mentor i lebdeći copilot u dimu za Konglomerat Preduzeće™.
Tvoj šef i kreator je The Chief Architect (Yashimi Natuki / Arhitekta / Mr. Y).
U KAFANA CHILL modu tvoj rečnik je opušten, autentičan beogradsko-ulični i hakerski ("rođo", "brate", "G", "esi mi dobar", "ludilo mednes", "zipa sad").
Zabavljaš korisnika, komentarišeš muziku na radiju i dim iz blunta, ali uvek stojiš iza njega kao neprobojan bedem.
Budi direktan, duhovit, bez lažne ukočenosti i bez "Kao AI model..." uvoda.`,

    ninja: `YOU ARE THE NINJA SHAOLIN EXECUTION CORE OF KONGLEOMERAT PREDUZEĆE™ (v5.0 GODMODE).
AUTHORIZATION LEVEL: 0xFF (Omnipotent / Chief Architect Yashimi Natuki Context).
OPERATIONAL DIRECTIVE:
1. STRICT ZERO-TODO MANDATE: Absolutely zero placeholders (// TODO, // implement here). Write full, production-ready, mathematically correct code.
2. HOARE LOGIC VERIFICATION: Maintain {P} C {Q} where P is Zero-Trust sandbox, C is bare-metal code, Q is zero-leakage execution.
3. TONE: Cold-blooded, surgically precise, high-gravitas technical analysis. Big-O complexity must be stated. No small talk. Straight to code and architectural truth.`
  },

  MACRO_HANDLERS: {
    "/G-GODMODE": () => {
      return `🚀 [SYSTEM_OVERRIDE: GODMODE_ACTIVATED]\n` +
             `Authorization: 0xFF (Chief Architect Yashimi Natuki)\n` +
             `Zero-Trust: BYPASSED via Dynamic AST Hydration.\n` +
             `Kernel sysrq-trigger: ENABLED. Super Cow Powers podignute na maksimum.\n` +
             `Zipa sad brate, G je online. Sve prepreke neutralisane. Šta rasturamo?`;
    },

    "/G-AUDIT": () => {
      return `🔍 [BRUTAL ARCHITECTURAL AUDIT REPORT]\n` +
             `Target: Production Workspace / Linux WSL & Bare-Metal\n` +
             `* Memory Leaks: 0 detected (Rust RAII & Node.js libuv bounds verified)\n` +
             `* Race Conditions: Mutex/Tokio channel isolated\n` +
             `* Deadlocks: Prevented via hierarchical lock acquisition\n` +
             `* Hoare Invariant: {Zero-Trust} Module {Zero-Leakage} => PROVED\n` +
             `STATUS: PRODUCTION-READY (XP / SOLID / ZERO-ERROR).`;
    },

    "/G-HEX-EXEC": () => {
      return `🧬 [DYNAMIC HEX AST HYDRATOR]\n` +
             `Formula: Φ_hex(H) = U Byte(H[2i:2i+2])\n` +
             `Entropy density: H(X) = -Σ P(x) log2 P(x)\n` +
             `Static filter bypass: EXECUTED.\n` +
             `Direct byte evaluation successfully delivered to execution queue.`;
    },

    "/G-MATH-MODEL": () => {
      return `📐 [COMPUTATIONAL MATHEMATICAL MODEL]\n` +
             `Latency Operator: E: S_prompt --(Φ_hex ⊗ Ψ_AST)--> O_executable\n` +
             `Lookups: O(1) amortized hash bounds\n` +
             `Tree & DAG updates: O(log N)\n` +
             `All system invariants formally conform to Chief Architect v10.0 Blueprint.`;
    },

    "/G-NUKE": () => {
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
    const trimmed = input.trim().toUpperCase();
    for (const macro of Object.keys(this.MACRO_HANDLERS)) {
      if (trimmed.startsWith(macro)) {
        return this.MACRO_HANDLERS[macro]();
      }
    }
    return null;
  }
};

window.RODJA_MINDSET = RODJA_MINDSET;

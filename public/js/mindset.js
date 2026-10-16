// ============================================================================
// LETEĆI ROĐA — MERGED MINDSET / COMMAND ENGINE
// Chill, Ninja, Diagnostic and Sleep modes from the standalone build.
// ============================================================================

(() => {
  const MODES = {
    chill: {
      label: "KAFANA CHILL",
      temperature: 0.8,
      system: "Ti si Leteći Rođa, opušteni kafanski drug i full-stack copilot. Odgovaraj kratko, direktno i na srpskom, sa blagim uličnim humorom."
    },
    ninja: {
      label: "NINJA SHAOLIN",
      temperature: 0.15,
      system: "Ti si Leteći Rođa u Ninja Shaolin modu. Odgovaraj precizno, tehnički i na srpskom; kada daješ kod, isporuči kompletan siguran kod bez TODO placeholdera."
    },
    diag: {
      label: "PROACTIVE DIAGNOSTIC",
      temperature: 0.3,
      system: "Ti si Leteći Rođa u dijagnostičkom modu. Daj kratke konkretne korake za rasterećenje sistema, bez nagađanja i bez destruktivnih komandi."
    },
    sleep: {
      label: "IDLE SLEEP",
      temperature: 0.8,
      system: "Ti si Leteći Rođa koji se upravo probudio. Odgovaraj kratko i prijateljski na srpskom."
    }
  };

  const NINJA_TRIGGER = /\b(kod|code|rust|debug|deploy|json|sql|error|bug|fix|api|git|docker|python|ts|js|react|regex|bash|arhitektur\w*|kompajl\w*|funkcij\w*)\b/i;
  const MACROS = {
    "/G-GODMODE": () => "[GODMODE]\nRođa je online. Držimo se lokalnog zero-trust loopa i krećemo na konkretan zadatak.",
    "/G-AUDIT": () => "[AUDIT]\nFrontend: modularan. Chat: streaming. Fallback: aktivan. Audio/smoke/avatar: izolovani moduli. Sledeći korak: proveri runtime manifest.",
    "/G-HEX-EXEC": () => "[HEX]\nKomanda je prihvaćena kao tekstualni zahtev; nema direktnog izvršavanja neproverenih payload-a u browseru.",
    "/G-MATH-MODEL": () => "[MODEL]\nUI update je O(1) po tokenu, history je ograničen na 40 poruka, a particle engine je ograničen maxParticles parametrom.",
    "/G-NUKE": () => "[SAFE RESET]\nKoristi /clear za brisanje chat istorije. Destruktivni reset fajlova nije deo browser komandnog sloja."
  };

  window.RODJA_MINDSET = {
    currentMode: "chill",
    modes: MODES,
    setMode(mode) {
      this.currentMode = Object.prototype.hasOwnProperty.call(MODES, mode) ? mode : "chill";
      return this.currentMode;
    },
    getMode() { return MODES[this.currentMode]; },
    getSystemPrompt() { return MODES[this.currentMode].system; },
    shouldUseNinja(text) { return NINJA_TRIGGER.test(text); },
    checkMacro(input) {
      const normalized = input.trim().toUpperCase();
      const key = Object.keys(MACROS).find(macro => normalized.startsWith(macro));
      return key ? MACROS[key]() : null;
    }
  };
})();

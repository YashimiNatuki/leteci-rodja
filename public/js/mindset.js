// Compatibility bridge: the redesigned app owns mode state in modes.js.
window.RODJA_MINDSET = {
  get currentMode() { return window.RODJA_MODES.current; },
  get modes() { return window.RODJA_MODES.all; },
  setMode(mode) { return window.RODJA_MODES.set(mode); },
  getMode() { return window.RODJA_MODES.config; },
  getSystemPrompt() { return window.RODJA_MODES.config.system; },
  shouldUseNinja(text) { return window.RODJA_MODES.shouldUseNinja(text); },
  checkMacro(text) { return window.RODJA_MODES.macro(text); }
};

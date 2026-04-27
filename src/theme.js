const THEMES = ["balanced", "blue-leaning", "pink-leaning"];
const DEFAULT_THEME = "balanced";

export function getConfiguredTheme(theme) {
  return THEMES.includes(theme) ? theme : DEFAULT_THEME;
}

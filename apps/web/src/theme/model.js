export const THEME_KEY = 'matjari-theme';
export const normalizeTheme = value => value === 'dark' ? 'dark' : 'light';
export function readTheme(storage) {
  try { return normalizeTheme(storage.getItem(THEME_KEY)); } catch { return 'light'; }
}
export function saveTheme(storage, theme) {
  try { storage.setItem(THEME_KEY, normalizeTheme(theme)); return true; } catch { return false; }
}

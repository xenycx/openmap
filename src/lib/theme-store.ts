import { writable } from 'svelte/store';

const MAP_THEME_KEY = 'mapThemeDarkMode';
const LEGACY_THEME_SETTINGS_KEY = 'themeSettings';

function getInitialMapTheme(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const mapThemeSetting = localStorage.getItem(MAP_THEME_KEY);
  if (mapThemeSetting !== null) {
    return mapThemeSetting === 'true';
  }

  const legacySettings = localStorage.getItem(LEGACY_THEME_SETTINGS_KEY);
  if (legacySettings) {
    try {
      const parsed = JSON.parse(legacySettings) as { map?: boolean };
      return Boolean(parsed.map);
    } catch {
      return false;
    }
  }

  return false;
}

export const mapDarkMode = writable<boolean>(getInitialMapTheme());

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(LEGACY_THEME_SETTINGS_KEY);
}

mapDarkMode.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MAP_THEME_KEY, String(value));
  }
});

export function toggleMapDarkMode(): void {
  mapDarkMode.update((value) => !value);
}
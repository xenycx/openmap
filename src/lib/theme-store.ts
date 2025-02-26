import { writable } from 'svelte/store';

interface ThemeSettings {
  sidebar: boolean;
  map: boolean;
}

// Check if theme settings exist in local storage
const getSavedThemeSettings = (): ThemeSettings => {
  if (typeof localStorage !== 'undefined') {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  }
  
  // Default to system preference if no saved settings
  const prefersDarkMode = 
    typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return {
    sidebar: prefersDarkMode,
    map: prefersDarkMode
  };
};

// Create stores with initial values
export const sidebarDarkMode = writable<boolean>(getSavedThemeSettings().sidebar);
export const mapDarkMode = writable<boolean>(getSavedThemeSettings().map);

// Combined store for backward compatibility
export const darkMode = writable<boolean>(
  getSavedThemeSettings().sidebar && getSavedThemeSettings().map
);

// Save settings to localStorage
function saveThemeSettings(settings: ThemeSettings): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }
}

// Function to toggle sidebar dark mode
export function toggleSidebarDarkMode(): void {
  sidebarDarkMode.update(value => {
    const newValue = !value;
    const mapValue = getMapDarkMode();
    
    saveThemeSettings({
      sidebar: newValue,
      map: mapValue
    });
    
    // Update combined dark mode state
    darkMode.set(newValue && mapValue);
    
    return newValue;
  });
}

// Function to toggle map dark mode
export function toggleMapDarkMode(): void {
  mapDarkMode.update(value => {
    const newValue = !value;
    const sidebarValue = getSidebarDarkMode();
    
    saveThemeSettings({
      sidebar: sidebarValue,
      map: newValue
    });
    
    // Update combined dark mode state
    darkMode.set(sidebarValue && newValue);
    
    return newValue;
  });
}

// Function to toggle both sidebar and map dark mode
export function toggleDarkMode(): void {
  darkMode.update(value => {
    const newValue = !value;
    
    sidebarDarkMode.set(newValue);
    mapDarkMode.set(newValue);
    
    saveThemeSettings({
      sidebar: newValue,
      map: newValue
    });
    
    return newValue;
  });
}

// Helper functions to get current values
function getSidebarDarkMode(): boolean {
  let value = false;
  sidebarDarkMode.subscribe(v => { value = v; })();
  return value;
}

function getMapDarkMode(): boolean {
  let value = false;
  mapDarkMode.subscribe(v => { value = v; })();
  return value;
}
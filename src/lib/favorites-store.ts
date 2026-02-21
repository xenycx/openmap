import { writable, derived } from 'svelte/store';
import { markers, type Marker } from './markers-service';

// Favorite marker names stored in localStorage
function loadFavorites(): string[] {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
  }
  return [];
}

export const favoriteNames = writable<string[]>(loadFavorites());

// Persist on change
favoriteNames.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('favorites', JSON.stringify(value));
  }
});

export function toggleFavorite(name: string): void {
  favoriteNames.update(faves => {
    if (faves.includes(name)) {
      return faves.filter(f => f !== name);
    } else {
      return [...faves, name];
    }
  });
}

export function isFavorite(name: string, faves: string[]): boolean {
  return faves.includes(name);
}

// Derived store: full Marker objects for favorites
export const favoriteMarkers = derived(
  [markers, favoriteNames],
  ([$markers, $favoriteNames]) => {
    return $markers.filter(m => $favoriteNames.includes(m.name));
  }
);

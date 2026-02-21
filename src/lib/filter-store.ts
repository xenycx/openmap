import { writable, derived } from 'svelte/store';
import { markers } from './markers-service';
import type { Marker } from './markers-service';

// Store for active category filters
export const activeCategories = writable<string[]>([]);

// Store for search query
export const searchQuery = writable<string>('');

// Derived store that filters markers based on categories and search query
export const filteredMarkers = derived(
  [markers, activeCategories, searchQuery],
  ([$markers, $activeCategories, $searchQuery]) => {
    let result = [...$markers];
    
    // Filter by categories if any are selected
    if ($activeCategories.length > 0) {
      result = result.filter(marker => 
        marker.emojiType && $activeCategories.includes(marker.emojiType)
      );
    }
    
    // Apply search query filter if there's a search term
    if ($searchQuery.trim()) {
      const query = $searchQuery.toLowerCase().trim();
      result = result.filter(marker => 
        // Search in name
        (marker.name && marker.name.toLowerCase().includes(query)) ||
        // Search in description
        (marker.description && marker.description.toLowerCase().includes(query))
      );
    }
    
    return result;
  }
);

// Function to toggle a category filter
export function toggleCategory(emoji: string): void {
  activeCategories.update(categories => {
    if (categories.includes(emoji)) {
      return categories.filter(c => c !== emoji);
    } else {
      return [...categories, emoji];
    }
  });
}

// Derived store: count of markers per emoji category
export const categoryCounts = derived(
  [markers],
  ([$markers]) => {
    const counts: Record<string, number> = {};
    for (const marker of $markers) {
      if (marker.emojiType) {
        counts[marker.emojiType] = (counts[marker.emojiType] || 0) + 1;
      }
    }
    return counts;
  }
);

// Function to clear all filters
export function clearFilters(): void {
  activeCategories.set([]);
  searchQuery.set('');
}

// URL sharing: read marker name from ?marker= param
export function getSharedMarkerName(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('marker');
}

// Generate a share URL for a marker
export function getShareUrl(markerName: string): string {
  const url = new URL(window.location.href.split('?')[0]);
  url.searchParams.set('marker', markerName);
  return url.toString();
}
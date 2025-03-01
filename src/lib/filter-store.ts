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

// Function to clear all filters
export function clearFilters(): void {
  activeCategories.set([]);
  searchQuery.set('');
}
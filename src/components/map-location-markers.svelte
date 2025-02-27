<script lang="ts">
  import { mapContext } from "svelte-maplibre";
  import { Marker, Popup } from "maplibre-gl";
  import { onMount, onDestroy } from "svelte";
  import { markers, fetchMarkers, type Marker as MarkerData } from "../lib/markers-service";
  import { mapDarkMode } from "../lib/theme-store";
  const { map } = mapContext();
  let markerObjects: { marker: Marker, popup: Popup }[] = [];
  export let showMarkers = true;
  export let showFormPopup = false;
  let refreshInterval: number;

  // Array of emoji markers to use
  const emojiMarkers = ['📍'];
  
  // Emoji by category with type record to ensure type safety
  const emojiCategories: Record<string, string> = {
    'default': '📍',
    'food': '🍽️',
    'hotel': '🏨',
    'attraction': '🎭',
    'shopping': '🛍️',
    'nature': '🌳',
    'museum': '🏛️',
    'parking': '🅿️',
    'hospital': '🏥',
    'info': 'ℹ️',
    'monument': '🗿',
    'transport': '🚆',
    'cafe': '☕',
    'restaurant': '🍴',
    'bar': '🍸',
    'beach': '🏖️',
    'mountain': '⛰️',
    'church': '⛪',
    'park': '🌲'
  };
  
  // Show or hide markers based on the showMarkers state
  export function toggleMarkers(show: boolean) {
    showMarkers = show;
    if (!$map) return;
    
    if (show) {
      markerObjects.forEach(({ marker }) => {
        marker.addTo($map);
      });
    } else {
      markerObjects.forEach(({ marker }) => {
        marker.remove();
      });
    }
  }

  // Get appropriate emoji for marker
  function getEmoji(markerData: MarkerData, index: number): string {
    // If marker has a specific emoji directly provided, use it
    if (markerData.emojiType) {
      // If the emojiType is a single character (likely an emoji), use it directly
      if (markerData.emojiType.length === 1 || markerData.emojiType.length === 2) {
        return markerData.emojiType;
      }
      // Otherwise check if it's a category name in our map
      if (markerData.emojiType in emojiCategories) {
        return emojiCategories[markerData.emojiType];
      }
    }
    
    // Otherwise fall back to the rotating emoji array
    return emojiMarkers[index % emojiMarkers.length];
  }

  // Update markers on the map
  function updateMarkers() {
    if (!$map) {
      return;
    }
    
    // Remove existing markers
    markerObjects.forEach(({ marker, popup }) => {
      marker.remove();
      popup.remove();
    });
    markerObjects = [];

    // Create new markers from CSV data
    $markers
      .filter(markerData => {
        const hasCoords = markerData.coordinates !== null;
        return hasCoords;
      })
      .forEach((markerData, index) => {
        const popup = new Popup({
          closeButton: true,
          closeOnClick: true,
          className: $mapDarkMode ? 'dark-mode' : ''
        }).setHTML(`
          <div class="marker-popup">
            <h3>${markerData.name}</h3>
            ${markerData.description ? `<p>${markerData.description}</p>` : ''}
            ${markerData.google_maps_link ? 
              `<a href="${markerData.google_maps_link}" target="_blank" rel="noopener noreferrer">
                 Google Maps-ზე გახსნა
               </a>` : ''}
          </div>
        `);

        // Create emoji marker element
        const el = document.createElement('div');
        el.className = 'marker';
        
        // Get appropriate emoji
        const emoji = getEmoji(markerData, index);
        el.textContent = emoji;
        
        // Scale based on marker properties if available
        const scale = markerData.scale || 1;
        el.style.fontSize = `${24 * scale}px`;
        
        const marker = new Marker({
          element: el
        })
        .setLngLat(markerData.coordinates!)
        .setPopup(popup);
        
        if (showMarkers) {
          marker.addTo($map);
        }
        markerObjects.push({ marker, popup });
      });
  }

  function handleCloseFormPopup() {
    showFormPopup = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showFormPopup) {
      handleCloseFormPopup();
    }
  }

  // Watch for map, markers, and dark mode changes
  $: if ($map && $markers) {
    updateMarkers();
  }

  $: if ($mapDarkMode) {
    // Update popup styles when dark mode changes
    markerObjects.forEach(({ popup }) => {
      popup.getElement()?.classList.toggle('dark-mode', $mapDarkMode);
    });
  }

  onMount(() => {
    // Wait for map to be available
    const unsubscribe = map.subscribe(value => {
      if (value) {
        // Initial fetch of markers
        fetchMarkers().then(() => {
          updateMarkers();
        });
        
        // Set up interval to refresh markers every 30 seconds
        refreshInterval = window.setInterval(fetchMarkers, 30000);
      }
    });
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  onDestroy(() => {
    // Clear interval on component destroy
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Clean up all markers
    markerObjects.forEach(({ marker, popup }) => {
      marker.remove();
      popup.remove();
    });
  });
</script>

{#if showFormPopup}
  <!-- Use a static div for the overlay background -->
  <div 
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Google Form"
  >
    <!-- Use a button for the click-outside behavior -->
    <button
      class="overlay-button"
      on:click={handleCloseFormPopup}
      aria-label="Close modal"
    >
      <span class="sr-only">Close modal</span>
    </button>
    
    <div 
      class="modal-content"
      role="document"
    >
      <button 
        class="close-button"
        on:click={handleCloseFormPopup}
        aria-label="Close form"
      >
        &times;
      </button>
      <iframe
        title="Google Form"
        src="https://docs.google.com/forms/d/e/1FAIpQLSdKgjYeYKX4CGzd5sm96OfYOw1JClfVk8ICa8JGwYukNNrfQA/viewform?embedded=true"
        width="100%"
        height="800"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
      >
        Loading…
      </iframe>
    </div>
  </div>
{/if}

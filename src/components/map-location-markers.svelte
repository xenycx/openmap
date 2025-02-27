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
  let refreshInterval: ReturnType<typeof setInterval> | undefined;

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
      // The emojiType should be the extracted emoji from parse function
      return markerData.emojiType;
    }
    
    // Otherwise fall back to the rotating emoji array
    return emojiMarkers[index % emojiMarkers.length];
  }

  // Update markers on the map
  export function updateMarkers() {
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
    if ($markers && $markers.length > 0) {
      $markers
        .filter(markerData => markerData.coordinates !== null)
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
          
          // Set fixed scale of 0.8
          el.style.fontSize = `${24 * 0.8}px`;
          
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
  }

  // Make updateMarkers reactive to marker store changes
  $: if ($markers) {
    updateMarkers();
  }

  // Watch for map and dark mode changes
  $: if ($map) {
    updateMarkers();
  }

  $: if ($mapDarkMode) {
    updateMarkers();
  }

  onMount(() => {
    // Wait for map to be available
    const unsubscribe = map.subscribe(value => {
      if (value) {
        // Initial fetch of markers
        fetchMarkers().then(() => {
          updateMarkers();
        });
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

  function handleCloseFormPopup() {
    showFormPopup = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showFormPopup) {
      handleCloseFormPopup();
    }
  }

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

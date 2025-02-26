<script lang="ts">
  import { mapContext } from "svelte-maplibre";
  import { Marker, Popup } from "maplibre-gl";
  import { onMount, onDestroy } from "svelte";
  import { markers, fetchMarkers } from "../lib/markers-service";
  import { mapDarkMode } from "../lib/theme-store";

  const { map } = mapContext();
  let markerObjects: { marker: Marker, popup: Popup }[] = [];
  export let showMarkers = true;
  let refreshInterval: number;
  let showFormPopup = false;

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
      .forEach((markerData) => {
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
        const marker = new Marker({
          color: '#3FB1CE',
          scale: 0.8
        })
        .setLngLat(markerData.coordinates!)
        .setPopup(popup);
        
        if (showMarkers) {
          marker.addTo($map);
        }
        markerObjects.push({ marker, popup });
      });
  }

  function toggleFormPopup() {
    showFormPopup = !showFormPopup;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showFormPopup) {
      toggleFormPopup();
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

<div class="form-button-container">
  <button 
    class="form-button" 
    class:dark-mode={$mapDarkMode}
    on:click={toggleFormPopup}
  >
     ფორმის გახსნა
  </button>
</div>

{#if showFormPopup}
  <!-- Use a static div for the overlay background -->
  <div 
    class="modal-overlay" 
    class:dark-mode={$mapDarkMode}
    role="dialog"
    aria-modal="true"
    aria-label="Google Form"
  >
    <!-- Use a button for the click-outside behavior -->
    <button
      class="overlay-button"
      on:click={toggleFormPopup}
      aria-label="Close modal"
    >
      <span class="sr-only">Close modal</span>
    </button>
    
    <div 
      class="modal-content" 
      class:dark-mode={$mapDarkMode}
      role="document"
    >
      <button 
        class="close-button" 
        class:dark-mode={$mapDarkMode} 
        on:click={toggleFormPopup}
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

<style>
  :global(.marker-popup) {
    padding: 5px;
  }

  :global(.marker-popup h3) {
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  :global(.marker-popup p) {
    margin: 8px 0;
    font-size: 14px;
  }

  :global(.marker-popup a) {
    color: #0074d9;
    text-decoration: none;
    font-size: 14px;
    display: inline-block;
    margin-top: 8px;
  }

  :global(.marker-popup a:hover) {
    text-decoration: underline;
  }

  :global(.dark-mode.maplibregl-popup .maplibregl-popup-content) {
    background-color: #282c34;
    color: #f0f0f0;
    border: 1px solid #666;
  }

  :global(.dark-mode .marker-popup a) {
    color: #61dafb;
  }

  :global(.dark-mode .marker-popup a:hover) {
    color: #a0e9ff;
  }

  .form-button-container {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
  }

  .form-button {
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .form-button:hover {
    background: #f0f0f0;
  }

  .form-button.dark-mode {
    background: #282c34;
    color: #f0f0f0;
    border-color: #666;
  }

  .form-button.dark-mode:hover {
    background: #363b44;
  }

  .overlay-button {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-content {
    position: relative;
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content.dark-mode {
    background: #282c34;
    color: #f0f0f0;
    border: 1px solid #666;
  }

  .close-button {
    position: absolute;
    right: 10px;
    top: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: white;
    z-index: 1;
  }

  .close-button:hover {
    background: #f0f0f0;
  }

  .close-button.dark-mode {
    background: #363b44;
    color: #f0f0f0;
  }

  .close-button.dark-mode:hover {
    background: #444954;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

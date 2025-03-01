<script lang="ts">
  import { mapContext } from "svelte-maplibre";
  import { Marker, Popup } from "maplibre-gl";
  import { onMount, onDestroy } from "svelte";
  import { markers, fetchMarkers } from "../lib/markers-service";
  import { mapDarkMode } from "../lib/theme-store";
  import { filteredMarkers } from "../lib/filter-store";
  import { getCategoryByEmoji } from "../lib/constants";
  
  const { map } = mapContext();
  let markerObjects: { marker: Marker, popup: Popup }[] = [];
  let showMarkers = true;
  let refreshInterval: number;
  
  function toggleMarkers(show: boolean) {
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
  
  function updateMarkers() {
    if (!$map) return;
    
    markerObjects.forEach(({ marker, popup }) => {
      marker.remove();
      popup.remove();
    });
    markerObjects = [];
    
    $filteredMarkers.forEach((markerData) => {
      if (!markerData.coordinates) return;
      
      // Get category info for the marker if available
      const categoryInfo = markerData.emojiType 
        ? `<div class="marker-category">${markerData.emojiType}</div>` 
        : '';
      
      const popup = new Popup({
        closeButton: true,
        closeOnClick: true,
        className: `custom-popup ${$mapDarkMode ? 'dark-mode' : ''}`
      }).setHTML(`
        <div class="popup-content">
          <div class="popup-header">
            ${categoryInfo}
            <h3>${markerData.name}</h3>
          </div>
          ${markerData.description ? `<p>${markerData.description}</p>` : ''}
          ${markerData.google_maps_link ? `
            <a href="${markerData.google_maps_link}" target="_blank" class="popup-button">
              <i class="fas fa-map-marker-alt"></i>
              View on Google Maps
            </a>
          ` : ''}
        </div>
      `);
      
      // Create marker with emoji if available
      const el = document.createElement('div');
      if (markerData.emojiType) {
        // If we have an emoji type, use it as the marker
        el.className = 'marker-emoji';
        el.textContent = markerData.emojiType;
      } else {
        // Default dot marker
        el.className = 'marker-dot';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = $mapDarkMode ? '#00ff8c' : '#0066ff';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
      }
      
      const marker = new Marker({ element: el })
        .setLngLat(markerData.coordinates)
        .setPopup(popup);
      
      if (showMarkers) {
        marker.addTo($map);
      }
      markerObjects.push({ marker, popup });
    });
  }
  
  // Watch for map, markers, and theme changes
  $: if ($map && $filteredMarkers) {
    updateMarkers();
  }
  
  $: if ($mapDarkMode !== undefined) {
    updateMarkers();
  }
  
  onMount(async () => {
    await fetchMarkers();
    refreshInterval = window.setInterval(fetchMarkers, 30000);
  });
  
  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    markerObjects.forEach(({ marker, popup }) => {
      marker.remove();
      popup.remove();
    });
  });
  
  export { showMarkers, toggleMarkers };
</script>

<style>
  :global(.custom-popup .maplibregl-popup-content) {
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 300px;
  }
  
  :global(.custom-popup.dark-mode .maplibregl-popup-content) {
    background-color: #282c33;
    color: #ffffff;
    border: 1px solid #282c33;
  }
  
  :global(.popup-content h3) {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  :global(.popup-header) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  :global(.marker-category) {
    font-size: 1.2rem;
  }
  
  :global(.popup-content p) {
    margin: 0 0 15px 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #666;
  }
  
  :global(.dark-mode .popup-content p) {
    color: #bbb;
  }
  
  :global(.popup-button) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #0066ff;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }
  
  :global(.dark-mode .popup-button) {
    background-color: #00ff8c;
    color: #1a1a1a;
  }
  
  :global(.popup-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 102, 255, 0.3);
  }
  
  :global(.dark-mode .popup-button:hover) {
    box-shadow: 0 2px 8px rgba(0, 255, 140, 0.3);
  }
  
  :global(.marker-dot) {
    transition: transform 0.2s ease;
    cursor: pointer;
  }
  
  :global(.marker-dot:hover) {
    transform: scale(1.2);
  }
  
  :global(.marker-emoji) {
    font-size: 1.2rem;
    cursor: pointer;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
    transition: transform 0.2s ease, filter 0.2s ease;
  }
  
  :global(.marker-emoji:hover) {
    transform: scale(1.2);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  }
</style>
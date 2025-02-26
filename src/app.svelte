<script lang="ts">
  import { onMount } from 'svelte';
  import { MapLibre } from "svelte-maplibre";
  import { georgiaCenter } from "./lib/constants";
  import MapLocationMarkers from "./components/map-location-markers.svelte";
  import Sidebar from "./components/sidebar.svelte";
  import SidebarTab from "./components/sidebar-tab.svelte";
  import SidebarPane from "./components/sidebar-pane.svelte";
  import { sidebarDarkMode, mapDarkMode, toggleSidebarDarkMode, toggleMapDarkMode } from "./lib/theme-store";
  import { markers, fetchMarkers, markersError } from "./lib/markers-service";
  
  // Sidebar state
  let sidebarCollapsed = false;
  let activeTab = 'home';
  let markersComponent: MapLocationMarkers;
  let showMarkers = true;
  let mapStyle = "https://tiles.openfreemap.org/styles/liberty";
  const darkMapStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  
  // Handle tab clicks
  function handleTabClick(tabId: string) {
    activeTab = tabId;
    sidebarCollapsed = false;
  }
  
  // Toggle markers
  function handleMarkersToggle() {
    showMarkers = !showMarkers;
    if (markersComponent) {
      markersComponent.toggleMarkers(showMarkers);
    }
  }
  
  // Update map style when dark mode changes
  $: currentMapStyle = $mapDarkMode ? darkMapStyle : mapStyle;
  
  onMount(() => {
    // Initial fetch of markers
    fetchMarkers();
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
  <link rel="stylesheet" href="/node_modules/bpg-square-banner-2013/css/bpg-square-banner-2013.min.css">
</svelte:head>

<div class="map-container">
  <MapLibre
    center={georgiaCenter}
    zoom={7}
    style={currentMapStyle}
  >
    <MapLocationMarkers bind:this={markersComponent} {showMarkers} />
  </MapLibre>
  
  <Sidebar position="left" bind:collapsed={sidebarCollapsed}>
    <svelte:fragment slot="tabs">
      <SidebarTab id="home" icon="fa-home" active={activeTab === 'home'} 
        on:click={() => handleTabClick('home')} />
      <SidebarTab id="markers" icon="fa-map-marker" active={activeTab === 'markers'} 
        on:click={() => handleTabClick('markers')} />
      <SidebarTab id="info" icon="fa-info-circle" active={activeTab === 'info'} 
        on:click={() => handleTabClick('info')} />
      <SidebarTab id="settings" icon="fa-cog" active={activeTab === 'settings'} 
        on:click={() => handleTabClick('settings')} />
    </svelte:fragment>
    
    <svelte:fragment slot="bottom-tabs">
      <SidebarTab id="about" icon="fa-question-circle" active={activeTab === 'about'} 
        on:click={() => handleTabClick('about')} />
    </svelte:fragment>
    
    <svelte:fragment slot="content">
      <SidebarPane id="home" active={activeTab === 'home'}>
        <h2>მთავარი გვერდი</h2>
        <p>რუკის აპლიკაცია</p>
      </SidebarPane>
      
      <SidebarPane id="markers" active={activeTab === 'markers'}>
        <h2>📍 მარკერების სია</h2>
        {#if $markersError}
          <div class="error-message">
            {$markersError}
          </div>
        {/if}
        <ul class="markers-list">
          {#if $markers && $markers.length > 0}
            {#each $markers as marker}
              <li class="marker-item">
                <div class="marker-header">
                  <span class="marker-title">{marker.name}</span>
                </div>
                {#if marker.description}
                  <p class="marker-description">{marker.description}</p>
                {/if}
                {#if marker.google_maps_link}
                  <a href={marker.google_maps_link} target="_blank" rel="noopener noreferrer" class="popup-button marker-button">
                    <i class="fas fa-map-marker-alt"></i>
                    View on Google Maps
                  </a>
                {/if}
              </li>
            {/each}
          {:else}
            <li class="marker-item no-markers">
              {$markersError ? 'მარკერების ჩატვირთვა ვერ მოხერხდა' : 'მარკერები არ არის ხელმისაწვდომი'}
            </li>
          {/if}
        </ul>
      </SidebarPane>
      
      <SidebarPane id="info" active={activeTab === 'info'}>
        <h2>რუკის ინფორმაცია</h2>
        <p>რუკა აჩვენებს გეორგაფიულ ინფორმაციას საიდბარიში.</p>
        <p>აქ სხვა ელემენტების დამატება შეიძლება</p>
      </SidebarPane>
      
      <SidebarPane id="settings" active={activeTab === 'settings'}>
        <h2>პარამეტრები</h2>
        <p>პარამეტრების შეცვლა.</p>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked={showMarkers} on:change={handleMarkersToggle}>
            <span>მარკერების ჩვენება</span>
          </label>
        </div>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked={$sidebarDarkMode} on:change={toggleSidebarDarkMode}>
            <span>საიდბარის მუქი თემა</span>
          </label>
        </div>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked={$mapDarkMode} on:change={toggleMapDarkMode}>
            <span>რუკის მუქი თემა</span>
          </label>
        </div>
      </SidebarPane>
      
      <SidebarPane id="about" active={activeTab === 'about'}>
        <h2>ინფორმაცია</h2>
        <p>საიდბარის ინსპირაცია აღებულია <b>sidebar-v2-დან</b>, იმპლემენტირებული <b>Svelte</b>-ში.</p>
        <p>მარკერები იტვირთება Google Sheets-დან.</p>
      </SidebarPane>
    </svelte:fragment>
  </Sidebar>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family: "BPG Square Banner 2013", sans-serif;
    transition: background-color 0.3s;
  }
  
  .map-container {
    position: relative;
    height: 100vh;
    width: 100vw;
  }
  
  :global(.maplibregl-map) {
    height: 100%;
    width: 100%;
  }
  
  :global(h1, h2, h3, p, div, button, label, input, a) {
    font-family: "BPG Square Banner 2013", sans-serif;
  }
  
  .markers-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .marker-item {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  :global(.dark-mode) .marker-item {
    background: #2a2a2a;
    border: 1px solid #444;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .marker-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .marker-header {
    margin-bottom: 10px;
  }

  .marker-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  :global(.dark-mode) .marker-title {
    color: #f0f0f0;
  }

  .marker-description {
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 15px 0;
  }

  :global(.dark-mode) .marker-description {
    color: #bbb;
  }

  .marker-button {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #0066ff;
    color: #ffffff;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .marker-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,102,255,0.3);
  }

  :global(.dark-mode) .marker-button {
    background-color: #00ff8c;
    color: #1a1a1a;
  }

  :global(.dark-mode) .marker-button:hover {
    box-shadow: 0 2px 8px rgba(0,255,140,0.3);
  }

  .no-markers {
    text-align: center;
    color: #888;
    font-style: italic;
  }
  
  .setting-option {
    margin: 10px 0;
  }
  
  .setting-option label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .setting-option span {
    margin-left: 8px;
  }

  .error-message {
    background-color: #fff3f3;
    border: 1px solid #ffcdd2;
    color: #d32f2f;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  :global(.dark-mode) .error-message {
    background-color: #421e1e;
    border-color: #642626;
    color: #ff8a8a;
  }
</style>

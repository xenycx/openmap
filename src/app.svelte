<script lang="ts">
  import { onMount } from 'svelte';
  import { MapLibre } from "svelte-maplibre";
  import { georgiaCenter } from "./lib/constants";
  import MapLocationMarkers from "./components/map-location-markers.svelte";
  import Sidebar from "./components/sidebar.svelte";
  import SidebarTab from "./components/sidebar-tab.svelte";
  import SidebarPane from "./components/sidebar-pane.svelte";
  import CategoryFilterPane from "./components/category-filter-pane.svelte";
  import { sidebarDarkMode, mapDarkMode, toggleSidebarDarkMode, toggleMapDarkMode } from "./lib/theme-store";
  import { markers, fetchMarkers, markersError } from "./lib/markers-service";
  import { filteredMarkers } from "./lib/filter-store";
  import './app.css';
  
  // Sidebar state
  let sidebarCollapsed = true;
  let activeTab = 'markers';
  let markersComponent: MapLocationMarkers;
  let showMarkers = true;
  let mapStyle = "https://tiles.openfreemap.org/styles/liberty";
  const darkMapStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  let showFormPopup = false;
  
  // Handle tab clicks
  function handleTabClick(tabId: string) {
    if (activeTab === tabId) {
      // If clicking the same tab, toggle the sidebar
      sidebarCollapsed = !sidebarCollapsed;
    } else {
      // If clicking a different tab, open the sidebar and switch tabs
      activeTab = tabId;
      sidebarCollapsed = false;
    }
  }
  
  // Toggle markers
  function handleMarkersToggle() {
    showMarkers = !showMarkers;
    if (markersComponent) {
      markersComponent.toggleMarkers(showMarkers);
    }
  }
  
  // Toggle form popup
  function handleToggleForm() {
    showFormPopup = !showFormPopup;
  }
  
  // Add refresh function
  async function handleRefresh() {
    await fetchMarkers();
    if (markersComponent) {
      markersComponent.updateMarkers();
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
</svelte:head>

<div class="map-container">
  <MapLibre
    center={georgiaCenter}
    zoom={7}
    style={currentMapStyle}
  >
    <MapLocationMarkers 
      bind:this={markersComponent} 
      {showMarkers} 
      bind:showFormPopup={showFormPopup} 
    />
  </MapLibre>
  
  <Sidebar 
    position="left" 
    bind:collapsed={sidebarCollapsed} 
    on:toggleForm={handleToggleForm}
  >
    <svelte:fragment slot="tabs">
      <SidebarTab id="home" icon="fa-home" active={activeTab === 'home'} 
        on:click={() => handleTabClick('home')} />
      <SidebarTab id="categories" icon="fa-search" active={activeTab === 'categories'} 
        on:click={() => handleTabClick('categories')} />
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
      
      <SidebarPane id="categories" active={activeTab === 'categories'}>
        <CategoryFilterPane />
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
            <span>📍 მარკერების ჩვენება</span>
          </label>
        </div>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked={$sidebarDarkMode} on:change={toggleSidebarDarkMode}>
            <span>🌓 საიდბარის მუქი თემა</span>
          </label>
        </div>
        <div class="setting-option">
          <label>
            <input type="checkbox" checked={$mapDarkMode} on:change={toggleMapDarkMode}>
            <span>🗺️ რუკის მუქი თემა</span>
          </label>
        </div>
        <div class="setting-option">
          <button class="refresh-button-large" on:click={handleRefresh}>
            🔄 განაახლე მარკერები
          </button>
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
    font-family: 'BPG Square Banner 2013', Arial, sans-serif;
    height: 100vh;
  }
  
  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .setting-option {
    padding: 10px 0;
  }
  
  .setting-option label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: #f0f0f0;
  }
  
  /* Popup styles */
  :global(.maplibregl-popup-content) {
    background-color: #363b42 !important;
    color: #f0f0f0 !important;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  :global(.maplibregl-popup-close-button) {
    color: #f0f0f0 !important;
  }
  
  :global(.maplibregl-popup-tip) {
    border-top-color: #363b42 !important;
  }
  
  /* Custom styling for inputs and checkboxes */
  :global(input[type="checkbox"]) {
    accent-color: #61dafb;
    width: 16px;
    height: 16px;
  }
  
  :global(.sidebar-pane a) {
    color: #61dafb;
    text-decoration: none;
  }
  
  :global(.sidebar-pane a:hover) {
    text-decoration: underline;
  }
  
  /* Darken the modal for map markers */
  :global(.marker-popup) {
    color: #f0f0f0;
  }
  
  :global(.marker-popup h3) {
    color: #f0f0f0;
    margin-top: 0;
  }
  
  :global(.marker-popup p) {
    color: #bbb;
  }
  
  :global(.marker-popup a) {
    display: inline-block;
    margin-top: 8px;
    padding: 6px 12px;
    background-color: #4a515a;
    color: #f0f0f0;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  
  :global(.marker-popup a:hover) {
    background-color: #5a6270;
  }
  
  /* Make sure marker emojis are visible */
  :global(.marker) {
    filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5));
  }
  
  .refresh-button-large {
    background-color: #363b42;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 10px 16px;
    color: #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .refresh-button-large:hover {
    background-color: #4a515a;
  }
</style>

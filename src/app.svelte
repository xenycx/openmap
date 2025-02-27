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
  import './app.css';
  
  // Sidebar state
  let sidebarCollapsed = false; // Default to collapsed
  let activeTab = 'markers';
  let markersComponent: MapLocationMarkers;
  let showMarkers = true;
  let mapStyle = "https://tiles.openfreemap.org/styles/liberty";
  const darkMapStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  let showFormPopup = false;
  
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
  
  // Toggle form popup
  function handleToggleForm() {
    showFormPopup = !showFormPopup;
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
                  <span class="marker-title">
                    {#if marker.emojiType}
                      <span class="marker-emoji">{marker.emojiType}</span>
                    {:else}
                      <span class="marker-emoji">📍</span>
                    {/if}
                    {marker.name}
                  </span>
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
      </SidebarPane>
      
      <SidebarPane id="about" active={activeTab === 'about'}>
        <h2>ინფორმაცია</h2>
        <p>საიდბარის ინსპირაცია აღებულია <b>sidebar-v2-დან</b>, იმპლემენტირებული <b>Svelte</b>-ში.</p>
        <p>მარკერები იტვირთება Google Sheets-დან.</p>
      </SidebarPane>
    </svelte:fragment>
  </Sidebar>
</div>

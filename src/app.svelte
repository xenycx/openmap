<script lang="ts">
  import { MapLibre } from "svelte-maplibre";
  import { middleOfUSA } from "./lib/constants";
  import YouAreHere from "./components/you-are-here.svelte";
  import Sidebar from "./components/sidebar.svelte";
  import SidebarTab from "./components/sidebar-tab.svelte";
  import SidebarPane from "./components/sidebar-pane.svelte";
  
  // Sidebar state
  let sidebarCollapsed = false;
  let activeTab = 'home';

  // Handle tab clicks
  function handleTabClick(tabId: string) {
    activeTab = tabId;
    sidebarCollapsed = false;
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
  <link rel="stylesheet" href="/node_modules/bpg-square-banner-2013/css/bpg-square-banner-2013.min.css">
</svelte:head>

<div class="map-container">
  <MapLibre
    center={middleOfUSA}
    zoom={2}
    style="https://tiles.openfreemap.org/styles/liberty"
  >
    <YouAreHere />
  </MapLibre>

  <Sidebar position="left" bind:collapsed={sidebarCollapsed}>
    <svelte:fragment slot="tabs">
      <SidebarTab id="home" icon="fa-home" active={activeTab === 'home'} 
        on:click={() => handleTabClick('home')} />
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
      
      <SidebarPane id="info" active={activeTab === 'info'}>
        <h2>რუკის ინფორმაცია</h2>
        <p>რუკა აჩვენებს გეორგაფიულ ინფორმაციას საიდბარიში.</p>
        <p>აქ სხვა ელემენტების დამატება შეიძლება</p>
      </SidebarPane>
      
      <SidebarPane id="settings" active={activeTab === 'settings'}>
        <h2>პარამეტრები</h2>
        <p>პარამეტრების შეცვლა.</p>
        <div>
          <label>
            <input type="checkbox"> მარკერების ჩვენება
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox"> მუქი თემა
          </label>
        </div>
      </SidebarPane>
      
      <SidebarPane id="about" active={activeTab === 'about'}>
        <h2>ინფორმაცია</h2>
        <p>საიდბარის ინსპირაცია აღებულია <b>sidebar-v2-დან</b>, იმპლემენტირებული <b>Svelte</b>-ში.</p>
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
</style>

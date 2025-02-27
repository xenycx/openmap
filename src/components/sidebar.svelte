<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { sidebarDarkMode } from '../lib/theme-store';
  
  export let position: 'left' | 'right' = 'left';
  export let collapsed: boolean = false;
  export let title: string = '';
  
  const dispatch = createEventDispatcher();
  
  function toggle() {
    collapsed = !collapsed;
    dispatch('toggle', { collapsed });
  }

  // To dispatch form popup toggle event
  function toggleFormPopup() {
    dispatch('toggleForm');
  }
</script>

<div class={`sidebar sidebar-${position} ${collapsed ? 'collapsed' : ''} ${$sidebarDarkMode ? 'dark-mode' : ''}`}>
  <div class="sidebar-tabs">
    <ul role="tablist" class="sidebar-main-tabs">
      <slot name="tabs"></slot>
    </ul>
    <ul role="tablist" class="sidebar-bottom-tabs">
      <li class="sidebar-form-button" title="დაამატე ლოკაცია">
        <button type="button" on:click={toggleFormPopup} class="sidebar-button">
          <i class="fas fa-pen-to-square"></i>
        </button>
      </li>
      <slot name="bottom-tabs"></slot>
      <li class="sidebar-toggle" title={collapsed ? "გახსენი საიდბარი" : "დამალე საიდბარი"}>
        <button type="button" on:click={toggle} class="sidebar-button">
          <i class={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </li>
    </ul>
  </div>
  
  <div class="sidebar-content">
    {#if title}
      <div class="sidebar-header">
        <h1 class="sidebar-title">{title}</h1>
        <button class="sidebar-close" on:click={toggle}>×</button>
      </div>
    {/if}
    <div class="sidebar-panes">
      <slot name="content"></slot>
    </div>
  </div>
</div>

<style>
  .sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow: hidden;
    z-index: 2000;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
    background-color: rgba(255, 255, 255, 0.95);
    transition: width 500ms, transform 500ms;
    width: calc(100% - 40px);
    max-width: 400px;
  }

  .sidebar.collapsed {
    width: 40px;
  }

  .sidebar-tabs {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    -webkit-overflow-scrolling: touch;
  }

  .sidebar-main-tabs {
    margin: 0;
    padding: 0;
    list-style: none;
    flex-grow: 1;
  }

  .sidebar-bottom-tabs {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 8px;
  }

  /* Button styles */
  .sidebar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: #333;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .sidebar-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .dark-mode .sidebar-button {
    color: #f0f0f0;
  }

  .dark-mode .sidebar-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* Form button and toggle button specific styles */
  .sidebar-form-button .sidebar-button,
  .sidebar-toggle .sidebar-button {
    width: 40px;
    height: 40px;
  }

  .sidebar-form-button,
  .sidebar-toggle {
    display: flex;
    justify-content: center;
    margin: 4px 0;
  }

  /* Content area */
  .sidebar-content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40px;
    right: 0;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.95);
  }

  .sidebar.dark-mode .sidebar-content {
    background-color: rgba(40, 44, 52, 0.95);
  }

  .sidebar.collapsed .sidebar-content {
    display: none;
  }

  /* Dark mode styles */
  .sidebar.dark-mode {
    background-color: rgba(40, 44, 52, 0.95);
    color: #f0f0f0;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.85);
  }

  .sidebar.dark-mode .sidebar-tabs {
    background-color: rgba(0, 0, 0, 0.3);
  }

  /* Small screen optimizations */
  @media (max-height: 500px) {
    .sidebar-bottom-tabs {
      gap: 4px;
      padding-bottom: 4px;
    }

    .sidebar-button {
      height: 36px;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .sidebar-button {
      padding: 8px 0;
    }

    .sidebar-form-button,
    .sidebar-toggle {
      margin: 8px 0;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .sidebar-tabs {
      background-color: rgba(0, 0, 0, 0.15);
      width: 44px; /* Slightly wider for better touch targets */
    }
    
    .sidebar {
      width: calc(100% - 44px);
    }
    
    .sidebar.collapsed {
      width: 44px;
    }
    
    .sidebar-button {
      width: 44px;
      height: 44px;
      padding: 12px;
      font-size: 18px; /* Larger icons for mobile */
    }
    
    .sidebar-form-button .sidebar-button,
    .sidebar-toggle .sidebar-button {
      width: 44px;
      height: 44px;
    }
    
    .sidebar-content {
      left: 44px;
    }
  }

  /* Fix dark mode background issues */
  .sidebar.dark-mode {
    background-color: rgba(40, 44, 52, 0.95);
    color: #f0f0f0;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.85);
  }

  .sidebar.dark-mode .sidebar-tabs {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .sidebar.dark-mode .sidebar-content {
    background-color: rgba(40, 44, 52, 0.95);
  }

  /* Ensure buttons are always visible on mobile */
  @media (hover: none) and (pointer: coarse) {
    .sidebar-bottom-tabs {
      padding-bottom: 16px;
      gap: 12px;
    }
    
    .sidebar-form-button,
    .sidebar-toggle {
      margin: 4px 0;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .sidebar-button:active {
      background-color: rgba(0, 0, 0, 0.2);
    }
    
    .dark-mode .sidebar-button:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
</style>
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
</script>

<div class={`sidebar sidebar-${position} ${collapsed ? 'collapsed' : ''} ${$sidebarDarkMode ? 'dark-mode' : ''}`}>
  <div class="sidebar-tabs">
    <ul role="tablist">
      <slot name="tabs"></slot>
    </ul>
    <ul role="tablist" class="sidebar-bottom-tabs">
      <slot name="bottom-tabs"></slot>
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
  }
  
  /* Dark Mode Styles */
  .sidebar.dark-mode {
    background-color: rgba(40, 44, 52, 0.95);
    color: #f0f0f0;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.85);
  }
  
  .sidebar.dark-mode .sidebar-tabs {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .sidebar.dark-mode .sidebar-header {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  /* Rest of styles */
  @media (min-width: 768px) {
    .sidebar {
      width: 400px;
    }
  }
  .sidebar.collapsed {
    width: 40px;
  }
  .sidebar-left {
    left: 0;
  }
  .sidebar-right {
    right: 0;
  }
  .sidebar-tabs {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.05);
  }
  .sidebar-left .sidebar-tabs {
    left: 0;
  }
  .sidebar-right .sidebar-tabs {
    right: 0;
  }
  .sidebar-tabs ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  .sidebar-bottom-tabs {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .sidebar-content {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    overflow-x: hidden;
    overflow-y: auto;
  }
  
  /* Dark Mode for content */
  .sidebar.dark-mode .sidebar-content {
    background-color: rgba(40, 44, 52, 0.95);
  }
  
  .sidebar-left .sidebar-content {
    left: 40px;
    right: 0;
  }
  .sidebar-right .sidebar-content {
    left: 0;
    right: 40px;
  }
  .sidebar.collapsed .sidebar-content {
    display: none;
  }
  .sidebar-header {
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sidebar-title {
    margin: 0;
    font-size: 1.2em;
    font-weight: bold;
  }
  .sidebar-close {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Dark Mode for close button */
  .sidebar.dark-mode .sidebar-close {
    color: #f0f0f0;
  }
  
  .sidebar-panes {
    padding: 10px 20px;
  }
</style>
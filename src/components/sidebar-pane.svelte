<script lang="ts">
  import { sidebarDarkMode } from '../lib/theme-store';
  
  export let id: string;
  export let active: boolean = false;
</script>

<div id={id} class="sidebar-pane {active ? 'active' : ''} {$sidebarDarkMode ? 'dark-mode' : ''}">
  <slot></slot>
</div>

<style>
  .sidebar-pane {
    display: none;
    padding: 10px;
    overflow-y: auto;
    height: 100%;
    -ms-overflow-style: none;  /* Hide scrollbar for IE and Edge */
    scrollbar-width: none;  /* Hide scrollbar for Firefox */
  }

  .sidebar-pane::-webkit-scrollbar {
    display: none;  /* Hide scrollbar for Chrome, Safari and Opera */
  }

  .sidebar-pane.active {
    display: block;
  }
  
  .sidebar-pane.dark-mode {
    color: #f0f0f0;
  }
</style>
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
  }

  .sidebar-pane.active {
    display: block;
  }
  
  /* Dark mode styles */
  .sidebar-pane.dark-mode {
    color: #f0f0f0;
  }
</style>
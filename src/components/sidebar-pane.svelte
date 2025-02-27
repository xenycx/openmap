<script lang="ts">
  import { sidebarDarkMode } from '../lib/theme-store';
  
  export let id: string;
  export let active: boolean = false;
</script>

<div id={id} class="sidebar-pane {active ? 'active' : ''} {$sidebarDarkMode ? 'dark-mode' : ''} hideScroll">
  <slot></slot>
</div>

<style>
  .sidebar-pane {
    display: none;
    padding: 12px;
    overflow-y: scroll;
    height: 100%;
    box-sizing: border-box;
  }

  .sidebar-pane.active {
    display: block;
  }
  
  .sidebar-pane.dark-mode {
    color: #f0f0f0;
  }

  /* Hide scrollbar but keep functionality */
  .hideScroll::-webkit-scrollbar {
    display: none;
  }

  .hideScroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .sidebar-pane {
      padding: 8px;
    }
  }

  @media (max-height: 500px) {
    .sidebar-pane {
      padding: 8px;
    }
  }
</style>
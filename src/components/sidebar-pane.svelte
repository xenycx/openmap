<script lang="ts">
  export let id: string;
  export let active: boolean = false;
</script>

<div id={id} class="sidebar-pane {active ? 'active' : ''} hideScroll">
  <slot></slot>
</div>

<style>
  .sidebar-pane {
    display: none;
    padding: 8px;
    overflow-y: scroll;
    height: 100%;
    box-sizing: border-box;
    color: #f0f0f0;
    background-color: #282c33;
  }

  .sidebar-pane.active {
    display: block;
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
      padding: 6px;
    }
  }

  @media (max-height: 500px) {
    .sidebar-pane {
      padding: 6px;
    }
  }
</style>
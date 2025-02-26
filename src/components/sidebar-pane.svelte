<script lang="ts">
  export let id: string;
  export let active: boolean = false;
</script>

<div id={id} class="sidebar-pane {active ? 'active' : ''}">
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
</style>
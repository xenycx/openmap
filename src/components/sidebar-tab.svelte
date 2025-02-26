<script lang="ts">
  import { sidebarDarkMode } from '../lib/theme-store';
  
  export let id: string;
  export let icon: string;
  export let active: boolean = false;
</script>

<li class:active={active} class:dark-mode={$sidebarDarkMode}>
  <a href={`#${id}`} role="tab" on:click>
    <i class="fa {icon}"></i>
  </a>
</li>

<style>
  li {
    width: 100%;
    height: 40px;
    color: #333;
    font-size: 12pt;
    overflow: hidden;
    transition: all 80ms;
  }

  li:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.1);
  }

  li.active {
    color: #fff;
    background-color: #0074d9;
  }
  
  /* Dark mode styles */
  li.dark-mode {
    color: #d4d4d4;
  }

  li.dark-mode:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }

  li.dark-mode.active {
    color: #fff;
    background-color: #0074d9;
  }

  a {
    display: block;
    width: 100%;
    height: 100%;
    line-height: 40px;
    color: inherit;
    text-align: center;
    text-decoration: none;
  }
</style>
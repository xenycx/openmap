<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { sidebarDarkMode } from '../lib/theme-store';
  
  export let id: string;
  export let icon: string;
  export let active: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('click');
  }
</script>

<li class={active ? 'active' : ''} title={id}>
  <button type="button" 
    on:click={handleClick}
    class="tab-button {$sidebarDarkMode ? 'dark-mode' : ''}"
    aria-selected={active}
    role="tab"
  >
    <i class={`fas ${icon}`}></i>
  </button>
</li>

<style>
  li {
    width: 100%;
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .tab-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    color: #aaa;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
    position: relative;
  }

  .tab-button::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 24px;
    width: 3px;
    background: transparent;
    transition: background-color 0.3s;
  }

  .active .tab-button::after {
    background: #61dafb;
  }

  .tab-button:hover {
    color: #f0f0f0;
    background-color: #4a515a;
  }

  .tab-button.dark-mode {
    color: #aaa;
  }

  .tab-button.dark-mode:hover {
    color: #fff;
    background-color: #4a515a;
  }

  .active .tab-button {
    color: #61dafb;
  }

  .active .tab-button.dark-mode {
    color: #61dafb;
  }

  .active .tab-button.dark-mode::after {
    background: #61dafb;
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .tab-button {
      padding: 12px 0;
      height: 48px;
    }

    .tab-button::after {
      height: 32px;
    }

    li:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  /* Small screen optimizations */
  @media (max-height: 500px) {
    .tab-button {
      height: 36px;
    }

    .tab-button::after {
      height: 20px;
    }
  }
</style>
<script lang="ts">
  import { EMOJI_CATEGORIES } from "../lib/constants";
  import { activeCategories, searchQuery, clearFilters, filteredMarkers } from "../lib/filter-store";
  import { sidebarDarkMode } from "../lib/theme-store";
  import { fetchMarkers } from "../lib/markers-service";

  let categoriesContainer: HTMLDivElement;
  export let showMarkers = true;
  export let onMarkersToggle: () => void;
  export let onRefresh: () => void;

  // Function to toggle a category
  function toggleCategory(emoji: string) {
    activeCategories.update(categories => {
      if (categories.includes(emoji)) {
        return categories.filter(c => c !== emoji);
      } else {
        return [...categories, emoji];
      }
    });
  }
  
  // Update search query when the input changes
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery.set(target.value);
  }

  function handleScroll(direction: 'left' | 'right', event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (!categoriesContainer) return;

    const scrollAmount = categoriesContainer.offsetWidth * 0.75; // Scroll 75% of visible width
    const currentScroll = categoriesContainer.scrollLeft;
    
    // Calculate target scroll position
    const targetScroll = direction === 'left'
      ? Math.max(0, currentScroll - scrollAmount)
      : Math.min(
          categoriesContainer.scrollWidth - categoriesContainer.clientWidth,
          currentScroll + scrollAmount
        );

    // Smooth scroll to target position
    categoriesContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
</script>

<div class="category-filter {$sidebarDarkMode ? 'dark-mode' : ''}">
  <div class="controls-container">
    <button class="control-button" on:click={onMarkersToggle}>
      <i class="fas fa-map-marker-alt"></i>
      {showMarkers ? 'დამალე მარკერები' : 'აჩვენე მარკერები'}
    </button>
    <button class="control-button" on:click={onRefresh}>
      <i class="fas fa-sync-alt"></i>
      განაახლე მარკერები
    </button>
  </div>

  <div class="search-container">
    <div class="search-input-container">
      <input 
        type="text" 
        class="search-input" 
        placeholder="მოძებნე ლოკაცია..." 
        value={$searchQuery}
        on:input={handleSearchInput}
      />
      {#if $searchQuery}
        <button 
          class="clear-search" 
          on:click={() => searchQuery.set('')}
          title="გაასუფთავე ძებნა"
        >
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </div>
  </div>

  <div class="categories-scroll-container">
    <button 
      class="scroll-button left" 
      on:click={(e) => handleScroll('left', e)}
      aria-label="Scroll categories left"
    >
      <i class="fas fa-chevron-left"></i>
    </button>
    
    <div class="categories-row" bind:this={categoriesContainer}>
      {#if $activeCategories.length > 0}
        <button class="clear-filters" on:click={clearFilters}>
          <i class="fas fa-times-circle"></i> 
          გაასუფთავე
        </button>
      {/if}
      {#each EMOJI_CATEGORIES as category}
        <button 
          class="category-button-small {$activeCategories.includes(category.emoji) ? 'active' : ''}"
          on:click={() => toggleCategory(category.emoji)}
          title={category.description}
        >
          <span class="category-emoji">{category.emoji}</span>
          <span class="category-name">{category.description}</span>
        </button>
      {/each}
    </div>

    <button 
      class="scroll-button right" 
      on:click={(e) => handleScroll('right', e)}
      aria-label="Scroll categories right"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>

  <div class="results-container">
    <div class="results-header">
      {#if $filteredMarkers && $filteredMarkers.length > 0}
        <span>ნაპოვნია {$filteredMarkers.length} ლოკაცია</span>
      {:else}
        <span>ლოკაციები არ არის</span>
      {/if}
    </div>

    <ul class="markers-list">
      {#if $filteredMarkers && $filteredMarkers.length > 0}
        {#each $filteredMarkers as marker}
          <li class="marker-item">
            <div class="marker-header">
              <span class="marker-title">
                {#if marker.emojiType}
                  <span class="marker-emoji">{marker.emojiType}</span>
                {:else}
                  <span class="marker-emoji">📍</span>
                {/if}
                {marker.name}
              </span>
            </div>
            {#if marker.description}
              <p class="marker-description">{marker.description}</p>
            {/if}
            {#if marker.google_maps_link}
              <a href={marker.google_maps_link} target="_blank" rel="noopener noreferrer" class="popup-button marker-button">
                <i class="fas fa-map-marker-alt"></i>
                Google Maps
              </a>
            {/if}
          </li>
        {/each}
      {:else}
        <li class="marker-item no-markers">
          შედეგები არ მოიძებნა
        </li>
      {/if}
    </ul>
  </div>
</div>

<style>
  .category-filter {
    width: 100%;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .search-container {
    margin-bottom: 12px;
    padding: 0 16px;
  }
  
  .search-input-container {
    position: relative;
    width: 100%;
  }
  
  .search-input {
    width: 81%;
    padding: 10px 16px;
    padding-right: 40px;
    border-radius: 8px;
    border: 1px solid #444;
    font-size: 0.95rem;
    background-color: #363b42;
    color: #f0f0f0;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #61dafb;
    background-color: #363b42;
    box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
  }
  
  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    padding: 4px;
    border-radius: 50%;
  }
  
  .clear-search:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f0f0f0;
  }
  
  /* Horizontal scrolling categories */
  .categories-scroll-container {
    margin-bottom: 16px;
    padding: 0 16px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
  }

  .scroll-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px; /* Match category button height */
    width: 32px;
    background-color: #363b42;
    border: 1px solid #444;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    z-index: 1;
    position: relative;
  }

  .scroll-button.left {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    padding-left: 0;
    padding-right: 8px;
  }

  .scroll-button.right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    padding-right: 0;
    padding-left: 8px;
  }

  .scroll-button:hover {
    background-color: #4a515a;
    border-color: #61dafb;
  }

  .scroll-button i {
    font-size: 1rem;
    margin: 0 auto;
  }

  .categories-row {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
    flex: 1;
    align-items: center; /* Center categories vertically */
    padding: 0;
    overscroll-behavior-x: none; /* Prevent overscroll on touch devices */
    scroll-snap-type: x mandatory; /* Enable smooth snap scrolling */
  }
  
  .categories-row::-webkit-scrollbar {
    display: none;
  }
  
  .category-button-small {
    scroll-snap-align: start; /* Make buttons snap into place */
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 40px;
    padding: 0 12px;
    background-color: #363b42;
    border: 1px solid #444;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #f0f0f0;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .category-button-small:hover {
    background-color: #4a515a;
  }
  
  .category-button-small.active {
    background-color: #4a515a;
    border-color: #61dafb;
  }
  
  .category-emoji {
    font-size: 1rem;
  }
  
  .category-name {
    font-size: 0.8rem;
  }
  
  .clear-filters {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8rem;
    height: 40px;
    padding: 0 12px;
    background-color: #363b42;
    border: 1px solid #444;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #f0f0f0;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .clear-filters:hover {
    background-color: #4a515a;
  }
  
  /* Results section */
  .results-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
  }
  
  .results-header {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 12px;
  }
  
  .markers-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .marker-item {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #363b42;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .marker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .marker-title {
    font-weight: bold;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f0f0f0;
  }
  
  .marker-emoji {
    font-size: 1.2rem;
  }
  
  .marker-description {
    margin: 8px 0;
    font-size: 0.9rem;
    color: #bbb;
  }
  
  .marker-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background-color: #4a515a;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 8px;
    border: none;
    transition: background-color 0.2s;
  }
  
  .marker-button:hover {
    background-color: #5a6270;
  }
  
  .no-markers {
    text-align: center;
    color: #aaa;
    padding: 24px;
  }

  .controls-container {
    padding: 0 16px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #363b42;
    border: 1px solid #444;
    border-radius: 6px;
    color: #f0f0f0;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background-color: #4a515a;
  }
</style>
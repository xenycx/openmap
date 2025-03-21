<script lang="ts">
  import { EMOJI_CATEGORIES } from "../lib/constants";
  import { activeCategories, searchQuery, clearFilters, filteredMarkers } from "../lib/filter-store";
  import { sidebarDarkMode } from "../lib/theme-store";

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
</script>

<div class="category-filter {$sidebarDarkMode ? 'dark-mode' : ''}">
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
    <div class="categories-row">
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
  }
  
  .categories-row {
    display: flex;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 8px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
  
  .categories-row::-webkit-scrollbar {
    display: none;
  }
  
  .category-button-small {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 10px;
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
    padding: 6px 10px;
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
</style>
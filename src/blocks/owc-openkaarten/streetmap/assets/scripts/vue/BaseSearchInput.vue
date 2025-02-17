<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Zoeken...',
  },
  primaryColor: {
    type: String,
    required: true,
  },
  resultsCount: {
    type: Number,
    default: 0
  },
});

const emit = defineEmits(['search']);
const searchQuery = ref('');

const handleSubmit = (e) => {
  e.preventDefault();
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

const searchStatus = computed(() => {
  if (!searchQuery.value) return '';
  return `${props.resultsCount} resultaten gevonden voor "${searchQuery.value}"`;
});

</script>

<template>
  <search class="search-container">
    <form
      @submit="handleSubmit"
      class="search-form"
      :style="{ '--search-primary-color': primaryColor }"
    >
      <label class="sr-only" for="location-search">Zoek op straat en/of plaats of postcode</label>
      <div class="search-wrapper">
        <div
          role="status" 
          aria-live="polite" 
          aria-atomic="true" 
          class="sr-only"
        >
          <span>{{ searchStatus }}</span>
        </div>
        <input
          id="location-search"
          type="search"
          v-model="searchQuery"
          :placeholder="placeholder"
          class="search-input"
      />

      <button
          v-if="searchQuery"
          type="button"
          class="search-clear"
          @click="clearSearch"
          aria-label="Zoekopdracht wissen"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" />
        </svg>
      </button>

      <button
          type="submit"
          class="search-submit"
          :disabled="!searchQuery"
          aria-label="Zoeken"
      >
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
        </svg>
      </button>
      </div>
    </form>
  </search>
</template>

<style lang="scss" scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.search-container {
  display: block;
  flex-grow: 1;
  margin-inline-end: 1.5rem;
}

.search-form {
  position: relative;
  width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-inline-end: 5rem; // Space for both buttons
  border: 1px solid #7a7a7a;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: 2px solid var(--search-primary-color);
    outline-offset: 2px;
  }

  input[type="search"]::-ms-clear {
    display: none;
    width: 0;
    height: 0;
  }

  &::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }

  /* clears the 'X' in searchbar from Chrome */
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
}

.search-clear,
.search-submit {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;

  &:focus-visible {
    outline: 2px solid var(--search-primary-color);
    outline-offset: 2px;
  }
}

.search-clear {
  inset-inline-end: 2.5rem;
}

.search-submit {
  inset-inline-end: 0.25rem;
  color: white;
  background-color: var(--search-primary-color);
  border-radius: 4px;

  &:where(:hover, :focus-visible) {
    opacity: 0.8;
  }
}
</style>
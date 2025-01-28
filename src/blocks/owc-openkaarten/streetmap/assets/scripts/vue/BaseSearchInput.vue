<script setup>
import { ref } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Zoeken...',
  },
  primaryColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['search']);
const searchQuery = ref('');

const handleSubmit = (e) => {
  e.preventDefault();
  emit('search', searchQuery.value);
};

const handleInput = () => {
  if (!searchQuery.value) {
    emit('search', ''); // Clear search when input is empty
  }
};
</script>

<template>
  <form 
    @submit="handleSubmit" 
    class="search-input"
    :style="{ '--search-primary-color': primaryColor }"
  >
    <input
      type="search"
      v-model="searchQuery"
      :placeholder="placeholder"
      @input="handleInput"
      class="search-input__field"
    />
    <button 
      type="submit" 
      class="search-input__button"
      :disabled="!searchQuery"
    >
      <span class="sr-only">Zoeken</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
      </svg>
    </button>
  </form>
</template>

<style lang="scss" scoped>
.search-input {
    position: relative;
    flex-grow: 1;
    margin-inline-end: 1.5rem;

  &__field {
    block-size: 100%;
    inline-size: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #7a7a7a;
    border-radius: 4px;
    font-size: 1rem;
  }

  &__button {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    inset-block: 4px;
    inset-inline-end: 4px;
    min-block-size: auto;
    padding: 0.75rem;
    background-color: var(--search-primary-color);
    border: none;
    border-radius: 4px;
    color: white;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }

    &:focus-visible {
      outline: 2px solid var(--search-primary-color);
      outline-offset: 2px;
    }
  }
}
</style> 
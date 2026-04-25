<script lang="ts" setup>
const searchValue = ref('')

const emit = defineEmits<{
  (e: 'search', searchValue: string): void
}>()
</script>

<template>
  <div class="searchbar">
    <input
      v-model="searchValue"
      class="searchbar__input"
      placeholder="Type here to search..."
      type="text"
      @enter="emit('search', searchValue)"/>
  </div>
</template>

<style lang="scss" scoped>
.searchbar {
  &__input {
    background-color: $black-color-lighter;
    border: 2px solid $black-color-lightest;
    border-radius: 5px;
    height: 32px;
    padding: 6px;
    transition: all 0.3s ease;
    width: 120px;

    &:focus-visible {
      border: 2px solid $gold-color;
      box-shadow: 0 6px 5px clr($gold-color, 0.12), 0 22px 18px clr($gold-color, 0.18), 0 100px 80px clr($gold-color, 0.03);
      outline: none;
    }

    @include media-query("tablet") {
      width: 220px;
    }
  }
}
</style>
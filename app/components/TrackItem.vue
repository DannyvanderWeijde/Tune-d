<template>
  <NuxtLink :to="`/track/${track.id}`">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
  defineProps({
    track: {
      type: Object,
      required: true
    }
  })
</script>

<style scoped>

</style>
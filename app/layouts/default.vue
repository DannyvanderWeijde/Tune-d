<script lang="ts" setup>

</script>

<template>
  <nav class="nav">
    <AppSearchbar/>
    <NuxtLink to="/">Home</NuxtLink>
  </nav>

  <main class="main">
    <slot/>
  </main>
</template>

<style lang="scss" scoped>
.nav {
  padding: 10px 16px;
}
</style>
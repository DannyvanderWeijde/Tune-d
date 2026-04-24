<template>
  <nav class="nav-bar">
    <ul class="nav-bar__links">
      <li class="nav-bar__link"><NuxtLink to="/">Home</NuxtLink></li>
      <li class="nav-bar__link">
        <NuxtLink to="/user/top-100/user-1" class="nav-bar__link">
          View Full Top 100 List →
        </NuxtLink>
      </li>
      <li class="nav-bar__link">
        <NuxtLink to="/user/scored-tracks/user-1" class="btn secondary">
          Scored Tracks
        </NuxtLink>
      </li>
    </ul>

    <SearchBar class="nav-bar__search" />
  </nav>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
  .nav-bar {
    align-items: center;
    display: flex;
    flex: 0 0 60px;
    gap: 16px;
    z-index: 1;
  }
</style>
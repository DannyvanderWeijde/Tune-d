<template>
  <section class="layout">
    <side-bar />
    <div class="layout__content">
      <nav-bar />
      <main class="layout__main">
        <slot />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
  import NavBar from '~/components/NavBar.vue'
  import SideBar from '~/components/SideBar.vue'
</script>

<style lang="scss" scoped>
  .layout {
    display: flex;
    height: 100%;

    &__content {
      flex: 1 1 auto;
      display: flex;
      height: 100%;
      flex-direction: column;
    }

    &__main {
      flex: 1 1 auto;
    }
  }
</style>
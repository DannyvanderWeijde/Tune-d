<template>
  <section class="search-bar">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="What do you want to listen to?"
      class="search-bar__input"
    >

    <div v-if="searchResults" class="search-bar__results">
      <div>
        <h2 class="search-bar__title">Artist</h2>
        <NuxtLink
          :key="artist.id"
          class="search-bar__link"
          :to="`/artist/${artist.id}`"
          @click="searchQuery = ''"
        >
          <img
            v-if="artist.images?.[2]?.url"
            :src="artist.images[2].url"
            class="search-bar__image --artist"
            alt="artist image"
          >
          <span class="search-bar__name --artist">{{ artist.name }}</span>
        </NuxtLink>
      </div>

      <div>
        <h2 class="search-bar__title">Album</h2>
        <NuxtLink
          :key="album.id"
          class="search-bar__link"
          :to="`/album/${album.id}`"
          @click="searchQuery = ''"
        >
          <img
            v-if="album.images?.[2]?.url"
            :src="album.images[2].url"
            class="search-bar__image"
            alt="album image"
          >
          <span class="search-bar__name">{{ album.name }}</span>
        </NuxtLink>
      </div>

      <div>
        <h2 class="search-bar__title">Tracks</h2>
        <ul class="search-bar__list">
          <li
            v-for="track in searchResults.tracks.items"
            :key="track.id"
          >
            <TrackItem
              :key="track.id"
              class="search-bar__link"
              :track="track"
              @click="searchQuery = ''"
            >
              <img
                v-if="track.album.images?.[2]?.url"
                :src="track.album.images[2].url"
                class="search-bar__image"
                alt="track image"
              >
              <span class="search-bar__name">{{ track.name }}</span>
            </TrackItem>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import TrackItem from '~/components/TrackItem.vue'
  import { debounce } from '~/utils/debounce'
  import type { SearchResponse } from '~/types/spotify'

  const searchQuery = ref('')
  const debouncedQuery = ref('')

  const { data: searchResults, pending, refresh } = await useFetch<SearchResponse>('/api/spotify/search', {
    query: { value: debouncedQuery },
    immediate: false,
  })

  const updateDebouncedQuery = debounce((value: string) => {
    searchResults.value = undefined

    if (value && value.trim() !== '') {
      debouncedQuery.value = value
      refresh()
    }
  }, 500)

  watch(searchQuery, (newVal) => {
    updateDebouncedQuery(newVal)
  })

  const artist = computed(() => {
    return searchResults.value?.artists?.items[0]
  })

  const album = computed(() => {
    return searchResults.value?.albums?.items[0]
  })
</script>

<style lang="scss" scoped>
  .search-bar {
    position: relative;

    &__results {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 48px;
      position: absolute;
      top: 100%;
      left: 0;
      width: 50vw;
      max-width: 600px;
      background: var(--color-1-base);
      max-height: 50vh;
      overflow: auto;
    }

    &__container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &__link {
      align-items: center;
      display: flex;
      gap: 16px;
    }

    &__image {
      width: 64px;
      height: 64px;
    }

    &__title {
      color: #fff;
      margin-bottom: 12px;
    }
  }
</style>
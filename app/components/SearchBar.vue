<template>
  <div>
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="What do you want to listen to?"
        class="search-bar"
      >
      <div v-if="pending" class="spinner">Loading...</div>
    </div>

    <div v-if="searchResults" class="results-grid">

      <div v-if="searchResults.artists?.items?.length" class="artists-section">
        <h2>Artists</h2>
        <ul>
          <NuxtLink
            v-for="artist in searchResults.artists.items"
            :key="artist.id"
            :to="`/artist/${artist.id}`"
          >
            <li class="artist-item">
              <img
                v-if="artist.images?.[2]?.url"
                :src="artist.images[2].url"
                class="tiny-cover"
                alt="artist image"
              >
              <div class="artist-details">
                <span class="artist-name">{{ artist.name }}</span>
              </div>
            </li>
          </NuxtLink>
        </ul>
      </div>

      <div v-if="searchResults.albums?.items?.length" class="albums-section">
        <h2>Albums</h2>
        <ul>
          <NuxtLink
            v-for="album in searchResults.albums.items"
            :key="album.id"
            :to="`/album/${album.id}`"
          >
            <li class="album-item">
              <img
                v-if="album.images?.[2]?.url"
                :src="album.images[2].url"
                class="tiny-cover"
                alt="album image"
              >
              <div class="album-details">
                <span class="album-title">{{ album.name }}</span>
                <span class="album-artist">{{ album.artists[0]?.name }}</span>
              </div>
            </li>
          </NuxtLink>
        </ul>
      </div>

      <div v-if="searchResults.tracks?.items?.length" class="songs-section">
        <h2>Tracks</h2>
        <ul>
          <TrackItem
            v-for="track in searchResults.tracks.items"
            :key="track.id"
            :track="track"
          >
            <li class="song-item">
              <img
                v-if="track.album?.images?.[2]?.url"
                :src="track.album.images[2].url"
                class="tiny-cover"
                alt="track image"
              >
              <div class="song-details">
                <span class="song-title">{{ track.name }}</span>
                <span> - </span>
                <span class="song-artist">{{ track.artists[0]?.name }}</span>
                <span> - </span>
                <span class="song-length">
                  {{ new Date(track.duration_ms).toISOString().slice(14, 19) }}
                </span>
              </div>
            </li>
          </TrackItem>
        </ul>
      </div>
    </div>
  </div>
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
</script>

<style scoped>
/* Your existing styles work great */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}
.tiny-cover {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  object-fit: cover;
  border-radius: 4px;
}
.song-item, .artist-item, .album-item {
  display: flex;
  align-items: center;
  padding: 8px;
  list-style: none;
  cursor: pointer;
  border-radius: 4px;
}
.song-item:hover, .artist-item:hover, .album-item:hover {
  background: #2a2a2a;
}
.spinner {
  margin-top: 10px;
  color: #1db954;
  font-size: 0.9rem;
}
a { text-decoration: none; color: inherit; }
</style>
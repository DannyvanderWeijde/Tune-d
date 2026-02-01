<template>
  <div class="page-container">
    <div v-if="status === 'pending'" class="loading-state">
      <span class="spinner">Loading Artist...</span>
    </div>

    <div v-else-if="data" class="artist-content">

      <div class="header">
        <img
          :src="data.artist.images[0]?.url || '/placeholder.png'"
          class="artist-img"
          alt="artist image"
        >
        <div class="artist-info">
          <h1 class="artist-name">{{ data.artist.name }}</h1>
          <p class="followers">
            {{ data.artist.followers.total.toLocaleString() }} Followers
          </p>
          <div class="genres">
            <span v-for="g in data.artist.genres" :key="g" class="tag">
              {{ g }}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Popular</h2>
        <div class="track-list">
          <TrackItem
            v-for="(track, index) in data.topTracks.tracks.slice(0, 5)"
            :key="track.id"
            :track="track"
          >
            <div class="track-row">
              <span class="track-index">{{ index + 1 }}</span>
              <img
                :src="track.album?.images[2]?.url"
                class="tiny-cover"
                alt="album image"
              >
              <div class="track-info">
                <span class="track-title">{{ track.name }}</span>
                <span class="track-meta">
                  {{ track.album.name }} </span>
              </div>
              <span class="track-time">
                {{ formatDuration(track.duration_ms) }}
              </span>
            </div>
          </TrackItem>
        </div>
      </div>

      <hr class="divider">

      <div class="section">
        <div class="discography-header">
          <h2 class="section-title">Discography</h2>
          <button
            v-if="!allTracks"
            class="load-btn"
            :disabled="isLoadingTracks"
            @click="loadAll"
          >
            {{ isLoadingTracks ? 'Loading...' : 'Show All Tracks' }}
          </button>
        </div>

        <div v-if="allTracks" class="track-list">
          <TrackItem
            v-for="track in allTracks"
            :key="track.id"
            :track="track"
          >
            <div class="track-row">
              <img
                :src="track.album?.images[2]?.url"
                class="tiny-cover"
                alt="album image"
              >
              <div class="track-info">
                <span class="track-title">{{ track.name }}</span>
                <span class="track-meta">
                  {{ track.album.release_date?.split('-')[0] }} • {{ track.album.name }}
                </span>
              </div>
              <span class="track-time">
                {{ formatDuration(track.duration_ms) }}
              </span>
            </div>
          </TrackItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrackItem from '~/components/TrackItem.vue'
import { formatDuration } from '~/utils/format'
import type { ArtistPageResponse, TrackItem as TrackType } from '~/types/spotify'

const route = useRoute()

// 1. Initial Data (Artist Profile + Top 5 Tracks)
const { data, status } = await useFetch<ArtistPageResponse>('/api/spotify/artist', {
  query: { id: route.params.id }
})

// 2. Lazy Data (Discography)
// We type this as TrackType[] so we get autocomplete
const allTracks = ref<TrackType[] | null>(null)
const isLoadingTracks = ref(false)

const loadAll = async () => {
  isLoadingTracks.value = true
  try {
    allTracks.value = await $fetch<TrackType[]>('/api/spotify/artist-tracks', {
      query: { id: route.params.id }
    })
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingTracks.value = false
  }
}
</script>

<style scoped>
/* LAYOUT */
.page-container {
  padding: 40px 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.loading-state {
  display: flex;
  justify-content: center;
  padding-top: 100px;
  color: #1db954;
}

/* HEADER */
.header {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: 48px;
}
.artist-img {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}
.artist-name {
  font-size: 4.5rem; /* Massive, Spotify-style title */
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1;
}
.followers {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 16px;
}
.genres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  text-transform: capitalize;
  border: 1px solid rgba(255,255,255,0.05);
}

/* SECTIONS */
.section { margin-bottom: 40px; }
.section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 20px; }
.divider { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 40px 0; }

/* TRACK ROWS (Replaces song-item) */
.track-list { display: flex; flex-direction: column; }

.track-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  gap: 16px;
  transition: background 0.2s;
}
.track-row:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.tiny-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.track-index {
  color: #b3b3b3;
  width: 20px;
  text-align: center;
}
.track-info {
  display: flex;
  flex-direction: column;
  flex: 1; /* Pushes time to the right */
}
.track-title { font-size: 1rem; color: white; }
.track-meta { font-size: 0.85rem; color: #b3b3b3; }
.track-time { font-size: 0.9rem; color: #b3b3b3; font-variant-numeric: tabular-nums; }

/* BUTTONS */
.discography-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.load-btn {
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.load-btn:hover:not(:disabled) {
  border-color: white;
  transform: scale(1.05);
}
</style>
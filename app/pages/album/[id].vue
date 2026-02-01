<template>
  <div v-if="album" class="page-container">
    <div class="album-header">
      <img :src="album.images[0]?.url" class="cover-image" alt="album cover">
      <div class="header-info">
        <h4 class="label">Album</h4>
        <h1 class="title">{{ album.name }}</h1>
        <div class="meta">
          <img
            v-if="album.artists[0].images?.[0]?.url"
            :src="album.artists[0].images[0].url"
            class="artist-avatar"
            alt="artist avatar"
          >
          <span class="bold">{{ album.artists?.[0].name }}</span>
          <span class="dot">•</span>
          <span>{{ album.release_date.split('-')[0] }}</span>
          <span class="dot">•</span>
          <span>{{ album.total_tracks }} songs</span>
        </div>
      </div>
    </div>

    <div class="tracklist">
      <div class="track-row header">
        <div class="col-num">#</div>
        <div class="col-title">Title</div>
        <div class="col-clock">Wait</div> </div>

      <TrackItem
        v-for="(track, index) in album.tracks.items"
        :key="track.id"
        :track="track"
      >
        <div class="track-row item">
          <div class="col-num">{{ index + 1 }}</div>

          <div class="col-info">
            <span class="track-name">{{ track.name }}</span>
            <span class="track-artist">{{ track.artists.map(a => a.name).join(', ') }}</span>
          </div>

          <div class="col-clock">
            {{ formatDuration(track.duration_ms) }}
          </div>
        </div>
      </TrackItem>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TrackItem from '~/components/TrackItem.vue'
  import { formatDuration } from '~/utils/format'
  import type { AlbumDetails } from '~/types/spotify'

  const route = useRoute()

  const { data: album } = await useFetch<AlbumDetails>('/api/spotify/album', {
    query: { id: route.params.id }
  })
</script>

<style scoped>
/* PAGE LAYOUT */
.page-container {
  padding-top: 20px;
}

/* HEADER STYLE */
.album-header {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 32px;
}
.cover-image {
  width: 232px;
  height: 232px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
  object-fit: cover;
}
.label {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.title {
  font-size: 3rem; /* Big bold title */
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1;
}
.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #b3b3b3;
}
.artist-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}
.bold { color: white; font-weight: 700; }
.dot { font-size: 0.5rem; }

/* GRID LAYOUT (Replaces Table) */
.tracklist {
  display: flex;
  flex-direction: column;
}

/* The Grid Definition */
.track-row {
  display: grid;
  /* Columns: Number | Title (Expand) | Time */
  grid-template-columns: 40px 1fr 60px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  color: #b3b3b3;
}

/* Row Styling */
.track-row.header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}
.track-row.item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Column Specifics */
.col-num { text-align: center; font-size: 1rem; }
.col-clock { text-align: right; font-variant-numeric: tabular-nums; }
.col-info { display: flex; flex-direction: column; justify-content: center; }

.track-name { font-size: 1rem; color: white; margin-bottom: 2px; }
.track-artist { font-size: 0.85rem; color: #b3b3b3; }

/* Interaction */
.track-row.item:hover .track-artist { color: white; }
</style>
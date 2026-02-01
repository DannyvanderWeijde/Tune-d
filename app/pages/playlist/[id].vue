<template>
  <div class="page-container">
    <div v-if="status === 'pending'" class="loading-state">
      Loading playlist...
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Error loading playlist</h2>
      <p>{{ error.message }}</p>
    </div>

    <div v-else-if="playlist" class="content">

      <div class="playlist-header">
        <img
          :src="playlist.images?.[0]?.url || '/placeholder.png'"
          class="cover-image"
          alt="playlist cover"
        >
        <div class="header-info">
          <h4 class="label">Playlist</h4>
          <h1 class="title">{{ playlist.name }}</h1>
          <p v-if="playlist.description" class="description">
            {{ playlist.description }}
          </p>

          <div class="meta">
            <span class="bold">{{ playlist.owner.display_name }}</span>
            <span class="dot">•</span>
            <span>{{ playlist.followers.total.toLocaleString() }} likes</span>
            <span class="dot">•</span>
            <span>{{ playlist.tracks.total }} songs</span>
          </div>
        </div>
      </div>

      <div class="tracklist">
        <div class="track-row header">
          <div class="col-num">#</div>
          <div class="col-title">Title</div>
          <div class="col-album">Album</div>
          <div class="col-date">Date Added</div>
          <div class="col-clock">Wait</div>
        </div>

        <TrackItem
          v-for="(item, index) in playlist.tracks.items"
          :key="item.track.id"
          :track="item.track"
        >
          <div class="track-row item">
            <div class="col-num">{{ index + 1 }}</div>

            <div class="col-info">
              <span class="track-name">{{ item.track.name }}</span>
              <span class="track-artist">
                {{ item.track.artists.map(a => a.name).join(', ') }}
              </span>
            </div>

            <div class="col-album">
              {{ item.track.album.name }}
            </div>

            <div class="col-date">
              {{ new Date(item.added_at).toLocaleDateString() }}
            </div>

            <div class="col-clock">
              {{ formatDuration(item.track.duration_ms) }}
            </div>
          </div>
        </TrackItem>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TrackItem from '~/components/TrackItem.vue'
  import { formatDuration } from '~/utils/format'
  import type { PlaylistDetails } from '~/types/spotify'

  const route = useRoute()

  // 1. Fetch Playlist Data
  const { data: playlist, status, error } = await useFetch<PlaylistDetails>('/api/spotify/playlist', {
    query: { id: route.params.id }
  })
</script>

<style scoped>
/* PAGE LAYOUT */
.page-container {
  padding: 30px;
  max-width: 1200px; /* Playlists have more columns, so we allow more width */
  margin: 0 auto;
}
.loading-state, .error-state {
  text-align: center;
  padding: 50px;
  color: #b3b3b3;
}
.error-state { color: #ff5555; }

/* HEADER */
.playlist-header {
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
.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  margin: 0;
}
.title {
  font-size: 3rem; /* Big Title */
  font-weight: 900;
  margin: 8px 0;
  line-height: 1;
}
.description {
  color: #b3b3b3;
  font-size: 0.9rem;
  margin: 0;
  max-width: 600px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #b3b3b3;
  margin-top: 8px;
}
.bold { color: white; font-weight: 700; }
.dot { font-size: 0.5rem; }

/* GRID LAYOUT - 5 Columns for Playlist */
.tracklist {
  display: flex;
  flex-direction: column;
}

.track-row {
  display: grid;
  /* Columns: # | Title (Flexible) | Album (Flexible) | Date | Time */
  grid-template-columns: 40px 4fr 3fr 120px 60px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  gap: 16px;
  color: #b3b3b3;
}

/* Headers */
.track-row.header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

/* Rows */
.track-row.item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Column Text Styles */
.col-num { text-align: center; font-size: 1rem; }
.col-clock { text-align: right; font-variant-numeric: tabular-nums; }
.col-info { display: flex; flex-direction: column; overflow: hidden; }
.col-album, .col-date {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-name { font-size: 1rem; color: white; margin-bottom: 2px; }
.track-artist { font-size: 0.85rem; color: #b3b3b3; }
.track-row.item:hover .track-artist { color: white; }

/* Responsive Tweak: Hide Date added on smaller screens if needed */
@media (max-width: 768px) {
  .track-row {
    grid-template-columns: 40px 1fr 60px; /* Hide Album/Date */
  }
  .col-album, .col-date { display: none; }
}
</style>
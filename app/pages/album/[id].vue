<template>
  <div v-if="album" class="page-container">
    <div class="album-header">
      <img :src="album.images[0]?.url" class="cover-image" alt="album cover">
      <div class="header-info">
        <h4 class="label">Album</h4>
        <h1 class="title">{{ album.name }}</h1>
        <div class="meta">
          <div class="meta-row">
            <img v-if="album.artists[0].images?.[0]?.url" :src="album.artists[0].images[0].url" class="artist-avatar" alt="artist avatar">
            <div v-else class="artist-avatar-placeholder"></div>
            <span class="bold">{{ album.artists?.[0].name }}</span>
            <span class="dot">•</span>
            <span>{{ album.release_date.split('-')[0] }}</span>
            <span class="dot">•</span>
            <span>{{ album.total_tracks }} songs</span>
          </div>
          <div class="stats-row" v-if="album.albumStats">
            <div class="album-score-badge" :class="getScoreColor(album.albumStats.score)">
              <span class="score-label">Album Score</span>
              <span class="score-val">{{ (album.albumStats.score / 10).toFixed(1) }}</span>
            </div>
            <div class="completion-badge">
              <span class="score-label">Rated</span>
              <span class="score-val">{{ album.albumStats.count }} / {{ album.total_tracks }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tracklist">
      <div class="track-row header">
        <div class="col-num">#</div>
        <div class="col-title">Title</div>
        <div class="col-score">Score</div>
        <div class="col-clock">Time</div>
      </div>

      <div
        v-for="(track, index) in album.tracks.items"
        :key="track.id"
        class="track-row item"
      >
        <div class="col-num">{{ index + 1 }}</div>

        <div class="col-info">
          <NuxtLink :to="`/track/${track.id}`" class="track-name-link">
            {{ track.name }}
          </NuxtLink>

          <div class="track-artist-row">
            <template v-for="(artist, i) in track.artists" :key="artist.id">
              <NuxtLink
                :to="`/artist/${artist.id}`"
                class="artist-link"
                @click.stop
              >
                {{ artist.name }}
              </NuxtLink>
              <span v-if="i < track.artists.length - 1">, </span>
            </template>
          </div>
        </div>

        <div class="col-score">
          <span v-if="track.myScore !== null" class="track-score-badge" :class="getScoreColor(track.myScore)">
            {{ (track.myScore / 10).toFixed(1) }}
          </span>
          <span v-else class="empty-score">-</span>
        </div>

        <div class="col-clock">
          {{ formatDuration(track.duration_ms) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDuration } from '~/utils/format'
const route = useRoute()

const { data: album } = await useFetch<any>('/api/spotify/album', {
  query: { id: route.params.id }
})

function getScoreColor(val: number) {
  if (val >= 90) return 'score-green'
  if (val >= 70) return 'score-yellow'
  if (val >= 50) return 'score-orange'
  return 'score-red'
}
</script>

<style scoped>
/* ... (Keep your existing Header Styles) ... */
.page-container { padding-top: 20px; color: white; max-width: 1200px; margin: 0 auto; }
.album-header { display: flex; align-items: flex-end; gap: 24px; margin-bottom: 32px; }
.cover-image { width: 232px; height: 232px; box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5); object-fit: cover; }
.header-info { display: flex; flex-direction: column; }
.label { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; margin-bottom: 8px; }
.title { font-size: 3rem; font-weight: 900; margin: 0 0 16px 0; line-height: 1; }
.meta { display: flex; flex-direction: column; gap: 16px; }
.meta-row { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: #b3b3b3; }
.artist-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.artist-avatar-placeholder { width: 24px; height: 24px; border-radius: 50%; background: #333; }
.bold { color: white; font-weight: 700; }
.dot { font-size: 0.5rem; }
.stats-row { display: flex; gap: 12px; }
.album-score-badge, .completion-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 4px; font-weight: bold; }
.score-val { font-size: 1.2rem; color: white; }
.score-label { font-size: 0.7rem; text-transform: uppercase; opacity: 0.7; letter-spacing: 0.5px; }
.score-green { color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
.score-yellow { color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
.score-orange { color: #e67e22; border: 1px solid rgba(230, 126, 34, 0.3); }
.score-red { color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }

/* LIST STYLES */
.tracklist { display: flex; flex-direction: column; }
.track-row { display: grid; grid-template-columns: 40px 1fr 60px 60px; align-items: center; padding: 8px 16px; border-radius: 4px; color: #b3b3b3; }
.track-row.header { border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 16px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; }
.track-row.item:hover { background-color: rgba(255, 255, 255, 0.1); color: white; }

.col-num { text-align: center; font-size: 1rem; }
.col-clock { text-align: right; font-variant-numeric: tabular-nums; }
.col-info { display: flex; flex-direction: column; justify-content: center; }
.col-score { text-align: right; display: flex; justify-content: flex-end; }

/* NEW LINK STYLES */
.track-name-link {
  font-size: 1rem;
  color: white;
  margin-bottom: 2px;
  text-decoration: none;
  width: fit-content;
}
.track-name-link:hover { text-decoration: underline; }

.track-artist-row { font-size: 0.85rem; color: #b3b3b3; }

.artist-link {
  color: #b3b3b3;
  text-decoration: none;
}
/* Artist hover effect: Turn white and underline */
.artist-link:hover { color: white; text-decoration: underline; }
/* When hovering the whole row, artists turn white automatically */
.track-row.item:hover .artist-link { color: white; }
.track-row.item:hover .artist-link:hover { text-decoration: underline; }

.track-score-badge { font-weight: bold; }
.empty-score { opacity: 0.3; }
</style>
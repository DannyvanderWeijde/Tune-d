<template>
  <div class="page-container">
    <div v-if="loading" class="loading">Loading Artist...</div>

    <div v-else-if="artist" class="content">

      <div class="artist-header">
        <img
          :src="artist.images?.[0]?.url || '/placeholder.png'"
          class="artist-image"
        />
        <h1 class="artist-name">{{ artist.name }}</h1>
        <p class="followers">
          {{ artist.followers?.total?.toLocaleString() || 0 }} Followers
        </p>
      </div>

      <div class="stats-card">
        <div class="stat-box">
          <span class="stat-label">Your Average</span>
          <span class="stat-value" :class="getScoreColor(myStats?.average || 0)">
             {{ myStats?.count ? (myStats.average / 10).toFixed(1) : '-' }}
          </span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Rated Songs</span>
          <span class="stat-value">{{ myStats?.count || 0 }}</span>
        </div>
      </div>

      <hr class="divider" />

      <div v-if="myStats?.tracks?.length" class="rated-list">
        <h3>Your Ranked Songs</h3>
        <div class="grid">
          <NuxtLink
            v-for="track in myStats.tracks"
            :key="track.id"
            :to="`/track/${track.id}`"
            class="mini-track-card"
          >
            <div class="score-badge">{{ track.score / 10 }}</div>
            <img :src="track.image" class="mini-cover" />
            <div class="mini-info">
              <span class="mini-name">{{ track.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>You haven't rated any songs by {{ artist.name }} yet.</p>
      </div>

      <hr class="divider" />

      <div class="spotify-list">
        <h3>Popular on Spotify</h3>
        <div class="track-list-vertical">
          <NuxtLink
            v-for="(track, index) in topTracks"
            :key="track.id"
            :to="`/track/${track.id}`"
            class="spotify-track-row"
          >
            <div class="track-index">{{ index + 1 }}</div>
            <img :src="track.album.images?.[2]?.url || track.album.images?.[0]?.url" class="row-thumb" />
            <div class="row-info">
              <span class="row-name">{{ track.name }}</span>
              <span class="row-album">{{ track.album.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const artistId = computed(() => route.params.id as string)
const CURRENT_USER = 'user-1'

// 1. Fetch Spotify Data (Artist + Top Tracks)
const { data: artistResponse, pending: loading } = await useFetch(`/api/spotify/artist`, {
  query: { id: artistId }
})

// Extract Artist Profile
const artist = computed(() => artistResponse.value?.artist)

// Extract Top Tracks (The new part!)
// The SDK returns { tracks: [...] } so we access .tracks
const topTracks = computed(() => artistResponse.value?.topTracks?.tracks || [])

// 2. Fetch Your Custom Stats from DB
const { data: myStats } = await useFetch('/api/db/artist-stats', {
  query: {
    artistId: artistId,
    userId: CURRENT_USER
  }
})

function getScoreColor(val: number) {
  if (val >= 80) return 'text-green'
  if (val >= 50) return 'text-yellow'
  return 'text-red'
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  color: white;
  text-align: center;
}

/* HEADER & STATS (Same as before) */
.artist-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  margin-bottom: 20px;
}
.artist-name { font-size: 3rem; font-weight: 800; margin: 0; }
.followers { color: #888; margin-top: 5px; }

.stats-card {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 16px;
}
.stat-box { display: flex; flex-direction: column; }
.stat-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #aaa; }
.stat-value { font-size: 2.5rem; font-weight: 900; }
.text-green { color: #1db954; }
.text-yellow { color: #f5b041; }
.text-red { color: #e74c3c; }

.divider {
  border: 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 40px 0;
}

/* GRID FOR YOUR RATED SONGS */
.rated-list h3, .spotify-list h3 { text-align: left; margin-bottom: 20px; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}
.mini-track-card {
  background: rgba(255,255,255,0.05);
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  position: relative;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); background: rgba(255,255,255,0.1); }
}
.mini-cover { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 8px; }
.mini-info { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.score-badge {
  position: absolute; top: 5px; right: 5px; background: #1db954; color: black;
  font-weight: bold; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px;
}

.empty-state { color: #666; margin-top: 40px; }

/* NEW: SPOTIFY LIST STYLES */
.track-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.spotify-track-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: background 0.2s;
  text-align: left;

  &:hover { background: rgba(255,255,255,0.1); }
}
.track-index {
  width: 30px;
  color: #888;
  font-weight: bold;
}
.row-thumb {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 16px;
  object-fit: cover;
}
.row-info {
  display: flex;
  flex-direction: column;
}
.row-name { font-weight: 600; font-size: 0.95rem; }
.row-album { font-size: 0.8rem; color: #aaa; }
</style>
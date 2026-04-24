<template>
  <div class="page-container">

    <header class="home-header">
      <h1>Your Hall of Fame</h1>
      <p class="subtitle">Based on your {{ totalRated }} rated songs</p>
    </header>

    <div v-if="pending" class="loading">Calculating stats...</div>

    <div v-else class="content-grid">

      <section class="section">
        <h2 class="section-title">Top Artists</h2>
        <div class="card-grid artists-grid">

          <NuxtLink
            v-for="(artist, index) in filledArtists"
            :key="artist.id || index"
            :to="artist.id ? `/artist/${artist.id}` : '#'"
            class="card artist-card"
            :class="{ 'winner': index === 0 && artist.id, 'placeholder': !artist.id }"
          >
            <div class="card-image-wrapper">
              <img :src="artist.image || ''" class="card-image" />
              <div v-if="index === 0 && artist.id" class="crown-icon">👑</div>
            </div>
            <div class="card-info">
              <div class="rank">#{{ index + 1 }}</div>
              <div class="name">{{ artist.name || '---' }}</div>
              <div v-if="artist.id" class="score">{{ (artist.average / 10).toFixed(1) }}</div>
            </div>
          </NuxtLink>

        </div>
      </section>

      <section class="section full-width">
        <div class="section-header-row">
          <h2 class="section-title">Top 10 Tracks</h2>
          <button class="icon-btn" title="Edit Scores" @click="toggleEdit">
            {{ editMode ? 'Done' : '✏️' }}
          </button>
        </div>

        <div class="track-list">

          <div
            v-for="(track, index) in filledTracks"
            :key="track.id || index"
            class="track-row"
            :class="{ 'gold-row': index === 0 && track.id, 'placeholder-row': !track.id }"
          >
            <div class="track-rank">{{ index + 1 }}</div>

            <NuxtLink :to="track.id ? `/track/${track.id}` : '#'">
              <img :src="track.image || '/placeholder.png'" class="track-thumb" />
            </NuxtLink>

            <div class="track-details">
              <NuxtLink :to="track.id ? `/track/${track.id}` : '#'" class="track-link">
                <span class="track-name">{{ track.name || '---' }}</span>
              </NuxtLink>
              <span v-if="track.id" class="track-artist">
                {{ track.artists?.[0]?.name }}
              </span>
            </div>

            <div class="track-score">
              <input
                v-if="editMode && track.id"
                type="number"
                step="0.1"
                class="mini-input"
                :value="track.score / 10"
                @change="saveHomeScore(track.scoreId, $event)"
              />
              <span v-else>
                {{ track.score ? (track.score / 10).toFixed(1) : '-' }}
              </span>
            </div>

          </div>

        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
const CURRENT_USER = 'user-1'

const { data: stats, pending, refresh } = await useFetch('/api/db/home-stats', {
  query: { userId: CURRENT_USER }
})

// --- HELPERS TO FILL PLACEHOLDERS ---

const totalRated = computed(() => stats.value?.tracks?.length || 0)

const filledArtists = computed(() => {
  const list = [...(stats.value?.artists || [])]
  while (list.length < 5) list.push({ name: '', image: '', average: 0 })
  return list
})

const filledAlbums = computed(() => {
  const list = [...(stats.value?.albums || [])]
  while (list.length < 5) list.push({ name: '', image: '', average: 0 })
  return list
})

const filledTracks = computed(() => {
  const list = [...(stats.value?.tracks || [])]
  while (list.length < 10) list.push({ name: '', image: '', score: 0 })
  return list
})

const editMode = ref(false)

function toggleEdit() {
  editMode.value = !editMode.value
  if (!editMode.value) {
    // Refresh data when done editing to re-sort the list
    refresh()
  }
}

async function saveHomeScore(scoreId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const rawValue = parseFloat(input.value) // e.g. 9.5

  // Convert 9.5 -> 95
  const dbValue = Math.round(rawValue * 10)

  await $fetch('/api/db/update-score-value', {
    method: 'POST',
    body: { scoreId, value: dbValue }
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  color: white;
}

.home-header {
  text-align: center;
  margin-bottom: 60px;

  h1 { font-size: 3rem; font-weight: 900; margin: 0; }
  .subtitle { color: #888; margin-top: 10px; font-size: 1.2rem; }
}

.section { margin-bottom: 80px; }
.section-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
  border-left: 4px solid #1db954;
  padding-left: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* --- GRID LAYOUTS --- */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns standard */
  gap: 24px;

  /* Make the first item span 2 columns and 2 rows for the "Big" look */
  .card:first-child {
    grid-column: span 2;
    grid-row: span 2;

    .card-image { height: 100%; }
    .name { font-size: 2rem; }
    .score { font-size: 2rem; }
  }
}

/* --- CARD STYLES --- */
.card {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  color: white;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;

  &:hover:not(.placeholder) {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.1);
  }
}

.placeholder {
  opacity: 0.3;
  pointer-events: none;
  border: 2px dashed #444;
  background: transparent;
}

.card-image-wrapper {
  position: relative;
  flex-grow: 1; /* Fills available space */
  min-height: 150px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crown-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2rem;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.card-info {
  padding: 16px;
  position: relative;
}

.rank {
  position: absolute;
  top: -15px;
  left: 16px;
  background: #333;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.winner .rank {
  background: #f1c40f; /* Gold for #1 */
  color: black;
}

.name {
  font-weight: 700;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score {
  font-weight: 900;
  color: #1db954;
  margin-top: 4px;
}

/* --- TRACK LIST STYLES --- */
.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-row {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: all 0.2s;

  &:hover:not(.placeholder-row) {
    background: rgba(255,255,255,0.1);
    transform: scale(1.01);
  }
}

.gold-row {
  background: linear-gradient(90deg, rgba(241, 196, 15, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-left: 4px solid #f1c40f;

  .track-rank { color: #f1c40f; font-size: 1.5rem; }
  .track-score { color: #f1c40f; font-size: 1.5rem; }
}

.placeholder-row {
  opacity: 0.3;
  pointer-events: none;
}

.track-rank {
  font-weight: 900;
  width: 40px;
  color: #666;
}

.track-thumb {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 16px;
  object-fit: cover;
}

.track-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.track-name { font-weight: 600; }
.track-artist { font-size: 0.85rem; color: #999; }

.track-score {
  font-weight: 900;
  font-size: 1.2rem;
  width: 60px;
  text-align: right;
}

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr 1fr; /* 2 columns on mobile */

    .card:first-child {
      grid-column: span 2; /* Still span full width on mobile */
      grid-row: auto;
    }
  }
}
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.icon-btn {
  background: transparent;
  border: 1px solid #444;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  &:hover { background: #333; border-color: white; }
}

.mini-input {
  width: 50px;
  background: rgba(0,0,0,0.5);
  border: 1px solid #666;
  color: #1db954;
  font-weight: 900;
  text-align: right;
  border-radius: 4px;
  padding: 4px;

  &:focus { border-color: #1db954; outline: none; }
}

.track-link { color: white; text-decoration: none; &:hover { text-decoration: underline; } }
</style>
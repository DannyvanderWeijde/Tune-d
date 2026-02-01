<template>
  <div class="page-container">

    <div v-if="trackStatus === 'pending'" class="loading-state">
      Loading track...
    </div>

    <div v-else-if="track" class="track-card">

      <div class="image-wrapper">
        <img
          :src="track.album.images[0]?.url || '/placeholder.png'"
          class="large-cover"
          alt="track cover"
        >
      </div>

      <div class="track-header">
        <h1 class="track-title">{{ track.name }}</h1>
        <h2 class="artist-name">
          <NuxtLink :to="`/artist/${track.artists[0].id}`" class="link">
            {{ track.artists[0].name }}
          </NuxtLink>
        </h2>
        <p class="album-name">
          on <NuxtLink :to="`/album/${track.album.id}`" class="link">{{ track.album.name }}</NuxtLink>
        </p>
      </div>

      <div class="meter-section">
        <div class="meter-label">
          <span>Global Popularity</span>
          <span>{{ track.popularity }}%</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" :style="{ width: track.popularity + '%' }" />
        </div>
      </div>

      <div v-if="track.preview_url" class="preview-section">
        <audio controls :src="track.preview_url" class="audio-player" />
      </div>

      <hr class="divider">

      <div class="rating-section">
        <label>Your Score</label>
        <div class="input-wrapper">
          <input
            v-model="score"
            type="number"
            min="1"
            max="10"
            step="0.1"
            class="score-input"
            :class="{ 'saving': isSaving }"
            placeholder="-"
            @blur="saveScore"
            @keyup.enter="saveScore"
          >
          <span class="out-of">/ 10</span>
        </div>
        <span v-if="isSaving" class="save-status">Saving...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TrackItem } from '~/types/spotify'
  import type { RatingResponse } from '~/types/api'

  const route = useRoute()
  const trackId = computed(() => route.params.id as string)

  const { data: track, status: trackStatus } = await useFetch<TrackItem>('/api/spotify/track', {
    query: { id: trackId },
    immediate: !!trackId.value
  })

  const { data: ratingData } = await useFetch<RatingResponse>('/api/db/score', {
    query: {
      userId: 1,
      trackId: trackId
    }
  })

  const score = ref<number | null>(null)
  const oldScore = ref<number | null>(null)
  const isSaving = ref(false)

  watch(ratingData, (newVal) => {
    if (newVal?.score) {
      score.value = newVal.score
      oldScore.value = newVal.score
    }
  }, { immediate: true })

  const saveScore = async () => {
    const val = score.value

    if (!val || val === oldScore.value || val > 10 || val < 1) return

    isSaving.value = true
    try {
      await $fetch('/api/db/score', {
        method: 'POST',
        body: {
          userId: 1,
          trackId: trackId.value,
          score: val
        }
      })

      oldScore.value = val
    } catch (err) {
      console.error('Failed to save score', err)
    } finally {
      isSaving.value = false
    }
  }
</script>

<style scoped>
/* LAYOUT */
.page-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 80vh;
}

.track-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* IMAGES */
.image-wrapper {
  margin-bottom: 32px;
}
.large-cover {
  width: 320px;
  height: 320px;
  object-fit: cover;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  border-radius: 8px;
  transition: transform 0.3s ease;
}
.large-cover:hover {
  transform: scale(1.02);
}

/* TYPOGRAPHY */
.track-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  line-height: 1.1;
}
.artist-name {
  font-size: 1.5rem;
  font-weight: 400;
  color: #b3b3b3;
  margin: 0 0 8px 0;
}
.album-name {
  font-size: 0.9rem;
  color: #666;
}
.link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}
.link:hover {
  color: white;
  border-bottom-color: white;
}

/* POPULARITY BAR */
.meter-section {
  width: 100%;
  margin-top: 32px;
  text-align: left;
}
.meter-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.bar-bg {
  width: 100%;
  height: 6px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: #1db954;
  border-radius: 10px;
  transition: width 1s ease-out;
}

/* AUDIO */
.preview-section {
  width: 100%;
  margin-top: 24px;
}
.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 20px;
}

.divider {
  width: 100%;
  border: 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 40px 0;
}

/* RATING INPUT */
.rating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.rating-section label {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8rem;
  color: #888;
}
.input-wrapper {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.score-input {
  background: transparent;
  border: 2px solid #333;
  color: white;
  font-size: 3rem;
  font-weight: 900;
  width: 120px;
  text-align: center;
  border-radius: 12px;
  padding: 10px;
  transition: all 0.2s;
}
.score-input:focus {
  border-color: #1db954;
  outline: none;
  background: rgba(255,255,255,0.05);
}
.score-input.saving {
  opacity: 0.5;
  border-color: #666;
}
.out-of {
  font-size: 1.5rem;
  color: #666;
  font-weight: 700;
}
.save-status {
  color: #1db954;
  font-size: 0.8rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
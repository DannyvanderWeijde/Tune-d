<template>
  <div class="page-container">

    <header class="page-header">
      <NuxtLink to="/" class="back-link">← Back Home</NuxtLink>

      <h1>{{ isOwner ? 'Your' : 'User ' + userId + "'s" }} Scored Tracks</h1>

      <p class="subtitle">
        Showing {{ trackList.length }} scores
      </p>

      <button v-if="isOwner" @click="toggleEdit" class="edit-btn">
        {{ editMode ? 'Done Editing' : 'Edit Mode' }}
      </button>
    </header>

    <div class="ranking-list">
      <div class="list-header">
        <span class="col-rank">#</span>
        <span class="col-track">Track</span>
        <span class="col-score">Score</span>
        <span class="col-manual" v-if="editMode">Order</span>
      </div>

      <div
        v-for="(item, index) in trackList"
        :key="item.scoreId"
        class="rank-row"
        :class="{ 'editing': editMode }"
      >
        <div class="col-rank">
          <span class="rank-number">{{ (page - 1) * 50 + index + 1 }}</span>
        </div>

        <NuxtLink :to="`/track/${item.trackId}`" class="col-track">
          <img :src="item.image || '/placeholder.png'" class="track-thumb" />
          <div class="track-info">
            <span class="track-name">{{ item.name }}</span>
            <span class="artist-name">{{ item.artist }}</span>
          </div>
        </NuxtLink>

        <div class="col-score">
          <input
            v-if="editMode"
            type="number"
            step="0.1"
            class="score-input"
            :value="item.score / 10"
            @input="updateLocalScore(item, $event)"
          />
          <span v-else class="score-badge" :class="getScoreColor(item.score)">
            {{ (item.score / 10).toFixed(1) }}
          </span>
        </div>

        <div class="col-manual" v-if="editMode">
          <input
            type="number"
            class="rank-input"
            placeholder="-"
            :value="item.rankInScore"
            @input="updateLocalRank(item, $event)"
          />
        </div>

      </div>
    </div>

    <div class="load-more-container">
      <button
        v-if="hasMore"
        @click="loadMore"
        class="load-more-btn"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Loading...' : 'Load More Songs' }}
      </button>
      <p v-else-if="trackList.length > 0" class="end-msg">
        That's all of them!
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userId = computed(() => (route.params.id as string) || 'user-1')
const CURRENT_LOGGED_IN_USER = 'user-1'
const isOwner = computed(() => userId.value === CURRENT_LOGGED_IN_USER)

// STATE
const editMode = ref(false)
const page = ref(1)
const trackList = ref<any[]>([])
const total = ref(0)
const hasMore = ref(false)
const isLoading = ref(false)

// TRACKING CHANGES
// We store the IDs of any song that has been touched
const modifiedItems = ref(new Set<string>())

// --- FETCH LOGIC ---
const fetchPage = async () => {
  isLoading.value = true
  try {
    const data = await $fetch('/api/db/scored-tracks', {
      query: { userId: userId.value, page: page.value }
    })

    if (data.items) {
      if (page.value === 1) {
        trackList.value = data.items
      } else {
        trackList.value.push(...data.items)
      }
      total.value = data.total
      hasMore.value = data.hasMore
    }
  } catch (err) {
    console.error('Failed to load tracks', err)
  } finally {
    isLoading.value = false
  }
}

await fetchPage()

const loadMore = () => {
  page.value++
  fetchPage()
}

// --- EDIT MODE LOGIC ---

async function toggleEdit() {
  if (editMode.value) {
    // If we are currently editing and clicking "Done"...
    await saveAllChanges()
    // Sort only AFTER saving
    sortTracks()
  }

  editMode.value = !editMode.value
}

// 1. UPDATE LOCAL SCORE (Does not save to DB yet)
function updateLocalScore(item: any, event: Event) {
  const input = event.target as HTMLInputElement

  if (input.value === '') {
    item.score = null // <--- 🚨 Clears the score
  } else {
    const rawValue = parseFloat(input.value)
    item.score = Math.round(rawValue * 10)
  }

  modifiedItems.value.add(item.scoreId)
}

// 2. UPDATE LOCAL RANK (Does not save to DB yet)
function updateLocalRank(item: any, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value

  if (val === '') {
    item.rankInScore = null // <--- 🚨 Clears the rank
  } else {
    item.rankInScore = parseInt(val)
  }

  modifiedItems.value.add(item.scoreId)
}

// 3. SAVE BATCH (Called when "Done" is clicked)
async function saveAllChanges() {
  if (modifiedItems.value.size === 0) return

  // Filter the list to find only the items that changed
  const updates = trackList.value
    .filter(item => modifiedItems.value.has(item.scoreId))
    .map(item => ({
      scoreId: item.scoreId,
      score: item.score,
      rankInScore: item.rankInScore
    }))

  // Send to the new Batch API
  await $fetch('/api/db/batch-update-scores', {
    method: 'POST',
    body: { updates }
  })

  // Clear the dirty list
  modifiedItems.value.clear()
}

// 4. SORT (Runs only after saving)
function sortTracks() {
  trackList.value.sort((a, b) => {
    // Score (Highest first)
    if (b.score !== a.score) return b.score - a.score

    // Rank (Lowest Number First, NULLS LAST)
    const rankA = (a.rankInScore && a.rankInScore > 0) ? a.rankInScore : Infinity
    const rankB = (b.rankInScore && b.rankInScore > 0) ? b.rankInScore : Infinity
    if (rankA !== rankB) return rankA - rankB

    // Date (Newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

function getScoreColor(val: number) {
  if (val >= 90) return 'score-green'
  if (val >= 70) return 'score-yellow'
  if (val >= 50) return 'score-orange'
  return 'score-red'
}
</script>

<style lang="scss" scoped>
/* Reuse Page Container */
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: white;
}

/* Header */
.page-header {
  margin-bottom: 40px;
  text-align: center;
  position: relative;

  h1 { margin: 0; font-size: 2.5rem; font-weight: 800; }
  .subtitle { color: #888; margin-top: 8px; }
  .back-link { display: inline-block; margin-bottom: 16px; color: #888; text-decoration: none; font-size: 0.9rem; }
  .back-link:hover { color: white; }
}

/* Edit Button */
.edit-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid #666;
  color: #ccc;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: white; color: white; }
}

/* List Layout */
.ranking-list { display: flex; flex-direction: column; gap: 8px; }

.list-header {
  display: flex;
  padding: 0 16px 8px 16px;
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rank-row {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.03);
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: all 0.2s;

  &:hover { background: rgba(255,255,255,0.1); }
  &.editing { border: 1px dashed #444; }
}

/* Columns (Reusing widths from Top 100) */
.col-rank { width: 50px; font-weight: 900; font-size: 1.2rem; color: #444; text-align: center; }
.col-track { flex-grow: 1; display: flex; align-items: center; gap: 16px; text-decoration: none; color: white; }
.col-score { width: 80px; text-align: right; }
.col-manual { width: 80px; text-align: right; }

/* Track Info */
.track-thumb { width: 50px; height: 50px; border-radius: 4px; object-fit: cover; }
.track-info { display: flex; flex-direction: column; }
.track-name { font-weight: 700; font-size: 1rem; }
.artist-name { color: #aaa; font-size: 0.85rem; }

/* Inputs */
.rank-input, .score-input {
  width: 50px;
  background: rgba(255,255,255,0.1);
  border: 1px solid #444;
  color: white;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  font-weight: bold;
}
.rank-input:focus, .score-input:focus { border-color: #1db954; outline: none; }
.score-input { width: 60px; }

/* Score Badges */
.score-badge { padding: 4px 10px; border-radius: 12px; font-weight: bold; color: #fff; background: #333; }
.score-green { color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
.score-yellow { color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
.score-orange { color: #e67e22; background: rgba(230, 126, 34, 0.1); }
.score-red { color: #e74c3c; background: rgba(231, 76, 60, 0.1); }

/* Load More Section */
.load-more-container { text-align: center; margin-top: 40px; padding-bottom: 40px; }
.load-more-btn {
  background: white;
  color: black;
  border: none;
  padding: 12px 32px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); background: #f0f0f0; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.end-msg { color: #444; font-style: italic; }

@media (max-width: 600px) {
  .edit-btn { position: static; margin-top: 16px; transform: none; }
}
</style>
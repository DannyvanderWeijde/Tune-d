<template>
  <div class="page-container">

    <header class="page-header">
      <NuxtLink to="/" class="back-link">← Back Home</NuxtLink>

      <h1>{{ isOwner ? 'Your' : 'User ' + userId + "'s" }} Top 100</h1>

      <button v-if="isOwner" @click="toggleEdit" class="edit-btn">
        {{ editMode ? 'Done Ordering' : 'Edit Mode' }}
      </button>
    </header>

    <div v-if="pending" class="loading">Loading rankings...</div>

    <div v-else class="ranking-list">
      <div class="list-header">
        <span class="col-rank">#</span>
        <span class="col-track">Track</span>
        <span class="col-score">Score</span>
        <span class="col-manual" v-if="editMode">Order</span>
      </div>

      <div
        v-for="(item, index) in list"
        :key="item.scoreId"
        class="rank-row"
        :class="[getRankClass(index), { 'editing': editMode }]"
      >
        <div class="col-rank">
          <span class="rank-number">{{ index + 1 }}</span>
        </div>

        <div class="col-track">
          <img :src="item.image || '/placeholder.png'" class="track-thumb" />
          <div class="track-info">
            <span class="track-name">{{ item.name }}</span>
            <span class="artist-name">{{ item.artist }}</span>
          </div>
        </div>

        <div class="col-score">
          <input
            v-if="editMode"
            type="number"
            step="0.1"
            class="score-input"
            :value="item.score / 10"
            @change="saveScoreValue(item.scoreId, $event)"
          />
          <span v-else class="score-badge">
            {{ (item.score / 10).toFixed(1) }}
          </span>
        </div>

        <div class="col-manual" v-if="editMode">
          <input
            type="number"
            class="rank-input"
            placeholder="-"
            :value="item.rankInScore"
            @change="saveRank(item.scoreId, $event)"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 1. Get the User ID from the URL (e.g. /top-100/user-1)
// If the URL is somehow empty, fallback to 'user-1'
const userId = computed(() => (route.params.id as string) || 'user-1')

// 2. Check if the current viewer is the owner
// (For now we assume the logged-in user is always 'user-1')
const CURRENT_LOGGED_IN_USER = 'user-1'
const isOwner = computed(() => userId.value === CURRENT_LOGGED_IN_USER)

const editMode = ref(false)

// 3. Fetch Data for THIS specific user
const { data: list, pending, refresh } = await useFetch('/api/db/top-100', {
  query: { userId: userId }
})

function toggleEdit() {
  editMode.value = !editMode.value
  if (!editMode.value) refresh()
}

async function saveRank(scoreId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value

  await $fetch('/api/db/update-rank', {
    method: 'POST',
    body: { scoreId, rank: val }
  })
}

function getRankClass(index: number) {
  if (index === 0) return 'rank-1 gold'
  if (index === 1) return 'rank-2 silver'
  if (index === 2) return 'rank-3 bronze'
  return ''
}

async function saveScoreValue(scoreId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const rawValue = parseFloat(input.value) // e.g. 9.5

  // Convert 9.5 -> 95 for the database
  const dbValue = Math.round(rawValue * 10)

  await $fetch('/api/db/update-score-value', {
    method: 'POST',
    body: { scoreId, value: dbValue }
  })

  // Optional: Refresh list to re-sort if score changed significantly
  refresh()
}
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: white;
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
  position: relative;
}
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
  &:hover { color: white; }
}
h1 { font-size: 3rem; font-weight: 900; margin: 0; }

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

/* LIST STYLES */
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

/* COLUMNS */
.col-rank { width: 50px; font-weight: 900; font-size: 1.2rem; color: #444; text-align: center; }
.col-track { flex-grow: 1; display: flex; align-items: center; gap: 16px; }
.col-score { width: 80px; text-align: right; }
.col-manual { width: 80px; text-align: right; }

/* TRACK INFO */
.track-thumb { width: 50px; height: 50px; border-radius: 4px; object-fit: cover; }
.track-info { display: flex; flex-direction: column; }
.track-name { font-weight: 700; font-size: 1rem; }
.artist-name { color: #aaa; font-size: 0.85rem; }

/* SCORE BADGE */
.score-badge { background: #333; padding: 4px 10px; border-radius: 12px; font-weight: bold; color: #fff; }

/* RANK INPUT */
.rank-input {
  width: 50px;
  background: rgba(255,255,255,0.1);
  border: 1px solid #444;
  color: white;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
}
.rank-input:focus { border-color: #1db954; outline: none; }

/* TOP 3 SPECIAL STYLES */
.rank-1 {
  background: linear-gradient(90deg, rgba(241, 196, 15, 0.1), rgba(0,0,0,0));
  border-left: 4px solid #f1c40f;
  .col-rank { color: #f1c40f; font-size: 1.5rem; }
  .score-badge { background: #f1c40f; color: black; }
}
.rank-2 {
  border-left: 4px solid #bdc3c7;
  .col-rank { color: #bdc3c7; }
}
.rank-3 {
  border-left: 4px solid #cd7f32;
  .col-rank { color: #cd7f32; }
}

.score-input {
  width: 60px;
  background: rgba(255,255,255,0.1);
  border: 1px solid #444;
  color: white;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  font-weight: bold;

  &:focus { border-color: #1db954; outline: none; }
}
</style>
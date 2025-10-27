<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ScoreHistoryEntry } from '../types'
import { getScoreHistory} from '../utils/caching.ts'

const scoreHistory = ref<ScoreHistoryEntry[]>([])

const loadHistory = () => {
  scoreHistory.value = getScoreHistory().reverse() // Most recent first
}

onMounted(() => {
  loadHistory()
})

</script>

<template>
  <div class="bg-zinc-800 rounded-lg shadow-lg p-6 mt-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-white">Score History</h2>
    </div>

    <div v-if="scoreHistory.length === 0" class="text-gray-400 text-center py-4">
      No games played yet.
    </div>

    <div v-else class="space-y-3 max-h-90 overflow-y-auto">
      <div
        v-for="(entry, index) in scoreHistory"
        :key="index"
        class="bg-zinc-700 rounded-lg p-3 hover:bg-zinc-650 transition-colors"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="text-white font-semibold">{{ entry.mode }}</span>
            <span class="text-gray-300 text-sm">{{ entry.score }}/{{ entry.totalQuestions }}</span>
          </div>
          <div
            class="text-sm font-bold px-3 py-1 rounded"
            :class="{
              'bg-green-600 text-white': entry.percentage >= 70,
              'bg-yellow-600 text-white': entry.percentage >= 40 && entry.percentage < 70,
              'bg-red-600 text-white': entry.percentage < 40
            }"
          >
            {{ entry.percentage }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useSocket } from "../composables/useSocket.ts";
import { useRouter } from "vue-router";
import { showError } from "../utils/errorHandler.ts";

const router = useRouter();
const { isConnected, on, emit, room } = useSocket();
const playerName = ref<string>("");
const matchmakingText = ref<string>("");
const isMatchmaking = ref<boolean>(false);
const isPending = ref<boolean>(false);
const isAccepting = ref<boolean>(false);
let animationInterval: number | null = null;

// Store cleanup functions
const cleanupFunctions: (() => void)[] = [];

// Animate the dots when searching
watch(isMatchmaking, (searching) => {
  if (searching) {
    let dots = 0;
    matchmakingText.value = "Searching for opponent";

    animationInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      matchmakingText.value = "Searching for opponent" + ".".repeat(dots);
    }, 500);
  } else {
    if (animationInterval !== null) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    matchmakingText.value = "";
  }
});

watch(isConnected, (connected) => {
  if (!connected) {
    showError("Connection Lost!");
    router.push("/");
    return;
  }
});

onMounted(() => {
  // Store cleanup functions
  cleanupFunctions.push(
    on('matchFound', () => {
      isMatchmaking.value = false;
      isPending.value = true;
    }),

    on('matchStarted', (roomData) => {
      isAccepting.value = false;
      room.value = roomData;
      // Small delay to ensure reactivity propagates before navigation
      setTimeout(() => router.push("/multiplayer"), 50);
    }),

    on('matchCancelled', () => {
      isAccepting.value = false;
      isPending.value = false;
      isMatchmaking.value = false;
    }),

    on('queueEntered', () => {
      // Queue entered confirmation
    })
  );
});

onUnmounted(() => {
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions.length = 0;

  if (animationInterval !== null) {
    clearInterval(animationInterval);
  }

  // Socket disconnect is handled by router navigation guard
});

const acceptMatch = () => {
  isAccepting.value = true;
  emit("acceptMatch");
}

const findMatch = () => {
  if (playerName.value.trim() === "") {
    showError("Please enter your name");
    return;
  }
  emit("findMatch", playerName.value.trim());
  isMatchmaking.value = true;
}

const cancelMatchmaking = () => {
  emit("cancelMatch");
  isMatchmaking.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-zinc-900 p-4">
    <div class="max-w-md mx-auto">
      <h1 class="mb-6 text-3xl font-bold text-center text-white">Triviadle</h1>

      <button
          class="my-2 p-2 m-w-2xl rounded-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors cursor-pointer"
          @click="router.push({name: 'index'})"
      >
        Mode Select
      </button>

      <!-- Game Options Box -->
      <div class="bg-zinc-800 rounded-lg shadow-lg p-6 space-y-6">
        <!-- Name Input -->
        <div>
          <label for="playerName" class="block text-white font-semibold mb-2">
            Enter Your Name
          </label>
          <input
              id="playerName"
              v-model="playerName"
              type="text"
              placeholder="Enter your name..."
              maxlength="20"
              :disabled="isMatchmaking || isPending"
              class="w-full px-4 py-3 bg-zinc-700 text-white rounded-lg border-2 border-zinc-600 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @keyup.enter="findMatch"
          />
        </div>

        <button
            v-if="!isMatchmaking && !isPending"
            @click="findMatch"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="playerName.trim() === ''"
        >
          Find Match
        </button>
        <button
            v-if="isMatchmaking"
            @click="cancelMatchmaking"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg"
        >
          Cancel Search
        </button>
        <button
            v-if="isPending"
            @click="acceptMatch"
            :disabled="isAccepting"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg glow-pulse disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isAccepting ? 'Waiting for opponent...' : 'Match Found! Click to Accept' }}
        </button>
        <h1 v-if="isMatchmaking" class="text-3xl font-bold text-center text-white">{{ matchmakingText }}</h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.9);
  }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}
</style>
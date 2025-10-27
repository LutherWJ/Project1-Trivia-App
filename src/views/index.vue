<script setup lang="ts">
import Dropdown from "../components/Dropdown.vue";
import Scoreboard from "../components/Scoreboard.vue";
import type {Preferences} from "../types";
import {onMounted, ref} from "vue";
import {onBeforeRouteLeave, useRouter} from "vue-router";
import {fetchQuestions} from "../utils/api.ts";
import {CATEGORIES, CATEGORY_NAMES, DIFFICULTIES, QUANTITIES} from "../utils/constants.ts";
import { savePreferences, getPreferences } from "../utils/caching.ts";

const router = useRouter();

const quantityDropdown = ref();
const categoryDropdown = ref();
const difficultyDropdown = ref();
const isLoading = ref(false);
let defaultPreferences: any = {
  quantity: QUANTITIES[4],  // "10"
  category: CATEGORY_NAMES[0],  // "Random"
  difficulty: DIFFICULTIES[0],  // "Any"
}

// Get preferences out of dropdowns and convert them into desired formats
const checkPreferences = (): Preferences => {
  try {
    const quantity: number = parseInt(quantityDropdown.value.selectedValue);
    const categoryID: number = CATEGORIES.get(categoryDropdown.value.selectedValue) || 0;
    const difficulty: string = difficultyDropdown.value.selectedValue;
    return {
      quantity: quantity,
      category: categoryID,
      difficulty: difficulty
    }
  } catch (err) {
    console.error(`Error fetching preferences:\n ${err}`);
    // Return default values on error
    return {
      quantity: 10,
      category: 0,
      difficulty: "any",
    }
  }
}

const startGame = async () => {
  isLoading.value = true;
  const preferences = checkPreferences();
  const questions = await fetchQuestions(preferences);
  if (!questions.ok) {
    console.error(`Error fetching questions: ${questions.error}`);
    return;
  }
  console.log(questions);
  await router.push({
    name: 'classic',
    state: { questions: questions.value as any }
  });
}

const startEndless = async () => {
  isLoading.value = true;
  await router.push({
    name: 'endless',
  })
}

onMounted(() => {
  // Check for saved preferences in sessionStorage
  const p = getPreferences();
  if (p === null) return;

  defaultPreferences = {
    quantity: p.quantity.toString(),
    category: CATEGORY_NAMES[0],
    difficulty: p.difficulty
  };
})

onBeforeRouteLeave(() => {
  savePreferences(checkPreferences());
  return true;
});
</script>

<template>
  <div class="min-h-screen bg-zinc-900 p-4">
    <div class="max-w-md mx-auto">
      <h1 class="mb-6 text-3xl font-bold text-center text-white">Triviadle</h1>

      <!-- Game Options Box -->
      <div class="bg-zinc-800 rounded-lg shadow-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold text-white text-center">Game Options</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2 text-sm font-medium">Category</label>
            <dropdown :options="CATEGORY_NAMES" :default-value="defaultPreferences.category" ref="categoryDropdown"/>
          </div>

          <div>
            <label class="block text-gray-300 mb-2 text-sm font-medium">Difficulty</label>
            <dropdown :options="[...DIFFICULTIES]" :default-value="defaultPreferences.difficulty" ref="difficultyDropdown"/>
          </div>

          <div>
            <label class="block text-gray-300 mb-2 text-sm font-medium">Question Quantity</label>
            <dropdown :options="[...QUANTITIES]" :default-value="defaultPreferences.quantity.toString()" ref="quantityDropdown"/>
          </div>
        </div>

        <button
            @click="startGame"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg"
        >
          Start Classic
        </button>
        <button
            @click="startEndless"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg"
        >
          Play Endless
        </button>
      </div>

      <scoreboard/>
    </div> 
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {type AnswerChoice, Mode, type Question} from '../types'
import {addScoreToHistory} from '../utils/caching.ts'
import AnswerBox from "../components/AnswerBox.vue";
import {showError} from "../utils/errorHandler";
import {shuffleAnswers, decodeAnswerChoices, decodeHtml} from "../utils/quizHelpers";
import {SERVER_ADDRESS} from "../utils/constants.ts";

const router = useRouter()
const questions = ref<Question[]>([]);
const isReady = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const userTopic = ref<string>("");
const currentQuestion = ref<number>(0);
const currentChoices = ref<AnswerChoice[]>([]);
const questionCount = computed(() => questions.value.length);
const score = ref(0);
const answeredCurrentQuestion = ref(false);

const fetchAIQuestions = async () => {
  if (!userTopic.value.trim()) {
    showError('Please enter a topic');
    return;
  }

  isLoading.value = true;
  try {
    // Encode the topic for URL safety
    const encodedTopic = encodeURIComponent(userTopic.value);
    const res = await fetch(`${SERVER_ADDRESS}/api/ai/generate/${encodedTopic}`, {
      method: 'POST',
    });
    if (!res.ok) {
      showError(`Question generation failed, try again.`);
      return;
    }

    const data = await res.json();

    // Check if the API returned an error
    if (!data.success) {
      showError(data.error || 'Failed to generate questions');
      return;
    }

    questions.value = data.questions as Question[];

    // Set up the first question
    const current = questions.value[0];
    if (current) {
      const choices = shuffleAnswers(current);
      if (choices.ok) {
        currentChoices.value = decodeAnswerChoices(choices.value);
        isReady.value = true;
      }
    }
  } catch (error) {
    showError('Failed to generate questions. Please try again.');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

const handleAnswerClick = (isCorrect: boolean) => {
  if (answeredCurrentQuestion.value) return;
  answeredCurrentQuestion.value = true;
  if (isCorrect) {
    score.value += 1;
  }
  // Wait 1.5 seconds before moving to next question so user can see the result
  setTimeout(() => {
    answeredCurrentQuestion.value = false;
    nextQuestion();
  }, 1500);
}

const nextQuestion = () => {
  if (currentQuestion.value < questionCount.value - 1) {
    currentQuestion.value += 1;
    const current = questions.value[currentQuestion.value];
    if (!current) return;
    const choices = shuffleAnswers(current);
    if (!choices.ok) {
      showError(choices.error.message);
      console.error(choices.error);
      return;
    }
    // Decode special characters before displaying
    currentChoices.value = decodeAnswerChoices(choices.value);
  } else {
    addScoreToHistory(Mode.ai, score.value, questionCount.value);
    router.push({name: 'index',})
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-900 p-8">
    <h1 class="mb-8 text-5xl font-bold text-center text-white">Classic Mode</h1>

    <!-- Navigation button row -->
    <div class="max-w-md mx-auto flex justify-between">
      <button
          class="my-2 p-2 m-w-2xl rounded-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors cursor-pointer"
          @click="router.push({name: 'index'})"
      >
        Mode Select
      </button>
    </div>


    <div class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6" v-if="!isReady">
      <div>
        <label for="playerName" class="block text-white font-semibold mb-2">
          Enter a topic for our AI to generate questions for
        </label>
        <input
            id="playerName"
            v-model="userTopic"
            type="text"
            placeholder="Enter your topic..."
            maxlength="50"
            :disabled="isLoading"
            class="w-full px-4 py-3 bg-zinc-700 text-white rounded-lg border-2 border-zinc-600 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @keyup.enter="!isLoading && fetchAIQuestions()"
        />
      </div>

      <button
          @click="fetchAIQuestions"
          :disabled="isLoading"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors cursor-pointer active:bg-purple-800 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
      >
        <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Generating...' : 'Generate Questions' }}</span>
      </button>
    </div>

    <!-- Game box -->
    <div class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6" v-if="isReady" :key="`question-${currentQuestion}`">
      <div class="flex justify-between mb-5">
        <p>Question {{currentQuestion + 1}}/{{questionCount}}</p>
        <p>Score: {{score}}/{{questionCount}}</p>
      </div>
      <p class="mb-4">{{decodeHtml(questions[currentQuestion]?.question || '')}}</p>
      <div v-for="(choice, index) in currentChoices" :key="index" :value="choice" class="mb-2">
        <answer-box :choice="choice" @answer-clicked="handleAnswerClick" :disabled="answeredCurrentQuestion" :show-correct-answer="answeredCurrentQuestion"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import {type TriviaAPIResponse, type AnswerChoice, Mode} from '../types'
import {addScoreToHistory} from '../utils/caching.ts'
import AnswerBox from "../components/AnswerBox.vue";
import {showError} from "../utils/errorHandler";
import {shuffleAnswers, decodeAnswerChoices, decodeHtml} from "../utils/quizHelpers";

const router = useRouter()

// Questions will be passed via route state because I need to justify adding vue router as a dependency
const questions: TriviaAPIResponse = history.state.questions || { response_code: 0, results: [] };
const currentQuestion = ref(0);
const currentChoices = ref<AnswerChoice[]>([]);
const questionCount = questions.results.length;
const score = ref(0);
const answeredCurrentQuestion = ref(false);

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
  if (currentQuestion.value < questionCount-1) {
    currentQuestion.value += 1;
    const current = questions.results[currentQuestion.value];
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
    addScoreToHistory(Mode.classic, score.value, questionCount);
    router.push({name: 'index',})
  }
}

onMounted(async () => {
  await nextTick();
  const current = questions.results[currentQuestion.value];
  if (!current) return;
  const choices = shuffleAnswers(current);
  if (!choices.ok) {
    showError(choices.error.message);
    console.error(choices.error);
    return;
  }
  currentChoices.value = decodeAnswerChoices(choices.value);
});


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

    <!-- Game box -->
    <div class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between mb-5">
        <p>Question {{currentQuestion}}/{{questionCount}}</p>
        <p>Score: {{score}}/{{questionCount}}</p>
      </div>
      <p class="mb-4">{{decodeHtml(questions.results[currentQuestion]?.question || '')}}</p>
      <div v-for="choice in currentChoices" :key="choice.answer" :value="choice" class="mb-2">
        <answer-box :choice="choice" @answer-clicked="handleAnswerClick" :disabled="answeredCurrentQuestion" :show-correct-answer="answeredCurrentQuestion"/>
      </div>
    </div>
  </div>
</template>
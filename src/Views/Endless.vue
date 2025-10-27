<script setup lang="ts">
import {onMounted, ref, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import {type TriviaAPIResponse, type AnswerChoice, Mode, type Preferences, type Question} from '../types'
import {addScoreToHistory} from '../utils/caching.ts'
import AnswerBox from "../components/AnswerBox.vue";
import {showError} from "../utils/errorHandler";
import {shuffleAnswers, decodeAnswerChoices, decodeHtml} from "../utils/quizHelpers";
import {fetchQuestions} from "../utils/api.ts";

const router = useRouter()

// Endless mode has predetermined preferences
const preferences: Preferences = {
  quantity: 10,
  category: 0,
  difficulty: "Any"
}
const questions = ref<Question[]>([]);
const currentQuestion = ref<number>(0); // Tracks how many questions have been answered total
const currentChoices = ref<AnswerChoice[]>([]);
const score = ref<number>(0);
const answeredCurrentQuestion = ref<boolean>(false);
let questionBuffer: TriviaAPIResponse | null = null;
let progress: number = 0; // This will track how many questions the user has answered from the most recent request
const showAnswer = ref<boolean>(false);

const handleAnswerClick = (isCorrect: boolean) => {
  if (answeredCurrentQuestion.value) return;
  answeredCurrentQuestion.value = true;
  if (isCorrect) {
    score.value += 1;
  } else {
    showAnswer.value = true;
    setTimeout(() => showAnswer.value = false, 1500);
  }
  // Wait 1.5 seconds before moving to next question so user can see the result
  setTimeout(() => {
    answeredCurrentQuestion.value = false;
    nextQuestion();
  }, 1500);
}

const nextQuestion = async () => {
  if (answeredCurrentQuestion.value) return; // Quick check for repeat clicks
  // Fetch new questions 1 before new batch is needed
  if (progress === preferences.quantity - 2) {
    const buffer = await fetchQuestions(preferences);
    if (!buffer.ok) {
      showError(buffer.error);
      console.error(buffer.error);
      await router.push({name: 'index',})
      return;
    }
    questionBuffer = buffer.value;
  } else if (progress == preferences.quantity - 1) {
    // Move buffer to main question array once they're needed
    progress = 0;
    if (!questionBuffer) {
      showError("Failed to load questions");
      await router.push('/');
      return;
    }
    questions.value = questionBuffer.results;
  }

  currentQuestion.value++;
  progress++;
  const current = questions.value[progress];
  if (!current) {
    showError("Failed to load next question");
    console.error("Question not found at index:", progress);
    await router.push({name: 'index'});
    return;
  }
  const choices = shuffleAnswers(current);
  if (!choices.ok) {
    showError(choices.error.message);
    console.error(choices.error);
    return;
  }
  // Decode special characters before displaying
  currentChoices.value = decodeAnswerChoices(choices.value);
}

const quitEndless = () => {
  addScoreToHistory(Mode.endless, score.value, currentQuestion.value);
  router.push('/');
}

onMounted(async () => {
  await nextTick();
  const initQuestions = await fetchQuestions(preferences);
  if (!initQuestions.ok) {
    showError("Failed to load initial Questions");
    await router.push('/');
    return;
  }

  questions.value = initQuestions.value.results;

  const current = questions.value[currentQuestion.value];
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
    <h1 class="mb-8 text-5xl font-bold text-center text-white">Endless Mode</h1>

    <!-- Navigation button row -->
    <div class="max-w-md mx-auto flex justify-between">
      <button
          class="my-2 p-2 m-w-2xl rounded-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors cursor-pointer"
          @click="router.push({name: 'index'})"
      >
        Mode Select
      </button>

      <button
          class="my-2 p-2 m-w-2xl rounded-sm bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors cursor-pointer"
          @click="quitEndless"
      >
        Quit Endless
      </button>
    </div>

    <!-- Game box -->
    <div class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between mb-5">
        <p>Question: {{ currentQuestion }}/Infinite</p>
        <p>Score: {{ score }}</p>
      </div>
      <p class="mb-4" v-if="questions[progress]">{{ decodeHtml(questions[progress]?.question || '') }}</p>
      <div v-for="choice in currentChoices" :key="choice.answer" :value="choice" class="mb-2">
        <answer-box :choice="choice" @answer-clicked="handleAnswerClick"/>
      </div>
    </div>
    <div v-if="showAnswer" class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-4xl p-4 md:p-6 my-4">
      <p class="text-center text-sm md:text-xl p-2 text-red-500 break-words">Correct Answer: {{questions[currentQuestion]?.correct_answer || ''}}</p>
    </div>
  </div>
</template>
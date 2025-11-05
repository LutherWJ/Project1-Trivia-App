<script setup lang="ts">
import {onMounted, ref, nextTick, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {type AnswerChoice, type Question} from '../types'
import AnswerBox from "../components/AnswerBox.vue";
import {showError} from "../utils/errorHandler";
import {shuffleAnswers, decodeAnswerChoices, decodeHtml} from "../utils/quizHelpers";
import {useSocket} from "../composables/useSocket.ts";
import {type PlayerResult} from "../types";
import {QUESTION_TIME_LIMIT} from "../utils/constants.ts";
import {useTimer} from "../composables/useTimer.ts";

const router = useRouter()

const {on, emit, room, id} = useSocket();

// Early return if room is not available
if (room.value === null || room.value === undefined) {
  showError("Error creating match - room data not found");
  router.push("/matchmaking");
}

const cleanupFunctions: (() => void)[] = [];
const questions: Question[] = room.value?.questions || []
const currentQuestion = ref<number>(0);
const currentChoices = ref<AnswerChoice[]>([]);
const questionCount = questions.length;
const score = ref<number>(0);
const isQuestionAnswered = ref<boolean>(false);
const showWinner = ref<boolean>(false);
const startTime = room.value.startTime;
const isStarted = ref<boolean>(false); // Controls start timer for synchronized start
let winHistory: Array<boolean> = []; // Track winner of each question
const lastResult = ref<'win' | 'loss' | 'tie' | null>(null); // Track result of current question
const opponentName = ref<string>('');


// Timer that enforces the 10 second time limit for each question
const {time: timeLeft, start: startQuestionTimer, reset: resetQuestionTimer, stop: stopQuestionTimer} = useTimer({
  initialTime: QUESTION_TIME_LIMIT,
  direction: 'down',
  onComplete: () => {
    // Question timeout handler
    isQuestionAnswered.value = true;
    stopQuestionTimer();

    const playerResult: PlayerResult = {
      roomID: room.value!.id,
      playerID: id!,
      isCorrect: false,
      timeAnswered: QUESTION_TIME_LIMIT
    }

    emit('answerQuestion', playerResult);
  }
});

// Countdown timer for game start
const initialCountdown = Math.ceil((startTime! - Date.now()) / 1000);
const {time: timeUntilStart, start: startCountdown} = useTimer({
  initialTime: initialCountdown,
  direction: 'down',
  onComplete: () => {
    isStarted.value = true;
    startQuestionTimer();
  }
});
startCountdown();

const handleAnswerClick = async (isCorrect: boolean) => {
  if (isQuestionAnswered.value) return; // Stop repeat clicks
  stopQuestionTimer();

  let playerResult: PlayerResult = {
    roomID: room.value!.id,
    playerID: id!,
    isCorrect: false,
    timeAnswered: timeLeft.value
  };
  isQuestionAnswered.value = true;

  if (isCorrect) {
    playerResult.isCorrect = true;
  }

  emit('answerQuestion', playerResult);
  // Showing the next question happens when the server sends the score result
}

const nextQuestion = () => {
  resetQuestionTimer();
  if (currentQuestion.value < questionCount - 1) {
    currentQuestion.value += 1;

    const current = questions[currentQuestion.value];
    if (!current) return;

    const choices = shuffleAnswers(current);
    if (!choices.ok) {
      showError(choices.error.message);
      console.error(choices.error);
      return;
    }

    currentChoices.value = decodeAnswerChoices(choices.value);

    startQuestionTimer();
  } else {
    // TODO: new scoreboard history system for multiplayer
    router.push({name: 'index',})
  }
}

onMounted(async () => {
  await nextTick();

  opponentName.value = (room.value!.player1.id === id) ? room.value!.player2.name : room.value!.player1.name;

  const current = questions[currentQuestion.value];
  if (!current) return;

  const choices = shuffleAnswers(current);
  if (!choices.ok) {
    showError(choices.error.message);
    console.error(choices.error);
    return;
  }

  cleanupFunctions.push(
      on('resultDecided', (winnerID) => {
        if (winnerID === null) {
          lastResult.value = 'tie';
        } else if (id === winnerID) {
          winHistory.push(true);
          score.value++;
          lastResult.value = 'win';
        } else {
          winHistory.push(false);
          lastResult.value = 'loss';
        }
        showWinner.value = true;

        // Move to next question after 1.5 seconds
        setTimeout(() => {
          isQuestionAnswered.value = false;
          showWinner.value = false;
          lastResult.value = null;
          nextQuestion();
        }, 1500);
      }), on('matchCancelled', (reason: string) => {
        showError(reason);
        setTimeout(() => {
          router.push('/matchmaking');
          return;
        }, 1500);
      })
  );

  currentChoices.value = decodeAnswerChoices(choices.value);
});

onUnmounted(() => {
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions.length = 0;

  // Socket disconnect is handled by router navigation guard
})

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

    <!-- Game timer box -->
    <div v-if="!isStarted" class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6">
      <h1 class="mb-8 text-5xl font-bold text-center text-white">Game Starting In</h1>
      <h1 class="mb-8 text-8xl font-bold text-center text-white">{{timeUntilStart}}</h1>
      <h1 class="mt-8 text-2xl font-bold text-center text-white">Opponent: {{opponentName}}</h1>
    </div>

    <!-- Game box -->
    <div v-if="isStarted" class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between mb-5">
        <p>Question {{ currentQuestion + 1 }}/{{ questionCount }}</p>
        <p>Score: {{ score }}/{{ questionCount }}</p>
        <p>Time Remaining: {{timeLeft}}</p>
      </div>
      <p class="mb-4">{{ decodeHtml(questions[currentQuestion]?.question || '') }}</p>
      <div v-for="choice in currentChoices" :key="choice.answer" :value="choice" class="mb-2">
        <answer-box :choice="choice" @answer-clicked="handleAnswerClick" :disabled="isQuestionAnswered" :show-correct-answer="isQuestionAnswered"/>
      </div>
    </div>

    <!-- Result display -->
    <div v-if="isStarted" class="max-w-md mx-auto bg-zinc-800 rounded-lg shadow-4xl p-4 md:p-6 my-4">
      <p v-if="!isQuestionAnswered" class="text-center text-2xl md:text-3xl font-bold p-2 text-gray-400">
        Waiting For Answer
      </p>
      <p v-else-if="showWinner && lastResult === 'win'" class="text-center text-2xl md:text-3xl font-bold p-2 text-green-500">
        Your Point
      </p>
      <p v-else-if="showWinner && lastResult === 'loss'" class="text-center text-2xl md:text-3xl font-bold p-2 text-red-500">
        {{opponentName}}'s Point
      </p>
      <p v-else-if="showWinner && lastResult === 'tie'" class="text-center text-2xl md:text-3xl font-bold p-2 text-yellow-500">
        Tie
      </p>
      <p v-else class="text-center text-2xl md:text-3xl font-bold p-2 text-blue-400">
        Waiting For {{opponentName}}...
      </p>
    </div>
  </div>
</template>
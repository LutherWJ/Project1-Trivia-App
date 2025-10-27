<script setup lang="ts">
import { ref } from 'vue'
import type { AnswerChoice } from '../types'

interface Props {
  choice: AnswerChoice
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answerClicked: [isCorrect: boolean]
}>()

const clicked = ref(false)

const handleClick = () => {
  if (!clicked.value) {
    clicked.value = true
    emit('answerClicked', props.choice.isCorrect)
  }
}
</script>

<template>
  <button
    @click="handleClick"
    :class="{
      'bg-green-500 hover:bg-green-500': clicked && choice.isCorrect,
      'bg-red-500 hover:bg-red-500': clicked && !choice.isCorrect,
      'bg-blue-500 hover:bg-blue-600': !clicked
    }"
    class="w-full p-4 rounded-lg text-white font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-pointer"
    :disabled="clicked"
  >
    {{ choice.answer }}
  </button>
</template>
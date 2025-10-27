<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useErrorMessage } from './utils/errorHandler'

const errorMessage = useErrorMessage()
</script>

<template>
  <RouterView />

  <!-- Error Popup -->
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 translate-y-[-1rem]"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-[-1rem]"
  >
    <div
      v-if="errorMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md"
    >
      <p class="font-semibold">{{ errorMessage }}</p>
    </div>
  </Transition>
</template>

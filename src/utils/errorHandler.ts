import { ref } from 'vue'

const errorMessage = ref<string | null>(null)
let timeoutId: ReturnType<typeof setTimeout> | null = null

export function showError(message: string) {
  errorMessage.value = message

  // Clear existing timeout if there is one
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  // Auto-hide after 2 seconds
  timeoutId = setTimeout(() => {
    errorMessage.value = null
    timeoutId = null
  }, 2000)
}

export function useErrorMessage() {
  return errorMessage
}

import { ref, onUnmounted } from 'vue'

export interface UseTimerOptions {
  initialTime?: number
  direction?: 'up' | 'down'
  onComplete?: () => void
  onTick?: (currentTime: number) => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const {
    initialTime = 0,
    direction = 'up',
    onComplete,
    onTick
  } = options

  const time = ref(initialTime)
  const isRunning = ref(false)
  let intervalId: number | null = null

  const start = () => {
    if (isRunning.value) return

    isRunning.value = true
    intervalId = window.setInterval(() => {
      if (direction === 'up') {
        time.value++
      } else {
        time.value--

        // Check if countdown reached zero
        if (time.value <= 0) {
          time.value = 0
          stop()
          onComplete?.()
        }
      }

      onTick?.(time.value)
    }, 1000)
  }

  const stop = () => {
    if (!isRunning.value) return

    isRunning.value = false
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const reset = () => {
    stop()
    time.value = initialTime
  }

  // Clean up interval on unmount
  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    time,
    isRunning,
    start,
    stop,
    reset,
  }
}

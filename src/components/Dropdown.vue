<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  options: string[] // Options in the dropdown will be decided by the contents of this array
  defaultValue?: string
}>(), {
  defaultValue: ''
});

const selectedValue = ref<string>(props.defaultValue)

// Watch for changes to defaultValue prop and update selectedValue
watch(() => props.defaultValue, (newValue) => {
  selectedValue.value = newValue;
});

// Expose selectedValue so parent can access it directly
defineExpose({
  selectedValue
})
</script>

<template>
  <select
    v-model="selectedValue"
    class="w-full max-w-full px-4 py-2 border border-gray-600 rounded-md bg-zinc-700 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
    <option v-for="option in props.options" :key="option" :value="option" class="bg-zinc-700 text-white">
      {{ option }}
    </option>
  </select>
</template>
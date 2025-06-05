<template>
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-base-300 bg-base-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-base-content">{{ noteTitle }}</h2>
          <p class="text-sm text-base-content/70">{{ formattedDate }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Auto-save indicator -->
          <div class="flex items-center text-xs text-base-content/50">
            <i class="fas fa-save mr-1"></i>
            <span>{{ saveStatus }}</span>
          </div>
          <!-- Storage indicator -->
          <div class="badge badge-outline badge-xs">
            {{ isLoggedIn ? 'Cloud' : 'Local' }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Note Editor -->
    <div class="flex-1 p-4">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value); $emit('noteChange')"
        class="textarea textarea-ghost w-full h-full resize-none text-base leading-relaxed note-editor"
        placeholder="Start writing your thoughts for today..."
        style="min-height: calc(100vh - 200px);"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, formatNoteTitle } from '@/utils/dateHelpers'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  selectedDate: {
    type: String,
    required: true
  },
  saveStatus: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

defineEmits(['update:modelValue', 'noteChange'])

const noteTitle = computed(() => {
  return formatNoteTitle(props.selectedDate)
})

const formattedDate = computed(() => {
  return formatDate(props.selectedDate)
})
</script>
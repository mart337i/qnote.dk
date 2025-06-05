<template>
  <div class="w-64 bg-base-200 border-r border-base-300 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-base-300">
      <h1 class="text-xl font-bold text-base-content">Daily Notes</h1>
    </div>
    
    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Recent Notes -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-base-content/70 mb-2">Recent Notes</h3>
        <div class="space-y-1">
          <div 
            v-for="note in recentNotes" 
            :key="note.date"
            @click="$emit('selectNote', note.date)"
            class="p-2 rounded cursor-pointer transition-colors hover:bg-base-300"
            :class="{ 'bg-primary text-primary-content': selectedDate === note.date }"
          >
            <div class="text-sm font-medium">{{ note.title }}</div>
            <div class="text-xs opacity-70">{{ formatDate(note.date) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Theme Selector -->
    <ThemeSelector />

    <!-- User Profile -->
    <UserProfile 
      :is-logged-in="isLoggedIn"
      :user-name="userName"
      @toggle-login="$emit('toggleLogin')"
      @logout="$emit('logout')"
    />
  </div>
</template>

<script setup>
import ThemeSelector from './ThemeSelector.vue'
import UserProfile from './UserProfile.vue'
import { formatDate } from '@/utils/dateHelpers'

defineProps({
  recentNotes: {
    type: Array,
    required: true
  },
  selectedDate: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  userName: {
    type: String,
    required: true
  }
})

defineEmits(['selectNote', 'toggleLogin', 'logout'])
</script>
<template>
  <nav class="w-64 bg-base-200 border-r border-base-300 flex flex-col h-screen" role="navigation" aria-label="Notes navigation">
    <!-- Header -->
    <div class="p-4 border-b border-base-300 flex-shrink-0">
      <h1 class="text-xl font-bold text-base-content">Daily Notes</h1>
    </div>
   
    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto p-4 min-h-0">
      <!-- Daily Categories -->
      <div>
        <div class="space-y-2">
          <div
            v-for="dayGroup in groupedNotes"
            :key="dayGroup.date"
            class="border border-base-300 rounded-lg"
          >
            <!-- Day Header -->
            <button
              @click="toggleDay(dayGroup.date)"
              class="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-base-300 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary"
              :class="{ 'rounded-b-lg': !expandedDays.has(dayGroup.date) }"
              :aria-expanded="expandedDays.has(dayGroup.date)"
              :aria-controls="`notes-${dayGroup.date}`"
              :aria-label="`Toggle notes for ${dayGroup.title}`"
            >
              <div class="flex-1">
                <div class="text-sm font-medium text-base-content">{{ dayGroup.title }}</div>
                <div class="text-xs text-base-content/70">{{ formatDate(dayGroup.date) }}</div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="badge badge-xs">{{ dayGroup.notes.length }}</span>
                <i
                  class="fas fa-chevron-down text-xs transition-transform"
                  :class="{ 'rotate-180': expandedDays.has(dayGroup.date) }"
                ></i>
              </div>
            </button>

            <!-- Notes List (Collapsible) -->
            <div
              v-if="expandedDays.has(dayGroup.date)"
              class="border-t border-base-300"
              :id="`notes-${dayGroup.date}`"
              role="region"
              :aria-label="`Notes for ${dayGroup.title}`"
            >
              <!-- Existing Notes -->
              <div
                v-for="note in dayGroup.notes"
                :key="note.id"
                @click="$emit('selectNote', dayGroup.date, note.id)"
                class="flex items-center justify-between p-2 mx-2 my-1 rounded cursor-pointer transition-colors hover:bg-base-300 group"
                :class="{ 'bg-primary text-primary-content': selectedDate === dayGroup.date && selectedNoteId === note.id }"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ note.title || 'Untitled Note' }}</div>
                  <div class="text-xs opacity-70">{{ formatTime(note.updatedAt) }}</div>
                </div>
                <button
                  @click.stop="$emit('deleteNote', dayGroup.date, note.id)"
                  class="ml-2 px-2 py-1 text-base-content/60 hover:text-error hover:bg-error/10 rounded transition-all text-sm focus:outline-none focus:ring-2 focus:ring-error"
                  :aria-label="`Delete note: ${note.title || 'Untitled Note'}`"
                >
                  ×
                </button>
              </div>

              <!-- Add New Note Button -->
              <div class="p-2">
                <button
                  @click="$emit('createNote', dayGroup.date)"
                  class="w-full p-2 border-2 border-dashed border-base-content/30 rounded text-sm text-base-content/70 hover:border-primary hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Add new note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="flex-shrink-0 mt-auto">
      <!-- Quick Actions -->
      <div class="p-4 border-t border-base-300">
        <div class="space-y-1">
          <button
            @click="$emit('createNote', getCurrentDate())"
            class="w-full text-left p-2 text-sm text-base-content/70 hover:text-primary hover:bg-primary/5 rounded transition-all"
          >
            <i class="fas fa-plus w-4 mr-2 text-xs"></i>
            New note today
          </button>
          <button
            @click="$emit('selectNote', getCurrentDate())"
            class="w-full text-left p-2 text-sm text-base-content/70 hover:text-primary hover:bg-primary/5 rounded transition-all"
          >
            <i class="fas fa-calendar-day w-4 mr-2 text-xs"></i>
            Go to today
          </button>
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
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ThemeSelector from './ThemeSelector.vue'
import UserProfile from './UserProfile.vue'
import { formatDate, formatNoteTitle, formatTime } from '@/utils/dateHelpers'
import DOMPurify from 'dompurify'

const props = defineProps({
  notesByDay: {
    type: Object,
    required: true,
    default: () => ({})
  },
  selectedDate: {
    type: String,
    required: true
  },
  selectedNoteId: {
    type: String,
    default: null
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

defineEmits(['selectNote', 'createNote', 'deleteNote', 'toggleLogin', 'logout'])

const expandedDays = ref(new Set())

// Auto-expand today's section and the selected date section
onMounted(() => {
  const today = getCurrentDate()
  expandedDays.value.add(today)
  if (props.selectedDate && props.selectedDate !== today) {
    expandedDays.value.add(props.selectedDate)
  }
})

// Watch for selected date changes and auto-expand that day
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    expandedDays.value.add(newDate)
  }
})

const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

const groupedNotes = computed(() => {
  const groups = []
  
  // Get all dates and sort them chronologically (newest first)
  const allDates = Object.keys(props.notesByDay)
  const today = getCurrentDate()
  
  // Ensure today is always included
  if (!allDates.includes(today)) {
    allDates.push(today)
  }
  
  // Sort dates in descending order (newest first) - this order won't change
  const sortedDates = allDates.sort((a, b) => new Date(b) - new Date(a))
  
  for (const date of sortedDates) {
    const dayData = props.notesByDay[date]
    
    // Handle mixed data - ensure we always have an array
    let notes = []
    if (Array.isArray(dayData)) {
      notes = dayData
    } else if (typeof dayData === 'string' && dayData.trim()) {
      // Convert old string format to new format
      notes = [{
        id: `converted_${date}_${Date.now()}`,
        title: extractTitleFromContent(dayData),
        content: dayData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    }
    
    // Sort notes within each day by time (most recent first)
    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    
    groups.push({
      date,
      title: formatNoteTitle(date),
      notes: sortedNotes
    })
  }
  
  return groups
})

// Helper function to extract title from content
const extractTitleFromContent = (content) => {
  if (!content) return 'Untitled Note'
  
  try {
    // Sanitize content first, then strip HTML and get first line
    const sanitizedContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })
    const firstLine = sanitizedContent.split('\n')[0].trim()
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...'
    }
    return firstLine || 'Untitled Note'
  } catch (error) {
    console.error('Error extracting title from content:', error)
    return 'Untitled Note'
  }
}

const toggleDay = (date) => {
  if (expandedDays.value.has(date)) {
    expandedDays.value.delete(date)
  } else {
    expandedDays.value.add(date)
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
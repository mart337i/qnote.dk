import { ref, onMounted, watch } from 'vue'
import { getTodayDate } from '@/utils/dateHelpers'
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/storage'

export function useNotes() {
  const currentNote = ref('')
  const selectedDate = ref(getTodayDate())
  const notes = ref({})

  function selectNote(date) {
    // Save current note before switching
    if (currentNote.value.trim()) {
      notes.value[selectedDate.value] = currentNote.value
    }
    
    selectedDate.value = date
    currentNote.value = notes.value[date] || ''
    saveToLocalStorage(notes.value, currentNote.value, selectedDate.value)
  }

  function handleNoteChange() {
    // This will be handled by the auto-save composable
    // but we need to update the notes object
    if (currentNote.value.trim()) {
      notes.value[selectedDate.value] = currentNote.value
    }
  }

  function initializeNotes() {
    const savedData = loadFromLocalStorage()
    if (savedData.notes) {
      notes.value = savedData.notes
    }
    if (savedData.currentNote) {
      currentNote.value = savedData.currentNote
    }
    if (savedData.selectedDate) {
      selectedDate.value = savedData.selectedDate
    }

    // Load today's note if no date is selected
    if (!currentNote.value && selectedDate.value === getTodayDate()) {
      currentNote.value = notes.value[selectedDate.value] || ''
    }
  }

  // Auto-save on page unload
  function setupUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      if (currentNote.value.trim()) {
        notes.value[selectedDate.value] = currentNote.value
        saveToLocalStorage(notes.value, currentNote.value, selectedDate.value)
      }
    })
  }

  onMounted(() => {
    initializeNotes()
    setupUnloadHandler()
  })

  // Watch for changes to sync notes
  watch(currentNote, () => {
    if (currentNote.value.trim()) {
      notes.value[selectedDate.value] = currentNote.value
    }
  })

  return {
    currentNote,
    selectedDate,
    notes,
    selectNote,
    handleNoteChange
  }
}
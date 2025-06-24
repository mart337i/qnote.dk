import { ref, watch } from 'vue'
import { saveToLocalStorage } from '@/utils/storage'
import { AUTO_SAVE_DELAY } from '@/utils/constants'

export function useAutoSave(currentNote, selectedDate, notes, isLoggedIn) {
  const saveStatus = ref('Saved')
  const autoSaveTimer = ref(null)

  async function saveToDatabase() {
    if (!isLoggedIn.value) return
    
    try {
      // This would be your actual API call
      // const response = await fetch('/api/notes', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //         'Authorization': `Bearer ${userToken}`
      //     },
      //     body: JSON.stringify({
      //         date: selectedDate.value,
      //         content: currentNote.value,
      //         notes: notes.value
      //     })
      // });
      
      // Mock database save - replace with actual API call
      
      saveStatus.value = 'Synced to cloud'
      setTimeout(() => {
        saveStatus.value = 'Saved'
      }, 2000)
    } catch (error) {
      console.error('Failed to save to database:', error)
      saveStatus.value = 'Sync failed'
    }
  }

  function triggerAutoSave() {
    saveStatus.value = 'Saving...'
    
    // Clear existing timer
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    
    // Set new timer for auto-save
    autoSaveTimer.value = setTimeout(() => {
      notes.value[selectedDate.value] = currentNote.value
      saveToLocalStorage(notes.value, currentNote.value, selectedDate.value)
      saveToDatabase()
      saveStatus.value = 'Saved'
    }, AUTO_SAVE_DELAY) // Auto-save after defined delay
  }

  // Watch for note changes to trigger auto-save
  watch(currentNote, () => {
    if (currentNote.value.trim()) {
      triggerAutoSave()
    }
  })

  return {
    saveStatus,
    triggerAutoSave
  }
}
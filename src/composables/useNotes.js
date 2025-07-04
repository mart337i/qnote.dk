import { ref, computed, watch } from 'vue'
import { getCurrentDate } from '@/utils/dateHelpers'
import { generateId } from '@/utils/helpers'


export function useNotes() {
  // Clean data structure: { "2025-06-06": [{ id, title, content, createdAt, updatedAt }] }
  const notes = ref({})
  const selectedDate = ref(getCurrentDate())
  const selectedNoteId = ref(null)

  // Load notes from localStorage
  const loadNotes = () => {
    try {
      const saved = localStorage.getItem('dailyNotes')
      const savedDate = localStorage.getItem('selectedDate')
      const savedNoteId = localStorage.getItem('selectedNoteId')
      
      if (saved) {
        notes.value = JSON.parse(saved)
        
        // Migrate existing notes to include title field
        Object.keys(notes.value).forEach(date => {
          notes.value[date].forEach(note => {
            if (!note.title) {
              note.title = 'Untitled Note'
            }
          })
        })
      }
      
      if (savedDate) {
        selectedDate.value = savedDate
      }
      
      if (savedNoteId && notes.value[selectedDate.value]) {
        const dayNotes = notes.value[selectedDate.value] || []
        const noteExists = dayNotes.find(n => n.id === savedNoteId)
        if (noteExists) {
          selectedNoteId.value = savedNoteId
        }
      }
      
      // Ensure we have a note selected for today
      ensureTodayNote()
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  // Debounced save to prevent excessive localStorage writes
  let saveTimeout = null
  const saveNotes = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem('dailyNotes', JSON.stringify(notes.value))
        localStorage.setItem('selectedDate', selectedDate.value)
        localStorage.setItem('selectedNoteId', selectedNoteId.value || '')
      } catch (error) {
        console.error('Failed to save notes:', error)
      }
    }, 1000) // 1000ms debounce to reduce interference
  }

  // Ensure today has at least one note
  const ensureTodayNote = () => {
    const today = getCurrentDate()
    if (!notes.value[today] || notes.value[today].length === 0) {
      createNote(today)
    } else if (!selectedNoteId.value) {
      // Select the most recent note for today (avoid mutating original array)
      const todayNotes = [...notes.value[today]]
      const latestNote = todayNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
      selectedNoteId.value = latestNote.id
      selectedDate.value = today
    }
  }

  // Current note content
  const currentNote = computed({
    get() {
      if (!selectedDate.value || !selectedNoteId.value) return ''
      const dayNotes = notes.value[selectedDate.value] || []
      const note = dayNotes.find(n => n.id === selectedNoteId.value)
      return note?.content || ''
    },
    set(value) {
      if (!selectedDate.value || !selectedNoteId.value) return
      
      const dayNotes = notes.value[selectedDate.value] || []
      const noteIndex = dayNotes.findIndex(n => n.id === selectedNoteId.value)
      
      if (noteIndex >= 0) {
        dayNotes[noteIndex].content = value
        dayNotes[noteIndex].updatedAt = new Date().toISOString()
        saveNotes()
      }
    }
  })

  // Select a note
  const selectNote = (date, noteId = null) => {
    selectedDate.value = date
    
    if (noteId) {
      selectedNoteId.value = noteId
    } else {
      // If no specific note ID, select the first note for that day or create one
      const dayNotes = notes.value[date] || []
      if (dayNotes.length > 0) {
        selectedNoteId.value = dayNotes[0].id
      } else {
        createNote(date)
      }
    }
    
    saveNotes()
  }

  // Create a new note
  const createNote = (date) => {
    const newNote = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (!notes.value[date]) {
      notes.value[date] = []
    }
    
    notes.value[date].unshift(newNote)
    selectedDate.value = date
    selectedNoteId.value = newNote.id
    
    saveNotes()
  }

  // Delete a note
  const deleteNote = (date, noteId) => {
    const dayNotes = notes.value[date] || []
    const noteIndex = dayNotes.findIndex(n => n.id === noteId)
    
    if (noteIndex >= 0) {
      dayNotes.splice(noteIndex, 1)
      
      // If we deleted the currently selected note, select another one
      if (selectedNoteId.value === noteId) {
        if (dayNotes.length > 0) {
          selectedNoteId.value = dayNotes[0].id
        } else if (date === getCurrentDate()) {
          // If it's today and no notes left, create a new one
          createNote(date)
        } else {
          // Switch to today
          selectNote(getCurrentDate())
        }
      }
      
      // Clean up empty days
      if (dayNotes.length === 0) {
        delete notes.value[date]
      }
      
      saveNotes()
    }
  }

  // Handle note changes
  const handleNoteChange = () => {
    // This function is called when the note content changes
    // The actual saving happens in the currentNote setter
  }

  // Update note title
  const updateNoteTitle = (title) => {
    console.log('updateNoteTitle called with:', title)
    if (!selectedDate.value || !selectedNoteId.value) return
    
    const dayNotes = notes.value[selectedDate.value] || []
    const noteIndex = dayNotes.findIndex(n => n.id === selectedNoteId.value)
    
    if (noteIndex >= 0) {
      dayNotes[noteIndex].title = title || 'Untitled Note'
      dayNotes[noteIndex].updatedAt = new Date().toISOString()
      saveNotes()
    }
  }

  // Get current note title
  const currentNoteTitle = computed(() => {
    if (!selectedDate.value || !selectedNoteId.value) return ''
    const dayNotes = notes.value[selectedDate.value] || []
    const note = dayNotes.find(n => n.id === selectedNoteId.value)
    return note?.title || ''
  })

  // Watch for date changes to auto-switch to today
  watch(() => getCurrentDate(), (newDate) => {
    if (selectedDate.value < newDate) {
      selectNote(newDate)
    }
  })

  // Initialize
  loadNotes()

  return {
    notes,
    currentNote,
    currentNoteTitle,
    selectedDate,
    selectedNoteId,
    selectNote,
    createNote,
    deleteNote,
    handleNoteChange,
    updateNoteTitle
  }
}
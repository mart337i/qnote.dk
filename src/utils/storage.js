import { STORAGE_KEYS } from './constants'

export function saveToLocalStorage(notes, currentNote, selectedDate) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_NOTES, JSON.stringify(notes))
    localStorage.setItem(STORAGE_KEYS.CURRENT_NOTE, currentNote)
    localStorage.setItem(STORAGE_KEYS.SELECTED_DATE, selectedDate)
    console.log('Notes saved to localStorage')
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export function loadFromLocalStorage() {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEYS.DAILY_NOTES)
    const savedCurrentNote = localStorage.getItem(STORAGE_KEYS.CURRENT_NOTE)
    const savedSelectedDate = localStorage.getItem(STORAGE_KEYS.SELECTED_DATE)

    return {
      notes: savedNotes ? JSON.parse(savedNotes) : {},
      currentNote: savedCurrentNote || '',
      selectedDate: savedSelectedDate || null
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return {
      notes: {},
      currentNote: '',
      selectedDate: null
    }
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_THEME, theme)
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error)
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_THEME)
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error)
    return null
  }
}

export function clearStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('Storage cleared')
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}
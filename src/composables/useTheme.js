import { ref, onMounted } from 'vue'
import { saveTheme, loadTheme } from '@/utils/storage'
import { AVAILABLE_THEMES } from '@/utils/constants'

export function useTheme() {
  const currentTheme = ref('lofi')

  function changeTheme(newTheme) {
    if (!AVAILABLE_THEMES.includes(newTheme)) {
      console.warn(`Theme "${newTheme}" is not available`)
      return
    }
    
    currentTheme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    saveTheme(newTheme)
  }

  function initializeTheme() {
    const savedTheme = loadTheme()
    if (savedTheme && AVAILABLE_THEMES.includes(savedTheme)) {
      currentTheme.value = savedTheme
    }
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  onMounted(() => {
    initializeTheme()
  })

  return {
    currentTheme,
    availableThemes: AVAILABLE_THEMES,
    changeTheme
  }
}
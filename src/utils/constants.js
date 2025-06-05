export const AVAILABLE_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter'
]

export const STORAGE_KEYS = {
  DAILY_NOTES: 'dailyNotes',
  CURRENT_NOTE: 'currentNote',
  SELECTED_DATE: 'selectedDate',
  SELECTED_THEME: 'selectedTheme'
}

export const AUTO_SAVE_DELAY = 1000 // 1 second

export const API_ENDPOINTS = {
  NOTES: '/api/notes',
  AUTH: '/api/auth',
  USER: '/api/user'
}
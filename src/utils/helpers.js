// Generate unique IDs for notes
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Debounce function for auto-saving
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Format time for display (e.g., "2:30 PM")
export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Check if a date is today
export const isToday = (date) => {
  return date === getCurrentDate()
}

// Check if a date is yesterday
export const isYesterday = (date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date === yesterday.toISOString().split('T')[0]
}

// Get relative date string (Today, Yesterday, or formatted date)
export const getRelativeDateString = (date) => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  
  const dateObj = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - dateObj)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) {
    return dateObj.toLocaleDateString([], { weekday: 'long' })
  }
  
  return dateObj.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
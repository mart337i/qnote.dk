// Format date for display (e.g., "Monday, January 15, 2024")
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format note title with relative dates (Today, Yesterday, etc.)
export const formatNoteTitle = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Reset time components for accurate comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today'
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday'
  } else {
    // Check if it's within the current week
    const diffTime = Math.abs(todayOnly - dateOnly)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 6) {
      return date.toLocaleDateString([], { weekday: 'long' })
    }
    
    // For older dates, show month and day
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
}

// Alias for formatNoteTitle (backward compatibility)
export const getTitleForDate = formatNoteTitle

// Format time for display (e.g., "2:30 PM")
export const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

// Alias for getCurrentDate (backward compatibility)
export const getTodayDate = getCurrentDate

// Check if a date is today
export const isToday = (dateString) => {
  return dateString === getCurrentDate()
}

// Check if a date is yesterday
export const isYesterday = (dateString) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateString === yesterday.toISOString().split('T')[0]
}

// Parse date string and return Date object
export const parseDate = (dateString) => {
  return new Date(dateString)
}

// Get date string from Date object
export const getDateString = (date) => {
  return date.toISOString().split('T')[0]
}
export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function getTitleForDate(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date === getTodayDate()) {
    return "Today's Notes"
  } else if (date === yesterday.toISOString().split('T')[0]) {
    return "Yesterday's Notes"
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

export function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatNoteTitle(date) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
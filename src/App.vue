<template>
  <div class="h-screen bg-base-100 flex">
    <Sidebar 
      :recent-notes="recentNotes"
      :selected-date="selectedDate"
      :is-logged-in="isLoggedIn"
      :user-name="userName"
      @select-note="selectNote"
      @toggle-login="toggleLogin"
      @logout="logout"
    />
    
    <NoteEditor
      v-model="currentNote"
      :selected-date="selectedDate"
      :save-status="saveStatus"
      :is-logged-in="isLoggedIn"
      @note-change="handleNoteChange"
    />
    
    <LoginModal
      :show="showLoginModal"
      :form="loginForm"
      @login="login"
      @close="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import NoteEditor from './components/NoteEditor.vue'
import LoginModal from './components/LoginModal.vue'
import { useNotes } from './composables/useNotes'
import { useAuth } from './composables/useAuth'
import { useAutoSave } from './composables/useAutoSave'
import { getTitleForDate } from './utils/dateHelpers'

// Composables
const {
  currentNote,
  selectedDate,
  notes,
  selectNote,
  handleNoteChange
} = useNotes()

const {
  isLoggedIn,
  userName,
  showLoginModal,
  loginForm,
  toggleLogin,
  closeLoginModal,
  login,
  logout
} = useAuth()

const {
  saveStatus
} = useAutoSave(currentNote, selectedDate, notes, isLoggedIn)

// Computed properties
const recentNotes = computed(() => {
  return Object.keys(notes.value)
    .sort((a, b) => new Date(b) - new Date(a))
    .slice(0, 10)
    .map(date => ({
      date,
      title: getTitleForDate(date),
      content: notes.value[date]
    }))
})
</script>
<template>
  <div class="h-screen bg-base-100 flex overflow-hidden">
    <Sidebar
      :notes-by-day="notes"
      :selected-date="selectedDate"
      :selected-note-id="selectedNoteId"
      :is-logged-in="isLoggedIn"
      :user-name="userName"
      @select-note="selectNote"
      @create-note="createNote"
      @delete-note="deleteNote"
      @toggle-login="toggleLogin"
      @logout="logout"
    />
   
    <NoteEditor
      v-model="currentNote"
      :selected-date="selectedDate"
      :selected-note-id="selectedNoteId"
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
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import NoteEditor from './components/NoteEditor.vue'
import LoginModal from './components/LoginModal.vue'
import { useNotes } from './composables/useNotes'
import { useAuth } from './composables/useAuth'

// Composables
const {
  currentNote,
  selectedDate,
  selectedNoteId,
  notes,
  selectNote,
  createNote,
  deleteNote,
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

// Simple save status (since we're handling saving in useNotes)
const saveStatus = ref('All changes saved')
</script>
import { ref, computed } from 'vue'

export function useAuth() {
  const isLoggedIn = ref(false)
  const userName = ref('')
  const showLoginModal = ref(false)
  const loginForm = ref({ email: '', password: '' })

  const userInitials = computed(() => {
    return userName.value.split(' ').map(n => n[0]).join('').toUpperCase()
  })

  function toggleLogin() {
    showLoginModal.value = true
  }

  function closeLoginModal() {
    showLoginModal.value = false
    loginForm.value = { email: '', password: '' }
  }

  function login() {
    // Mock login - replace with actual authentication
    if (loginForm.value.email && loginForm.value.password) {
      isLoggedIn.value = true
      userName.value = loginForm.value.email.split('@')[0]
      showLoginModal.value = false
      loginForm.value = { email: '', password: '' }
      
      // Could trigger cloud sync here
    }
  }

  function logout() {
    isLoggedIn.value = false
    userName.value = ''
  }

  return {
    isLoggedIn,
    userName,
    showLoginModal,
    loginForm,
    userInitials,
    toggleLogin,
    closeLoginModal,
    login,
    logout
  }
}
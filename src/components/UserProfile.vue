<template>
  <div class="p-4 border-t border-base-300">
    <button 
      v-if="!isLoggedIn"
      @click="$emit('toggleLogin')"
      class="btn btn-ghost btn-sm w-full justify-start"
    >
      <i class="fas fa-sign-in-alt mr-2"></i>
      Sign In
    </button>
    <div v-else class="flex items-center justify-between">
      <div class="flex items-center">
        <div class="avatar placeholder mr-2">
          <div class="bg-primary text-primary-content rounded-full w-6">
            <span class="text-xs">{{ userInitials }}</span>
          </div>
        </div>
        <span class="text-sm">{{ userName }}</span>
      </div>
      <button @click="$emit('logout')" class="btn btn-ghost btn-xs">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  userName: {
    type: String,
    required: true
  }
})

defineEmits(['toggleLogin', 'logout'])

const userInitials = computed(() => {
  if (!props.userName) return ''
  return props.userName.split(' ').map(n => n[0]).join('').toUpperCase()
})
</script>
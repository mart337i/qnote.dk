<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Sign In</h3>
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            class="input input-bordered" 
            placeholder="your@email.com"
            @keyup.enter="$emit('login')"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input 
            v-model="form.password" 
            type="password" 
            class="input input-bordered" 
            placeholder="Enter password"
            @keyup.enter="$emit('login')"
          />
        </div>
        <div v-if="error" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
      <div class="modal-action">
        <button 
          @click="$emit('login')" 
          class="btn btn-primary"
          :disabled="!form.email || !form.password"
        >
          Sign In
        </button>
        <button @click="$emit('close')" class="btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  form: {
    type: Object,
    required: true
  }
})

defineEmits(['login', 'close'])

const error = ref('')
</script>
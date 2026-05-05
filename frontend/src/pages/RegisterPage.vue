<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Please enter a valid email'
})

const passwordError = computed(() => {
  if (!password.value) return ''
  return password.value.length >= 8 ? '' : 'Password must be at least 8 characters'
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return ''
  return confirmPassword.value === password.value ? '' : 'Passwords do not match'
})

const isFormValid = computed(() => {
  return name.value.length > 0 &&
    email.value.length > 0 &&
    password.value.length >= 8 &&
    confirmPassword.value === password.value &&
    !emailError.value
})

async function handleRegister() {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  const result = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: confirmPassword.value,
  })

  isLoading.value = false

  if (result.success) {
    localStorage.setItem('user_role', authStore.user?.role || 'employee')
    router.push('/employee')
  } else {
    errorMessage.value = result.message || 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
        <p class="mt-2 text-sm text-gray-600">Join Attendance App</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <!-- Error Alert -->
        <div v-if="errorMessage"
          class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input id="name" v-model="name" type="text" autocomplete="name" placeholder="John Doe"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors" />
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input id="email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              :class="{ 'border-red-400 bg-red-50': emailError }" />
            <p v-if="emailError" class="mt-1.5 text-xs text-red-500">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input id="password" v-model="password" type="password" autocomplete="new-password"
              placeholder="Min. 8 characters"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              :class="{ 'border-red-400 bg-red-50': passwordError && password.length > 0 }" />
            <p v-if="passwordError && password.length > 0" class="mt-1.5 text-xs text-red-500">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <input id="confirmPassword" v-model="confirmPassword" type="password" autocomplete="new-password"
              placeholder="Repeat your password"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              :class="{ 'border-red-400 bg-red-50': confirmPasswordError && confirmPassword.length > 0 }" />
            <p v-if="confirmPasswordError && confirmPassword.length > 0" class="mt-1.5 text-xs text-red-500">
              {{ confirmPasswordError }}</p>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="!isFormValid || isLoading"
            class="w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200"
            :class="isFormValid && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-500/30'
              : 'bg-gray-300 cursor-not-allowed'">
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
            <span v-else>Create account</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200" />
          </div>
        </div>

        <!-- Login Link -->
        <p class="text-center text-sm text-gray-600">
          Already have an account?
          <a href="#" @click.prevent="router.push('/login')"
            class="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign in
          </a>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-400 mt-6">
        © 2026 Attendance App. All rights reserved.
      </p>
    </div>
  </div>
</template>
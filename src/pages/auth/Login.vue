<template>
  <q-page
    class="window-height window-width row justify-center items-center bg-primary"
    
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 500px; height: 485px">
          <q-card-section class="bg-primary">
            <h4 class="text-h5 text-white q-my-md">Sign In</h4>
            <div
              class="absolute-bottom-right q-pr-md"
              style="transform: translateY(50%)"
            >
              <q-btn fab icon="close" color="blue-4" />
            </div>
          </q-card-section>

          <!-- Show success message -->
          <p v-if="message" class="text-green-500 mb-4">{{ message }}</p>

          <!-- Show general errors -->
          <p v-if="errors.general" class="text-red-500 mb-4">
            {{ errors.general }}
          </p>
          <p v-if="errors.storage" class="text-red-500 mb-4">
            {{ errors.storage }}
          </p>
          <p v-if="errors.network" class="text-red-500 mb-4">
            {{ errors.network }}
          </p>

          <q-card-section>
            <q-form
              @submit.prevent="handleSubmit"
              class="q-px-sm q-pt-xl q-pb-lg"
            >
              <q-input
                square
                clearable
                v-model="formData.email"
                type="email"
                label="Email"
                :error="!!errors.email"
                :error-message="errors.email?.[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                square
                clearable
                v-model="formData.password"
                type="password"
                label="Password"
                :error="!!errors.password"
                :error-message="errors.password?.[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
              <q-card-actions class="q-px-lg">
                <q-btn
                  unelevated
                  size="lg"
                  color="blue-4"
                  class="full-width text-white"
                  label="Get Started"
                  type="submit"
                />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pa-sm">
            <p class="text-grey-6">
              Dont have an account? Click here to
              <router-link to="/register">Register</router-link>
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth"
import { onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

let authStore = null
try {
  authStore = useAuthStore()
} catch (e) {
  console.error('Failed to initialize auth store:', e)
}

// Use computed to safely access store state
const errors = computed(() => authStore?.errors || {})
const message = computed(() => authStore?.message || "")
const isAuthenticated = computed(() => authStore?.isAuthenticated || false)

const formData = reactive({
  email: '',
  password: '',
})

const handleSubmit = async () => {
  if (!authStore) return
  const result = await authStore.authenticate('login', formData, router)
  if (result && result.success && result.type === 'login') {
    // Redirect to dashboard after successful login
    router.replace({ name: 'dashboard' })
  } else if (result && result.status === 'unverified') {
  //   router.replace({
  //   path: '/verify-email',
  //   query: { email: formData.email }
  // })
  } else {
    console.log('Login failed, not redirecting')
  }
}

onMounted(() => {
  if (!authStore) return
  //check if already authenticated
  if (isAuthenticated.value) {
    router.replace({ name: 'dashboard' })
    return
  }
  authStore.errors = {}
  authStore.message = ''
})
</script>
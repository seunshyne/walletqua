<template>
  <q-page
    class="window-height window-width row justify-center items-center auth-page login-responsive login-moveup"
  >
    <div class="column login-col-responsive">
      <div class="row">
        <q-card square class="shadow-24 login-card-responsive">
          <q-card-section class="bg-primary">
            <h4 class="login-title-responsive text-white q-my-md">Sign In</h4>
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
              class="login-form-responsive"
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
              <q-card-actions class="login-actions-responsive">
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

          <q-card-section class="text-center login-section-responsive">
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

<style scoped>
.login-col-responsive {
  padding: 32px;
}
.login-card-responsive {
  width: 500px;
  height: 485px;
}
.login-title-responsive {
  font-size: 2rem;
}
.login-form-responsive {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 48px;
  padding-bottom: 32px;
}
.login-actions-responsive {
  padding-left: 32px;
  padding-right: 32px;
}
.login-section-responsive {
  padding: 16px;
}

@media (max-width: 599px) {
  .login-col-responsive {
    padding: 8px !important;
  }
  .login-card-responsive {
    width: 100% !important;
    min-width: 0;
    height: auto !important;
  }
  .login-title-responsive {
    font-size: 1.3rem !important;
  }
  .login-form-responsive {
    padding-left: 4px !important;
    padding-right: 4px !important;
    padding-top: 16px !important;
    padding-bottom: 8px !important;
  }
  .login-actions-responsive {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
  .login-section-responsive {
    padding: 4px !important;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .login-col-responsive {
    padding: 20px !important;
  }
  .login-card-responsive {
    width: 90% !important;
    min-width: 0;
    height: auto !important;
  }
  .login-title-responsive {
    font-size: 1.7rem !important;
  }
  .login-form-responsive {
    padding-left: 12px !important;
    padding-right: 12px !important;
    padding-top: 32px !important;
    padding-bottom: 16px !important;
  }
  .login-actions-responsive {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .login-section-responsive {
    padding: 8px !important;
  }
}
/* Move the login form up */
.login-moveup {
  margin-top: -48px;
}
</style>

<script setup>
import { useAuthStore } from "src/stores/auth"
import { onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
  console.log('Submitting login form with:', formData)
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
  
  // Check for verification status in URL
  const verified = route.query.verified
  if (verified === 'success') {
    authStore.message = 'Email verified successfully! You can now login.'
  } else if (verified === 'already') {
    authStore.message = 'Email already verified. Please login.'
  } else if (verified === 'invalid') {
    authStore.errors = { general: 'Invalid or expired verification link. Please request a new one.' }
  } else if (verified === 'error') {
    authStore.errors = { general: 'Verification failed. Please try again.' }
  }
})
</script>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const errors = computed(() => authStore.errors)
const message = computed(() => authStore.message)
const isLoading = computed(() => authStore.isLoading)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const formData = reactive({
  email: '',
  password: '',
})

const passwordVisibility = reactive({
  showPassword: false,
})

const handleSubmit = async () => {
  // router.push is handled inside the store's authenticate() action
  await authStore.authenticate('login', formData)
}

onMounted(() => {
  if (isAuthenticated.value) {
    // Already logged in — store's router will handle redirect,
    // but we can also push here as a safety net
    return
  }

  // Clear any stale errors/messages from previous navigation
  authStore.errors = {}
  authStore.message = ''

  // Handle email verification redirect messages
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

<template>
  <q-page class="auth-page">
    <div class="auth-shell">
      <q-card class="auth-card">
        <q-card-section class="auth-header">
          <div class="brand-row">
            <div class="brand-badge">
              <span class="brand-dot"></span>
              <span class="brand-core"></span>
            </div>
            <div class="brand-name">PrimeWallet</div>
          </div>
          <h2 class="auth-title">Welcome back</h2>
          <p class="auth-subtitle">Sign in to continue</p>
        </q-card-section>

        <!-- Success message -->
        <q-card-section v-if="message" class="q-pb-none">
          <p class="text-positive q-mb-none">{{ message }}</p>
        </q-card-section>

        <!-- Error messages -->
        <q-card-section v-if="errors.general || errors.network" class="q-pb-none">
          <p class="text-negative q-mb-none">
            {{ errors.general || errors.network }}
          </p>
        </q-card-section>

        <q-card-section class="auth-body">
          <q-form @submit.prevent="handleSubmit" class="auth-form">
            <div class="field-label">Email address</div>
            <q-input
              clearable
              v-model="formData.email"
              type="email"
              label="name@company.com"
              :error="!!errors.email"
              :error-message="errors.email?.[0]"
              class="auth-input"
              dense
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <div class="field-row">
              <div class="field-label">Password</div>
            </div>
            <q-input
              clearable
              v-model="formData.password"
              :type="passwordVisibility.showPassword ? 'text' : 'password'"
              label="Enter password"
              :error="!!errors.password"
              :error-message="errors.password?.[0]"
              class="auth-input"
              dense
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="passwordVisibility.showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisibility.showPassword = !passwordVisibility.showPassword"
                />
              </template>
            </q-input>

            <q-card-actions class="auth-actions">
              <q-btn
                unelevated
                size="lg"
                class="auth-submit full-width"
                label="Sign in"
                type="submit"
                :loading="isLoading"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>

        <q-card-section class="auth-footer">
          <p>
            No account?
            <router-link to="/register">Create one</router-link>
          </p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f9;
  padding: 32px 16px;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
}

.auth-shell {
  width: 100%;
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 420px;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(16, 24, 40, 0.08);
  background: #ffffff;
  border: 1px solid #e6ebf2;
}

.auth-header {
  text-align: center;
  padding: 32px 36px 8px;
}

.brand-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.brand-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #0b1221;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.2);
}

.brand-dot {
  width: 14px;
  height: 14px;
  border-radius: 6px;
  background: #3dd2cc;
  display: block;
}

.brand-core {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 2px solid rgba(61, 210, 204, 0.45);
  position: absolute;
}

.brand-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #111827;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #111827;
}

.auth-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.auth-body {
  padding: 8px 36px 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.auth-input :deep(.q-field__control) {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  min-height: 50px;
  padding: 6px 12px;
  background: #ffffff;
}

.auth-input :deep(.q-field__control:hover) {
  border-color: #cbd5e1;
}

.auth-input :deep(.q-field__control:before),
.auth-input :deep(.q-field__control:after) {
  display: none;
}

.auth-input :deep(.q-field__native) {
  font-size: 0.95rem;
  color: #0f172a;
}

.auth-input :deep(.q-field__label) {
  color: #94a3b8;
  font-size: 0.9rem;
}

.auth-actions {
  padding: 6px 0 0;
}

.auth-submit {
  height: 52px;
  border-radius: 16px;
  font-weight: 600;
  background: #0b1221;
  color: #ffffff;
  text-transform: none;
  letter-spacing: 0.2px;
}

.auth-submit:hover {
  background: #121a2f;
}

.auth-footer {
  text-align: center;
  padding: 12px 36px 28px;
  color: #6b7280;
  font-size: 0.9rem;
}

.auth-footer a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 599px) {
  .auth-page {
    padding: 20px 12px;
  }

  .auth-card {
    width: 100%;
  }

  .auth-header {
    padding: 26px 20px 6px;
  }

  .auth-body {
    padding: 6px 20px 10px;
  }

  .auth-footer {
    padding: 10px 20px 22px;
  }
}
</style>

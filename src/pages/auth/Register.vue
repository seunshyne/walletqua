<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { validatePasswordStrength, isValidEmail } from 'src/utils/index'

const authStore = useAuthStore()

const errors = computed(() => authStore.errors)
const message = computed(() => authStore.message)
const isLoading = computed(() => authStore.isLoading)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const formData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const passwordValidation = reactive({
  strength: 0,
  isValid: false,
  checks: {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  },
})

const emailValidation = reactive({
  isValid: false,
})

const passwordVisibility = reactive({
  showPassword: false,
  showPasswordConfirmation: false,
})

const passwordConfirmationMatch = computed(() =>
  formData.password_confirmation !== '' &&
  formData.password === formData.password_confirmation
)

watch(() => formData.password, (newPassword) => {
  const validation = validatePasswordStrength(newPassword)
  passwordValidation.strength = validation.strength
  passwordValidation.isValid = validation.isValid
  passwordValidation.checks = validation.checks
})

watch(() => formData.email, (newEmail) => {
  emailValidation.isValid = isValidEmail(newEmail)
})

const handleSubmit = async () => {
  // router.push is handled inside the store's authenticate() action
  await authStore.authenticate('register', formData)
}

onMounted(() => {
  if (isAuthenticated.value) return // store/router guard will redirect
  authStore.errors = {}
  authStore.message = ''
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
          <h2 class="auth-title">Create your account</h2>
          <p class="auth-subtitle">Sign up to get started</p>
        </q-card-section>

        <!-- Success message -->
        <q-card-section v-if="message" class="q-pb-none">
          <p class="text-positive q-mb-none">{{ message }}</p>
        </q-card-section>

        <!-- Error messages -->
        <q-card-section v-if="errors.general || errors.network" class="q-pb-none">
          <p class="text-negative q-mb-none">{{ errors.general || errors.network }}</p>
        </q-card-section>

        <q-card-section class="auth-body">
          <q-form @submit.prevent="handleSubmit" class="auth-form">
            <div class="field-label">Full name</div>
            <q-input
              clearable
              v-model="formData.name"
              type="text"
              label="Enter your name"
              :error="!!errors.name"
              :error-message="errors.name?.[0]"
              class="auth-input"
              dense
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <div class="field-label">Email address</div>
            <q-input
              clearable
              v-model="formData.email"
              type="email"
              label="name@company.com"
              :error="!!errors.email || (formData.email && !emailValidation.isValid)"
              :error-message="errors.email?.[0] || (formData.email && !emailValidation.isValid ? 'Invalid email format' : '')"
              class="auth-input"
              dense
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <div class="field-label">Password</div>
            <q-input
              clearable
              v-model="formData.password"
              :type="passwordVisibility.showPassword ? 'text' : 'password'"
              label="Create a password"
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

            <!-- Password Strength Indicator -->
            <div v-if="formData.password" class="strength-panel">
              <div class="strength-title">
                Password strength:
                <span
                  :class="{
                    'strength-weak': passwordValidation.strength <= 2,
                    'strength-mid': passwordValidation.strength === 3,
                    'strength-strong': passwordValidation.strength >= 4
                  }"
                >
                  {{ ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'][passwordValidation.strength] }}
                </span>
              </div>
              <q-linear-progress
                :value="passwordValidation.strength / 5"
                :color="passwordValidation.strength <= 2 ? 'red' : passwordValidation.strength === 3 ? 'orange' : 'green'"
                class="strength-bar"
              />
              <div class="strength-checks">
                <div :class="passwordValidation.checks.length ? 'strength-ok' : 'strength-muted'">? At least 8 characters</div>
                <div :class="passwordValidation.checks.uppercase ? 'strength-ok' : 'strength-muted'">? Uppercase letter (A-Z)</div>
                <div :class="passwordValidation.checks.lowercase ? 'strength-ok' : 'strength-muted'">? Lowercase letter (a-z)</div>
                <div :class="passwordValidation.checks.number ? 'strength-ok' : 'strength-muted'">? Number (0-9)</div>
                <div :class="passwordValidation.checks.special ? 'strength-ok' : 'strength-muted'">? Special character (!@#$%^&*)</div>
              </div>
            </div>

            <div class="field-label">Confirm password</div>
            <q-input
              clearable
              v-model="formData.password_confirmation"
              :type="passwordVisibility.showPasswordConfirmation ? 'text' : 'password'"
              label="Re-enter password"
              :error="!!formData.password_confirmation && !passwordConfirmationMatch"
              :error-message="formData.password_confirmation && !passwordConfirmationMatch ? 'Passwords do not match' : ''"
              class="auth-input"
              dense
              outlined
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="passwordVisibility.showPasswordConfirmation ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisibility.showPasswordConfirmation = !passwordVisibility.showPasswordConfirmation"
                />
              </template>
            </q-input>

            <q-card-actions class="auth-actions">
              <q-btn
                unelevated
                size="lg"
                class="auth-submit full-width"
                label="Create account"
                type="submit"
                :loading="isLoading"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>

        <q-card-section class="auth-footer">
          <p>
            Already have an account?
            <router-link to="/login">Return to login</router-link>
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
  width: 460px;
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

.strength-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  margin-top: -6px;
}

.strength-title {
  font-size: 0.78rem;
  color: #64748b;
  margin-bottom: 8px;
}

.strength-bar {
  height: 6px;
  border-radius: 999px;
  margin-bottom: 10px;
}

.strength-checks {
  font-size: 0.75rem;
  display: grid;
  gap: 4px;
}

.strength-ok {
  color: #15803d;
}

.strength-muted {
  color: #94a3b8;
}

.strength-weak {
  color: #dc2626;
  font-weight: 600;
}

.strength-mid {
  color: #f97316;
  font-weight: 600;
}

.strength-strong {
  color: #16a34a;
  font-weight: 600;
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

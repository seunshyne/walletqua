<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { validatePasswordStrength } from 'src/utils/index'
import passwordService from 'src/services/passwordService'

const router = useRouter()

const formData = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const errors = ref({})
const message = ref('')
const isLoading = ref(false)
const redirectTimer = ref(null)

const passwordValidation = reactive({
  strength: 0,
  checks: {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  },
})

const passwordVisibility = reactive({
  showCurrentPassword: false,
  showPassword: false,
  showPasswordConfirmation: false,
})

const passwordConfirmationMatch = computed(() =>
  formData.password_confirmation !== '' && formData.password === formData.password_confirmation
)

watch(
  () => formData.password,
  (newPassword) => {
    const validation = validatePasswordStrength(newPassword)
    passwordValidation.strength = validation.strength
    passwordValidation.checks = validation.checks
  },
  { immediate: true }
)

const handleSubmit = async () => {
  errors.value = {}
  message.value = ''
  isLoading.value = true

  const result = await passwordService.changePassword({
    current_password: formData.current_password,
    password: formData.password,
    password_confirmation: formData.password_confirmation,
  })

  if (result.success) {
    message.value = result.message
    formData.current_password = ''
    formData.password = ''
    formData.password_confirmation = ''

    redirectTimer.value = window.setTimeout(() => {
      router.push('/dashboard')
    }, 1200)
  } else {
    errors.value = result.errors || { general: result.message }
  }

  isLoading.value = false
}

onBeforeUnmount(() => {
  if (redirectTimer.value) {
    window.clearTimeout(redirectTimer.value)
  }
})
</script>

<template>
  <q-page class="change-page">
    <div class="change-shell">
      <section class="hero-panel">
        <div class="hero-copy">
          <div class="eyebrow">Security center</div>
          <h1 class="hero-title">Update your password</h1>
          <p class="hero-subtitle">
            Keep your account secure by choosing a fresh password you haven't used before.
          </p>
        </div>
        <div class="hero-badge">
          <q-icon name="verified_user" size="34px" />
        </div>
      </section>

      <q-card class="change-card">
        <q-card-section class="card-head">
          <div>
            <div class="card-title">Change password</div>
            <div class="card-subtitle">Use a strong, unique password to keep your account secure.</div>
          </div>
        </q-card-section>

        <q-card-section v-if="message" class="q-pt-none">
          <q-banner rounded class="success-banner">
            {{ message }} Redirecting to dashboard...
          </q-banner>
        </q-card-section>

        <q-card-section v-if="errors.general || errors.network" class="q-pt-none">
          <q-banner rounded class="error-banner">
            {{ errors.general || errors.network }}
          </q-banner>
        </q-card-section>

        <q-card-section class="card-body">
          <q-form class="form-grid" @submit.prevent="handleSubmit">
            <div class="field-label">Current password</div>
            <q-input
              v-model="formData.current_password"
              :type="passwordVisibility.showCurrentPassword ? 'text' : 'password'"
              label="Enter current password"
              :error="!!errors.current_password"
              :error-message="errors.current_password?.[0]"
              class="change-input"
              dense
              outlined
            >
              <template #prepend>
                <q-icon name="lock_clock" />
              </template>
              <template #append>
                <q-icon
                  :name="passwordVisibility.showCurrentPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisibility.showCurrentPassword = !passwordVisibility.showCurrentPassword"
                />
              </template>
            </q-input>

            <div class="field-label">New password</div>
            <q-input
              v-model="formData.password"
              :type="passwordVisibility.showPassword ? 'text' : 'password'"
              label="Create a new password"
              :error="!!errors.password"
              :error-message="errors.password?.[0]"
              class="change-input"
              dense
              outlined
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="passwordVisibility.showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisibility.showPassword = !passwordVisibility.showPassword"
                />
              </template>
            </q-input>

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
                :color="passwordValidation.strength <= 2 ? 'negative' : passwordValidation.strength === 3 ? 'warning' : 'positive'"
                track-color="rgba(255, 255, 255, 0.08)"
                class="strength-bar"
              />
              <div class="strength-checks">
                <div :class="passwordValidation.checks.length ? 'strength-ok' : 'strength-muted'">- At least 8 characters</div>
                <div :class="passwordValidation.checks.uppercase ? 'strength-ok' : 'strength-muted'">- Uppercase letter (A-Z)</div>
                <div :class="passwordValidation.checks.lowercase ? 'strength-ok' : 'strength-muted'">- Lowercase letter (a-z)</div>
                <div :class="passwordValidation.checks.number ? 'strength-ok' : 'strength-muted'">- Number (0-9)</div>
                <div :class="passwordValidation.checks.special ? 'strength-ok' : 'strength-muted'">- Special character (!@#$%^&*)</div>
              </div>
            </div>

            <div class="field-label">Confirm new password</div>
            <q-input
              v-model="formData.password_confirmation"
              :type="passwordVisibility.showPasswordConfirmation ? 'text' : 'password'"
              label="Re-enter new password"
              :error="!!errors.password_confirmation || (!!formData.password_confirmation && !passwordConfirmationMatch)"
              :error-message="errors.password_confirmation?.[0] || (formData.password_confirmation && !passwordConfirmationMatch ? 'Passwords do not match' : '')"
              class="change-input"
              dense
              outlined
            >
              <template #prepend>
                <q-icon name="lock_reset" />
              </template>
              <template #append>
                <q-icon
                  :name="passwordVisibility.showPasswordConfirmation ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisibility.showPasswordConfirmation = !passwordVisibility.showPasswordConfirmation"
                />
              </template>
            </q-input>

            <div class="submit-row">
              <q-btn
                unelevated
                class="submit-btn"
                label="Save new password"
                type="submit"
                :loading="isLoading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.change-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(94, 234, 212, 0.08), transparent 24%),
    linear-gradient(180deg, #0f1c2e 0%, #0b1626 100%);
  padding: 32px 20px 48px;
  color: #d7e3f4;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
}

.change-shell {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.hero-panel {
  border-radius: 28px;
  padding: 28px;
  background: linear-gradient(135deg, rgba(24, 49, 75, 0.95), rgba(19, 37, 58, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 48px rgba(4, 10, 18, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  color: #5de0e6;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
  font-weight: 700;
}

.hero-title {
  margin: 10px 0 8px;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.1;
  color: #ffffff;
}

.hero-subtitle {
  margin: 0;
  max-width: 520px;
  color: #99aecc;
  font-size: 1rem;
}

.hero-badge {
  width: 74px;
  height: 74px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: rgba(94, 234, 212, 0.14);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.2);
  flex: 0 0 auto;
}

.change-card {
  border-radius: 24px;
  background: #152a42;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 40px rgba(6, 12, 22, 0.28);
  color: #d7e3f4;
}

.card-head {
  padding: 26px 26px 10px;
}

.card-title {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
}

.card-subtitle {
  color: #8ea2c2;
  margin-top: 6px;
}

.card-body {
  padding: 10px 26px 28px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #d7e3f4;
  margin-bottom: 6px;
}

.change-input :deep(.q-field__control) {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 52px;
  padding: 6px 12px;
  background: #102238;
}

.change-input :deep(.q-field__control:hover) {
  border-color: rgba(94, 234, 212, 0.35);
}

.change-input :deep(.q-field__control:before),
.change-input :deep(.q-field__control:after) {
  display: none;
}

.change-input :deep(.q-field__native),
.change-input :deep(.q-field__input) {
  color: #f8fafc;
}

.change-input :deep(.q-field__label),
.change-input :deep(.q-field__prepend),
.change-input :deep(.q-field__append) {
  color: #8ea2c2;
}

.strength-panel {
  background: rgba(11, 22, 38, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 14px;
  margin-top: -6px;
}

.strength-title {
  color: #8ea2c2;
  font-size: 0.78rem;
  margin-bottom: 8px;
}

.strength-bar {
  height: 6px;
  border-radius: 999px;
  margin-bottom: 10px;
}

.strength-checks {
  display: grid;
  gap: 4px;
  font-size: 0.76rem;
}

.strength-ok {
  color: #5eead4;
}

.strength-muted {
  color: #6f86a7;
}

.strength-weak {
  color: #fb7185;
  font-weight: 600;
}

.strength-mid {
  color: #fbbf24;
  font-weight: 600;
}

.strength-strong {
  color: #5eead4;
  font-weight: 600;
}

.submit-row {
  padding-top: 8px;
}

.submit-btn {
  min-height: 50px;
  border-radius: 16px;
  padding: 0 24px;
  background: linear-gradient(135deg, #a855f7, #6d28d9);
  color: #ffffff;
  text-transform: none;
  font-weight: 600;
}

.success-banner {
  background: rgba(16, 185, 129, 0.14);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.error-banner {
  background: rgba(244, 63, 94, 0.12);
  color: #fecdd3;
  border: 1px solid rgba(244, 63, 94, 0.18);
}

@media (max-width: 700px) {
  .change-page {
    padding: 22px 14px 36px;
  }

  .hero-panel {
    padding: 22px 20px;
    align-items: flex-start;
    flex-direction: column;
  }

  .card-head,
  .card-body {
    padding-left: 18px;
    padding-right: 18px;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>

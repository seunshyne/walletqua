<script setup>
import { computed, reactive, ref } from 'vue'
import { isValidEmail } from 'src/utils/index'
import passwordService from 'src/services/passwordService'

const formData = reactive({
  email: '',
})

const errors = ref({})
const message = ref('')
const isLoading = ref(false)

const emailHasFormatError = computed(() => !!formData.email && !isValidEmail(formData.email))

const handleSubmit = async () => {
  errors.value = {}
  message.value = ''

  if (emailHasFormatError.value) {
    errors.value = { email: ['Enter a valid email address.'] }
    return
  }

  isLoading.value = true

  const result = await passwordService.forgotPassword(formData.email)

  if (result.success) {
    message.value = result.message
  } else {
    errors.value = result.errors || { general: result.message }
  }

  isLoading.value = false
}
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
          <h2 class="auth-title">Forgot your password?</h2>
          <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
        </q-card-section>

        <q-card-section v-if="message" class="q-pb-none">
          <p class="text-positive q-mb-none">{{ message }}</p>
        </q-card-section>

        <q-card-section v-if="errors.general || errors.network" class="q-pb-none">
          <p class="text-negative q-mb-none">{{ errors.general || errors.network }}</p>
        </q-card-section>

        <q-card-section class="auth-body">
          <q-form @submit.prevent="handleSubmit" class="auth-form">
            <div class="field-label">Email address</div>
            <q-input
              v-model="formData.email"
              clearable
              type="email"
              label="name@company.com"
              :error="!!errors.email || emailHasFormatError"
              :error-message="errors.email?.[0] || (emailHasFormatError ? 'Invalid email format' : '')"
              class="auth-input"
              dense
              outlined
            >
              <template #prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-card-actions class="auth-actions">
              <q-btn
                unelevated
                size="lg"
                class="auth-submit full-width"
                label="Send reset link"
                type="submit"
                :loading="isLoading"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>

        <q-card-section class="auth-footer">
          <p>
            Remembered your password?
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

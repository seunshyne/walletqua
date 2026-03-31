<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAdminAuthStore } from 'src/stores/adminAuth'

const router = useRouter()
const adminAuthStore = useAdminAuthStore()
const { errors, message, isLoading } = storeToRefs(adminAuthStore)

const formData = reactive({
  email: '',
  password: '',
})

const passwordVisibility = reactive({
  showPassword: false,
})

const canSubmit = computed(() => formData.email && formData.password)

const handleSubmit = async () => {
  const result = await adminAuthStore.login(formData)
  if (result?.success) {
    router.push({ name: 'admin-dashboard' })
  }
}
</script>

<template>
  <q-page class="admin-login-page">
    <div class="admin-login-shell">
      <section class="admin-login-aside">
        <div class="aside-badge">Admin Access</div>
        <h1 class="aside-title">Secure access to your financial control center.</h1>
        <p class="aside-copy">
          Sign in with your admin credentials to access user management, transaction oversight,
          verification review, and audit activity.
        </p>

        <div class="aside-metrics">
          <article class="metric-card">
            <span class="metric-label">Access Layer</span>
            <strong>Token Protected</strong>
          </article>
          <article class="metric-card">
            <span class="metric-label">Workspace</span>
            <strong>Admin Dashboard</strong>
          </article>
        </div>
      </section>

      <q-card class="admin-login-card" flat>
        <q-card-section class="admin-login-header">
          <div class="brand-row">
            <div class="brand-badge">
              <span class="brand-glyph">P</span>
            </div>
            <div>
              <div class="brand-title">PrimeWallet</div>
              <div class="brand-subtitle">System Root</div>
            </div>
          </div>

          <h2 class="login-title">Admin Sign In</h2>
          <p class="login-subtitle">Use your admin email and password to continue.</p>
        </q-card-section>

        <q-card-section v-if="message" class="q-pb-none">
          <p class="text-negative q-mb-none">{{ message }}</p>
        </q-card-section>

        <q-card-section v-if="errors.general || errors.network" class="q-pb-none">
          <p class="text-negative q-mb-none">{{ errors.general || errors.network }}</p>
        </q-card-section>

        <q-card-section class="admin-login-body">
          <q-form class="admin-login-form" @submit.prevent="handleSubmit">
            <div class="field-label">Admin Email</div>
            <q-input
              v-model="formData.email"
              type="email"
              label="admin@company.com"
              :error="!!errors.email"
              :error-message="errors.email?.[0]"
              class="admin-input"
              dense
              outlined
            >
              <template #prepend>
                <q-icon name="alternate_email" />
              </template>
            </q-input>

            <div class="field-label">Password</div>
            <q-input
              v-model="formData.password"
              :type="passwordVisibility.showPassword ? 'text' : 'password'"
              label="Enter password"
              :error="!!errors.password"
              :error-message="errors.password?.[0]"
              class="admin-input"
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

            <q-card-actions class="admin-login-actions">
              <q-btn
                unelevated
                size="lg"
                class="admin-submit full-width"
                label="Sign in to Admin"
                type="submit"
                :loading="isLoading"
                :disable="!canSubmit"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px 16px;
  background:
    radial-gradient(circle at top left, rgba(78, 93, 255, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(35, 56, 168, 0.12), transparent 26%),
    linear-gradient(180deg, #eef2ff 0%, #f8faff 100%);
}

.admin-login-shell {
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 24px;
  align-items: stretch;
}

.admin-login-aside,
.admin-login-card {
  border-radius: 30px;
  border: 1px solid rgba(219, 227, 241, 0.95);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.admin-login-aside {
  padding: 40px;
  color: #eef2ff;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.06), transparent 40%),
    linear-gradient(135deg, #131c35, #1a2552 58%, #273ccf);
  display: grid;
  align-content: space-between;
  gap: 28px;
}

.aside-badge {
  width: fit-content;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  color: #cdd7ff;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.aside-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
}

.aside-copy {
  margin: 0;
  max-width: 520px;
  color: #c6d0f5;
  font-size: 1rem;
  line-height: 1.8;
}

.aside-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 8px;
}

.metric-label {
  color: #c3cdf3;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.metric-card strong {
  font-size: 1.1rem;
}

.admin-login-card {
  background: rgba(255, 255, 255, 0.96);
}

.admin-login-header {
  padding: 34px 34px 10px;
}

.brand-row {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.brand-badge {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3349d5, #5e74ff);
  color: #fff;
  box-shadow: 0 12px 20px rgba(51, 73, 213, 0.26);
}

.brand-glyph {
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brand-title {
  color: #101828;
  font-size: 1.1rem;
  font-weight: 800;
}

.brand-subtitle {
  color: #617089;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.login-title {
  margin: 0;
  color: #111827;
  font-size: 1.7rem;
  font-weight: 800;
}

.login-subtitle {
  margin: 8px 0 0;
  color: #667085;
  line-height: 1.7;
}

.admin-login-body {
  padding: 12px 34px 30px;
}

.admin-login-form {
  display: grid;
  gap: 16px;
}

.field-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: #1f2937;
}

.admin-input :deep(.q-field__control) {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  min-height: 54px;
  padding: 6px 12px;
  background: #fff;
}

.admin-input :deep(.q-field__control:hover) {
  border-color: #cbd5e1;
}

.admin-input :deep(.q-field__control:before),
.admin-input :deep(.q-field__control:after) {
  display: none;
}

.admin-input :deep(.q-field__native) {
  font-size: 0.96rem;
  color: #0f172a;
}

.admin-input :deep(.q-field__label) {
  color: #94a3b8;
}

.admin-login-actions {
  padding: 8px 0 0;
}

.admin-submit {
  height: 54px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2336d7, #3048d5);
  color: #fff;
  font-weight: 700;
  text-transform: none;
}

@media (max-width: 900px) {
  .admin-login-shell {
    grid-template-columns: 1fr;
  }

  .admin-login-aside {
    padding: 30px 24px;
  }

  .aside-metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .admin-login-header {
    padding: 28px 20px 8px;
  }

  .admin-login-body {
    padding: 10px 20px 24px;
  }
}
</style>

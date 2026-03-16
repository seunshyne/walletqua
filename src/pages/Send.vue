<template>
  <q-page class="send-page">
    <div class="dash-shell">
      <aside class="dash-sidebar" :class="{ 'is-open': isNavOpen }">
        <div class="brand">
          <div class="brand-badge">
            <span class="brand-dot"></span>
            <span class="brand-core"></span>
          </div>
          <div>
            <div class="brand-name">PrimeWallet</div>
            <div class="brand-sub">Premium Finance</div>
          </div>
        </div>

        <nav class="nav">
          <router-link to="/" class="nav-item" @click="closeNav">
            <q-icon name="grid_view" />
            <span>Home</span>
          </router-link>
          <router-link to="/dashboard" class="nav-item" @click="closeNav">
            <q-icon name="grid_view" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/transaction-history" class="nav-item" @click="closeNav">
            <q-icon name="history" />
            <span>Transaction History</span>
          </router-link>
          <router-link to="/send" class="nav-item" @click="closeNav">
            <q-icon name="send" />
            <span>Send</span>
          </router-link>
          <router-link to="/receive" class="nav-item" @click="closeNav">
            <q-icon name="download" />
            <span>Receive</span>
          </router-link>
          <router-link to="/analytics" class="nav-item" @click="closeNav">
            <q-icon name="leaderboard" />
            <span>Analytics</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="user-avatar">AC</div>
            <div>
              <div class="user-name">{{ authStore.user?.name || 'Alex Carter' }}</div>
              <div class="user-tier">Pro Member</div>
            </div>
          </div>
          <button class="logout-btn" @click="logout">
            <q-icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div class="nav-backdrop" :class="{ 'is-open': isNavOpen }" @click="closeNav"></div>

      <main class="dash-main">
        <header class="dash-topbar">
          <div class="greeting-wrap">
            <q-btn
              flat
              dense
              round
              icon="menu"
              class="lt-md"
              aria-label="Toggle navigation"
              @click="toggleNav"
            />
            <div class="greeting">
              Good morning, <span>{{ authStore.user?.name || 'Alex' }}</span>
            </div>
          </div>
          <div class="top-actions">
            <q-btn dense flat round icon="notifications" class="icon-btn" />
            <q-btn dense flat round icon="search" class="icon-btn" />
            <q-btn flat label="Logout" class="logout-top" @click="logout" />
          </div>
        </header>

        <div class="send-shell">
          <q-card class="send-card">
            <q-card-section class="send-hero">
              <div class="hero-title">Send Money</div>
              <div class="hero-sub">Transfer instantly to any wallet or bank account.</div>
            </q-card-section>

            <q-card-section class="send-body">
              <!-- Success Message -->
              <q-banner v-if="successMessage" class="bg-green-2 text-green-9 q-mb-md rounded q-pa-md status-banner">
                <template v-slot:avatar>
                  <q-icon name="check_circle" color="green-9" size="lg" />
                </template>
                <div class="text-weight-bold text-body1">{{ successMessage }}</div>
                <template v-slot:action>
                  <q-btn flat size="sm" @click="successMessage = ''" label="Dismiss" />
                </template>
              </q-banner>

              <!-- Error Messages -->
              <q-banner v-if="errorMessage" class="bg-red-2 text-red-9 q-mb-md rounded q-pa-md status-banner">
                <template v-slot:avatar>
                  <q-icon name="error" color="red-9" size="lg" />
                </template>
                <div class="text-weight-bold text-body1">{{ errorMessage }}</div>
                <template v-slot:action>
                  <q-btn flat size="sm" @click="errorMessage = ''" label="Dismiss" />
                </template>
              </q-banner>

              <q-form @submit.prevent="handleSubmit" class="send-form">
                <!-- Recipient Input -->
                <div>
                  <label class="field-label q-mb-sm">Recipient</label>
                  <q-input
                    square
                    clearable
                    v-model="formData.recipient"
                    type="text"
                    label="Wallet Address or Email"
                    hint="Enter recipient's wallet address (WAL...) or email"
                    :error="!!errors.recipient"
                    :error-message="errors.recipient"
                    @blur="handleRecipientBlur"
                    :loading="transactionStore.resolving"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <!-- Recipient Preview -->
                  <div v-if="transactionStore.recipientPreview && !transactionStore.recipientError" class="q-mt-md">
                    <q-card class="preview-card">
                      <q-card-section>
                        <div class="text-subtitle2 text-weight-bold">{{ transactionStore.recipientPreview.name }}</div>
                        <div class="text-caption text-grey">{{ transactionStore.recipientPreview.address }}</div>
                        <q-linear-progress :value="1" color="blue" class="q-mt-sm" />
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- Recipient Error -->
                  <div v-if="transactionStore.recipientError" class="text-red q-mt-md">
                    <q-icon name="warning" size="sm" />
                    <span class="text-caption">{{ transactionStore.recipientError }}</span>
                  </div>
                </div>

                <!-- Amount Input -->
                <q-input
                  square
                  v-model.number="formData.amount"
                  type="number"
                  label="Amount"
                  hint="Enter amount to send"
                  :error="!!errors.amount"
                  :error-message="errors.amount"
                  step="0.01"
                  min="0"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                  <template v-slot:append>
                    <span class="text-caption">{{ authStore.getWalletCurrency }}</span>
                  </template>
                </q-input>

                <!-- Description Input -->
                <q-input
                  square
                  v-model="formData.description"
                  type="textarea"
                  label="Description (Optional)"
                  hint="Add a note or reference for this transaction"
                  rows="3"
                  counter
                  maxlength="200"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-input>

                <!-- Balance Info -->
                <q-card class="balance-card">
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <span class="text-subtitle2">Current Balance</span>
                      <span class="balance-amount">
                        {{ formatCurrency(authStore.getWalletBalance) }} {{ authStore.getWalletCurrency }}
                      </span>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Submit Button -->
                <q-card-actions align="right" class="send-actions">
                  <q-btn
                    flat
                    label="Cancel"
                    @click="resetForm"
                    class="q-mr-md"
                  />
                  <q-btn
                    unelevated
                    label="Send Money"
                    color="primary"
                    type="submit"
                    :loading="transactionStore.loading"
                    :disable="!isFormValid || transactionStore.loading"
                    class="primary-btn"
                  />
                </q-card-actions>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useTransactionStore } from 'src/stores/transaction'
import { formatCurrency } from 'src/utils/index'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const successMessage = ref('')
const errorMessage = ref('')
const isNavOpen = ref(false)

const formData = reactive({
  recipient: '',
  amount: '',
  description: ''
})

const errors = reactive({
  recipient: '',
  amount: ''
})
const RECIPIENT_DEBOUNCE_MS = 500
const recipientDebounceTimer = ref(null)

const isFormValid = computed(() => {
  return (
    formData.recipient.trim() !== '' &&
    formData.amount > 0 &&
    !transactionStore.recipientError &&
    transactionStore.recipientPreview !== null
  )
})

const resolveRecipient = async () => {
  if (!formData.recipient.trim()) {
    transactionStore.recipientError = null
    transactionStore.recipientPreview = null
    errors.recipient = 'Recipient is required'
    return
  }

  errors.recipient = ''
  await transactionStore.resolveRecipient(formData.recipient.trim())
}

const handleRecipientBlur = async () => {
  if (recipientDebounceTimer.value) {
    clearTimeout(recipientDebounceTimer.value)
    recipientDebounceTimer.value = null
  }
  await resolveRecipient()
}

watch(
  () => formData.recipient,
  (value) => {
    if (recipientDebounceTimer.value) {
      clearTimeout(recipientDebounceTimer.value)
      recipientDebounceTimer.value = null
    }

    const recipient = value.trim()
    if (!recipient) {
      transactionStore.recipientError = null
      transactionStore.recipientPreview = null
      errors.recipient = ''
      return
    }

    errors.recipient = ''
    recipientDebounceTimer.value = setTimeout(() => {
      resolveRecipient()
      recipientDebounceTimer.value = null
    }, RECIPIENT_DEBOUNCE_MS)
  }
)

onBeforeUnmount(() => {
  if (recipientDebounceTimer.value) {
    clearTimeout(recipientDebounceTimer.value)
    recipientDebounceTimer.value = null
  }
})

const validateForm = () => {
  errors.recipient = ''
  errors.amount = ''
  const amount = Number(formData.amount)
  const balance = Number(String(authStore.getWalletBalance).replace(/,/g, ''))

  if (!formData.recipient.trim()) {
    errors.recipient = 'Recipient is required'
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  }

  if (Number.isFinite(amount) && Number.isFinite(balance) && amount > balance) {
    errors.amount = 'Insufficient balance'
  }

  if (transactionStore.recipientError || !transactionStore.recipientPreview) {
    errors.recipient = transactionStore.recipientError || 'Invalid recipient'
  }

  return Object.values(errors).every(error => !error)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    setErrorMessage('Please fix the errors in the form')
    return
  }

  clearMessages()

  try {
    const resolvedRecipient = transactionStore.recipientPreview?.address || formData.recipient.trim()
    const payload = {
      recipient: resolvedRecipient,
      recipientAddress: resolvedRecipient,
      recipient_address: resolvedRecipient,
      amount: parseFloat(formData.amount),
      description: formData.description || '',
      note: formData.description || '',
      memo: formData.description || ''
    }

    const result = await transactionStore.sendMoney(payload)

    // Check if transaction was successful
    if (result && (result.status === 'success' || result.transaction || (result.sender_balance !== undefined && !transactionStore.error))) {
      const recipientName = transactionStore.recipientPreview?.name || 'recipient'
      const successMsg = `✓ Money sent successfully!\n${formatCurrency(formData.amount)} ${authStore.getWalletCurrency} to ${recipientName}`
      successMessage.value = successMsg
      
      // Refresh wallet balance after 2 seconds, then reset form after 4 seconds
      setTimeout(() => {
        authStore.fetchWallet()
      }, 2000)
      
      setTimeout(() => {
        resetForm()
      }, 4000)
    } else {
      // Error case
      const errorMsg = transactionStore.error || result?.message || 'Failed to send money'
      handleError(errorMsg)
    }
  } catch (err) {
    console.error('Send error:', err)
    handleError(err.message || 'An error occurred while sending money')
  }
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const setSuccessMessage = (message) => {
  successMessage.value = message
  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (successMessage.value === message) {
      successMessage.value = ''
    }
  }, 6000)
}

const setErrorMessage = (message) => {
  errorMessage.value = message
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    if (errorMessage.value === message) {
      errorMessage.value = ''
    }
  }, 8000)
}

const showNotification = (type, message, caption = '') => {
  // Notification handled via banner messages
}

const handleError = (errorMsg) => {
  // Map common errors to user-friendly messages
  const errorMapping = {
    'insufficient': 'Insufficient balance to complete this transaction',
    'recipient': 'Invalid recipient address or recipient not found',
    'network': 'Network error. Please check your connection and try again',
    'timeout': 'Request timed out. Please try again',
    'validation': 'Please check your input and try again',
    'duplicate': 'This transaction was already sent',
    'locked': 'Your account is locked. Please contact support',
    'amount': 'Invalid amount. Must be greater than 0'
  }

  // Find matching error and use user-friendly message
  let displayMessage = errorMsg
  for (const [key, message] of Object.entries(errorMapping)) {
    if (errorMsg.toLowerCase().includes(key)) {
      displayMessage = message
      break
    }
  }

  setErrorMessage(`✗ Transaction Failed\n${displayMessage}`)
}

const resetForm = () => {
  formData.recipient = ''
  formData.amount = ''
  formData.description = ''
  errors.recipient = ''
  errors.amount = ''
  transactionStore.recipientError = null
  transactionStore.recipientPreview = null
  successMessage.value = ''
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNav = () => {
  isNavOpen.value = false
}

const logout = async () => {
  const result = await authStore.logout()
  if (!result?.success) {
    console.error('Logout action failed:', result)
  }
}
</script>

<style scoped>
.send-page {
  min-height: 100vh;
  padding: 32px 16px 48px;
  background: #0f1c2e;
  color: #dbe7f7;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
  width: 100%;
}

.dash-shell {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
}

.dash-sidebar {
  flex: 0 0 260px;
  padding: 28px 22px;
  background: #0b1626;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: radial-gradient(circle at top left, #9f4dff, #5d2bff);
  display: grid;
  place-items: center;
  position: relative;
}

.brand-dot {
  width: 14px;
  height: 14px;
  border-radius: 6px;
  background: #ffffff;
}

.brand-core {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  position: absolute;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.brand-sub {
  font-size: 0.8rem;
  color: #9aa9c4;
}

.nav {
  display: grid;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #b2c1da;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
  background: rgba(123, 96, 255, 0.12);
  color: #ffffff;
}

.sidebar-footer {
  margin-top: auto;
  display: grid;
  gap: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1b2a40;
  display: grid;
  place-items: center;
  font-weight: 600;
  color: #ffffff;
}

.user-name {
  font-weight: 600;
  color: #ffffff;
}

.user-tier {
  font-size: 0.75rem;
  color: #8ea2c2;
}

.logout-btn {
  border: none;
  background: transparent;
  color: #ff6b8b;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
}

.dash-main {
  padding: 28px 32px 40px;
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;
}

.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.greeting-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.greeting {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
}

.greeting span {
  color: #d7c6ff;
}

.top-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  color: #c7d2e8;
}

.logout-top {
  color: #ffffff;
}

.send-shell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.nav-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(6, 12, 22, 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 20;
}

.nav-backdrop.is-open {
  opacity: 1;
  pointer-events: auto;
}

.send-card {
  width: min(720px, 100%);
  border-radius: 24px;
  background: #0b1626;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(5, 10, 20, 0.35);
}

.send-hero {
  padding: 28px 28px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(94, 234, 212, 0.12), rgba(56, 189, 248, 0.08));
}

.hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
}

.hero-sub {
  color: #9fb3d1;
  margin-top: 6px;
}

.send-body {
  padding: 24px 28px 28px;
}

.send-form {
  display: grid;
  gap: 16px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c8d6ef;
}

.send-form :deep(.q-field__control) {
  border-radius: 18px;
  background: #0f1e33;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #e2ebf7;
}

.send-form :deep(.q-field__label),
.send-form :deep(.q-field__native) {
  color: #c7d4ea;
}

.send-form :deep(.q-field__bottom),
.send-form :deep(.q-field__messages),
.send-form :deep(.q-field__hint) {
  color: #e6f0ff;
}

.send-form :deep(.q-field__control:hover) {
  border-color: rgba(94, 234, 212, 0.5);
}

.send-form :deep(.q-field--focused .q-field__control) {
  border-color: rgba(56, 189, 248, 0.8);
}

.status-banner {
  border-left: 4px solid;
  border-radius: 16px;
  overflow: hidden;
}

.status-banner.bg-green-2 {
  border-left-color: #4caf50;
}

.status-banner.bg-red-2 {
  border-left-color: #f44336;
}

.preview-card {
  background: rgba(94, 234, 212, 0.12);
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.2);
}

.balance-card {
  background: rgba(15, 29, 50, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.balance-amount {
  font-weight: 700;
  color: #5eead4;
}

.send-actions {
  padding-top: 6px;
}

.primary-btn {
  border-radius: 14px;
  padding: 8px 20px;
}

@media (max-width: 600px) {
  .send-page {
    padding: 24px 12px 40px;
  }

  .send-hero {
    padding: 22px 20px 16px;
  }

  .send-body {
    padding: 20px;
  }

  .send-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .send-actions :deep(.q-btn) {
    width: 100%;
  }

  .dash-shell {
    flex-direction: column;
  }

  .dash-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }

  .dash-sidebar {
    position: relative;
    padding: 0;
    background: transparent;
    border-right: none;
  }

  .nav {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    padding: 24px 18px;
    background: #0b1626;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 12px 0 24px rgba(5, 10, 20, 0.35);
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 30;
  }

  .dash-sidebar.is-open .nav {
    transform: translateX(0);
  }

  .dash-sidebar > *:not(.nav) {
    display: none;
  }
}
</style>

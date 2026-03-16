<template>
  <q-page class="send-page">
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
</script>

<style scoped>
.send-page {
  min-height: 100vh;
  padding: 32px 16px 48px;
  background: #0f1c2e;
  color: #dbe7f7;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
}

.send-shell {
  display: flex;
  justify-content: center;
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
}
</style>

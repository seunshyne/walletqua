<template>
  <q-page padding>
    <div class="row justify-center">
      <q-card class="col-md-6 col-sm-8 col-xs-12">
        <q-card-section class="bg-primary text-white">
          <h4 class="text-h5 q-my-md">Send Money</h4>
        </q-card-section>

        <q-card-section>
          <!-- Success Message -->
          <q-banner v-if="successMessage" class="bg-green-2 text-green-9 q-mb-md rounded">
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            {{ successMessage }}
            <template v-slot:action>
              <q-btn flat size="sm" @click="successMessage = ''" label="Dismiss" />
            </template>
          </q-banner>

          <!-- Error Messages -->
          <q-banner v-if="errorMessage" class="bg-red-2 text-red-9 q-mb-md rounded">
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
            <template v-slot:action>
              <q-btn flat size="sm" @click="errorMessage = ''" label="Dismiss" />
            </template>
          </q-banner>

          <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
            <!-- Recipient Input -->
            <div>
              <label class="text-subtitle2 q-mb-sm">Recipient</label>
              <q-input
                square
                clearable
                v-model="formData.recipient"
                type="text"
                label="Wallet Address or Email"
                hint="Enter recipient's wallet address (WAL...) or email"
                :error="!!errors.recipient"
                :error-message="errors.recipient"
                @blur="resolveRecipient"
                :loading="transactionStore.resolving"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <!-- Recipient Preview -->
              <div v-if="transactionStore.recipientPreview && !transactionStore.recipientError" class="q-mt-md">
                <q-card class="bg-blue-1">
                  <q-card-section>
                    <div class="text-subtitle2 text-weight-bold">{{ transactionStore.recipientPreview.name }}</div>
                    <div class="text-caption text-grey">{{ transactionStore.recipientPreview.address }}</div>
                    <q-linear-progress value="1" color="blue" class="q-mt-sm" />
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
              v-model="formData.amount"
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
            <q-card class="bg-grey-2">
              <q-card-section>
                <div class="row items-center justify-between">
                  <span class="text-subtitle2">Current Balance:</span>
                  <span class="text-h6 text-weight-bold text-primary">
                    {{ formatCurrency(authStore.getWalletBalance) }} {{ authStore.getWalletCurrency }}
                  </span>
                </div>
              </q-card-section>
            </q-card>

            <!-- Submit Button -->
            <q-card-actions align="right">
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
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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
  await transactionStore.resolveRecipient(formData.recipient)
}

const validateForm = () => {
  errors.recipient = ''
  errors.amount = ''

  if (!formData.recipient.trim()) {
    errors.recipient = 'Recipient is required'
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  }

  if (formData.amount > authStore.getWalletBalance) {
    errors.amount = 'Insufficient balance'
  }

  if (transactionStore.recipientError || !transactionStore.recipientPreview) {
    errors.recipient = transactionStore.recipientError || 'Invalid recipient'
  }

  return Object.values(errors).every(error => !error)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      recipient: formData.recipient,
      amount: parseFloat(formData.amount),
      description: formData.description || ''
    }

    const result = await transactionStore.sendMoney(payload)

    if (result && result.status === 'success') {
      successMessage.value = result.message || 'Money sent successfully!'
      resetForm()
      
      // Refresh wallet balance after 2 seconds
      setTimeout(() => {
        authStore.fetchWallet()
      }, 2000)
    } else {
      errorMessage.value = transactionStore.error || 'Failed to send money'
    }
  } catch (err) {
    errorMessage.value = err.message || 'An error occurred while sending money'
    console.error('Send error:', err)
  }
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
.q-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>

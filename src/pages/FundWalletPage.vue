
<script setup>
import { ref, computed } from 'vue'
import { useTransactionStore } from 'src/stores/transaction'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const amount = ref(null)
const quickAmounts = [500, 1000, 2000, 5000]

const formattedBalance = computed(() => {
  const balance = authStore.getWalletBalance
  return Number(balance).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
})

async function handleFundWallet() {
  if (!amount.value || amount.value < 100) return

  const result = await transactionStore.initiateWalletFunding(amount.value)

  if (result.status === 'success') {
    // Redirect user to Paystack payment page
    window.location.href = result.paymentUrl
  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Could not initiate payment',
      position: 'top',
    })
  }
}
</script>

<template>
  <q-page padding>
    <div class="q-mx-auto" style="max-width: 480px;">

      <!-- Header -->
      <div class="q-mb-lg">
        <div class="text-h5 text-weight-bold">Fund Wallet</div>
        <div class="text-grey-6">Add money to your Prime Wallet</div>
      </div>

      <!-- Current Balance Card -->
      <q-card flat bordered class="q-mb-lg bg-primary text-white">
        <q-card-section>
          <div class="text-caption opacity-80">Current Balance</div>
          <div class="text-h4 text-weight-bold">
            ₦{{ formattedBalance }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Amount Input Card -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Enter Amount</div>

          <q-input
            v-model="amount"
            type="number"
            label="Amount (NGN)"
            outlined
            prefix="₦"
            :rules="[
              val => !!val || 'Amount is required',
              val => val >= 100 || 'Minimum amount is ₦100',
            ]"
            :disable="transactionStore.loading"
          />

          <!-- Quick amount buttons -->
          <div class="row q-gutter-sm q-mt-sm">
            <q-btn
              v-for="quickAmount in quickAmounts"
              :key="quickAmount"
              outline
              color="primary"
              size="sm"
              :label="'₦' + quickAmount.toLocaleString()"
              @click="amount = quickAmount"
              :disable="transactionStore.loading"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Error Message -->
      <q-banner
        v-if="transactionStore.error"
        class="bg-negative text-white q-mb-md rounded-borders"
        dense
      >
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        {{ transactionStore.error }}
      </q-banner>

      <!-- Fund Button -->
      <q-btn
        color="primary"
        label="Proceed to Payment"
        class="full-width q-py-sm"
        size="lg"
        :loading="transactionStore.loading"
        :disable="!amount || amount < 100"
        @click="handleFundWallet"
        unelevated
      />

      <div class="text-center text-caption text-grey-6 q-mt-md">
        Secured by Paystack. Your payment details are safe.
      </div>

    </div>
  </q-page>
</template>

<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Wallet Balance</div>
        <div class="text-h4 text-bold">{{ authStore.getWalletBalance }} {{ authStore.getWalletCurrency }}</div>
      </q-card-section>

    

      <q-card-actions align="right">
        <q-btn color="primary" label="Send" @click="() => router.push({ name: 'send' })" />
        <q-btn color="secondary" label="Receive" @click="receiveMoney" />
      </q-card-actions>
    </q-card>

    <q-table
      :rows="transactions"
      :columns="columns"
      row-key="id"
      title="Recent Transactions"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useTransactionStore } from 'src/stores/transaction'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

// Fetch wallet on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchWallet()
    await transactionStore.fetchTransactions()
  }
});

//Watch for balance changes and animate count-up
// watch(
//   getWalletBalance,
//   (newBalance) => {
//     const numericBalance = Number(newBalance)
//     if (!isNaN(numericBalance)) countUp(numericBalance)
//   },
//   { immediate: true }
// )
// Manual count-up animation
// function countUp(target) {
//   animatedBalance.value = 0
//   const duration = 1200 // ms
//   const frameRate = 16
//   const totalFrames = duration / frameRate
//   const increment = target / totalFrames
//   let current = 0

//   const timer = setInterval(() => {
//     current += increment
//     if (current >= target) {
//       animatedBalance.value = target
//       clearInterval(timer)
//     } else {
//       animatedBalance.value = Math.floor(current)
//     }
//   }, frameRate)
// }

const transactions = ref([
  { id: 1, type: 'Credit', amount: 500, date: '2026-01-09', description: 'Salary' },
  { id: 2, type: 'Debit', amount: 200, date: '2026-01-08', description: 'Groceries' },
]);

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'type', label: 'Type', field: 'type' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' },
];

function receiveMoney() {
  console.log('Receive money clicked');
}
</script>

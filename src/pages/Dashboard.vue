<template>
  <q-page class="dashboard-responsive">
    <q-row class="q-gutter-md" align="center" justify="center">
      <q-col cols="12" sm="10" md="8" lg="6" xl="5">
        <q-card class="my-card dashboard-card-responsive">
          <q-card-section class="dashboard-balance-section">
            <div class="dashboard-balance-label">Balance</div>
            <div class="dashboard-balance-value">
              <q-icon name="account_balance_wallet" color="primary" size="32px" class="q-mr-sm" />
              <span class="dashboard-amount">{{ authStore.getWalletBalance }}</span>
              <span class="dashboard-currency">{{ authStore.getWalletCurrency }}</span>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="dashboard-actions-responsive">
            <q-btn color="primary" label="Send" @click="() => router.push({ name: 'send' })" />
            <q-btn color="secondary" label="Receive" @click="receiveMoney" />
          </q-card-actions>
        </q-card>
      </q-col>
    </q-row>
    <q-row class="q-gutter-md q-mt-md" align="center" justify="center">
      <q-col cols="12" sm="10" md="8" lg="6" xl="5">
        <q-table
          :rows="transactions"
          :columns="columns"
          row-key="id"
          title="Recent Transactions"
          class="dashboard-table-responsive"
        />
      </q-col>
    </q-row>
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

<style scoped>
.dashboard-card-responsive {
  padding: 32px;
}
/* Use a deep blue background for strong contrast */
.dashboard-balance-section {
  background: linear-gradient(90deg, #0d1b2a 0%, #1b263b 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.08);
  padding: 24px 24px 18px 24px;
  margin-bottom: 18px;
  color: #fff;
  text-align: center;
}
.dashboard-balance-label {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.92;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.dashboard-balance-value {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin-top: 2px;
}
.dashboard-amount {
  color: #fff;
  font-size: 2.2rem;
  font-weight: bold;
  margin-right: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18);
  background: rgba(0,0,0,0.18);
  border-radius: 8px;
  padding: 2px 12px;
  display: inline-block;
}
.dashboard-currency {
  color: #e3f2fd;
  font-size: 1.2rem;
  font-weight: 500;
  margin-left: 2px;
  opacity: 0.85;
}
.dashboard-actions-responsive {
  padding-right: 24px;
  padding-bottom: 8px;
}
.dashboard-table-responsive {
  margin-top: 24px;
}

@media (max-width: 599px) {
  .dashboard-card-responsive {
    padding: 8px !important;
  }
  .dashboard-balance-section {
    padding: 12px 6px 8px 6px !important;
    border-radius: 10px !important;
    margin-bottom: 10px !important;
  }
  .dashboard-balance-label {
    font-size: 0.95rem !important;
  }
  .dashboard-balance-value, .dashboard-amount {
    font-size: 1.2rem !important;
  }
  .dashboard-currency {
    font-size: 0.95rem !important;
  }
  .dashboard-actions-responsive {
    padding-right: 4px !important;
    padding-bottom: 4px !important;
  }
  .dashboard-table-responsive {
    margin-top: 8px !important;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .dashboard-card-responsive {
    padding: 20px !important;
  }
  .dashboard-balance-section {
    padding: 18px 12px 12px 12px !important;
    border-radius: 14px !important;
    margin-bottom: 14px !important;
  }
  .dashboard-balance-label {
    font-size: 1.05rem !important;
  }
  .dashboard-balance-value, .dashboard-amount {
    font-size: 1.5rem !important;
  }
  .dashboard-currency {
    font-size: 1.05rem !important;
  }
  .dashboard-actions-responsive {
    padding-right: 12px !important;
    padding-bottom: 6px !important;
  }
  .dashboard-table-responsive {
    margin-top: 16px !important;
  }
}
</style>

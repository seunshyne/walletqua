<template>
  <q-page class="admin-transactions-page">
    <div class="page-copy">
      <div class="eyebrow">Admin Transactions</div>
      <h1 class="page-title">Transaction Management</h1>
      <p class="page-subtitle">
        Review platform-wide transaction activity and flag suspicious records for deeper investigation.
      </p>
    </div>

    <section class="summary-grid">
      <article class="summary-card">
        <span class="summary-label">Loaded Records</span>
        <strong>{{ transactions.length }}</strong>
      </article>
      <article class="summary-card">
        <span class="summary-label">Flagged</span>
        <strong>{{ flaggedCount }}</strong>
      </article>
      <article class="summary-card">
        <span class="summary-label">Successful Volume</span>
        <strong>{{ formatCurrency(completedVolume) }}</strong>
      </article>
    </section>

    <section class="table-card">
      <div v-if="actionMessage && !error" class="action-banner">{{ actionMessage }}</div>

      <div class="table-head">
        <div>Reference</div>
        <div>User</div>
        <div>Type</div>
        <div>Status</div>
        <div>Channel</div>
        <div class="align-right">Amount</div>
        <div>Date</div>
        <div class="align-center">Action</div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <q-skeleton v-for="n in 5" :key="n" class="skeleton-row" />
      </div>

      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="table-row"
      >
        <div class="reference-cell">{{ transaction.reference }}</div>
        <div class="user-cell">
          <strong>{{ transaction.userName }}</strong>
          <span>{{ transaction.userEmail }}</span>
        </div>
        <div>{{ transaction.type }}</div>
        <div>
          <span class="status-pill" :class="`status-${displayStatus(transaction).toLowerCase()}`">
            {{ displayStatus(transaction) }}
          </span>
        </div>
        <div>{{ transaction.channel }}</div>
        <div class="amount-cell" :class="{ debit: transaction.amount < 0 }">
          {{ formatCurrency(transaction.amount) }}
        </div>
        <div>{{ transaction.formattedDate }}</div>
        <div class="action-cell">
          <button
            type="button"
            class="flag-button"
            :class="{ flagged: transaction.flagged }"
            :disabled="actionTransactionId === String(transaction.id)"
            @click="toggleTransactionFlag(transaction.id)"
          >
            {{ transactionActionLabel(transaction) }}
          </button>
        </div>
      </div>

      <div v-if="error && !isLoading" class="empty-state">
        <div class="empty-title">Unable to load transactions</div>
        <div class="empty-copy">{{ error }}</div>
      </div>

      <div v-else-if="!transactions.length && !isLoading" class="empty-state">
        <div class="empty-title">No transactions available</div>
        <div class="empty-copy">Transactions will appear here once the admin API returns records.</div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminTransactionStore } from 'src/stores/adminTransactionStore'

const adminTransactionStore = useAdminTransactionStore()
const { transactions, isLoading, error, actionTransactionId, actionMessage } = storeToRefs(adminTransactionStore)

const flaggedCount = computed(() =>
  transactions.value.filter((transaction) => transaction.flagged).length
)

const completedVolume = computed(() =>
  transactions.value
    .filter((transaction) => displayStatus(transaction) === 'Completed')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
)

onMounted(async () => {
  try {
    await adminTransactionStore.fetchTransactions()
  } catch (error) {
    console.error('Failed to fetch admin transactions:', error)
  }
})

const toggleTransactionFlag = async (id) => {
  try {
    await adminTransactionStore.toggleTransactionFlag(id)
  } catch (error) {
    console.error('Failed to update transaction flag state:', error)
  }
}

const transactionActionLabel = (transaction) => {
  if (actionTransactionId.value === String(transaction.id)) {
    return transaction.flagged ? 'Unflagging...' : 'Flagging...'
  }

  return transaction.flagged ? 'Unflag' : 'Flag'
}

const displayStatus = (transaction) => {
  if (transaction.flagged) return 'Flagged'
  return transaction.baseStatus || transaction.status
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
</script>

<style scoped>
.admin-transactions-page {
  padding: 34px 38px 42px;
  display: grid;
  gap: 24px;
}

.eyebrow {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-title {
  margin: 8px 0 0;
  color: #111827;
  font-size: clamp(2rem, 3vw, 2.6rem);
}

.page-subtitle {
  margin: 10px 0 0;
  max-width: 720px;
  color: #475569;
  line-height: 1.7;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.summary-card,
.table-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(219, 227, 241, 0.95);
  border-radius: 28px;
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.08);
}

.summary-card {
  padding: 24px 26px;
  display: grid;
  gap: 10px;
}

.summary-label {
  color: #7b87a1;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-card strong {
  color: #111827;
  font-size: 1.8rem;
}

.table-card {
  overflow: hidden;
}

.action-banner {
  margin: 20px 24px 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: #e8f7ef;
  color: #18794e;
  font-weight: 700;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.1fr 1.3fr 0.9fr 0.9fr 0.9fr 0.9fr 1fr 0.8fr;
  gap: 14px;
  align-items: center;
}

.table-head {
  padding: 24px 26px;
  background: #edf2ff;
  color: #2d3748;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.table-row {
  padding: 20px 26px;
  border-top: 1px solid #eef2f9;
}

.loading-state {
  padding: 18px 26px;
  display: grid;
  gap: 14px;
}

.skeleton-row {
  height: 74px;
  border-radius: 20px;
}

.reference-cell {
  color: #2035b6;
  font-weight: 700;
}

.user-cell {
  display: grid;
  gap: 4px;
}

.user-cell strong {
  color: #111827;
}

.user-cell span {
  color: #6b7487;
  font-size: 0.92rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.status-completed {
  background: #e8f7ef;
  color: #18794e;
}

.status-pending,
.status-review {
  background: #fff4db;
  color: #a16207;
}

.status-flagged {
  background: #feeceb;
  color: #b42318;
}

.amount-cell {
  text-align: right;
  color: #18794e;
  font-weight: 800;
}

.amount-cell.debit {
  color: #b42318;
}

.align-right {
  text-align: right;
}

.align-center,
.action-cell {
  text-align: center;
}

.flag-button {
  min-height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: #eef2ff;
  color: #2336d7;
  font-weight: 700;
  cursor: pointer;
}

.flag-button.flagged {
  background: #fef3f2;
  color: #b42318;
}

.flag-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.empty-state {
  padding: 40px 26px;
  text-align: center;
}

.empty-title {
  color: #1f2937;
  font-size: 1.08rem;
  font-weight: 800;
}

.empty-copy {
  margin-top: 8px;
  color: #6b7487;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .table-head,
  .table-row {
    grid-template-columns: 1fr 1.2fr 0.9fr 0.9fr 0.9fr;
  }

  .table-head div:nth-child(5),
  .table-head div:nth-child(7),
  .table-head div:nth-child(8),
  .table-row > div:nth-child(5),
  .table-row > div:nth-child(7),
  .table-row > div:nth-child(8) {
    display: none;
  }
}

@media (max-width: 767px) {
  .admin-transactions-page {
    padding: 24px 16px 32px;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
  }

  .amount-cell,
  .action-cell {
    text-align: left;
  }
}
</style>

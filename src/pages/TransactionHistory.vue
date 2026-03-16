<template>
  <q-page padding>
    <nav class="mobile-nav" :class="{ 'is-open': isNavOpen }">
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

    <div class="nav-backdrop" :class="{ 'is-open': isNavOpen }" @click="closeNav"></div>

    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg history-header">
      <div class="history-heading">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="lt-md"
          aria-label="Toggle navigation"
          @click="toggleNav"
        />
        <div>
          <h1 class="text-h4 text-weight-bold q-my-none history-title">Transaction History</h1>
          <p class="text-subtitle2 text-grey q-my-none">View all your transactions</p>
        </div>
      </div>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        @click="refreshTransactions"
        :loading="transactionStore.loading"
      />
    </div>

    <!-- Filter Tabs -->
    <div class="q-mb-lg">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="all" label="All Transactions" icon="list" />
        <q-tab name="sent" label="Sent" icon="send" />
        <q-tab name="received" label="Received" icon="call_received" />
      </q-tabs>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTransactions.length === 0" class="text-center q-py-lg">
      <q-icon name="inbox" size="64px" color="grey-4" />
      <p class="text-h6 text-grey q-mt-md">No transactions found</p>
      <p class="text-body2 text-grey-7">{{ emptyMessage }}</p>
    </div>

    <!-- Transaction List -->
    <div v-else class="transaction-list">
      <q-card
        v-for="transaction in filteredTransactions"
        :key="transaction.id"
        class="transaction-card q-mb-md cursor-pointer hover-card"
        @click="expandTransaction(transaction)"
      >
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between transaction-row">
            <!-- Left: Icon and Details -->
            <div class="row items-center col transaction-left">
              <!-- Transaction Type Icon -->
              <div
                class="transaction-icon q-mr-md"
                :class="transaction.type === 'debit' ? 'sent-icon' : 'received-icon'"
              >
                <q-icon
                  :name="transaction.type === 'debit' ? 'send' : 'call_received'"
                  color="white"
                  size="sm"
                />
              </div>

              <!-- Transaction Info -->
              <div class="col">
                <!-- Counterparty Name -->
                <div class="text-weight-bold text-body1">
                  {{
                    transaction.type === 'debit'
                      ? `Sent to ${transaction.counterparty_name}`
                      : `Received from ${transaction.counterparty_name}`
                  }}
                </div>

                <!-- Description -->
                <div class="text-caption text-grey q-mt-xs">
                  {{ transaction.description || 'No description' }}
                </div>

                <!-- Date and Status -->
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ formatDate(transaction.date) }}
                  <q-icon
                    v-if="transaction.status === 'completed'"
                    name="check_circle"
                    color="positive"
                    size="xs"
                    class="q-ml-xs"
                  />
                  <q-icon
                    v-else-if="transaction.status === 'pending'"
                    name="schedule"
                    color="warning"
                    size="xs"
                    class="q-ml-xs"
                  />
                  <q-icon
                    v-else-if="transaction.status === 'failed'"
                    name="cancel"
                    color="negative"
                    size="xs"
                    class="q-ml-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Right: Amount -->
            <div
              class="text-right transaction-right"
              :class="transaction.type === 'debit' ? 'text-negative' : 'text-positive'"
            >
              <div class="text-h6 text-weight-bold">
                {{ transaction.type === 'debit' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
              </div>
              <div class="text-caption text-weight-bold">{{ authStore.getWalletCurrency }}</div>
            </div>
          </div>
        </q-card-section>

        <!-- Expandable Details -->
        <q-separator />
        <q-slide-transition>
          <div v-show="expandedTransactionId === transaction.id">
            <q-card-section class="bg-grey-1 q-pa-md">
              <div class="row justify-between">
                <div class="col-sm-6">
                  <div class="text-caption text-weight-bold text-grey">Transaction ID</div>
                  <div class="text-body2 q-mb-md break-word">{{ transaction.id }}</div>

                  <div class="text-caption text-weight-bold text-grey">
                    {{ transaction.type === 'debit' ? 'Recipient' : 'Sender' }}
                  </div>
                  <div class="text-body2 q-mb-md">
                    {{ transaction.counterparty_name }}
                  </div>

                  <div class="text-caption text-weight-bold text-grey">Wallet Address</div>
                  <div class="text-body2 q-mb-md break-word text-primary">
                    {{ transaction.counterparty_address }}
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="text-caption text-weight-bold text-grey">Amount</div>
                  <div
                    class="text-body2 q-mb-md text-weight-bold"
                    :class="transaction.type === 'debit' ? 'text-negative' : 'text-positive'"
                  >
                    {{ transaction.type === 'debit' ? '-' : '+' }}{{
                      formatCurrency(transaction.amount)
                    }}
                    {{ authStore.getWalletCurrency }}
                  </div>

                  <div class="text-caption text-weight-bold text-grey">Status</div>
                  <q-badge
                    :label="transaction.status"
                    :color="getStatusColor(transaction.status)"
                    text-color="white"
                    class="q-mb-md"
                  />

                  <div class="text-caption text-weight-bold text-grey">Date & Time</div>
                  <div class="text-body2">{{ formatDateTime(transaction.date) }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Description -->
              <div v-if="transaction.description">
                <div class="text-caption text-weight-bold text-grey">Description</div>
                <div class="text-body2">{{ transaction.description }}</div>
              </div>

              <!-- Action Buttons -->
              <div class="row q-gutter-md q-mt-md">
                <q-btn
                  flat
                  color="primary"
                  icon="file_download"
                  label="Download Receipt"
                  size="sm"
                />
                <q-btn
                  flat
                  color="primary"
                  icon="share"
                  label="Share"
                  size="sm"
                />
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useTransactionStore } from 'src/stores/transaction'
import { formatCurrency } from 'src/utils/index'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const activeTab = ref('all')
const expandedTransactionId = ref(null)
const isNavOpen = ref(false)

// Fetch transactions on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await transactionStore.fetchTransactions()
  }
})

const refreshTransactions = async () => {
  await transactionStore.fetchTransactions()
}

// Computed property for filtered transactions
const filteredTransactions = computed(() => {
  const transactions = transactionStore.transactions || []

  if (activeTab.value === 'sent') {
    return transactions.filter((t) => t.type === 'debit')
  } else if (activeTab.value === 'received') {
    return transactions.filter((t) => t.type === 'credit')
  }

  return transactions
})

// Computed property for empty message
const emptyMessage = computed(() => {
  if (activeTab.value === 'sent') {
    return "You haven't sent any money yet"
  } else if (activeTab.value === 'received') {
    return "You haven't received any money yet"
  }
  return 'No transactions yet. Start by sending or receiving money!'
})

// Format date to readable format
const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Format date and time
const formatDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'positive'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'negative'
    default:
      return 'grey'
  }
}

// Toggle transaction details
const expandTransaction = (transaction) => {
  expandedTransactionId.value =
    expandedTransactionId.value === transaction.id ? null : transaction.id
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNav = () => {
  isNavOpen.value = false
}
</script>

<style scoped>
.history-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-list {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.transaction-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.hover-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.transaction-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sent-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.received-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.break-word {
  word-break: break-all;
}

.history-title {
  color: #ffffff;
}

.history-header {
  gap: 12px;
  flex-wrap: wrap;
}

.mobile-nav {
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

.mobile-nav.is-open {
  transform: translateX(0);
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

@media (max-width: 600px) {
  .history-title {
    font-size: 1.5rem;
  }

  :deep(.q-tabs) {
    width: 100%;
    overflow-x: auto;
  }

  .transaction-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .transaction-left {
    width: 100%;
  }

  .transaction-right {
    text-align: left;
  }
}
</style>

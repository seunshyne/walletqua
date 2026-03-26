<template>
  <q-page class="history-page">
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
          <button type="button" class="nav-item nav-item-disabled" disabled>
            <q-icon name="download" />
            <span>Receive</span>
          </button>
          <router-link
              to="/fund-wallet"
              class="nav-item"
              active-class="is-active"
              exact-active-class="is-active"
              @click="closeNav"
            >
              <q-icon name="account_balance_wallet" />
              <span>Fund Wallet</span>
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
              <div class="user-name">{{ authStore.user?.name }}</div>
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
              class="lt-md mobile-menu-btn"
              aria-label="Toggle navigation"
              @click="toggleNav"
            />
            <div class="greeting">
              Good morning, <span>{{ authStore.user?.name }}</span>
            </div>
          </div>
          <div class="top-actions">
            <q-btn dense flat round icon="notifications" class="icon-btn" />
            <q-btn dense flat round icon="search" class="icon-btn" />
            <q-btn flat label="Logout" class="logout-top" @click="logout" />
          </div>
        </header>

        <!-- Header -->
        <div class="row items-center justify-between q-mb-lg history-header">
          <div>
            <h1 class="text-h4 text-weight-bold q-my-none history-title">Transaction History</h1>
            <p class="text-subtitle2 text-grey q-my-none">View all your transactions</p>
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

    <!-- Loading Skeleton -->
    <div v-if="transactionStore.loading" class="transaction-skeleton">
      <div v-for="n in 5" :key="`skeleton-${n}`" class="transaction-card q-mb-md">
        <div class="transaction-row">
          <q-skeleton type="QAvatar" size="48px" class="q-mr-md" />
          <div class="skeleton-texts">
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="40%" />
          </div>
          <q-skeleton type="text" width="80px" class="skeleton-amount" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center q-py-lg">
      <q-icon name="inbox" size="64px" color="grey-4" />
      <p class="text-h6 text-grey q-mt-md">No transactions found</p>
      <p class="text-body2 text-grey-7">{{ emptyMessage }}</p>
    </div>

    <!-- Transaction List -->
    <q-infinite-scroll
      v-else
      class="transaction-list"
      :offset="150"
      @load="onLoadMore"
    >
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

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" size="30px" />
        </div>
      </template>
    </q-infinite-scroll>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useTransactionStore } from 'src/stores/transaction'
import { formatCurrency } from 'src/utils/index'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const activeTab = ref('all')
const expandedTransactionId = ref(null)
const isNavOpen = ref(false)
const currentPage = ref(1)

// Fetch transactions on mount
onMounted(async () => {
  if (authStore.isAuthenticated && !transactionStore.transactions?.length) {
    await transactionStore.fetchTransactions()
  }
})

const refreshTransactions = async () => {
  currentPage.value = 1
  await transactionStore.fetchTransactions()
}

// Computed property for filtered transactions
const filteredTransactions = computed(() => {
  const transactions = transactionStore.transactions || []

  if (activeTab.value === 'sent') {
    return transactions
      .filter((t) => t.type === 'debit')
      .slice(0, currentPage.value * 10)
  } else if (activeTab.value === 'received') {
    return transactions
      .filter((t) => t.type === 'credit')
      .slice(0, currentPage.value * 10)
  }

  return transactions.slice(0, currentPage.value * 10)
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

watch(activeTab, () => {
  currentPage.value = 1
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

const logout = async () => {
  const result = await authStore.logout()
  if (!result?.success) {
    console.error('Logout action failed:', result)
  }
}

const onLoadMore = (index, done) => {
  currentPage.value += 1

  const allCount = activeTab.value === 'sent'
    ? (transactionStore.transactions || []).filter((t) => t.type === 'debit').length
    : activeTab.value === 'received'
      ? (transactionStore.transactions || []).filter((t) => t.type === 'credit').length
      : (transactionStore.transactions || []).length

  if (allCount <= currentPage.value * 10) {
    done(true)
    return
  }

  done()
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  padding: 0;
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
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #b2c1da;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
  background: rgba(123, 96, 255, 0.12);
  color: #ffffff;
}

.nav-item-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
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

.mobile-menu-btn {
  color: #ffffff;
}

.transaction-list {
  animation: slideUp 0.3s ease;
}

.transaction-skeleton .transaction-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.skeleton-texts {
  flex: 1 1 auto;
  display: grid;
  gap: 8px;
}

.skeleton-amount {
  margin-left: auto;
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #152a42;
  color: #dbe7f7;
}

.hover-card:hover {
  box-shadow: 0 8px 20px rgba(8, 15, 27, 0.28);
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

:deep(.q-tabs) {
  color: #8ea2c2;
}

:deep(.q-tab--active) {
  color: #ffffff;
}

:deep(.q-tab__indicator) {
  background: #a855f7;
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

@media (max-width: 700px) {
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
    flex: 0 0 auto;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1 1 100%;
  }

  .nav-item {
    flex: 1 1 160px;
  }

  .sidebar-footer {
    display: none;
  }
}

@media (max-width: 700px) {
  .dash-main {
    padding: 20px 18px 32px;
  }

  .nav {
    row-gap: 8px;
  }

  .nav-item {
    flex: 0 0 auto;
    justify-content: flex-start;
  }

  .dash-sidebar {
    align-items: flex-start;
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

  .dash-sidebar {
    position: relative;
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

  .nav-item {
    width: 100%;
  }

  .dash-sidebar > *:not(.nav) {
    display: none;
  }
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

@media (max-width: 560px) {
  .dash-topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dash-sidebar {
    padding: 16px;
    gap: 16px;
    align-items: flex-start;
  }

  .nav {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<template>
  <q-page class="dash-page">
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
          <router-link to="/home" class="nav-item is-active" @click="closeNav">
            <q-icon name="grid_view" />
            <span>Home</span>
          </router-link>
          <router-link to="/dashboard" class="nav-item is-active" @click="closeNav">
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
          <button class="logout-btn">
            <q-icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        class="nav-backdrop"
        :class="{ 'is-open': isNavOpen }"
        @click="closeNav"
      ></div>

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
          </div>
        </header>

        <section class="balance-card">
          <div>
            <div class="balance-label">+2.4% this month</div>
            <div class="balance-amount">{{ formatCurrency(authStore.getWalletBalance) }}</div>
            <div class="balance-sub">Total combined balance</div>
          </div>
          <div class="balance-actions">
            <q-btn class="primary-btn" label="View Details" no-caps />
            <q-btn class="ghost-btn" round dense icon="more_horiz" />
          </div>
        </section>

        <section class="quick-actions">
          <button class="quick-card" @click="() => router.push({ name: 'send' })">
            <div class="quick-icon">
              <q-icon name="north_east" />
            </div>
            <div>Send</div>
          </button>
          <button class="quick-card" @click="receiveMoney">
            <div class="quick-icon">
              <q-icon name="south_west" />
            </div>
            <div>Receive</div>
          </button>
          <button class="quick-card">
            <div class="quick-icon">
              <q-icon name="payments" />
            </div>
            <div>Pay Bills</div>
          </button>
          <button class="quick-card">
            <div class="quick-icon">
              <q-icon name="add" />
            </div>
            <div>Top-up</div>
          </button>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">Monthly Income</div>
            <div class="stat-value">$4,200 <span class="stat-change up">+12%</span></div>
            <div class="stat-bar">
              <span class="bar-fill teal"></span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Total Expenses</div>
            <div class="stat-value">$2,150 <span class="stat-change down">-5%</span></div>
            <div class="stat-bar">
              <span class="bar-fill rose"></span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Savings Rate</div>
            <div class="stat-value">15% <span class="stat-change up">+2%</span></div>
            <div class="stat-bar">
              <span class="bar-fill purple"></span>
            </div>
          </div>
        </section>

        <section class="transactions">
          <div class="transactions-header">
            <div>Recent Transactions</div>
            <button class="link-btn">View all</button>
          </div>

          <div class="transactions-list">
            <div v-for="tx in recentTransactions" :key="tx.id" class="tx-row">
              <div class="tx-icon">
                <q-icon :name="tx.type === 'debit' ? 'payments' : 'account_balance_wallet'" />
              </div>
              <div class="tx-info">
                <div class="tx-title">
                  {{ tx.description || tx.counterparty_name || 'Transaction' }}
                </div>
                <div class="tx-sub">
                  {{ formatDate(tx.date || tx.created_at) }} • {{ tx.type || 'transfer' }}
                </div>
              </div>
              <div class="tx-amount" :class="tx.type === 'debit' ? 'negative' : 'positive'">
                {{ tx.type === 'debit' ? '-' : '+' }}{{ formatCurrency(tx.amount) }}
              </div>
              <div class="tx-badge" :class="tx.type === 'debit' ? 'debit' : 'credit'">
                {{ tx.type === 'debit' ? 'DEBIT' : 'CREDIT' }}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useTransactionStore } from 'src/stores/transaction'
import { formatCurrency } from 'src/utils/index'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const isNavOpen = ref(false)

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

const recentTransactions = computed(() => {
  const transactions = Array.isArray(transactionStore.transactions) ? transactionStore.transactions : []
  return [...transactions]
    .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0))
    .slice(0, 5)
})

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const columns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left', format: (val) => formatDate(val) },
  { name: 'type', label: 'Type', field: 'type', align: 'left' },
  { name: 'counterparty', label: 'Counterparty', field: 'counterparty_name', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'successful':
      return 'positive'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'negative'
    default:
      return 'grey'
  }
}

function receiveMoney() {
  console.log('Receive money clicked');
}

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const closeNav = () => {
  isNavOpen.value = false
}
</script>

<style scoped>
.dash-page {
  min-height: 100vh;
  background: #0f1c2e;
  color: #d7e3f4;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
}

.dash-shell {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
}

.dash-sidebar {
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

.nav-item.is-active {
  background: rgba(123, 96, 255, 0.2);
  color: #d7c6ff;
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
}

.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

.greeting-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-card {
  margin-top: 22px;
  background: #18314b;
  border-radius: 20px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.balance-label {
  color: #5de0e6;
  font-size: 0.85rem;
  font-weight: 600;
}

.balance-amount {
  font-size: 2.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 4px 0 6px;
}

.balance-sub {
  color: #9ab0cc;
}

.balance-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.primary-btn {
  background: linear-gradient(135deg, #a855f7, #6d28d9);
  color: #ffffff;
  border-radius: 14px;
  padding: 8px 20px;
}

.ghost-btn {
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.quick-actions {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.quick-card {
  background: #152a42;
  border-radius: 18px;
  padding: 18px;
  color: #ffffff;
  display: grid;
  justify-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(8, 15, 27, 0.3);
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: rgba(94, 234, 212, 0.2);
  display: grid;
  place-items: center;
  color: #5eead4;
}

.stats-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  background: #152a42;
  border-radius: 18px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-title {
  color: #9bb1cc;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-change.up {
  color: #5eead4;
}

.stat-change.down {
  color: #fb7185;
}

.stat-bar {
  margin-top: 12px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  display: block;
  border-radius: 999px;
}

.bar-fill.teal {
  width: 65%;
  background: #5eead4;
}

.bar-fill.rose {
  width: 45%;
  background: #fb7185;
}

.bar-fill.purple {
  width: 30%;
  background: #a855f7;
}

.transactions {
  margin-top: 26px;
  background: #152a42;
  border-radius: 20px;
  padding: 20px 22px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.link-btn {
  background: transparent;
  border: none;
  color: #c084fc;
  cursor: pointer;
  font-weight: 600;
}

.transactions-list {
  display: grid;
  gap: 14px;
}

.tx-row {
  display: grid;
  grid-template-columns: 44px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tx-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.tx-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(94, 234, 212, 0.15);
  display: grid;
  place-items: center;
  color: #5eead4;
}

.tx-title {
  color: #ffffff;
  font-weight: 600;
}

.tx-sub {
  color: #8ea2c2;
  font-size: 0.8rem;
}

.tx-amount {
  font-weight: 600;
  color: #ffffff;
}

.tx-amount.negative {
  color: #fb7185;
}

.tx-amount.positive {
  color: #5eead4;
}

.tx-badge {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  font-weight: 600;
}

.tx-badge.debit {
  background: rgba(251, 113, 133, 0.15);
  color: #fb7185;
}

.tx-badge.credit {
  background: rgba(94, 234, 212, 0.15);
  color: #5eead4;
}

@media (max-width: 1100px) {
  .dash-shell {
    grid-template-columns: 1fr;
  }

  .dash-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
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

@media (max-width: 900px) {
  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tx-row {
    grid-template-columns: 44px 1fr;
    grid-auto-rows: auto;
    row-gap: 6px;
  }

  .tx-amount,
  .tx-badge {
    justify-self: start;
  }
}

@media (max-width: 700px) {
  .dash-main {
    padding: 20px 18px 32px;
  }

  .balance-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav {
    row-gap: 8px;
  }

  .nav-item {
    flex: 1 1 calc(50% - 10px);
    justify-content: flex-start;
  }

  .dash-sidebar {
    align-items: flex-start;
  }

  .nav {
    display: none;
    width: 100%;
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
}


@media (max-width: 560px) {
  .dash-topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .quick-actions {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
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

  .balance-card {
    padding: 18px;
  }

  .balance-amount {
    font-size: 1.9rem;
  }

  .quick-card {
    padding: clamp(8px, 2.2vw, 10px);
    font-size: clamp(0.72rem, 2.2vw, 0.8rem);
    border-radius: 14px;
    gap: 8px;
  }

  .quick-icon {
    width: clamp(26px, 7vw, 30px);
    height: clamp(26px, 7vw, 30px);
    border-radius: 12px;
  }
}

@media (max-width: 400px) {
  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>


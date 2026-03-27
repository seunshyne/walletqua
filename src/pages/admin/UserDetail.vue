<template>
  <q-page class="user-detail-page">
    <div class="detail-head">
      <div>
        <div class="eyebrow">User Management</div>
        <h1 class="page-title">{{ user?.name || 'User Details' }}</h1>
        <p v-if="user" class="page-subtitle">
          Account overview backed by the current admin user resource.
        </p>
      </div>
      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Back to Users"
        class="back-button"
        @click="router.push({ name: 'admin-users' })"
      />
    </div>

    <div v-if="isDetailLoading" class="loading-shell">
      <q-skeleton class="detail-skeleton hero" />
      <q-skeleton class="detail-skeleton mid" />
      <q-skeleton class="detail-skeleton tall" />
    </div>

    <div v-else-if="user" class="detail-grid">
      <section class="hero-card">
        <div class="hero-profile">
          <div class="avatar-shell" :class="`accent-${user.accent}`">{{ user.initials }}</div>

          <div class="hero-copy">
            <div class="hero-name-row">
              <div>
                <div class="hero-name">{{ user.name }}</div>
                <div class="hero-id">ID: #{{ user.id }}</div>
              </div>
              <span class="status-pill" :class="`status-${user.status.toLowerCase()}`">
                {{ user.status }}
              </span>
            </div>

            <div class="hero-meta">
              <span>{{ user.email }}</span>
              <span>{{ user.role }}</span>
              <span>Joined {{ user.joinedDate }}</span>
            </div>
          </div>
        </div>

        <div class="stat-grid">
          <article class="stat-card">
            <div class="stat-label">Wallet Balance</div>
            <div class="stat-value">{{ formatCurrency(user.walletBalance) }}</div>
          </article>
          <article class="stat-card">
            <div class="stat-label">Role</div>
            <div class="stat-value small">{{ user.role }}</div>
          </article>
          <article class="stat-card">
            <div class="stat-label">Currency</div>
            <div class="stat-value small">{{ user.wallet.currency }}</div>
          </article>
          <article class="stat-card">
            <div class="stat-label">Transactions</div>
            <div class="stat-value small">{{ user.transactions.length }}</div>
          </article>
        </div>
      </section>

      <section class="summary-grid">
        <article class="info-card">
          <div class="section-title">Profile Overview</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Role</span>
              <span class="info-value">{{ user.role }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Joined Date</span>
              <span class="info-value">{{ user.joinedDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value">{{ user.status }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Wallet Address</span>
              <span class="info-value">{{ user.wallet.address }}</span>
            </div>
          </div>
        </article>

        <article class="info-card wallet-card">
          <div class="section-title">Wallet Snapshot</div>
          <div class="wallet-stats">
            <div class="wallet-item">
              <span>Currency</span>
              <strong>{{ user.wallet.currency }}</strong>
            </div>
            <div class="wallet-item">
              <span>Available</span>
              <strong>{{ formatCurrency(user.wallet.availableBalance) }}</strong>
            </div>
            <div class="wallet-item">
              <span>Ledger</span>
              <strong>{{ formatCurrency(user.wallet.ledgerBalance) }}</strong>
            </div>
            <div class="wallet-item">
              <span>Transactions</span>
              <strong>{{ user.transactions.length }}</strong>
            </div>
          </div>

          <div class="detail-actions">
            <q-btn
              unelevated
              no-caps
              :label="user.status === 'Suspended' ? 'Restore Account' : 'Suspend Account'"
              :loading="actionUserId === String(user.id)"
              @click="toggleSuspension(user.id)"
            />
          </div>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel-card transactions-card">
          <div class="panel-head">
            <div>
              <div class="section-title">Transactions</div>
              <div class="panel-subtitle">Payments and account movements linked to this user.</div>
            </div>
            <q-btn flat dense no-caps icon="download" label="Export" />
          </div>

          <div class="transaction-table">
            <div class="transaction-header">
              <div>Reference</div>
              <div>Type</div>
              <div>Channel</div>
              <div>Status</div>
              <div class="align-right">Amount</div>
              <div>Date</div>
            </div>

            <div
              v-for="transaction in user.transactions"
              :key="transaction.id"
              class="transaction-row"
            >
              <div class="reference-cell">{{ transaction.id }}</div>
              <div>{{ transaction.type }}</div>
              <div>{{ transaction.channel }}</div>
              <div>
                <span class="transaction-status" :class="`tx-${transaction.status.toLowerCase().replace(/\\s+/g, '-')}`">
                  {{ transaction.status }}
                </span>
              </div>
              <div class="amount-cell" :class="{ debit: transaction.amount < 0 }">
                {{ formatCurrency(transaction.amount) }}
              </div>
              <div>{{ transaction.date }}</div>
            </div>
          </div>
        </article>
      </section>
    </div>

    <section v-else class="empty-card">
      <div class="section-title">User not found</div>
      <p>{{ error || 'This user record is unavailable. Return to the user management list to continue.' }}</p>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAdminUserStore } from 'src/stores/adminUserStore'

const route = useRoute()
const router = useRouter()
const adminUserStore = useAdminUserStore()
const { selectedUser, isDetailLoading, error, actionUserId } = storeToRefs(adminUserStore)

const user = computed(() => selectedUser.value || adminUserStore.getUserById(route.params.id))

const loadUser = async (id) => {
  try {
    await adminUserStore.fetchUser(id)
  } catch (error) {
    console.error('Failed to fetch admin user details:', error)
  }
}

onMounted(() => {
  loadUser(route.params.id)
})

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      loadUser(id)
    }
  }
)

const toggleSuspension = async (id) => {
  try {
    await adminUserStore.toggleUserSuspension(id)
  } catch (error) {
    console.error('Failed to toggle user suspension:', error)
  }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(value)
</script>

<style scoped>
.user-detail-page {
  padding: 34px 38px 42px;
  display: grid;
  gap: 24px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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
  font-size: clamp(2rem, 3vw, 2.6rem);
  color: #111827;
}

.page-subtitle {
  margin: 10px 0 0;
  color: #475569;
  max-width: 700px;
  line-height: 1.7;
}

.back-button {
  border-radius: 16px;
  color: #334155;
  background: rgba(255, 255, 255, 0.8);
}

.detail-grid,
.summary-grid,
.content-grid {
  display: grid;
  gap: 22px;
}

.summary-grid {
  grid-template-columns: 1.35fr 0.95fr;
}

.hero-card,
.info-card,
.panel-card,
.empty-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(219, 227, 241, 0.95);
  border-radius: 28px;
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.08);
}

.hero-card {
  padding: 28px;
  display: grid;
  gap: 26px;
}

.hero-profile {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-shell {
  width: 86px;
  height: 86px;
  border-radius: 26px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
}

.accent-indigo { background: linear-gradient(135deg, #2b3294, #5363ff); }
.accent-sand { background: linear-gradient(135deg, #9d6f37, #d6ad73); }
.accent-slate { background: linear-gradient(135deg, #0f172a, #475569); }
.accent-rose { background: linear-gradient(135deg, #7c2d54, #ec4899); }
.accent-teal { background: linear-gradient(135deg, #0f766e, #2dd4bf); }
.accent-amber { background: linear-gradient(135deg, #92400e, #f59e0b); }

.hero-copy {
  flex: 1 1 auto;
  display: grid;
  gap: 14px;
}

.hero-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-name {
  font-size: 1.9rem;
  font-weight: 800;
  color: #172033;
}

.hero-id {
  margin-top: 6px;
  color: #67748f;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  color: #5f6d86;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 800;
}

.status-active {
  color: #fff;
  background: linear-gradient(135deg, #3145b4, #5f78ff);
}

.status-suspended {
  color: #fff7ed;
  background: linear-gradient(135deg, #b27b46, #d4a36d);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card,
.info-item {
  padding: 20px;
  border-radius: 22px;
  background: #f8faff;
  border: 1px solid #e3eaf7;
}

.stat-label,
.info-label {
  color: #7b87a1;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-value {
  margin-top: 10px;
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.stat-value.small {
  font-size: 1.1rem;
}

.info-card,
.panel-card,
.empty-card {
  padding: 28px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #172033;
}

.info-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.info-item {
  display: grid;
  gap: 8px;
}

.info-value {
  color: #182131;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.wallet-stats {
  margin-top: 22px;
  display: grid;
  gap: 12px;
}

.wallet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #445069;
}

.wallet-item strong {
  color: #111827;
}

.detail-actions {
  margin-top: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-subtitle {
  margin-top: 6px;
  color: #6b7487;
}

.transaction-table {
  margin-top: 22px;
  display: grid;
}

.transaction-header,
.transaction-row {
  display: grid;
  grid-template-columns: 1.15fr 0.9fr 1fr 0.9fr 0.9fr 1fr;
  gap: 14px;
  align-items: center;
}

.transaction-header {
  padding: 0 0 16px;
  color: #6b7487;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.transaction-row {
  padding: 18px 0;
  border-top: 1px solid #edf2fb;
}

.reference-cell {
  color: #2035b6;
  font-weight: 700;
}

.transaction-status {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
}

.tx-completed {
  background: #e8f7ef;
  color: #18794e;
}

.tx-review,
.tx-pending-review,
.tx-flagged {
  background: #fff4db;
  color: #a16207;
}

.tx-declined {
  background: #feeceb;
  color: #b42318;
}

.amount-cell {
  text-align: right;
  font-weight: 800;
  color: #18794e;
}

.amount-cell.debit {
  color: #b42318;
}

.align-right {
  text-align: right;
}

.empty-card p {
  margin: 12px 0 0;
  color: #667085;
}

.loading-shell {
  display: grid;
  gap: 18px;
}

.detail-skeleton {
  border-radius: 28px;
}

.detail-skeleton.hero {
  height: 220px;
}

.detail-skeleton.mid {
  height: 280px;
}

.detail-skeleton.tall {
  height: 360px;
}

@media (max-width: 1180px) {
  .summary-grid,
  .stat-grid,
  .info-grid,
  .transaction-header,
  .transaction-row {
    grid-template-columns: 1fr 1fr;
  }

  .transaction-header div:nth-child(3),
  .transaction-header div:nth-child(6),
  .transaction-row div:nth-child(3),
  .transaction-row div:nth-child(6) {
    display: none;
  }
}

@media (max-width: 767px) {
  .user-detail-page {
    padding: 24px 16px 32px;
  }

  .detail-head,
  .hero-profile,
  .hero-name-row,
  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid,
  .stat-grid,
  .info-grid,
  .transaction-header,
  .transaction-row {
    grid-template-columns: 1fr;
  }

  .transaction-header {
    display: none;
  }
}
</style>

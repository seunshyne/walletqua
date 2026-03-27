<template>
  <q-page class="user-management-page">
    <div class="page-copy">
      <div>
        <div class="eyebrow">Admin Users</div>
        <h1 class="page-title">User Management</h1>
      </div>
    </div>

    <section class="filter-bar">
      <div class="search-box">
        <q-icon name="search" size="24px" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search by name or email..."
        />
      </div>

      <div class="filter-chips">
        <button
          v-for="option in filterOptions"
          :key="option"
          type="button"
          class="filter-chip"
          :class="{ active: activeFilter === option }"
          @click="activeFilter = option"
        >
          {{ option }}
        </button>
      </div>

      <button type="button" class="clear-button" @click="resetFilters">
        <q-icon name="filter_alt_off" size="20px" />
        <span>Clear Filters</span>
      </button>

      <div class="toolbar-actions">
        <button type="button" class="secondary-button">
          <q-icon name="download" size="20px" />
          <span>Export</span>
        </button>
      </div>
    </section>

    <section class="table-card">
      <div class="table-head">
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
        <div class="align-right">Wallet Balance</div>
        <div>Joined</div>
        <div class="align-center">Actions</div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <q-skeleton v-for="n in 4" :key="n" class="skeleton-row" />
      </div>

      <div
        v-for="user in paginatedUsers"
        :key="user.id"
        class="table-row"
      >
        <div class="name-cell">
          <div class="avatar-chip" :class="`accent-${user.accent}`">{{ user.initials }}</div>
          <div class="user-copy">
            <button type="button" class="user-link" @click="openUser(user.id)">{{ user.name }}</button>
            <div class="user-id">ID: #{{ user.id }}</div>
          </div>
        </div>

        <div class="email-cell">{{ user.email }}</div>

        <div>
          <span class="status-pill" :class="`status-${user.status.toLowerCase()}`">
            <span class="status-dot"></span>
            {{ user.status }}
          </span>
        </div>

        <div class="balance-cell">{{ formatCurrency(user.walletBalance) }}</div>

        <div class="joined-cell">
          <div>{{ user.joinedLabel }}</div>
          <div class="joined-date">{{ user.joinedDate }}</div>
        </div>

        <div class="action-cell">
          <button
            type="button"
            class="icon-button"
            :title="user.status === 'Suspended' ? 'Restore user' : 'Suspend user'"
            :disabled="actionUserId === String(user.id)"
            @click="toggleSuspension(user.id)"
          >
            <q-icon
              :name="actionUserId === String(user.id)
                ? 'hourglass_top'
                : user.status === 'Suspended'
                  ? 'history'
                  : 'block'"
              size="22px"
            />
          </button>
          <button
            type="button"
            class="icon-button"
            title="View user details"
            @click="openUser(user.id)"
          >
            <q-icon name="visibility" size="22px" />
          </button>
        </div>
      </div>

      <div v-if="actionMessage && !error && !isLoading" class="action-banner">
        {{ actionMessage }}
      </div>

      <div v-if="error && !isLoading" class="empty-state">
        <div class="empty-title">Unable to load users</div>
        <div class="empty-copy">{{ error }}</div>
      </div>

      <div v-else-if="!paginatedUsers.length && !isLoading" class="empty-state">
        <div class="empty-title">No users matched this filter</div>
        <div class="empty-copy">Try another search term or clear the active status filter.</div>
      </div>

      <div class="table-footer">
        <div class="rows-control">
          <span>Rows per page:</span>
          <select v-model.number="rowsPerPage" class="rows-select">
            <option :value="4">4</option>
            <option :value="6">6</option>
            <option :value="10">10</option>
          </select>
        </div>

        <div class="pagination-block">
          <span>{{ paginationLabel }}</span>
          <div class="pagination-actions">
            <button type="button" class="pager-button" :disabled="page === 1" @click="page = 1">
              <q-icon name="first_page" />
            </button>
            <button type="button" class="pager-button" :disabled="page === 1" @click="page -= 1">
              <q-icon name="chevron_left" />
            </button>
            <button
              type="button"
              class="pager-button"
              :disabled="page === totalPages"
              @click="page += 1"
            >
              <q-icon name="chevron_right" />
            </button>
            <button
              type="button"
              class="pager-button"
              :disabled="page === totalPages"
              @click="page = totalPages"
            >
              <q-icon name="last_page" />
            </button>
          </div>
        </div>
      </div>
    </section>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAdminUserStore } from 'src/stores/adminUserStore'

const router = useRouter()
const adminUserStore = useAdminUserStore()
const { users, isLoading, error, actionUserId, actionMessage } = storeToRefs(adminUserStore)

const filterOptions = ['All', 'Active', 'Suspended']
const searchTerm = ref('')
const activeFilter = ref('All')
const page = ref(1)
const rowsPerPage = ref(4)

const filteredUsers = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return users.value.filter((user) => {
    const matchesStatus =
      activeFilter.value === 'All' || user.status === activeFilter.value
    const matchesQuery =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)

    return matchesStatus && matchesQuery
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / rowsPerPage.value))
)

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * rowsPerPage.value
  return filteredUsers.value.slice(start, start + rowsPerPage.value)
})

const paginationLabel = computed(() => {
  if (!filteredUsers.value.length) return '0-0 of 0'
  const start = (page.value - 1) * rowsPerPage.value + 1
  const end = Math.min(page.value * rowsPerPage.value, filteredUsers.value.length)
  return `${start}-${end} of ${filteredUsers.value.length}`
})

watch([searchTerm, activeFilter, rowsPerPage], () => {
  page.value = 1
})

watch(totalPages, (value) => {
  if (page.value > value) {
    page.value = value
  }
})

const resetFilters = () => {
  searchTerm.value = ''
  activeFilter.value = 'All'
}

const openUser = (id) => {
  router.push({ name: 'admin-user-detail', params: { id } })
}

const toggleSuspension = async (id) => {
  try {
    await adminUserStore.toggleUserSuspension(id)
  } catch (error) {
    console.error('Failed to toggle user suspension:', error)
  }
}

onMounted(async () => {
  try {
    await adminUserStore.fetchUsers()
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
  }
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(value)
</script>

<style scoped>
.user-management-page {
  padding: 22px 38px 42px;
  display: grid;
  gap: 24px;
}

.page-copy {
  display: flex;
  align-items: center;
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
  font-weight: 800;
}

.filter-bar,
.table-card,
.insight-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(219, 227, 241, 0.95);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.08);
}

.filter-bar {
  border-radius: 26px;
  padding: 26px;
  display: grid;
  grid-template-columns: minmax(260px, 1.1fr) auto auto auto;
  gap: 16px;
  align-items: center;
  background: #eff3ff;
}

.search-box {
  min-height: 60px;
  padding: 0 18px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #eef2fb;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #7f8aa3;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #22314c;
  font-size: 1.05rem;
}

.filter-chips {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #eef2fb;
}

.filter-chip,
.clear-button,
.secondary-button,
.primary-button,
.icon-button,
.pager-button,
.audit-button,
.user-link {
  border: none;
  cursor: pointer;
}

.filter-chip {
  min-height: 44px;
  padding: 0 22px;
  border-radius: 14px;
  background: transparent;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 700;
}

.filter-chip.active {
  background: linear-gradient(135deg, #2539b3, #3148d4);
  color: #fff;
  box-shadow: 0 10px 22px rgba(47, 68, 196, 0.24);
}

.clear-button,
.secondary-button,
.primary-button {
  min-height: 60px;
  padding: 0 22px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 700;
}

.clear-button,
.secondary-button {
  background: #fff;
  color: #24324a;
  border: 1px solid #eef2fb;
}

.clear-button {
  color: #2539b3;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
}

.primary-button {
  background: linear-gradient(135deg, #2539b3, #3148d4);
  color: #fff;
  box-shadow: 0 18px 30px rgba(47, 68, 196, 0.26);
}

.table-card {
  border-radius: 28px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
}

.action-banner {
  margin: 16px 30px 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: #e8f7ef;
  color: #18794e;
  font-weight: 700;
}

.loading-state {
  padding: 18px 30px;
  display: grid;
  gap: 14px;
}

.skeleton-row {
  height: 78px;
  border-radius: 20px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2.1fr 2fr 1.1fr 1.1fr 1fr 0.9fr;
  gap: 16px;
  align-items: center;
}

.table-head {
  padding: 24px 30px;
  background: #edf2ff;
  color: #2d3748;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.table-row {
  padding: 22px 30px;
  border-top: 1px solid #eef2f9;
  background: rgba(255, 255, 255, 0.98);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-chip {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
}

.accent-indigo { background: linear-gradient(135deg, #2b3294, #5363ff); }
.accent-sand { background: linear-gradient(135deg, #9d6f37, #d6ad73); }
.accent-slate { background: linear-gradient(135deg, #0f172a, #475569); }
.accent-rose { background: linear-gradient(135deg, #7c2d54, #ec4899); }
.accent-teal { background: linear-gradient(135deg, #0f766e, #2dd4bf); }
.accent-amber { background: linear-gradient(135deg, #92400e, #f59e0b); }

.user-copy {
  display: grid;
  gap: 6px;
}

.user-link {
  padding: 0;
  background: transparent;
  color: #2035b6;
  font-size: 1.12rem;
  font-weight: 800;
  text-align: left;
}

.user-id,
.email-cell,
.joined-cell {
  color: #6b7487;
  font-size: 1rem;
}

.joined-date {
  margin-top: 4px;
  font-size: 0.88rem;
  color: #94a3b8;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 800;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.8;
}

.status-active {
  color: #ffffff;
  background: linear-gradient(135deg, #3044b3, #6079ff);
}

.status-suspended {
  color: #fff7ed;
  background: linear-gradient(135deg, #b9814b, #d4a46d);
}

.balance-cell {
  text-align: right;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 800;
}

.align-right {
  text-align: right;
}

.align-center,
.action-cell {
  text-align: center;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icon-button {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #f3f6fc;
  color: #3f4657;
}

.icon-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.empty-state {
  padding: 42px 30px;
  text-align: center;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
}

.empty-copy {
  margin-top: 8px;
  color: #6b7487;
}

.table-footer {
  padding: 22px 30px;
  background: #f8faff;
  border-top: 1px solid #e7edf8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.rows-control,
.pagination-block,
.pagination-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rows-control {
  color: #2f3a4f;
}

.rows-select {
  min-width: 72px;
  min-height: 34px;
  border-radius: 10px;
  border: 1px solid #dbe3f1;
  background: #fff;
  padding: 0 10px;
}

.pagination-block {
  margin-left: auto;
  color: #2f3a4f;
  font-weight: 700;
}

.pager-button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: transparent;
  color: #1f2937;
}

.pager-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 1380px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    justify-self: start;
  }
}

@media (max-width: 1180px) {
  .table-head,
  .table-row {
    grid-template-columns: 1.8fr 1.8fr 1fr 1fr;
  }

  .table-head div:nth-child(5),
  .table-head div:nth-child(6),
  .table-row > div:nth-child(5),
  .table-row > div:nth-child(6) {
    display: none;
  }
}

@media (max-width: 767px) {
  .user-management-page {
    padding: 24px 16px 32px;
  }

  .filter-bar,
  .table-head,
  .table-row,
  .table-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .email-cell,
  .balance-cell,
  .joined-cell,
  .action-cell {
    text-align: left;
    justify-content: flex-start;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination-block {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>

<template>
  <q-layout view="lHh Lpr lFf" class="admin-layout">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="250"
      :breakpoint="1024"
      dark
      bordered
      class="admin-drawer"
      content-class="admin-drawer-content"
      :content-style="drawerContentStyle"
    >
      <div class="drawer-shell">
        <div class="brand-block">
          <div class="brand-mark">P</div>
          <div>
            <div class="brand-title">PrimeWallet</div>
            <div class="brand-subtitle">System Root</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <router-link
            v-for="item in sidebarItems"
            :key="item.label"
            :to="item.to"
            class="sidebar-link"
            :class="{ 'is-active': activeSidebarItem === item.label }"
            @click="activeSidebarItem = item.label"
          >
            <q-icon :name="item.icon" size="24px" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="drawer-footer">
          <button class="footer-link" type="button">
            <q-icon name="help_outline" size="20px" />
            <span>Support</span>
          </button>
          <button class="footer-link" type="button" :disabled="isLoggingOut" @click="handleLogout">
            <q-icon name="logout" size="20px" />
            <span>{{ isLoggingOut ? 'Logging out...' : 'Logout' }}</span>
          </button>
        </div>
      </div>
    </q-drawer>

    <q-header class="admin-header" elevated>
      <q-toolbar class="toolbar-shell">
        <div class="header-left">
          <q-btn
            flat
            round
            dense
            icon="menu"
            class="menu-toggle lt-lg"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />

          <div class="search-shell">
            <q-icon name="search" class="search-icon" />
            <input
              class="search-input"
              type="text"
              placeholder="Global search..."
            />
          </div>
        </div>

        <div class="header-center gt-sm">
          <router-link
            v-for="item in topItems"
            :key="item.label"
            :to="item.to"
            class="top-link"
            :class="{ 'is-active': activeTopItem === item.label }"
            @click="activeTopItem = item.label"
          >
            {{ item.label }}
          </router-link>
        </div>

        <div class="header-right">
          <button class="header-icon" type="button">
            <q-icon name="notifications" size="22px" />
            <span class="notification-dot"></span>
          </button>
          <button class="header-icon gt-xs" type="button">
            <q-icon name="settings" size="22px" />
          </button>

          <div class="admin-profile">
            <div class="profile-copy">
              <div class="profile-name">{{ adminName }}</div>
              <div class="profile-role">{{ adminRole }}</div>
            </div>
            <div class="profile-avatar">{{ adminInitials }}</div>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAdminAuthStore } from 'src/stores/adminAuth'

const router = useRouter()
const route = useRoute()
const adminAuthStore = useAdminAuthStore()
const { admin } = storeToRefs(adminAuthStore)
const leftDrawerOpen = ref(true)
const activeSidebarItem = ref('Overview')
const activeTopItem = ref('Dashboard')
const isLoggingOut = ref(false)

const adminName = computed(() => adminAuthStore.adminName)
const adminRole = computed(() => adminAuthStore.adminRole)
const adminInitials = computed(() => {
  const source = admin.value?.name || 'Admin User'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
})

const drawerContentStyle = {
  background: '#191a1f',
  color: '#c0cae1',
}

const sidebarItems = [
  { label: 'Overview', icon: 'dashboard', to: '/admin/dashboard' },
  { label: 'Transactions', icon: 'payments', to: '/admin/transactions' },
  { label: 'User Management', icon: 'groups', to: '/admin/users' },
  { label: 'Security', icon: 'security', to: '/admin/dashboard' },
  { label: 'System Health', icon: 'monitor_heart', to: '/admin/dashboard' },
  { label: 'Audit Logs', icon: 'history', to: '/admin/dashboard' },
]

const topItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Analytics', to: '/admin/dashboard' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Logs', to: '/admin/dashboard' },
]

watch(
  () => route.path,
  (path) => {
    if (path === '/admin/users' || path.startsWith('/admin/users/')) {
      activeTopItem.value = 'Users'
      return
    }

    if (path === '/admin/transactions') {
      activeTopItem.value = 'Dashboard'
      return
    }

    if (path === '/admin/dashboard') {
      activeTopItem.value = 'Dashboard'
    }
  },
  { immediate: true },
)

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await adminAuthStore.logout()
    router.push({ name: 'admin-login' })
  } catch (error) {
    console.error('Admin logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.admin-layout {
  background:
    radial-gradient(circle at top left, rgba(75, 92, 255, 0.08), transparent 28%),
    linear-gradient(180deg, #f7f8ff 0%, #f1f3ff 100%);
  color: #0f172a;
}

.admin-layout :deep(.q-page-container),
.admin-layout :deep(.q-page) {
  background: transparent !important;
}

.admin-drawer {
  background: #191a1f;
  color: #c0cae1;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 20px 0 48px rgba(8, 12, 24, 0.22);
}

.admin-drawer :deep(.q-drawer__content),
:deep(.admin-drawer-content) {
  background: #191a1f !important;
  color: #c0cae1;
}

.drawer-shell {
  min-height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #191a1f;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 112px;
  padding: 0 30px;
  background: #191a1f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #5965ff, #3944b8);
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-title {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 700;
}

.brand-subtitle {
  color: #7080a7;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  margin-top: 2px;
}

.sidebar-nav {
  display: grid;
  gap: 2px;
  padding: 18px 0 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 52px;
  padding: 0 24px 0 30px;
  border-radius: 0;
  color: #a2afc8;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-link:hover {
  background: rgba(92, 104, 255, 0.08);
  color: #f8fbff;
}

.sidebar-link.is-active {
  background: linear-gradient(90deg, rgba(44, 52, 102, 0.95), rgba(31, 38, 78, 0.92));
  color: #eef2ff;
  box-shadow: inset 5px 0 0 #6372ff;
}

.drawer-footer {
  margin: auto 30px 0;
  padding: 18px 0 26px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 8px;
}

.footer-link {
  border: none;
  background: transparent;
  color: #aeb8d0;
  min-height: 44px;
  padding: 0 0 0 2px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
}

.footer-link:disabled {
  opacity: 0.65;
  cursor: wait;
}

.admin-header {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.toolbar-shell {
  min-height: 82px;
  padding: 0 26px 0 32px;
  display: grid;
  grid-template-columns: minmax(260px, 420px) 1fr auto;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-toggle {
  color: #475569;
}

.search-shell {
  height: 60px;
  flex: 1 1 auto;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dbe3f1;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.search-icon {
  color: #94a3b8;
  font-size: 1.2rem;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  color: #475569;
  font-size: 1.1rem;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.top-link {
  color: #64748b;
  text-decoration: none;
  font-size: 1.05rem;
  padding: 6px 2px 11px;
  border-bottom: 3px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.top-link.is-active,
.top-link:hover {
  color: #2336d7;
  border-color: #2336d7;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
}

.header-icon {
  width: 42px;
  height: 42px;
  border: none;
  background: transparent;
  color: #64748b;
  position: relative;
  cursor: pointer;
}

.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
}

.admin-profile {
  padding-left: 18px;
  margin-left: 2px;
  border-left: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-copy {
  text-align: right;
}

.profile-name {
  font-weight: 700;
  color: #0f172a;
}

.profile-role {
  color: #7c8aa5;
  font-size: 0.9rem;
}

.profile-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #111827, #334155);
  color: #ffffff;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .toolbar-shell {
    grid-template-columns: minmax(220px, 1fr) auto;
  }

  .header-center {
    display: none;
  }
}

@media (max-width: 767px) {
  .toolbar-shell {
    min-height: auto;
    padding: 14px 16px;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header-right {
    justify-content: space-between;
  }

  .search-shell {
    height: 54px;
  }

  .admin-profile {
    padding-left: 0;
    margin-left: 0;
    border-left: none;
  }

  .profile-copy {
    text-align: left;
  }
}
</style>

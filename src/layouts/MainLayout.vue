<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-header elevated class="site-header">
      <q-toolbar class="header-toolbar">
        <router-link :to="logoDestination" class="brand">
          <div class="brand-mark">VP</div>
          <div class="brand-text">
            <div class="brand-name">VaultPay</div>
            <div class="brand-tag">Digital wallet platform</div>
          </div>
        </router-link>

        <div class="header-links gt-sm" v-if="!isAuthenticated">
          <a class="header-link" href="#features">Features</a>
          <a class="header-link" href="#steps">Get started</a>
          <a class="header-link" href="#testimonials">Reviews</a>
          <a class="header-link" href="#faq">FAQ</a>
        </div>

        <div class="header-actions gt-sm">
          <template v-if="isAuthenticated">
            <div class="user-info q-mr-md">
              <div class="text-subtitle2">{{ user?.name }}</div>
              <div class="text-caption text-white wallet-address">
                {{ walletAddress }}
              </div>
            </div>
            <q-btn flat label="Logout" @click="logout" />
          </template>
          <template v-else>
            <q-btn flat label="Log in" to="login" class="q-mr-sm" />
            <q-btn unelevated label="Get started" color="primary" to="register" />
          </template>
        </div>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="lt-md"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      @mouseleave="closeLeftDrawer"
    >
      <q-list>
        <q-item-label header class="text-weight-bold">VaultPay</q-item-label>

        <template v-if="isAuthenticated">
          <q-item-label header class="text-caption">{{ user?.name }}</q-item-label>

          <q-item clickable to="dashboard" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable to="send" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>
            <q-item-section>Send Money</q-item-section>
          </q-item>

          <q-item clickable to="receive" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="call_received" />
            </q-item-section>
            <q-item-section>Receive Money</q-item-section>
          </q-item>

          <q-item clickable to="transaction-history" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Transaction History</q-item-section>
          </q-item>

          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>Help & Support</q-item-section>
          </q-item>

          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item clickable to="/" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>

          <q-item clickable :to="{ path: '/', hash: '#features' }" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="stars" />
            </q-item-section>
            <q-item-section>Features</q-item-section>
          </q-item>

          <q-item clickable :to="{ path: '/', hash: '#steps' }" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="rocket_launch" />
            </q-item-section>
            <q-item-section>Get started</q-item-section>
          </q-item>

          <q-item clickable :to="{ path: '/', hash: '#testimonials' }" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="reviews" />
            </q-item-section>
            <q-item-section>Reviews</q-item-section>
          </q-item>

          <q-item clickable :to="{ path: '/', hash: '#faq' }" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>FAQ</q-item-section>
          </q-item>

          <q-item clickable to="login" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Login</q-item-section>
          </q-item>

          <q-item clickable to="register" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="app_registration" />
            </q-item-section>
            <q-item-section>Register</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useAuthStore } from "src/stores/auth";
import { storeToRefs } from 'pinia'
const authStore = useAuthStore();
const { proxy } = getCurrentInstance();

const { user, isAuthenticated } = storeToRefs(authStore);
const walletAddress = computed(() => authStore.getWalletAddress);
const logoDestination = computed(() => {
  return isAuthenticated.value ? { path: 'dashboard' } : { path: '/' };
});

const leftDrawerOpen = ref(false);

onMounted(() => {
  if (proxy.$q && proxy.$q.screen.gt.sm) {
    leftDrawerOpen.value = false;
  }
});

const logout = async () => {
  const result = await authStore.logout();
  if (!result?.success) {
    const message = authStore.message || 'Logout failed. Please try again.'
    console.error('Logout action failed:', { result, message })
    if (proxy?.$q?.notify) {
      proxy.$q.notify({
        type: 'negative',
        message,
      })
    }
  }
};

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function closeLeftDrawer() {
  leftDrawerOpen.value = false;
}
</script>

<style scoped>
.main-layout {
  background-color: #1a1a1a;
  min-height: 100vh;
}

.site-header {
  background: rgba(5, 16, 32, 0.95);
  backdrop-filter: blur(12px);
}

.header-toolbar {
  min-height: 68px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #ffffff;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2dd4bf, #38bdf8);
  color: #051020;
  display: grid;
  place-items: center;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-text {
  display: grid;
  gap: 2px;
}

.brand-name {
  font-weight: 700;
  font-size: 1rem;
}

.brand-tag {
  font-size: 0.72rem;
  color: #9fb3d1;
}

.header-links {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: 10px;
}

.header-link {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.header-link:hover {
  color: #ffffff;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  text-align: right;
  color: white;
}

.wallet-address {
  font-family: monospace;
  letter-spacing: 0.5px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 700px) {
  .brand-tag {
    display: none;
  }
}
</style>

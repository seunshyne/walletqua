<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-header v-if="!isDashboardRoute" elevated class="site-header">
      <q-toolbar class="header-toolbar">
        <router-link :to="logoDestination" class="brand">
          <div class="brand-mark">P</div>
          <div class="brand-text">
            <div class="brand-name">PrimeWallet</div>
            <div class="brand-tag">Digital wallet platform</div>
          </div>
        </router-link>

        <div class="header-links" v-if="!isAuthenticated">
          <a class="header-link" href="#features">Features</a>
          <a class="header-link" href="#steps">Get started</a>
          <a class="header-link" href="#testimonials">Reviews</a>
          <a class="header-link" href="#faq">FAQ</a>
        </div>

        <div class="header-actions">
          <template v-if="isAuthenticated">
            <div class="user-info q-mr-md">
              <div class="text-subtitle2">{{ user?.name }}</div>
              <div class="text-caption text-white wallet-address">
                {{ walletAddress }}
              </div>
            </div>
            <q-btn
              v-if="isHomeRoute"
              flat
              label="Dashboard"
              to="dashboard"
              class="q-mr-sm"
            />
            <q-btn flat label="Logout" @click="logout" />
          </template>
          <template v-else>
            <q-btn flat label="Log in" to="login" class="q-mr-sm" />
            <q-btn unelevated label="Get started" color="primary" to="register" />
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { storeToRefs } from 'pinia'

const authStore = useAuthStore();
const route = useRoute();
const { proxy } = getCurrentInstance();

const { user, isAuthenticated } = storeToRefs(authStore);
const walletAddress = computed(() => authStore.getWalletAddress);
const logoDestination = computed(() => {
  return isAuthenticated.value ? { path: 'dashboard' } : { path: '/' };
});
const isDashboardRoute = computed(() => {
  const hiddenHeaderRoutes = ['/dashboard', '/send', '/transaction-history'];
  return hiddenHeaderRoutes.some((path) => route.path.startsWith(path));
});
const isHomeRoute = computed(() => route.path === '/');

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

@media (max-width: 1024px) {
  .header-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }

  .brand {
    flex: 1 1 220px;
  }

  .header-links {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .header-toolbar {
    padding: 0 14px;
  }

  .brand-text {
    max-width: 160px;
  }

  .brand-name {
    font-size: 0.95rem;
  }

  .brand-tag {
    display: none;
  }

  .header-links {
    flex: 1 1 100%;
    margin-left: 0;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>

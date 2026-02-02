<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" class="nav-link">
            <template v-if="$q.screen.gt.sm">Prime Wallet</template>
            <template v-else>
              <img src="/images/logo.jpg" alt="Logo" style="height:32px; vertical-align:middle; border-radius:50%; object-fit:cover;" />
            </template>
          </router-link>
        </q-toolbar-title>
        
         <!-- LOGGED IN -->
        <template v-if="isAuthenticated">
          <div class="user-info q-mr-md">
            <div class="text-subtitle2">{{ user?.name }}</div>
            <div class="text-caption text-grey wallet-address">
              📍 {{ walletAddress }}
            </div>
          </div>

          <q-btn flat label="Logout" @click="logout" />
        </template>

         <!-- NOT LOGGED IN -->
        <template v-else>
          <q-btn flat label="Login" to="login" class="q-mr-sm" />
          <q-btn flat label="Register" to="register" />
        </template>

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <!-- Logo/Title -->
        <q-item-label header class="text-weight-bold">Prime Wallet</q-item-label>

        <!-- Authenticated User Menu -->
        <template v-if="isAuthenticated">
          <!-- User Profile Section -->
          <q-item-label header class="text-caption">{{ user?.name }}</q-item-label>

          <!-- Dashboard -->
          <q-item clickable to="dashboard" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <!-- Send Money -->
          <q-item clickable to="send" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>
            <q-item-section>Send Money</q-item-section>
          </q-item>

          <!-- Receive Money -->
          <q-item clickable to="receive" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="call_received" />
            </q-item-section>
            <q-item-section>Receive Money</q-item-section>
          </q-item>

          <!-- Transaction History -->
          <q-item clickable to="transaction-history" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>Transaction History</q-item-section>
          </q-item>

          <!-- Settings -->
          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>

          <!-- Divider -->
          <q-separator class="q-my-md" />

          <!-- Help & Support -->
          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>Help & Support</q-item-section>
          </q-item>

          <!-- About -->
          <q-item clickable active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>
        </template>

        <!-- Guest User Menu -->
        <template v-else>
          <!-- Home -->
          <q-item clickable to="/" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>

          <!-- Login -->
          <q-item clickable to="login" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>Login</q-item-section>
          </q-item>

          <!-- Register -->
          <q-item clickable to="register" active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="app_registration" />
            </q-item-section>
            <q-item-section>Register</q-item-section>
          </q-item>

          <!-- Divider -->
          <q-separator class="q-my-md" />

          <!-- About -->
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
import { ref, watch, computed, onMounted, getCurrentInstance } from "vue";
import { useAuthStore } from "src/stores/auth";
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router' 

const router = useRouter();
const authStore = useAuthStore();
const { proxy } = getCurrentInstance();

const { user, isAuthenticated } = storeToRefs(authStore);
const walletAddress = computed(() => authStore.getWalletAddress);

const leftDrawerOpen = ref(false);

onMounted(() => {
  // Ensure drawer is closed on desktop at mount
  if (proxy.$q && proxy.$q.screen.gt.sm) {
    leftDrawerOpen.value = false;
  }
});

watch(isAuthenticated, (Val) => {
  if (Val) {
    router.replace({ name: 'dashboard' });
  }
}, { immediate: true });

const logout = async () => {
  await authStore.logout();
  await router.push({ path: '/' });
};

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
.main-layout {
  background-image: url('/images/wallet-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-color: #1a1a1a;
  min-height: 100vh;
}

.main-layout::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/images/wallet-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  z-index: -1;
  pointer-events: none;
}

.nav-link {
  color: rgba(252, 249, 249, 0.986);
  transition: color 0.2s ease, opacity 0.2s ease;
  text-decoration: none;
}

.nav-link:hover,
.nav-link:focus {
  color :  #4fc3f7;
}
.nav-link:active {
  opacity: 0.6;
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
</style>

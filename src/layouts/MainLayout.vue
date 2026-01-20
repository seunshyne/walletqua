<template>
  <q-layout view="lHh Lpr lFf">
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

        <q-toolbar-title> <router-link to="/" class="nav-link">Prime Wallet</router-link> </q-toolbar-title>
        
         <!-- LOGGED IN -->
        <template v-if="isAuthenticated">
          <div class="q-mr-md">
            Welcome <strong>{{ user?.name }}</strong>
          </div>

          <q-btn flat label="Logout" @click="logout" />
        </template>

         <!-- NOT LOGGED IN -->
        <template v-else>
          <q-btn flat label="Login" to="login" class="q-mr-sm" />
          <q-btn flat label="Register" to="register" />
        </template>

       

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useAuthStore } from "src/stores/auth";
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router' 

const router = useRouter();
const authStore = useAuthStore();

const { user, isAuthenticated } = storeToRefs(authStore);

watch(isAuthenticated, (Val) => {
  if (Val) {
    router.replace({ name: 'dashboard' });
  }
}, { immediate: true });

const logout = async () => {
  await authStore.logout();
  await router.push({ path: '/' });
};

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
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
</style>

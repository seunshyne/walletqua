import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Global Navigation Guard
  Router.beforeEach(async (to, from, next) => {
    try {
      const authStore = useAuthStore();
      if (!authStore) {
        next();
        return;
      }

      const hasToken = !!localStorage.getItem("token");

      // If no token, clear user state
      if (!hasToken && authStore.user) {
        authStore.user = null;
        authStore.wallet = null;
      }

      // Only fetch user if we don't have one yet
      if (hasToken && !authStore.user) {
        try {
          await authStore.getUser();
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem('token');
          authStore.user = null;
          authStore.wallet = null;
        }
      }

      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ path: '/' });
      }

      if (to.meta.guestOnly && authStore.isAuthenticated) {
        return next({ name: 'dashboard' });
      }

      next();
    } catch (error) {
      console.error('Route guard error:', error);
      next();
    }
  });
  return Router
})

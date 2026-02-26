import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'


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
      if (!authStore.user) {
         try {
          await authStore.getUser()
        } catch (error) {
          // 401 = not logged in, that's fine
        }
      }

      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ path: '/' })
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

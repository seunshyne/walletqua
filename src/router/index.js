import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global Navigation Guard
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Only check session once per app load
    if (!authStore.sessionChecked) {
      await authStore.getUser()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next({ path: '/login' })
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return next({ name: 'dashboard' })
    }

    next()
  })

  return Router
})
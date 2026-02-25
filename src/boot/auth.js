import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'
import apiClient from 'src/api/client'

export default boot(async ({ router }) => {
  const authStore = useAuthStore()

  apiClient.setUnauthorizedHandler(() => {
    authStore.resetAuthState()
    authStore.hasSessionCheckCompleted = true

    const currentRouteName = router.currentRoute.value.name
    const guestPages = new Set(['login', 'register', 'verify-email', 'home'])
    if (!guestPages.has(currentRouteName)) {
      router.replace({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }
  })

  await authStore.restoreSession()
})

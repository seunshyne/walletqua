import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(async () => {
  const authStore = useAuthStore()

   // Handle session expiry from anywhere in the app
  window.addEventListener('auth:unauthorized', () => {
    authStore.user = null
    authStore.wallet = null
    router.replace({ path: '/' })
  })

  // Try to restore session on app load
  try {
    await authStore.getUser()
  } catch (error) {
    // 401 is expected when not logged in - not an error
    authStore.user = null
    authStore.wallet = null
  }
})

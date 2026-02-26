import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(async () => {
  const authStore = useAuthStore()

  // If a valid session cookie exists, this will succeed
  // If not (logged out / expired), it will silently fail with 401
  try {
    await authStore.getUser()
  } catch (error) {
    // 401 is expected when not logged in - not an error
    authStore.user = null
    authStore.wallet = null
  }
})

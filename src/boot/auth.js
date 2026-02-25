import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(async () => {
  const authStore = useAuthStore()

  const token = localStorage.getItem('token')
  
  if (token) {
    try {
      await authStore.getUser()
    } catch (error) {
      console.error('Failed to load user on boot:', error)
      localStorage.removeItem('token')
      authStore.user = null
      authStore.wallet = null
    }
  }
})

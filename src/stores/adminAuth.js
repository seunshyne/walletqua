import { defineStore } from 'pinia'
import adminAuthService from 'src/services/adminAuthService'

export const useAdminAuthStore = defineStore('adminAuthStore', {
  state: () => ({
    admin: adminAuthService.getSavedAdmin(),
    token: adminAuthService.getToken(),
    errors: {},
    message: '',
    isLoading: false,
    sessionChecked: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    adminName: (state) => state.admin?.name || 'Admin User',
    adminRole: (state) => state.admin?.role || 'System Root',
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.errors = {}
      this.message = ''

      try {
        const result = await adminAuthService.login(credentials.email, credentials.password)

        if (!result.success) {
          this.errors = result.error || { general: result.message || 'Admin login failed' }
          this.message = result.message || 'Admin login failed'
          return { success: false }
        }

        this.token = result.token
        this.admin = result.admin
        this.message = result.message
        this.sessionChecked = true
        return { success: true }
      } finally {
        this.isLoading = false
      }
    },

    async restoreSession() {
      if (this.sessionChecked) return

      if (!this.token) {
        this.sessionChecked = true
        return
      }

      const result = await adminAuthService.getCurrentAdmin()

      if (result.success) {
        this.admin = result.admin
        this.token = result.token || this.token
      } else if (result.unauthenticated) {
        this.admin = null
        this.token = ''
      }

      this.sessionChecked = true
    },

    async logout() {
      await adminAuthService.logout()
      this.admin = null
      this.token = ''
      this.errors = {}
      this.message = ''
      this.sessionChecked = true
    },
  },
})

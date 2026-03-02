import { defineStore } from 'pinia'
import authService from '../services/authService'
import walletService from '../services/walletService'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null,
    wallet: null,
    sessionChecked: false,
    errors: {},
    message: '',
    isLoading: false,
  }),

  actions: {
    /**
     * Load current user profile from API.
     * Skips if already loaded or session already checked.
     */
    async getUser() {
      if (this.sessionChecked) {
        // Session checked but no wallet yet — try fetching wallet
        if (this.user && !this.wallet?.id) {
          await this.fetchWallet()
        }
        return
      }

      try {
        const result = await authService.getCurrentUser()
        if (result.success) {
          this.user = result.user
          await this.fetchWallet()
        } else {
          this.user = null
        }
      } catch (err) {
        console.error('Failed to get user:', err)
        this.user = null
      } finally {
        this.sessionChecked = true
      }
    },

    /**
     * Authenticate user — login or register
     */
    async authenticate(apiRoute, formData) {
      this.errors = {}
      this.message = ''

      try {
        if (apiRoute === 'login') {
          const result = await authService.login(formData.email, formData.password)

          if (result.success) {
            // Verify that Laravel actually established the session cookie.
            const sessionResult = await authService.getCurrentUser()
            if (!sessionResult.success) {
              this.user = null
              this.wallet = null
              this.sessionChecked = true
              this.errors = {
                general:
                  'Login response received, but session cookie was not established. Check Sanctum/CORS/session config.',
              }
              return { success: false, status: 'session_not_established' }
            }

            this.user = sessionResult.user
            this.wallet = result.wallet || null
            this.sessionChecked = true
            this.message = result.message
            await this.fetchWallet()
            window.location.href = '/dashboard'
            return { success: true, type: 'login' }
          }

          // Unverified email
          if (result.status === 403) {
            this.message = result.message
            window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`
            return { success: false, status: 'unverified' }
          }

          this.errors = result.error
          this.message = result.message
          return { success: false }
        }

        if (apiRoute === 'register') {
          const result = await authService.register(
            formData.name,
            formData.email,
            formData.password,
            formData.password_confirmation
          )

          if (result.success) {
            this.message = result.message
            this.sessionChecked = true
            window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}`
            return { success: true, type: 'register' }
          }

          this.errors = result.error
          this.message = result.message
          return { success: false }
        }
      } catch (err) {
        console.error('Authentication error:', err)
        this.errors = { general: 'Connection failed. Please try again.' }
        return { success: false }
      }
    },

    /**
     * Resend verification email
     */
    async resendVerification(email) {
      if (!email) throw new Error('Email is required to resend verification')
      const result = await authService.resendVerificationEmail(email)
      if (!result.success) {
        throw new Error(result.message || result.error)
      }
      return result.message
    },

    /**
     * Logout current user and reset all auth state
     */
    async logout() {
      await authService.logout() // always succeeds — see authService
      this.user = null
      this.wallet = null
      this.sessionChecked = false // reset so getUser() works after re-login
      this.errors = {}
      this.message = ''
      window.location.href = '/login'
    },

    /**
     * Fetch user wallet. Debounced via isLoading flag.
     */
    async fetchWallet() {
      if (this.isLoading) return this.wallet
      this.isLoading = true

      try {
        const result = await walletService.getWallets()

        if (result.success) {
          let walletData = Array.isArray(result.wallets)
            ? result.wallets[0]
            : result.wallets

          // Unwrap nested { wallet: {...} } structure if present
          if (walletData?.wallet && !walletData?.id) {
            walletData = walletData.wallet
          }

          if (walletData) {
            this.wallet = walletData
          }
        }

        return this.wallet
      } catch (err) {
        console.error('Failed to fetch wallet:', err)
        return this.wallet
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update wallet balance locally without a refetch
     */
    updateWalletBalance(newBalance) {
      if (this.wallet) {
        this.wallet.balance = newBalance
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    getUserWallet: (state) => state.wallet,
    getWalletBalance: (state) => {
      const raw = state.wallet?.balance ?? 0
      const numeric = Number(String(raw).replace(/,/g, ''))
      return Number.isFinite(numeric) ? numeric : 0
    },
    getWalletAddress: (state) => state.wallet?.address ?? '',
    getWalletCurrency: (state) => state.wallet?.currency ?? 'NGN',
  },
})

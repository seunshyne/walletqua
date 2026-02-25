/**
 * Authentication Service
 * Cookie-based session auth with Laravel Sanctum
 */

import apiClient from '../api/client'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  GET_USER: '/user',
  RESEND_VERIFICATION: '/email/resend',
};

export const authService = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      await apiClient.getCsrfCookie()
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      }, { useApiPrefix: false, skipCsrf: true })

      const { user, wallet } = response.data

      return {
        success: true,
        user,
        wallet,
        message: response.data.message || 'Login successful',
      }
    } catch (error) {
      return {
        success: false,
        error: error.data?.errors || error.data?.error || { general: error.message },
        message: error.data?.message || '',
        status: error.status,
      }
    }
  },

  /**
   * Register new user
   */
  async register(name, email, password, passwordConfirmation) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      return {
        success: true,
        message: response.data.message || 'Registration successful. Please verify your email.',
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.data?.errors || error.data?.error || { general: error.message },
        message: error.data?.message || '',
      }
    }
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, null, { useApiPrefix: false })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.GET_USER)
      return {
        success: true,
        user: response.data.user || response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email })
      return {
        success: true,
        message: response.data.message || 'Verification email sent',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: error.data?.message || '',
      }
    }
  },
}

export default authService

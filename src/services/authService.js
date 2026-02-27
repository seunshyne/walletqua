/**
 * Authentication Service
 * Handles login, register, logout, and user profile operations.
 * Uses HttpOnly session cookies via Laravel Sanctum — no tokens in localStorage.
 */

import apiClient from '../api/client'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  GET_USER: '/user',
  RESEND_VERIFICATION: '/email/resend',
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password })
      return {
        success: true,
        user: response.data.user,
        wallet: response.data.wallet,
        message: response.data.message || 'Login successful',
      }
    } catch (error) {
      return {
        success: false,
        error: error.data?.errors || error.data?.error || { general: error.message },
        message: error.data?.message || error.message || 'Login failed',
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
        message: error.data?.message || error.message || 'Registration failed',
        status: error.status,
      }
    }
  },

  /**
   * Logout current user.
   * Always treated as successful on the frontend — session may already
   * be invalidated on the backend regardless of the response.
   */
  async logout() {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT)
    } catch (error) {
      // Log but don't block — still clear local state
      console.warn('Logout API call failed (session may already be expired):', error.message)
    }
    return { success: true }
  },

  /**
   * Get current authenticated user.
   * Returns success: false (not an error) when unauthenticated (401).
   * skipUnauthorizedHandler prevents the global redirect from firing
   * during the initial auth check on app load.
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.GET_USER, {
        skipUnauthorizedHandler: true,
      })
      return {
        success: true,
        user: response.data.user || response.data,
      }
    } catch (error) {
      // 401 = not logged in, anything else = real error
      if (error.status === 401) {
        return { success: false, unauthenticated: true }
      }
      return {
        success: false,
        unauthenticated: false,
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
        error: error.data?.errors || { general: error.message },
        message: error.data?.message || error.message || 'Failed to resend verification email',
      }
    }
  },
}

export default authService
/**
 * Authentication Service
 * Handles login, register, and logout operations
 */

import apiClient from '../api/client'

const AUTH_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  LOGOUT: '/api/logout',
  GET_USER: '/api/user',
  RESEND_VERIFICATION: '/api/email/resend',
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      }, { includeAuth: false })

      const { token, user, wallet } = response.data

      if (token) {
        localStorage.setItem('token', token)
      }

      return {
        success: true,
        token,
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
      }, { includeAuth: false })

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
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, null, { includeAuth: true })
      localStorage.removeItem('token')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      // Clear token anyway
      localStorage.removeItem('token')
      return { success: false, error }
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
      const response = await apiClient.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, { email }, {
        includeAuth: false,
      })
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

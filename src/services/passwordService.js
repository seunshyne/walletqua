import apiClient from 'src/api/client'

const PASSWORD_ENDPOINTS = {
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
}

const formatErrorResponse = (error, fallbackMessage) => ({
  success: false,
  status: error.status,
  message: error.data?.message || error.message || fallbackMessage,
  errors: error.data?.errors || error.data?.error || { general: error.message || fallbackMessage },
})

export const passwordService = {
  async changePassword(payload) {
    try {
      const response = await apiClient.post(PASSWORD_ENDPOINTS.CHANGE_PASSWORD, payload)

      return {
        success: true,
        message: response.data.message || 'Password changed successfully.',
      }
    } catch (error) {
      return formatErrorResponse(error, 'Unable to change password.')
    }
  },

  async forgotPassword(email) {
    try {
      const response = await apiClient.post(PASSWORD_ENDPOINTS.FORGOT_PASSWORD, { email })

      return {
        success: true,
        message: response.data.message || 'Reset link sent to your email',
      }
    } catch (error) {
      return formatErrorResponse(error, 'Unable to send reset link.')
    }
  },

  async resetPassword(payload) {
    try {
      const response = await apiClient.post(PASSWORD_ENDPOINTS.RESET_PASSWORD, payload)

      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
      }
    } catch (error) {
      return formatErrorResponse(error, 'Unable to reset password.')
    }
  },
}

export default passwordService

import adminAuthService from 'src/services/adminAuthService'
import { API_BASE_URL } from 'src/constants/api'

const ADMIN_API_BASE_URL = API_BASE_URL
const ADMIN_TRANSACTION_ENDPOINTS = {
  TRANSACTIONS: '/api/admin/transactions',
}

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

const buildAuthHeaders = () => {
  const token = adminAuthService.getToken()
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const adminTransactionService = {
  async getTransactions() {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_TRANSACTION_ENDPOINTS.TRANSACTIONS}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to load transactions')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async getTransaction(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_TRANSACTION_ENDPOINTS.TRANSACTIONS}/${id}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to load transaction details')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async flagTransaction(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_TRANSACTION_ENDPOINTS.TRANSACTIONS}/${id}/flag`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to flag transaction')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async unflagTransaction(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_TRANSACTION_ENDPOINTS.TRANSACTIONS}/${id}/unflag`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to unflag transaction')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },
}

export default adminTransactionService

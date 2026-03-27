import adminAuthService from 'src/services/adminAuthService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primewallet.duckdns.org'
const ADMIN_ANALYTICS_ENDPOINTS = {
  SUMMARY: '/api/admin/analytics/summary',
  TRANSACTIONS: '/api/admin/analytics/transactions',
  USERS: '/api/admin/analytics/users',
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

const getJson = async (endpoint, fallbackMessage) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  const data = await parseJsonSafely(response)

  if (!response.ok) {
    const error = new Error(data?.message || fallbackMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const adminAnalyticsService = {
  getSummary() {
    return getJson(ADMIN_ANALYTICS_ENDPOINTS.SUMMARY, 'Failed to load analytics summary')
  },

  getTransactionAnalytics() {
    return getJson(ADMIN_ANALYTICS_ENDPOINTS.TRANSACTIONS, 'Failed to load transaction analytics')
  },

  getUserAnalytics() {
    return getJson(ADMIN_ANALYTICS_ENDPOINTS.USERS, 'Failed to load user analytics')
  },
}

export default adminAnalyticsService

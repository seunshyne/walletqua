import adminAuthService from 'src/services/adminAuthService'
import { API_BASE_URL } from 'src/constants/api'

const ADMIN_API_BASE_URL = API_BASE_URL
const ADMIN_USER_ENDPOINTS = {
  USERS: '/api/admin/users',
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

export const adminUserService = {
  async getUsers() {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_USER_ENDPOINTS.USERS}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to load users')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async getUser(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_USER_ENDPOINTS.USERS}/${id}`, {
      method: 'GET',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to load user details')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async suspendUser(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_USER_ENDPOINTS.USERS}/${id}/suspend`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to suspend user')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },

  async unsuspendUser(id) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_USER_ENDPOINTS.USERS}/${id}/unsuspend`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
    })

    const data = await parseJsonSafely(response)

    if (!response.ok) {
      const error = new Error(data?.message || 'Failed to restore user')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  },
}

export default adminUserService

import { defineStore } from 'pinia'
import adminAnalyticsService from 'src/services/adminAnalyticsService'

const normalizeSeries = (payload, valueKey) => {
  const source = Array.isArray(payload) ? payload : []
  const maxValue = Math.max(...source.map((item) => Number(item?.[valueKey] || 0)), 1)

  return source.map((item) => {
    const value = Number(item?.[valueKey] || 0)
    return {
      label: item?.date || 'Unknown',
      value,
      normalizedValue: Math.max(6, Math.round((value / maxValue) * 100)),
    }
  })
}

export const useAdminAnalyticsStore = defineStore('adminAnalyticsStore', {
  state: () => ({
    summary: null,
    userSeries: [],
    transactionSeries: [],
    isLoading: false,
    error: '',
  }),

  actions: {
    async fetchAnalytics(force = false) {
      if (this.isLoading) return
      if (this.summary && this.userSeries.length && this.transactionSeries.length && !force) return

      this.isLoading = true
      this.error = ''

      try {
        const [summary, transactionAnalytics, userAnalytics] = await Promise.all([
          adminAnalyticsService.getSummary(),
          adminAnalyticsService.getTransactionAnalytics(),
          adminAnalyticsService.getUserAnalytics(),
        ])

        this.summary = summary
        this.transactionSeries = normalizeSeries(transactionAnalytics, 'volume')
        this.userSeries = normalizeSeries(userAnalytics, 'count')
      } catch (error) {
        this.error = error.message || 'Failed to load admin analytics.'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})

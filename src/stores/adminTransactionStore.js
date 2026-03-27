import { defineStore } from 'pinia'
import adminTransactionService from 'src/services/adminTransactionService'

const toTitleCase = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatDateTime = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const normalizeTransaction = (transaction = {}, existingTransaction = {}) => ({
  ...existingTransaction,
  ...transaction,
  id: String(transaction?.id || existingTransaction.id || ''),
  reference: transaction?.reference || existingTransaction.reference || 'N/A',
  type: toTitleCase(transaction?.type || existingTransaction.type || 'Transaction'),
  status: toTitleCase(transaction?.status || existingTransaction.status || 'Pending'),
  baseStatus: toTitleCase(
    transaction?.status ||
    existingTransaction.baseStatus ||
    existingTransaction.status ||
    'Pending'
  ),
  amount: Number(transaction?.amount || existingTransaction.amount || 0),
  currency: transaction?.currency || existingTransaction.currency || 'USD',
  flagged: Boolean(transaction?.flagged ?? existingTransaction.flagged ?? false),
  channel: existingTransaction.channel || 'Wallet',
  userName: transaction?.user?.name || existingTransaction.userName || 'Unknown User',
  userEmail: transaction?.user?.email || existingTransaction.userEmail || 'Unknown Email',
  userId: transaction?.user?.id || existingTransaction.userId || '',
  createdAt: transaction?.created_at || existingTransaction.createdAt || 'Unknown',
  formattedDate: formatDateTime(transaction?.created_at || existingTransaction.createdAt),
  note: transaction?.description || existingTransaction.note || 'No note provided.',
})

const unwrapTransactionsPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.transactions)) return payload.transactions
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.transactions)) return payload.data.transactions
  return []
}

const unwrapTransactionPayload = (payload) =>
  payload?.transaction || payload?.data?.transaction || payload?.data || payload

const looksLikeTransactionPayload = (payload) =>
  Boolean(
    payload &&
    typeof payload === 'object' &&
    (
      Object.prototype.hasOwnProperty.call(payload, 'id') ||
      Object.prototype.hasOwnProperty.call(payload, 'reference') ||
      Object.prototype.hasOwnProperty.call(payload, 'flagged') ||
      Object.prototype.hasOwnProperty.call(payload, 'status')
    )
  )

export const useAdminTransactionStore = defineStore('adminTransactionStore', {
  state: () => ({
    transactions: [],
    selectedTransaction: null,
    isLoading: false,
    isDetailLoading: false,
    actionTransactionId: null,
    error: '',
    actionMessage: '',
  }),

  getters: {
    getTransactionById: (state) => (id) =>
      state.selectedTransaction?.id === String(id)
        ? state.selectedTransaction
        : state.transactions.find((transaction) => String(transaction.id) === String(id)),
  },

  actions: {
    async fetchTransactions(force = false) {
      if (this.isLoading) return this.transactions
      if (this.transactions.length && !force) return this.transactions

      this.isLoading = true
      this.error = ''

      try {
        const payload = await adminTransactionService.getTransactions()
        const rawTransactions = unwrapTransactionsPayload(payload)
        this.transactions = rawTransactions.map((transaction) => normalizeTransaction(transaction))
        return this.transactions
      } catch (error) {
        this.error = error.message || 'Failed to load admin transactions.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchTransaction(id) {
      this.isDetailLoading = true
      this.error = ''

      try {
        const payload = await adminTransactionService.getTransaction(id)
        const rawTransaction = unwrapTransactionPayload(payload)
        const existingTransaction = this.transactions.find((transaction) => String(transaction.id) === String(id))
        const normalized = normalizeTransaction(rawTransaction, existingTransaction)

        this.selectedTransaction = normalized

        if (existingTransaction) {
          this.transactions = this.transactions.map((transaction) =>
            String(transaction.id) === String(id) ? normalized : transaction
          )
        } else {
          this.transactions = [...this.transactions, normalized]
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Failed to load transaction details.'
        throw error
      } finally {
        this.isDetailLoading = false
      }
    },

    async flagTransaction(id) {
      const transactionId = String(id)
      const existingTransaction = this.transactions.find((transaction) => String(transaction.id) === transactionId)

      this.actionTransactionId = transactionId
      this.error = ''
      this.actionMessage = ''

      try {
        const payload = await adminTransactionService.flagTransaction(transactionId)
        const rawTransaction = unwrapTransactionPayload(payload)
        const normalized =
          looksLikeTransactionPayload(rawTransaction)
            ? normalizeTransaction(rawTransaction, existingTransaction)
            : {
                ...(existingTransaction || {}),
                baseStatus: existingTransaction?.baseStatus || existingTransaction?.status || 'Pending',
                status: existingTransaction?.status || 'Pending',
                flagged: true,
              }

        this.transactions = this.transactions.map((transaction) =>
          String(transaction.id) === transactionId ? { ...transaction, ...normalized } : transaction
        )

        if (this.selectedTransaction && String(this.selectedTransaction.id) === transactionId) {
          this.selectedTransaction = { ...this.selectedTransaction, ...normalized }
        }

        this.actionMessage = payload?.message || 'Transaction flagged successfully.'
        return normalized
      } catch (error) {
        this.error = error.message || 'Failed to flag transaction.'
        throw error
      } finally {
        this.actionTransactionId = null
      }
    },

    async unflagTransaction(id) {
      const transactionId = String(id)
      const existingTransaction = this.transactions.find((transaction) => String(transaction.id) === transactionId)

      this.actionTransactionId = transactionId
      this.error = ''
      this.actionMessage = ''

      try {
        const payload = await adminTransactionService.unflagTransaction(transactionId)
        const rawTransaction = unwrapTransactionPayload(payload)
        const normalized =
          looksLikeTransactionPayload(rawTransaction)
            ? normalizeTransaction(rawTransaction, existingTransaction)
            : {
                ...(existingTransaction || {}),
                flagged: false,
                status: existingTransaction?.baseStatus || existingTransaction?.status || 'Pending',
                baseStatus: existingTransaction?.baseStatus || existingTransaction?.status || 'Pending',
              }

        this.transactions = this.transactions.map((transaction) =>
          String(transaction.id) === transactionId ? { ...transaction, ...normalized } : transaction
        )

        if (this.selectedTransaction && String(this.selectedTransaction.id) === transactionId) {
          this.selectedTransaction = { ...this.selectedTransaction, ...normalized }
        }

        this.actionMessage = payload?.message || 'Transaction unflagged successfully.'
        return normalized
      } catch (error) {
        this.error = error.message || 'Failed to unflag transaction.'
        throw error
      } finally {
        this.actionTransactionId = null
      }
    },

    async toggleTransactionFlag(id) {
      const transaction = this.transactions.find((entry) => String(entry.id) === String(id))

      if (transaction?.flagged) {
        return this.unflagTransaction(id)
      }

      return this.flagTransaction(id)
    },
  },
})

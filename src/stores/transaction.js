import { defineStore, acceptHMRUpdate } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { walletService } from 'src/services/walletService'


export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        transactions: [],
        loading: false,
        error: "",
        resolving: false,
        recipientPreview: null,
        recipientError: null,
        controller: null,
    }),

    getters: {
        receivedTransactions: (state) =>
            state.transactions
                .filter((t) => t.type === "credit")
                .map((t) => ({
                    ...t,
                    counterparty_name: t.sender?.name ?? 'Unknown',
                    counterparty_address: t.sender?.address ?? 'Unknown',
                })),

        sentTransactions: (state) =>
            state.transactions
                .filter((t) => t.type === "debit")
                .map((t) => ({
                    ...t,
                    counterparty_name: t.recipient?.name ?? 'Unknown',
                    counterparty_address: t.recipient?.address ?? 'Unknown',
                })),
    },

    actions: {
        async fetchTransactions() {
            this.loading = true;
            this.error = "";

            try {
                const result = await walletService.getTransactions();

                if (result.success) {
                    // Map the transactions to ensure they have the correct structure
                    this.transactions = Array.isArray(result.transactions)
                        ? result.transactions.map(transaction => {
                            const txType = transaction.type || (transaction.transaction_type === 'credit' ? 'credit' : 'debit');
                            return {
                                ...transaction,
                                type: txType,
                                status: transaction.status || 'completed',
                                date: transaction.created_at || transaction.date,
                                description: transaction.description || transaction.note || transaction.memo || transaction.reference || 'No description',
                                amount: parseFloat(transaction.amount),
                                counterparty_name: txType === 'debit'
                                    ? (transaction.recipient?.name || transaction.recipient_name || 'Unknown')
                                    : (transaction.sender?.name || transaction.sender_name || 'Unknown'),
                                counterparty_address: txType === 'debit'
                                    ? (transaction.recipient?.address || transaction.recipient_address || '')
                                    : (transaction.sender?.address || transaction.sender_address || ''),
                            }
                        })
                        : [];
                } else {
                    this.error = result.error || "Failed to load transactions";
                }

            } catch (err) {
                this.error = "Failed to load transactions";
            } finally {
                this.loading = false;
            }
        },

        generateIdempotencyKey() {
            return crypto.randomUUID();
        },

        async sendMoney(payload) {
            this.loading = true;
            this.error = "";

            // FIXED — correct key name
            if (!payload.client_idempotency_key) {
                payload.client_idempotency_key = this.generateIdempotencyKey();
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || process.env.VUE_APP_API_URL

                const res = await fetch(`${API_URL}/api/transactions/transfer`, {
                    method: "POST",
                    credentials: 'include',

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();

                if (res.ok && data.status === "success") {
                    if (data.sender_transaction) {
                        this.transactions.unshift(data.sender_transaction);
                    }

                    return {
                        ...data,
                        sender_balance: data.wallet_balance ?? null,
                    };
                } else {
                    // Handle specific error cases
                    const errorMessage = this.parseErrorMessage(data, res.status)
                    this.error = errorMessage
                    return {
                        status: 'error',
                        message: errorMessage,
                        data: data
                    }
                }
            } catch (err) {
                console.error(err);
                const networkError = "Network error. Please check your connection and try again.";
                this.error = networkError;
                return {
                    status: 'error',
                    message: networkError
                };
            } finally {
                this.loading = false;
            }
        },

        parseErrorMessage(data, statusCode) {
            // Handle different error scenarios
            if (statusCode === 401) {
                return "Your session has expired. Please log in again.";
            }
            if (statusCode === 403) {
                return "You don't have permission to perform this action.";
            }
            if (statusCode === 400) {
                if (data.errors?.amount) {
                    return data.errors.amount;
                }
                if (data.errors?.recipient) {
                    return data.errors.recipient;
                }
            }
            if (statusCode === 422) {
                return data.message || "Invalid transaction data. Please check and try again.";
            }
            if (statusCode === 429) {
                return "Too many requests. Please wait a moment and try again.";
            }
            if (statusCode === 500) {
                return "Server error. Please try again later.";
            }

            return data.message || "Unable to send money. Please try again.";
        },

        async resolveRecipient(input) {
            //abort previous request
            if (this.controller) {
                this.controller.abort();
            }

            this.controller = new AbortController();
            this.resolving = true;
            this.recipientError = null;
            this.recipientPreview = null;

            try {
                const API_URL = import.meta.env.VITE_API_URL || process.env.VUE_APP_API_URL

                const res = await fetch(`${API_URL}/api/resolve-recipient`, {
                    method: 'POST',
                    credentials: 'include', //cookie-based auth
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ recipient: input }),
                    signal: this.controller.signal,
                })
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Recipient not found')
                }
                // Map backend response to frontend expected format
                this.recipientPreview = {
                    name: data.name,
                    address: data.wallet_address, // Backend sends wallet_address
                    type: data.type,
                    verified: data.verified
                };

                return this.recipientPreview;

            } catch (err) {
                // Ignore aborted requests
                if (err.name !== 'AbortError') {
                    this.recipientError = err.message || 'Failed to resolve recipient';
                }
                return null
            } finally {
                this.resolving = false
                this.controller = null

            }
        },
    }
})

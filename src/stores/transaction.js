import { defineStore, acceptHMRUpdate } from 'pinia'
import { useAuthStore } from 'src/stores/auth'


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
            const authStore = useAuthStore();
            this.loading = true;
            this.error = "";

            try {
                const res = await fetch("/api/transactions", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();

                this.transactions = Array.isArray(data.data) ? data.data : [];
                // FIXED FETCH

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
                const res = await fetch("/api/transactions/transfer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
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
                    this.error = data.message || "Unable to send money";
                    return null;
                }
            } catch (err) {
                console.error(err);
                this.error = "Network error. Try again.";
                return null;
            } finally {
                this.loading = false;
            }
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
                //const authStore = useAuthStore();
                const res = await fetch('/api/resolve-recipient', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ recipient: input }),
                    signal: this.controller.signal,
                })
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Recipient not found')
                }
                this.recipientPreview = data;
                return data;
            } catch (err) {
                // Ignore aborted requests
                if (err.name !== 'AbortError') {
                    this.recipientError = err.message || 'Failed to resolve recipient';
                }
                return null
            } finally {
                this.resolving = false
            }
        },
  }
})

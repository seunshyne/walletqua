import { defineStore } from "pinia";
import authService from "../services/authService";
import walletService from "../services/walletService";

export const useAuthStore = defineStore("authStore", {
    state: () => ({
        user: null,
        wallet: null,
        sessionChecked: false,
        errors: {},
        message: "",
        isLoading: false,
    }),
    actions: {
        /**
         * Load current user profile from API (only if user is null)
         */
        async getUser() {
            // No token check needed - if session cookie exists, the request will succeed
            if (this.user) {
                if (this.wallet?.balance !== undefined && this.wallet.balance !== null) return
                await this.fetchWallet()
                return
            }
            if (this.sessionChecked) return

            try {
                const result = await authService.getCurrentUser();
                if (result.success) {
                    this.user = result.user;
                    // Fetch wallet after loading user
                    await this.fetchWallet();
                } else {
                    this.user = null
                }
            } catch (err) {
                console.error("Failed to get user:", err);
                this.user = null
            } finally {
                this.sessionChecked = true
            }
        },

        /**
         * Authenticate user (login/register)
         */
        async authenticate(apiRoute, formData, router) {
            this.errors = {};
            this.message = "";

            try {
                if (apiRoute === "login") {
                    const result = await authService.login(
                        formData.email,
                        formData.password
                    );

                    if (result.success) {
                        this.user = result.user;
                        this.wallet = result.wallet || null;
                        this.sessionChecked = true;
                        this.message = result.message;
                        // Fetch fresh wallet data after login
                        await this.fetchWallet();
                        router.push({ path: "/dashboard" });
                        return { success: true, type: "login" };
                    }

                    // Check for unverified email
                    if (result.status === 403) {
                        this.message = result.message;
                        router.push({
                            path: "/verify-email",
                            query: { email: formData.email }
                        });
                        return { success: false, status: "unverified" };
                    }

                    // Handle errors
                    this.errors = result.error;
                    this.message = result.message;
                    return { success: false };
                }

                if (apiRoute === "register") {
                    const result = await authService.register(
                        formData.name,
                        formData.email,
                        formData.password,
                        formData.password_confirmation
                    );

                    if (result.success) {
                        this.message = result.message;
                        this.sessionChecked = true;
                        router.push({
                            path: "/verify-email",
                            query: { email: formData.email }
                        });
                        return { success: true, type: "register" };
                    }

                    this.errors = result.error;
                    this.message = result.message;
                    return { success: false };
                }

            } catch (err) {
                console.error("Authentication error:", err);
                this.errors = { network: "Connection failed. Please try again." };
                return { success: false };
            }
        },

        /**
         * Resend verification email
         */
        async resendVerification(email) {
            if (!email) throw new Error("Email is required to resend verification");

            const result = await authService.resendVerificationEmail(email);

            if (!result.success) {
                throw new Error(result.message || result.error);
            }

            return result.message;
        },

        /**
         * Logout current user
         */
        async logout() {
            try {
                await authService.logout();
            } catch (err) {
                console.error("Logout error:", err);
            } finally {
                this.user = null;
                this.wallet = null;
                this.sessionChecked = true;
                this.errors = {};
                this.message = "";
            }
        },

        /**
         * Fetch user wallet (with debouncing to prevent race conditions)
         */
        async fetchWallet() {
            if (this.isLoading) {
                return this.wallet;
            }
            this.isLoading = true;

            try {
                const result = await walletService.getWallets();

                if (result.success) {
                    let walletData = Array.isArray(result.wallets)
                        ? result.wallets[0]
                        : result.wallets;

                    // Extract the wallet object if it's wrapped in a {wallet: {...}} structure
                    if (walletData?.wallet && !walletData?.id) {
                        walletData = walletData.wallet;
                    }

                    // Only update if we got valid data
                    if (walletData) {
                        this.wallet = walletData;
                    }
                    return this.wallet;
                } 
            } catch (err) {
                console.error("Failed to fetch wallet:", err);
                return this.wallet;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Update wallet balance locally
         */
        updateWalletBalance(newBalance) {
            if (this.wallet) {
                this.wallet.balance = newBalance;
            }
        },
    },

    getters: {
        isAuthenticated: (state) => !!state.user,
        getUserWallet: (state) => state.wallet,
        getWalletBalance: (state) => {
            const rawBalance = state.wallet?.balance ?? 0;
            const numericBalance = Number(String(rawBalance).replace(/,/g, ""));
            return Number.isFinite(numericBalance) ? numericBalance : 0;
        },
        getWalletAddress: (state) => state.wallet?.address ?? "",
        getWalletCurrency: (state) => state.wallet?.currency ?? "NGN",
    },
});

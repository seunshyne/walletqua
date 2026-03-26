
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTransactionStore } from "src/stores/transaction";
import { useAuthStore } from "src/stores/auth";

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const authStore = useAuthStore();

const verifying = ref(true);
const verificationResult = ref(null);

onMounted(async () => {
  const reference = route.query.reference;

  if (!reference) {
    verificationResult.value = {
      status: "error",
      message: "No payment reference found",
    };
    verifying.value = false;
    return;
  }

  const result = await transactionStore.verifyWalletFunding(reference);
  verificationResult.value = result;

  // Refresh wallet balance after successful payment
  if (result.status === "success") {
    // Update balance locally immediately
    if (result.balance) {
      authStore.updateWalletBalance(result.balance);
    }
    // Then fetch fresh wallet data from server
    await authStore.fetchWallet();
  }

  verifying.value = false;
});

function goToDashboard() {
  router.push("/dashboard");
}

function goToFundWallet() {
  router.push("/fund-wallet");
}
</script>

<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-lg">
      <!-- Loading state -->
      <div v-if="verifying">
        <q-spinner-dots color="primary" size="60px" />
        <div class="text-h6 q-mt-md">Verifying your payment...</div>
        <div class="text-grey-6">Please wait, do not close this page</div>
      </div>

      <!-- Success state -->
      <div v-else-if="verificationResult?.status === 'success'">
        <q-icon name="check_circle" color="positive" size="80px" />
        <div class="text-h5 text-weight-bold q-mt-md">Payment Successful</div>
        <div class="text-grey-6 q-mt-sm">
          ₦{{ verificationResult.amount?.toLocaleString() }} has been added to
          your wallet
        </div>
        <q-btn
          color="primary"
          label="Go to Dashboard"
          class="q-mt-lg"
          unelevated
          @click="goToDashboard"
        />
      </div>

      <!-- Failed state -->
      <div v-else-if="verificationResult?.status === 'error'">
        <q-icon name="cancel" color="negative" size="80px" />
        <div class="text-h5 text-weight-bold q-mt-md">Payment Failed</div>
        <div class="text-grey-6 q-mt-sm">
          {{ verificationResult.message || "We could not verify your payment" }}
        </div>
        <q-btn
          color="primary"
          label="Try Again"
          class="q-mt-lg"
          unelevated
          @click="goToFundWallet"
        />
      </div>
    </div>
  </q-page>
</template>

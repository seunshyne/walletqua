<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274c5, #5a4a9f)"
  >
    <q-card square class="shadow-24 q-pa-lg" style="width: 400px">
      <q-card-section class="text-center">
        <!-- Loading State -->
        <div v-if="loading">
          <q-spinner-hourglass size="60px" color="deep-purple-6" />
          <h5 class="q-mt-md q-mb-none">Verifying your email...</h5>
          <p class="text-grey-6">Please wait a moment</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success">
          <q-icon name="check_circle" size="80px" color="positive" />
          <h5 class="q-mt-md q-mb-sm">Email Verified!</h5>
          <p class="text-grey-7">Your Prime Wallet account is now active.</p>
          <p class="text-caption text-grey-6">
            Redirecting to login in {{ countdown }}s...
          </p>
        </div>

        <!-- Error State -->
        <div v-else>
          <q-icon name="error_outline" size="80px" color="negative" />
          <h5 class="q-mt-md q-mb-sm">Verification Failed</h5>
          <p class="text-grey-7">{{ errorMessage }}</p>
        </div>
      </q-card-section>

      <q-card-actions v-if="!loading" vertical class="q-gutter-sm">
        <q-btn
          v-if="success"
          unelevated
          color="deep-purple-6"
          text-color="white"
          label="Go to Login Now"
          @click="goToLogin"
        />
        
        <template v-else>
          <q-btn
            unelevated
            color="deep-purple-6"
            text-color="white"
            label="Go to Login"
            @click="goToLogin"
          />
          <q-btn
            flat
            color="grey-7"
            label="Resend Verification Email"
            @click="goToResend"
          />
        </template>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');
const countdown = ref(5);

const goToLogin = () => {
  router.push('/login');
};

const goToResend = () => {
  router.push('/verify-email');
};

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      goToLogin();
    }
  }, 1000);
};

onMounted(async () => {
  // Get URL parameters from route
  const { id, hash } = route.params;
  const { expires, signature } = route.query;

  console.log('Verification params:', { id, hash, expires, signature });

  // Validate required parameters
  if (!id || !hash || !expires || !signature) {
    loading.value = false;
    errorMessage.value = 'Invalid verification link. Please request a new one.';
    
    Notify.create({
      type: 'negative',
      message: 'Invalid verification link',
      position: 'top'
    });
    return;
  }

  try {
    // Build backend verification URL
    const API_URL = import.meta.env.VITE_API_URL || '';
    const verificationUrl = `${API_URL}/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;
    
    console.log('Calling backend:', verificationUrl);

    // Call backend to verify email
    const response = await fetch(verificationUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      success.value = true;
      
      Notify.create({
        type: 'positive',
        message: '✓ Email verified successfully!',
        position: 'top',
        timeout: 3000
      });
      
      startCountdown();
    } else {
      // Handle different error codes
      const data = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        errorMessage.value = 'This verification link has expired or is invalid.';
      } else if (response.status === 404) {
        errorMessage.value = 'User not found. Please contact support.';
      } else {
        errorMessage.value = data.message || 'Verification failed. Please try again.';
      }
      
      Notify.create({
        type: 'negative',
        message: errorMessage.value,
        position: 'top',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    errorMessage.value = 'Unable to connect to server. Please check your connection.';
    
    Notify.create({
      type: 'negative',
      message: 'Connection error. Please try again.',
      position: 'top',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
h5 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

p {
  margin: 8px 0;
}
</style>
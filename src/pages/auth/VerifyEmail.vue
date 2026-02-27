<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = route.query.email || ''
const message = ref('')
const isError = ref(false)
const isResending = ref(false)
const cooldown = ref(0)

let timer = null

const goToLogin = () => {
  router.replace({ path: '/login' })
}

const resend = async () => {
  if (!email) {
    message.value = 'Email not found. Please go back and login again.'
    isError.value = true
    return
  }

  if (cooldown.value > 0 || isResending.value) return

  isResending.value = true
  isError.value = false
  message.value = ''

  try {
    const msg = await authStore.resendVerification(email)
    message.value = msg || 'Verification email resent successfully.'

    // Start cooldown
    cooldown.value = 60
    timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (err) {
    message.value = err.message || 'Failed to resend verification email.'
    isError.value = true
  } finally {
    isResending.value = false
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274c5, #5a4a9f)"
  >
    <q-card square class="shadow-24 q-pa-lg" style="width: 360px">
      <q-card-section class="text-center">
        <q-icon name="mark_email_read" size="56px" color="deep-purple-7" />
        <h5 class="q-mt-md q-mb-sm">Verify your email</h5>

        <p class="text-grey-7">
          We've sent a verification link to <strong>{{ email }}</strong>.
        </p>

        <p class="text-grey-6 text-caption">
          Please check your inbox and click the link to activate your account.
        </p>
      </q-card-section>

      <q-card-section v-if="message" class="text-center q-pt-none">
        <q-banner dense :class="isError ? 'bg-red-1 text-negative' : 'bg-grey-2 text-primary'">
          {{ message }}
        </q-banner>
      </q-card-section>

      <q-card-actions vertical class="q-gutter-sm">
        <q-btn
          unelevated
          color="deep-purple-6"
          text-color="white"
          :disable="cooldown > 0 || isResending"
          :loading="isResending"
          @click="resend"
          label="Resend verification email"
        />

        <q-btn
          flat
          color="grey-7"
          @click="goToLogin"
          label="Go to login"
        />
      </q-card-actions>

      <q-card-section v-if="cooldown > 0" class="text-center text-caption q-pt-none">
        You can resend in {{ cooldown }} seconds
      </q-card-section>
    </q-card>
  </q-page>
</template>

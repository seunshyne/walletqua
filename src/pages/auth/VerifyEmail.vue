<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = route.query.email || ''
const message = ref('')
const cooldown = ref(0)

let timer = null

const goToLogin = () => {
  router.replace({ path: '/login' })
}

const resend = async () => {
  if (!email) {
    message.value = 'Email not found. Please login again.'
    return
  }

  if (cooldown.value > 0) return

  try {
    message.value = ''
    const msg = await authStore.resendVerification(email)
    message.value = msg || 'Verification email resent successfully.'

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
          We’ve sent a verification link to your email address.
        </p>

        <p class="text-grey-6 text-caption">
          Please check your inbox and click the link to activate your account.
        </p>
      </q-card-section>

      <q-card-section v-if="message" class="text-center">
        <q-banner dense class="bg-grey-2 text-primary">
          {{ message }}
        </q-banner>
      </q-card-section>

      <q-card-actions vertical class="q-gutter-sm">
        <q-btn
          unelevated
          color="deep-purple-6"
          text-color="white"
          :disable="cooldown > 0"
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

      <q-card-section v-if="cooldown > 0" class="text-center text-caption">
        You can resend in {{ cooldown }} seconds
      </q-card-section>
    </q-card>
  </q-page>
</template>

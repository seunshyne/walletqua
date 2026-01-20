<template>
  <q-page class="flex flex-center bg-primary text-white">
    <div class="column items-center text-center q-pa-xl">

      <!-- Welcome text -->
      <transition name="fade-down">
        <p v-if="show" class="text-overline q-mb-sm">
          Welcome to
        </p>
      </transition>

      <!-- App name -->
      <transition name="zoom-in">
        <h1
          v-if="show"
          class="text-h3 text-weight-bold q-mb-md"
        >
          Wallet App
        </h1>
      </transition>

      <!-- Subtitle -->
      <transition name="fade-up">
        <p
          v-if="show"
          class="text-subtitle1 q-mb-xl"
          style="max-width: 420px"
        >
          Securely manage your wallet, track balances, and make transactions with ease.
        </p>
      </transition>

      <!-- Buttons -->
      <transition name="slide-left">
        <div v-if="show" class="row justify-center q-gutter-md">
          <q-btn
            label="Login"
            color="white"
            text-color="primary"
            size="lg"
            rounded
            unelevated
            to="login"
          />

          <q-btn
            label="Register"
            color="secondary"
            size="lg"
            rounded
            unelevated
            to="register"
          />
        </div>
      </transition>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)

onMounted(() => {
  // slight delay for smooth entrance
  setTimeout(() => {
    show.value = true
  }, 150)
})
</script>

<style scoped>
/* Fade Down */
.fade-down-enter-active {
  transition: all 0.7s ease;
}
.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

/* Fade Up */
.fade-up-enter-active {
  transition: all 0.7s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Zoom In */
.zoom-in-enter-active {
  transition: all 0.6s ease;
}
.zoom-in-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

/* Slide Left */
.slide-left-enter-active {
  transition: all 0.7s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
</style>

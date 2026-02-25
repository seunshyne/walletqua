<template>
  <q-page
    class="window-height window-width row justify-center items-center auth-page register-responsive register-moveup"
  >
    <div class="column register-col-responsive">
      <div class="row">
        <q-card square class="shadow-24 register-card-responsive">
          <q-card-section class="bg-primary">
            <h4 class="register-title-responsive text-white q-my-md">Registration</h4>
            <div
              class="absolute-bottom-right q-pr-md"
              style="transform: translateY(50%)"
            >
              <q-btn fab icon="close" color="blue-4" />
            </div>
          </q-card-section>
          <!-- Show success message -->
          <p v-if="message" class="text-green-500 mb-4">{{ message }}</p>

          <!-- Show general errors -->
          <p v-if="errors.general" class="text-red-500 mb-4">
            {{ errors.general }}
          </p>
          <p v-if="errors.storage" class="text-red-500 mb-4">
            {{ errors.storage }}
          </p>
          <p v-if="errors.network" class="text-red-500 mb-4">
            {{ errors.network }}
          </p>

          <q-card-section>
            <q-form
              @submit.prevent="handleSubmit"
              class="register-form-responsive"
            >
              <q-input
                square
                clearable
                v-model="formData.name"
                type="name"
                label="Name"
                :error="!!errors.name"
                :error-message="errors.name?.[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                square
                clearable
                v-model="formData.email"
                type="email"
                label="Email"
                :error="!!errors.email || (formData.email && !emailValidation.isValid)"
                :error-message="errors.email?.[0] || (formData.email && !emailValidation.isValid ? 'Invalid email format' : '')"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                square
                clearable
                v-model="formData.password"
                type="password"
                label="Password"
                :error="!!errors.password"
                :error-message="errors.password?.[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <!-- Password Strength Indicator -->
              <div v-if="formData.password" class="q-mt-md">
                <div class="text-caption q-mb-sm">Password Strength: 
                  <span :class="{
                    'text-red': passwordValidation.strength <= 2,
                    'text-orange': passwordValidation.strength === 3,
                    'text-green': passwordValidation.strength >= 4
                  }">
                    {{ ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'][passwordValidation.strength] }}
                  </span>
                </div>
                <q-linear-progress
                  :value="passwordValidation.strength / 5"
                  :color="passwordValidation.strength <= 2 ? 'red' : passwordValidation.strength === 3 ? 'orange' : 'green'"
                  class="q-mb-md"
                />
                <div class="text-caption">
                  <div :class="{ 'text-green': passwordValidation.checks.length, 'text-grey': !passwordValidation.checks.length }">
                    ✓ At least 8 characters
                  </div>
                  <div :class="{ 'text-green': passwordValidation.checks.uppercase, 'text-grey': !passwordValidation.checks.uppercase }">
                    ✓ Uppercase letter (A-Z)
                  </div>
                  <div :class="{ 'text-green': passwordValidation.checks.lowercase, 'text-grey': !passwordValidation.checks.lowercase }">
                    ✓ Lowercase letter (a-z)
                  </div>
                  <div :class="{ 'text-green': passwordValidation.checks.number, 'text-grey': !passwordValidation.checks.number }">
                    ✓ Number (0-9)
                  </div>
                  <div :class="{ 'text-green': passwordValidation.checks.special, 'text-grey': !passwordValidation.checks.special }">
                    ✓ Special character (!@#$%^&*)
                  </div>
                </div>
              </div>

              <q-input
                square
                clearable
                v-model="formData.password_confirmation"
                type="password"
                label="Confirm Password"
                :error="formData.password_confirmation && !passwordConfirmationMatch"
                :error-message="formData.password_confirmation && !passwordConfirmationMatch ? 'Passwords do not match' : ''"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
              <q-card-actions class="register-actions-responsive">
                <q-btn
                  unelevated
                  size="lg"
                  color="blue-4"
                  class="full-width text-white"
                  label="Get Started"
                  type="submit"
                />
              </q-card-actions>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center register-section-responsive">
            <p class="text-grey-6">
              <router-link to="/login">Return to login</router-link>
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
 </template>

<style scoped>
.register-col-responsive {
  padding: 32px;
}
.register-card-responsive {
  width: 500px;
  height: 650px;
}
.register-title-responsive {
  font-size: 2rem;
}
.register-form-responsive {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 48px;
  padding-bottom: 32px;
}
.register-actions-responsive {
  padding-left: 32px;
  padding-right: 32px;
}
.register-section-responsive {
  padding: 16px;
}

@media (max-width: 599px) {
  .register-col-responsive {
    padding: 8px !important;
  }
  .register-card-responsive {
    width: 100% !important;
    min-width: 0;
    height: auto !important;
  }
  .register-title-responsive {
    font-size: 1.3rem !important;
  }
  .register-form-responsive {
    padding-left: 4px !important;
    padding-right: 4px !important;
    padding-top: 16px !important;
    padding-bottom: 8px !important;
  }
  .register-actions-responsive {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
  .register-section-responsive {
    padding: 4px !important;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .register-col-responsive {
    padding: 20px !important;
  }
  .register-card-responsive {
    width: 90% !important;
    min-width: 0;
    height: auto !important;
  }
  .register-title-responsive {
    font-size: 1.7rem !important;
  }
  .register-form-responsive {
    padding-left: 12px !important;
    padding-right: 12px !important;
    padding-top: 32px !important;
    padding-bottom: 16px !important;
  }
  .register-actions-responsive {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .register-section-responsive {
    padding: 8px !important;
  }
}
/* Move the register form up */
.register-moveup {
  margin-top: -48px;
}
</style>

<script setup>
import { useAuthStore } from "src/stores/auth";
import { onMounted, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { validatePasswordStrength, isValidEmail } from "src/utils/index";

const router = useRouter();

let authStore = null
try { 
  authStore = useAuthStore();
} catch (e) {
  console.error('Failed to initialize auth store:', e)
}

// Use computed to safely access store state
const errors = computed(() => authStore?.errors || {});
const message = computed(() => authStore?.message || "");
const isAuthenticated = computed(() => authStore?.isAuthenticated || false);

const formData = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const passwordValidation = reactive({
  strength: 0,
  isValid: false,
  checks: {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  },
});

const emailValidation = reactive({
  isValid: false,
});

const passwordConfirmationMatch = computed(() => {
  return formData.password === formData.password_confirmation && formData.password_confirmation !== "";
});

// Watch password changes and validate
watch(() => formData.password, (newPassword) => {
  const validation = validatePasswordStrength(newPassword);
  passwordValidation.strength = validation.strength;
  passwordValidation.isValid = validation.isValid;
  passwordValidation.checks = validation.checks;
});

// Watch email changes and validate
watch(() => formData.email, (newEmail) => {
  emailValidation.isValid = isValidEmail(newEmail);
});

const handleSubmit = async () => {
  if (!authStore) return
  const result = await authStore.authenticate("register", formData);
  if (result?.success && result.type === "register") {
    // Redirect to verify email page
    router.replace({
      name: "verify-email",
      query: { email: formData.email }
    });
  }
  // else {
  //   console.log('Authentication failed, not redirecting')
  // }
};

onMounted(() => {
  if (!authStore) return
  if (isAuthenticated.value) {
    router.replace({ name: 'dashboard' });
    return;
  }
  authStore.errors = {};
  authStore.message = "";
});
</script>
  


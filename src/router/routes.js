const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/Dashboard.vue'),
        meta: { requiresAuth: true }
      },

      {
        path: 'send',
        name: 'send',
        component: () => import('pages/Send.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'transaction-history',
        name: 'transaction-history',
        component: () => import('pages/TransactionHistory.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/auth/Register.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/Login.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('pages/auth/ForgotPassword.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('pages/auth/ResetPassword.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('pages/auth/VerifyEmail.vue'),
        meta: { guestOnly: true }
      },
      {
        path: 'fund-wallet',
        name: 'fund-wallet',
        component: () => import('pages/FundWalletPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'wallet/verify',
        name: 'wallet-verify',
        component: () => import('pages/WalletVerifyPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'change-password',
        name: 'change-password',
        component: () => import('pages/auth/ChangePassword.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },
  {
    path: '/admin/login',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-login',
        component: () => import('pages/admin/Login.vue'),
        meta: { adminGuestOnly: true },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('pages/admin/Dashboard.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('pages/admin/UserManagement.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'users/:id',
        name: 'admin-user-detail',
        component: () => import('pages/admin/UserDetail.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'transactions',
        name: 'admin-transactions',
        component: () => import('pages/admin/Transactions.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

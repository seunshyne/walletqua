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
        path: 'receive', 
        name: 'receive',
        component: () => import('pages/Receive.vue'),
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
        path: 'verify-email', 
        name: 'verify-email',
        component: () => import('pages/auth/VerifyEmail.vue'),
        meta: { guestOnly: true }
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

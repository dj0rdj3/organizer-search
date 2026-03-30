import { createRouter, createWebHistory } from 'vue-router'
import OrganizerView from '../views/OrganizerView.vue'
import LoginView from '@/views/LoginView.vue'
import axios from 'axios'
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: OrganizerView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  try {
    await axios.get('/me')
    return true
  } catch {
    return { name: 'login' }
  }
})

export default router

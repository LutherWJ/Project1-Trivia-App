import { createRouter, createWebHistory } from 'vue-router'
import Index from '../Views/index.vue'
import Classic from '../Views/Classic.vue'
import Endless from '../Views/Endless.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/classic',
      name: 'classic',
      component: Classic
    },
    {
      path: '/endless',
      name: 'endless',
      component: Endless
    }
  ]
})

export default router
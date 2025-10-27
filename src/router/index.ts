import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/index.vue'
import Classic from '../views/Classic.vue'
import Endless from '../views/Endless.vue'

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
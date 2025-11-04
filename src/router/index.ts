import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/index.vue'
import Classic from '../views/Classic.vue'
import Endless from '../views/Endless.vue'
import Matchmaking from "../views/Matchmaking.vue";
import Multiplayer from "../views/Multiplayer.vue";
import { useSocket, disconnectSocket } from '../composables/useSocket';

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
    },
    {
      path: '/matchmaking',
      name: 'matchmaking',
      component: Matchmaking
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: Multiplayer
    }
  ]
})

/*
 * Lifecycle management for multiplayer web socket
 * Connection should be reused/shared between /matchmaking and /multiplayer
 * Connection should be terminated if the user navigates anywhere else.
 */
router.beforeEach((to, from, next) => {
  const { socket, room } = useSocket();

  if (to.name === 'multiplayer') {
    if (!socket || !room.value) {
      next('/matchmaking');
      return;
    }
  }

  if (from.name === 'multiplayer' || from.name === 'matchmaking') {
    if (to.name !== 'multiplayer' && to.name !== 'matchmaking') {
      disconnectSocket();
    }
  }

  next();
});

export default router
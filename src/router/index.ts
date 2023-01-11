import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes, RoutePath } from './routes'
import { useRouterGuards } from './guard'

export { RoutePath, useRouterGuards }

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes
})

import { createRouter, createWebHashHistory } from 'vue-router'

import { RoutePath, staticRoutes } from './routes'
import { useRouterGuards } from './guard'

export { RoutePath, useRouterGuards }

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: staticRoutes
})

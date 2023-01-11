import { LoginRoute, RootRoute, NotFoundRoute } from './common'
import { ensureArray } from '@vexip-ui/utils'

import type { RouteRecordRaw } from 'vue-router'

export const enum RoutePath {
  ROOT = '/',
  LOGIN = '/login'
}

const asyncRouteModules = import.meta.glob('./async/**/*.ts', { eager: true })
export const asyncRoutes: RouteRecordRaw[] = []

for (const module of Object.values(asyncRouteModules)) {
  for (const name of Object.keys(module as any)) {
    if (name === 'default' || name.endsWith('Route') || name.endsWith('Routes')) {
      asyncRoutes.push(...ensureArray((module as any)[name]))
    }
  }
}

export const staticRoutes = [
  LoginRoute,
  RootRoute,
  NotFoundRoute
]

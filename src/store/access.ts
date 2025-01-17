import { asyncRoutes } from '@/router/routes'

import { createIconRenderer } from '@/utils/component'

import { filterTree } from '@/utils/transform'

import { defineStore } from 'pinia'

import { pinia } from './pinia'
import { useUserStore } from './user'
import { callIfFunc } from '@vexip-ui/utils'

import type { RouteRecordRaw } from 'vue-router'
import type { MenuOptions } from 'vexip-ui'

type MenuConfig = MenuOptions & {
  order?: number
}

interface AccessState {
  routerInited: boolean,
  menus: MenuConfig[]
}

let routesCache: RouteRecordRaw[] | undefined

const _useAccessStore = defineStore('access', {
  state: (): AccessState => ({
    routerInited: false,
    menus: []
  }),
  actions: {
    async buildAssiableRoutes() {
      const userStore = useUserStore()

      if (!userStore.currentUser) return []
      if (routesCache) return Array.from(routesCache)

      const existsRoles = new Set(userStore.roles.map(role => role.auth))

      const routeFilter = (route: RouteRecordRaw) => {
        const meta = route.meta || {}

        if (!meta.roles?.length) {
          return true
        }

        return meta.roles.some(role => existsRoles.has(role))
      }

      routesCache = filterTree(asyncRoutes, routeFilter)
      this.menus = routesCache
        .map(route => parseMenuFromRoute(route))
        .filter(Boolean)
        .sort(compareMenuOrder)

      return Array.from(routesCache)
    },
    restore() {
      this.menus = []
      this.routerInited = false
    }
  }
})

function compareMenuOrder(prev: MenuConfig, next: MenuConfig) {
  return (prev.order || 0) - (next.order || 0)
}

function parseMenuFromRoute(route: RouteRecordRaw, parentLabel = ''): MenuConfig {
  const { meta = {}, path, children = [] } = route

  if (meta.menu === false) return null!

  const menu = meta.menu || {}
  const label = parentLabel ? `${parentLabel}/${path}` : path
  const name = (menu.single ? children[0]?.name : route.name) || ''
  const icon = meta.menu?.icon

  return {
    ...menu,
    label,
    name: meta.title ? callIfFunc(meta.title) : (name as string),
    icon: typeof icon === 'string' ? createIconRenderer(icon) : icon,
    children: menu.single
      ? undefined
      : children
        .map(child => parseMenuFromRoute(child, label))
        .filter(Boolean)
        .sort(compareMenuOrder)
  }
}

export function useAccessStore() {
  return _useAccessStore(pinia)
}

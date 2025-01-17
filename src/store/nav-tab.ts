import { LoginRoute, NotFoundRoute } from '@/router/routes/common'

import { createIconRenderer } from '@/utils/component'

import { defineStore } from 'pinia'

import { pinia } from './pinia'

import { isClient } from '@vexip-ui/utils'

import type { LocationQuery, RouteLocationNormalized, RouteParams } from 'vue-router'
import type { IconMinorProps } from 'vexip-ui'

export interface TabOptions {
  path: string,
  name: string,
  fullPath?: string,
  params?: RouteParams,
  query?: LocationQuery,
  title?: string | (() => string),
  fixed?: boolean,
  icon?: Record<string, any>,
  iconProps?: IconMinorProps,
  iconOnly?: boolean
}

interface NavTabState {
  staticTabs: TabOptions[],
  asyncTabs: TabOptions[]
}

export const enum ClearType {
  ALL,
  LEFT,
  RIGHT,
  OTHER
}

const NAV_TABS_CACHE = 'vexip-admin-nav-tabs-cache'

const prevCache = new Set<string>()

if (isClient) {
  const cachedString = localStorage.getItem(NAV_TABS_CACHE)

  if (cachedString) {
    try {
      const paths = JSON.parse(cachedString) as string[]

      for (const path of paths) {
        prevCache.add(path)
      }
    } catch (error) {}
  }
}

const ignoredNames = [LoginRoute.name, NotFoundRoute.name]

const _useNavTabStore = defineStore('nav-tab', {
  state: (): NavTabState => ({
    staticTabs: [],
    asyncTabs: []
  }),
  getters: {
    prevCached: () => Array.from(prevCache),
    allTabs: state => {
      const { staticTabs, asyncTabs } = state

      return staticTabs
        .map(tab => ({ ...tab, static: true }))
        .concat(asyncTabs.map(tab => ({ ...tab, static: false })))
    }
  },
  actions: {
    cacheTabs() {
      if (isClient) {
        localStorage.setItem(
          NAV_TABS_CACHE,
          JSON.stringify(this.asyncTabs.map(tab => tab.fullPath || tab.path))
        )
      }
    },
    addTab(route: RouteLocationNormalized) {
      const { path, fullPath, name, params, query, meta } = route
      const { fixed, icon, iconProps, iconOnly } = meta?.tab || {}

      if (name && ignoredNames.includes(name)) return

      const isStatic = !!this.staticTabs.find(tab => {
        return (tab.fullPath || tab.path) === (fullPath || path)
      })

      if (isStatic) return

      const index = this.asyncTabs.findIndex(tab => {
        return (tab.fullPath || tab.path) === (fullPath || path)
      })

      if (index > -1) {
        const tab = toRaw(this.asyncTabs[index])

        tab.params = params || tab.params
        tab.query = query || tab.query
        tab.fullPath = fullPath || tab.fullPath

        this.asyncTabs.splice(index, 1, tab)
      } else {
        this.asyncTabs.push({
          path,
          name: name as string,
          fullPath,
          params,
          query,
          title: meta.title,
          fixed,
          icon: typeof icon === 'string' ? createIconRenderer(icon) : icon,
          iconProps,
          iconOnly
        })
      }

      this.cacheTabs()
    },
    hasTab(path: string) {
      return (
        this.staticTabs.some(tab => (tab.fullPath || tab.path) === path) ||
        this.asyncTabs.some(tab => (tab.fullPath || tab.path) === path)
      )
    },
    removeTab(path: string) {
      const index = this.asyncTabs.findIndex(tab => (tab.fullPath || tab.path) === path)

      if (index <= -1) return

      this.asyncTabs.splice(index, 1)
      this.cacheTabs()
    },
    clearTabs(type = ClearType.ALL, path?: string) {
      if (type === ClearType.ALL) {
        this.asyncTabs = []
        this.cacheTabs()
        return
      }

      if (!path) return

      const index = this.asyncTabs.findIndex(tab => (tab.fullPath || tab.path) === path)

      if (type === ClearType.LEFT && index > 0) {
        this.asyncTabs = this.asyncTabs.slice(index)
      } else if (type === ClearType.RIGHT && index > -1 && index < this.asyncTabs.length - 1) {
        this.asyncTabs = this.asyncTabs.slice(0, index + 1)
      } else if (type === ClearType.OTHER && index > -1) {
        this.asyncTabs = [this.asyncTabs[index]]
      }

      this.cacheTabs()
    },
    clearAllTabs() {
      this.clearTabs(ClearType.ALL)
    },
    clearLeftTabs(path: string) {
      this.clearTabs(ClearType.LEFT, path)
    },
    clearRightTabs(path: string) {
      this.clearTabs(ClearType.RIGHT, path)
    },
    clearOtherTabs(path: string) {
      this.clearTabs(ClearType.OTHER, path)
    },
    findClosestTab(path: string) {
      const allTabs = [...this.staticTabs, ...this.asyncTabs]

      if (!allTabs.length) return null

      const index = allTabs.findIndex(tab => (tab.fullPath || tab.path) === path)

      return index <= -1 ? allTabs[0] : allTabs[index > 0 ? index - 1 : index + 1]
    },
    refreshTab() {
      // TODO: implement
    },
    restore() {
      this.clearAllTabs()
    }
  }
})

export function useNavTabStore() {
  return _useNavTabStore(pinia)
}

import { useAccessStore, useGlobalStore, useNavTabStore, useUserStore } from '@/store'

import { getAccessToken } from '@/utils/auth'

import { LoginRoute, NotFoundRoute, RootRoute } from './routes/common'

import type { Router } from 'vue-router'

export function useRouterGuards(router: Router) {
  useAccessGuard(router)
  useLoadingGuard(router)
  useRestoreGuard(router)
}

function useAccessGuard(router: Router) {
  const userStore = useUserStore()
  const accessStore = useAccessStore()
  const navTabStore = useNavTabStore()

  const whileList = [LoginRoute.path]

  router.beforeEach(async (to, from, next) => {
    const token = getAccessToken()

    if (!token) {
      if (whileList.includes(to.path)) {
        next()
        return
      }

      next({
        path: LoginRoute.path,
        replace: true,
        query: {
          ...to.query,
          redirect: to.path === RootRoute.path ? undefined : to.path
        }
      })
      return
    }

    if (!userStore.currentUser) {
      await userStore.getCurrentUser()
    }

    if (accessStore.routerInited) {
      next()
      return
    }

    const assiableRoutes = await accessStore.buildAssiableRoutes()

    for (const route of assiableRoutes) {
      router.addRoute(route)
    }

    router.getRoutes().forEach(route => {
      if (route.meta?.tab === false) return

      if (route.meta?.tab?.fixed) {
        const { path, name, meta } = route
        const { fixed, icon, iconProps, iconOnly } = meta?.tab || {}

        navTabStore.staticTabs.push({
          path,
          name: name as string,
          title: meta.title,
          fixed,
          icon,
          iconProps,
          iconOnly
        } as any)
      }
    })

    if (navTabStore.prevCached.length) {
      for (const path of navTabStore.prevCached) {
        const route = router.resolve(path)

        if (route) {
          navTabStore.addTab(route)
        }
      }
    }

    accessStore.routerInited = true

    const { redirect, ...fromQuery } = from.query
    const query = { ...fromQuery, ...to.query }

    if (to.name === NotFoundRoute.name) {
      next({ path: to.fullPath, replace: true, query })
    } else {
      const redirectPath = (redirect as string) || to.path

      next({
        ...(redirectPath === to.path ? { ...to, replace: true } : { path: redirectPath }),
        query
      })
    }
  })
}

function useLoadingGuard(router: Router) {
  const loadedMap = new Map<string, boolean>()
  const globalStore = useGlobalStore()

  router.beforeResolve(to => {
    to.meta.loaded = !!loadedMap.get(to.path)

    if (to.meta.loaded) return true

    globalStore.setPageLoading(true)

    return true
  })

  router.afterEach(to => {
    loadedMap.set(to.path, true)

    requestAnimationFrame(() => {
      globalStore.setPageLoading(false)
    })
  })
}

function useRestoreGuard(router: Router) {
  const userStore = useUserStore()
  const accessStore = useAccessStore()
  const navTabStore = useNavTabStore()

  router.afterEach(to => {
    if (to.path === LoginRoute.path) {
      userStore.restore()
      accessStore.restore()
      navTabStore.restore()
    }
  })
}

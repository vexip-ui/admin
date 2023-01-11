import { t } from '@/locale'

import type { RouteRecordRaw } from 'vue-router'

export const HOME_PATH = '/home'

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: HOME_PATH,
  meta: {
    title: () => t('title.home')
  }
}

export const LoginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/login.vue'),
  meta: {
    title: () => t('title.login')
  }
}

export const NotFoundRoute: RouteRecordRaw = {
  path: '/:catchAll(.*)',
  name: 'NotFound',
  component: () => import('@/views/not-found.vue'),
  meta: {
    title: () => t('title.notFound')
  }
}

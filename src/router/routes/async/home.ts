import { t } from '@/locale'

import { AsyncViewLayout } from '../helper'

import type { RouteRecordRaw } from 'vue-router'

export const ProjectNoteRoute: RouteRecordRaw = {
  path: '/home',
  component: AsyncViewLayout,
  meta: {
    title: () => t('title.home'),
    tab: {
      fixed: true,
      icon: IHouse,
      iconOnly: true
    },
    menu: false
  },
  children: [
    {
      path: '',
      name: 'Home',
      component: () => import('@/views/home.vue')
    }
  ]
}

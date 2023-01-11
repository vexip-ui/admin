import { AsyncViewLayout } from '../helper'
import { t } from '@/locale'

import type { RouteRecordRaw } from 'vue-router'

export const ProjectNoteRoute: RouteRecordRaw = {
  path: '/article',
  name: 'ProjectNote',
  component: AsyncViewLayout,
  redirect: '/article/list',
  meta: {
    title: () => t('demos.article.viewTitle'),
    menu: {
      single: true,
      icon: IFileCircleCheck
    }
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/demos/article/list.vue')
    },
    {
      path: 'create',
      component: () => import('@/views/demos/article/form.vue'),
      meta: {
        title: () => t('title.create', [t('demos.article.viewTitle')])
      }
    },
    {
      path: 'edit/:id',
      component: () => import('@/views/demos/article/form.vue'),
      props: true,
      meta: {
        title: () => t('title.edit', [t('demos.article.viewTitle')])
      }
    }
  ]
}

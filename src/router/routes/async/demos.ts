import { t } from '@/locale'

import { AsyncViewLayout } from '../helper'

import type { RouteRecordRaw } from 'vue-router'

export const DemosRoute: RouteRecordRaw = {
  path: '/demos',
  name: 'Demos',
  redirect: '/demos/article/list',
  meta: {
    title: () => t('demos.title'),
    menu: {
      icon: IDisplay
    }
  },
  children: [
    {
      path: 'article',
      name: 'Article',
      component: AsyncViewLayout,
      redirect: '/demos/article/list',
      meta: {
        title: () => t('demos.article.viewTitle'),
        menu: {
          single: true
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
  ]
}

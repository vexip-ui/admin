import { AsyncViewLayout } from '../helper'
import { t } from '@/locale'

import type { RouteRecordRaw } from 'vue-router'

export const ComponentsRoute: RouteRecordRaw = {
  path: '/components',
  name: 'Components',
  component: AsyncViewLayout,
  redirect: '/components/rich-editor',
  meta: {
    title: () => t('components.title'),
    menu: {
      icon: ICat
    }
  },
  children: [
    {
      path: 'rich-editor',
      name: 'RichEditor',
      component: () => import('@/views/components/rich-text.vue'),
      meta: {
        title: () => t('components.richText.title')
      }
    },
    {
      path: 'markdown',
      name: 'Markdown',
      component: () => import('@/views/components/markdown.vue'),
      meta: {
        title: () => t('components.markdown.title')
      }
    }
  ]
}

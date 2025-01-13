import './style/index.scss'

import 'virtual:icon-register'

import { createApp } from 'vue'

import App from './app.vue'
import { i18n, initPromise } from './locale'
import { pinia } from './store'
import { router, useRouterGuards } from './router'

async function init() {
  if (import.meta.env.VITE_USE_MOCK) {
    await (
      await import('../mock/worker')
    ).initPromise
  }

  await initPromise

  useRouterGuards(router)
  createApp(App)
    .use(VConfirm)
    .use(VContextmenu)
    .use(VLoading)
    .use(VMessage)
    .use(VNotice)
    .use(VToast)
    .use(pinia)
    .use(i18n)
    .use(router)
    .mount('#app')
}

init()

import { defineStore } from 'pinia'

import { pinia } from './pinia'

interface GlobalState {
  pageLoading: boolean
}

const _useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    pageLoading: false
  }),
  actions: {
    setPageLoading(loading: boolean) {
      this.pageLoading = loading
    }
  }
})

export function useGlobalStore() {
  return _useGlobalStore(pinia)
}

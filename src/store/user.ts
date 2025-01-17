import { getCurrentUser, login, logout } from '@/service/user'
import { RoutePath, router } from '@/router'

import { clearAccessToken, getAccessToken, setAccessToken } from '@/utils/auth'

import { defineStore } from 'pinia'

import { pinia } from './pinia'

import type { LoginParams, User } from '@/service/user'

interface UserState {
  currentUser: User | null
}

const _useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null
  }),
  getters: {
    roles: state => state.currentUser?.roles || []
  },
  actions: {
    async login(params: LoginParams) {
      const result = await login(params)

      if (result) {
        const { token, user } = result

        this.currentUser = user
        setAccessToken(token)
      }

      return result
    },
    async logout(toLogin = true) {
      if (getAccessToken()) {
        let result = false

        try {
          result = await logout()
        } catch (error) {}

        if (!result) {
          console.warn('Token cancel faild')
        }

        clearAccessToken()
      }

      this.currentUser = null
      toLogin && router.push(RoutePath.LOGIN)
    },
    async getCurrentUser() {
      const token = getAccessToken()

      if (!token) return null

      if (!this.currentUser) {
        this.currentUser = await getCurrentUser()

        if (!this.currentUser) {
          clearAccessToken()
        }
      }

      return this.currentUser
    },
    restore() {
      this.currentUser = null
    }
  }
})

export function useUserStore() {
  return _useUserStore(pinia)
}

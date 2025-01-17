import { clearAccessToken, getAuthorization } from '@/utils/auth'

import Axios, { AxiosHeaders } from 'axios'

import { API_BASE_PATH } from './config'

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestInstance, Result } from './helper'

export function createAxiosInstance(options: AxiosRequestConfig) {
  const instance = Axios.create(options)

  instance.interceptors.request.use(
    config => {
      if (!config.headers) {
        config.headers = new AxiosHeaders()
      }

      config.headers.set('Authorization', getAuthorization())

      return config
    },
    error => Promise.reject(error)
  )

  instance.interceptors.response.use(
    response => {
      const data = response.data

      return Promise.resolve(data)
    },
    error => {
      const response = error.response as AxiosResponse<Result<string>, AxiosRequestConfig>
      const result = response?.data

      if (result?.data && String(result.data) === '2000') {
        clearAccessToken()
      } else if (result) {
        return Promise.resolve(result)
      }

      return Promise.reject(error)
    }
  )

  return instance as RequestInstance
}

export const commonInstance = createAxiosInstance({
  baseURL: API_BASE_PATH,
  withCredentials: true
})

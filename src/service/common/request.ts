import { clearAccessToken, getAuthorization } from '@/utils/auth'

import Axios, { AxiosHeaders } from 'axios'

import { addSeconds, deepClone, differenceMilliseconds } from '@vexip-ui/utils'
import { BASE_SERVER } from './config'

import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestInstance, Result } from './helper'

const defaultAdapter = Axios.defaults.adapter as AxiosAdapter

const cacheMap = new Map<string, any>()

function cacheResponse(config: AxiosRequestConfig) {
  const token = `${config.method}:${config.url}`
  const current = Date.now()

  let { response, timeout } = cacheMap.get(token) ?? {}

  if (!response || differenceMilliseconds(current, timeout) < 0) {
    response = (async () => {
      try {
        return await defaultAdapter(config)
      } catch (error) {
        return Promise.reject(error)
      }
    })()

    cacheMap.set(token, {
      response,
      timeout: addSeconds(current, config.expiredTime ?? 600)
    })
  }

  return response.then((data: any) => deepClone(data))
}

export function createAxiosInstance(options: AxiosRequestConfig) {
  const instance = Axios.create(options)

  instance.interceptors.request.use(
    config => {
      if (config.cache) {
        config.adapter = cacheResponse
      }

      if (!config.headers) {
        config.headers = {}
      }

      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', getAuthorization())
      } else {
        config.headers.Authorization = getAuthorization()
      }

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
  baseURL: BASE_SERVER,
  withCredentials: true
})

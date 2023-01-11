import { commonInstance } from './request'
import { isDefined } from '@vexip-ui/utils'

import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { Dateable } from '@vexip-ui/utils'

export type RequestInstance = Replace<
  AxiosInstance,
  {
    <T = any>(config: AxiosRequestConfig): Promise<T>,
    <T = any>(url: string, config: AxiosRequestConfig): Promise<T>,
    request<T = any>(config: AxiosRequestConfig): Promise<T>,
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>,
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>,
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>,
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>,
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>,
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>,
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>,
    postForm<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>,
    putForm<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>,
    patchForm<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  }
>

export type Result<T> = {
  status?: 0 | 1,
  message?: string,
  data: T
}

export interface BusinessBase<ID = string> {
  id: ID,
  creatorId: string,
  creatorName: string,
  createdTime: Dateable,
  modifierId: string,
  modifierName: string,
  modifiedTime: Dateable
}

export interface CommonRequestsOptions<T extends Record<any, any>, K extends Record<any, any>> {
  url: string,
  entityProcess: (entity: T) => K
}

interface CommonRequests<T extends Record<any, any>, ID = any, K extends Record<any, any> = T> {
  getAll: (config?: AxiosRequestConfig) => Promise<K[]>,
  getById: (id: ID, config?: AxiosRequestConfig) => Promise<K | null>,
  create: (entity: T | FormData, config?: AxiosRequestConfig) => Promise<K | null>,
  update: (entity: T | FormData, config?: AxiosRequestConfig) => Promise<K | null>,
  deleteById: (id: ID, config?: AxiosRequestConfig) => Promise<boolean>,
  deleteByIds: (ids: ID[] | Set<ID>, config?: AxiosRequestConfig) => Promise<boolean>
}

export function parseResult<T>(result: Result<T>, defaultValue: T): T
export function parseResult<T, K>(result: Result<K>, defaultValue: K, callback: (data: K) => T): T
export function parseResult<T, K>(
  result: Result<K>,
  defaultValue: K,
  callback?: (data: K) => T
): K | T {
  if (result.status) {
    if (typeof callback === 'function') {
      return callback(result.data ?? defaultValue)
    }

    return result.data
  }

  return defaultValue
}

export function createCommonRequests<T extends Record<any, any>, ID = any>(
  url: string,
  instance?: RequestInstance
): CommonRequests<T, ID>
export function createCommonRequests<
  T extends Record<any, any>,
  ID = any,
  K extends Record<any, any> = T
>(options: CommonRequestsOptions<T, K>, instance?: RequestInstance): CommonRequests<T, ID, K>
export function createCommonRequests<
  T extends Record<any, any>,
  ID = any,
  K extends Record<any, any> = T
>(options: string | CommonRequestsOptions<T, K>, instance = commonInstance) {
  const { url, entityProcess } =
    typeof options === 'string' ? ({ url: options } as CommonRequestsOptions<T, K>) : options

  async function getAll(config?: AxiosRequestConfig) {
    return parseResult(await instance.get<Result<T[]>>(url, config), [])
  }

  async function getById(id: ID, config?: AxiosRequestConfig) {
    return parseResult(await instance.get<Result<T>>(`${url}/${id}`, config), null)
  }

  function getPostOrPut(method: 'post' | 'put') {
    return async (entity: T | FormData, config?: AxiosRequestConfig) => {
      if (config?.buildFormData && !(entity instanceof FormData)) {
        const formData = new FormData()

        Object.keys(entity).forEach(key => {
          const value = (entity as T)[key]

          isDefined(value) && formData.append(key, value)
        })

        entity = formData
      }

      return parseResult(await instance[method]<Result<T>>(url, entity, config), null)
    }
  }

  const create = getPostOrPut('post')
  const update = getPostOrPut('put')

  async function deleteById(id: ID, config?: AxiosRequestConfig) {
    return parseResult(await instance.delete<Result<boolean>>(`${url}/${id}`, config), false)
  }

  async function deleteByIds(ids: ID[] | Set<ID>, config?: AxiosRequestConfig) {
    return parseResult(
      await instance.delete<Result<boolean>>(url, { ...config, data: [...ids] }),
      false
    )
  }

  if (entityProcess) {
    return {
      getAll: async (config?: AxiosRequestConfig) => {
        return ((await getAll(config)) || []).map(entityProcess)
      },
      getById: async (id: ID, config?: AxiosRequestConfig) => {
        const entity = await getById(id, config)

        return entity ? entityProcess(entity) : entity
      },
      create: async (entity: T | FormData, config?: AxiosRequestConfig) => {
        const newEntity = await create(entity, config)

        return newEntity ? entityProcess(newEntity) : newEntity
      },
      update: async (entity: T | FormData, config?: AxiosRequestConfig) => {
        const newEntity = await update(entity, config)

        return newEntity ? entityProcess(newEntity) : newEntity
      },
      deleteById,
      deleteByIds
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    deleteById,
    deleteByIds
  }
}

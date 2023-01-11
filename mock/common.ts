import Mock, { mock, Random } from 'mockjs'
import { getUsers } from './user'

import type { Result } from '@/service/common'

export interface MockParams {
  url: string,
  type: string,
  body?: string,
  headers?: Record<string, string>
}

type ResultType<T> = {
  [P in keyof T]: T[P] extends () => any ? ReturnType<T[P]> : T[P]
}

const XHR = (Mock as any).XHR

XHR.prototype.__send = XHR.prototype.send
XHR.prototype.send = function (...args: any) {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials ?? false

    try {
      // 同步请求时会报错
      // 暂未找到方法判断是否为同步请求
      this.custom.xhr.responseType = this.responseType
    } catch (e) {}
  }

  if (this.custom.requestHeaders) {
    this.custom.options.headers = { ...this.custom.requestHeaders }
  }

  this.__send(...args)
}

Mock.setup({ timeout: '200-600' })

Random.extend({
  telephone() {
    return `1${Random.pick(['30', '32', '35', '59', '80', '89'])}${mock(/\d{8}/)}`
  }
})

export function createResponse<T extends { [x: string]: any } | { [x: string]: any }[]>(
  data: T,
  range?: string
) {
  return (): Result<T extends any[] ? ResultType<T[0]>[] : ResultType<T>> => {
    const isArrayData = Array.isArray(data)

    if (isArrayData && !range) {
      range = '20-30'
    }

    const mockResult = mock(
      isArrayData
        ? {
            [`data|${range}`]: data
          }
        : data
    )

    return {
      status: 1,
      message: 'ok',
      data: isArrayData ? mockResult.data : mockResult
    }
  }
}

export function mockCommonRequests<T extends { id?: any }>(url: string, getList: () => T[]) {
  let list = getList()

  mock(url, 'get', () => {
    return {
      status: 1,
      message: 'ok',
      data: list
    }
  })

  mock(new RegExp(`${url}\\/[^/]+`), 'get', ({ url }) => {
    const id = url.split('/').at(-1)!
    const entity = list.find(entity => String(entity.id) === id)

    return {
      status: 1,
      message: 'ok',
      data: entity || null
    }
  })

  mock(url, 'post', ({ body }) => {
    try {
      const entity = JSON.parse(body)

      entity.id = Random.guid()
      list.push(entity)

      return {
        status: 1,
        message: 'ok',
        data: entity
      }
    } catch (error) {}

    return {
      status: 1,
      message: 'ok',
      data: null
    }
  })

  mock(url, 'put', ({ body }) => {
    try {
      const newEntity = JSON.parse(body)
      const entity = list.find(entity => entity.id === newEntity.id)

      if (entity) {
        Object.assign(entity, newEntity)

        return {
          status: 1,
          message: 'ok',
          data: entity
        }
      }
    } catch (error) {}

    return {
      status: 1,
      message: 'ok',
      data: null
    }
  })

  mock(new RegExp(`${url}\\/[^/]+`), 'delete', ({ url }) => {
    const id = url.split('/').at(-1)!
    const index = list.findIndex(entity => entity.id === id)

    if (index > -1) {
      list.splice(index, 1)
    }

    return {
      status: 1,
      message: 'ok',
      data: index > -1
    }
  })

  mock(url, 'delete', ({ body }) => {
    try {
      const ids = JSON.parse(body)

      if (ids.length) {
        const idSet = new Set(ids)

        list = list.filter(entity => !idSet.has(entity.id))

        return {
          status: 1,
          message: 'ok',
          data: true
        }
      }
    } catch (error) {}

    return {
      status: 1,
      message: 'ok',
      data: false
    }
  })
}

export function createBusinessBase() {
  const user = Random.pick(getUsers())

  return {
    id: Random.guid(),
    creatorId: user.id,
    creatorName: user.alias,
    createdTime: Random.datetime(),
    modifierId: user.id,
    modifierName: user.alias,
    modifiedTime: Random.datetime()
  }
}

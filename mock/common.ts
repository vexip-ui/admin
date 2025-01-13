import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

export interface MockParams {
  url: string,
  type: string,
  body?: string,
  headers?: Record<string, string>
}

export function createResult<T>(
  data: T | null = null,
  success = true,
  message?: string,
  status = 200
) {
  return HttpResponse.json(
    {
      status: success ? 1 : 0,
      message: message || (success ? 'ok' : 'fail'),
      data
    },
    status !== 200 ? { status } : undefined
  )
}

export function mockCommonRequests<T extends { id?: any }>(url: string, getList: () => T[]) {
  url = url.trim().replace(/\/+$/, '')
  let list = getList()

  const handlers = [
    http.get(url, () => createResult(list)),

    http.get(`${url}/:id`, ({ params }) => {
      const id = params.id
      const entity = list.find(entity => String(entity.id) === id)

      return createResult(entity)
    }),

    http.post(url, async ({ request }) => {
      try {
        const entity = (await request.json()) as T

        entity.id = faker.string.uuid()
        list.push(entity)

        return createResult(entity)
      } catch (error) {}

      return createResult()
    }),

    http.put(url, async ({ request }) => {
      try {
        const newEntity = (await request.json()) as T
        const entity = list.find(entity => entity.id === newEntity.id)

        if (entity) {
          Object.assign(entity, newEntity)

          return createResult(entity)
        }
      } catch (error) {}

      return createResult()
    }),

    http.delete(`${url}/:id`, ({ params }) => {
      const id = params.id
      const index = list.findIndex(entity => entity.id === id)

      if (index > -1) {
        list.splice(index, 1)
      }

      return createResult(index > -1)
    }),

    http.delete(url, async ({ request }) => {
      try {
        const ids = (await request.json()) as string[]

        if (ids.length) {
          const idSet = new Set(ids)
          list = list.filter(entity => !idSet.has(entity.id))

          return createResult(true)
        }
      } catch (error) {}

      return createResult(false)
    })
  ]

  return { handlers, getList: () => list }
}

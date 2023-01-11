import { isDefined } from '@vexip-ui/utils'
import { parseResult } from '@/service/common'

import type { FileOptions } from 'vexip-ui'
import type { Result, Resource } from '@/service/common'

interface BuildFormOptions {
  dateFields?: string[]
}

export function buildFormData(entity: Record<string, any>, options: BuildFormOptions = {}) {
  const { dateFields = [] } = options
  const formData = new FormData()

  for (const key of Object.keys(entity)) {
    const value = entity[key]

    if (isDefined(value)) {
      if (dateFields.includes(key)) {
        formData.append(key, `${new Date(value as string)}`)
      } else {
        formData.append(key, String(value))
      }
    }
  }

  return formData
}

export function createUploadSuccess(cb?: (file: FileOptions, response: Resource | null) => void) {
  return function onSuccess(file: FileOptions, response: Result<Resource>) {
    const resource = parseResult(response, null)

    if (resource) {
      file.id = resource.id
      file.url = resource.url
    }

    cb?.(file, resource)
  }
}

export interface TreeFilterOptions<T = string> {
  childField?: T,
  clone?: boolean,
  strict?: boolean
}

export function filterTree<T = any>(
  tree: T[],
  method: (item: T) => boolean,
  options: TreeFilterOptions<keyof T> = {}
) {
  const {
    childField = 'children' as keyof T,
    clone = true,
    strict = true
  } = options

  const filter = (list: T[]) => (clone ? list.map(item => ({ ...item })) : list).filter(item => {
    const reslut = method(item)

    if (!strict || reslut) {
      const children = item[childField] as T[]

      if (Array.isArray(children) && children.length) {
        (item as any)[childField] = filter(children)
      }
    }

    return reslut
  })

  return filter(tree)
}

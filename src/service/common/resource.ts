import { RESOURCE_BASE_PATH } from './config'
import { commonInstance } from './request'
import { parseResult } from './helper'

import type { AxiosRequestConfig } from 'axios'
import type { BusinessBase, Result } from './helper'

export interface Resource extends BusinessBase {
  url: string,
  name: string,
  ext: string,
  size: number,
  md5: string
}

const prefix = RESOURCE_BASE_PATH

export const uploadUrl = `${prefix}/file`

export async function uploadResource(formData: FormData, config?: AxiosRequestConfig) {
  return parseResult(await commonInstance.post<Result<Resource>>(uploadUrl, formData, config), null)
}

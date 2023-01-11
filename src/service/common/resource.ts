import { RESOURCE_SERVER } from './config'
import { commonInstance } from './request'
import { parseResult } from './helper'

import type { AxiosRequestConfig } from 'axios'
import type { Result, BusinessBase } from './helper'

export interface Resource extends BusinessBase {
  url: string,
  name: string,
  ext: string,
  size: number,
  md5: string
}

const prefix = RESOURCE_SERVER

export const uploadUrl = `${prefix}/file`

export async function uploadResource(formData: FormData, config?: AxiosRequestConfig) {
  return parseResult(await commonInstance.post<Result<Resource>>(uploadUrl, formData, config), null)
}

import { commonInstance, parseResult } from './common'

import type { Dateable } from '@vexip-ui/utils'
import type { Result } from './common'

export interface Role {
  name: string,
  auth: string
}

export interface User {
  id: string,
  username: string,
  alias: string,
  avatar: string,
  email: string,
  lastLogin: Dateable,
  roles: Role[]
}

export type UserProfile = Pick<User, 'id' | 'username' | 'alias' | 'avatar'>

export interface LoginParams {
  username: string,
  password: string
}

export interface LoginResult {
  token: string,
  user: User
}

export const prefix = '/user'

export async function login(params: LoginParams) {
  return parseResult(
    await commonInstance.post<Result<LoginResult>>(`${prefix}/login`, params),
    null
  )
}

export async function logout() {
  return parseResult(await commonInstance.post<Result<boolean>>(`${prefix}/logout`), false)
}

export async function getCurrentUser() {
  return parseResult(await commonInstance.get<Result<User>>(`${prefix}/info`), null)
}

export async function getUserSelection() {
  return parseResult(await commonInstance.get<Result<UserProfile[]>>(`${prefix}/selection`), [])
}

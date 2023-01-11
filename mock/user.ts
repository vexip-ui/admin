import { mock } from 'mockjs'

import type { User, LoginParams } from '@/service/user'
import type { MockParams } from './common'

export function getUsers(): Array<User & { password: string, token: string }> {
  return [
    {
      id: '1',
      username: 'root',
      password: '123456',
      token: 'root',
      alias: '系统管理员',
      avatar: '',
      email: 'root@vexipui.com',
      lastLogin: Date.now(),
      roles: [
        { name: 'Admin', auth: 'admin' }
      ]
    },
    {
      id: '2',
      username: 'qmhc',
      password: '123456',
      token: 'qmhc',
      alias: 'Qmhc',
      avatar: 'https://www.vexipui.com/qmhc.jpg',
      email: '544022268@qq.com',
      lastLogin: '2022-06-14T07:54:03.880+00:00',
      roles: [
        { name: 'Guest', auth: 'guest' }
      ]
    }
  ]
}

mock('/api/user/login', ({ body }) => {
  try {
    const params = JSON.parse(body) as LoginParams
    const dbUser = getUsers().find(user => user.username === params.username)

    if (dbUser && dbUser.password === params.password) {
      const { password, token, ...user } = dbUser

      return {
        status: 1,
        message: 'ok',
        data: { token, user }
      }
    }
  } catch (error) {}

  return {
    status: 0,
    message: 'fail',
    data: 2002
  }
})

mock('/api/user/logout', ({ headers }: MockParams) => {
  if (headers?.Authorization) {
    const token = headers.Authorization.replace(/^Bearer /, '')
    const dbUser = getUsers().find(user => user.token === token)

    if (dbUser) {
      return {
        status: 1,
        message: 'ok',
        data: true
      }
    }
  }

  return {
    status: 0,
    message: 'fail',
    data: false
  }
})

mock('/api/user/info', ({ headers }: MockParams) => {
  if (headers?.Authorization) {
    const token = headers.Authorization.replace(/^Bearer /, '')
    const dbUser = getUsers().find(user => user.token === token)

    if (dbUser) {
      const { password, token, ...user } = dbUser

      return {
        status: 1,
        message: 'ok',
        data: user
      }
    }
  }

  return {
    status: 0,
    message: 'fail',
    data: 2002
  }
})

mock('/api/user/selection', () => {
  return {
    status: 1,
    message: 'ok',
    data: getUsers().map(user => {
      return {
        id: user.id,
        username: user.username,
        alias: user.alias,
        avatar: user.avatar
      }
    })
  }
})

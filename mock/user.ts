import { HttpResponse, http } from 'msw'
import { faker } from '@faker-js/faker'
import { listToMap } from '@vexip-ui/utils'

import type { LoginParams, User } from '@/service/user'

export const users: Array<User & { password: string, token: string }> = [
  {
    id: '1',
    username: 'root',
    password: '123456',
    token: 'root',
    alias: '系统管理员',
    avatar: '',
    email: 'root@vexipui.com',
    lastLogin: Date.now(),
    roles: [{ name: 'Admin', auth: 'admin' }]
  },
  {
    id: '2',
    username: 'qmhc',
    password: '123456',
    token: 'qmhc',
    alias: '未觉雨声',
    avatar: 'https://www.vexipui.com/qmhc.jpg',
    email: '544022268@qq.com',
    lastLogin: '2022-06-14T07:54:03.880+00:00',
    roles: [{ name: 'Guest', auth: 'guest' }]
  }
]

const userMap = listToMap(users, 'username', undefined, true)

export function createBusinessBase() {
  const user = faker.helpers.arrayElement(users)

  return {
    id: faker.string.uuid(),
    creatorId: user.id,
    creatorName: user.alias,
    createdTime: faker.date.past(),
    modifierId: user.id,
    modifierName: user.alias,
    modifiedTime: faker.date.recent()
  }
}

export const handlers = [
  http.post('/api/user/login', async ({ request }) => {
    const params = (await request.json()) as LoginParams
    const dbUser = userMap.get(params.username)

    if (dbUser && dbUser.password === params.password) {
      const { password, token, ...user } = dbUser

      return HttpResponse.json({
        status: 1,
        message: 'ok',
        data: { token, user }
      })
    }

    return HttpResponse.json({
      status: 0,
      message: 'fail',
      data: 2002
    })
  }),
  http.get('/api/user/logout', ({ cookies }) => {
    if (cookies['access_token']) {
      const token = cookies['access_token'].replace(/^Bearer /, '')
      const dbUser = users.find(user => user.token === token)

      if (dbUser) {
        return HttpResponse.json({
          status: 1,
          message: 'ok',
          data: true
        })
      }
    }

    return HttpResponse.json({
      status: 0,
      message: 'fail',
      data: false
    })
  }),
  http.get('/api/user/info', ({ cookies }) => {
    if (cookies['access_token']) {
      const token = cookies['access_token'].replace(/^Bearer /, '')
      const dbUser = users.find(user => user.token === token)

      if (dbUser) {
        const { password, token, ...user } = dbUser

        return HttpResponse.json({
          status: 1,
          message: 'ok',
          data: user
        })
      }
    }

    return HttpResponse.json({
      status: 0,
      message: 'fail',
      data: 2002
    })
  }),
  http.get('/api/user/selection', () => {
    return HttpResponse.json({
      status: 1,
      message: 'ok',
      data: users.map(user => {
        return {
          id: user.id,
          username: user.username,
          alias: user.alias,
          avatar: user.avatar
        }
      })
    })
  })
]

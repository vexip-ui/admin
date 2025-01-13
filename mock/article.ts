import { faker } from '@faker-js/faker'
import { mockCommonRequests } from './common'
import { createBusinessBase } from './user'

import type { Article } from '@/service/article'

const richText =
  '<p>Some content for testing.</p><p><img src="https://www.vexipui.com/picture-4.jpg" alt="" data-href="" style="width: 610.00px;height: 381.25px;"/></p><p>Some content for testing.</p>'

export const { handlers } = mockCommonRequests('/api/article', (): Article[] => {
  return Array.from({ length: 20 }, (_, index) => {
    return {
      ...createBusinessBase(),
      id: `${index}`,
      title: faker.book.title(),
      author: faker.person.firstName(),
      date: faker.date.past(),
      summary: faker.lorem.sentence(),
      cover: [
        {
          url: 'https://www.vexipui.com/picture-1.jpg'
        }
      ],
      content: richText
    }
  })
})

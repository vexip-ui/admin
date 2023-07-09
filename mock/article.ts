import { Random } from 'mockjs'
import { createBusinessBase, mockCommonRequests } from './common'

import type { Article } from '@/service/article'

const richText =
  '<p>Some content for testing.</p><p><img src="https://www.vexipui.com/picture-4.jpg" alt="" data-href="" style="width: 610.00px;height: 381.25px;"/></p><p>Some content for testing.</p>'

mockCommonRequests('/api/article', (): Article[] => {
  return Array.from({ length: 20 }, (_, index) => {
    return {
      ...createBusinessBase(),
      id: `${index}`,
      title: Random.title(5, 10),
      author: Random.first(),
      date: Random.datetime(),
      summary: Random.sentence(5, 15),
      cover: [
        {
          url: 'https://www.vexipui.com/picture-1.jpg'
        }
      ],
      content: richText
    }
  })
})

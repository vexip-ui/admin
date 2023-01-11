import { createCommonRequests } from './common'

import type { FileOptions } from 'vexip-ui'
import type { Dateable } from '@vexip-ui/utils'
import type { BusinessBase } from './common/helper'

export interface Article extends BusinessBase {
  title: string,
  author: string,
  date: Dateable,
  summary: string,
  cover: FileOptions[],
  content: string
}

const prefix = '/article'

const {
  getAll: getArticles,
  getById: getArticleById,
  create: createArticle,
  update: updateArticle,
  deleteByIds: deleteArticles
} = createCommonRequests<Article, Article['id']>(prefix)

export {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticles
}

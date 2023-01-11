import { isClient } from '@vexip-ui/utils'

import type { LanguageConfig } from './types'

export const languages = ['zh-CN'] as const

export type LanguageType = typeof languages[number]

export function defineLanguage<T extends LanguageConfig>(config: PartialDeep<T>) {
  return config
}

export function setHtmlLanguage(type: LanguageType) {
  if (isClient) {
    document.documentElement.setAttribute('lang', type.split('-')[0])
  }
}

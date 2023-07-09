import { createI18n } from 'vue-i18n'

import { languages, setHtmlLanguage } from './helper'

import type { LocaleOptions } from 'vexip-ui'
import type { LanguageConfig } from './types'
import type { LanguageType } from './helper'

const baseLanguage = import.meta.env.VITE_BASE_LANGUAGE
const localLanguage = typeof navigator !== 'undefined' ? navigator.language : undefined

export const defaultLanguage = localLanguage
  ? languages.find(l => l === localLanguage) || baseLanguage
  : baseLanguage

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: defaultLanguage,
  fallbackLocale: baseLanguage
})

export const t = i18n.global.t

export const vexipuiLocale = ref<LocaleOptions>({
  locale: defaultLanguage
})

export const initPromise = loadLanguage(defaultLanguage as LanguageType)

export async function loadLanguage(type: LanguageType) {
  if (!languages.includes(type)) return

  let config: LanguageConfig | undefined

  try {
    config = (await import(`./languages/${type}.ts`)).default
  } catch (error) {}

  if (config) {
    i18n.global.setLocaleMessage(type, config)
    vexipuiLocale.value.locale = type
  }
}

export async function setLanguage(type: LanguageType) {
  if (!languages.includes(type)) return

  if (!i18n.global.availableLocales.includes(type)) {
    await loadLanguage(type)
  }

  i18n.global.locale.value = type
  setHtmlLanguage(type)

  return nextTick()
}

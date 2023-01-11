import type { LanguageConfig } from '@/locale/types'

declare module 'vue-i18n' {
  import { DefineLocaleMessage } from 'vue-i18n'

  export interface DefineLocaleMessage extends LanguageConfig {}
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_PATH: string,
  readonly DROP_CONSOLE: boolean,

  readonly PUBLIC_APP_TITLE: string,
  readonly PUBLIC_BASE_LANGUAGE: string,
  readonly PUBLIC_SUPPORT_DARK_MODE: boolean,
  readonly PUBLIC_USE_MOCK: boolean,
  readonly PUBLIC_API_SERVER: string,
  readonly PUBLIC_API_BASE_PATH: string,
  readonly PUBLIC_RESOURCE_SERVER: string,
  readonly PUBLIC_RESOURCE_BASE_PATH: string,
  readonly PUBLIC_OAUTH_LOGIN_URL: string,
  readonly PUBLIC_USE_SETTINGS_DRAWER: boolean,
  readonly PUBLIC_USE_NAV_TAB: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

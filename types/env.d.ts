/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string,
  readonly VITE_BASE_LANGUAGE: string,
  readonly VITE_SUPPORT_DARK_MODE: boolean,
  readonly VITE_USE_MOCK: boolean,
  readonly VITE_BASE_PATH: string,
  readonly VITE_DROP_CONSOLE: boolean,
  readonly VITE_BASE_SERVER: string,
  readonly VITE_RESOURCE_SERVER: string,
  readonly VITE_OAUTH_LOGIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

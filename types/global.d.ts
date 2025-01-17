import { BaseSettings } from './schema'

export interface GlobalConfig {
  readonly apiServer?: string,
  readonly apiBasePath?: string,
  readonly resourceServer?: string,
  readonly resourceBasePath?: string
}

declare global {
  interface Window {
    readonly GLOBAL_CONFIG: GlobalConfig
  }
}

export {}

declare global {
  interface GlobalConfig {
    serverUrls: {
      base: string,
      resource: string
    }
  }

  interface Window {
    GLOBAL_CONFIG: GlobalConfig
  }
}

export {}

export {}

declare module 'axios' {
  interface AxiosRequestConfig {
    expiredTime?: number,
    cache?: boolean,
    buildFormData?: boolean
  }
}

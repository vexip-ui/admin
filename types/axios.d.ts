export {}

declare module 'axios' {
  interface AxiosRequestConfig {
    buildFormData?: boolean
  }
}

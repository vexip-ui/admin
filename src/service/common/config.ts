const isProd = import.meta.env.PROD

export const BASE_SERVER = isProd ? import.meta.env.VITE_BASE_SERVER : '/api'

export const RESOURCE_SERVER = isProd ? import.meta.env.VITE_RESOURCE_SERVER : '/resource'

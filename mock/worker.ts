import { setupWorker } from 'msw/browser'

import type { HttpHandler } from 'msw'

const handlersMap = import.meta.glob(['./**/*.ts', '!./worker.ts', '!./common.ts'], {
  eager: true,
  import: 'handlers'
}) as Record<string, HttpHandler[]>

const worker = setupWorker(...Object.values(handlersMap).flat(1))

export const initPromise = worker.start({ onUnhandledRequest: 'bypass' })

import type { IconMinorProps } from 'vexip-ui'

export {}

declare module 'vue-router' {
  interface RouteMeta extends Record<string, unknown> {
    title?: string | (() => string),
    loaded?: boolean,
    roles?: string[],
    tab?:
    | {
      fixed?: boolean,
      icon?: string | Record<string, any>,
      iconProps?: IconMinorProps,
      iconOnly?: boolean
    }
    | false,
    menu?:
    | {
      single?: boolean,
      order?: number,
      icon?: string | Record<string, any>,
      iconProps?: IconMinorProps,
      disabled?: boolean
    }
    | false
  }
}

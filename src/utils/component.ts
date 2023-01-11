import Svg from '@/components/svg.vue'

export function createIconRenderer(name: string) {
  return () =>
    h(VIcon, null, {
      default: () => h(Svg, { name })
    })
}

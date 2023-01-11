<script setup lang="ts">
import { isClient, callIfFunc } from '@vexip-ui/utils'

const route = useRoute()
const { locale, t } = useI18n()

const baseTitle = import.meta.env.VITE_APP_TITLE || ''

watch(
  [() => route.fullPath, () => locale.value],
  () => {
    if (!isClient) return

    const meta = route.meta || {}
    const title = meta.title ? t(callIfFunc(meta.title)) : ''

    if (title || baseTitle) {
      document.title = title ? baseTitle ? `${title} - ${baseTitle}` : title : baseTitle
    }
  }
)
</script>

<template>
  <router-view></router-view>
</template>

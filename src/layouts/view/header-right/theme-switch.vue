<script setup>
import { useTheme } from '@/hooks/useTheme'

import { Moon } from '@vexip-ui/icons'

const theme = useTheme()
const isDark = computed(() => theme.current.value === 'dark')
const title = computed(() => (isDark.value ? '亮色' : '暗色'))

function toggleTheme() {
  theme.toggle()
}
</script>

<template>
  <VTooltip reverse>
    <template #trigger>
      <div class="theme-switch" @click="toggleTheme">
        <template v-if="isDark">
          <VIcon>
            <Moon></Moon>
          </VIcon>
        </template>
        <template v-else>
          <img class="sun-svg" src="@/assets/svg/sun.svg" alt="sun" />
        </template>
      </div>
    </template>
    {{ title }}
  </VTooltip>
</template>

<style lang="scss" scoped>
.theme-switch {
  cursor: pointer;
}

.sun-svg {
  width: 16px;
}
</style>

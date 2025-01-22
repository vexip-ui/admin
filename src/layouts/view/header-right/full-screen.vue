<script setup lang="ts">
import { Compress, Expand } from '@vexip-ui/icons'

import Screenfull from 'screenfull'

const state = reactive({
  title: '全屏',
  icon: true
})
const { icon } = toRefs(state)

const handleFullScreen = () => {
  if (!Screenfull.isEnabled) {
    return false
  }

  Screenfull.toggle()
  const isFullscreen = Screenfull.isFullscreen
  state.icon = isFullscreen
  state.title = isFullscreen ? '全屏' : '退出'
}
</script>

<template>
  <div class="app-fullscreen relative cursor-pointer" @click="handleFullScreen">
    <VTooltip reverse>
      <template #trigger>
        <template v-if="icon">
          <VIcon>
            <Expand></Expand>
          </VIcon>
        </template>
        <VIcon v-else>
          <Compress></Compress>
        </VIcon>
      </template>
      {{ state.title }}
    </VTooltip>
  </div>
</template>

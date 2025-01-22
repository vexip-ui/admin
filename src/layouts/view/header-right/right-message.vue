<script setup>
import { BellR } from '@vexip-ui/icons'
</script>

<template>
  <div class="right-message relative">
    <VDropdown custom trigger="click">
      <VIcon class="cursor-pointer">
        <BellR></BellR>
      </VIcon>
      <template #drop>
        <VCard title="通知" class="notice-card w-110 mt-2 absolute right--4">
          <div v-for="(item, index) in 3" :key="index" class="message-item">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-full flex justify-center border text-yellow-500 border-solid mr-3"
              >
                <VIcon class="font-size-20px">
                  <BellR></BellR>
                </VIcon>
              </div>
              <div class="flex-1">
                <div class="mb-1">
                  收到了 {{ index + 1 }} 份新消息
                </div>
                <div class="flex justify-between">
                  <div class="text-sm text-gray-400">
                    你有一份新消息需要处理
                  </div>
                  <div class="text-xs text-gray-400">
                    3小时前
                  </div>
                </div>
              </div>
              <div v-if="index !== 0" class="w-2 h-2 rounded-full bg-red-500 mt--22px"></div>
            </div>
          </div>
        </VCard>
      </template>
    </VDropdown>
  </div>
</template>

<style lang="scss" scoped>
.notice-card {
  :deep(.vxp-card__content) {
    padding: 0;
  }
}

.message-item {
  padding: 12px;
  border: var(--vxp-border-light-1);
  border-top: 0;
  border-right: 0;
  border-left: 0;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    cursor: pointer;
    background-color: var(--vxp-fill-color-background);
  }
}
</style>

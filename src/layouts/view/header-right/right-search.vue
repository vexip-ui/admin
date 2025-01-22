<script setup>
import { MagnifyingGlass } from '@vexip-ui/icons'

const searchValue = ref('')

const handleSearch = () => {
  // 这里可以添加搜索逻辑
  console.log('搜索内容:', searchValue.value)
}
</script>

<template>
  <div class="search-container">
    <VInput
      v-model="searchValue"
      placeholder="请输入关键字搜索"
      class="search-input"
      @keyup.enter="handleSearch"
    >
      <template #suffix>
        <VIcon class="search-icon" @click="handleSearch">
          <MagnifyingGlass></MagnifyingGlass>
        </VIcon>
      </template>
    </VInput>
  </div>
</template>

<style lang="scss" scoped>
.search-container {
  display: flex;
  align-items: center;
  border-radius: 50%;

  .search-input {
    width: 200px;
    border-radius: 50px;
    transition: width 0.3s;

    &:focus-within {
      width: 280px;
    }
  }

  .search-icon {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>

<script setup lang="ts"></script>

<template>
  <VRow class="home" :gap="16">
    <VColumn :xl="16" class="home__column">
      <VCard title="标题">
        <div style="height: 320px"></div>
      </VCard>
      <VCard title="标题">
        <div style="height: 500px"></div>
      </VCard>
    </VColumn>
    <VColumn :xl="8" class="home__column">
      <VCard title="标题">
        <div style="height: 240px"></div>
      </VCard>
      <VCard title="标题">
        <div style="height: 240px"></div>
      </VCard>
      <VCard title="标题">
        <div style="height: 240px"></div>
      </VCard>
    </VColumn>
  </VRow>
</template>

<style lang="scss">
.home {
  padding: 16px;

  &__column {
    .vxp-card:not(:first-child) {
      margin-top: 16px;
    }
  }
}
</style>

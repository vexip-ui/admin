<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  areaCount: {
    type: Number,
    default: 1
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'draft'])

const { t } = useI18n()

const providedProps = {
  default: {
    clearable: true
  }
}

function handleSubmit() {
  emit('submit')
}

function handleDraft() {
  emit('draft')
}
</script>

<template>
  <VForm
    class="form-container"
    :model="model"
    :disabled="loading"
    style="margin: 0;"
  >
    <VRow class="form-container__header" align="middle">
      <VColumn flex="0">
        <slot name="title">
          <VH4 style="margin: 0;">
            {{ title }}
          </VH4>
        </slot>
      </VColumn>
      <div style="flex: 1 0 auto;"></div>
      <VColumn flex="0">
        <slot name="actions"></slot>
        <VButton
          type="warning"
          :icon="IFileLinesR"
          :loading="loading"
          @click="handleDraft"
        >
          {{ t('action.draft') }}
        </VButton>
        <VFormSubmit
          type="success"
          :icon="IFloppyDiskR"
          :loading="loading"
          @submit="handleSubmit"
        >
          {{ t('action.save') }}
        </VFormSubmit>
      </VColumn>
    </VRow>
    <VNativeScroll
      scroll-class="form-container__body"
      use-y-bar
      width="100%"
      height="calc(100% - 70px)"
    >
      <VConfigProvider :props="providedProps">
        <VCard
          v-for="index in areaCount"
          :key="index"
          class="form-container__area"
          shadow="never"
        >
          <VRow :gap="[24, 8]" style="padding: 30px 50px 10px 30px;">
            <slot :name="`area${index}`"></slot>
          </VRow>
        </VCard>
      </VConfigProvider>
    </VNativeScroll>
  </VForm>
</template>

<style lang="scss">
.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;

  .vxp-card {
    border: 0;
    box-shadow: 0 0 4px var(--vxp-border-color-light-2);
  }

  &__header {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 70px;
    padding: 4px 32px 0;
    background-color: var(--vxp-bg-color-base);
    box-shadow: 0 2px 6px var(--vxp-shadow-color-light-2);

    .vxp-column {
      white-space: nowrap;
    }
  }

  &__body {
    padding: 16px;
    padding-bottom: 20px;
  }

  &__area {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .vxp-form__label {
      min-width: 100px;
    }
  }
}
</style>

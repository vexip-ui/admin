<script setup lang="ts">
import { noop, transformListToMap } from '@vexip-ui/utils'

import { Table } from 'vexip-ui'

import type { PropType } from 'vue'

interface FilterField<T = any> {
  key: string,
  name: string | (() => string),
  value: T
}

const props = defineProps({
  filterFields: {
    type: Array as PropType<Omit<FilterField, 'value'>[]>,
    default: () => []
  },
  queryEntities: {
    type: Function as PropType<() => Promise<any[]>>,
    default: () => noop
  },
  deleteEntities: {
    type: Function as PropType<(ids: any[] | Set<any>) => Promise<boolean>>,
    default: () => noop
  },
  createPath: {
    type: String,
    default: ''
  },
  editPath: {
    type: String,
    default: ''
  },
  actionsWidth: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['create', 'delete', 'refresh', 'edit'])

const { t } = useI18n()
const router = useRouter()

const providedProps = {
  default: {
    clearable: true
  }
}

const body = ref<HTMLElement | null>(null)
const bodyHeight = ref(500)

const table = ref<InstanceType<typeof Table>>()

const entities = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const selection = ref<any[]>([])

const searchFields = reactive<FilterField[]>(
  props.filterFields.map(field => ({
    ...field,
    value: undefined
  }))
)
const searchModel = ref<Record<string, any>>({})

const activeEntities = computed(() => {
  const model = searchModel.value
  const keys = Object.keys(model)

  return entities.value.filter(entity => {
    for (const key of keys) {
      if (!String(entity[key]).includes(model[key])) {
        return false
      }
    }

    return true
  })
})

watch(
  () => [entities.value, entities.value.length],
  () => {
    nextTick(updateSelection)
  }
)
watch(
  () => props.filterFields,
  value => {
    const map = transformListToMap(searchFields, 'key')
    const prevKeys = new Set(Object.keys(map))

    searchFields.length = 0

    searchFields.push(
      ...value.map(field => ({
        ...field,
        value: prevKeys.has(field.key) ? map[field.key].value : undefined
      }))
    )
  },
  { deep: true }
)

props.queryEntities().then(data => {
  entities.value = data
})

function computeBodyHeight() {
  bodyHeight.value = body.value?.offsetHeight ?? bodyHeight.value
}

function handleSearch() {
  const model: Record<string, any> = {}

  for (const field of searchFields) {
    model[field.key] = field.value
  }

  searchModel.value = model
}

function handleReset() {
  searchModel.value = {}
}

function handleCreate() {
  emit('create')

  if (props.createPath) {
    router.push(props.createPath)
  }
}

async function handleDelete() {
  emit('delete', selection.value)

  const ids = new Set(selection.value.map(entity => entity.id))
  const result = await props.deleteEntities(ids)

  VMessage.judge(
    result,
    t('result.success', [t('action.delete')]),
    t('result.fail', [t('action.delete')])
  )

  if (result) {
    entities.value = entities.value.filter(entity => !ids.has(entity.id))
  }
}

function handleRefresh() {
  emit('refresh')

  props.queryEntities().then(data => {
    entities.value = data
  })

  VMessage.success(t('result.success', [t('action.refresh')]))
}

function handleEdit(entity: any) {
  emit('edit', entity)

  if (props.editPath) {
    router.push(props.editPath.replace('{id}', entity.id))
  }
}

function updateSelection() {
  selection.value = table.value?.getSelected() ?? []
}
</script>

<template>
  <div class="list-container">
    <VConfigProvider :props="providedProps">
      <VCard>
        <VRow class="list-container__header" column-flex align="middle">
          <VColumn flex="0">
            <VButton type="primary" :icon="IPlus" @click="handleCreate">
              {{ t('action.create') }}
            </VButton>
            <VButton
              type="error"
              :icon="ITrashCanR"
              :disabled="selection.length <= 0"
              @click="handleDelete"
            >
              {{ t('action.delete') }}
            </VButton>
            <VButton type="warning" :icon="IArrowsRotate" @click="handleRefresh">
              {{ t('action.refresh') }}
            </VButton>
            <slot name="actions"></slot>
          </VColumn>
          <div style="flex: 1 0 auto"></div>
          <VColumn flex="0">
            <VSpace
              v-if="searchFields.length"
              no-wrap
              align="center"
              item-style="white-space: nowrap;"
            >
              <template v-for="field in searchFields" :key="field.key">
                {{ typeof field.name === 'function' ? field.name() : field.name }}
                <VInput v-model:value="field.value"></VInput>
              </template>
              <VButton type="primary" :icon="IMagnifyingGlass" @click="handleSearch">
                {{ t('action.search') }}
              </VButton>
              <VButton :icon="IArrowRotateRight" @click="handleReset">
                {{ t('action.reset') }}
              </VButton>
            </VSpace>
          </VColumn>
        </VRow>
        <VResizeObserver @resize="computeBodyHeight">
          <div ref="body" class="list-container__body">
            <VTable
              ref="table"
              highlight
              use-y-bar
              :data="activeEntities"
              :height="bodyHeight"
              :current-page="currentPage"
              :page-size="pageSize"
              :row-height="45"
              @row-check="updateSelection"
              @row-check-all="updateSelection"
            >
              <VTableColumn id-key="selection" type="selection"></VTableColumn>
              <VTableColumn id-key="order" type="order" :name="t('field.order')"></VTableColumn>
              <slot name="columns"></slot>
              <VTableColumn
                id-key="action"
                :name="t('field.action')"
                fixed="right"
                :width="actionsWidth"
                no-ellipsis
                style="justify-content: center"
              >
                <template #default="{ row }">
                  <VLinker type="primary" :icon="IPenToSquareR" @click="handleEdit(row)">
                    {{ t('action.edit') }}
                  </VLinker>
                  <slot name="row-actions" :entity="row"></slot>
                </template>
              </VTableColumn>
            </VTable>
          </div>
        </VResizeObserver>
        <div class="list-container__footer">
          <VPagination
            v-model:active="currentPage"
            v-model:page-size="pageSize"
            size="small"
            :total="entities.length"
            :plugins="['total', , 'size', 'jump']"
          ></VPagination>
        </div>
      </VCard>
    </VConfigProvider>
  </div>
</template>

<style lang="scss">
.list-container {
  height: 100%;
  padding: 16px;
  padding-bottom: 20px;

  .vxp-card {
    border: 0;
    box-shadow: 0 0 4px var(--vxp-border-color-light-2);

    &,
    &__content {
      height: 100%;
    }
  }

  &__header {
    height: 60px;
    padding-bottom: 16px;
  }

  &__body {
    height: calc(100% - 120px);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    padding-top: 16px;
  }
}
</style>

<script setup lang="ts">
import { format } from '@vexip-ui/utils'

import type { TableColumnProps } from 'vexip-ui'
import type { Dateable } from '@vexip-ui/utils'

const props = withDefaults(defineProps<TableColumnProps>(), {
  width: 200,
  formatter: (value: Dateable) => format(value, 'yyyy-MM-dd')
})
</script>

<template>
  <VTableColumn v-bind="props"></VTableColumn>
</template>

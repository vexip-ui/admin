<script setup lang="ts">
import { useFieldStore } from 'vexip-ui'
import { createEditor, createToolbar } from '@wangeditor/editor'
import { isDefined } from '@vexip-ui/utils'

import type { PropType } from 'vue'
import type { ComponentState } from 'vexip-ui'
import type { IDomEditor, IEditorConfig, IToolbarConfig, SlateDescendant } from '@wangeditor/editor'

const {
  idFor,
  state: formState,
  disabled: formDisabled,
  loading: formLoading,
  validateField,
  getFieldValue,
  setFieldValue
} = useFieldStore<string>(handleFocus)

const props = defineProps({
  mode: {
    type: String as PropType<'default' | 'simple'>,
    default: 'default'
  },
  defaultContent: {
    type: Array as PropType<SlateDescendant[]>,
    default: () => []
  },
  defaultHtml: {
    type: String,
    default: ''
  },
  toolbarConfig: {
    type: Object as PropType<Partial<IToolbarConfig>>,
    default: () => ({})
  },
  editConfig: {
    type: Object as PropType<
      Partial<
        Omit<
          IEditorConfig,
          | 'onCreated'
          | 'onChange'
          | 'onDestroyed'
          | 'onMaxLength'
          | 'onFocus'
          | 'onBlur'
          | 'customAlert'
          | 'customPaste'
        >
      >
    >,
    default: () => ({})
  },
  modelValue: {
    type: String,
    default: null
  },
  state: {
    type: String as PropType<ComponentState>,
    default: null
  },
  disabled: {
    type: Boolean,
    default: null
  },
  loading: {
    type: Boolean,
    default: null
  }
})

const emit = defineEmits([
  'created',
  'destroyed',
  'max-length',
  'focus',
  'blur',
  'custom-alert',
  'custom-paste',
  'change',
  'update:modelValue'
])

const prefix = 'rich-editor'

const toolbarEl = ref<HTMLElement>() // 编辑器容器
const editorEl = ref<HTMLElement>() // 编辑器容器
const editorRef = shallowRef<IDomEditor>() // editor 实例，必须用 shallowRef
const currentValue = ref('') // 记录 editor 当前 html 内容

const state = computed(() => (isDefined(props.state) ? props.state : formState.value))
const disabled = computed(() => (isDefined(props.disabled) ? props.disabled : formDisabled.value))
const loading = computed(() => (isDefined(props.loading) ? props.loading : formLoading.value))

const className = computed(() => {
  return {
    [prefix]: true,
    [`${prefix}--${state}`]: state.value !== 'default',
    [`${prefix}--disabled`]: disabled.value,
    [`${prefix}--loading`]: loading.value
  }
})

watch(
  () => props.modelValue,
  value => {
    if (value === currentValue.value) return

    setHtml(value)
  }
)
watch(
  () => getFieldValue(''),
  value => {
    if (isDefined(props.modelValue) || value === currentValue.value) return

    setHtml(value)
  }
)

watchEffect(initToolbar)

onMounted(() => {
  initEditor()
  requestAnimationFrame(() => {
    watch(
      disabled,
      value => {
        if (editorRef.value) {
          value ? editorRef.value.disable() : editorRef.value.enable()
        }
      },
      { immediate: true }
    )
  })
})

/**
 * 设置 HTML
 * @param newHtml new html
 */
function setHtml(newHtml: string) {
  if (!editorRef.value) return

  editorRef.value.setHtml(newHtml)
}

function initToolbar() {
  if (!toolbarEl.value || !editorRef.value) return

  createToolbar({
    editor: editorRef.value,
    selector: toolbarEl.value,
    mode: props.mode,
    config: toRaw(props.toolbarConfig)
  })
}

function initEditor() {
  if (!editorEl.value) return

  // 获取原始数据，解除响应式特性
  const defaultContent = toRaw(props.defaultContent)

  createEditor({
    selector: editorEl.value,
    mode: props.mode,
    content: defaultContent || [],
    html: props.defaultHtml || props.modelValue || '',
    config: {
      ...toRaw(props.editConfig),
      onCreated(editor) {
        editorRef.value = editor

        emit('created', editor)
      },
      onChange(editor) {
        const editorHtml = editor.getHtml()

        currentValue.value = editorHtml

        setFieldValue(editorHtml)
        emit('update:modelValue', editorHtml)
        validateField()

        emit('change', editor)
      },
      onDestroyed(editor) {
        emit('destroyed', editor)
      },
      onMaxLength(editor) {
        emit('max-length', editor)
      },
      onFocus(editor) {
        emit('focus', editor)
      },
      onBlur(editor) {
        emit('blur', editor)
      },
      customAlert(info, type) {
        emit('custom-alert', info, type)
      },
      customPaste: (editor, event): any => {
        let res

        emit('custom-paste', editor, event, (val: boolean) => {
          res = val
        })

        return res
      }
    }
  })
}

function handleFocus() {
  editorRef.value?.focus()
}
</script>

<template>
  <div :id="idFor" :class="className">
    <div ref="toolbarEl" :class="`${prefix}__toolbar`"></div>
    <div ref="editorEl" :class="`${prefix}__editor`"></div>
  </div>
</template>

<style lang="scss">
@use '@wangeditor/editor/dist/css/style.css';

.rich-editor {
  width: 100%;
  overflow: hidden;
  border: var(--vxp-border-base);
  border-radius: var(--vxp-radius-base);

  &__toolbar {
    border-bottom: var(--vxp-border-base);
  }

  &__editor {
    min-height: 360px;
    overflow-y: hidden;
    color: var(--vxp-content-color-base);
    background-color: var(--vxp-fill-color-base);
    transition: var(--vxp-transition-color), var(--vxp-transition-background);

    .w-e-text-container {
      color: inherit;
      background-color: transparent;
    }
  }

  &--disabled &__editor {
    color: var(--vxp-content-color-disabled);
    cursor: not-allowed;
    user-select: none;
    background-color: var(--vxp-fill-color-humble);
  }
}
</style>

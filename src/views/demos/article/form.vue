<script setup lang="ts">
import { uploadUrl } from '@/service/common'
import { createArticle, getArticleById, updateArticle } from '@/service/article'
import { createUploadSuccess } from '@/utils/transform'

import type { Article } from '@/service/article'

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
// const router = useRouter()

const model = reactive({}) as Article
const loading = ref(false)

if (props.id) {
  getArticleById(props.id).then(data => {
    if (data) {
      Object.assign(model, data)
    }
  })
}

const handleUploadSuccess = createUploadSuccess()

async function handleSubmit() {
  loading.value = true

  let result: Article | null = null

  if (props.id) {
    result = await updateArticle(model)
  } else {
    result = await createArticle(model)
  }

  VMessage.judge(
    !!result,
    t('result.success', [t('action.save')]),
    t('result.fail', [t('action.save')])
  )

  loading.value = false
}
</script>

<template>
  <FormContainer
    :model="model"
    :title="t('demos.article.viewTitle')"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #area1>
      <VFormItem :label="t('demos.article.title')" prop="title" required>
        <VInput></VInput>
      </VFormItem>
      <VFormItem
        :label="t('demos.article.author')"
        prop="author"
        required
        :span="12"
      >
        <VInput></VInput>
      </VFormItem>
      <VFormItem
        :label="t('demos.article.date')"
        prop="date"
        required
        :span="12"
      >
        <VDatePicker :no-filler="!!id"></VDatePicker>
      </VFormItem>
      <VFormItem :label="t('demos.article.summary')" prop="summary" required>
        <VTextarea :rows="2" :max-length="120"></VTextarea>
      </VFormItem>
      <VFormItem :label="t('demos.article.cover')" prop="cover">
        <VUpload
          :url="uploadUrl"
          allow-drag
          image
          :count-limit="1"
          @success="handleUploadSuccess"
        ></VUpload>
      </VFormItem>
      <VFormItem :label="t('demos.article.content')" prop="content" required>
        <RichEditor></RichEditor>
      </VFormItem>
    </template>
  </FormContainer>
</template>

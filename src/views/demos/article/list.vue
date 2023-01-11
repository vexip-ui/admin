<script setup lang="ts">
import { getArticles, deleteArticles } from '@/service/article'

const { t } = useI18n()

const filterFields = reactive([
  {
    key: 'title',
    name: () => t('demos.article.viewTitle')
  }
])
</script>

<template>
  <ListContainer
    :filter-fields="filterFields"
    :query-entities="getArticles"
    :delete-entities="deleteArticles"
    create-path="./create"
    edit-path="./edit/{id}"
    :actions-width="100"
  >
    <template #columns>
      <VTableColumn id-key="date" :name="t('demos.article.date')" :width="200"></VTableColumn>
      <VTableColumn id-key="author" :name="t('demos.article.author')" :width="100"></VTableColumn>
      <VTableColumn id-key="title" :name="t('demos.article.title')"></VTableColumn>
    </template>
  </ListContainer>
</template>

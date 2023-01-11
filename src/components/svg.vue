<script setup lang="ts">
defineProps({
  name: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <svg aria-hidden="true">
    <use v-if="name" :href="`#${name}`" />
  </svg>
</template>

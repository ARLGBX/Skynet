<script setup>
import { useHome } from '../composables/useHome.js'

const { notifications } = useHome()
</script>

<template>
  <div class="notifications">
    <article
      v-for="notice in notifications"
      :key="notice.id"
      class="notice"
      :class="notice.type"
    >
      {{ notice.text }}
    </article>
  </div>
</template>

<script setup>
import { useHome } from '../composables/useHome.js'

const { history } = useHome()
</script>

<template>
  <section class="panel history-panel">
    <h2>История действий</h2>
    <ul>
      <li v-for="entry in history" :key="`${entry.at}-${entry.text}`">
        <span>{{ entry.at }}</span>
        <p>{{ entry.text }}</p>
      </li>
      <li v-if="!history.length">Действий пока нет</li>
    </ul>
  </section>
</template>

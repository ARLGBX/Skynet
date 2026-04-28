<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const { history } = useHome()

const panelEl = ref(null)

onMounted(() => {
  if (!panelEl.value) return
  const items = panelEl.value.querySelectorAll('li')
  gsap.fromTo(panelEl.value,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
  )
  if (items.length) {
    gsap.fromTo(items,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.15 },
    )
  }
})
</script>

<template>
  <section ref="panelEl" class="panel history-panel">
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

<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const { settings, saveUserSettings, resetHome } = useHome()

const panelEl = ref(null)

onMounted(() => {
  if (!panelEl.value) return
  const rows = panelEl.value.querySelectorAll('.settings-grid label')
  gsap.fromTo(panelEl.value,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
  )
  if (rows.length) {
    gsap.fromTo(rows,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out', delay: 0.12 },
    )
  }
})
</script>

<template>
  <section ref="panelEl" class="panel settings-view">
    <h2>Настройки</h2>

    <div class="settings-grid">
      <label>
        <input v-model="settings.notificationsEnabled" type="checkbox" />
        Уведомления
      </label>
      <label>
        <input v-model="settings.compactView" type="checkbox" />
        Компактный вид
      </label>
      <label>
        Цвет акцента
        <input v-model="settings.accentColor" type="color" />
      </label>
      <label>
        Тема
        <select v-model="settings.theme">
          <option value="light">☀️ Светлая</option>
          <option value="dark">🌙 Тёмная</option>
          <option value="medium">🌥 Средняя</option>
        </select>
      </label>
    </div>

    <div class="settings-actions">
      <button @click="saveUserSettings">Сохранить</button>
      <button class="secondary" @click="resetHome">Сбросить дом</button>
    </div>
  </section>
</template>

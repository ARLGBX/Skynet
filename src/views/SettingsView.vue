<script setup>
import { useHome } from '../composables/useHome.js'

const { settings, saveUserSettings, resetHome } = useHome()
</script>

<template>
  <section class="panel settings-view">
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

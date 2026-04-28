<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer panel" style="border-radius: var(--radius-lg)">
    <p>⚡ Skynet Smart Home &copy; {{ year }}</p>
    <nav>
      <router-link to="/">Дом</router-link>
      <router-link to="/history">История</router-link>
      <router-link to="/settings">Настройки</router-link>
    </nav>
  </footer>
</template>

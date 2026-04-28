<script setup>
// 404 — shown when no route matches (/:pathMatch(.*)*).
// Header and Footer are visible here too (rendered by App.vue layout).
</script>

<template>
  <div class="not-found panel">
    <span class="not-found-emoji">🏚</span>
    <h1>404 — Страница не найдена</h1>
    <p>Такой страницы не существует в вашем умном доме.</p>
    <router-link to="/" class="home-btn">← На главную</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 60vh;
  text-align: center;
}

.not-found-emoji {
  font-size: 5rem;
}

.home-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 1.5rem;
  background: var(--accent, #4f7cff);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.home-btn:hover { opacity: 0.85; }
</style>

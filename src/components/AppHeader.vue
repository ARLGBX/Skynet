<script setup>
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const {
  currentUser, isSaving, isFirebaseConfigured,
  authMode, email, password,
  login, register, logout,
} = useHome()

const headerEl = ref(null)

onMounted(() => {
  if (headerEl.value) {
    gsap.fromTo(headerEl.value,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
    )
  }
})
</script>

<template>
  <header ref="headerEl" class="panel app-header">
    <div class="header-left">
      <router-link to="/" class="brand">🏠 Умный дом</router-link>
      <p class="account-info">
        {{ currentUser?.email ?? 'Гостевой режим' }}
        <span v-if="isSaving"> • синхронизация…</span>
      </p>
    </div>

    <nav class="main-nav">
      <router-link to="/">🗺 Дом</router-link>
      <router-link to="/history">📋 История</router-link>
      <router-link to="/settings">⚙️ Настройки</router-link>
    </nav>

    <div class="auth-box" v-if="isFirebaseConfigured">
      <template v-if="currentUser">
        <button class="secondary" @click="logout">Выйти</button>
      </template>
      <template v-else>
        <input v-model="email"    type="email"    placeholder="Email" />
        <input v-model="password" type="password" placeholder="Пароль" />
        <button @click="authMode === 'login' ? login() : register()">
          {{ authMode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
        <button class="secondary" @click="authMode = authMode === 'login' ? 'register' : 'login'">
          {{ authMode === 'login' ? 'Нет аккаунта?' : 'Есть аккаунт?' }}
        </button>
      </template>
    </div>
  </header>
</template>

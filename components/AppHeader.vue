<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHome } from '../composables/useHome.js'

const {
  currentUser, isSaving, isFirebaseConfigured,
  authMode, email, password,
  login, register, logout,
} = useHome()

const router = useRouter()
const menuOpen = ref(false)

const closeMenu = () => { menuOpen.value = false }

const navTo = (path) => {
  router.push(path)
  closeMenu()
}
</script>

<template>
  <header class="panel app-header">
    <!-- Left: brand -->
    <div class="header-left">
      <router-link to="/" class="brand">
        <span class="brand-icon">⚡</span>
        Skynet
      </router-link>
      <p class="account-info">
        {{ currentUser?.email ?? 'Гостевой режим' }}
        <span v-if="isSaving"> · синхр…</span>
      </p>
    </div>

    <!-- Desktop nav -->
    <nav class="main-nav">
      <router-link to="/">Дом</router-link>
      <router-link to="/history">История</router-link>
      <router-link to="/settings">Настройки</router-link>
    </nav>

    <!-- Desktop auth -->
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

    <!-- Burger button (mobile) -->
    <button
      class="burger-btn"
      :class="{ 'is-open': menuOpen }"
      @click="menuOpen = !menuOpen"
      aria-label="Меню"
    >
      <span class="burger-line"></span>
      <span class="burger-line"></span>
      <span class="burger-line"></span>
    </button>
  </header>

  <!-- Mobile fullscreen menu -->
  <div class="mobile-menu" :class="{ 'is-open': menuOpen }" @click.self="closeMenu">
    <button class="mobile-close" @click="closeMenu">✕</button>

    <a @click="navTo('/')" class="router-link-exact-active" style="cursor:pointer">Дом</a>
    <a @click="navTo('/history')" style="cursor:pointer">История</a>
    <a @click="navTo('/settings')" style="cursor:pointer">Настройки</a>

    <div class="mobile-auth" v-if="isFirebaseConfigured">
      <template v-if="currentUser">
        <button @click="logout(); closeMenu()">Выйти</button>
      </template>
      <template v-else>
        <input v-model="email"    type="email"    placeholder="Email" />
        <input v-model="password" type="password" placeholder="Пароль" />
        <button @click="authMode === 'login' ? login() : register()">
          {{ authMode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </template>
    </div>

    <p v-if="!isFirebaseConfigured" style="color:var(--muted);font-size:0.8rem;margin-top:1rem">
      {{ currentUser?.email ?? 'Гостевой режим' }}
    </p>
  </div>
</template>

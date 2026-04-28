<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const {
  currentUser, isSaving, isFirebaseConfigured,
  authMode, email, password,
  login, register, logout,
} = useHome()

const router    = useRouter()
const headerEl  = ref(null)
const mobileNav = ref(null)
const menuOpen  = ref(false)

// ─── Header entrance ──────────────────────────────────────────────────────────
onMounted(() => {
  if (headerEl.value) {
    gsap.fromTo(headerEl.value,
      { y: -32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    )
  }
})

// ─── Burger open ──────────────────────────────────────────────────────────────
const openMenu = () => {
  menuOpen.value = true
  const el = mobileNav.value
  gsap.set(el, { display: 'flex', height: 0, opacity: 0 })
  gsap.to(el, { height: 'auto', opacity: 1, duration: 0.32, ease: 'power3.out' })
  const links = el.querySelectorAll('a')
  if (links.length) {
    gsap.fromTo(links,
      { x: -18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.26, stagger: 0.06, ease: 'power2.out', delay: 0.1 },
    )
  }
}

// ─── Burger close ─────────────────────────────────────────────────────────────
const closeMenu = () => {
  if (!menuOpen.value) return
  gsap.to(mobileNav.value, {
    height: 0,
    opacity: 0,
    duration: 0.22,
    ease: 'power2.in',
    onComplete: () => {
      menuOpen.value = false
      gsap.set(mobileNav.value, { display: 'none', clearProps: 'height,opacity' })
    },
  })
}

const toggleMenu = () => (menuOpen.value ? closeMenu() : openMenu())

// Close on route change
const stopRouteWatcher = router.afterEach(() => closeMenu())
onUnmounted(() => stopRouteWatcher())
</script>

<template>
  <header ref="headerEl" class="app-header panel">
    <div class="header-inner">
      <!-- Brand -->
      <div class="header-left">
        <router-link to="/" class="brand">
          <span>🏠</span>
          <span>Умный дом</span>
        </router-link>
        <p class="account-info">
          <span v-if="isSaving" class="saving-dot"></span>
          {{ currentUser?.email ?? 'Гостевой режим' }}
        </p>
      </div>

      <!-- Desktop nav -->
      <nav class="desktop-nav">
        <router-link to="/">🗺 Дом</router-link>
        <router-link to="/history">📋 История</router-link>
        <router-link to="/settings">⚙️ Настройки</router-link>
      </nav>

      <!-- Desktop auth + burger -->
      <div class="header-right">
        <div class="auth-box" v-if="isFirebaseConfigured && currentUser">
          <button class="secondary" @click="logout">Выйти</button>
        </div>

        <button class="burger-btn" @click="toggleMenu" :aria-label="menuOpen ? 'Закрыть меню' : 'Открыть меню'">
          <span class="burger-icon" :class="{ 'is-open': menuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile nav (controlled by GSAP) -->
    <nav ref="mobileNav" class="mobile-nav">
      <router-link to="/">🗺 Дом</router-link>
      <router-link to="/history">📋 История</router-link>
      <router-link to="/settings">⚙️ Настройки</router-link>

      <div v-if="isFirebaseConfigured" class="mobile-auth">
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
    </nav>
  </header>
</template>

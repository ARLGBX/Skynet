<script setup>
import { onMounted } from 'vue'
import AppHeader        from './components/AppHeader.vue'
import AppFooter        from './components/AppFooter.vue'
import AppLoader        from './components/AppLoader.vue'
import NotificationList from './components/NotificationList.vue'
import { useHome, initAuth } from './composables/useHome.js'

const { settings, isFirebaseConfigured, pushNotification } = useHome()

onMounted(() => {
  // Initialize Firebase auth (or fall back to localStorage guest mode)
  initAuth()
  if (!isFirebaseConfigured) {
    pushNotification('Firebase не настроен: работаем в гостевом режиме.', 'warning')
  }
})
</script>

<template>
  <!-- AppLoader overlays everything and blocks clicks during route transitions -->
  <AppLoader />

  <div :style="{ '--accent': settings.accentColor }" :class="['layout', { compact: settings.compactView }]">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>

  <NotificationList />
</template>

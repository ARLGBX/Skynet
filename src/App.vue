<script setup>
import { onMounted } from 'vue'
import AppHeader        from './components/AppHeader.vue'
import NotificationList from './components/NotificationList.vue'
import { useHome, initAuth } from './composables/useHome.js'

const { settings, isFirebaseConfigured, pushNotification } = useHome()

onMounted(() => {
  initAuth()
  if (!isFirebaseConfigured) {
    pushNotification('Firebase не настроен: работаем в гостевом режиме.', 'warning')
  }
})
</script>

<template>
  <div :style="{ '--accent': settings.accentColor }" :class="['layout', { compact: settings.compactView }]">
    <AppHeader />
    <router-view />
  </div>
  <NotificationList />
</template>

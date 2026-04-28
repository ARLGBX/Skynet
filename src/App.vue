<script setup>
import { onMounted } from 'vue'
import { gsap } from 'gsap'
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

const onPageEnter = (el, done) => {
  gsap.fromTo(el,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', onComplete: done },
  )
}

const onPageLeave = (el, done) => {
  gsap.to(el, { opacity: 0, y: -10, duration: 0.18, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <div :style="{ '--accent': settings.accentColor }" :class="['layout', { compact: settings.compactView }]">
    <AppHeader />
    <router-view v-slot="{ Component }">
      <Transition :css="false" mode="out-in" @enter="onPageEnter" @leave="onPageLeave">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
  <NotificationList />
</template>

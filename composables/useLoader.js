// ─── useLoader.js ─────────────────────────────────────────────────────────────
// Singleton loader state — shared across all pages and router guards.
// Used by: router/index.js (beforeEach / afterEach) + AppLoader.vue

import { ref } from 'vue'

// Module-level state (singleton)
const isLoading = ref(false)

let hideTimer = null

export function useLoader() {
  // Show the loader overlay (called in router.beforeEach)
  const showLoader = () => {
    clearTimeout(hideTimer)
    isLoading.value = true
  }

  // Hide the loader overlay with a small delay (called in router.afterEach)
  const hideLoader = (delay = 350) => {
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      isLoading.value = false
    }, delay)
  }

  return { isLoading, showLoader, hideLoader }
}

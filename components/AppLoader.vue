<script setup>
import { useLoader } from '../composables/useLoader.js'

const { isLoading } = useLoader()
</script>

<template>
  <!-- Fullscreen overlay — blocks clicks while route is loading -->
  <Transition name="loader-fade">
    <div v-if="isLoading" class="loader-overlay" aria-label="Загрузка…">
      <div class="loader-spinner"></div>
    </div>
  </Transition>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  pointer-events: all; /* blocks all clicks */
}

.loader-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--accent, #4f7cff);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>

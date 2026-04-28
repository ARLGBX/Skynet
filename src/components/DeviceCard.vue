<script setup>
import { ref, watch } from 'vue'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const props = defineProps({ device: Object, roomId: String })
const emit  = defineEmits(['toggle', 'update-param'])

const { parameterMeta, getDeviceIcon, deleteDevice } = useHome()

const cardEl = ref(null)

watch(() => props.device.on, (isOn) => {
  if (!cardEl.value) return
  if (isOn) {
    gsap.fromTo(cardEl.value,
      { scale: 0.97 },
      { scale: 1, duration: 0.32, ease: 'back.out(2.5)', clearProps: 'transform' },
    )
  } else {
    gsap.fromTo(cardEl.value,
      { scale: 1.03 },
      { scale: 1, duration: 0.24, ease: 'power2.out', clearProps: 'transform' },
    )
  }
}, { immediate: false })
</script>

<template>
  <article ref="cardEl" class="device-card" :class="{ on: device.on }">
    <div class="device-header">
      <div class="device-name-row">
        <span class="device-icon-badge">{{ getDeviceIcon(device) }}</span>
        <span class="device-name">{{ device.name }}</span>
      </div>

      <div class="device-actions">
        <label class="toggle-switch">
          <input :checked="device.on" type="checkbox" @change="emit('toggle', device)" />
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-label">{{ device.on ? 'Вкл' : 'Выкл' }}</span>
        </label>

        <button
          class="icon-btn danger"
          @click="deleteDevice(roomId, device.id)"
          title="Удалить устройство"
        >✕</button>
      </div>
    </div>

    <div v-if="Object.keys(device.params).length" class="params">
      <label v-for="(value, key) in device.params" :key="key">
        <div class="param-header">
          <span>{{ parameterMeta[key]?.label ?? key }}</span>
          <span class="param-val">{{ value }}{{ parameterMeta[key]?.unit ?? '' }}</span>
        </div>
        <input
          type="range"
          :min="parameterMeta[key]?.min ?? 0"
          :max="parameterMeta[key]?.max ?? 100"
          :value="value"
          @input="emit('update-param', device, key, $event.target.value)"
        />
      </label>
    </div>
  </article>
</template>

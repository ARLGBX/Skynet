<script setup>
import { ref, watch } from 'vue'
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const props = defineProps({ device: Object, roomId: String })
const emit = defineEmits(['toggle', 'update-param'])

const { parameterMeta, getDeviceIcon, deleteDevice } = useHome()

const cardEl = ref(null)

watch(() => props.device.on, (isOn) => {
  if (!cardEl.value) return
  if (isOn) {
    gsap.fromTo(cardEl.value,
      { scale: 0.96 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)', clearProps: 'transform' },
    )
  } else {
    gsap.fromTo(cardEl.value,
      { scale: 1.03 },
      { scale: 1, duration: 0.25, ease: 'power2.out', clearProps: 'transform' },
    )
  }
}, { immediate: false })
</script>

<template>
  <article ref="cardEl" class="device-card" :class="{ on: device.on }">
    <div class="device-header">
      <strong>{{ getDeviceIcon(device) }} {{ device.name }}</strong>
      <div class="device-actions">
        <label class="toggle">
          <input :checked="device.on" type="checkbox" @change="emit('toggle', device)" />
          <span>{{ device.on ? 'Вкл' : 'Выкл' }}</span>
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
        {{ parameterMeta[key]?.label ?? key }}: {{ value }}{{ parameterMeta[key]?.unit ?? '' }}
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

<script setup>
import { useHome } from '../composables/useHome.js'

defineProps({ device: Object, roomId: String })
const emit = defineEmits(['toggle', 'update-param'])

const { parameterMeta, getDeviceIcon, deleteDevice } = useHome()
</script>

<template>
  <article class="device-card" :class="{ on: device.on }">
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

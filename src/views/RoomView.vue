<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import DeviceCard from '../components/DeviceCard.vue'
import { useHome } from '../composables/useHome.js'

const route = useRoute()
const router = useRouter()

const {
  rooms, history, authReady,
  toggleDevice, updateDeviceParam,
  addDevice, deleteDevice,
  DEVICE_TYPES,
} = useHome()

const room = computed(() => rooms.value.find((r) => r.id === route.params.id))

// Redirect to dashboard if the room was deleted or the ID is invalid
watch(
  [() => route.params.id, rooms, authReady],
  () => {
    if (authReady.value && rooms.value.length > 0 && !room.value) {
      router.replace({ name: 'dashboard' })
    }
  },
)

// ─── Add device form ──────────────────────────────────────────────────────────
const showAddDevice  = ref(false)
const newDeviceName  = ref('')
const newDeviceType  = ref('light')

const submitAddDevice = () => {
  if (!newDeviceName.value.trim() || !room.value) return
  addDevice(room.value.id, newDeviceName.value, newDeviceType.value)
  newDeviceName.value = ''
  newDeviceType.value = 'light'
  showAddDevice.value = false
}

const cancelAddDevice = () => {
  newDeviceName.value = ''
  newDeviceType.value = 'light'
  showAddDevice.value = false
}

onMounted(() => {
  gsap.fromTo('.device-card', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.07 })
})
</script>

<template>
  <div v-if="room" class="view-stack">

    <!-- Room header ─────────────────────────────────────────────────────────── -->
    <header class="panel room-header">
      <button class="back-btn" @click="router.back()">‹ Назад</button>
      <h1>{{ room.icon }} {{ room.name }}</h1>
      <span class="room-stat">{{ room.devices.filter(d => d.on).length }} активно</span>
    </header>

    <!-- Devices ─────────────────────────────────────────────────────────────── -->
    <section class="panel devices-panel">
      <div class="section-header">
        <h2>Устройства в «{{ room.name }}»</h2>
        <button @click="showAddDevice = !showAddDevice">+ Устройство</button>
      </div>

      <!-- Add device form -->
      <div v-if="showAddDevice" class="add-form">
        <input
          v-model="newDeviceName"
          placeholder="Название устройства"
          maxlength="40"
          @keyup.enter="submitAddDevice"
        />
        <select v-model="newDeviceType">
          <option v-for="t in DEVICE_TYPES" :key="t.value" :value="t.value">
            {{ t.icon }} {{ t.label }}
          </option>
        </select>
        <div class="form-actions">
          <button @click="submitAddDevice">Добавить</button>
          <button class="secondary" @click="cancelAddDevice">Отмена</button>
        </div>
      </div>

      <p v-if="!room.devices.length" class="empty-state">
        Нет устройств. Нажмите «+ Устройство» чтобы добавить первое.
      </p>

      <div class="device-list">
        <DeviceCard
          v-for="device in room.devices"
          :key="device.id"
          :device="device"
          :room-id="room.id"
          @toggle="toggleDevice"
          @update-param="updateDeviceParam"
        />
      </div>
    </section>

    <!-- History ─────────────────────────────────────────────────────────────── -->
    <section class="panel history-panel">
      <h2>Последние действия</h2>
      <ul>
        <li v-for="entry in history.slice(0, 10)" :key="`${entry.at}-${entry.text}`">
          <span>{{ entry.at }}</span>
          <p>{{ entry.text }}</p>
        </li>
        <li v-if="!history.length">Действий пока нет</li>
      </ul>
    </section>

  </div>
</template>

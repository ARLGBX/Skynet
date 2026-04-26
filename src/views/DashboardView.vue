<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import FloorPlan from '../components/FloorPlan.vue'
import { useHome } from '../composables/useHome.js'

const {
  rooms, allDevices, activeDevicesCount, averageTemperature, averageBrightness,
  history, scenario, applyScenario,
  addRoom, deleteRoom,
  ROOM_ICONS,
} = useHome()

// ─── Add room form ─────────────────────────────────────────────────────────────
const showAddRoom  = ref(false)
const newRoomName  = ref('')
const newRoomIcon  = ref('🛋')

const submitAddRoom = () => {
  if (!newRoomName.value.trim()) return
  addRoom(newRoomName.value, newRoomIcon.value)
  newRoomName.value = ''
  newRoomIcon.value = '🛋'
  showAddRoom.value = false
}

const cancelAddRoom = () => {
  newRoomName.value = ''
  newRoomIcon.value = '🛋'
  showAddRoom.value = false
}

onMounted(() => {
  gsap.fromTo('.panel', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 })
})
</script>

<template>
  <div class="view-stack">

    <!-- Status grid ─────────────────────────────────────────────────────────── -->
    <section class="panel status-grid">
      <article>
        <h2>Состояние дома</h2>
        <p>Комнат: {{ rooms.length }}</p>
        <p>Активных устройств: {{ activeDevicesCount }} / {{ allDevices.length }}</p>
        <p>Средняя температура: {{ averageTemperature }}°C</p>
        <p>Средняя яркость: {{ averageBrightness }}%</p>
      </article>

      <article>
        <h2>Сценарии</h2>
        <div class="scenario-buttons">
          <button
            v-for="mode in ['Ночь', 'Утро', 'Никого дома']"
            :key="mode"
            class="scenario-button"
            :class="{ active: scenario === mode }"
            @click="applyScenario(mode)"
          >{{ mode }}</button>
        </div>
      </article>
    </section>

    <!-- Floor plan ───────────────────────────────────────────────────────────── -->
    <section class="panel floor-plan-section">
      <div class="section-header">
        <h2>Схема дома — нажмите на комнату</h2>
        <button @click="showAddRoom = !showAddRoom">+ Комната</button>
      </div>

      <!-- Add room form -->
      <div v-if="showAddRoom" class="add-form">
        <input
          v-model="newRoomName"
          placeholder="Название комнаты"
          maxlength="30"
          @keyup.enter="submitAddRoom"
        />
        <div class="icon-picker">
          <button
            v-for="icon in ROOM_ICONS"
            :key="icon"
            class="icon-pick-btn"
            :class="{ selected: newRoomIcon === icon }"
            @click="newRoomIcon = icon"
          >{{ icon }}</button>
        </div>
        <div class="form-actions">
          <button @click="submitAddRoom">Добавить</button>
          <button class="secondary" @click="cancelAddRoom">Отмена</button>
        </div>
      </div>

      <FloorPlan />

      <!-- Room chips with delete -->
      <div v-if="rooms.length" class="room-chips">
        <div v-for="room in rooms" :key="room.id" class="room-chip">
          <span>{{ room.icon }} {{ room.name }}</span>
          <button
            class="icon-btn danger"
            @click="deleteRoom(room.id)"
            title="Удалить комнату"
          >✕</button>
        </div>
      </div>
    </section>

    <!-- Quick history ────────────────────────────────────────────────────────── -->
    <section class="panel history-panel">
      <div class="section-header">
        <h2>Последние действия</h2>
        <router-link to="/history" class="view-all-link">Все →</router-link>
      </div>
      <ul>
        <li v-for="entry in history.slice(0, 5)" :key="`${entry.at}-${entry.text}`">
          <span>{{ entry.at }}</span>
          <p>{{ entry.text }}</p>
        </li>
        <li v-if="!history.length">Действий пока нет</li>
      </ul>
    </section>

  </div>
</template>

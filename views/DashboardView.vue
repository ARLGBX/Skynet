<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloorPlan from '../components/FloorPlan.vue'
import { useHome } from '../composables/useHome.js'

gsap.registerPlugin(ScrollTrigger)

const {
  rooms, allDevices, activeDevicesCount, averageTemperature, averageBrightness,
  history, scenario, applyScenario,
  addRoom, deleteRoom,
  ROOM_ICONS,
} = useHome()

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
  // Staggered panel entrance
  gsap.fromTo(
    '.view-stack > .panel',
    { y: 28, opacity: 0, scale: 0.98 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    }
  )

  // Stat values counter animation
  gsap.fromTo(
    '.status-grid article p',
    { opacity: 0, x: -8 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.25, ease: 'power2.out' }
  )

  // Scenario buttons pop in
  gsap.fromTo(
    '.scenario-button',
    { scale: 0.85, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.35, stagger: 0.07, delay: 0.4, ease: 'back.out(1.7)' }
  )

  // Room chips slide in from left
  gsap.fromTo(
    '.room-chip',
    { x: -12, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, stagger: 0.06, delay: 0.55, ease: 'power2.out' }
  )

  // History items reveal with ScrollTrigger
  gsap.fromTo(
    '.history-panel li',
    { opacity: 0, y: 10 },
    {
      opacity: 1, y: 0,
      duration: 0.35,
      stagger: 0.06,
      scrollTrigger: { trigger: '.history-panel', start: 'top 90%' },
      ease: 'power2.out',
    }
  )
})
</script>

<template>
  <div class="view-stack">

    <!-- Status grid -->
    <section class="panel status-grid">
      <article>
        <h2>Состояние дома</h2>
        <p>Комнат: <strong>{{ rooms.length }}</strong></p>
        <p>Устройств активно: <strong>{{ activeDevicesCount }} / {{ allDevices.length }}</strong></p>
        <p>Средняя температура: <strong>{{ averageTemperature }}°C</strong></p>
        <p>Средняя яркость: <strong>{{ averageBrightness }}%</strong></p>
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

    <!-- Floor plan -->
    <section class="panel floor-plan-section">
      <div class="section-header">
        <h2>Схема дома — нажмите на комнату</h2>
        <button @click="showAddRoom = !showAddRoom">+ Комната</button>
      </div>

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

      <div v-if="rooms.length" class="room-chips">
        <div v-for="room in rooms" :key="room.id" class="room-chip">
          <span>{{ room.icon }} {{ room.name }}</span>
          <button class="icon-btn danger" @click="deleteRoom(room.id)" title="Удалить">✕</button>
        </div>
      </div>
    </section>

    <!-- Quick history -->
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
        <li v-if="!history.length"><p class="empty-state">Действий пока нет</p></li>
      </ul>
    </section>

  </div>
</template>

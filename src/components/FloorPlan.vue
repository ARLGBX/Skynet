<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHome } from '../composables/useHome.js'

const { rooms, isRoomLit } = useHome()
const router = useRouter()

const layoutRooms = computed(() => {
  const r = rooms.value
  if (!r.length) return []
  const COLS = Math.ceil(Math.sqrt(r.length))
  const ROWS = Math.ceil(r.length / COLS)
  const GAP  = 8
  const W    = 610
  const H    = 480
  const rw   = Math.floor((W - GAP * (COLS + 1)) / COLS)
  const rh   = Math.floor((H - GAP * (ROWS + 1)) / ROWS)
  return r.map((room, i) => ({
    ...room,
    x: GAP + (i % COLS) * (rw + GAP),
    y: GAP + Math.floor(i / COLS) * (rh + GAP),
    w: rw,
    h: rh,
  }))
})

const enterRoom = (id) => router.push({ name: 'room', params: { id } })
</script>

<template>
  <div class="plan-container">
    <svg
      v-if="layoutRooms.length"
      class="floor-plan"
      viewBox="0 0 610 480"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="room-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="610" height="480" rx="12" fill="var(--bg)"/>

      <g
        v-for="room in layoutRooms"
        :key="room.id"
        class="room-group"
        @click="enterRoom(room.id)"
      >
        <rect
          :x="room.x" :y="room.y"
          :width="room.w" :height="room.h"
          rx="8"
          :fill="isRoomLit(room) ? '#fef3c7' : 'var(--soft)'"
          :stroke="isRoomLit(room) ? '#f59e0b' : 'var(--muted)'"
          stroke-width="2"
          :filter="isRoomLit(room) ? 'url(#room-glow)' : 'none'"
          class="room-rect"
        />
        <text
          :x="room.x + room.w / 2"
          :y="room.y + room.h / 2 - 22"
          text-anchor="middle"
          font-size="30"
        >{{ room.icon }}</text>
        <text
          :x="room.x + room.w / 2"
          :y="room.y + room.h / 2 + 10"
          text-anchor="middle"
          font-size="14"
          font-weight="700"
          :fill="isRoomLit(room) ? '#92400e' : 'var(--text)'"
        >{{ room.name }}</text>
        <text
          :x="room.x + room.w / 2"
          :y="room.y + room.h / 2 + 30"
          text-anchor="middle"
          font-size="11"
          :fill="isRoomLit(room) ? '#b45309' : 'var(--muted)'"
        >{{ room.devices.filter(d => d.on).length }}/{{ room.devices.length }} устройств</text>
      </g>
    </svg>

    <p v-else class="empty-state">Нет комнат. Нажмите «+ Комната» чтобы добавить первую.</p>
  </div>
</template>

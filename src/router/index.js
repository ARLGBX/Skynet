// ─── router/index.js ──────────────────────────────────────────────────────────
// Vue Router setup with navigation guards for AppLoader.
// beforeEach  → showLoader()
// afterEach   → hideLoader() with ~400 ms delay

import { createRouter, createWebHashHistory } from 'vue-router'
import { useLoader } from '../composables/useLoader.js'

import DashboardView from '../views/DashboardView.vue'
import RoomView      from '../views/RoomView.vue'
import SettingsView  from '../views/SettingsView.vue'
import HistoryView   from '../views/HistoryView.vue'
import NotFoundView  from '../views/NotFoundView.vue'

const routes = [
  { path: '/',         name: 'dashboard', component: DashboardView },
  { path: '/room/:id', name: 'room',      component: RoomView      },
  { path: '/settings', name: 'settings',  component: SettingsView  },
  { path: '/history',  name: 'history',   component: HistoryView   },
  // 404 — must be last
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// ─── Navigation guards ────────────────────────────────────────────────────────
router.beforeEach(() => {
  // Show loader overlay before each navigation
  const { showLoader } = useLoader()
  showLoader()
})

router.afterEach(() => {
  // Hide loader after navigation completes (300–600 ms per spec)
  const { hideLoader } = useLoader()
  hideLoader(400)
})

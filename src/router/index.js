import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import RoomView      from '../views/RoomView.vue'
import SettingsView  from '../views/SettingsView.vue'
import HistoryView   from '../views/HistoryView.vue'

const routes = [
  { path: '/',           name: 'dashboard', component: DashboardView },
  { path: '/room/:id',   name: 'room',      component: RoomView      },
  { path: '/settings',   name: 'settings',  component: SettingsView  },
  { path: '/history',    name: 'history',   component: HistoryView   },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

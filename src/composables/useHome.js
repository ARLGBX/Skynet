import { computed, reactive, ref, watch } from 'vue'
import { initializeApp }                   from 'firebase/app'
import {
  getAuth, createUserWithEmailAndPassword, onAuthStateChanged,
  signInWithEmailAndPassword, signOut,
} from 'firebase/auth'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { storageService } from '../services/storage.js'

// ─── Static metadata ──────────────────────────────────────────────────────────
export const parameterMeta = {
  brightness:  { min: 0,  max: 100, unit: '%',  label: 'Яркость'     },
  temperature: { min: 16, max: 30,  unit: '°C', label: 'Температура' },
  volume:      { min: 0,  max: 100, unit: '%',  label: 'Громкость'   },
  speed:       { min: 0,  max: 3,   unit: '',   label: 'Скорость'    },
}

export const DEVICE_TYPES = [
  { value: 'light',     label: 'Свет',          icon: '💡' },
  { value: 'climate',   label: 'Климат',         icon: '🌡️' },
  { value: 'media',     label: 'Медиа',          icon: '🔊' },
  { value: 'security',  label: 'Безопасность',   icon: '🛡️' },
  { value: 'appliance', label: 'Прибор',         icon: '⚙️' },
]

export const ROOM_ICONS = ['🛋', '🛏', '🍳', '🚿', '🚪', '📚', '🏋', '🎮', '🌿', '🧸', '🎨', '🛡']

const INIT_PARAMS = {
  light:     { brightness: 50 },
  climate:   { temperature: 22 },
  media:     { volume: 50 },
  security:  {},
  appliance: {},
}

export const getDeviceIcon = (device) =>
  DEVICE_TYPES.find((t) => t.value === device.type)?.icon ?? '🔌'

export const isRoomLit = (room) =>
  room.devices.some((d) => d.type === 'light' && d.on)

// ─── Default data factories ───────────────────────────────────────────────────
const createDefaultHome = () => ({
  rooms: [
    {
      id: 'living-room', name: 'Гостиная', icon: '🛋',
      devices: [
        { id: 'lr-light',      name: 'Основной свет', type: 'light',   on: true,  params: { brightness: 70 } },
        { id: 'lr-thermostat', name: 'Термостат',      type: 'climate', on: true,  params: { temperature: 22 } },
        { id: 'lr-speaker',    name: 'Умная колонка',  type: 'media',   on: false, params: { volume: 30 } },
      ],
    },
    {
      id: 'bedroom', name: 'Спальня', icon: '🛏',
      devices: [
        { id: 'br-light', name: 'Ночник',      type: 'light',   on: false, params: { brightness: 25 } },
        { id: 'br-ac',    name: 'Кондиционер', type: 'climate', on: true,  params: { temperature: 21, speed: 1 } },
      ],
    },
    {
      id: 'kitchen', name: 'Кухня', icon: '🍳',
      devices: [
        { id: 'kt-light',  name: 'Свет на кухне', type: 'light',     on: true,  params: { brightness: 80 } },
        { id: 'kt-coffee', name: 'Кофемашина',     type: 'appliance', on: false, params: {} },
      ],
    },
    {
      id: 'security', name: 'Безопасность', icon: '🛡',
      devices: [
        { id: 'sc-alarm',  name: 'Сигнализация', type: 'security', on: true, params: {} },
        { id: 'sc-camera', name: 'Камеры',        type: 'security', on: true, params: {} },
      ],
    },
  ],
})

const createDefaultSettings = () => ({
  notificationsEnabled: true,
  compactView:          false,
  accentColor:          '#4f7cff',
  theme:                'dark',
})

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain &&
  firebaseConfig.projectId && firebaseConfig.appId,
)

const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
const auth        = firebaseApp ? getAuth(firebaseApp)      : null
const db          = firebaseApp ? getFirestore(firebaseApp) : null

// ─── Module-level singleton reactive state ────────────────────────────────────
const home          = ref(createDefaultHome())
const settings      = reactive(createDefaultSettings())
const notifications = ref([])
const history       = ref([])
const scenario      = ref('Свой')
const currentUser   = ref(null)
const authReady     = ref(false)
const isSaving      = ref(false)
const authMode      = ref('login')
const email         = ref('')
const password      = ref('')

// ─── Computed ─────────────────────────────────────────────────────────────────
const rooms              = computed(() => home.value.rooms)
const allDevices         = computed(() => rooms.value.flatMap((r) => r.devices.map((d) => ({ ...d, roomName: r.name }))))
const activeDevicesCount = computed(() => allDevices.value.filter((d) => d.on).length)
const climateDevices     = computed(() => allDevices.value.filter((d) => 'temperature' in d.params))
const averageTemperature = computed(() => {
  if (!climateDevices.value.length) return '—'
  const total = climateDevices.value.reduce((s, d) => s + Number(d.params.temperature || 0), 0)
  return (total / climateDevices.value.length).toFixed(1)
})
const averageBrightness = computed(() => {
  const lights = allDevices.value.filter((d) => 'brightness' in d.params)
  if (!lights.length) return 0
  return Math.round(lights.reduce((s, d) => s + Number(d.params.brightness || 0), 0) / lights.length)
})

// ─── Notifications / History ──────────────────────────────────────────────────
const pushHistory = (text) => {
  history.value = [{ text, at: new Date().toLocaleTimeString('ru-RU') }, ...history.value].slice(0, 50)
}

const pushNotification = (text, type = 'info') => {
  if (!settings.notificationsEnabled) return
  const id = crypto.randomUUID()
  notifications.value = [{ id, text, type }, ...notifications.value].slice(0, 5)
  setTimeout(() => { notifications.value = notifications.value.filter((n) => n.id !== id) }, 2600)
}

// ─── Device operations ────────────────────────────────────────────────────────
const toggleDevice = (device) => {
  device.on = !device.on
  const text = `${device.name} ${device.on ? 'включено' : 'выключено'}`
  pushHistory(text)
  pushNotification(text, device.on ? 'success' : 'warning')
}

const updateDeviceParam = (device, key, value) => {
  device.params[key] = Number(value)
  const meta = parameterMeta[key]
  const text = `${device.name}: ${meta?.label ?? key} = ${value}${meta?.unit ?? ''}`
  pushHistory(text)
  pushNotification(text)
}

// ─── CRUD: rooms ──────────────────────────────────────────────────────────────
const addRoom = (name, icon) => {
  const id = `room-${Date.now()}`
  home.value.rooms.push({ id, name: name.trim(), icon, devices: [] })
  pushHistory(`Комната «${name}» добавлена`)
  pushNotification(`Комната «${name}» добавлена`, 'success')
  return id
}

const deleteRoom = (roomId) => {
  const idx = home.value.rooms.findIndex((r) => r.id === roomId)
  if (idx === -1) return
  const name = home.value.rooms[idx].name
  home.value.rooms.splice(idx, 1)
  pushHistory(`Комната «${name}» удалена`)
  pushNotification(`Комната «${name}» удалена`, 'warning')
}

// ─── CRUD: devices ────────────────────────────────────────────────────────────
const addDevice = (roomId, name, type) => {
  const room = home.value.rooms.find((r) => r.id === roomId)
  if (!room) return
  const id = `dev-${Date.now()}`
  room.devices.push({ id, name: name.trim(), type, on: false, params: { ...(INIT_PARAMS[type] ?? {}) } })
  pushHistory(`Устройство «${name}» добавлено в «${room.name}»`)
  pushNotification(`Устройство «${name}» добавлено`, 'success')
}

const deleteDevice = (roomId, deviceId) => {
  const room = home.value.rooms.find((r) => r.id === roomId)
  if (!room) return
  const idx = room.devices.findIndex((d) => d.id === deviceId)
  if (idx === -1) return
  const name = room.devices[idx].name
  room.devices.splice(idx, 1)
  pushHistory(`Устройство «${name}» удалено`)
  pushNotification(`Устройство «${name}» удалено`, 'warning')
}

// ─── Scenarios ────────────────────────────────────────────────────────────────
const NIGHT_ROOM_ID = 'bedroom'

const applyScenario = (name) => {
  scenario.value = name
  rooms.value.forEach((room) => {
    room.devices.forEach((device) => {
      if (name === 'Ночь') {
        if (device.type === 'light') {
          device.on = room.id === NIGHT_ROOM_ID
          if ('brightness' in device.params) device.params.brightness = room.id === NIGHT_ROOM_ID ? 15 : 0
        }
        if ('temperature' in device.params) device.params.temperature = 19
      }
      if (name === 'Утро') {
        if (device.type === 'light') {
          device.on = true
          if ('brightness' in device.params) device.params.brightness = 70
        }
        if ('temperature' in device.params) device.params.temperature = 22
      }
      if (name === 'Никого дома') {
        if (device.type === 'security') device.on = true
        else device.on = false
        if ('temperature' in device.params) device.params.temperature = 18
      }
    })
  })
  pushHistory(`Сценарий «${name}» применён`)
  pushNotification(`Сценарий: ${name}`, 'success')
}

const resetHome = () => {
  home.value = createDefaultHome()
  scenario.value = 'Свой'
  pushHistory('Состояние дома сброшено')
  pushNotification('Дом сброшен', 'warning')
}

const saveUserSettings = () => {
  pushHistory('Настройки пользователя обновлены')
  pushNotification('Настройки сохранены', 'success')
}

// ─── Firebase persist ─────────────────────────────────────────────────────────
let saveTimer

const saveCloud = async () => {
  if (!db || !currentUser.value) return
  isSaving.value = true
  await setDoc(doc(db, 'homes', currentUser.value.uid), {
    home: home.value, settings: { ...settings }, history: history.value, updatedAt: Date.now(),
  })
  isSaving.value = false
}

const loadCloud = async (uid) => {
  if (!db) return
  const snapshot = await getDoc(doc(db, 'homes', uid))
  if (!snapshot.exists()) { await saveCloud(); return }
  const data = snapshot.data()
  if (data.home?.rooms?.length) home.value = data.home
  if (data.settings) Object.assign(settings, createDefaultSettings(), data.settings)
  if (Array.isArray(data.history)) history.value = data.history.slice(0, 50)
}

// ─── Local persist ────────────────────────────────────────────────────────────
const saveLocal = () => {
  storageService.set('guest-home',     home.value)
  storageService.set('guest-settings', { ...settings })
  storageService.set('guest-history',  history.value)
}

const loadLocal = () => {
  const rawHome     = storageService.get('guest-home')
  const rawSettings = storageService.get('guest-settings')
  const rawHistory  = storageService.get('guest-history')
  if (rawHome?.rooms?.length) home.value = rawHome
  if (rawSettings) Object.assign(settings, createDefaultSettings(), rawSettings)
  if (Array.isArray(rawHistory)) history.value = rawHistory.slice(0, 50)
}

const schedulePersist = () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { currentUser.value && db ? saveCloud() : saveLocal() }, 450)
}

watch(
  () => [home.value, settings, history.value],
  () => { if (authReady.value) schedulePersist() },
  { deep: true },
)

// ─── Theme ────────────────────────────────────────────────────────────────────
const applyTheme = (theme) => {
  const allowed = new Set(['light', 'dark', 'medium'])
  document.documentElement.setAttribute('data-theme', allowed.has(theme) ? theme : 'dark')
}

watch(() => settings.theme, (theme) => { applyTheme(theme) }, { immediate: true })

// ─── Auth ─────────────────────────────────────────────────────────────────────
const login = async () => {
  if (!auth) return
  await signInWithEmailAndPassword(auth, email.value, password.value)
  pushNotification('Вход выполнен', 'success')
}

const register = async () => {
  if (!auth) return
  await createUserWithEmailAndPassword(auth, email.value, password.value)
  pushNotification('Аккаунт создан', 'success')
}

const logout = async () => {
  if (!auth) return
  await signOut(auth)
  pushNotification('Выход выполнен')
}

// ─── Init (call once from App.vue onMounted) ──────────────────────────────────
let authInitialized = false

export const initAuth = (onReady) => {
  if (authInitialized) return
  authInitialized = true

  if (isFirebaseConfigured && auth) {
    onAuthStateChanged(auth, async (user) => {
      currentUser.value = user
      if (user) await loadCloud(user.uid)
      else loadLocal()
      authReady.value = true
      onReady?.()
    })
  } else {
    loadLocal()
    authReady.value = true
    onReady?.()
  }
}

// ─── Public composable API ────────────────────────────────────────────────────
export function useHome() {
  return {
    // state
    home, settings, notifications, history, scenario,
    currentUser, authReady, isSaving, authMode, email, password,
    isFirebaseConfigured,
    // computed
    rooms, allDevices, activeDevicesCount, averageTemperature, averageBrightness,
    // static metadata
    parameterMeta, DEVICE_TYPES, ROOM_ICONS,
    // utils
    getDeviceIcon, isRoomLit,
    // device operations
    toggleDevice, updateDeviceParam,
    // CRUD
    addRoom, deleteRoom, addDevice, deleteDevice,
    // scenarios + settings
    applyScenario, resetHome, saveUserSettings,
    // auth
    login, register, logout,
    // push helpers
    pushNotification, pushHistory,
  }
}

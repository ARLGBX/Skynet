const { createApp } = Vue;

const STORAGE_KEY = 'skynet-smart-home-v2';

// SVG план дома: viewBox="0 0 610 542"
//
//  Гостиная  (x=8,   y=8,   w=287, h=267)  ← левый верхний блок
//  Спальня   (x=303, y=8,   w=299, h=155)  ─┐ правый верхний
//  Ванная    (x=303, y=171, w=299, h=104)  ─┘
//  Прихожая  (x=8,   y=283, w=594, h=56)   ← коридор
//  Кухня     (x=8,   y=347, w=287, h=187)  ─┐ нижний блок
//  Детская   (x=303, y=347, w=299, h=187)  ─┘

const defaultRooms = [
  {
    id: 'living',
    name: 'Гостиная',
    icon: '🛋',
    x: 8, y: 8, w: 287, h: 267,
    devices: [
      { id: 'l-main', name: 'Основной свет', type: 'light', isOn: true, brightness: 75 },
      { id: 'l-lamp', name: 'Торшер', type: 'light', isOn: false, brightness: 50 },
      { id: 'l-therm', name: 'Термостат', type: 'thermostat', isOn: true, temperature: 22 },
      { id: 'l-tv', name: 'Телевизор', type: 'switch', isOn: false },
    ],
  },
  {
    id: 'bedroom',
    name: 'Спальня',
    icon: '🛏',
    x: 303, y: 8, w: 299, h: 155,
    devices: [
      { id: 'b-light', name: 'Свет', type: 'light', isOn: false, brightness: 40 },
      { id: 'b-therm', name: 'Термостат', type: 'thermostat', isOn: true, temperature: 20 },
      { id: 'b-ac', name: 'Кондиционер', type: 'fan', isOn: false, speed: 2 },
    ],
  },
  {
    id: 'bathroom',
    name: 'Ванная',
    icon: '🚿',
    x: 303, y: 171, w: 299, h: 104,
    devices: [
      { id: 'ba-light', name: 'Свет', type: 'light', isOn: true, brightness: 100 },
      { id: 'ba-towel', name: 'Полотенцесушитель', type: 'switch', isOn: false },
    ],
  },
  {
    id: 'hallway',
    name: 'Прихожая',
    icon: '🚪',
    x: 8, y: 283, w: 594, h: 56,
    devices: [
      { id: 'h-light', name: 'Свет', type: 'light', isOn: false, brightness: 60 },
      { id: 'h-motion', name: 'Датчик движения', type: 'switch', isOn: true },
    ],
  },
  {
    id: 'kitchen',
    name: 'Кухня',
    icon: '🍳',
    x: 8, y: 347, w: 287, h: 187,
    devices: [
      { id: 'k-light', name: 'Свет', type: 'light', isOn: true, brightness: 80 },
      { id: 'k-hood', name: 'Вытяжка', type: 'fan', isOn: false, speed: 1 },
      { id: 'k-therm', name: 'Термостат', type: 'thermostat', isOn: false, temperature: 21 },
    ],
  },
  {
    id: 'kids',
    name: 'Детская',
    icon: '🧸',
    x: 303, y: 347, w: 299, h: 187,
    devices: [
      { id: 'kd-main', name: 'Основной свет', type: 'light', isOn: false, brightness: 70 },
      { id: 'kd-night', name: 'Ночник', type: 'light', isOn: true, brightness: 20 },
      { id: 'kd-therm', name: 'Термостат', type: 'thermostat', isOn: true, temperature: 23 },
    ],
  },
];

createApp({
  data() {
    return this.loadState();
  },

  computed: {
    currentRoom() {
      return this.rooms.find((r) => r.id === this.currentRoomId) || this.rooms[0];
    },
    allDevices() {
      return this.rooms.flatMap((r) => r.devices);
    },
    totalDeviceCount() {
      return this.allDevices.length;
    },
    activeDeviceCount() {
      return this.allDevices.filter((d) => d.isOn).length;
    },
    avgLightBrightness() {
      const lights = this.allDevices.filter((d) => d.type === 'light');
      if (!lights.length) return 0;
      return Math.round(lights.reduce((s, d) => s + (d.brightness || 0), 0) / lights.length);
    },
    avgTemperature() {
      const therms = this.allDevices.filter((d) => d.type === 'thermostat');
      if (!therms.length) return 0;
      return (
        Math.round((therms.reduce((s, d) => s + (d.temperature || 0), 0) / therms.length) * 10) / 10
      );
    },
  },

  watch: {
    rooms: { deep: true, handler() { this.saveState(); } },
    view() { this.saveState(); },
    currentRoomId() { this.saveState(); },
    actionHistory() { this.saveState(); },
  },

  methods: {
    isRoomLit(room) {
      return room.devices.some((d) => d.type === 'light' && d.isOn);
    },

    enterRoom(id) {
      this.currentRoomId = id;
      this.view = 'room';
    },

    deviceIcon(device) {
      const map = { light: '💡', thermostat: '🌡', fan: '💨', switch: '🔌' };
      return map[device.type] || '⚙';
    },

    applyScenario(name) {
      if (name === 'Ночь') {
        this.rooms.forEach((room) =>
          room.devices.forEach((device) => {
            if (device.type === 'light') { device.isOn = false; }
            if (device.type === 'thermostat') { device.temperature = 19; }
          }),
        );
        const nightLight = this.rooms
          .find((r) => r.id === 'kids')
          ?.devices.find((d) => d.id === 'kd-night');
        if (nightLight) { nightLight.isOn = true; nightLight.brightness = 15; }
      }

      if (name === 'Утро') {
        this.rooms.forEach((room) =>
          room.devices.forEach((device) => {
            if (device.type === 'light') { device.isOn = true; device.brightness = 80; }
            if (device.type === 'thermostat') { device.temperature = 22; }
          }),
        );
      }

      if (name === 'Никого дома') {
        this.rooms.forEach((room) =>
          room.devices.forEach((device) => { device.isOn = false; }),
        );
      }

      this.logAction(`Сценарий «${name}» применён`);
    },

    logAction(msg) {
      const time = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const entry = `${time} — ${msg}`;
      this.actionHistory.unshift(entry);
      this.actionHistory = this.actionHistory.slice(0, 15);
    },

    saveState() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentRoomId: this.currentRoomId,
          actionHistory: this.actionHistory,
          rooms: this.rooms,
        }),
      );
    },

    loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.rooms?.length) {
            return {
              view: 'house',
              currentRoomId: parsed.currentRoomId || 'living',
              actionHistory: parsed.actionHistory || [],
              rooms: parsed.rooms,
            };
          }
        }
      } catch (_) {
        // Ошибка разбора — используем дефолтные данные
      }
      return {
        view: 'house',
        currentRoomId: 'living',
        actionHistory: [],
        rooms: JSON.parse(JSON.stringify(defaultRooms)),
      };
    },
  },
}).mount('#app');

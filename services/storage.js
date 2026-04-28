// ─── LocalStorage service ─────────────────────────────────────────────────────
// All keys are prefixed with "skynet-" to avoid clashing with other apps.
// Keys used: 'guest-home', 'guest-settings', 'guest-history'

const PREFIX = 'skynet-'

export const storageService = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Storage quota exceeded — silently ignore
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },
}

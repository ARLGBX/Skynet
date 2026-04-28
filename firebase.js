// ─── src/firebase.js ──────────────────────────────────────────────────────────
// Единый файл инициализации Firebase для всего приложения.
// Импортируй отсюда: auth, db, app — не инициализируй Firebase повторно.

import { initializeApp }   from 'firebase/app'
import { getAuth }         from 'firebase/auth'
import { getFirestore }    from 'firebase/firestore'
import { getAnalytics }    from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Проверяем что конфиг заполнен (не гостевой режим)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
)

// Инициализируем только если есть конфиг
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth        = firebaseApp ? getAuth(firebaseApp)      : null
export const db          = firebaseApp ? getFirestore(firebaseApp) : null
export const analytics   = firebaseApp ? getAnalytics(firebaseApp) : null

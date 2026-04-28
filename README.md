# Умный дом (Skynet)

Симулятор умного дома на Vue 3 + Vite с:
- интерактивной схемой дома (SVG план с кликабельными комнатами)
- управлением устройствами в каждой комнате (свет, термостат, вентилятор и др.)
- сценариями («Ночь», «Утро», «Никого дома»)
- историей действий и уведомлениями
- аутентификацией через Firebase + синхронизацией Firestore (с локальным режимом гостя)
- GSAP-анимациями

## Запуск

```bash
npm install
npm run dev
```

## Настройка Firebase

Создайте файл `.env` в корне репозитория:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Без этих переменных приложение работает в гостевом режиме (localStorage).

### Что включить в Firebase Console

1. **Authentication → Sign-in method**
   - включить `Email/Password`.
2. **Firestore Database**
   - создать БД в production/test mode.
3. **(Опционально) Security Rules** для доступа только к своим данным:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /homes/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Какие коллекции нужны

Обязательная коллекция:

- `homes`
  - документ: `uid` пользователя (из Firebase Auth)
  - поля:
    - `home` — структура комнат и устройств
    - `settings` — настройки UI (включая тему: `light` / `dark` / `medium`)
    - `history` — история действий
    - `updatedAt` — timestamp последнего обновления

Дополнительные коллекции не требуются для текущей версии.

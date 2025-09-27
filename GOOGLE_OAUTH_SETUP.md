# Google OAuth Setup Instructions

## 1. Створення Google OAuth додатку

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Увімкніть Google+ API:
   - Перейдіть до "APIs & Services" > "Library"
   - Знайдіть "Google+ API" та увімкніть його

## 2. Налаштування OAuth 2.0

1. Перейдіть до "APIs & Services" > "Credentials"
2. Натисніть "Create Credentials" > "OAuth 2.0 Client IDs"
3. Виберіть "Web application"
4. Додайте авторизовані домени:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`

## 3. Налаштування проекту

1. Скопіюйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Додайте ваш Google Client ID в `.env`:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

## 4. Функціональність

### Що працює:
- ✅ Авторизація через Google
- ✅ Отримання профілю користувача (ім'я, email, фото)
- ✅ Збереження даних в localStorage
- ✅ Автоматичний вихід з Google при logout
- ✅ Інтеграція з існуючою системою авторизації
- ✅ Fallback на локальну авторизацію якщо сервер недоступний

### Дані що зберігаються:
- `userId` - Google ID користувача
- `userEmail` - Email з Google аккаунту
- `userName` - Ім'я з Google аккаунту  
- `userImage` - URL фото профілю
- `authProvider` - 'google' для відстеження типу авторизації
- `googleToken` - Access token від Google

## 5. Безпека

- Токени зберігаються тільки в localStorage
- Автоматичне очищення при logout
- Валідація на стороні клієнта
- Можливість інтеграції з backend для додаткової валідації

## 6. Тестування

Для тестування без реального Google Client ID система працює в режимі симуляції з демо-даними.
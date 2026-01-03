# MapMark Testing

Тестові скрипти для перевірки API ендпоінтів MapMark.

## Вимоги

- `curl` - для HTTP запитів
- `jq` - для форматування JSON відповідей

Встановлення jq (якщо потрібно):
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## Запуск тестів

### Тест реєстрації

```bash
cd ~/Desktop/MapMark-Testing
bash test-register-endpoint.sh
```

Або з будь-якої директорії:
```bash
bash ~/Desktop/MapMark-Testing/test-register-endpoint.sh
```

## Що тестується

### test-register-endpoint.sh
Комплексне тестування ендпоінту `/api/v1/auth/register`:

**✅ Позитивні тести:**
- Валідні дані (user)
- Валідні дані (seller)
- Trim пробілів

**❌ Негативні тести:**
- Відсутні обов'язкові поля (ім'я, прізвище, роль)
- Валідація довжини (min/max)
- Валідація формату (email, прізвище)
- Валідація пароля (довжина, складність)
- Бізнес-логіка (країна, роль, дублікат email)
- Безпека (SQL Injection, XSS)

**Всього: 25 тест-кейсів**

## Примітки

- Перед запуском переконайся, що backend запущений на `http://localhost:3001`
- Деякі тести можуть створювати користувачів у БД
- Для очищення БД використовуй dev ендпоінт або видали записи вручну

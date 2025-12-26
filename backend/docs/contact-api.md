# Contact API Documentation

## Endpoints

### POST /api/v1/contact/send
Надіслати контактне повідомлення

**Headers:**
- `Content-Type: application/json`
- `X-CSRF-Token: <token>` (required)

**Body:**
```json
{
  "name": "Ім'я користувача",
  "email": "user@example.com", 
  "message": "Текст повідомлення"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "message": "Повідомлення надіслано успішно",
    "contact": {
      "id": "contact_id",
      "name": "Ім'я користувача",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Rate Limiting:** 3 повідомлення на 15 хвилин

### GET /api/v1/contact/messages
Отримати список контактних повідомлень (admin only)

**Query Parameters:**
- `page` (optional): Номер сторінки (default: 1)
- `limit` (optional): Кількість на сторінці (default: 20)
- `status` (optional): Фільтр за статусом (new, read, replied)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "contacts": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### PATCH /api/v1/contact/messages/:id/status
Оновити статус повідомлення (admin only)

**Body:**
```json
{
  "status": "read" // new, read, replied
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Статус повідомлення оновлено",
    "contact": {
      "id": "contact_id",
      "status": "read"
    }
  }
}
```
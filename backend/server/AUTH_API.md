# Authentication API

## POST /api/auth/register

Реєстрація нового користувача.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Іван Петренко"
}
```

### Validation Rules
- **email**: валідний email, автоматично нормалізується
- **password**: мінімум 6 символів, повинен містити велику літеру, малу літеру та цифру
- **name**: 2-50 символів, тільки літери (українські та латинські)

### Rate Limiting
- Максимум 3 реєстрації на годину з одного IP

### Success Response (201)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "Іван Петренко"
    }
  }
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters with uppercase, lowercase and number",
      "param": "password"
    }
  ]
}
```

#### User Already Exists (409)
```json
{
  "success": false,
  "message": "User already exists"
}
```

#### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many registration attempts, try again later"
}
```

## POST /api/auth/login

Вхід користувача в систему.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Rate Limiting
- Максимум 5 спроб входу за 15 хвилин з одного IP

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "Іван Петренко"
    }
  }
}
```

### Error Responses

#### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Security Features

- **Password Hashing**: bcryptjs з salt rounds = 12
- **JWT Tokens**: 7 днів життя
- **Rate Limiting**: захист від brute force атак
- **Input Validation**: express-validator для всіх полів
- **Email Normalization**: автоматична нормалізація email
- **Unique Email**: перевірка унікальності email
- **Active Users Only**: тільки активні користувачі можуть входити
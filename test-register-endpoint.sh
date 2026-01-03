#!/bin/bash

BASE_URL="http://localhost:3001/api/v1/auth/register"
HEADERS='-H "Content-Type: application/json"'

echo "=== ТЕСТУВАННЯ ЕНДПОІНТУ РЕЄСТРАЦІЇ ==="
echo ""

# 1. ВАЛІДНІ ДАНІ
echo "1. ✅ Валідні дані (user)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 2. ВАЛІДНІ ДАНІ (seller)
echo "2. ✅ Валідні дані (seller)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"Test123","confirmPassword":"Test123","name":"Олег","surname":"Коваль","country":"UA","role":"seller"}' | jq .
echo -e "\n---\n"

# 3. ВІДСУТНЄ ІМ'Я
echo "3. ❌ Відсутнє ім'я"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 4. ВІДСУТНЄ ПРІЗВИЩЕ
echo "4. ❌ Відсутнє прізвище"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 5. ПОРОЖНЄ ПРІЗВИЩЕ
echo "5. ❌ Порожнє прізвище"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 6. ПРІЗВИЩЕ 1 СИМВОЛ
echo "6. ❌ Прізвище 1 символ"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"П","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 7. ПРІЗВИЩЕ 51 СИМВОЛ
echo "7. ❌ Прізвище 51 символ"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренкопетренкопетренкопетренкопетренкопетренкопетр","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 8. ПРІЗВИЩЕ З ЦИФРАМИ
echo "8. ❌ Прізвище з цифрами"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко123","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 9. ПРІЗВИЩЕ З СПЕЦСИМВОЛАМИ
echo "9. ❌ Прізвище з спецсимволами"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко@#$","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 10. НЕВАЛІДНИЙ EMAIL
echo "10. ❌ Невалідний email"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 11. КОРОТКИЙ ПАРОЛЬ
echo "11. ❌ Короткий пароль (5 символів)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1","confirmPassword":"Test1","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 12. ПАРОЛЬ БЕЗ ВЕЛИКОЇ ЛІТЕРИ
echo "12. ❌ Пароль без великої літери"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirmPassword":"test123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 13. ПАРОЛЬ БЕЗ МАЛОЇ ЛІТЕРИ
echo "13. ❌ Пароль без малої літери"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TEST123","confirmPassword":"TEST123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 14. ПАРОЛЬ БЕЗ ЦИФРИ
echo "14. ❌ Пароль без цифри"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestTest","confirmPassword":"TestTest","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 15. ПАРОЛІ НЕ СПІВПАДАЮТЬ
echo "15. ❌ Паролі не співпадають"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test456","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 16. НЕВАЛІДНА КРАЇНА
echo "16. ❌ Невалідна країна"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"US","role":"user"}' | jq .
echo -e "\n---\n"

# 17. ВІДСУТНЯ РОЛЬ
echo "17. ❌ Відсутня роль"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA"}' | jq .
echo -e "\n---\n"

# 18. НЕВАЛІДНА РОЛЬ
echo "18. ❌ Невалідна роль"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":"admin"}' | jq .
echo -e "\n---\n"

# 19. ПОРОЖНЯ РОЛЬ
echo "19. ❌ Порожня роль"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":""}' | jq .
echo -e "\n---\n"

# 20. SQL INJECTION В ІМ'Я
echo "20. ❌ SQL Injection в ім'я"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван OR 1=1","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 21. XSS В ПРІЗВИЩЕ
echo "21. ❌ XSS в прізвище"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"<script>alert(1)</script>","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 22. ДУЖЕ ДОВГИЙ EMAIL
echo "22. ❌ Дуже довгий email (>100 символів)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"verylongemailaddressverylongemailaddressverylongemailaddressverylongemailaddressverylongemail@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 23. ПОДВІЙНІ ПРОБІЛИ В ПРІЗВИЩІ
echo "23. ❌ Подвійні пробіли в прізвищі"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко  Іванович","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 24. ПРОБІЛИ НА ПОЧАТКУ/КІНЦІ ПРІЗВИЩА
echo "24. ✅ Пробіли на початку/кінці (trim повинен очистити)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"trim@test.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":" Петренко ","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

# 25. ДУБЛІКАТ EMAIL
echo "25. ❌ Дублікат email (якщо вже існує)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"10@gmail.com","password":"Test123","confirmPassword":"Test123","name":"Іван","surname":"Петренко","country":"UA","role":"user"}' | jq .
echo -e "\n---\n"

echo "=== ТЕСТУВАННЯ ЗАВЕРШЕНО ==="

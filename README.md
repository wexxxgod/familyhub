# FamilyHub — Семейная социальная сеть

Закрытая платформа для вашей семьи. Делитесь событиями, храните воспоминания, стройте семейное древо и оставайтесь на связи.

## 🚀 Быстрый старт (локально)

```bash
npm install

# Настройка .env (скопируйте .env.example → .env, укажите свою БД)
# PostgreSQL через Docker:
docker compose up -d postgres
npx prisma db push

npm run dev
# → http://localhost:3000
```

## 🌍 Деплой на Vercel + Neon (бесплатно)

### 1. Создайте PostgreSQL на Neon

1. Зайдите на [neon.tech](https://neon.tech), зарегистрируйтесь
2. Создайте проект → получите строку подключения вида:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/familyhub?sslmode=require
   ```

### 2. Залейте код на GitHub

```bash
git init
git add .
git commit -m "initial commit"
# Создайте репозиторий на GitHub и выполните:
git remote add origin https://github.com/ВАШ-АККАУНТ/familyhub.git
git push -u origin main
```

### 3. Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com), нажмите **Add New → Project**
2. Импортируйте ваш GitHub-репозиторий
3. В разделе **Environment Variables** добавьте:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Строка подключения из Neon |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` (сгенерируйте) |
| `NEXTAUTH_URL` | `https://ваш-проект.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://ваш-проект.vercel.app` |

4. Нажмите **Deploy** — через 2 минуты сайт готов

### 4. Создайте таблицы

```bash
# В терминале Vercel или локально после деплоя:
npx prisma db push
# Или подключитесь к БД через Neon SQL Editor и выполните
# содержимое prisma/schema.prisma
```

## 🛠️ Команды

```bash
npm run dev          # Разработка
npm run build        # Production сборка
npm run start        # Запуск production
npm run db:push      # Обновление схемы БД
npm run db:studio    # Prisma Studio (UI для БД)
```

## 🐳 Docker

```bash
docker compose up -d postgres   # Только PostgreSQL
docker compose up --build       # Всё вместе
```

## 🔒 Безопасность

- JWT аутентификация через NextAuth
- Защищённые маршруты (middleware)
- CSRF защита
- Роли: SUPER_ADMIN, PARENT, FAMILY_MEMBER, GUEST
- Все API эндпоинты проверяют авторизацию

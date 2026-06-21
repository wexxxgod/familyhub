# FamilyHub — Session Context

## Project
Next.js 14.2 + Prisma + PostgreSQL (Neon) + Tailwind CSS. Семейное приложение с лентой, чатом, архивом, питомцами, деревом, календарём, опросами, воспоминаниями.

## Auth
Cookie-based сессия (`familyhub.session`), `getCurrentUser` helper из `auth-helpers.ts`. Роли: SUPER_ADMIN, PARENT, FAMILY_MEMBER, GUEST.

## DB
- PostgreSQL на Neon, `DATABASE_URL` в `.env`
- Новая миграция `20260621162614_add_images_and_pet_photos` не накачена (Neon заблокирован в регионе, миграции накатятся при деплое на Vercel)
- Добавлены: `Post.images`, `ArchiveItem.images`, модель `PetPhoto` для альбомов питомцев

## Что сделано

### Фичи (оставлено)
- Множественные фото в постах (CreatePost — `multiple` input, PostCard — адаптивная сетка)
- Фотоальбомы питомцев (кнопка "Альбом" на карточке, модалка с сеткой, add/delete)
- Архив: множественные изображения, кнопка редактирования (PATCH)
- API: PATCH для питомцев, PATCH для архива, CRUD `/api/pets/photos`

### Что убрано (не работало на Vercel)
- Файловое хранилище (`/api/upload` теперь снова возвращает base64 data URL)
- `scripts/migrate-images.ts` — скрипт конвертации base64→файлы
- `public/uploads/` — временная директория

### Фикс 1 — Миграция Neon (commit 32c9170)
- `vercel-build` скрипт: `prisma generate && prisma db push && next build`
- Используется `db push` вместо `migrate deploy` (нет базовой миграции, только db push изначально)
- `directUrl = env("DIRECT_URL")` в Prisma schema — на Vercel нужно установить `DIRECT_URL` (непулерное соединение для DDL)
- `.env` и `.env.example` обновлены: добавлена `DIRECT_URL`

### Фикс 2 — Mobile overflow (commit b63a414)
- `DashboardHeader.tsx`: search container `hidden sm:block`
- dashboard layout: `overflow-x-hidden`
- `globals.css`: `html { max-width: 100vw; overflow-x: hidden }`
- Блобы скрыты на мобилках (`max-lg:hidden`), размеры ограничены `min()`

### Фикс 3 — Аудит и багфикс всего codebase (не закоммичен)
- **`auth-helpers.ts`**: добавлена `isValidEmail()` для единой валидации
- **`login/route.ts`**: email-валидация + русские ошибки
- **`register/route.ts`**: email-валидация, проверка длины имени, `NextRequest`
- **`register/page.tsx`**: клиентская валидация email + длина имени
- **`login/page.tsx`**: сброс `step` на `"register"` при ошибке создания/вступления в семью; показ серверной ошибки вместо сверки с `"invalid credentials"`
- **`upload/route.ts`**: MIME type берется из `file.type`, а не хардкод `image/jpeg` (PDF работают)
- **`polls/vote/route.ts`**: проверка семейной принадлежности опроса (`poll.author.familyId === user.familyId`) + валидация варианта
- **`events/route.ts`**: `safeDate(date)!` → `safeDate(date) ?? undefined` (без падения на null)
- **`archive/route.ts`**: year 0 больше не трактуется как falsy (`data.year !== null && data.year !== ""`)
- **`notifications/public-key/route.ts`**: try/catch + проверка на null ключа

## Проблемы (оставшиеся)
- **Neon заблокирован в регионе** — локально миграции и скрипты не запустить
- **base64 изображения** — хранятся в БД, лента может грузиться медленно на телефоне
- **Rate limiting in-memory** — сброс при каждом serverless invocation на Vercel (нужен внешний storage)
- **`posts/route.ts` cursor pagination** — если пост до cursor удалён, `findMany` с `skip: 1` может пропустить следующий
- **`admin/route.ts` delete_user** — нет проверки family scope
- **`admin/route.ts` change_role** — нет валидации значения роли

## Команды для будущего
```bash
# Накатить миграции (локально с VPN)
npx prisma migrate dev

# Сконвертировать base64 в Cloudinary (если будет добавлен)
npx tsx scripts/migrate-to-cloudinary.ts
```

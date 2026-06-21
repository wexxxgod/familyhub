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

### Что было отменено (2 коммита ревертнуты)
- `vercel-build` скрипт (миграции нужно запускать руками или через деплой)
- `directUrl` в Prisma schema

## Проблемы
- **Neon заблокирован в регионе** — локально миграции и скрипты не запустить
- **base64 изображения** — хранятся в БД, из-за этого лента может грузиться медленно на телефоне (особенно при множественных фото)
- **Решение для скорости** — не реализовано. Лучший вариант: Cloudinary (бесплатно 25GB), но пользователь пока не хочет усложнять

## Команды для будущего
```bash
# Накатить миграции (локально с VPN)
npx prisma migrate dev

# Сконвертировать base64 в Cloudinary (если будет добавлен)
npx tsx scripts/migrate-to-cloudinary.ts
```

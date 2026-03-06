# MyFin — Контроль финансов

Мобильное веб-приложение для учёта доходов, расходов, кредитов и резервов с конвертацией в USD/RUB.

## Технологии

- Next.js 14 (App Router)
- Prisma + PostgreSQL
- Tailwind CSS
- PWA (manifest + Service Worker)

## Запуск

```bash
# Установка зависимостей
npm install

# Настройте DATABASE_URL в .env (PostgreSQL)
# Бесплатно: Neon.tech, Supabase или Vercel Postgres

# Создание таблиц и seed категорий
npx prisma db push
npx prisma db seed

# Разработка
npm run dev
```

Откройте http://localhost:3000 в браузере. На десктопе отобразится сообщение «Откройте на телефоне» — уменьшите окно или используйте мобильное устройство.

## Скрипты

- `npm run dev` — режим разработки
- `npm run build` — сборка
- `npm run start` — production
- `npm run db:studio` — Prisma Studio для просмотра БД
- `npm run db:seed` — обновление категорий

## Курсы валют

Используется API Национального банка РБ (НБРБ). Курсы обновляются:
- при первом запросе `/api/exchange-rates`;
- ежедневно через cron `/api/cron/update-rates` (8:00 UTC для Vercel).

Ручное обновление: `GET` или `POST` на `/api/cron/update-rates`. Для защиты можно задать `CRON_SECRET` в env.

## Деплой (Vercel)

1. Подключите репозиторий к Vercel.
2. Создайте PostgreSQL:
   - Vercel: Storage → Create Database → Postgres
   - Или: [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com) (бесплатно)
3. Добавьте `DATABASE_URL` (строка подключения Postgres) в Environment Variables.
4. После первого деплоя выполните миграции и seed (через Vercel CLI или локально, подключившись к той же БД):
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Опционально: `CRON_SECRET` для защиты cron.

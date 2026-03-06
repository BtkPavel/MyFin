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

### Быстрая настройка (Neon + Vercel CLI)

Если у вас уже есть `.env.vercel` с DATABASE_URL (создан через `npx get-db`):

```bash
vercel login          # один раз
./scripts/setup-vercel-db.sh
git push               # или npx vercel --prod
```

### Ручная настройка

1. Подключите репозиторий к Vercel.
2. Создайте PostgreSQL:
   - [Neon.tech](https://neon.tech) (бесплатно): `npx get-db --yes` создаст БД и `.env`
   - Или: Vercel Storage → Postgres, [Supabase](https://supabase.com)
3. В Vercel → Settings → Environment Variables добавьте `DATABASE_URL` (Production).
4. Redeploy проекта.
5. Опционально: `CRON_SECRET` для защиты cron.

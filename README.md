# MyFin — Контроль финансов

Мобильное веб-приложение для учёта доходов, расходов, кредитов и резервов с конвертацией в USD/RUB.

## Технологии

- Next.js 14 (App Router)
- Prisma + SQLite
- Tailwind CSS
- PWA (manifest + Service Worker)

## Запуск

```bash
# Установка зависимостей
npm install

# Создание БД и seed категорий
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
2. Добавьте `DATABASE_URL` (для SQLite используйте Vercel KV или перейдите на PostgreSQL).
3. Опционально: `CRON_SECRET` для защиты cron.

При использовании SQLite на Vercel учтите [ограничения](https://vercel.com/docs/storage/vercel-postgres) — для production рекомендуется PostgreSQL.

# Настройка DATABASE_URL в Vercel

Neon БД создана, схема применена, seed выполнен. Осталось добавить переменную в Vercel.

## Вариант A: Через Vercel Dashboard (проще)

1. Откройте [vercel.com](https://vercel.com) → проект **my-fin-delta** (или ваш проект)
2. **Settings** → **Environment Variables**
3. Добавьте:
   - **Name:** `DATABASE_URL`
   - **Value:** скопируйте из файла `.env.vercel` в корне проекта
   - **Environment:** Production ✓
4. **Redeploy** проекта (Deployments → ⋮ → Redeploy)

## Вариант B: Через Vercel CLI

```bash
npx vercel login    # один раз
./scripts/setup-vercel-db.sh
git push
```

## Важно: сохраните БД

Claimable Neon БД истекает через ~3 дня. Сделайте её постоянной:

1. Откройте: https://pg.new/database/e5a6ef0c-6b33-4e75-8dfa-89c2e7d25986
2. Зарегистрируйтесь в Neon (бесплатно) и заберите БД в свой аккаунт

После этого connection string останется тем же — в Vercel ничего менять не нужно.

#!/bin/bash
# Добавляет DATABASE_URL в Vercel.
# Вариант 1: vercel login, затем ./scripts/setup-vercel-db.sh
# Вариант 2: VERCEL_TOKEN=xxx ./scripts/setup-vercel-db.sh
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env.vercel ]; then
  echo "Ошибка: .env.vercel не найден."
  echo "Создайте Neon БД: mv .env .env.bak && npx get-db --yes"
  echo "Затем: cp .env .env.vercel && mv .env.bak .env"
  exit 1
fi

echo "Добавляю DATABASE_URL в Vercel (production)..."
npx vercel env add DATABASE_URL production < .env.vercel

echo ""
echo "Готово. Сделайте redeploy: git push или npx vercel --prod"

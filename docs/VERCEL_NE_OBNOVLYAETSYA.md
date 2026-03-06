# Vercel не обновляется после push в Git

## Почему так бывает

Vercel собирает **старый коммит** вместо последнего. В логах было: `Cloning github.com/BtkPavel/MyFin (Branch: main, Commit: a406c3e)` — при том что актуальный коммит новее.

## Что проверить

### 1. Репозиторий и ветка

Vercel → **my-fin** → **Settings** → **Git**:

- **Connected Git Repository**: `BtkPavel/MyFin` (без форков)
- **Production Branch**: `main`

Если репозиторий неверный → **Disconnect** и заново подключите `https://github.com/BtkPavel/MyFin`.

### 2. Автодеплой

В том же разделе:

- **Deploy Preview** — включён
- **Production Deployment** — **Automatic** (из branch main)

### 3. Deploy Hook

Если пуши идут, а деплой не запускается:

1. Settings → **Git** → **Deploy Hooks**
2. Создайте hook для Production
3. Сохраните URL
4. Можно дергать его вручную после `git push`:
   ```bash
   curl -X POST "ВАSH_HOOK_URL"
   ```

### 4. Ручной деплой

**Deployments** → **Create Deployment** → ветка **main** → кнопка **Deploy**.

Так можно задеплоить последний коммит, даже если вебхук не сработал.

### 5. Кэш Vercel

Иногда помогает:

- **Deployments** → последний деплой → **⋯** → **Redeploy**
- Поставить галочку **Use existing Build Cache** = **No**

## Дополнительно

Если проект в команде (например, **welmeris**), убедитесь, что:

- деплой идёт из нужного репозитория, а не из форка;
- у вас есть доступ к настройкам Git в Vercel.

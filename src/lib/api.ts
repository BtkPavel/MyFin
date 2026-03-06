/**
 * fetch с таймаутом — защита от «зависания» при холодном старте Neon/Vercel
 */
const API_TIMEOUT_MS = 25000;

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    throw err;
  }
}

export const SLOW_SERVER_MSG =
  "Сервер отвечает медленно (база «просыпается» после паузы). Попробуйте ещё раз — обычно срабатывает за пару секунд.";

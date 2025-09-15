// lib/rateLimit.ts
type Record = {
  count: number;
  reset: number;
};

const userLimits = new Map<string, Record>();

export function checkRateLimit(
  key: string,
  limit = 5, // max requests
  windowMs = 60_000 // 1 minute
) {
  const now = Date.now();
  const record = userLimits.get(key);

  if (!record || now > record.reset) {
    userLimits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}

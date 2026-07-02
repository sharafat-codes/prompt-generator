// Freemium plan limits (generations per month). Central so metering and the
// usage meter read the same numbers.
export const PLAN_GENERATION_LIMIT: Record<string, number> = {
  FREE: 200,
  PRO: 5000,
  TEAM: 20000,
};

export function generationLimit(plan: string) {
  return PLAN_GENERATION_LIMIT[plan] ?? PLAN_GENERATION_LIMIT.FREE;
}

/** Current metering period as YYYY-MM (UTC). */
export function currentPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

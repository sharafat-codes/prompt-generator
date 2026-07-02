import { prisma } from "@/lib/db";

export type Insights = {
  totalPrompts: number;
  totalRuns: number;
  runsThisMonth: number;
  daily: { date: string; count: number }[]; // last 14 days, oldest first
  topPrompts: { title: string; slug: string; runs: number }[];
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getInsights(workspaceId: string): Promise<Insights> {
  const now = new Date();
  const since = new Date(now);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [totalPrompts, totalRuns, runsThisMonth, rawDaily, grouped] = await Promise.all([
    prisma.prompt.count({ where: { workspaceId, status: "ACTIVE" } }),
    prisma.run.count({ where: { workspaceId } }),
    prisma.run.count({ where: { workspaceId, createdAt: { gte: monthStart } } }),
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, count(*)::int AS count
      FROM "runs"
      WHERE "workspaceId" = ${workspaceId} AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC`,
    prisma.run.groupBy({
      by: ["promptId"],
      where: { workspaceId, promptId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { promptId: "desc" } },
      take: 5,
    }),
  ]);

  const byDay = new Map<string, number>();
  for (const row of rawDaily) byDay.set(dayKey(new Date(row.day)), Number(row.count));

  const daily: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dayKey(d);
    daily.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  const ids = grouped.map((g) => g.promptId).filter((x): x is string => Boolean(x));
  const prompts = ids.length
    ? await prisma.prompt.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const pmap = new Map(prompts.map((p) => [p.id, p]));
  const topPrompts = grouped.flatMap((g) => {
    const p = g.promptId ? pmap.get(g.promptId) : undefined;
    return p ? [{ title: p.title, slug: p.slug, runs: g._count._all }] : [];
  });

  return { totalPrompts, totalRuns, runsThisMonth, daily, topPrompts };
}

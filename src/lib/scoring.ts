import { Article, SourceType } from "@/types/news";

const SOURCE_TYPE_WEIGHTS: Record<SourceType, number> = {
  trade_press: 88,
  major_newswire: 92,
  company_release: 52,
  government_mod: 90,
  think_tank_policy: 80,
  financial_press: 84,
};

const PRIORITY_TERMS = [
  "contract",
  "procurement",
  "delivery",
  "sanctions",
  "export control",
  "escalation",
  "m&a",
  "budget",
];

export function scoreArticle(base: Omit<Article, "priorityScore" | "relevanceScore" | "trustScore" | "mostDiscussedScore">): Article {
  const trustScore = clamp(
    Math.round(SOURCE_TYPE_WEIGHTS[base.sourceType] + (base.source.baseTrust - 80) * 0.8),
    35,
    99,
  );

  const text = `${base.title} ${base.summary}`.toLowerCase();
  const termHits = PRIORITY_TERMS.reduce((acc, term) => (text.includes(term) ? acc + 1 : acc), 0);
  const priorityRaw = 52 + termHits * 8 + base.companies.length * 2 + base.platforms.length * 2 + (base.isPressRelease ? -14 : 4);
  const priorityScore = clamp(priorityRaw, 10, 100);

  const relevanceRaw = 54 + base.topics.length * 3 + base.entities.length * 2 + (base.regions.length > 1 ? 3 : 0) + (base.isPressRelease ? -10 : 4);
  const relevanceScore = clamp(relevanceRaw, 12, 100);

  const mostDiscussedScore = clamp(Math.round((priorityScore + relevanceScore + trustScore) / 3 + termHits * 3), 10, 100);

  return {
    ...base,
    trustScore,
    priorityScore,
    relevanceScore,
    mostDiscussedScore,
  };
}

export function dedupeHeadlineKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .filter((token) => token.length > 2)
    .slice(0, 9)
    .join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

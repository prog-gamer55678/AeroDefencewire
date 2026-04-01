import { Article } from "@/types/news";

export type SortMode = "newest" | "relevant" | "priority" | "discussed";

export interface FeedFilters {
  topic?: string;
  geography?: string;
  company?: string;
  platform?: string;
  source?: string;
  timeWindowHours: number;
  savedOnly: boolean;
  highSignalOnly: boolean;
  hidePressReleases: boolean;
}

export function applyFeedFilters(articles: Article[], filters: FeedFilters) {
  const cutoff = Date.now() - filters.timeWindowHours * 60 * 60 * 1000;
  return articles.filter((a) => {
    if (new Date(a.publishedAt).getTime() < cutoff) return false;
    if (filters.savedOnly && !a.isSaved) return false;
    if (filters.highSignalOnly && (a.priorityScore < 70 || a.relevanceScore < 70)) return false;
    if (filters.hidePressReleases && a.isPressRelease) return false;
    if (filters.topic && !a.topics.includes(filters.topic)) return false;
    if (filters.geography && !a.regions.includes(filters.geography)) return false;
    if (filters.company && !a.companies.includes(filters.company)) return false;
    if (filters.platform && !a.platforms.includes(filters.platform)) return false;
    if (filters.source && a.source.name !== filters.source) return false;
    return true;
  });
}

export function sortFeed(articles: Article[], sort: SortMode) {
  const sorted = [...articles];
  sorted.sort((a, b) => {
    if (sort === "newest") return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    if (sort === "priority") return b.priorityScore - a.priorityScore;
    if (sort === "discussed") return b.mostDiscussedScore - a.mostDiscussedScore;
    return b.relevanceScore - a.relevanceScore;
  });
  return sorted;
}

export type SourceType =
  | "trade_press"
  | "major_newswire"
  | "company_release"
  | "government_mod"
  | "think_tank_policy"
  | "financial_press";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  baseTrust: number;
  regionFocus: string[];
  website: string;
}

export interface Topic {
  id: string;
  name: string;
  category: string;
}

export interface Entity {
  id: string;
  name: string;
  type: "company" | "country" | "programme" | "platform";
}

export interface Company {
  id: string;
  name: string;
  headquarters: string;
  watchTags: string[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  url: string;
  source: Source;
  publishedAt: string;
  topics: string[];
  regions: string[];
  entities: string[];
  companies: string[];
  platforms: string[];
  sourceType: SourceType;
  priorityScore: number;
  relevanceScore: number;
  trustScore: number;
  mostDiscussedScore: number;
  isPressRelease: boolean;
  isSaved: boolean;
  isRead: boolean;
}

export interface Watchlist {
  id: string;
  name: string;
  companies: string[];
  platforms: string[];
  countries: string[];
  regions: string[];
  topics: string[];
}

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  density: "compact" | "comfortable";
  defaultSort: "newest" | "relevant" | "priority" | "discussed";
  preferredTopics: string[];
  sourceWeighting: Record<SourceType, number>;
  enabledSourceCategories: SourceType[];
  hidePressReleases: boolean;
  timezone: string;
  mockApiEndpoint: string;
}

"use client";

import { articles as seedArticles, initialPreferences, initialWatchlists } from "@/data/mock-data";
import { UserPreferences, Watchlist } from "@/types/news";
import { create } from "zustand";

type View = "dashboard" | "feed" | "topics" | "companies" | "watchlists" | "saved" | "settings";

interface WireState {
  view: View;
  articles: typeof seedArticles;
  watchlists: Watchlist[];
  preferences: UserPreferences;
  selectedArticleId?: string;
  setView: (view: View) => void;
  toggleSaved: (id: string) => void;
  markRead: (ids: string[]) => void;
  addToWatchlist: (watchlistId: string, company: string) => void;
  setSelectedArticle: (id?: string) => void;
  updatePreferences: (next: Partial<UserPreferences>) => void;
}

export const useWireStore = create<WireState>((set) => ({
  view: "dashboard",
  articles: seedArticles,
  watchlists: initialWatchlists,
  preferences: initialPreferences,
  setView: (view) => set({ view }),
  toggleSaved: (id) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, isSaved: !a.isSaved } : a)),
    })),
  markRead: (ids) =>
    set((state) => ({
      articles: state.articles.map((a) => (ids.includes(a.id) ? { ...a, isRead: true } : a)),
    })),
  addToWatchlist: (watchlistId, company) =>
    set((state) => ({
      watchlists: state.watchlists.map((w) =>
        w.id === watchlistId && !w.companies.includes(company)
          ? { ...w, companies: [...w.companies, company] }
          : w,
      ),
    })),
  setSelectedArticle: (id) => set({ selectedArticleId: id }),
  updatePreferences: (next) =>
    set((state) => ({
      preferences: { ...state.preferences, ...next },
    })),
}));

export type { View };

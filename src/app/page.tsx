"use client";

import { companies, initialWatchlists, topics } from "@/data/mock-data";
import { applyFeedFilters, sortFeed, type FeedFilters } from "@/lib/feed";
import { useWireStore, type View } from "@/store/use-wire-store";
import type { Article, UserPreferences } from "@/types/news";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  Building2,
  ChartColumnBig,
  Check,
  Command,
  FileText,
  Globe2,
  ListFilter,
  Moon,
  Newspaper,
  PanelLeft,
  Settings,
  Star,
  Sun,
  Telescope,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type Dispatch, type ElementType, type SetStateAction, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const NAV: { id: View; label: string; icon: ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: ChartColumnBig },
  { id: "feed", label: "Live Feed", icon: Newspaper },
  { id: "topics", label: "Topics", icon: FileText },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "watchlists", label: "Watchlists", icon: Star },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Home() {
  const { setTheme, theme } = useTheme();
  const store = useWireStore();
  const [nowTs] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [showCommand, setShowCommand] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);
  const [filters, setFilters] = useState<FeedFilters>({
    timeWindowHours: 72,
    savedOnly: false,
    highSignalOnly: false,
    hidePressReleases: store.preferences.hidePressReleases,
  });

  const filtered = useMemo(
    () => sortFeed(applyFeedFilters(store.articles, filters), store.preferences.defaultSort),
    [store.articles, store.preferences.defaultSort, filters],
  );

  const kpi = useMemo(() => {
    const last24 = store.articles.filter((a) => +new Date(a.publishedAt) > nowTs - 24 * 60 * 60 * 1000);
    return {
      stories24h: last24.length,
      sources: new Set(last24.map((a) => a.source.id)).size,
      highPriority: last24.filter((a) => a.priorityScore > 75).length,
      procurement: last24.filter((a) => a.topics.includes("procurement")).length,
      spaceAero: last24.filter((a) => a.topics.includes("space") || a.topics.includes("aerospace")).length,
      geopolitical: last24.filter((a) => a.topics.includes("sanctions") || a.topics.includes("export-controls")).length,
    };
  }, [store.articles, nowTs]);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-3 md:block">
        <div className="mb-4 flex items-center gap-2 rounded-md border border-border px-2 py-2 text-sm font-semibold">
          <Telescope className="h-4 w-4 text-sky-400" /> AeroDefence Wire
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => store.setView(item.id)} className={`flex w-full items-center gap-2 rounded px-2 py-2 text-sm ${store.view === item.id ? "bg-muted text-foreground" : "text-slate-400 hover:bg-muted/50"}`}>
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/90 p-3 backdrop-blur">
          <button className="rounded border border-border p-2 md:hidden"><PanelLeft className="h-4 w-4" /></button>
          <button onClick={() => setShowCommand((v) => !v)} className="flex flex-1 items-center gap-2 rounded border border-border bg-card px-3 py-2 text-sm text-slate-400">
            <Command className="h-4 w-4" /> Search companies, topics, watchlists... <span className="ml-auto text-xs">Cmd/Ctrl+K</span>
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded border border-border p-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>
        <section className="wire-scroll min-h-0 flex-1 overflow-auto p-4">
          {store.view === "dashboard" && <DashboardView kpi={kpi} store={store} />}
          {store.view === "feed" && (
            <FeedView
              store={store}
              query={query}
              setQuery={setQuery}
              filtered={filtered}
              setFilters={setFilters}
              bulkSelection={bulkSelection}
              setBulkSelection={setBulkSelection}
            />
          )}
          {store.view === "topics" && <TopicsView onPick={(topic) => { store.setView("feed"); setFilters((f) => ({ ...f, topic })); }} />}
          {store.view === "companies" && <CompaniesView store={store} />}
          {store.view === "watchlists" && <WatchlistsView />}
          {store.view === "saved" && <SavedView store={store} />}
          {store.view === "settings" && <SettingsView store={store} />}
        </section>
      </main>
      {showCommand && (
        <div className="fixed inset-0 z-30 bg-black/40 p-4" onClick={() => setShowCommand(false)}>
          <div className="mx-auto max-w-xl rounded border border-border bg-card p-3" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-sm text-slate-400">Quick jump</p>
            <div className="space-y-1 text-sm">
              {[...topics.map((t) => t.name), ...companies.slice(0, 8).map((c) => c.name), ...initialWatchlists.map((w) => w.name)].slice(0, 14).map((item) => (
                <button key={item} className="block w-full rounded px-2 py-1 text-left hover:bg-muted">{item}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type WireStore = {
  articles: Article[];
  preferences: UserPreferences;
  selectedArticleId?: string;
  toggleSaved: (id: string) => void;
  markRead: (ids: string[]) => void;
  setSelectedArticle: (id?: string) => void;
  addToWatchlist: (watchlistId: string, company: string) => void;
  updatePreferences: (next: Partial<UserPreferences>) => void;
};

function DashboardView({ kpi, store }: { kpi: Record<string, number>; store: WireStore }) {
  const trend = store.articles.slice(0, 6).map((a, i) => ({ i, score: Math.round((a.priorityScore + a.relevanceScore) / 2), label: a.id.toUpperCase() }));
  const top = sortFeed([...store.articles], "priority").slice(0, 6);
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {Object.entries(kpi).map(([k, v]) => <div key={k} className="rounded border border-border bg-card p-3"><p className="text-xs uppercase text-slate-400">{k}</p><p className="text-xl font-semibold">{v}</p></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded border border-border bg-card p-3 lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold">Top developments</h2>
          <div className="space-y-2">{top.map((a) => <div key={a.id} className="rounded border border-border p-2"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-slate-400">{a.source.name} - {formatDistanceToNow(new Date(a.publishedAt))} ago</p></div>)}</div>
        </div>
        <div className="rounded border border-border bg-card p-3">
          <h2 className="mb-2 text-sm font-semibold">This week trend</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}><XAxis dataKey="label" hide /><Tooltip /><Area dataKey="score" stroke="#0ea5e9" fill="#0ea5e933" /></AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">Analyst notes placeholder: morning brief / contracts radar / programme tracker.</p>
        </div>
      </div>
    </div>
  );
}

function FeedView({
  store,
  query,
  setQuery,
  filtered,
  setFilters,
  bulkSelection,
  setBulkSelection,
}: {
  store: WireStore;
  query: string;
  setQuery: (value: string) => void;
  filtered: Article[];
  setFilters: Dispatch<SetStateAction<FeedFilters>>;
  bulkSelection: string[];
  setBulkSelection: Dispatch<SetStateAction<string[]>>;
}) {
  const shown = filtered.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 rounded border border-border bg-card p-2">
        <div className="flex flex-wrap gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter headlines..." className="min-w-56 flex-1 rounded border border-border bg-background px-2 py-1 text-sm" />
          <select onChange={(e) => store.updatePreferences({ defaultSort: e.target.value as UserPreferences["defaultSort"] })} className="rounded border border-border bg-background px-2 py-1 text-sm"><option value="newest">Newest</option><option value="relevant">Most relevant</option><option value="priority">Highest priority</option><option value="discussed">Most discussed</option></select>
          <button onClick={() => setFilters((f: FeedFilters) => ({ ...f, highSignalOnly: !f.highSignalOnly }))} className="rounded border border-border px-2 py-1 text-sm"><ListFilter className="mr-1 inline h-3 w-3" />High-signal only</button>
          <button onClick={() => setFilters((f: FeedFilters) => ({ ...f, hidePressReleases: !f.hidePressReleases }))} className="rounded border border-border px-2 py-1 text-sm">Press releases hidden</button>
          <button onClick={() => store.toggleSaved(shown[0]?.id)} className="rounded border border-border px-2 py-1 text-sm">Save</button>
          <button onClick={() => store.markRead(bulkSelection)} className="rounded border border-border px-2 py-1 text-sm">Mark read</button>
        </div>
      </div>
      {shown.length === 0 ? <div className="rounded border border-dashed border-border p-8 text-center text-sm text-slate-400">No matching stories in selected window.</div> : shown.map((a) => (
        <article key={a.id} className="rounded border border-border bg-card p-3">
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={bulkSelection.includes(a.id)} onChange={(e) => setBulkSelection((prev: string[]) => e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id))} /><Globe2 className="h-3 w-3" />{a.source.name} - {formatDistanceToNow(new Date(a.publishedAt))} ago {a.isPressRelease && <span className="rounded bg-amber-600/20 px-1 text-amber-300">company release</span>}</div>
          <h3 className="text-sm font-semibold">{a.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{a.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1">{[...a.topics, ...a.regions].slice(0, 6).map((t: string) => <span key={t} className="rounded bg-muted px-2 py-0.5 text-xs">{t}</span>)}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">P {a.priorityScore} / R {a.relevanceScore} / T {a.trustScore} <button className="rounded border border-border px-1.5 py-0.5" onClick={() => store.setSelectedArticle(a.id)}>Open detail</button> <button className="rounded border border-border px-1.5 py-0.5" onClick={() => store.toggleSaved(a.id)}>{a.isSaved ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}</button></div>
        </article>
      ))}
      {store.selectedArticleId && <ArticleDetail store={store} />}
    </div>
  );
}

function ArticleDetail({ store }: { store: WireStore }) {
  const article = store.articles.find((a) => a.id === store.selectedArticleId);
  if (!article) return null;
  const related = store.articles.filter((a) => a.id !== article.id && a.topics.some((t) => article.topics.includes(t))).slice(0, 3);
  return <div className="fixed inset-y-0 right-0 z-20 w-full max-w-xl border-l border-border bg-card p-4"><button onClick={() => store.setSelectedArticle(undefined)} className="mb-2 rounded border border-border px-2 py-1 text-xs">Close</button><h3 className="text-base font-semibold">{article.title}</h3><p className="mt-1 text-sm text-slate-300">{article.summary}</p><div className="mt-3 rounded border border-border bg-background p-2 text-sm"><p className="text-xs uppercase text-slate-400">Why it matters</p>{article.whyItMatters}</div><p className="mt-3 text-xs text-slate-400">Source type: {article.sourceType}</p><a href={article.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-sky-400">Original source</a><div className="mt-4"><p className="mb-1 text-xs uppercase text-slate-400">Related stories</p>{related.map((r) => <p key={r.id} className="mb-1 text-sm">{r.title}</p>)}</div></div>;
}

function TopicsView({ onPick }: { onPick: (topic: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{topics.map((t) => <button key={t.id} onClick={() => onPick(t.id)} className="rounded border border-border bg-card p-3 text-left"><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-slate-400">{t.category}</p></button>)}</div>;
}

function CompaniesView({ store }: { store: WireStore }) {
  return <div className="grid gap-2 lg:grid-cols-3">{companies.map((c) => <div key={c.id} className="rounded border border-border bg-card p-3"><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate-400">Recent stories: {store.articles.filter((a) => a.companies.includes(c.name)).length}</p><button className="mt-2 rounded border border-border px-2 py-1 text-xs" onClick={() => store.addToWatchlist("w1", c.name)}>Add to watchlist</button></div>)}</div>;
}

function WatchlistsView() {
  return <div className="grid gap-3 md:grid-cols-2">{initialWatchlists.map((w) => <div key={w.id} className="rounded border border-border bg-card p-3"><p className="text-sm font-semibold">{w.name}</p><p className="text-xs text-slate-400">{w.topics.join(", ") || "No topic filters"}</p></div>)}</div>;
}

function SavedView({ store }: { store: WireStore }) {
  const saved = store.articles.filter((a) => a.isSaved);
  return <div className="space-y-2">{saved.length === 0 ? <div className="rounded border border-dashed border-border p-6 text-center text-sm text-slate-400">No saved stories yet.</div> : saved.map((a) => <div key={a.id} className="rounded border border-border bg-card p-3"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-slate-400">{a.isRead ? "Read" : "Unread"}</p></div>)}</div>;
}

function SettingsView({ store }: { store: WireStore }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded border border-border bg-card p-3">
        <p className="mb-2 text-sm font-semibold">Preferences</p>
        <label className="mb-2 block text-xs text-slate-400">Density</label>
        <select value={store.preferences.density} onChange={(e) => store.updatePreferences({ density: e.target.value as UserPreferences["density"] })} className="w-full rounded border border-border bg-background px-2 py-1 text-sm"><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select>
        <label className="mb-2 mt-3 block text-xs text-slate-400">Timezone</label>
        <input className="w-full rounded border border-border bg-background px-2 py-1 text-sm" value={store.preferences.timezone} onChange={(e) => store.updatePreferences({ timezone: e.target.value })} />
      </div>
      <div className="rounded border border-border bg-card p-3">
        <p className="mb-2 text-sm font-semibold">Source controls</p>
        <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => store.updatePreferences({ hidePressReleases: !store.preferences.hidePressReleases })}>
          {store.preferences.hidePressReleases ? "Show press releases" : "Hide press releases"}
        </button>
        <p className="mt-3 text-xs text-slate-400">Mock API endpoint: {store.preferences.mockApiEndpoint}</p>
      </div>
    </div>
  );
}

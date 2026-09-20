const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT = __dirname;

app.use(express.static(ROOT, { extensions: ["html"] }));

async function json(url, options = {}) {
  const r = await fetch(url, options);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function brave(q, type) {
  const key = process.env.BRAVE_API_KEY;
  if (!key) return { results: [], configured: false, source: "Brave" };
  const endpoint =
    type === "news" ? "https://api.search.brave.com/res/v1/news/search" :
    type === "images" ? "https://api.search.brave.com/res/v1/images/search" :
    type === "videos" ? "https://api.search.brave.com/res/v1/videos/search" :
    "https://api.search.brave.com/res/v1/web/search";
  const u = new URL(endpoint);
  u.searchParams.set("q", q);
  u.searchParams.set("count", "20");
  u.searchParams.set("country", process.env.SEARCH_COUNTRY || "JP");
  u.searchParams.set("search_lang", process.env.SEARCH_LANG || "ja");
  const d = await json(u, { headers: { "X-Subscription-Token": key, "Accept": "application/json" } });
  const raw = d.web?.results || d.results || [];
  return {
    configured: true, source: "Brave",
    results: raw.map(x => ({
      title: x.title || x.name || "",
      url: x.url || x.link || "",
      snippet: x.description || x.snippet || "",
      source: "Brave Search"
    }))
  };
}

async function google(q) {
  const key = process.env.GOOGLE_CSE_API_KEY, cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return { results: [], configured: false, source: "Google" };
  const u = new URL("https://www.googleapis.com/customsearch/v1");
  u.searchParams.set("key", key); u.searchParams.set("cx", cx); u.searchParams.set("q", q);
  const d = await json(u);
  return { configured: true, source: "Google", results: (d.items || []).map(x => ({
    title: x.title, url: x.link, snippet: x.snippet || "", source: "Google"
  }))};
}

async function bing(q) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return { results: [], configured: false, source: "Bing" };
  const u = new URL("https://api.bing.microsoft.com/v7.0/search");
  u.searchParams.set("q", q); u.searchParams.set("count", "20"); u.searchParams.set("mkt", "ja-JP");
  const d = await json(u, { headers: { "Ocp-Apim-Subscription-Key": key } });
  return { configured: true, source: "Bing", results: (d.webPages?.value || []).map(x => ({
    title: x.name, url: x.url, snippet: x.snippet || "", source: "Bing"
  }))};
}

app.get("/health", (req, res) => res.json({ ok: true, app: "Connect ONE" }));

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const type = String(req.query.type || "web");
  if (!q) return res.status(400).json({ error: "q is required" });
  try {
    const [b, g, bi] = await Promise.all([
      brave(q, type),
      type === "web" ? google(q) : Promise.resolve({ results: [], configured: false, source: "Google" }),
      type === "web" ? bing(q) : Promise.resolve({ results: [], configured: false, source: "Bing" })
    ]);
    const all = [...b.results, ...g.results, ...bi.results];
    const seen = new Set();
    const results = all.filter(x => {
      const k = (x.url || "").replace(/#.*$/, "");
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    res.json({
      query: q, type,
      providers: { brave: b.configured, google: g.configured, bing: bi.configured },
      results
    });
  } catch (e) {
    res.status(502).json({ error: "search provider error", detail: e.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Connect ONE listening on :${PORT}`);
});

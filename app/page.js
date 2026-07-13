"use client";

import {
  Bell, Bookmark, Bot, CheckCircle, ChevronLeft, ChevronRight, Film, Gauge,
  History, LayoutDashboard, Menu, MoreHorizontal, PlayCircle, Search, Sparkles, Star, Trash2, TrendingUp, Tv, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const preview = [
  { id: 1, name: "Dune: Part Two", type: "Movie", mediaType: "movie", year: "2024", rating: 8.2, votes: 650000, popularity: 286, genres: ["Science Fiction", "Adventure"], poster: null },
  { id: 2, name: "Shōgun", type: "Series", mediaType: "tv", year: "2024", rating: 8.6, votes: 180000, popularity: 248, genres: ["Drama", "War & Politics"], poster: null },
  { id: 3, name: "Oppenheimer", type: "Movie", mediaType: "movie", year: "2023", rating: 8.1, votes: 980000, popularity: 196, genres: ["Drama", "History"], poster: null },
  { id: 4, name: "The Last of Us", type: "Series", mediaType: "tv", year: "2023", rating: 8.6, votes: 540000, popularity: 174, genres: ["Drama", "Sci-Fi & Fantasy"], poster: null },
];

const CARDS_PER_PAGE = 8;
const TMDB_RESULTS_PER_PAGE = 20;
const countryOptions = [["", "All countries"], ["IN", "India"], ["US", "United States"], ["GB", "United Kingdom"], ["KR", "South Korea"], ["JP", "Japan"], ["FR", "France"], ["DE", "Germany"]];
const languageOptions = [["", "All languages"], ["en", "English"], ["hi", "Hindi"], ["ta", "Tamil"], ["te", "Telugu"], ["ko", "Korean"], ["ja", "Japanese"], ["fr", "French"], ["es", "Spanish"]];
const sortOptions = [["popularity.desc", "Most popular"], ["vote_average.desc", "Top rated"], ["primary_release_date.desc", "Newest"]];
const WATCH_HISTORY_KEY = "cinescope-watch-history";
const RECENT_SEARCH_RESULTS_KEY = "lumiverse-recent-search-results";
const lumiCategories = [
  { key: "popular", emoji: "🍿", label: "Popular Now" },
  { key: "top-rated", emoji: "⭐", label: "Top Rated" },
  { key: "new", emoji: "🆕", label: "New Releases" },
  { key: "family", emoji: "👨‍👩‍👧", label: "Family" },
  { key: "superhero", emoji: "🦸", label: "Superhero" },
  { key: "fantasy", emoji: "🧙", label: "Fantasy" },
  { key: "horror", emoji: "👻", label: "Horror" },
  { key: "mystery", emoji: "🕵️", label: "Mystery" },
  { key: "sci-fi", emoji: "🚀", label: "Sci-Fi" },
  { key: "romance", emoji: "💕", label: "Romance" },
  { key: "comedy", emoji: "😂", label: "Comedy" },
  { key: "action", emoji: "⚔️", label: "Action" },
  { key: "psychological", emoji: "🧠", label: "Psychological" },
  { key: "drama", emoji: "🎭", label: "Drama" },
  { key: "international", emoji: "🌍", label: "International" },
  { key: "indian", emoji: "🇮🇳", label: "Indian" },
  { key: "documentary", emoji: "📄", label: "Documentary" },
];

function Logo() {
  return <div className="logo"><img src="/lumiverse-logo.png" alt="LumiVerse" width="492" height="160" /></div>;
}

function PosterFallback({ item }) {
  return (
    <div className={`fallback-poster fallback-${item.id % 4}`}>
      <span>{item.type}</span><strong>{item.name}</strong><small>{item.year}</small>
    </div>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function formatWatchedAt(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [enteringApp, setEnteringApp] = useState(false);
  const [section, setSection] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(preview);
  const [totalResults, setTotalResults] = useState(preview.length);
  const [genreOptions, setGenreOptions] = useState([]);
  const [filters, setFilters] = useState({ genre: "", country: "", language: "", sort: "popularity.desc" });
  const [watchlist, setWatchlist] = useState([]);
  const [watchHistory, setWatchHistory] = useState({});
  const [historyReady, setHistoryReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lumiInput, setLumiInput] = useState("");
  const [lumiMood, setLumiMood] = useState("");
  const [lumiResults, setLumiResults] = useState([]);
  const [lumiLoading, setLumiLoading] = useState(false);
  const [lumiError, setLumiError] = useState("");
  const [lumiOpen, setLumiOpen] = useState(false);
  const [lumiMediaType, setLumiMediaType] = useState("movie");
  const [lumiCategory, setLumiCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [episodeData, setEpisodeData] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [recommendationModal, setRecommendationModal] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodeError, setEpisodeError] = useState("");
  const [recentSearchResults, setRecentSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  const view = section === "Movies" ? "movie" : section === "Series" ? "tv" : "all";
  const isSearchSection = section === "Search";
  const nav = [
    { section: "Overview", label: "Home", Icon: LayoutDashboard },
    { section: "Movies", label: "Movies", Icon: Film },
    { section: "Series", label: "TV Shows", Icon: Tv },
    { section: "Trends", label: "Trends", Icon: TrendingUp },
  ];
  const searchTerm = query.trim();
  const hasActiveFilters = filters.genre || filters.country || filters.language || filters.sort !== "popularity.desc";
  const tmdbPage = searchTerm || hasActiveFilters ? page + 1 : 1;
  const historyItems = useMemo(() => Object.values(watchHistory).sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)), [watchHistory]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(WATCH_HISTORY_KEY);
      if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
    } catch {
      setWatchHistory({});
    } finally {
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedResults = localStorage.getItem(RECENT_SEARCH_RESULTS_KEY);
      if (savedResults) setRecentSearchResults(JSON.parse(savedResults));
    } catch {
      setRecentSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(watchHistory));
  }, [historyReady, watchHistory]);

  useEffect(() => {
    setPage(0);
  }, [query, view, filters]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ view });
        if (searchTerm) {
          params.set("query", searchTerm);
          params.set("page", String(tmdbPage));
        }
        if (filters.genre) params.set("genre", filters.genre);
        if (filters.country) params.set("country", filters.country);
        if (filters.language) params.set("language", filters.language);
        if (filters.sort) params.set("sort", filters.sort);
        const response = await fetch(`/api/tmdb?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setItems(data.results);
        setTotalResults(data.totalResults ?? data.results.length);
        setGenreOptions(data.filterGenres || genreOptions);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, searchTerm ? 450 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, searchTerm, tmdbPage, view]);

  useEffect(() => {
    if (!selectedSeries) return;
    const controller = new AbortController();
    async function loadEpisodes() {
      const detailKey = `${selectedSeries.mediaType}-${selectedSeries.id}-${selectedSeries.mediaType === "tv" ? selectedSeason || "default" : "movie"}`;
      if (detailCache[detailKey]) {
        setEpisodeData(detailCache[detailKey]);
        if (detailCache[detailKey].selectedSeason && String(detailCache[detailKey].selectedSeason) !== selectedSeason) {
          setSelectedSeason(String(detailCache[detailKey].selectedSeason));
        }
        setEpisodeError("");
        setEpisodesLoading(false);
        return;
      }
      setEpisodesLoading(true);
      try {
        const params = new URLSearchParams({ detailId: String(selectedSeries.id), mediaType: selectedSeries.mediaType });
        if (selectedSeries.mediaType === "tv" && selectedSeason) params.set("season", selectedSeason);
        const response = await fetch(`/api/tmdb?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setEpisodeData(data);
        setDetailCache((current) => {
          const selectedKey = data.selectedSeason ? `${selectedSeries.mediaType}-${selectedSeries.id}-${data.selectedSeason}` : detailKey;
          return { ...current, [detailKey]: data, [selectedKey]: data };
        });
        if (data.selectedSeason && String(data.selectedSeason) !== selectedSeason) setSelectedSeason(String(data.selectedSeason));
        setEpisodeError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") setEpisodeError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setEpisodesLoading(false);
      }
    }
    loadEpisodes();
    return () => controller.abort();
  }, [detailCache, selectedSeason, selectedSeries]);

  useEffect(() => {
    if (!recommendationModal) return;
    const controller = new AbortController();
    async function loadRecommendations() {
      setRecommendationsLoading(true);
      setRecommendationsError("");
      setRecommendations([]);
      try {
        const params = new URLSearchParams({
          recommendId: String(recommendationModal.id),
          recommendType: recommendationModal.mediaType,
        });
        const response = await fetch(`/api/tmdb?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setRecommendations(data.results || []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setRecommendationsError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setRecommendationsLoading(false);
      }
    }
    loadRecommendations();
    return () => controller.abort();
  }, [recommendationModal]);

  const visibleItems = useMemo(() => {
    if (isSearchSection && !searchTerm) return recentSearchResults;
    if (section === "Lumi Picks") return lumiResults.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);
    if (section === "Watch History") return historyItems.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE).map((entry) => entry.item);
    if (section === "My Watchlist") return items.filter((item) => watchlist.includes(`${item.mediaType}-${item.id}`));
    if (searchTerm || hasActiveFilters) return items;
    return items.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);
  }, [hasActiveFilters, historyItems, isSearchSection, items, lumiResults, page, recentSearchResults, searchTerm, section, watchlist]);

  const pageableTotal = isSearchSection && !searchTerm
    ? recentSearchResults.length
    : section === "My Watchlist"
    ? items.filter((item) => watchlist.includes(`${item.mediaType}-${item.id}`)).length
    : section === "Watch History"
      ? historyItems.length
      : section === "Lumi Picks"
        ? lumiResults.length
    : searchTerm || hasActiveFilters
      ? totalResults
      : items.length;
  const activePageSize = section === "Lumi Picks" || section === "Watch History" || section === "My Watchlist" || (!searchTerm && !hasActiveFilters)
    ? CARDS_PER_PAGE
    : TMDB_RESULTS_PER_PAGE;

  const selectSection = (label) => { setSection(label); setMobileNav(false); setPage(0); };
  const rememberSearchResults = (results = items) => {
    if (!isSearchSection || !searchTerm || !results.length) return;
    setRecentSearchResults((current) => {
      const seen = new Set();
      const next = [...results, ...current]
        .filter((item) => {
          const key = `${item.mediaType}-${item.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 12);
      localStorage.setItem(RECENT_SEARCH_RESULTS_KEY, JSON.stringify(next));
      return next;
    });
  };
  useEffect(() => {
    if (!isSearchSection || !searchTerm || loading) return;
    rememberSearchResults(items);
  }, [isSearchSection, items, loading, searchTerm]);
  const focusSearch = () => {
    setSection("Search");
    setQuery("");
    setPage(0);
    setMobileNav(false);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  };
  const toggleWatchlist = (item) => {
    const key = `${item.mediaType}-${item.id}`;
    setWatchlist((current) => current.includes(key) ? current.filter((id) => id !== key) : [...current, key]);
  };
  const toggleWatched = (item) => {
    const key = `${item.mediaType}-${item.id}`;
    setWatchHistory((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return {
        ...current,
        [key]: {
          key,
          watchedAt: new Date().toISOString(),
          item: {
            id: item.id,
            name: item.name,
            mediaType: item.mediaType,
            type: item.type,
            overview: item.overview || "",
            poster: item.poster,
            backdrop: item.backdrop,
            year: item.year,
            releaseDate: item.releaseDate || "",
            rating: item.rating,
            votes: item.votes,
            popularity: item.popularity,
            genres: item.genres || [],
          },
        },
      };
    });
  };
  const clearHistory = () => setWatchHistory({});
  const askLumi = async (prompt = lumiInput, options = {}) => {
    const moodRequest = prompt.trim();
    if (!moodRequest && !options.category) return;
    const keepOverlay = options.keepOverlay ?? lumiOpen;
    setLumiInput(moodRequest);
    if (options.category) setLumiCategory(options.category);
    setLumiLoading(true);
    setLumiError("");
    setPage(0);
    try {
      const params = new URLSearchParams();
      if (moodRequest) params.set("mood", moodRequest);
      if (options.category) params.set("category", options.category);
      params.set("mediaType", options.mediaType || lumiMediaType);
      const response = await fetch(`/api/tmdb?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setLumiMood(data.mood || "Mood");
      setLumiResults(data.results || []);
      setSection("Lumi Picks");
      if (!keepOverlay) setLumiOpen(false);
    } catch (requestError) {
      setLumiError(requestError.message);
    } finally {
      setLumiLoading(false);
    }
  };
  const openEpisodes = (item) => {
    setSelectedSeries(item);
    setSelectedSeason("");
    setEpisodeData(null);
    setEpisodeError("");
  };
  const closeEpisodes = () => {
    setSelectedSeries(null);
    setSelectedSeason("");
    setEpisodeData(null);
    setEpisodeError("");
  };
  const showMoreLikeThis = (item) => setRecommendationModal(item);
  const closeRecommendations = () => {
    setRecommendationModal(null);
    setRecommendations([]);
    setRecommendationsError("");
  };
  const openRecommendationDetails = (item) => {
    closeRecommendations();
    openEpisodes(item);
  };
  const selectLumiMediaType = (mediaType) => {
    setLumiMediaType(mediaType);
    if (lumiCategory || lumiInput.trim()) {
      askLumi(lumiInput || lumiCategory, { category: lumiCategory, mediaType, keepOverlay: true });
    }
  };
  const dragHorizontal = (event) => {
    const slider = event.currentTarget;
    slider.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startScrollLeft = slider.scrollLeft;
    slider.dataset.dragging = "false";
    const clickedButton = event.target.closest("button");
    slider.dataset.clickTarget = clickedButton?.dataset.prompt || "";
    slider.dataset.clickCategory = clickedButton?.dataset.category || "";
    slider.dataset.clickResultIndex = clickedButton?.dataset.resultIndex || "";
    const onMove = (moveEvent) => {
      if (Math.abs(moveEvent.clientX - startX) > 5) slider.dataset.dragging = "true";
      slider.scrollLeft = startScrollLeft - (moveEvent.clientX - startX);
    };
    const stopDrag = () => {
      if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
      slider.removeEventListener("pointermove", onMove);
      slider.removeEventListener("pointerup", stopDrag);
      slider.removeEventListener("pointercancel", stopDrag);
      if (slider.dataset.dragging !== "true" && slider.dataset.clickTarget) {
        askLumi(slider.dataset.clickTarget, { category: slider.dataset.clickCategory, mediaType: lumiMediaType, keepOverlay: true });
      } else if (slider.dataset.dragging !== "true" && slider.dataset.clickResultIndex) {
        const selectedItem = lumiResults[Number(slider.dataset.clickResultIndex)];
        if (selectedItem) {
          setLumiOpen(false);
          openEpisodes(selectedItem);
        }
      }
      window.setTimeout(() => { slider.dataset.dragging = "false"; }, 0);
    };
    slider.addEventListener("pointermove", onMove);
    slider.addEventListener("pointerup", stopDrag);
    slider.addEventListener("pointercancel", stopDrag);
  };
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ genre: "", country: "", language: "", sort: "popularity.desc" });
  const enterApp = () => {
    if (enteringApp) return;
    setEnteringApp(true);
    window.setTimeout(() => {
      setShowLanding(false);
      setEnteringApp(false);
    }, 3000);
  };

  return (
    <>
    {showLanding && (
      <main className={`landing-screen ${enteringApp ? "is-entering" : ""}`}>
        <div className="landing-hero">
          <button type="button" onClick={enterApp} disabled={enteringApp}>Enter</button>
        </div>
      </main>
    )}

    <main className={`app-shell ${isSearchSection ? "is-search-page" : ""} ${showLanding ? "is-waiting" : ""} ${enteringApp ? "is-revealing" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="side-top"><Logo /><button className="close-menu" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20} /></button></div>
        <nav>
          <p>DISCOVER</p>
          <button className={`search-nav ${section === "Search" ? "active" : ""}`} onClick={focusSearch}><Search size={19} /><span>Search</span></button>
          {nav.map(({ section: navSection, label, Icon }) => <button key={navSection} className={section === navSection ? "active" : ""} onClick={() => selectSection(navSection)}><Icon size={19} /><span>{label}</span></button>)}
          <p>LIBRARY</p>
          <button className={section === "My Watchlist" ? "active" : ""} onClick={() => selectSection("My Watchlist")}><Bookmark size={19} /><span>Wishlist</span><em>{watchlist.length}</em></button>
          <button className={section === "Watch History" ? "active" : ""} onClick={() => selectSection("Watch History")}><History size={19} /><span>Watch History</span><em>{historyItems.length}</em></button>
        </nav>
        <div className="insight-card">
          <div className="insight-icon"><Gauge size={21} /></div><b>Live TMDB Data</b>
          <span>Weekly trending movies and series, updated every 15 minutes.</span>
          <button onClick={() => selectSection("Trends")}>Explore trends <span>→</span></button>
        </div>
        <div className="profile"><div className="avatar">AS</div><div><b>Alex Smith</b><span>Analyst</span></div><MoreHorizontal size={18} /></div>
      </aside>

      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" />}

      <section className="workspace">
        <div className="content">
          {!isSearchSection && section !== "Overview" && <div className="title-row">
            <div><p className="eyebrow">TMDB ANALYTICS</p><h1>{section === "Overview" ? "Movie & Series Intelligence" : section}</h1><span>{isSearchSection ? searchTerm ? `Search results for “${query}”` : "Start typing in the search bar to find movies and TV shows." : section === "Lumi Picks" ? `Lumi found ${lumiMood.toLowerCase()} picks for "${lumiInput}".` : query ? `Search results for “${query}”` : "This week’s trending entertainment data."}</span></div>
            <div className="live-badge"><i /> LIVE DATA</div>
          </div>}

          {isSearchSection && <>
            <form className="search-page-bar" onSubmit={(event) => { event.preventDefault(); rememberSearchResults(); }}>
              <Search size={20} />
              <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => rememberSearchResults()} placeholder="Search movies and TV shows..." aria-label="Search movies and TV shows" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
            </form>
          </>}

          {error && <div className="api-notice"><div><b>Connect TMDB to load live data</b><span>{error}. Preview data is displayed for now.</span></div><a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">Get credentials →</a></div>}

          {section === "Watch History" && <div className="history-summary">
            <div><span>WATCHED TITLES</span><b>{historyItems.length}</b></div>
            <div><span>LATEST WATCH</span><b>{historyItems[0] ? formatWatchedAt(historyItems[0].watchedAt) : "None"}</b></div>
            <button disabled={!historyItems.length} onClick={clearHistory}><Trash2 size={14} /> Clear history</button>
          </div>}

          {section !== "Watch History" && section !== "Lumi Picks" && !isSearchSection && <div className="filters" aria-label="Catalog filters">
            <label><span>Genre</span><select value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}><option value="">All genres</option>{genreOptions.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}</select></label>
            <label><span>Country</span><select value={filters.country} onChange={(event) => updateFilter("country", event.target.value)}>{countryOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}</select></label>
            <label><span>Language</span><select value={filters.language} onChange={(event) => updateFilter("language", event.target.value)}>{languageOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}</select></label>
            <label><span>Popularity</span><select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button disabled={!hasActiveFilters} onClick={resetFilters}>Reset</button>
          </div>}

          <section className="trending-section">
            {(!isSearchSection || searchTerm || recentSearchResults.length > 0) && <div className="section-head"><div><h3>{isSearchSection ? searchTerm ? "Search Results" : "Recently Searched" : section === "Lumi Picks" ? `${lumiMood || "Mood"} Picks` : query ? "Search Results" : section === "My Watchlist" ? "Saved Titles" : section === "Watch History" ? "Recently Watched" : "Trending This Week"}</h3><p>{isSearchSection ? "" : section === "Lumi Picks" ? "Movies and series matched to your mood by Lumi" : section === "Watch History" ? "Titles you marked as watched on this device" : "Ratings, popularity and audience votes from TMDB"}</p></div>{(!isSearchSection || searchTerm) && <div className="pager"><button disabled={page === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))}><ChevronLeft size={15} /></button><span>{page + 1}</span><button disabled={(page + 1) * activePageSize >= pageableTotal} onClick={() => setPage((value) => value + 1)}><ChevronRight size={15} /></button></div>}</div>}
            <div className={`tmdb-grid ${isSearchSection ? "search-results-grid" : ""} ${loading || lumiLoading ? "is-loading" : ""}`}>
              {visibleItems.map((item, index) => {
                const key = `${item.mediaType}-${item.id}`;
                const watchedEntry = watchHistory[key];
                return <article className="tmdb-card" key={key} style={isSearchSection ? { "--card-index": index } : undefined}>
                  <div className="tmdb-image" role="button" tabIndex={0} onClick={() => openEpisodes(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") openEpisodes(item); }}>{item.poster ? <img src={item.poster} alt={`${item.name} poster`} width="500" height="750" loading="lazy" decoding="async" /> : <PosterFallback item={item} />}<button className={`watched-toggle ${watchedEntry ? "watched" : ""}`} onClick={(event) => { event.stopPropagation(); toggleWatched(item); }} aria-label={`${watchedEntry ? "Mark unwatched" : "Mark watched"}: ${item.name}`} title={watchedEntry ? "Watched" : "Not watched"}><CheckCircle size={16} fill={watchedEntry ? "currentColor" : "none"} /></button><button className={`save ${watchlist.includes(key) ? "saved" : ""}`} onClick={(event) => { event.stopPropagation(); toggleWatchlist(item); }} aria-label={`Save ${item.name}`}><Bookmark size={16} fill={watchlist.includes(key) ? "currentColor" : "none"} /></button><span className="media-type">{item.type}</span></div>
                  <div className="tmdb-info">
                    <div className="title-actions-row">
                      <h4>{item.name}</h4>
                      <div>
                        <button onClick={() => openEpisodes(item)} aria-label={`Open ${item.name} trailer`}><PlayCircle size={17} /></button>
                        <button onClick={() => showMoreLikeThis(item)} aria-label={`More like this: ${item.name}`} title="More like this"><Sparkles size={17} /></button>
                      </div>
                    </div>
                    <p>{item.genres.slice(0, 2).join(" • ") || "Genre unavailable"} • {item.year}</p>
                  </div>
                </article>;
              })}
              {isSearchSection && !searchTerm && !recentSearchResults.length && <div className="search-blank-screen" />}
              {!loading && !lumiLoading && visibleItems.length === 0 && (!isSearchSection || searchTerm) && <div className="empty-state"><Search size={28} /><h3>No titles found</h3><p>{section === "Lumi Picks" ? "Ask Lumi for a mood like funny, romantic, scary, cozy, or thoughtful." : section === "Watch History" ? "Mark titles as watched to build your history." : "Try another search or add titles to your watchlist."}</p></div>}
            </div>
            <p className="tmdb-credit">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </section>
        </div>
      </section>

      {lumiOpen && <button className="lumi-blur" onClick={() => setLumiOpen(false)} aria-label="Close Lumi overlay" />}
      <div className={`lumi-floating ${lumiOpen ? "expanded" : ""}`}>
        {lumiOpen && <div className="lumi-expanded" role="dialog" aria-label="Lumi mood assistant">
          <div className="lumi-type-toggle" aria-label="Lumi media type">
            <button className={lumiMediaType === "movie" ? "active" : ""} onClick={() => selectLumiMediaType("movie")} type="button"><Film size={15} /> Movies</button>
            <button className={lumiMediaType === "tv" ? "active" : ""} onClick={() => selectLumiMediaType("tv")} type="button"><Tv size={15} /> Series</button>
          </div>
          <p className="lumi-type-status">Showing {lumiMediaType === "movie" ? "movies" : "series"}</p>
          {(lumiLoading || lumiResults.length > 0) && <section className="lumi-result-panel" aria-label="Lumi recommendations">
            <div className="lumi-result-head">
              <span>{lumiLoading ? "Finding picks" : `${lumiMood || "Lumi"} Picks`}</span>
              <button onClick={() => setLumiResults([])} aria-label="Clear Lumi picks"><X size={14} /></button>
            </div>
            {lumiLoading && <div className="lumi-result-loading">Finding movies and shows...</div>}
            {!lumiLoading && <div className="lumi-result-slider" onPointerDown={dragHorizontal}>
              {lumiResults.map((item, index) => (
                <button key={`${item.mediaType}-${item.id}`} className="lumi-result-card" data-result-index={index} aria-label={`Open ${item.name}`}>
                  {item.poster ? <img src={item.poster} alt={`${item.name} poster`} width="185" height="278" loading="lazy" decoding="async" /> : <PosterFallback item={item} />}
                  <span>{item.type}</span>
                  <b>{item.name}</b>
                </button>
              ))}
            </div>}
          </section>}
          <div className="lumi-moods" onPointerDown={dragHorizontal}>
            {lumiCategories.map((category) => <button key={category.key} type="button" data-prompt={category.label} data-category={category.key} disabled={lumiLoading} aria-label={category.label} title={category.label}><span>{category.emoji}</span><b>{category.label}</b></button>)}
          </div>
          <form className="lumi-command" onSubmit={(event) => { event.preventDefault(); askLumi(lumiInput, { mediaType: lumiMediaType, keepOverlay: true }); }}>
            <button type="button" className="lumi-plus" aria-label="Mood shortcuts"><Sparkles size={20} /></button>
            <input autoFocus value={lumiInput} onChange={(event) => setLumiInput(event.target.value)} placeholder="Ask Lumi for movies or series by mood..." aria-label="Ask Lumi by mood" />
            <button className="lumi-voice" type="submit" disabled={lumiLoading || !lumiInput.trim()} aria-label="Ask Lumi">
              <span>{lumiLoading ? "Finding" : "Ask"}</span>
            </button>
          </form>
          {lumiError && <p className="lumi-error">{lumiError}</p>}
        </div>}
        {!lumiOpen && <button className="lumi-launcher" onClick={() => setLumiOpen((open) => !open)} aria-label="Open Lumi assistant" aria-expanded={lumiOpen}>
          <Bot size={20} />
          <span>Lumi</span>
        </button>}
      </div>

      {recommendationModal && <div className="recommendation-overlay" role="dialog" aria-modal="true" aria-label={`More like ${recommendationModal.name}`}>
        <div className="recommendation-panel">
          <div className="recommendation-header">
            <div>
              <span>MORE LIKE THIS</span>
              <h2>{recommendationModal.name}</h2>
              <p>Recommended {recommendationModal.mediaType === "movie" ? "movies" : "shows"} based on TMDB similarity signals.</p>
            </div>
            <button onClick={closeRecommendations} aria-label="Close recommendations"><X size={20} /></button>
          </div>

          {recommendationsError && <div className="recommendation-error">{recommendationsError}</div>}
          {recommendationsLoading && <div className="recommendation-loading">Loading recommendations...</div>}
          {!recommendationsLoading && !recommendationsError && <div className="recommendation-grid">
            {recommendations.map((item) => (
              <article className="recommendation-card" key={`${item.mediaType}-${item.id}`}>
                <button className="recommendation-poster" onClick={() => openRecommendationDetails(item)} aria-label={`Open ${item.name} details`}>
                  {item.poster ? <img src={item.poster} alt={`${item.name} poster`} width="500" height="750" loading="lazy" decoding="async" /> : <PosterFallback item={item} />}
                  <span>{item.type}</span>
                </button>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.genres.slice(0, 2).join(" â€¢ ") || "Genre unavailable"} â€¢ {item.year}</p>
                  <small><Star size={12} fill="currentColor" /> {item.rating.toFixed(1)} · {formatNumber(item.votes)} votes</small>
                </div>
              </article>
            ))}
            {!recommendations.length && <div className="empty-state"><Sparkles size={28} /><h3>No recommendations found</h3><p>TMDB does not have similar titles for this selection yet.</p></div>}
          </div>}
        </div>
      </div>}

      {selectedSeries && <div className="episode-overlay" role="dialog" aria-modal="true" aria-label={`${selectedSeries.name} details`}>
        <div className="episode-panel">
          <div className="episode-header">
            <div>
              <span>{selectedSeries.type}</span>
              <h2>{selectedSeries.name}</h2>
              <p>{episodeData?.overview || selectedSeries.overview || "Watch availability and title details from TMDB."}</p>
            </div>
            <div className="episode-header-actions">
              <button className={watchHistory[`${selectedSeries.mediaType}-${selectedSeries.id}`] ? "watched" : ""} onClick={() => toggleWatched(selectedSeries)} aria-label={`${watchHistory[`${selectedSeries.mediaType}-${selectedSeries.id}`] ? "Remove" : "Mark"} ${selectedSeries.name} watched`}><CheckCircle size={18} /></button>
              <button onClick={closeEpisodes} aria-label="Close details"><X size={20} /></button>
            </div>
          </div>

          <div className="detail-stack">
          <section className="trailer-section">
            <div className="watch-head">
              <h3>Trailers</h3>
              {episodeData?.videos?.[0] && <a href={episodeData.videos[0].url} target="_blank" rel="noreferrer">Open YouTube</a>}
            </div>
            {episodesLoading && <p className="provider-empty">Loading trailers...</p>}
            {!episodesLoading && episodeData?.videos?.length > 0 && <div className="trailer-grid">
              {episodeData.videos.map((video, index) => <article className={index === 0 ? "trailer-card featured" : "trailer-card"} key={video.id}>
                <a href={video.url} target="_blank" rel="noreferrer" aria-label={`Play ${video.name}`}>
                  {index === 0
                    ? <iframe src={video.embedUrl} title={video.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    : <img src={video.thumbnail} alt={`${video.name} thumbnail`} width="480" height="360" loading="lazy" decoding="async" />}
                  <span><PlayCircle size={18} /> {video.type}</span>
                </a>
                <div><b>{video.name}</b>{video.official && <small>Official</small>}</div>
              </article>)}
            </div>}
              {!episodesLoading && episodeData && !episodeData.videos?.length && <p className="provider-empty">No trailers available.</p>}
            <section className="watch-section movie-watch">
              <div className="watch-head">
                <h3>Where to Watch</h3>
                {episodeData?.watchLink && <a href={episodeData.watchLink} target="_blank" rel="noreferrer">Open TMDB</a>}
              </div>
              <div className="provider-groups">
                {(episodeData?.watchProviders || []).map((group) => <div className="provider-group" key={group.type}>
                  <span>{group.type === "flatrate" ? "Streaming" : group.type}</span>
                  <div>
                    {group.providers.map((provider) => <div className="provider-chip" key={`${group.type}-${provider.id}`}>
                      {provider.logo ? <img src={provider.logo} alt={`${provider.name} logo`} width="46" height="46" loading="lazy" decoding="async" /> : <i />}
                      <b>{provider.name}</b>
                    </div>)}
                  </div>
                </div>)}
                {!episodesLoading && episodeData && !episodeData.watchProviders?.length && <p className="provider-empty">Streaming information not available.</p>}
              </div>
            </section>
          </section>
          </div>
          </div>
      </div>}
    </main>
    </>
  );
}






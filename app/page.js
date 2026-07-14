"use client";

import {
  Bell, Bookmark, Bot, CheckCircle, ChevronLeft, ChevronRight, Clock, Film, Gauge,
  History, LayoutDashboard, Menu, Moon, MoreHorizontal, PlayCircle, Search, Sparkles, Star, Sun, Trash2, TrendingUp, Tv, X,
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
const THEME_KEY = "lumiverse-theme";
const chartColors = ["#ff2438", "#3b82ff", "#27b274", "#9a55ff", "#f0bd49"];
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

function Logo({ theme = "dark" }) {
  const logoSrc = theme === "light" ? "/lumiverse-logo-light.png" : "/loo.png";
  return <div className="logo"><img src={logoSrc} alt="LumiVerse" width="2048" height="682" /></div>;
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

function formatWatchTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes}m`;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
  const [theme, setTheme] = useState("dark");
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
  const dashboardStats = useMemo(() => {
    const watchedItems = historyItems.map((entry) => entry.item);
    const totalTitles = watchedItems.length;
    const totalWatchMinutes = watchedItems.reduce((sum, item) => {
      if (Number(item.runtime)) return sum + Number(item.runtime);
      return sum + (item.mediaType === "tv" ? 45 : 120);
    }, 0);
    const ratedItems = watchedItems.filter((item) => Number(item.rating) > 0);
    const averageRating = ratedItems.length
      ? ratedItems.reduce((sum, item) => sum + Number(item.rating), 0) / ratedItems.length
      : 0;
    return {
      totalTitles,
      totalWatchTime: formatWatchTime(totalWatchMinutes),
      seriesCompleted: watchedItems.filter((item) => item.mediaType === "tv").length,
      averageRating: averageRating ? averageRating.toFixed(1) : "0.0",
    };
  }, [historyItems]);
  const dashboardMediaSplit = useMemo(() => {
    const movies = historyItems.filter((entry) => entry.item.mediaType === "movie").length;
    const tvShows = historyItems.filter((entry) => entry.item.mediaType === "tv").length;
    const total = movies + tvShows;
    return {
      movies,
      tvShows,
      total,
      moviePercent: total ? Math.round((movies / total) * 100) : 0,
      tvPercent: total ? Math.round((tvShows / total) * 100) : 0,
    };
  }, [historyItems]);
  const watchTimeByMonth = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: monthFormatter.format(date),
        hours: 0,
      };
    });
    const monthMap = new Map(months.map((month) => [month.key, month]));
    historyItems.forEach((entry) => {
      const watchedDate = new Date(entry.watchedAt);
      const key = `${watchedDate.getFullYear()}-${String(watchedDate.getMonth() + 1).padStart(2, "0")}`;
      const month = monthMap.get(key);
      if (!month) return;
      const runtime = Number(entry.item.runtime) || (entry.item.mediaType === "tv" ? 45 : 120);
      month.hours += runtime / 60;
    });
    const maxHours = Math.max(1, ...months.map((month) => month.hours));
    const chartMax = Math.max(10, Math.ceil(maxHours / 10) * 10);
    return {
      months: months.map((month, index) => ({
        ...month,
        x: 10 + index * 16,
        y: 90 - (month.hours / chartMax) * 76,
      })),
      maxHours: chartMax,
    };
  }, [historyItems]);
  const watchTimePoints = watchTimeByMonth.months.map((month) => `${month.x},${month.y}`).join(" ");
  const watchTimeAreaPoints = watchTimeByMonth.months.length
    ? `10,90 ${watchTimePoints} ${watchTimeByMonth.months[watchTimeByMonth.months.length - 1].x},90`
    : "";
  const favoriteGenres = useMemo(() => {
    const counts = new Map();
    historyItems.forEach((entry) => {
      (entry.item.genres || []).forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1));
    });
    const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
    const genres = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], index) => ({
        name,
        count,
        color: chartColors[index],
        percent: total ? Math.round((count / total) * 100) : 0,
      }));
    let offset = 0;
    const gradient = genres.length
      ? genres.map((genre) => {
        const start = offset;
        offset += genre.percent;
        return `${genre.color} ${start}% ${offset}%`;
      }).join(", ")
      : "#242426 0 100%";
    return { genres, total, gradient };
  }, [historyItems]);
  const activityCalendar = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
    const counts = new Map();
    historyItems.forEach((entry) => {
      const watchedDate = new Date(entry.watchedAt);
      const key = watchedDate.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const days = Array.from({ length: 35 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (34 - index));
      const key = date.toISOString().slice(0, 10);
      const count = counts.get(key) || 0;
      return {
        key,
        count,
        label: formatter.format(date),
        level: Math.min(count, 4),
      };
    });
    return {
      days,
      activeDays: days.filter((day) => day.count > 0).length,
      maxCount: Math.max(0, ...days.map((day) => day.count)),
    };
  }, [historyItems]);

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
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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
            watchProviders: item.watchProviders || item.providers || item.platforms || [],
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

    <main className={`app-shell ${isSearchSection ? "is-search-page" : ""} ${showLanding ? "is-waiting" : ""} ${enteringApp ? "is-revealing" : ""}`} data-theme={theme}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="side-top"><Logo theme={theme} /><button className="close-menu" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20} /></button></div>
        <nav>
          <p>DISCOVER</p>
          <button className={`search-nav ${section === "Search" ? "active" : ""}`} onClick={focusSearch}><Search size={19} /><span>Search</span></button>
          {nav.map(({ section: navSection, label, Icon }) => <button key={navSection} className={section === navSection ? "active" : ""} onClick={() => selectSection(navSection)}><Icon size={19} /><span>{label}</span></button>)}
          <p>LIBRARY</p>
          <button className={section === "My Watchlist" ? "active" : ""} onClick={() => selectSection("My Watchlist")}><Bookmark size={19} /><span>Wishlist</span><em>{watchlist.length}</em></button>
          <button className={section === "Watch History" ? "active" : ""} onClick={() => selectSection("Watch History")}><History size={19} /><span>Watch History</span><em>{historyItems.length}</em></button>
          <button className={section === "My Dashboard" ? "active" : ""} onClick={() => selectSection("My Dashboard")}><LayoutDashboard size={19} /><span>My Dashboard</span></button>
        </nav>
        <div className="insight-card">
          <div className="insight-icon"><Gauge size={21} /></div><b>Live TMDB Data</b>
          <span>Weekly trending movies and series, updated every 15 minutes.</span>
          <button onClick={() => selectSection("Trends")}>Explore trends <span>→</span></button>
        </div>
        <div className="theme-switch" aria-label="Theme mode">
          <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")} type="button"><Moon size={14} /> Dark</button>
          <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")} type="button"><Sun size={14} /> Light</button>
        </div>
        <div className="profile"><div className="avatar">AS</div><div><b>Alex Smith</b><span>Analyst</span></div><MoreHorizontal size={18} /></div>
      </aside>

      {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" />}

      <section className="workspace">
        <div className="content">
          {!isSearchSection && section !== "Overview" && section !== "My Dashboard" && <div className="title-row">
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

          {section === "My Dashboard" && <section className="dashboard-welcome">
            <p>MY DASHBOARD</p>
            <h2>Welcome back, Shrushti! 👋</h2>
            <span>Your watch history insights are ready.</span>
          </section>}

          {section === "My Dashboard" && <section className="dashboard-summary-grid" aria-label="Dashboard summary">
            <article className="dashboard-summary-card">
              <span><CheckCircle size={18} /></span>
              <p>Total Titles Watched</p>
              <b>{dashboardStats.totalTitles}</b>
            </article>
            <article className="dashboard-summary-card">
              <span><Clock size={18} /></span>
              <p>Total Watch Time</p>
              <b>{dashboardStats.totalWatchTime}</b>
            </article>
            <article className="dashboard-summary-card">
              <span><Tv size={18} /></span>
              <p>Series Completed</p>
              <b>{dashboardStats.seriesCompleted}</b>
            </article>
            <article className="dashboard-summary-card">
              <span><Star size={18} fill="currentColor" /></span>
              <p>Average Rating</p>
              <b>{dashboardStats.averageRating}</b>
            </article>
          </section>}

          {section === "My Dashboard" && <section className="dashboard-analytics-grid" aria-label="Dashboard charts">
            <div className="dashboard-analytics-column">
              <div className="dashboard-panel" aria-label="Movies versus TV shows dashboard">
              <div className="dashboard-chart-card">
              <div className="dashboard-chart-copy">
                <div className="dashboard-title-icon"><Film size={26} fill="currentColor" /></div>
                <div>
                  <h2>Movies vs TV Shows <Sparkles size={20} fill="currentColor" /></h2>
                  <p>{dashboardMediaSplit.total ? "Understand your watching preference from your watch history." : "Mark movies and TV shows as watched to build your preference chart."}</p>
                </div>
              </div>
              <div className="dashboard-chart-body">
                <div className="dashboard-percent movie-percent">
                  <b>{dashboardMediaSplit.moviePercent}%</b>
                  <span>Movies</span>
                  <em><i /> Your Preference</em>
                </div>
                <div
                  className={`pie-chart ${dashboardMediaSplit.total ? "" : "empty"}`}
                  style={{ "--movie-share": `${dashboardMediaSplit.moviePercent}%` }}
                  role="img"
                  aria-label={`${dashboardMediaSplit.movies} movies and ${dashboardMediaSplit.tvShows} TV shows`}
                >
                  <span><Film size={36} /><i /><Tv size={36} /></span>
                </div>
                <div className="dashboard-percent tv-percent">
                  <b>{dashboardMediaSplit.tvPercent}%</b>
                  <span>TV Shows</span>
                  <em><i /> Your Preference</em>
                </div>
              </div>
              <div className="dashboard-stats-row">
                <div><span><Film size={22} fill="currentColor" /></span><p>Movies Watched</p><b>{dashboardMediaSplit.movies}</b></div>
                <div><span><Tv size={22} /></span><p>TV Shows Watched</p><b>{dashboardMediaSplit.tvShows}</b></div>
                <div><span><TrendingUp size={22} /></span><p>Total Watched</p><b>{dashboardMediaSplit.total}</b></div>
              </div>
            </div>
            </div>
              <div className="dashboard-mini-card activity-calendar-card">
                <div className="mini-card-head">
                  <div>
                    <span>ACTIVITY</span>
                    <h2>Activity Calendar</h2>
                  </div>
                  <History size={18} />
                </div>
                <div className="activity-summary">
                  <div><span>Active days</span><b>{activityCalendar.activeDays}</b></div>
                  <div><span>Most in a day</span><b>{activityCalendar.maxCount}</b></div>
                </div>
                <div className="activity-calendar-grid" aria-label="Last 35 days watched activity">
                  {activityCalendar.days.map((day) => (
                    <span
                      key={day.key}
                      className={`level-${day.level}`}
                      title={`${day.label}: ${day.count} watched`}
                      aria-label={`${day.label}: ${day.count} watched`}
                    />
                  ))}
                </div>
                <div className="activity-scale"><span>Less</span><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /><span>More</span></div>
              </div>
            </div>

            <div className="dashboard-analytics-column">
              <div className="watch-time-card" aria-label="Watch time by month">
              <div className="watch-time-head">
                <div>
                  <h2>Watch Time</h2>
                </div>
                <Clock size={19} />
              </div>
              <div className="watch-time-plot">
                <div className="watch-time-y-axis">
                  <span>Hours</span>
                  <span>{watchTimeByMonth.maxHours}</span>
                  <span>{Math.round(watchTimeByMonth.maxHours / 2)}</span>
                  <span>0h</span>
                </div>
                <div className="watch-time-line-chart">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points={watchTimeAreaPoints} />
                    <polyline points={watchTimePoints} />
                  </svg>
                  {watchTimeByMonth.months.map((month) => (
                    <div
                      className="watch-time-point"
                      key={month.key}
                      style={{ left: `${month.x}%`, top: `${month.y}%` }}
                    >
                      <span>{month.hours ? `${Math.round(month.hours)}h` : "0h"}</span>
                      <i />
                    </div>
                  ))}
                  <div className="watch-time-months">
                    {watchTimeByMonth.months.map((month) => (
                      <b key={month.key}>{month.label}</b>
                    ))}
                  </div>
                </div>
              </div>
              {!dashboardStats.totalTitles && <p className="watch-time-empty">Mark titles as watched to fill this graph.</p>}
            </div>
              <div className="dashboard-mini-card favorite-genres-card">
                <div className="genre-chart-copy">
                  <div className="dashboard-title-icon"><Sparkles size={18} fill="currentColor" /></div>
                  <div>
                    <h2>Favorite Genres</h2>
                    <p>{favoriteGenres.genres.length ? "Your most watched genres from history." : "Genres will appear after you mark watched titles."}</p>
                  </div>
                </div>
                <div className="genre-chart-body">
                  <div className="dashboard-percent genre-primary">
                    <b>{favoriteGenres.genres[0]?.percent || 0}%</b>
                    <span>{favoriteGenres.genres[0]?.name || "Genre"}</span>
                    <em><i /> Top Pick</em>
                  </div>
                  <div
                    className={`genre-pie ${favoriteGenres.genres.length ? "" : "empty"}`}
                    style={{ background: `conic-gradient(${favoriteGenres.gradient})` }}
                    role="img"
                    aria-label="Favorite genres pie chart"
                  >
                    <span><Sparkles size={24} /></span>
                  </div>
                  <div className="dashboard-percent genre-secondary">
                    <b>{favoriteGenres.genres[1]?.percent || 0}%</b>
                    <span>{favoriteGenres.genres[1]?.name || "More"}</span>
                    <em><i /> Next Best</em>
                  </div>
                </div>
                {favoriteGenres.genres.length > 0 && <div className="genre-stats-row">
                  {favoriteGenres.genres.slice(0, 3).map((genre) => (
                    <div key={genre.name}><i style={{ background: genre.color }} /><p>{genre.name}</p><b>{genre.percent}%</b></div>
                  ))}
                </div>}
              </div>
            </div>
          </section>}

          {section !== "Watch History" && section !== "Lumi Picks" && section !== "My Dashboard" && !isSearchSection && <div className="filters" aria-label="Catalog filters">
            <label><span>Genre</span><select value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}><option value="">All genres</option>{genreOptions.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}</select></label>
            <label><span>Country</span><select value={filters.country} onChange={(event) => updateFilter("country", event.target.value)}>{countryOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}</select></label>
            <label><span>Language</span><select value={filters.language} onChange={(event) => updateFilter("language", event.target.value)}>{languageOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}</select></label>
            <label><span>Popularity</span><select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button disabled={!hasActiveFilters} onClick={resetFilters}>Reset</button>
          </div>}

          {section !== "My Dashboard" && <section className="trending-section">
            {(!isSearchSection || searchTerm || recentSearchResults.length > 0) && <div className="section-head"><div><h3>{isSearchSection ? searchTerm ? "Search Results" : "Recently Searched" : section === "Lumi Picks" ? `${lumiMood || "Mood"} Picks` : query ? "Search Results" : section === "My Watchlist" ? "Saved Titles" : section === "Watch History" ? "Recently Watched" : section === "My Dashboard" ? "Dashboard Picks" : "Trending This Week"}</h3><p>{isSearchSection ? "" : section === "Lumi Picks" ? "Movies and series matched to your mood by Lumi" : section === "Watch History" ? "Titles you marked as watched on this device" : section === "My Dashboard" ? "Your watchlist, history, and trending context in one view" : "Ratings, popularity and audience votes from TMDB"}</p></div>{(!isSearchSection || searchTerm) && <div className="pager"><button disabled={page === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))}><ChevronLeft size={15} /></button><span>{page + 1}</span><button disabled={(page + 1) * activePageSize >= pageableTotal} onClick={() => setPage((value) => value + 1)}><ChevronRight size={15} /></button></div>}</div>}
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
          </section>}
        </div>
      </section>

      {!showLanding && lumiOpen && <button className="lumi-blur" onClick={() => setLumiOpen(false)} aria-label="Close Lumi overlay" />}
      {!showLanding && <div className={`lumi-floating ${lumiOpen ? "expanded" : ""}`}>
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
      </div>}

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
              <button className={watchHistory[`${selectedSeries.mediaType}-${selectedSeries.id}`] ? "watched" : ""} onClick={() => toggleWatched({ ...selectedSeries, watchProviders: episodeData?.watchProviders || [] })} aria-label={`${watchHistory[`${selectedSeries.mediaType}-${selectedSeries.id}`] ? "Remove" : "Mark"} ${selectedSeries.name} watched`}><CheckCircle size={18} /></button>
              <button onClick={closeEpisodes} aria-label="Close details"><X size={20} /></button>
            </div>
          </div>

          <div className={`detail-stack ${selectedSeries.mediaType === "tv" ? "has-episodes" : "movie-detail"}`}>
          {selectedSeries.mediaType === "tv" && <div className="episode-column">
          <div className="season-toolbar">
            <label>
              Season
              <select value={selectedSeason} onChange={(event) => { setSelectedSeason(event.target.value); setEpisodeData(null); }}>
                {(episodeData?.seasons || []).map((season) => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>
                    {season.name} ({season.episodeCount})
                  </option>
                ))}
              </select>
            </label>
            <small>{episodeData?.episodes?.length || 0} episodes</small>
          </div>
          {episodeError && <div className="episode-error">{episodeError}</div>}
          <section className="episode-list" aria-label={`${selectedSeries.name} episodes`}>
            {episodesLoading && <p className="provider-empty">Loading episodes...</p>}
            {!episodesLoading && (episodeData?.episodes || []).map((episode) => (
              <article className="episode-row" key={episode.id}>
                <div className="episode-still">
                  {episode.still ? <img src={episode.still} alt={`${episode.name} still`} width="300" height="169" loading="lazy" decoding="async" /> : <span>Episode {episode.episodeNumber}</span>}
                </div>
                <div>
                  <div className="episode-title">
                    <b>{episode.episodeNumber}. {episode.name || "Untitled episode"}</b>
                    <span>{episode.airDate || "Air date unavailable"}</span>
                  </div>
                  <p>{episode.overview || "Episode overview is not available."}</p>
                  <small><Star size={12} fill="currentColor" /> {episode.rating.toFixed(1)}{episode.runtime ? ` · ${episode.runtime} min` : ""}</small>
                </div>
              </article>
            ))}
            {!episodesLoading && episodeData && !episodeData.episodes?.length && <p className="provider-empty">No episodes available for this season.</p>}
          </section>
          </div>}
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






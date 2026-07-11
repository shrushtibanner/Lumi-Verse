import { NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

const moodProfiles = [
  { key: "movie", label: "Movie", words: ["popular movies", "movies"], movieGenres: [], tvGenres: [] },
  { key: "tv", label: "TV Show", words: ["tv shows", "shows", "series"], movieGenres: [], tvGenres: [] },
  { key: "popular", label: "Popular", words: ["popular", "popular now"], movieGenres: [], tvGenres: [] },
  { key: "trending", label: "Trending", words: ["trending"], movieGenres: [], tvGenres: [] },
  { key: "top-rated", label: "Top Rated", words: ["top rated", "best rated"], movieGenres: [], tvGenres: [] },
  { key: "new", label: "New Release", words: ["new release", "new releases", "latest"], movieGenres: [], tvGenres: [] },
  { key: "family", label: "Family", words: ["family"], movieGenres: ["10751", "16", "35"], tvGenres: ["10751", "16", "35"] },
  { key: "superhero", label: "Superhero", words: ["superhero", "super hero"], movieGenres: ["28", "12", "878"], tvGenres: ["10759", "10765"] },
  { key: "fantasy", label: "Fantasy", words: ["fantasy", "magic"], movieGenres: ["14", "12"], tvGenres: ["10765"] },
  { key: "mystery", label: "Mystery", words: ["mystery", "detective"], movieGenres: ["9648", "53"], tvGenres: ["9648", "80"] },
  { key: "sci-fi", label: "Sci-Fi", words: ["sci-fi", "science fiction", "space"], movieGenres: ["878", "12"], tvGenres: ["10765"] },
  { key: "psychological", label: "Psychological", words: ["psychological", "mind"], movieGenres: ["53", "9648", "18"], tvGenres: ["9648", "18"] },
  { key: "international", label: "International", words: ["international", "world"], movieGenres: ["18", "35", "53"], tvGenres: ["18", "35"] },
  { key: "indian", label: "Indian", words: ["indian", "india", "bollywood"], movieGenres: ["18", "35", "10749"], tvGenres: ["18", "35"] },
  { key: "horror", label: "Horror", words: ["horror"], movieGenres: ["27", "9648", "53"], tvGenres: ["9648", "10765"] },
  { key: "romance", label: "Romance", words: ["romance"], movieGenres: ["10749", "35", "18"], tvGenres: ["18", "35"] },
  { key: "comedy", label: "Comedy", words: ["comedy"], movieGenres: ["35", "10751", "16"], tvGenres: ["35", "10751", "16"] },
  { key: "action", label: "Action", words: ["action"], movieGenres: ["28", "12", "53"], tvGenres: ["10759", "9648"] },
  { key: "drama", label: "Drama", words: ["drama"], movieGenres: ["18"], tvGenres: ["18"] },
  { key: "documentary", label: "Documentary", words: ["documentary"], movieGenres: ["99", "36"], tvGenres: ["99"] },
  { key: "happy", label: "Feel-good", words: ["happy", "fun", "funny", "laugh", "light", "feel good", "cheer", "comedy"], movieGenres: ["35", "10751", "16"], tvGenres: ["35", "10751", "16"] },
  { key: "sad", label: "Emotional", words: ["sad", "cry", "emotional", "heartbreak", "moving", "deep"], movieGenres: ["18", "10749"], tvGenres: ["18"] },
  { key: "thrill", label: "Thrilling", words: ["thrill", "excited", "action", "adventure", "intense", "fast", "fight"], movieGenres: ["28", "12", "53"], tvGenres: ["10759", "9648"] },
  { key: "scary", label: "Scary", words: ["scary", "horror", "fear", "dark", "creepy", "spooky"], movieGenres: ["27", "9648", "53"], tvGenres: ["9648", "10765"] },
  { key: "romantic", label: "Romantic", words: ["romantic", "love", "date", "relationship", "romance"], movieGenres: ["10749", "35", "18"], tvGenres: ["18", "35"] },
  { key: "cozy", label: "Cozy", words: ["cozy", "relax", "calm", "comfort", "warm", "chill"], movieGenres: ["35", "10751", "14"], tvGenres: ["35", "10751"] },
  { key: "curious", label: "Thoughtful", words: ["curious", "smart", "thoughtful", "inspire", "true", "history", "documentary"], movieGenres: ["99", "36", "18"], tvGenres: ["99", "18"] },
];

const categoryProfiles = {
  popular: { label: "Popular", movieGenres: [], tvGenres: [], sort: "popularity.desc" },
  "top-rated": { label: "Top Rated", movieGenres: [], tvGenres: [], sort: "vote_average.desc" },
  new: { label: "New Release", movieGenres: [], tvGenres: [], sort: "primary_release_date.desc", tvSort: "first_air_date.desc" },
  family: { label: "Family", movieGenres: ["10751", "16"], tvGenres: ["10751", "16"], sort: "popularity.desc" },
  superhero: { label: "Superhero", movieGenres: ["28", "12", "878"], tvGenres: ["10759", "10765"], sort: "popularity.desc" },
  fantasy: { label: "Fantasy", movieGenres: ["14", "12"], tvGenres: ["10765"], sort: "popularity.desc" },
  horror: { label: "Horror", movieGenres: ["27"], tvGenres: ["9648", "10765"], sort: "popularity.desc" },
  mystery: { label: "Mystery", movieGenres: ["9648", "53"], tvGenres: ["9648", "80"], sort: "popularity.desc" },
  "sci-fi": { label: "Sci-Fi", movieGenres: ["878"], tvGenres: ["10765"], sort: "popularity.desc" },
  romance: { label: "Romance", movieGenres: ["10749"], tvGenres: ["18"], sort: "popularity.desc" },
  comedy: { label: "Comedy", movieGenres: ["35"], tvGenres: ["35"], sort: "popularity.desc" },
  action: { label: "Action", movieGenres: ["28", "12"], tvGenres: ["10759"], sort: "popularity.desc" },
  psychological: { label: "Psychological", movieGenres: ["53", "9648"], tvGenres: ["9648", "18"], sort: "popularity.desc" },
  drama: { label: "Drama", movieGenres: ["18"], tvGenres: ["18"], sort: "popularity.desc" },
  international: { label: "International", movieGenres: ["18", "35", "53"], tvGenres: ["18", "35"], sort: "popularity.desc", originalLanguage: "ko|ja|fr|es|de" },
  indian: { label: "Indian", movieGenres: ["18", "35", "10749"], tvGenres: ["18", "35"], sort: "popularity.desc", originCountry: "IN" },
  documentary: { label: "Documentary", movieGenres: ["99"], tvGenres: ["99"], sort: "popularity.desc" },
};

function detectMood(text, category = "") {
  if (category) {
    const exactProfile = categoryProfiles[category] || moodProfiles.find((profile) => profile.key === category);
    if (exactProfile) return { key: category, ...exactProfile };
  }
  const normalized = text.toLowerCase();
  const genericKeys = new Set(["movie", "tv"]);
  const matches = moodProfiles
    .map((profile) => {
      const matchedWords = profile.words.filter((word) => normalized.includes(word));
      return {
        profile,
        matched: matchedWords.length > 0,
        generic: genericKeys.has(profile.key),
        longestMatch: Math.max(0, ...matchedWords.map((word) => word.length)),
      };
    })
    .filter((entry) => entry.matched)
    .sort((a, b) => {
      if (a.generic !== b.generic) return a.generic ? 1 : -1;
      return b.longestMatch - a.longestMatch;
    });

  return matches[0]?.profile || moodProfiles.find((profile) => profile.key === "popular");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

async function requestAzureRecommendations(profile, mediaType = "movie") {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const targetUrl = process.env.AZURE_OPENAI_TARGET_URL;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
  if (!apiKey || (!targetUrl && (!endpoint || !deployment))) return [];
  const url = targetUrl || `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: "Return only a JSON array of exactly 10 movie or TV show titles. No markdown, no explanation.",
        },
        {
          role: "user",
          content: `Suggest the top 10 ${profile.label} ${mediaType === "tv" ? "TV series" : "movies"} for a streaming recommendation app. Use widely known titles that are likely to exist in TMDB.`,
        },
      ],
    }),
  });

  if (!response.ok) return [];
  const data = await response.json().catch(() => ({}));
  return parseJsonArray(data.choices?.[0]?.message?.content || "").slice(0, 10);
}

async function requestTmdb(path, params = {}) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) throw new Error("TMDB_NOT_CONFIGURED");

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (!token) url.searchParams.set("api_key", apiKey);

  let response;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, accept: "application/json" } : { accept: "application/json" },
        next: { revalidate: params.query ? 0 : 900 },
      });
      break;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await wait(300 * (attempt + 1));
    }
  }
  if (!response) throw lastError || new Error("TMDB request failed");

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.status_message || `TMDB request failed (${response.status})`);
  }
  return response.json();
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const view = params.get("view") || "all";
  const query = params.get("query")?.trim() || "";
  const page = params.get("page") || "1";
  const genre = params.get("genre") || "";
  const country = params.get("country") || "";
  const originalLanguage = params.get("language") || "";
  const sort = params.get("sort") || "popularity.desc";
  const tvId = params.get("tvId");
  const detailId = params.get("detailId") || tvId;
  const detailType = params.get("mediaType") || (tvId ? "tv" : "");
  const recommendId = params.get("recommendId");
  const recommendType = params.get("recommendType");
  const mood = params.get("mood")?.trim() || "";
  const category = params.get("category")?.trim() || "";
  const lumiMediaType = params.get("mediaType") === "tv" ? "tv" : "movie";
  const requestedSeason = params.get("season");

  try {
    if (category || mood) {
      const moodProfile = detectMood(mood || category, category);
      const movieParams = {
        include_adult: "false",
        page,
        sort_by: moodProfile.sort || (moodProfile.key === "top-rated" ? "vote_average.desc" : moodProfile.key === "new" ? "primary_release_date.desc" : "popularity.desc"),
        "vote_count.gte": "80",
      };
      const tvParams = {
        include_adult: "false",
        page,
        sort_by: moodProfile.tvSort || moodProfile.sort || (moodProfile.key === "top-rated" ? "vote_average.desc" : moodProfile.key === "new" ? "first_air_date.desc" : "popularity.desc"),
        "vote_count.gte": "80",
      };
      if (moodProfile.movieGenres.length) movieParams.with_genres = moodProfile.movieGenres.join("|");
      if (moodProfile.tvGenres.length) tvParams.with_genres = moodProfile.tvGenres.join("|");
      if (moodProfile.originCountry) {
        movieParams.with_origin_country = moodProfile.originCountry;
        tvParams.with_origin_country = moodProfile.originCountry;
      }
      if (moodProfile.originalLanguage) {
        movieParams.with_original_language = moodProfile.originalLanguage;
        tvParams.with_original_language = moodProfile.originalLanguage;
      }
      const [movieGenres, tvGenres, movies, series] = await Promise.all([
        requestTmdb("/genre/movie/list"),
        requestTmdb("/genre/tv/list"),
        lumiMediaType === "movie" ? requestTmdb("/discover/movie", movieParams) : Promise.resolve({ results: [] }),
        lumiMediaType === "tv" ? requestTmdb("/discover/tv", tvParams) : Promise.resolve({ results: [] }),
      ]);

      const genreNames = Object.fromEntries(
        [...movieGenres.genres, ...tvGenres.genres].map(({ id, name }) => [id, name]),
      );
      const matchesCategoryGenres = (item, mediaType) => {
        const expectedGenres = mediaType === "movie" ? moodProfile.movieGenres : moodProfile.tvGenres;
        if (!expectedGenres.length) return true;
        const itemGenres = (item.genre_ids || []).map(String);
        return expectedGenres.some((genreId) => itemGenres.includes(genreId));
      };
      const toTitle = (item, mediaType) => {
        const date = item.release_date || item.first_air_date || "";
        return {
          id: item.id,
          name: item.title || item.name,
          mediaType,
          type: mediaType === "movie" ? "Movie" : "Series",
          overview: item.overview,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
          year: date.slice(0, 4) || "—",
          releaseDate: date,
          rating: Number(item.vote_average || 0),
          votes: item.vote_count || 0,
          popularity: Number(item.popularity || 0),
          genres: (item.genre_ids || []).map((id) => genreNames[id]).filter(Boolean),
        };
      };

      const tmdbResults = [
          ...movies.results.filter((item) => matchesCategoryGenres(item, "movie")).map((item) => toTitle(item, "movie")),
          ...series.results.filter((item) => matchesCategoryGenres(item, "tv")).map((item) => toTitle(item, "tv")),
        ]
          .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))
          .slice(0, 20);

      let results = tmdbResults;
      if (category) {
        const azureTitles = await requestAzureRecommendations(moodProfile, lumiMediaType);
        if (azureTitles.length) {
          const resolved = await Promise.all(azureTitles.map(async (title) => {
            const searchPath = lumiMediaType === "tv" ? "/search/tv" : "/search/movie";
            const search = await requestTmdb(searchPath, { query: title, include_adult: "false", page: "1" }).catch(() => ({ results: [] }));
            const match = (search.results || [])[0];
            if (!match) return null;
            const mediaType = lumiMediaType;
            if (!matchesCategoryGenres(match, mediaType)) return null;
            return toTitle(match, mediaType);
          }));
          const seen = new Set();
          results = resolved.filter(Boolean).filter((item) => {
            const key = `${item.mediaType}-${item.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }).slice(0, 10);
          if (results.length < 10) {
            results = [...results, ...tmdbResults.filter((item) => !seen.has(`${item.mediaType}-${item.id}`))].slice(0, 10);
          }
        } else {
          results = tmdbResults.slice(0, 10);
        }
      }

      return NextResponse.json({
        mood: moodProfile.label,
        results,
      });
    }

    if (recommendId && ["movie", "tv"].includes(recommendType)) {
      const [movieGenres, tvGenres, recommendations] = await Promise.all([
        requestTmdb("/genre/movie/list"),
        requestTmdb("/genre/tv/list"),
        requestTmdb(`/${recommendType}/${recommendId}/recommendations`, { page }),
      ]);

      const genreNames = Object.fromEntries(
        [...movieGenres.genres, ...tvGenres.genres].map(({ id, name }) => [id, name]),
      );

      return NextResponse.json({
        results: (recommendations.results || [])
          .filter((item) => ["movie", "tv"].includes(item.media_type || recommendType))
          .map((item) => {
            const mediaType = item.media_type || recommendType;
            const date = item.release_date || item.first_air_date || "";
            return {
              id: item.id,
              name: item.title || item.name,
              mediaType,
              type: mediaType === "movie" ? "Movie" : "Series",
              overview: item.overview,
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
              year: date.slice(0, 4) || "—",
              releaseDate: date,
              rating: Number(item.vote_average || 0),
              votes: item.vote_count || 0,
              popularity: Number(item.popularity || 0),
              genres: (item.genre_ids || []).map((id) => genreNames[id]).filter(Boolean),
            };
          })
          .slice(0, 12),
      });
    }

    if (detailId && ["movie", "tv"].includes(detailType)) {
      const details = await requestTmdb(`/${detailType}/${detailId}`, {
        append_to_response: "videos,watch/providers",
      });
      const videos = details.videos || {};
      const watchProviders = details["watch/providers"] || {};
      const regionProviders = watchProviders.results?.IN || watchProviders.results?.US || {};
      const providerGroups = ["flatrate", "free", "ads", "rent", "buy"].map((type) => ({
        type,
        providers: (regionProviders[type] || []).map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path ? `https://image.tmdb.org/t/p/w92${provider.logo_path}` : null,
        })),
      })).filter((group) => group.providers.length);
      const baseDetails = {
        id: details.id,
        name: details.title || details.name,
        mediaType: detailType,
        overview: details.overview,
        watchLink: regionProviders.link || null,
        watchProviders: providerGroups,
        videos: (videos.results || [])
          .filter((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
          .sort((a, b) => {
            const aOriginal = /(^|\b)(original|official)\s+trailer\b/i.test(a.name || "");
            const bOriginal = /(^|\b)(original|official)\s+trailer\b/i.test(b.name || "");
            if (aOriginal !== bOriginal) return aOriginal ? -1 : 1;
            if (a.official !== b.official) return a.official ? -1 : 1;
            if (a.type !== b.type) return a.type === "Trailer" ? -1 : 1;
            return new Date(b.published_at || 0) - new Date(a.published_at || 0);
          })
          .slice(0, 1)
          .map((video) => ({
            id: video.id,
            key: video.key,
            name: video.name,
            type: video.type,
            official: video.official,
            publishedAt: video.published_at,
            url: `https://www.youtube.com/watch?v=${video.key}`,
            embedUrl: `https://www.youtube.com/embed/${video.key}`,
            thumbnail: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`,
          })),
      };

      if (detailType === "movie") {
        return NextResponse.json(baseDetails);
      }

      const seasons = (details.seasons || [])
        .filter((season) => season.episode_count > 0)
        .map((season) => ({
          id: season.id,
          name: season.name,
          seasonNumber: season.season_number,
          episodeCount: season.episode_count,
          airDate: season.air_date,
          poster: season.poster_path ? `https://image.tmdb.org/t/p/w300${season.poster_path}` : null,
        }));
      const defaultSeason = seasons.find((season) => season.seasonNumber > 0) || seasons[0];
      const selectedSeason = Number(requestedSeason || defaultSeason?.seasonNumber || 1);
      const seasonDetails = await requestTmdb(`/tv/${detailId}/season/${selectedSeason}`).catch(() => ({ episodes: [] }));

      return NextResponse.json({
        ...baseDetails,
        selectedSeason,
        seasons,
        episodes: (seasonDetails.episodes || []).map((episode) => ({
          id: episode.id,
          name: episode.name,
          episodeNumber: episode.episode_number,
          airDate: episode.air_date,
          overview: episode.overview,
          runtime: episode.runtime,
          rating: Number(episode.vote_average || 0),
          still: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : null,
        })),
      });
    }

    const hasFilters = Boolean(genre || country || originalLanguage || sort !== "popularity.desc");
    const discoverParams = { include_adult: "false", page, sort_by: sort };
    if (genre) discoverParams.with_genres = genre;
    if (originalLanguage) discoverParams.with_original_language = originalLanguage;
    if (country) {
      discoverParams.watch_region = country;
      discoverParams.with_watch_monetization_types = "flatrate|free|ads|rent|buy";
    }
    if (sort === "vote_average.desc") discoverParams["vote_count.gte"] = "100";
    const sortCatalog = (items) => [...items].sort((a, b) => {
      if (sort === "vote_average.desc") return Number(b.vote_average || 0) - Number(a.vote_average || 0);
      if (sort === "primary_release_date.desc") return new Date(b.release_date || b.first_air_date || 0) - new Date(a.release_date || a.first_air_date || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    const [movieGenres, tvGenres] = await Promise.all([
      requestTmdb("/genre/movie/list"),
      requestTmdb("/genre/tv/list"),
    ]);

    const catalog = query
      ? await requestTmdb(
        view === "movie" ? "/search/movie" : view === "tv" ? "/search/tv" : "/search/multi",
        { query, include_adult: "false", page },
      )
      : hasFilters
        ? view === "all"
          ? await Promise.all([
            requestTmdb("/discover/movie", discoverParams),
            requestTmdb("/discover/tv", country ? { ...discoverParams, with_origin_country: country } : discoverParams),
          ]).then(([movies, series]) => ({
            results: sortCatalog([
              ...movies.results.map((item) => ({ ...item, media_type: "movie" })),
              ...series.results.map((item) => ({ ...item, media_type: "tv" })),
            ]),
            total_results: movies.total_results + series.total_results,
          }))
          : await requestTmdb(
            view === "movie" ? "/discover/movie" : "/discover/tv",
            view === "tv" && country ? { ...discoverParams, with_origin_country: country } : discoverParams,
          )
        : await requestTmdb(
          view === "movie" ? "/trending/movie/week" : view === "tv" ? "/trending/tv/week" : "/trending/all/week",
        );

    const genreNames = Object.fromEntries(
      [...movieGenres.genres, ...tvGenres.genres].map(({ id, name }) => [id, name]),
    );
    const filterGenres = Object.values(
      [...movieGenres.genres, ...tvGenres.genres].reduce((acc, item) => {
        acc[item.id] = acc[item.id] || item;
        return acc;
      }, {}),
    ).sort((a, b) => a.name.localeCompare(b.name));

    const matchesSearchFilters = (item) => {
      if (genre && !(item.genre_ids || []).map(String).includes(genre)) return false;
      if (originalLanguage && item.original_language !== originalLanguage) return false;
      if (country && (item.media_type || view) === "tv" && !(item.origin_country || []).includes(country)) return false;
      return true;
    };

    const results = catalog.results
      .filter((item) => {
        const type = item.media_type || view;
        return ["movie", "tv"].includes(type) && (view === "all" || type === view) && (!query || matchesSearchFilters(item));
      })
      .map((item) => {
        const mediaType = item.media_type || view;
        const date = item.release_date || item.first_air_date || "";
        return {
          id: item.id,
          name: item.title || item.name,
          mediaType,
          type: mediaType === "movie" ? "Movie" : "Series",
          overview: item.overview,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
          year: date.slice(0, 4) || "—",
          releaseDate: date,
          rating: Number(item.vote_average || 0),
          votes: item.vote_count || 0,
          popularity: Number(item.popularity || 0),
          genres: (item.genre_ids || []).map((id) => genreNames[id]).filter(Boolean),
        };
      });

    const genreCount = {};
    results.forEach((item) => item.genres.forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    }));

    const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);
    const totalPopularity = results.reduce((sum, item) => sum + item.popularity, 0);
    const averageRating = results.length
      ? results.reduce((sum, item) => sum + item.rating, 0) / results.length
      : 0;

    return NextResponse.json({
      results,
      totalResults: catalog.total_results,
      metrics: {
        titles: results.length,
        averageRating: averageRating.toFixed(1),
        totalVotes,
        popularity: Math.round(totalPopularity),
      },
      genres: Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          percentage: Math.round((count / Math.max(results.length, 1)) * 100),
        })),
      filterGenres,
    });
  } catch (error) {
    const missing = error.message === "TMDB_NOT_CONFIGURED";
    return NextResponse.json(
      {
        code: missing ? "TMDB_NOT_CONFIGURED" : "TMDB_REQUEST_FAILED",
        error: missing
          ? "Add TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY to .env.local"
          : error.message,
      },
      { status: missing ? 503 : 502 },
    );
  }
}

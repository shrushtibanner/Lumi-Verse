# CineScope Analytics

# LumiVerse

A Next.js movie and series analytics dashboard using TMDB data, watch history, watchlist controls, title details, trailers, streaming providers, and Lumi mood recommendations.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` after the dev server starts. If port 3000 is busy, Next.js will choose another local port.

## Environment Variables

Create a local `.env` or `.env.local` file with at least one TMDB credential:

```bash
TMDB_READ_ACCESS_TOKEN=your_tmdb_v4_read_access_token
# or
TMDB_API_KEY=your_tmdb_api_key
```

Optional Azure OpenAI variables for Lumi recommendation enrichment:

```bash
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Scripts

```bash
npm run dev
npm run build
npm start
```
# LumiVerse
# Lumi-Verse
# Lumi-Verse

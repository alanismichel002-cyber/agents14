# Trend Finder

See what's trending on TikTok, Instagram Reels and YouTube Shorts, and search all three by keyword or #hashtag. Data comes from the [Scrape Creators API](https://docs.scrapecreators.com).

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- Expert agents used to build it: [`.claude/agents/`](.claude/agents)

## How it works

```
Browser (React app) ──► /api/videos (Netlify Function) ──► api.scrapecreators.com
                              │
                              └─ holds the API key, allows only 9 endpoints,
                                 validates input, rate-limits, caches results
```

The browser never sees the API key. It only calls `/api/videos`, for example:

- `/api/videos?platform=tiktok&mode=trending`
- `/api/videos?platform=all&mode=keyword&q=skincare`
- `/api/videos?platform=instagram&mode=hashtag&q=%23skincare`

## Deploying (GitHub → Netlify)

Netlify deploys from GitHub automatically. You never upload to Netlify directly.

1. In Netlify, choose **Add new site → Import an existing project → GitHub**, and pick this repository.
2. Leave the build settings as Netlify detects them (they come from `netlify.toml`): build command `npm run build`, publish directory `dist`.
3. Before the first deploy, go to **Site configuration → Environment variables** and add
   `SCRAPE_CREATORS_API_KEY` with your Scrape Creators key.
4. Deploy. From then on:
   - every push to `main` deploys the live site
   - every pull request gets its own preview URL

## Local development

Requires Node 22 (`nvm use` picks it up from `.nvmrc`).

```bash
npm install
npm run dev            # front end only, at http://localhost:5173
```

To run the front end and the API function together:

```bash
cp .env.example .env   # then paste your key into .env (never commit it)
npm run dev:netlify    # http://localhost:8888
```

## Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the Vite dev server       |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript, no output           |
| `npm test`          | Vitest unit tests               |
| `npm run format`    | Prettier                        |

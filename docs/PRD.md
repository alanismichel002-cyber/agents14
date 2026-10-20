# Trend Finder — Product Requirements Document

As of 2026-10-20 · Living version: https://claude.ai/artifact/K19MzVH3Cr2D7p3LrsyxB1 (this file is the in-repo copy agents read)

## Overview

Trend Finder is a web app that shows what is trending on TikTok, Instagram Reels and YouTube Shorts, and lets people search those platforms by keyword or hashtag from one screen. It uses the [Scrape Creators API](https://docs.scrapecreators.com) for data, is built from the `main` branch on GitHub, and is deployed on Netlify.

**Problem:** Spotting trends now means opening three apps, each with its own algorithm, and getting no side-by-side view of views and engagement.

**Solution:** One page that pulls trending and searched videos from all three platforms into a single grid of video cards that can be sorted and filtered.

## Goals and non-goals

Version 1 is a public, read-only discovery tool. There are no accounts and no data is stored.

**Goals (v1)**

- Show trending videos for TikTok, Instagram Reels and YouTube Shorts
- Search by keyword or #hashtag on one platform or on all three at once
- Show results as uniform video cards with engagement stats and a link to the original video
- Keep the Scrape Creators API key on the server, never in the browser
- Deploy automatically to Netlify on every push to `main`

**Non-goals (v1)**

- User accounts, saved searches or favorites
- Posting, downloading or re-hosting videos
- Historical trend charts or analytics over time
- Platforms other than the three above

## Target users and user stories

| User                  | Story                                                                                                        | Acceptance                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Content creator       | As a creator, I want to see today's trending short videos so I can pick formats to copy                      | The Trending tab loads the top videos for the chosen platform in under 5 s |
| Social media marketer | As a marketer, I want to search a keyword across all three platforms so I can compare where it is taking off | A cross-platform search returns one combined, labeled grid                 |
| Brand researcher      | As a researcher, I want to search a #hashtag and sort by views so I can find the top posts                   | Hashtag search plus sorting by views works on every platform               |
| Anyone                | As a visitor, I want to open the original video in one click                                                 | Each card links to the original video in a new tab                         |

## Functional requirements

| ID    | Requirement                                                                                                                                                 | Priority |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-1  | Trending view with platform tabs: TikTok, Instagram Reels, YouTube Shorts                                                                                   | P0       |
| FR-2  | Search bar that treats input starting with # as a hashtag search and anything else as a keyword search                                                      | P0       |
| FR-3  | Platform selector for search: one platform or All                                                                                                           | P0       |
| FR-4  | Video card with thumbnail, platform badge, creator name and avatar, caption (cut to 2 lines), views, likes, comments, post date, and a link to the original | P0       |
| FR-5  | Sorting by views, likes or newest                                                                                                                           | P0       |
| FR-6  | Loading skeletons, an empty state, and clear error messages (for example, API out of credits or rate-limited)                                               | P0       |
| FR-7  | Responsive layout from 360 px (phone) to desktop                                                                                                            | P0       |
| FR-8  | Filters: minimum views and posted within (24 h, 7 d, 30 d)                                                                                                  | P1       |
| FR-9  | Play the video inline in a modal when the platform allows it                                                                                                | P1       |
| FR-10 | Shareable URLs that keep the query and platform, for example `/?q=%23skincare&p=tiktok`                                                                     | P1       |
| FR-11 | Load more results (pagination using the API's cursor)                                                                                                       | P1       |

## Scrape Creators API usage

Base URL `https://api.scrapecreators.com`, all GET, auth via `x-api-key` header. Every call costs credits. Source: [OpenAPI spec](https://docs.scrapecreators.com/openapi.json).

| Platform  | Feature  | Endpoint                       | Key parameters                                       |
| --------- | -------- | ------------------------------ | ---------------------------------------------------- |
| TikTok    | Trending | `/v1/tiktok/get-trending-feed` | `region` (required), `trim`                          |
| TikTok    | Keyword  | `/v1/tiktok/search/keyword`    | `query`, `date_posted`, `sort_by`, `cursor`          |
| TikTok    | Hashtag  | `/v1/tiktok/search/hashtag`    | `hashtag`, `region`, `cursor`                        |
| Instagram | Trending | `/v1/instagram/reels/trending` | none                                                 |
| Instagram | Keyword  | `/v2/instagram/reels/search`   | `query`, `date_posted`, `page`                       |
| Instagram | Hashtag  | `/v1/instagram/search/hashtag` | `hashtag`, `media_type`, `cursor`                    |
| YouTube   | Trending | `/v1/youtube/shorts/trending`  | none                                                 |
| YouTube   | Keyword  | `/v1/youtube/search`           | `query`, `sortBy`, `uploadDate`, `continuationToken` |
| YouTube   | Hashtag  | `/v1/youtube/search/hashtag`   | `hashtag`, `continuationToken`                       |

**Data mapping:** Each platform's response is converted on the server into one shared `Video` shape:

```ts
type Video = {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  url: string;
  thumbnail: string | null;
  caption: string;
  author: { name: string; handle: string; avatar: string | null };
  stats: { views: number | null; likes: number | null; comments: number | null };
  postedAt: string | null; // ISO 8601
};
```

## Technical architecture

Browser (React app) → Netlify CDN (cache) → Netlify Function `/api/videos` (holds key, endpoint allow-list, normalizes to `Video`) → Scrape Creators. Deploy path: push to `main` on GitHub → Netlify build (site + functions).

| Layer     | Choice                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| Front end | React 18, Vite, TypeScript, Tailwind CSS                                                 |
| API proxy | Netlify Functions (Node 22, TypeScript): `netlify/functions/videos.ts`                   |
| Config    | `netlify.toml` (build, Node version, security headers); route set in the function config |
| Secrets   | `SCRAPE_CREATORS_API_KEY` in Netlify environment variables; `.env` locally, git-ignored  |
| Testing   | Vitest for normalizers and components                                                    |
| Hosting   | Netlify, deploying from `main` on GitHub, with deploy previews for pull requests         |

## Non-functional requirements

| Area                   | Requirement                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security               | The API key lives only in the Netlify environment variable `SCRAPE_CREATORS_API_KEY`. It is never committed and never sent to the browser. The proxy accepts only an allow-list of endpoints. |
| Abuse and cost control | Rate limit per IP on the function (e.g. 30 requests/min). Inputs validated and capped at 100 characters. No automatic polling.                                                                |
| Caching                | Trending cached 15 min, search 5 min, at the CDN (`Cache-Control` / `Netlify-CDN-Cache-Control`).                                                                                             |
| Performance            | First load under 2 s on 4G. JS bundle under 200 KB gzipped. Lazy-loaded thumbnails.                                                                                                           |
| Reliability            | In an All search, a failed platform doesn't block the others; show partial results with a notice. Upstream timeout 10 s.                                                                      |
| Accessibility          | WCAG 2.1 AA contrast, keyboard navigation, alt text on thumbnails, visible focus states.                                                                                                      |
| Compliance             | Public data only, link back to originals, never re-host video files.                                                                                                                          |

## Success metrics

| Metric                          | Target                        |
| ------------------------------- | ----------------------------- |
| Trending view load time (p75)   | Under 3 s                     |
| Search success rate             | 95% or higher                 |
| Cache hit rate on trending      | 70% or higher                 |
| Credits used per day            | Within budget (open question) |
| Click-through to original video | 25% or more of sessions       |

## Milestones

1. **Scaffold:** React + Vite + TypeScript, `netlify.toml`, the Netlify Function proxy, lint and test setup
2. **API layer:** Endpoint allow-list, per-platform normalizers producing `Video`, caching headers, error handling
3. **Trending view:** Platform tabs, video card grid, loading/empty/error states
4. **Search view:** Keyword and hashtag search, All-platforms merge, sorting
5. **Polish and launch:** Responsive and accessibility pass, P1 items if time allows, env var set in Netlify, merge to `main`, smoke test on the live URL

## Risks and open questions

| Risk                                             | Mitigation                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Credit costs grow on a public site               | CDN caching, per-IP rate limits, optional daily cap in the function      |
| Response formats differ or change without notice | Per-platform normalizers with fallbacks, tests on saved sample responses |
| Thumbnail URLs expire or block hotlinking        | Placeholder on error; image proxy later if needed                        |
| All search waits on three upstream calls         | Parallel calls, 10 s timeout, partial results                            |

Open questions:

- [ ] Daily or monthly credit budget?
- [ ] Default TikTok region for trending (e.g. US)?
- [ ] Public site, or behind a simple password?
- [ ] Changes to `main` via pull requests or direct merges?
- [ ] Final app name and domain?

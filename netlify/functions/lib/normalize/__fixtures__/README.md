# Normalizer fixtures

- `tiktok_*.json`, `instagram_*.json`, `youtube_*.json`: the example 200 responses from the
  [Scrape Creators OpenAPI spec](https://docs.scrapecreators.com/openapi.json), one per endpoint.
- `live_*_trending.json`: real trending responses captured on 2026-10-20, trimmed to 3 items
  each (account balance removed). Only public post data.

Search endpoints are covered by the spec examples only. When their format changes, capture a
real response, trim it, and add it here.

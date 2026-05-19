# finance-sentiment

[![npm version](https://img.shields.io/npm/v/finance-sentiment.svg)](https://www.npmjs.com/package/finance-sentiment)

`finance-sentiment` is the public TypeScript SDK for the [Adanos Market Sentiment API](https://api.adanos.org/docs).

It gives you typed access to:
- Reddit stock sentiment
- News sentiment and source-filtered rankings
- X/Twitter stock sentiment
- Polymarket stock activity and market attention
- Reddit crypto token sentiment

Links:
- Source: https://github.com/adanos-software/adanos-ts-sdk
- npm: https://www.npmjs.com/package/finance-sentiment
- API docs: https://api.adanos.org/docs
- Homepage: https://adanos.org

Package and import:
- npm package: `finance-sentiment`
- Primary client: `AdanosClient`
- Compatibility alias: `StockSentimentClient`

## Install

```bash
npm install finance-sentiment
```

## Quick Start

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.reddit.trending({ days: 7, limit: 10 });
const tsla = await client.reddit.stock("TSLA", { days: 14 });
const explanation = await client.reddit.explain("TSLA");
const health = await client.health();

console.log(trending[0].ticker);
console.log(tsla.buzz_score);
console.log(explanation.explanation);
console.log(health.summary.healthy);
```

## What You Can Do

- Rank trending stocks across Reddit, News, X, and Polymarket
- Track Reddit crypto token sentiment and raw mention rows
- Pull service-level market sentiment snapshots across every stock namespace
- Check aggregate API health and per-service health/statistics
- Pull detailed ticker reports for a configurable lookback window
- Search and compare tickers across datasets
- Generate AI-written explanations for Reddit and News stock trends
- Use the same client shape across all supported stock datasets

## Namespaces

- `client.reddit.*` for Reddit Stocks
- `client.news.*` for News Stocks
- `client.x.*` for X/Twitter Stocks
- `client.polymarket.*` for Polymarket Stocks
- `client.crypto.*` for Reddit Crypto
- `client.redditCrypto.*` is an alias for `client.crypto.*`
- `client.health()` for aggregate API health

## Examples

### Reddit Stocks

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.reddit.trending({ days: 7, limit: 10 });
const sectors = await client.reddit.trendingSectors({ days: 7, limit: 10 });
const countries = await client.reddit.trendingCountries({ days: 7, limit: 10 });
const tsla = await client.reddit.stock("TSLA", { days: 14 });
const explanation = await client.reddit.explain("TSLA");
const results = await client.reddit.search("Tesla", { days: 7, limit: 10 });
const comparison = await client.reddit.compare(["TSLA", "AAPL", "MSFT"], { days: 7 });
const market = await client.reddit.marketSentiment({ days: 7 });
```

### News

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.news.trending({ days: 7, source: "reuters" });
const sectors = await client.news.trendingSectors({ days: 7, source: "reuters" });
const countries = await client.news.trendingCountries({ days: 7, source: "reuters" });
const nvda = await client.news.stock("NVDA", { days: 7 });
const explanation = await client.news.explain("NVDA");
const results = await client.news.search("Nvidia", { days: 7, limit: 10 });
const comparison = await client.news.compare(["NVDA", "AAPL"], { days: 7 });
const market = await client.news.marketSentiment({ days: 7 });
const stats = await client.news.stats();
const health = await client.news.health();
```

### X/Twitter

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.x.trending({ days: 1, limit: 20 });
const sectors = await client.x.trendingSectors({ days: 1, limit: 10 });
const countries = await client.x.trendingCountries({ days: 1, limit: 10 });
const nvda = await client.x.stock("NVDA");
const explanation = await client.x.explain("NVDA");
const results = await client.x.search("Nvidia", { days: 7, limit: 10 });
const comparison = await client.x.compare(["NVDA", "AMD"], { days: 7 });
const market = await client.x.marketSentiment({ days: 7 });
const stats = await client.x.stats();
const health = await client.x.health();
```

### Polymarket

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.polymarket.trending({ days: 7, limit: 20, type: "stock" });
const sectors = await client.polymarket.trendingSectors({ days: 7, limit: 10 });
const countries = await client.polymarket.trendingCountries({ days: 7, limit: 10 });
const aapl = await client.polymarket.stock("AAPL");
const results = await client.polymarket.search("Apple", { days: 7, limit: 10 });
const comparison = await client.polymarket.compare(["AAPL", "TSLA"], { days: 7 });
const market = await client.polymarket.marketSentiment({ days: 7 });
const stats = await client.polymarket.stats();
const health = await client.polymarket.health();
```

### Reddit Crypto

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

const trending = await client.crypto.trending({ days: 7, limit: 20 });
const btc = await client.crypto.token("BTC", { days: 14 });
const mentions = await client.crypto.mentions("BTC", { days: 7, limit: 10, offset: 10 });
const results = await client.crypto.search("bitcoin", { days: 7, limit: 10 });
const comparison = await client.crypto.compare(["BTC", "ETH"], { days: 7 });
const market = await client.crypto.marketSentiment({ days: 7 });
const stats = await client.crypto.stats();
const health = await client.crypto.health();
```

Polymarket semantics:
- `buzz_score` is activity-first and optimized for current market attention
- `total_liquidity` is a windowed signal over the selected `days`
- `current_market_count` is the live-only active-market breadth; `market_count` remains the selected-window breadth
- `top_mentions` on `stock()` are relevance-sorted by trading activity first

## Available Methods

### `client`

| Method | Description |
|--------|-------------|
| `health()` | Aggregate API health across all public market sentiment services |

### `client.reddit.*`

| Method | Description |
|--------|-------------|
| `trending({ days, limit, offset, type })` | Trending stocks by buzz score |
| `trendingSectors({ days, limit, offset })` | Trending sectors |
| `trendingCountries({ days, limit, offset })` | Trending countries |
| `stock(ticker, { days })` | Detailed sentiment for a ticker |
| `mentions(ticker, { days, limit, offset, includeInherited })` | Raw Reddit mention rows |
| `explain(ticker)` | AI-generated trend explanation |
| `search(query, { days, limit })` | Search stocks by name or ticker with recent-period summaries |
| `compare(tickers, { days })` | Compare up to 10 stocks |
| `marketSentiment({ days })` | Service-level Reddit market sentiment snapshot |
| `stats()` | Dataset statistics |
| `health()` | Public service health |

### `client.news.*`

| Method | Description |
|--------|-------------|
| `trending({ days, limit, offset, type, source })` | Trending stocks from news |
| `trendingSectors({ days, limit, offset, source })` | Trending sectors from news |
| `trendingCountries({ days, limit, offset, source })` | Trending countries from news |
| `stock(ticker, { days })` | Detailed news sentiment for a ticker |
| `mentions(ticker, { days, limit, offset })` | Raw news mention rows |
| `explain(ticker)` | AI-generated explanation from news context |
| `search(query, { days, limit })` | Search stocks in the news dataset with recent-period summaries |
| `compare(tickers, { days })` | Compare up to 10 stocks in news |
| `marketSentiment({ days })` | Service-level News market sentiment snapshot |
| `stats()` | News dataset statistics |
| `health()` | Public news service health |

### `client.x.*`

| Method | Description |
|--------|-------------|
| `trending({ days, limit, offset, type })` | Trending stocks on X/Twitter |
| `trendingSectors({ days, limit, offset })` | Trending sectors |
| `trendingCountries({ days, limit, offset })` | Trending countries |
| `stock(ticker, { days })` | Detailed X/Twitter sentiment |
| `mentions(ticker, { days, limit, offset })` | Raw X/Twitter mention rows |
| `explain(ticker)` | AI-generated explanation from X/Twitter context |
| `search(query, { days, limit })` | Search stocks with recent-period summaries |
| `compare(tickers, { days })` | Compare stocks |
| `marketSentiment({ days })` | Service-level X/Twitter market sentiment snapshot |
| `stats()` | Dataset statistics |
| `health()` | Public service health |

### `client.polymarket.*`

| Method | Description |
|--------|-------------|
| `trending({ days, limit, offset, type })` | Trending stocks on Polymarket with activity-first buzz and windowed liquidity |
| `trendingSectors({ days, limit, offset })` | Trending sectors |
| `trendingCountries({ days, limit, offset })` | Trending countries |
| `stock(ticker, { days })` | Detailed Polymarket activity, sentiment, and relevance-sorted market questions |
| `mentions(ticker, { days, limit, offset })` | Raw Polymarket market snapshots |
| `search(query, { days, limit })` | Search stocks with recent-period summaries |
| `compare(tickers, { days })` | Compare stocks with windowed Polymarket activity signals |
| `marketSentiment({ days })` | Service-level Polymarket market sentiment snapshot |
| `stats()` | Dataset statistics |
| `health()` | Public service health |

### `client.crypto.*`

| Method | Description |
|--------|-------------|
| `trending({ days, limit, offset })` | Trending Reddit crypto tokens |
| `token(symbol, { days })` | Detailed token sentiment and buzz |
| `mentions(symbol, { days, limit, offset, includeInherited })` | Raw Reddit crypto mention rows |
| `search(query, { days, limit })` | Search tokens by symbol or name with recent-period summaries and market cap metadata |
| `compare(symbols, { days })` | Compare multiple tokens |
| `marketSentiment({ days })` | Service-level Reddit Crypto market sentiment snapshot |
| `stats()` | Dataset statistics |
| `health()` | Public service health |

## Error Handling

All non-2xx responses throw an `ApiError`:

```typescript
import { AdanosClient, ApiError } from "finance-sentiment";

const client = new AdanosClient({ apiKey: "adanos_api_key_here" });

try {
  await client.reddit.trending();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API error ${error.status}: ${error.detail}`);
  }
}
```

## Authentication and Configuration

Get your API key at [adanos.org](https://adanos.org).

```typescript
import { AdanosClient } from "finance-sentiment";

const client = new AdanosClient({
  apiKey: "adanos_api_key_here",
  baseUrl: "https://api.adanos.org",
  timeout: 60_000,
});
```

## Rate Limits

| Tier | Monthly Requests | Burst Limit |
|------|------------------|-------------|
| Free | 250 | 100/min |
| Paid | Unlimited | 1000/min |

Successful protected responses include rate-limit headers.

## Requirements

- Node.js `>=18`
- ESM and CJS consumers supported
- Works in Bun and modern runtimes with `fetch`

## Migration from `social-stock-sentiment`

Version `1.0.0` starts the new `finance-sentiment` package line and promotes `AdanosClient` as the primary public client name.

Old:

```bash
npm install social-stock-sentiment
```

```typescript
import { StockSentimentClient } from "social-stock-sentiment";
```

New:

```bash
npm install finance-sentiment
```

```typescript
import { AdanosClient } from "finance-sentiment";
```

`StockSentimentClient` remains available as a compatibility alias.

## License

MIT

MIT

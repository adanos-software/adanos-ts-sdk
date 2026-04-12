# Changelog

All notable changes to the Adanos TypeScript SDK will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [1.3.0] - 2026-04-12

### Added
- Added `client.x.explain()` for the X/Twitter stock explanation endpoint.

## [1.2.0] - 2026-03-27

### Added
- Added `marketSentiment()` across Reddit, News, X, and Polymarket namespaces with typed service-level response objects.

### Changed
- Renamed package metadata and docs from `Adanos Finance Sentiment API` to `Adanos Market Sentiment API`.

## [1.1.0] - 2026-03-19

### Added
- Search methods now support `days` and `limit` across Reddit, News, X, Crypto, and Polymarket.
- Search result types now expose the compact `summary` object returned by the live API.

### Changed
- Compare response types now match the enriched `/compare` contract, including `trend`, `trend_history`, `sentiment_score`, and platform-specific activity fields.
- Detail response types now prefer canonical `mentions` and keep `total_mentions` only as a legacy alias where the API still exposes it.
- `daily_trend` types now expose canonical `sentiment_score` alongside the deprecated `sentiment` alias.

## [1.0.0] - 2026-03-16

### Added
- First public release of `finance-sentiment` as the standalone TypeScript SDK for the Adanos Finance Sentiment API.
- Standalone CI workflow for typecheck, tests, build, and package smoke install.
- Standalone npm publish workflow for release-driven publishing from this repository.

### Changed
- Renamed the npm package from `social-stock-sentiment` to `finance-sentiment`.
- Added `AdanosClient` as the primary public client entry point.
- Kept `StockSentimentClient` as a compatibility alias.
- Updated package metadata to point to the public repository, docs, and homepage.

### Migration
- Replace `npm install social-stock-sentiment` with `npm install finance-sentiment`.
- Replace `import { StockSentimentClient } from "social-stock-sentiment"` with `import { AdanosClient } from "finance-sentiment"`.

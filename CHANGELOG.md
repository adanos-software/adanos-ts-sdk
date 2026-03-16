# Changelog

All notable changes to the Adanos TypeScript SDK will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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

/**
 * Adanos Market Sentiment API — TypeScript SDK
 *
 * Analyze stock sentiment across News, Reddit, X/Twitter, and Polymarket.
 *
 * @example
 * ```ts
 * import { AdanosClient } from 'finance-sentiment';
 *
 * const client = new AdanosClient({ apiKey: 'adanos_api_key_here' });
 * const trending = await client.reddit.trending({ days: 7 });
 * ```
 */

// ── Errors ──────────────────────────────────────────────────────────

export class StockSentimentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockSentimentError';
  }
}

export class ApiError extends StockSentimentError {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`${status}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

// ── Option types ────────────────────────────────────────────────────

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
}

export interface TrendingOptions {
  /** Time period in days (1-90). Free tier limited to 30. */
  days?: number;
  /** Max results (1-100). Default: 20. */
  limit?: number;
  /** Pagination offset. Default: 0. */
  offset?: number;
  /** Filter by "stock", "etf", "all", or undefined for all. */
  type?: string;
}

export interface TrendingGroupOptions {
  days?: number;
  limit?: number;
  offset?: number;
}

export interface StockOptions {
  /** Time period in days (1-90). Default: 7. */
  days?: number;
}

/** Alias — compare accepts the same options as a single-stock lookup. */
export type CompareOptions = StockOptions;
export type SearchOptions = Pick<TrendingGroupOptions, 'days' | 'limit'>;
export type MarketSentimentOptions = Pick<TrendingGroupOptions, 'days'>;

export interface RawMentionsOptions {
  /** Time period in days. */
  days?: number;
  /** Max raw rows to return. */
  limit?: number;
  /** Include inherited Reddit thread context where supported. */
  includeInherited?: boolean;
}

export interface NewsSourceOptions {
  /** Optional strict source filter (canonical source id or known alias). */
  source?: string;
}

export interface NewsTrendingOptions extends TrendingOptions, NewsSourceOptions {}
export interface NewsTrendingGroupOptions extends TrendingGroupOptions, NewsSourceOptions {}
export type NewsStockOptions = StockOptions;
export type NewsCompareOptions = CompareOptions;

// ── Response types (snake_case — matches API JSON exactly) ──────────

// Reddit response types

export interface TrendingStock {
  ticker: string;
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  unique_posts: number;
  subreddit_count: number;
  sentiment_score: number;
  bullish_pct: number;
  bearish_pct: number;
  total_upvotes: number;
  company_name?: string | null;
  trend_history?: number[];
}

export interface StockSentiment {
  ticker: string;
  found: boolean;
  company_name?: string | null;
  buzz_score?: number | null;
  mentions?: number | null;
  sentiment_score?: number | null;
  positive_count?: number | null;
  negative_count?: number | null;
  neutral_count?: number | null;
  total_upvotes?: number | null;
  unique_posts?: number | null;
  subreddit_count?: number | null;
  trend?: 'rising' | 'falling' | 'stable' | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  period_days?: number | null;
  top_subreddits?: SubredditCount[] | null;
  daily_trend?: DailyTrendItem[] | null;
  top_mentions?: TopMention[] | null;
}

export interface SubredditCount {
  subreddit: string;
  count: number;
}

export interface DailyTrendItem {
  date: string;
  mentions: number;
  sentiment_score?: number | null;
  buzz_score?: number | null;
}

export interface TopMention {
  text_snippet: string;
  sentiment_score: number;
  sentiment_label: string;
  upvotes: number;
  subreddit: string;
  created_utc: string;
}

export interface StockExplanationResponse {
  ticker: string;
  company_name?: string | null;
  explanation: string;
  cached: boolean;
  generated_at: string;
  model?: string | null;
}

export interface SchedulerStatus {
  running: boolean;
  last_scrape?: string | null;
  scrape_count?: number;
  error_count?: number;
  success_rate?: number | null;
  note?: string | null;
}

export interface HealthResponse {
  status: string;
  service?: string | null;
  version?: string | null;
  total_mentions?: number;
  tickers_tracked?: number;
  scheduler?: SchedulerStatus | null;
  error?: string | null;
}

export interface StatsResponse {
  total_mentions: number;
  unique_tickers: number;
  tickers: string[];
  supported_tickers: number;
}

export interface StockSearchSummary {
  mentions: number;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  unique_posts: number;
  subreddit_count: number;
  total_upvotes: number;
}

export interface SearchResultItem {
  ticker: string;
  name: string;
  type?: string | null;
  exchange?: string | null;
  sector?: string | null;
  country?: string | null;
  aliases?: string[] | null;
  summary: StockSearchSummary;
}

export interface SearchResponse<T = SearchResultItem> {
  query: string;
  count: number;
  period_days: number;
  results: T[];
}

export interface CompareResponse {
  period_days: number;
  stocks: CompareStockItem[];
}

export interface CompareStockItem {
  ticker: string;
  company_name?: string | null;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  unique_posts: number;
  subreddit_count: number;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_upvotes: number;
  trend_history: number[];
}

export interface MarketSentimentDriver {
  ticker: string;
  buzz_score: number;
  sentiment_score?: number | null;
  mentions: number;
}

export interface RedditMarketSentiment {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  unique_posts: number;
  subreddit_count: number;
  total_upvotes: number;
  active_tickers: number;
  sentiment_score?: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  bullish_pct: number;
  bearish_pct: number;
  trend_history: number[];
  drivers: MarketSentimentDriver[];
}

export interface RedditRawMentionItem {
  post_id?: string | null;
  comment_id?: string | null;
  subreddit?: string | null;
  author?: string | null;
  text_snippet: string;
  created_utc: string;
  upvotes: number;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  is_inherited: boolean;
}

export interface RedditRawMentionsResponse {
  ticker: string;
  period_days: number;
  count: number;
  results: RedditRawMentionItem[];
}

interface TrendingGroupBase {
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  unique_tickers: number;
  sentiment_score: number;
  bullish_pct: number;
  bearish_pct: number;
  total_upvotes: number;
  top_tickers: string[];
}

export interface TrendingSector extends TrendingGroupBase {
  sector: string;
  subreddit_count: number;
}

export interface TrendingCountry extends TrendingGroupBase {
  country: string;
  subreddit_count: number;
}

// News response types

export interface NewsTrendingStock {
  ticker: string;
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  source_count: number;
  sentiment_score: number;
  bullish_pct: number;
  bearish_pct: number;
  company_name?: string | null;
  trend_history?: number[];
}

export interface NewsSourceCount {
  source: string;
  count: number;
}

export interface NewsTopMention {
  text_snippet: string;
  sentiment_score: number;
  sentiment_label: string;
  source: string;
  created_utc: string;
}

export interface NewsSearchSummary {
  mentions: number;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  source_count: number;
}

export interface NewsSearchResultItem {
  ticker: string;
  name: string;
  type?: string | null;
  exchange?: string | null;
  sector?: string | null;
  country?: string | null;
  aliases?: string[] | null;
  summary: NewsSearchSummary;
}

export interface NewsStockSentiment {
  ticker: string;
  found: boolean;
  company_name?: string | null;
  buzz_score?: number | null;
  mentions?: number | null;
  sentiment_score?: number | null;
  positive_count?: number | null;
  negative_count?: number | null;
  neutral_count?: number | null;
  source_count?: number | null;
  trend?: 'rising' | 'falling' | 'stable' | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  period_days?: number | null;
  top_sources?: NewsSourceCount[] | null;
  daily_trend?: DailyTrendItem[] | null;
  top_mentions?: NewsTopMention[] | null;
}

interface NewsTrendingGroupBase {
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  unique_tickers: number;
  source_count: number;
  sentiment_score: number;
  bullish_pct: number;
  bearish_pct: number;
  top_tickers: string[];
}

export interface NewsTrendingSector extends NewsTrendingGroupBase {
  sector: string;
}

export interface NewsTrendingCountry extends NewsTrendingGroupBase {
  country: string;
}

export interface NewsCompareStockItem {
  ticker: string;
  company_name?: string | null;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  source_count: number;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  trend_history: number[];
}

export interface NewsCompareResponse {
  period_days: number;
  stocks: NewsCompareStockItem[];
}

export interface NewsMarketSentiment {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  unique_articles: number;
  source_count: number;
  active_tickers: number;
  sentiment_score?: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  bullish_pct: number;
  bearish_pct: number;
  trend_history: number[];
  drivers: MarketSentimentDriver[];
}

export interface NewsRawMentionItem {
  article_id?: string | null;
  source: string;
  url?: string | null;
  title?: string | null;
  summary?: string | null;
  text_snippet: string;
  author?: string | null;
  created_utc?: string | null;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
}

export interface NewsRawMentionsResponse {
  ticker: string;
  period_days: number;
  count: number;
  results: NewsRawMentionItem[];
}

// X/Twitter response types

export interface XTrendingStock {
  ticker: string;
  buzz_score: number;
  trend: string;
  mentions: number;
  company_name?: string | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_upvotes?: number | null;
  unique_tweets?: number | null;
  is_validated: boolean;
  trend_history?: number[];
}

export interface XStockDetail {
  ticker: string;
  found: boolean;
  company_name?: string | null;
  buzz_score?: number | null;
  mentions?: number | null;
  sentiment_score?: number | null;
  positive_count?: number | null;
  negative_count?: number | null;
  neutral_count?: number | null;
  total_upvotes?: number | null;
  unique_tweets?: number | null;
  trend?: 'rising' | 'falling' | 'stable' | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  period_days?: number | null;
  daily_trend?: XDailyTrendItem[] | null;
  top_tweets?: XTopTweet[] | null;
  is_validated: boolean;
}

export interface XDailyTrendItem {
  date: string;
  mentions: number;
  sentiment_score?: number | null;
  avg_rank?: number | null;
  buzz_score?: number | null;
}

export interface XSearchSummary {
  mentions: number;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  unique_tweets: number;
  total_upvotes: number;
}

export interface XSearchResultItem {
  ticker: string;
  name: string;
  type?: string | null;
  exchange?: string | null;
  sector?: string | null;
  country?: string | null;
  aliases?: string[] | null;
  summary: XSearchSummary;
}

export type XSearchResponse = SearchResponse<XSearchResultItem>;

export interface XTopTweet {
  text_snippet: string;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  likes: number;
  retweets: number;
  views?: number | null;
  author?: string | null;
  created_at?: string | null;
}

interface XTrendingGroupBase {
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  unique_tickers: number;
  unique_authors: number;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_upvotes?: number | null;
  top_tickers: string[];
}

export interface XTrendingSector extends XTrendingGroupBase {
  sector: string;
}

export interface XTrendingCountry extends XTrendingGroupBase {
  country: string;
}

export interface XMarketSentiment {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  unique_tweets: number;
  unique_authors: number;
  total_upvotes: number;
  active_tickers: number;
  sentiment_score?: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  bullish_pct: number;
  bearish_pct: number;
  trend_history: number[];
  drivers: MarketSentimentDriver[];
}

export interface XRawMentionItem {
  tweet_id: string;
  author?: string | null;
  text_snippet: string;
  created_utc?: string | null;
  likes: number;
  retweets: number;
  views?: number | null;
  is_reply: boolean;
  parent_tweet_id?: string | null;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
}

export interface XRawMentionsResponse {
  ticker: string;
  period_days: number;
  count: number;
  results: XRawMentionItem[];
}

// Polymarket response types

export interface PolymarketTrendingStock {
  ticker: string;
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  trade_count: number;
  market_count: number;
  unique_traders?: number | null;
  bullish_pct: number;
  bearish_pct: number;
  total_liquidity: number;
  company_name?: string | null;
  sentiment_score?: number | null;
  trend_history?: number[];
}

export interface PolymarketDailyTrendItem {
  date: string;
  trade_count: number;
  sentiment_score?: number | null;
  buzz_score?: number | null;
}

export interface PolymarketTopMention {
  condition_id: string;
  question: string;
  market_type: string;
  trade_count?: number | null;
  sentiment_score?: number | null;
  yes_price?: number | null;
  no_price?: number | null;
  liquidity: number;
  volume_24h: number;
  end_date?: string | null;
  active: boolean;
}

export interface PolymarketStockDetail {
  ticker: string;
  found: boolean;
  company_name?: string | null;
  buzz_score?: number | null;
  trend?: 'rising' | 'falling' | 'stable' | null;
  period_days?: number | null;
  trade_count?: number | null;
  market_count?: number | null;
  unique_traders?: number | null;
  sentiment_score?: number | null;
  positive_count?: number | null;
  negative_count?: number | null;
  neutral_count?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_liquidity?: number | null;
  daily_trend?: PolymarketDailyTrendItem[] | null;
  top_mentions?: PolymarketTopMention[] | null;
}

interface PolymarketTrendingGroupBase {
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  trade_count: number;
  market_count: number;
  unique_tickers: number;
  unique_traders?: number | null;
  sentiment_score?: number | null;
  bullish_pct: number;
  bearish_pct: number;
  total_liquidity: number;
  top_tickers: string[];
}

export interface PolymarketTrendingSector extends PolymarketTrendingGroupBase {
  sector: string;
}

export interface PolymarketTrendingCountry extends PolymarketTrendingGroupBase {
  country: string;
}

export interface PolymarketCompareStockItem {
  ticker: string;
  company_name?: string | null;
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  trade_count: number;
  market_count: number;
  unique_traders?: number | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_liquidity: number;
  trend_history: number[];
}

export interface PolymarketCompareResponse {
  period_days: number;
  stocks: PolymarketCompareStockItem[];
}

export interface PolymarketMarketSentimentDriver {
  ticker: string;
  trade_count: number;
  buzz_score: number;
  sentiment_score?: number | null;
}

export interface PolymarketMarketSentiment {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  trade_count: number;
  market_count: number;
  unique_traders: number;
  total_liquidity: number;
  active_tickers: number;
  sentiment_score?: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  bullish_pct: number;
  bearish_pct: number;
  trend_history: number[];
  drivers: PolymarketMarketSentimentDriver[];
}

export interface PolymarketSearchSummary {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  trade_count: number;
  market_count: number;
  unique_traders?: number | null;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_liquidity: number;
}

export interface PolymarketSearchResultItem {
  ticker: string;
  name: string;
  type?: string | null;
  exchange?: string | null;
  sector?: string | null;
  country?: string | null;
  aliases: string[];
  summary: PolymarketSearchSummary;
}

export interface PolymarketSearchResponse {
  query: string;
  count: number;
  period_days: number;
  results: PolymarketSearchResultItem[];
}

export interface PolymarketRawMentionItem {
  condition_id: string;
  event_id: string;
  market_slug?: string | null;
  question: string;
  market_type: string;
  strike_price?: number | null;
  yes_price?: number | null;
  no_price?: number | null;
  reference_price?: number | null;
  reference_price_timestamp?: string | null;
  liquidity: number;
  volume_24h: number;
  trade_count: number;
  buy_trades: number;
  sell_trades: number;
  unique_traders: number;
  sentiment_score?: number | null;
  sentiment_label?: string | null;
  end_date?: string | null;
  active: boolean;
  fetched_at: string;
}

export interface PolymarketRawMentionsResponse {
  ticker: string;
  period_days: number;
  count: number;
  results: PolymarketRawMentionItem[];
}

// Reddit crypto response types

export interface CryptoTrendingToken {
  symbol: string;
  name?: string | null;
  buzz_score: number;
  trend: 'rising' | 'falling' | 'stable';
  mentions: number;
  unique_posts: number;
  subreddit_count: number;
  sentiment_score?: number | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  total_upvotes: number;
  trend_history?: number[];
}

export interface CryptoTokenSentiment {
  symbol: string;
  name?: string | null;
  found: boolean;
  buzz_score?: number | null;
  mentions?: number | null;
  sentiment_score?: number | null;
  positive_count?: number | null;
  negative_count?: number | null;
  neutral_count?: number | null;
  total_upvotes?: number | null;
  unique_posts?: number | null;
  subreddit_count?: number | null;
  trend?: 'rising' | 'falling' | 'stable' | null;
  bullish_pct?: number | null;
  bearish_pct?: number | null;
  period_days?: number | null;
  top_subreddits?: SubredditCount[] | null;
  daily_trend?: DailyTrendItem[] | null;
  top_mentions?: TopMention[] | null;
}

export interface CryptoSearchItem {
  symbol: string;
  name: string;
  aliases?: string[] | null;
  summary: StockSearchSummary;
}

export interface CryptoSearchResponse {
  query: string;
  count: number;
  period_days: number;
  results: CryptoSearchItem[];
}

export interface CryptoCompareTokenItem extends CryptoTokenSentiment {
  trend_history?: number[];
}

export interface CryptoCompareResponse {
  period_days: number;
  tokens: CryptoCompareTokenItem[];
}

export interface CryptoRawMentionItem extends RedditRawMentionItem {}

export interface CryptoRawMentionsResponse {
  symbol: string;
  period_days: number;
  count: number;
  results: CryptoRawMentionItem[];
}

export interface CryptoMarketSentiment {
  buzz_score: number;
  trend?: 'rising' | 'falling' | 'stable' | null;
  mentions: number;
  unique_posts: number;
  subreddit_count: number;
  total_upvotes: number;
  active_tokens: number;
  sentiment_score?: number | null;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  bullish_pct: number;
  bearish_pct: number;
  trend_history: number[];
  drivers: Array<{ symbol: string; buzz_score: number; sentiment_score?: number | null; mentions: number }>;
}

export interface CryptoStatsResponse {
  total_mentions: number;
  unique_tokens: number;
  tokens: string[];
  supported_tokens: number;
}

// ── Internal HTTP client ────────────────────────────────────────────

type QueryParams = Record<string, string | number | undefined>;

class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(baseUrl: string, apiKey: string, timeout: number) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  async get<T>(path: string, params?: QueryParams): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      let detail: string;
      try {
        const body = await response.json();
        detail = body.detail ?? JSON.stringify(body);
      } catch {
        detail = response.statusText || `HTTP ${response.status}`;
      }
      throw new ApiError(response.status, detail);
    }

    return response.json() as Promise<T>;
  }
}

// ── Platform namespaces ─────────────────────────────────────────────

class PlatformNamespace {
  protected http: HttpClient;
  protected prefix: string;

  constructor(http: HttpClient, prefix: string) {
    this.http = http;
    this.prefix = prefix;
  }

  protected request<T>(path: string, params?: QueryParams): Promise<T> {
    return this.http.get<T>(`${this.prefix}${path}`, params);
  }
}

export class RedditNamespace extends PlatformNamespace {
  /** @internal */
  constructor(http: HttpClient) {
    super(http, '/reddit/stocks/v1');
  }

  /** Get trending stocks on Reddit. */
  async trending(options: TrendingOptions = {}): Promise<TrendingStock[]> {
    return this.request('/trending', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      type: options.type,
    });
  }

  /** Get trending sectors on Reddit. */
  async trendingSectors(options: TrendingGroupOptions = {}): Promise<TrendingSector[]> {
    return this.request('/trending/sectors', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get trending countries on Reddit. */
  async trendingCountries(options: TrendingGroupOptions = {}): Promise<TrendingCountry[]> {
    return this.request('/trending/countries', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get sentiment for a specific stock ticker. */
  async stock(ticker: string, options: StockOptions = {}): Promise<StockSentiment> {
    return this.request(`/stock/${encodeURIComponent(ticker)}`, {
      days: options.days,
    });
  }

  /** Get raw Reddit mentions for a specific stock ticker. */
  async mentions(ticker: string, options: RawMentionsOptions = {}): Promise<RedditRawMentionsResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/mentions`, {
      days: options.days,
      limit: options.limit,
      include_inherited: options.includeInherited?.toString(),
    });
  }

  /** Get AI-generated explanation for a stock's trend. */
  async explain(ticker: string): Promise<StockExplanationResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/explain`);
  }

  /** Search for stocks by name or ticker. */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    return this.request('/search', {
      q: query,
      days: options.days,
      limit: options.limit,
    });
  }

  /** Compare multiple stocks side-by-side. */
  async compare(tickers: string[], options: CompareOptions = {}): Promise<CompareResponse> {
    return this.request('/compare', {
      tickers: tickers.join(','),
      days: options.days,
    });
  }

  /** Get the service-level Reddit market sentiment snapshot. */
  async marketSentiment(options: MarketSentimentOptions = {}): Promise<RedditMarketSentiment> {
    return this.request('/market-sentiment', {
      days: options.days,
    });
  }

  /** Get Reddit stock data statistics. */
  async stats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  /** Get public Reddit stock service health. */
  async health(): Promise<HealthResponse> {
    return this.request('/health');
  }
}

export class NewsNamespace extends PlatformNamespace {
  /** @internal */
  constructor(http: HttpClient) {
    super(http, '/news/stocks/v1');
  }

  /** Get trending stocks from news. */
  async trending(options: NewsTrendingOptions = {}): Promise<NewsTrendingStock[]> {
    return this.request('/trending', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      type: options.type,
      source: options.source,
    });
  }

  /** Get trending sectors from news. */
  async trendingSectors(options: NewsTrendingGroupOptions = {}): Promise<NewsTrendingSector[]> {
    return this.request('/trending/sectors', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      source: options.source,
    });
  }

  /** Get trending countries from news. */
  async trendingCountries(options: NewsTrendingGroupOptions = {}): Promise<NewsTrendingCountry[]> {
    return this.request('/trending/countries', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      source: options.source,
    });
  }

  /** Get sentiment for a specific stock ticker from news. */
  async stock(ticker: string, options: StockOptions = {}): Promise<NewsStockSentiment> {
    return this.request(`/stock/${encodeURIComponent(ticker)}`, {
      days: options.days,
    });
  }

  /** Get raw news mentions for a specific stock ticker. */
  async mentions(ticker: string, options: RawMentionsOptions = {}): Promise<NewsRawMentionsResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/mentions`, {
      days: options.days,
      limit: options.limit,
    });
  }

  /** Get AI-generated explanation for a stock's news trend. */
  async explain(ticker: string): Promise<StockExplanationResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/explain`);
  }

  /** Search for stocks by name or ticker in news. */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse<NewsSearchResultItem>> {
    return this.request('/search', {
      q: query,
      days: options.days,
      limit: options.limit,
    });
  }

  /** Compare multiple stocks side-by-side using news sentiment. */
  async compare(tickers: string[], options: CompareOptions = {}): Promise<NewsCompareResponse> {
    return this.request('/compare', {
      tickers: tickers.join(','),
      days: options.days,
    });
  }

  /** Get the service-level News market sentiment snapshot. */
  async marketSentiment(options: MarketSentimentOptions = {}): Promise<NewsMarketSentiment> {
    return this.request('/market-sentiment', {
      days: options.days,
    });
  }

  /** Get news data statistics. */
  async stats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  /** Get public news service health (no auth required on server side). */
  async health(): Promise<HealthResponse> {
    return this.request('/health');
  }
}

export class XNamespace extends PlatformNamespace {
  /** @internal */
  constructor(http: HttpClient) {
    super(http, '/x/stocks/v1');
  }

  /** Get trending stocks on X/Twitter. */
  async trending(options: TrendingOptions = {}): Promise<XTrendingStock[]> {
    return this.request('/trending', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      type: options.type,
    });
  }

  /** Get trending sectors on X/Twitter. */
  async trendingSectors(options: TrendingGroupOptions = {}): Promise<XTrendingSector[]> {
    return this.request('/trending/sectors', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get trending countries on X/Twitter. */
  async trendingCountries(options: TrendingGroupOptions = {}): Promise<XTrendingCountry[]> {
    return this.request('/trending/countries', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get X/Twitter sentiment for a specific stock ticker. */
  async stock(ticker: string, options: StockOptions = {}): Promise<XStockDetail> {
    return this.request(`/stock/${encodeURIComponent(ticker)}`, {
      days: options.days,
    });
  }

  /** Get raw X/Twitter mentions for a specific stock ticker. */
  async mentions(ticker: string, options: RawMentionsOptions = {}): Promise<XRawMentionsResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/mentions`, {
      days: options.days,
      limit: options.limit,
    });
  }

  /** Get AI-generated explanation for a stock's X/Twitter trend. */
  async explain(ticker: string): Promise<StockExplanationResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/explain`);
  }

  /** Search for stocks by name or ticker on X/Twitter. */
  async search(query: string, options: SearchOptions = {}): Promise<XSearchResponse> {
    return this.request('/search', {
      q: query,
      days: options.days,
      limit: options.limit,
    });
  }

  /** Compare multiple stocks side-by-side on X/Twitter. */
  async compare(tickers: string[], options: CompareOptions = {}): Promise<CompareResponse> {
    return this.request('/compare', {
      tickers: tickers.join(','),
      days: options.days,
    });
  }

  /** Get the service-level X/Twitter market sentiment snapshot. */
  async marketSentiment(options: MarketSentimentOptions = {}): Promise<XMarketSentiment> {
    return this.request('/market-sentiment', {
      days: options.days,
    });
  }

  /** Get X/Twitter data statistics. */
  async stats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  /** Get public X/Twitter service health. */
  async health(): Promise<HealthResponse> {
    return this.request('/health');
  }
}

export class PolymarketNamespace extends PlatformNamespace {
  /** @internal */
  constructor(http: HttpClient) {
    super(http, '/polymarket/stocks/v1');
  }

  /** Get trending stocks on Polymarket. */
  async trending(options: TrendingOptions = {}): Promise<PolymarketTrendingStock[]> {
    return this.request('/trending', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
      type: options.type,
    });
  }

  /** Get trending sectors on Polymarket. */
  async trendingSectors(options: TrendingGroupOptions = {}): Promise<PolymarketTrendingSector[]> {
    return this.request('/trending/sectors', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get trending countries on Polymarket. */
  async trendingCountries(options: TrendingGroupOptions = {}): Promise<PolymarketTrendingCountry[]> {
    return this.request('/trending/countries', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get Polymarket sentiment for a specific stock ticker. */
  async stock(ticker: string, options: StockOptions = {}): Promise<PolymarketStockDetail> {
    return this.request(`/stock/${encodeURIComponent(ticker)}`, {
      days: options.days,
    });
  }

  /** Get raw Polymarket snapshots for a specific stock ticker. */
  async mentions(ticker: string, options: RawMentionsOptions = {}): Promise<PolymarketRawMentionsResponse> {
    return this.request(`/stock/${encodeURIComponent(ticker)}/mentions`, {
      days: options.days,
      limit: options.limit,
    });
  }

  /** Search for stocks by name or ticker on Polymarket. */
  async search(query: string, options: SearchOptions = {}): Promise<PolymarketSearchResponse> {
    return this.request('/search', {
      q: query,
      days: options.days,
      limit: options.limit,
    });
  }

  /** Compare multiple stocks side-by-side on Polymarket. */
  async compare(tickers: string[], options: CompareOptions = {}): Promise<PolymarketCompareResponse> {
    return this.request('/compare', {
      tickers: tickers.join(','),
      days: options.days,
    });
  }

  /** Get the service-level Polymarket market sentiment snapshot. */
  async marketSentiment(options: MarketSentimentOptions = {}): Promise<PolymarketMarketSentiment> {
    return this.request('/market-sentiment', {
      days: options.days,
    });
  }

  /** Get Polymarket data statistics. */
  async stats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  /** Get public Polymarket service health. */
  async health(): Promise<HealthResponse> {
    return this.request('/health');
  }
}

export class RedditCryptoNamespace extends PlatformNamespace {
  /** @internal */
  constructor(http: HttpClient) {
    super(http, '/reddit/crypto/v1');
  }

  /** Get trending crypto tokens on Reddit. */
  async trending(options: TrendingGroupOptions = {}): Promise<CryptoTrendingToken[]> {
    return this.request('/trending', {
      days: options.days,
      limit: options.limit,
      offset: options.offset,
    });
  }

  /** Get sentiment for a specific crypto token. */
  async token(symbol: string, options: StockOptions = {}): Promise<CryptoTokenSentiment> {
    return this.request(`/token/${encodeURIComponent(symbol)}`, {
      days: options.days,
    });
  }

  /** Get raw Reddit mentions for a specific crypto token. */
  async mentions(symbol: string, options: RawMentionsOptions = {}): Promise<CryptoRawMentionsResponse> {
    return this.request(`/token/${encodeURIComponent(symbol)}/mentions`, {
      days: options.days,
      limit: options.limit,
      include_inherited: options.includeInherited?.toString(),
    });
  }

  /** Search crypto tokens by symbol, name, or alias. */
  async search(query: string, options: SearchOptions = {}): Promise<CryptoSearchResponse> {
    return this.request('/search', {
      q: query,
      days: options.days,
      limit: options.limit,
    });
  }

  /** Compare multiple crypto tokens side-by-side. */
  async compare(symbols: string[], options: CompareOptions = {}): Promise<CryptoCompareResponse> {
    return this.request('/compare', {
      symbols: symbols.join(','),
      days: options.days,
    });
  }

  /** Get the service-level Reddit Crypto market sentiment snapshot. */
  async marketSentiment(options: MarketSentimentOptions = {}): Promise<CryptoMarketSentiment> {
    return this.request('/market-sentiment', {
      days: options.days,
    });
  }

  /** Get Reddit crypto data statistics. */
  async stats(): Promise<CryptoStatsResponse> {
    return this.request('/stats');
  }

  /** Get public Reddit crypto service health. */
  async health(): Promise<HealthResponse> {
    return this.request('/health');
  }
}

// ── Client ──────────────────────────────────────────────────────────

export class AdanosClient {
  readonly news: NewsNamespace;
  readonly reddit: RedditNamespace;
  readonly crypto: RedditCryptoNamespace;
  readonly redditCrypto: RedditCryptoNamespace;
  readonly x: XNamespace;
  readonly polymarket: PolymarketNamespace;

  /**
   * Create a new Adanos Market Sentiment API client.
   *
   * @param options.apiKey - Your API key (`adanos_api_key_here`).
   * @param options.baseUrl - API base URL. Default: `https://api.adanos.org`.
   * @param options.timeout - Request timeout in ms. Default: 30000.
   */
  constructor(options: ClientOptions) {
    const baseUrl = options.baseUrl ?? 'https://api.adanos.org';
    const timeout = options.timeout ?? 30_000;
    const http = new HttpClient(baseUrl, options.apiKey, timeout);

    this.news = new NewsNamespace(http);
    this.reddit = new RedditNamespace(http);
    this.crypto = new RedditCryptoNamespace(http);
    this.redditCrypto = this.crypto;
    this.x = new XNamespace(http);
    this.polymarket = new PolymarketNamespace(http);
  }
}

export const StockSentimentClient = AdanosClient;

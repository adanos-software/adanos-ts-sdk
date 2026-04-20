import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AdanosClient,
  StockSentimentClient,
  ApiError,
  StockSentimentError,
} from '../src/index.js';

const BASE_URL = 'https://api.adanos.org';
const API_KEY = 'adanos_test_api_key';

// ── Mock data ───────────────────────────────────────────────────────

const TRENDING_STOCK = {
  ticker: 'TSLA', buzz_score: 85.0, trend: 'rising',
  mentions: 120, unique_posts: 80, subreddit_count: 5,
  sentiment_score: 0.6, bullish_pct: 65, bearish_pct: 15,
  total_upvotes: 5000,
};

const STOCK_SENTIMENT = {
  ticker: 'TSLA', found: true, mentions: 342,
  daily_trend: [{ date: '2026-03-05', mentions: 52, sentiment_score: 0.31, buzz_score: 42.8 }],
};

const SEARCH_RESPONSE = {
  query: 'Tesla', count: 1, period_days: 7,
  results: [{
    ticker: 'TSLA',
    name: 'Tesla Inc',
    summary: {
      mentions: 342,
      buzz_score: 87.5,
      trend: 'rising',
      sentiment_score: 0.23,
      bullish_pct: 45,
      bearish_pct: 18,
      unique_posts: 45,
      subreddit_count: 8,
      total_upvotes: 15234,
    },
  }],
};

const POLYMARKET_SEARCH_RESPONSE = {
  query: 'AAPL', count: 1, period_days: 7,
  results: [{
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    sector: 'Technology',
    country: 'United States',
    aliases: ['Apple'],
    summary: {
      buzz_score: 71.4,
      trend: 'rising',
      trade_count: 12,
      market_count: 4,
      unique_traders: 6,
      sentiment_score: 0.18,
      bullish_pct: 67,
      bearish_pct: 33,
      total_liquidity: 94750.0,
    },
  }],
};

const COMPARE_RESPONSE = {
  period_days: 7,
  stocks: [{
    ticker: 'TSLA',
    company_name: 'Tesla Inc.',
    buzz_score: 87.5,
    trend: 'rising',
    mentions: 342,
    unique_posts: 45,
    subreddit_count: 8,
    sentiment_score: 0.23,
    bullish_pct: 45,
    bearish_pct: 18,
    total_upvotes: 15234,
    trend_history: [45.2, 52.1, 48.7, 67.3, 72.1, 78.4, 87.5],
  }],
};

const REDDIT_MARKET_SENTIMENT = {
  buzz_score: 57.4,
  trend: 'stable',
  mentions: 3992,
  unique_posts: 418,
  subreddit_count: 21,
  total_upvotes: 15234,
  active_tickers: 1000,
  sentiment_score: 0.045,
  positive_count: 1440,
  negative_count: 998,
  neutral_count: 1554,
  bullish_pct: 36,
  bearish_pct: 25,
  trend_history: [49.8, 52.1, 50.7, 55.6, 58.3, 60.2, 57.4],
  drivers: [{ ticker: 'SPY', mentions: 129, buzz_score: 74.1, sentiment_score: 0.009 }],
};

const EXPLAIN_RESPONSE = {
  ticker: 'TSLA', explanation: 'Tesla is trending due to...',
  cached: false, generated_at: '2026-02-16T10:00:00Z',
  model: 'llama3.1:8b',
};

const X_TRENDING_STOCK = {
  ticker: 'NVDA', buzz_score: 90.0, trend: 'rising', mentions: 200,
};

const X_STOCK_DETAIL = {
  ticker: 'NVDA',
  found: true,
  mentions: 156,
  daily_trend: [{ date: '2026-03-05', mentions: 21, sentiment_score: 0.27, avg_rank: 3.2, buzz_score: 56.1 }],
};

const TRENDING_SECTOR = {
  sector: 'Technology', buzz_score: 75.0, trend: 'rising',
  mentions: 500, unique_tickers: 20, subreddit_count: 8,
  sentiment_score: 0.5, bullish_pct: 60, bearish_pct: 20,
  total_upvotes: 15000, top_tickers: ['TSLA', 'AAPL', 'NVDA'],
};

const TRENDING_COUNTRY = {
  country: 'United States', buzz_score: 80.0, trend: 'stable',
  mentions: 800, unique_tickers: 30, subreddit_count: 10,
  sentiment_score: 0.4, bullish_pct: 55, bearish_pct: 25,
  total_upvotes: 20000, top_tickers: ['TSLA', 'AAPL'],
};

const NEWS_TRENDING_STOCK = {
  ticker: 'NVDA', buzz_score: 79.2, trend: 'rising',
  mentions: 309, source_count: 25,
  sentiment_score: 0.44, bullish_pct: 81, bearish_pct: 8,
  trend_history: [58.2, 62.1, 79.2],
};

const NEWS_STOCK_SENTIMENT = {
  ticker: 'NVDA',
  found: true,
  buzz_score: 79.2,
  mentions: 309,
  source_count: 25,
  daily_trend: [{ date: '2026-03-05', mentions: 41, sentiment_score: 0.58, buzz_score: 62.4 }],
  top_sources: [{ source: 'reuters', count: 22 }],
  top_mentions: [{
    text_snippet: 'NVIDIA beats earnings estimates.',
    sentiment_score: 0.72,
    sentiment_label: 'positive',
    source: 'reuters',
    created_utc: '2026-03-05T12:00:00+00:00',
  }],
};

const NEWS_COMPARE_RESPONSE = {
  period_days: 7,
  stocks: [{
    ticker: 'NVDA',
    company_name: 'NVIDIA Corporation',
    buzz_score: 79.2,
    trend: 'rising',
    mentions: 309,
    source_count: 25,
    sentiment_score: 0.44,
    bullish_pct: 81,
    bearish_pct: 8,
    trend_history: [58.2, 62.1, 79.2],
  }],
};

const NEWS_MARKET_SENTIMENT = {
  buzz_score: 53.8,
  trend: 'stable',
  mentions: 1298,
  unique_articles: 911,
  source_count: 44,
  active_tickers: 233,
  sentiment_score: 0.064,
  positive_count: 512,
  negative_count: 308,
  neutral_count: 478,
  bullish_pct: 39,
  bearish_pct: 24,
  trend_history: [49.1, 50.4, 48.7, 52.2, 55.1, 54.3, 53.8],
  drivers: [{ ticker: 'AAPL', mentions: 87, buzz_score: 69.7, sentiment_score: 0.22 }],
};

const NEWS_TRENDING_SECTOR = {
  sector: 'Technology',
  buzz_score: 63.5,
  trend: 'rising',
  mentions: 180,
  unique_tickers: 14,
  source_count: 9,
  sentiment_score: 0.28,
  bullish_pct: 62,
  bearish_pct: 14,
  top_tickers: ['NVDA', 'AAPL', 'MSFT'],
};

const NEWS_TRENDING_COUNTRY = {
  country: 'United States',
  buzz_score: 68.1,
  trend: 'stable',
  mentions: 260,
  unique_tickers: 21,
  source_count: 11,
  sentiment_score: 0.22,
  bullish_pct: 58,
  bearish_pct: 16,
  top_tickers: ['NVDA', 'AMZN', 'TSLA'],
};

const NEWS_STATS = {
  total_mentions: 1855,
  unique_tickers: 766,
  tickers: ['NVDA', 'AAPL', 'MSFT'],
  supported_tickers: 11800,
  days_covered: 30,
  last_updated: '2026-03-07T08:36:07Z',
};

const NEWS_HEALTH = {
  status: 'healthy',
  service: 'news-stocks',
  version: '1.20.0',
  total_mentions: 1855,
  tickers_tracked: 766,
};

const POLYMARKET_TRENDING_STOCK = {
  ticker: 'AAPL',
  buzz_score: 71.4,
  trend: 'rising',
  trade_count: 8,
  market_count: 4,
  unique_traders: 6,
  bullish_pct: 67,
  bearish_pct: 33,
  total_liquidity: 94750.0,
};

const POLYMARKET_STOCK_DETAIL = {
  ticker: 'AAPL',
  found: true,
  daily_trend: [{ date: '2026-03-05', trade_count: 5, sentiment_score: 0.22, buzz_score: 64.1 }],
};

const POLYMARKET_COMPARE_RESPONSE = {
  period_days: 7,
  stocks: [{
    ticker: 'AAPL',
    buzz_score: 71.4,
    trend: 'rising',
    trade_count: 8,
    market_count: 4,
    unique_traders: 6,
    sentiment_score: 0.18,
    bullish_pct: 67,
    bearish_pct: 33,
    total_liquidity: 94750.0,
    trend_history: [48.2, 51.0, 55.3, 61.1, 65.8, 69.2, 71.4],
  }],
};

const X_MARKET_SENTIMENT = {
  buzz_score: 56.2,
  trend: 'rising',
  mentions: 2847,
  unique_tweets: 913,
  unique_authors: 604,
  total_upvotes: 28471,
  active_tickers: 442,
  sentiment_score: 0.081,
  positive_count: 1198,
  negative_count: 741,
  neutral_count: 908,
  bullish_pct: 42,
  bearish_pct: 26,
  trend_history: [48.9, 50.7, 52.6, 54.4, 57.1, 58.3, 56.2],
  drivers: [{ ticker: 'TSLA', mentions: 156, buzz_score: 72.5, sentiment_score: 0.35 }],
};

const POLYMARKET_MARKET_SENTIMENT = {
  buzz_score: 58.4,
  trend: 'rising',
  trade_count: 512,
  market_count: 93,
  unique_traders: 281,
  total_liquidity: 245000.0,
  active_tickers: 31,
  sentiment_score: 0.11,
  positive_count: 41,
  negative_count: 29,
  neutral_count: 23,
  bullish_pct: 44,
  bearish_pct: 31,
  trend_history: [52.1, 54.0, 56.8, 59.2, 61.0, 60.1, 58.4],
  drivers: [{ ticker: 'AAPL', trade_count: 52, buzz_score: 68.9, sentiment_score: 0.28 }],
};

// ── Helpers ─────────────────────────────────────────────────────────

let fetchMock: ReturnType<typeof vi.fn>;
let lastRequest: { url: string; init: RequestInit } | null;
const originalFetch = globalThis.fetch;

function mockFetch(status: number, body: unknown) {
  fetchMock = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
    lastRequest = { url, init };
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => body,
    };
  });
  globalThis.fetch = fetchMock;
}

function requestUrl(): URL {
  return new URL(lastRequest!.url);
}

function requestParams(): Record<string, string> {
  return Object.fromEntries(requestUrl().searchParams);
}

function requestHeaders(): Record<string, string> {
  return lastRequest!.init.headers as Record<string, string>;
}

function client(): AdanosClient {
  return new AdanosClient({ apiKey: API_KEY, baseUrl: BASE_URL });
}

beforeEach(() => {
  lastRequest = null;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

// ── Auth ────────────────────────────────────────────────────────────

describe('Auth', () => {
  it('sends X-API-Key header', async () => {
    mockFetch(200, []);
    await client().reddit.trending();
    expect(requestHeaders()['X-API-Key']).toBe(API_KEY);
  });

  it('uses custom base URL', async () => {
    mockFetch(200, []);
    const c = new AdanosClient({ apiKey: API_KEY, baseUrl: 'https://custom.example.com' });
    await c.reddit.trending();
    expect(requestUrl().origin).toBe('https://custom.example.com');
  });

  it('strips trailing slash from base URL', async () => {
    mockFetch(200, []);
    const c = new AdanosClient({ apiKey: API_KEY, baseUrl: 'https://example.com/' });
    await c.reddit.trending();
    expect(requestUrl().pathname).toBe('/reddit/stocks/v1/trending');
  });

  it('sends Accept: application/json header', async () => {
    mockFetch(200, []);
    await client().reddit.trending();
    expect(requestHeaders()['Accept']).toBe('application/json');
  });

  it('uses default base URL when not specified', async () => {
    mockFetch(200, []);
    const c = new AdanosClient({ apiKey: API_KEY });
    await c.reddit.trending();
    expect(requestUrl().origin).toBe('https://api.adanos.org');
  });

  it('keeps StockSentimentClient as an alias', () => {
    expect(StockSentimentClient).toBe(AdanosClient);
  });
});

// ── Reddit trending ─────────────────────────────────────────────────

describe('Reddit trending', () => {
  it('returns trending stocks with default params', async () => {
    mockFetch(200, [TRENDING_STOCK]);
    const result = await client().reddit.trending();
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('TSLA');
    expect(result[0].buzz_score).toBe(85.0);
  });

  it('passes custom params', async () => {
    mockFetch(200, []);
    await client().reddit.trending({ days: 7, limit: 5, offset: 10, type: 'etf' });
    const params = requestParams();
    expect(params.days).toBe('7');
    expect(params.limit).toBe('5');
    expect(params.offset).toBe('10');
    expect(params.type).toBe('etf');
  });

  it('omits undefined params from query string', async () => {
    mockFetch(200, []);
    await client().reddit.trending({ days: 3 });
    const params = requestParams();
    expect(params.days).toBe('3');
    expect(params.limit).toBeUndefined();
    expect(params.offset).toBeUndefined();
    expect(params.type).toBeUndefined();
  });

  it('returns empty array', async () => {
    mockFetch(200, []);
    const result = await client().reddit.trending();
    expect(result).toEqual([]);
  });
});

// ── Reddit stock ────────────────────────────────────────────────────

describe('Reddit stock', () => {
  it('returns stock sentiment', async () => {
    mockFetch(200, STOCK_SENTIMENT);
    const result = await client().reddit.stock('TSLA');
    expect(result.ticker).toBe('TSLA');
    expect(result.found).toBe(true);
    expect(result.mentions).toBe(342);
    expect('total_mentions' in result).toBe(false);
    expect(result.daily_trend?.[0].sentiment_score).toBe(0.31);
    expect('sentiment' in (result.daily_trend?.[0] ?? {})).toBe(false);
    expect(requestUrl().pathname).toBe('/reddit/stocks/v1/stock/TSLA');
  });

  it('passes days param', async () => {
    mockFetch(200, { ...STOCK_SENTIMENT, ticker: 'AAPL' });
    await client().reddit.stock('AAPL', { days: 14 });
    expect(requestParams().days).toBe('14');
  });

  it('encodes ticker in URL path', async () => {
    mockFetch(200, { ticker: 'BRK.B', found: true });
    await client().reddit.stock('BRK.B');
    expect(requestUrl().pathname).toBe('/reddit/stocks/v1/stock/BRK.B');
  });
});

// ── Reddit explain ──────────────────────────────────────────────────

describe('Reddit explain', () => {
  it('returns explanation', async () => {
    mockFetch(200, EXPLAIN_RESPONSE);
    const result = await client().reddit.explain('TSLA');
    expect(result.explanation).toBe('Tesla is trending due to...');
    expect(requestUrl().pathname).toBe('/reddit/stocks/v1/stock/TSLA/explain');
  });
});

// ── Reddit search ───────────────────────────────────────────────────

describe('Reddit search', () => {
  it('searches and passes query params', async () => {
    mockFetch(200, SEARCH_RESPONSE);
    const result = await client().reddit.search('Tesla', { days: 14, limit: 5 });
    expect(requestParams().q).toBe('Tesla');
    expect(requestParams().days).toBe('14');
    expect(requestParams().limit).toBe('5');
    expect(result.count).toBe(1);
    expect(result.period_days).toBe(7);
    expect(result.results[0].ticker).toBe('TSLA');
    expect(result.results[0].summary.mentions).toBe(342);
  });
});

// ── Reddit compare ──────────────────────────────────────────────────

describe('Reddit compare', () => {
  it('joins tickers with comma', async () => {
    mockFetch(200, COMPARE_RESPONSE);
    const result = await client().reddit.compare(['TSLA', 'AAPL'], { days: 7 });
    expect(requestParams().tickers).toBe('TSLA,AAPL');
    expect(requestParams().days).toBe('7');
    expect(result.stocks[0].total_upvotes).toBe(15234);
    expect(result.stocks[0].trend_history.at(-1)).toBe(87.5);
    expect('sentiment' in result.stocks[0]).toBe(false);
    expect('upvotes' in result.stocks[0]).toBe(false);
  });
});

describe('Reddit market sentiment', () => {
  it('returns service-level market sentiment', async () => {
    mockFetch(200, REDDIT_MARKET_SENTIMENT);
    const result = await client().reddit.marketSentiment({ days: 7 });
    expect(requestUrl().pathname).toBe('/reddit/stocks/v1/market-sentiment');
    expect(requestParams().days).toBe('7');
    expect(result.drivers[0].ticker).toBe('SPY');
  });
});

// ── Reddit trending sectors ─────────────────────────────────────────

describe('Reddit trending sectors', () => {
  it('returns sectors', async () => {
    mockFetch(200, [TRENDING_SECTOR]);
    const result = await client().reddit.trendingSectors({ days: 7 });
    expect(result).toHaveLength(1);
    expect(result[0].sector).toBe('Technology');
  });

  it('passes params', async () => {
    mockFetch(200, []);
    await client().reddit.trendingSectors({ days: 3, limit: 5, offset: 2 });
    const params = requestParams();
    expect(params.days).toBe('3');
    expect(params.limit).toBe('5');
    expect(params.offset).toBe('2');
  });
});

// ── Reddit trending countries ───────────────────────────────────────

describe('Reddit trending countries', () => {
  it('returns countries', async () => {
    mockFetch(200, [TRENDING_COUNTRY]);
    const result = await client().reddit.trendingCountries();
    expect(result[0].country).toBe('United States');
  });
});

// ── News endpoints ──────────────────────────────────────────────────

describe('News trending', () => {
  it('returns trending stocks with source_count', async () => {
    mockFetch(200, [NEWS_TRENDING_STOCK]);
    const result = await client().news.trending({ days: 7, source: 'reuters' });
    expect(result).toHaveLength(1);
    expect(result[0].source_count).toBe(25);
    expect(requestParams().source).toBe('reuters');
    expect(requestUrl().pathname).toBe('/news/stocks/v1/trending');
  });
});

describe('News stock', () => {
  it('returns stock sentiment with top_sources and source-based mentions', async () => {
    mockFetch(200, NEWS_STOCK_SENTIMENT);
    const result = await client().news.stock('NVDA', { days: 7 });
    expect(result.found).toBe(true);
    expect(result.mentions).toBe(309);
    expect('total_mentions' in result).toBe(false);
    expect(result.source_count).toBe(25);
    expect(result.daily_trend?.[0].sentiment_score).toBe(0.58);
    expect('sentiment' in (result.daily_trend?.[0] ?? {})).toBe(false);
    expect(result.top_sources?.[0].source).toBe('reuters');
    expect(result.top_mentions?.[0].source).toBe('reuters');
    expect(requestUrl().pathname).toBe('/news/stocks/v1/stock/NVDA');
    expect(requestParams().days).toBe('7');
    expect(requestParams().source).toBeUndefined();
  });
});

describe('News compare', () => {
  it('returns news compare response with source_count', async () => {
    mockFetch(200, NEWS_COMPARE_RESPONSE);
    const result = await client().news.compare(['NVDA', 'AAPL'], { days: 7 });
    expect(result.stocks[0].source_count).toBe(25);
    expect(result.stocks[0].sentiment_score).toBe(0.44);
    expect(result.stocks[0].trend_history.at(-1)).toBe(79.2);
    expect('sentiment' in result.stocks[0]).toBe(false);
    expect(requestUrl().pathname).toBe('/news/stocks/v1/compare');
    expect(requestParams().tickers).toBe('NVDA,AAPL');
    expect(requestParams().days).toBe('7');
    expect(requestParams().source).toBeUndefined();
  });
});

describe('News explain/search', () => {
  it('does not send a source param for explain', async () => {
    mockFetch(200, EXPLAIN_RESPONSE);
    await client().news.explain('NVDA');
    expect(requestUrl().pathname).toBe('/news/stocks/v1/stock/NVDA/explain');
    expect(Object.keys(requestParams())).toHaveLength(0);
  });

  it('does not send a source param for search and forwards search options', async () => {
    mockFetch(200, {
      query: 'NVIDIA',
      count: 1,
      period_days: 7,
      results: [{
        ticker: 'NVDA',
        name: 'NVIDIA Corporation',
        summary: {
          mentions: 309,
          buzz_score: 79.2,
          trend: 'rising',
          sentiment_score: 0.44,
          bullish_pct: 81,
          bearish_pct: 8,
          source_count: 25,
        },
      }],
    });
    const result = await client().news.search('NVIDIA', { days: 7, limit: 10 });
    expect(requestUrl().pathname).toBe('/news/stocks/v1/search');
    expect(requestParams().q).toBe('NVIDIA');
    expect(requestParams().days).toBe('7');
    expect(requestParams().limit).toBe('10');
    expect(requestParams().source).toBeUndefined();
    expect(result.results[0].summary.source_count).toBe(25);
  });
});

describe('News trending sectors/countries', () => {
  it('returns sectors and forwards source filter', async () => {
    mockFetch(200, [NEWS_TRENDING_SECTOR]);
    const result = await client().news.trendingSectors({ days: 3, source: 'reuters' });
    expect(result).toHaveLength(1);
    expect(result[0].source_count).toBe(9);
    expect(requestUrl().pathname).toBe('/news/stocks/v1/trending/sectors');
    expect(requestParams().days).toBe('3');
    expect(requestParams().source).toBe('reuters');
  });

  it('returns countries and forwards source filter', async () => {
    mockFetch(200, [NEWS_TRENDING_COUNTRY]);
    const result = await client().news.trendingCountries({ source: 'reuters' });
    expect(result).toHaveLength(1);
    expect(result[0].country).toBe('United States');
    expect(requestUrl().pathname).toBe('/news/stocks/v1/trending/countries');
    expect(requestParams().source).toBe('reuters');
  });
});

describe('News stats/health', () => {
  it('does not send a source param for stats', async () => {
    mockFetch(200, NEWS_STATS);
    const result = await client().news.stats();
    expect(result.total_mentions).toBe(1855);
    expect(requestUrl().pathname).toBe('/news/stocks/v1/stats');
    expect(Object.keys(requestParams())).toHaveLength(0);
  });

  it('uses public news health endpoint', async () => {
    mockFetch(200, NEWS_HEALTH);
    const result = await client().news.health();
    expect(result.status).toBe('healthy');
    expect(requestUrl().pathname).toBe('/news/stocks/v1/health');
    expect(requestUrl().search).toBe('');
  });
});

describe('News market sentiment', () => {
  it('returns service-level market sentiment', async () => {
    mockFetch(200, NEWS_MARKET_SENTIMENT);
    const result = await client().news.marketSentiment({ days: 3 });
    expect(requestUrl().pathname).toBe('/news/stocks/v1/market-sentiment');
    expect(requestParams().days).toBe('3');
    expect(result.source_count).toBe(44);
  });
});

// ── X trending ──────────────────────────────────────────────────────

describe('X trending', () => {
  it('returns trending stocks', async () => {
    mockFetch(200, [X_TRENDING_STOCK]);
    const result = await client().x.trending();
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('NVDA');
  });

  it('passes type param', async () => {
    mockFetch(200, []);
    await client().x.trending({ type: 'stock' });
    expect(requestParams().type).toBe('stock');
  });

  it('uses correct URL prefix', async () => {
    mockFetch(200, []);
    await client().x.trending();
    expect(requestUrl().pathname).toBe('/x/stocks/v1/trending');
  });
});

// ── X stock ─────────────────────────────────────────────────────────

describe('X stock', () => {
  it('returns stock detail', async () => {
    mockFetch(200, X_STOCK_DETAIL);
    const result = await client().x.stock('NVDA');
    expect(result.ticker).toBe('NVDA');
    expect(result.mentions).toBe(156);
    expect('total_mentions' in result).toBe(false);
    expect(result.daily_trend?.[0].sentiment_score).toBe(0.27);
    expect('sentiment' in (result.daily_trend?.[0] ?? {})).toBe(false);
    expect(requestUrl().pathname).toBe('/x/stocks/v1/stock/NVDA');
  });
});

// ── X explain ───────────────────────────────────────────────────────

describe('X explain', () => {
  it('returns explanation without query params', async () => {
    mockFetch(200, EXPLAIN_RESPONSE);
    const result = await client().x.explain('NVDA');
    expect(result.explanation).toBe(EXPLAIN_RESPONSE.explanation);
    expect(requestUrl().pathname).toBe('/x/stocks/v1/stock/NVDA/explain');
    expect(Object.keys(requestParams())).toHaveLength(0);
  });

  it('encodes ticker path segments', async () => {
    mockFetch(200, { ...EXPLAIN_RESPONSE, ticker: 'GME' });
    const result = await client().x.explain('$GME');
    expect(result.ticker).toBe('GME');
    expect(requestUrl().pathname).toBe('/x/stocks/v1/stock/%24GME/explain');
  });
});

// ── X search ────────────────────────────────────────────────────────

describe('X search', () => {
  it('searches stocks with summary payload', async () => {
    mockFetch(200, {
      query: 'NVDA',
      count: 1,
      period_days: 7,
      results: [{
        ticker: 'NVDA',
        name: 'NVIDIA Corporation',
        summary: {
          mentions: 156,
          buzz_score: 72.5,
          trend: 'rising',
          sentiment_score: 0.35,
          bullish_pct: 45,
          bearish_pct: 12,
          unique_tweets: 42,
          total_upvotes: 2847,
        },
      }],
    });
    const result = await client().x.search('NVDA', { days: 7, limit: 3 });
    expect(requestParams().q).toBe('NVDA');
    expect(requestParams().days).toBe('7');
    expect(requestParams().limit).toBe('3');
    expect(result.results[0].summary.unique_tweets).toBe(42);
  });
});

// ── X compare ───────────────────────────────────────────────────────

describe('X compare', () => {
  it('joins tickers', async () => {
    mockFetch(200, COMPARE_RESPONSE);
    const result = await client().x.compare(['NVDA', 'AMD']);
    expect(requestParams().tickers).toBe('NVDA,AMD');
    expect(result.stocks[0].trend_history.at(-1)).toBe(87.5);
  });

  it('passes days param', async () => {
    mockFetch(200, COMPARE_RESPONSE);
    await client().x.compare(['NVDA', 'AMD'], { days: 14 });
    expect(requestParams().days).toBe('14');
  });
});

describe('X market sentiment', () => {
  it('returns service-level market sentiment', async () => {
    mockFetch(200, X_MARKET_SENTIMENT);
    const result = await client().x.marketSentiment();
    expect(requestUrl().pathname).toBe('/x/stocks/v1/market-sentiment');
    expect(requestParams().days).toBeUndefined();
    expect(result.unique_authors).toBe(604);
  });
});

// ── X trending sectors / countries ──────────────────────────────────

describe('X trending sectors', () => {
  it('uses correct path', async () => {
    mockFetch(200, []);
    await client().x.trendingSectors({ days: 7 });
    expect(requestUrl().pathname).toBe('/x/stocks/v1/trending/sectors');
  });
});

describe('X trending countries', () => {
  it('uses correct path', async () => {
    mockFetch(200, []);
    await client().x.trendingCountries();
    expect(requestUrl().pathname).toBe('/x/stocks/v1/trending/countries');
  });
});

// ── Polymarket trending ─────────────────────────────────────────────

describe('Polymarket trending', () => {
  it('returns trending stocks', async () => {
    mockFetch(200, [POLYMARKET_TRENDING_STOCK]);
    const result = await client().polymarket.trending();
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe('AAPL');
    expect(result[0].trade_count).toBe(8);
    expect(result[0].market_count).toBe(4);
    expect(result[0].unique_traders).toBe(6);
  });

  it('passes type param', async () => {
    mockFetch(200, []);
    await client().polymarket.trending({ type: 'etf' });
    expect(requestParams().type).toBe('etf');
  });

  it('uses correct URL prefix', async () => {
    mockFetch(200, []);
    await client().polymarket.trending();
    expect(requestUrl().pathname).toBe('/polymarket/stocks/v1/trending');
  });
});

// ── Polymarket stock/search/compare ────────────────────────────────

describe('Polymarket stock', () => {
  it('returns stock detail', async () => {
    mockFetch(200, POLYMARKET_STOCK_DETAIL);
    const result = await client().polymarket.stock('AAPL');
    expect(result.ticker).toBe('AAPL');
    expect(result.daily_trend?.[0].sentiment_score).toBe(0.22);
    expect(requestUrl().pathname).toBe('/polymarket/stocks/v1/stock/AAPL');
  });
});

describe('Polymarket search', () => {
  it('searches stocks with summary payload', async () => {
    mockFetch(200, POLYMARKET_SEARCH_RESPONSE);
    const result = await client().polymarket.search('AAPL', { days: 30, limit: 4 });
    expect(requestParams().q).toBe('AAPL');
    expect(requestParams().days).toBe('30');
    expect(requestParams().limit).toBe('4');
    expect(result.count).toBe(1);
    expect(result.results[0].summary.trade_count).toBe(12);
  });
});

describe('Polymarket compare', () => {
  it('joins tickers', async () => {
    mockFetch(200, POLYMARKET_COMPARE_RESPONSE);
    const result = await client().polymarket.compare(['AAPL', 'TSLA']);
    expect(requestParams().tickers).toBe('AAPL,TSLA');
    expect(result.stocks[0].trade_count).toBe(8);
    expect(result.stocks[0].market_count).toBe(4);
    expect(result.stocks[0].trend_history.at(-1)).toBe(71.4);
    expect('sentiment' in result.stocks[0]).toBe(false);
  });
});

describe('Polymarket market sentiment', () => {
  it('returns service-level market sentiment', async () => {
    mockFetch(200, POLYMARKET_MARKET_SENTIMENT);
    const result = await client().polymarket.marketSentiment({ days: 2 });
    expect(requestUrl().pathname).toBe('/polymarket/stocks/v1/market-sentiment');
    expect(requestParams().days).toBe('2');
    expect(result.drivers[0].trade_count).toBe(52);
  });
});

// ── Error handling ──────────────────────────────────────────────────

describe('Errors', () => {
  it('throws ApiError on 401 with status and detail', async () => {
    mockFetch(401, { detail: 'Invalid API key' });
    const err = await client().reddit.trending().catch((e) => e) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(StockSentimentError);
    expect(err.status).toBe(401);
    expect(err.detail).toBe('Invalid API key');
    expect(err.message).toBe('401: Invalid API key');
  });

  it('throws ApiError on 429', async () => {
    mockFetch(429, { detail: 'Rate limit exceeded' });
    const err = await client().reddit.trending().catch((e) => e) as ApiError;
    expect(err.status).toBe(429);
    expect(err.detail).toBe('Rate limit exceeded');
  });

  it('throws ApiError on 500', async () => {
    mockFetch(500, { detail: 'Internal Server Error' });
    const err = await client().reddit.trending().catch((e) => e) as ApiError;
    expect(err.status).toBe(500);
  });

  it('handles non-JSON error responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => { throw new Error('not json'); },
    });
    const err = await client().reddit.trending().catch((e) => e) as ApiError;
    expect(err.detail).toBe('Bad Gateway');
  });

  it('falls back to JSON.stringify when detail field is absent', async () => {
    mockFetch(400, { error: 'Bad request', code: 123 });
    const err = await client().reddit.trending().catch((e) => e) as ApiError;
    expect(err.status).toBe(400);
    expect(err.detail).toBe('{"error":"Bad request","code":123}');
  });

  it('propagates network errors as-is (not ApiError)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(client().reddit.trending()).rejects.toThrow(TypeError);
    await expect(client().reddit.trending()).rejects.toThrow('Failed to fetch');
  });

  it('passes AbortSignal with timeout to fetch', async () => {
    mockFetch(200, []);
    await client().reddit.trending();
    const signal = lastRequest!.init.signal;
    expect(signal).toBeDefined();
  });
});

// ── Edge cases ──────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('encodes special characters in ticker URL', async () => {
    mockFetch(200, { ticker: 'BRK B', found: true });
    await client().reddit.stock('BRK B');
    expect(lastRequest!.url).toContain('/stock/BRK%20B');
  });

  it('sends empty tickers param for empty compare array', async () => {
    mockFetch(200, COMPARE_RESPONSE);
    await client().reddit.compare([]);
    expect(requestParams().tickers).toBe('');
  });

  it('compare with single ticker has no trailing comma', async () => {
    mockFetch(200, COMPARE_RESPONSE);
    await client().reddit.compare(['TSLA']);
    expect(requestParams().tickers).toBe('TSLA');
  });
});

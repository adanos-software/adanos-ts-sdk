import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AdanosClient } from '../src/index.js';

let status = 200;
let payload: unknown;
let requestUrl: URL;
let baseUrl: string;
const server = createServer((request, response) => {
  requestUrl = new URL(request.url ?? '/', baseUrl);
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
});

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test server port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('Polymarket Graph contract over HTTP', () => {
  it.each(['BRK', 'EWG', 'SAP.DE'])('preserves Graph key %s', async (ticker) => {
    status = 200;
    payload = { ticker, period_days: 7, count: 0, results: [] };
    const client = new AdanosClient({ apiKey: 'test-key', baseUrl });
    expect(await client.polymarket.mentions(ticker)).toEqual(payload);
    expect(requestUrl.pathname).toBe(`/polymarket/stocks/v1/stock/${ticker}/mentions`);
  });

  it.each([
    { ticker: 'BK', code: 404, body: { detail: { error_code: 'unsupported_ticker', message: 'Unsupported ticker BK.' } } },
    ...['BRK.B', 'BRK-B', '$AAPL'].map((ticker) => ({
      ticker, code: 422, body: { detail: [{ loc: ['path', 'ticker'], msg: 'Invalid Graph key', type: 'string_pattern_mismatch' }] },
    })),
    { ticker: 'AAPL', code: 503, body: { detail: 'Polymarket identity lookup unavailable' } },
  ])('preserves HTTP $code for $ticker and its error payload', async ({ ticker, code, body }) => {
    status = code;
    payload = body;
    const client = new AdanosClient({ apiKey: 'test-key', baseUrl });
    await expect(client.polymarket.mentions(ticker)).rejects.toMatchObject({
      name: 'ApiError', status: code, payload,
    });
    expect(requestUrl.pathname).toBe(`/polymarket/stocks/v1/stock/${encodeURIComponent(ticker)}/mentions`);
  });

  it.each([null, 0])('preserves compare score %s without rewriting aliases', async (buzzScore) => {
    status = 200;
    payload = { period_days: 7, stocks: [{
      ticker: 'BK', buzz_score: buzzScore, trade_count: 0, market_count: 0,
      current_market_count: 0, total_liquidity: 0,
    }] };
    const client = new AdanosClient({ apiKey: 'test-key', baseUrl });
    const result = await client.polymarket.compare(['BNY', 'SAP.DE', 'BK']);
    expect(result).toEqual(payload);
    expect(requestUrl.searchParams.get('tickers')).toBe('BNY,SAP.DE,BK');
    expect(result.stocks[0].buzz_score).toBe(buzzScore);
    expect(result.stocks[0].trend_history).toBeUndefined();
  });
});

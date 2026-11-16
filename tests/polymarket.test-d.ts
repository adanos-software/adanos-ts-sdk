import { expectTypeOf, test } from 'vitest';
import type { PolymarketCompareStockItem } from '../src/index.js';

test('Polymarket compare keeps required nullable scores and optional history', () => {
  expectTypeOf<PolymarketCompareStockItem['buzz_score']>().toEqualTypeOf<number | null>();
  expectTypeOf<PolymarketCompareStockItem['trend_history']>().toEqualTypeOf<number[] | undefined>();
});

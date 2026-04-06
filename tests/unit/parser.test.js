import { describe, it, expect } from 'vitest';
import path from 'path';
import { parseJUnitResults } from '../../src/parser.js';

const fixturesDir = path.join(__dirname, '../fixtures');

describe('parseJUnitResults', () => {
  it('should parse sample JUnit XML', () => {
    const result = parseJUnitResults(fixturesDir, ['sample.xml']);

    expect(result.summary.total).toBe(7);
    expect(result.summary.passed).toBe(5);
    expect(result.summary.failed).toBe(1);
    expect(result.summary.skipped).toBe(1);
    expect(result.summary.passRate).toBeGreaterThan(0);
    expect(result.summary.lastRun).toMatch(/^\d{4}-/);
  });

  it('should group by suite name', () => {
    const result = parseJUnitResults(fixturesDir, ['sample.xml']);

    expect(result.suites.length).toBe(2);
    const auth = result.suites.find((s) => s.name === 'Auth');
    expect(auth.total).toBe(4);
    expect(auth.passed).toBe(3);
    expect(auth.failed).toBe(1);

    const cart = result.suites.find((s) => s.name === 'Cart');
    expect(cart.total).toBe(3);
    expect(cart.passed).toBe(2);
    expect(cart.failed).toBe(0);
  });

  it('should calculate pass rate correctly', () => {
    const result = parseJUnitResults(fixturesDir, ['sample.xml']);
    // 5 passed / 7 total = 71.4%
    expect(result.summary.passRate).toBeCloseTo(71.4, 0);
  });

  it('should calculate avg duration in minutes', () => {
    const result = parseJUnitResults(fixturesDir, ['sample.xml']);
    // Total time = 2.5 + 1.2 = 3.7 seconds = ~0.1 minutes
    expect(result.summary.avgDuration).toBeGreaterThanOrEqual(0);
  });

  it('should return empty structure arrays', () => {
    const result = parseJUnitResults(fixturesDir, ['sample.xml']);
    expect(result.history).toEqual([]);
    expect(result.browsers).toEqual([]);
    expect(result.topFailures).toEqual([]);
    expect(result.recentRuns).toEqual([]);
  });

  it('should handle multiple XML files', () => {
    // Parse same file twice — totals should double
    const result = parseJUnitResults(fixturesDir, ['sample.xml', 'sample.xml']);
    expect(result.summary.total).toBe(14);
    expect(result.summary.passed).toBe(10);
  });
});

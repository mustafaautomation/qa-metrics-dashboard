import { describe, it, expect } from 'vitest';
import { getMockData } from '../../src/mockData.js';

describe('getMockData', () => {
  it('should return complete dashboard structure', () => {
    const data = getMockData();

    expect(data.summary).toBeDefined();
    expect(data.history).toBeDefined();
    expect(data.suites).toBeDefined();
    expect(data.browsers).toBeDefined();
    expect(data.topFailures).toBeDefined();
    expect(data.recentRuns).toBeDefined();
  });

  it('should have valid summary metrics', () => {
    const { summary } = getMockData();

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.passed).toBeGreaterThan(0);
    expect(summary.failed).toBeGreaterThanOrEqual(0);
    expect(summary.skipped).toBeGreaterThanOrEqual(0);
    expect(summary.passRate).toBeGreaterThan(0);
    expect(summary.passRate).toBeLessThanOrEqual(100);
    expect(summary.avgDuration).toBeGreaterThan(0);
    expect(summary.lastRun).toMatch(/^\d{4}-/);
  });

  it('should have history with 10 runs', () => {
    const { history } = getMockData();

    expect(history).toHaveLength(10);
    for (const run of history) {
      expect(run.run).toBeTruthy();
      expect(run.date).toBeTruthy();
      expect(run.total).toBeGreaterThan(0);
      expect(run.passRate).toBeGreaterThan(0);
    }
  });

  it('should show improving trend in history', () => {
    const { history } = getMockData();
    const first = history[0].passRate;
    const last = history[history.length - 1].passRate;
    expect(last).toBeGreaterThanOrEqual(first);
  });

  it('should have 5 test suites', () => {
    const { suites } = getMockData();

    expect(suites).toHaveLength(5);
    for (const suite of suites) {
      expect(suite.name).toBeTruthy();
      expect(suite.total).toBeGreaterThan(0);
      expect(suite.passed + suite.failed).toBeLessThanOrEqual(suite.total);
    }
  });

  it('should have browser coverage data', () => {
    const { browsers } = getMockData();

    expect(browsers.length).toBeGreaterThan(0);
    const names = browsers.map((b) => b.name);
    expect(names).toContain('Chromium');
    expect(names).toContain('Firefox');
    expect(names).toContain('WebKit');
  });

  it('should have top failures sorted by count', () => {
    const { topFailures } = getMockData();

    expect(topFailures.length).toBeGreaterThan(0);
    for (let i = 1; i < topFailures.length; i++) {
      expect(topFailures[i - 1].failures).toBeGreaterThanOrEqual(topFailures[i].failures);
    }
  });

  it('should have recent runs with status', () => {
    const { recentRuns } = getMockData();

    expect(recentRuns.length).toBeGreaterThan(0);
    for (const run of recentRuns) {
      expect(['passed', 'partial', 'failed']).toContain(run.status);
      expect(run.durationFormatted).toBeTruthy();
    }
  });
});

'use strict';

/**
 * Realistic mock data telling a story of improvement over time.
 * Replace with real JUnit XML parsing when integrated into your CI pipeline.
 */
function getMockData() {
  const history = [
    { run: '#033', date: 'Feb 14', total: 143, passed: 125, failed: 18, duration: 34.2, passRate: 87.4 },
    { run: '#034', date: 'Feb 15', total: 143, passed: 128, failed: 15, duration: 33.7, passRate: 89.5 },
    { run: '#035', date: 'Feb 16', total: 148, passed: 133, failed: 15, duration: 31.9, passRate: 89.9 },
    { run: '#036', date: 'Feb 17', total: 148, passed: 136, failed: 12, duration: 30.5, passRate: 91.9 },
    { run: '#037', date: 'Feb 18', total: 150, passed: 138, failed: 12, duration: 30.1, passRate: 92.0 },
    { run: '#038', date: 'Feb 19', total: 150, passed: 141, failed:  9, duration: 29.4, passRate: 94.0 },
    { run: '#039', date: 'Feb 20', total: 153, passed: 145, failed:  8, duration: 28.9, passRate: 94.8 },
    { run: '#040', date: 'Feb 21', total: 153, passed: 145, failed:  8, duration: 28.6, passRate: 94.8 },
    { run: '#041', date: 'Feb 23', total: 156, passed: 148, failed:  7, duration: 28.4, passRate: 94.9 },
    { run: '#042', date: 'Feb 24', total: 156, passed: 147, failed:  7, duration: 28.3, passRate: 94.2 },
  ];

  const latest = history[history.length - 1];

  return {
    summary: {
      total:       latest.total,
      passed:      latest.passed,
      failed:      latest.failed,
      skipped:     2,
      passRate:    latest.passRate,
      avgDuration: latest.duration,
      lastRun:     new Date().toISOString(),
    },

    history,

    suites: [
      { name: 'Auth',      total: 24, passed: 23, failed: 1 },
      { name: 'Inventory', total: 36, passed: 35, failed: 1 },
      { name: 'Cart',      total: 28, passed: 27, failed: 1 },
      { name: 'Checkout',  total: 32, passed: 30, failed: 2 },
      { name: 'API',       total: 36, passed: 32, failed: 2 },
    ],

    browsers: [
      { name: 'Chromium', passed: 48, failed: 3 },
      { name: 'Firefox',  passed: 47, failed: 2 },
      { name: 'WebKit',   passed: 46, failed: 2 },
      { name: 'Mobile',   passed:  6, failed: 0 },
    ],

    topFailures: [
      { test: 'checkout: order total validation',      suite: 'Checkout', failures: 5, lastFailed: 'Feb 24' },
      { test: 'auth: login response time < 500ms',     suite: 'Auth',     failures: 4, lastFailed: 'Feb 23' },
      { test: 'api: POST /users/add → 201',            suite: 'API',      failures: 3, lastFailed: 'Feb 24' },
      { test: 'inventory: price sort high to low',     suite: 'Inventory',failures: 2, lastFailed: 'Feb 21' },
      { test: 'cart: correct prices displayed',        suite: 'Cart',     failures: 1, lastFailed: 'Feb 19' },
    ],

    recentRuns: history.slice().reverse().map(h => ({
      ...h,
      skipped:  2,
      status:   h.passRate >= 95 ? 'passed' : h.passRate >= 90 ? 'partial' : 'failed',
      durationFormatted: `${Math.floor(h.duration)}m ${Math.round((h.duration % 1) * 60)}s`,
    })),
  };
}

module.exports = { getMockData };

'use strict';

const fs   = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

/**
 * Parses JUnit XML files from a directory and returns dashboard metrics.
 * Drop your test runner's JUnit output into /reports and this will pick it up.
 */
function parseJUnitResults(reportsDir, files) {
  const suiteMap = {};
  let totalTests = 0, totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalDuration = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
    const result  = parser.parse(content);
    const suites  = [result.testsuites?.testsuite, result.testsuite]
      .flat()
      .filter(Boolean);

    for (const suite of suites) {
      const name     = suite['@_name'] || 'Unknown';
      const tests    = parseInt(suite['@_tests']    || 0, 10);
      const failures = parseInt(suite['@_failures'] || 0, 10);
      const errors   = parseInt(suite['@_errors']   || 0, 10);
      const skipped  = parseInt(suite['@_skipped']  || 0, 10);
      const duration = parseFloat(suite['@_time']   || 0);
      const failed   = failures + errors;
      const passed   = tests - failed - skipped;

      totalTests    += tests;
      totalFailed   += failed;
      totalSkipped  += skipped;
      totalPassed   += passed;
      totalDuration += duration;

      if (!suiteMap[name]) suiteMap[name] = { name, total: 0, passed: 0, failed: 0 };
      suiteMap[name].total  += tests;
      suiteMap[name].passed += passed;
      suiteMap[name].failed += failed;
    }
  }

  const passRate    = totalTests > 0 ? Math.round((totalPassed / totalTests) * 1000) / 10 : 0;
  const avgDuration = Math.round((totalDuration / 60) * 10) / 10;

  return {
    summary: {
      total:       totalTests,
      passed:      totalPassed,
      failed:      totalFailed,
      skipped:     totalSkipped,
      passRate,
      avgDuration,
      lastRun: new Date().toISOString(),
    },
    suites:      Object.values(suiteMap),
    history:     [],
    browsers:    [],
    topFailures: [],
    recentRuns:  [],
  };
}

module.exports = { parseJUnitResults };

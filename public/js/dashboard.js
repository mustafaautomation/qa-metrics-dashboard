'use strict';

// ─── Chart defaults ───────────────────────────────────────────────────────────
Chart.defaults.color          = '#94a3b8';
Chart.defaults.borderColor    = '#1e293b';
Chart.defaults.font.family    = 'Inter, system-ui, sans-serif';
Chart.defaults.font.size      = 12;

const GRID   = { color: '#1e293b' };
const GREEN  = '#22c55e';
const RED    = '#ef4444';
const BLUE   = '#3b82f6';
const AMBER  = '#f59e0b';
const PURPLE = '#a855f7';
const SLATE  = '#475569';

let charts = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function passRateColor(rate) {
  if (rate >= 95) return GREEN;
  if (rate >= 90) return AMBER;
  return RED;
}

function statusBadge(status) {
  const map = {
    passed:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    partial: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    failed:  'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  const label = { passed: 'Passed', partial: 'Partial', failed: 'Failed' };
  return `<span class="px-2 py-0.5 rounded text-xs font-medium ${map[status] || map.partial}">${label[status] || 'Unknown'}</span>`;
}

// ─── Summary cards ───────────────────────────────────────────────────────────
function renderSummary(s) {
  const lastRunDate = new Date(s.lastRun);
  const lastRunStr = isNaN(lastRunDate.getTime()) ? 'Unknown' : lastRunDate.toLocaleString();
  el('lastRun').textContent = `Last run: ${lastRunStr}`;

  const dot = el('statusDot');
  dot.className = `w-2 h-2 rounded-full animate-pulse ${s.passRate >= 95 ? 'bg-emerald-500' : s.passRate >= 90 ? 'bg-amber-500' : 'bg-red-500'}`;

  el('totalTests').textContent      = s.total.toLocaleString();
  el('totalBreakdown').textContent  = `${s.passed} passed · ${s.failed} failed · ${s.skipped} skipped`;

  const passRateEl = el('passRate');
  passRateEl.textContent = `${s.passRate}%`;
  passRateEl.style.color = passRateColor(s.passRate);

  el('passedCount').textContent = `${s.passed} of ${s.total} tests`;
  el('failedCount').textContent = s.failed.toLocaleString();
  el('failRate').textContent    = `${s.total > 0 ? ((s.failed / s.total) * 100).toFixed(1) : '0.0'}% failure rate`;
  el('avgDuration').textContent = `${s.avgDuration}m`;
}

// ─── Pass rate trend ─────────────────────────────────────────────────────────
function renderTrendChart(history) {
  if (charts.trend) charts.trend.destroy();
  const ctx = el('trendChart').getContext('2d');

  charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.date),
      datasets: [{
        label: 'Pass Rate %',
        data: history.map(h => h.passRate),
        borderColor: GREEN,
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: history.map(h => passRateColor(h.passRate)),
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` ${ctx.parsed.y}%` }
      }},
      scales: {
        y: { min: 80, max: 100, grid: GRID, ticks: { callback: v => `${v}%` } },
        x: { grid: GRID },
      },
    },
  });
}

// ─── Suite breakdown ─────────────────────────────────────────────────────────
function renderSuitesChart(suites) {
  if (charts.suites) charts.suites.destroy();
  const ctx = el('suitesChart').getContext('2d');

  charts.suites = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: suites.map(s => s.name),
      datasets: [
        { label: 'Passed', data: suites.map(s => s.passed), backgroundColor: 'rgba(34,197,94,0.7)',  borderRadius: 4 },
        { label: 'Failed', data: suites.map(s => s.failed), backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16 } } },
      scales: {
        x: { stacked: false, grid: GRID },
        y: { stacked: false, grid: GRID },
      },
    },
  });
}

// ─── Browser coverage ────────────────────────────────────────────────────────
function renderBrowserChart(browsers) {
  if (charts.browser) charts.browser.destroy();
  const ctx = el('browserChart').getContext('2d');

  charts.browser = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: browsers.map(b => b.name),
      datasets: [
        { label: 'Passed', data: browsers.map(b => b.passed), backgroundColor: 'rgba(59,130,246,0.7)',  borderRadius: 4 },
        { label: 'Failed', data: browsers.map(b => b.failed), backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 4 },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16 } } },
      scales: {
        x: { stacked: true, grid: GRID },
        y: { stacked: true, grid: GRID },
      },
    },
  });
}

// ─── Top failures ─────────────────────────────────────────────────────────────
function renderTopFailures(failures) {
  const container = el('topFailures');
  if (!failures.length) {
    container.innerHTML = `<p class="text-slate-500 text-sm">No failures recorded 🎉</p>`;
    return;
  }
  const max = failures[0].failures;
  container.innerHTML = failures.map(f => `
    <div class="flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-slate-200 truncate">${esc(f.test)}</p>
        <p class="text-xs text-slate-500">${esc(f.suite)} · last failed ${esc(f.lastFailed)}</p>
        <div class="mt-1.5 h-1 rounded-full bg-slate-700 overflow-hidden">
          <div class="h-full rounded-full bg-red-500/70" style="width:${(f.failures/max)*100}%"></div>
        </div>
      </div>
      <span class="text-sm font-mono font-semibold text-red-400 shrink-0">${f.failures}x</span>
    </div>
  `).join('');
}

// ─── Recent runs table ────────────────────────────────────────────────────────
function renderRecentRuns(runs) {
  el('runsTable').innerHTML = runs.map(r => `
    <tr class="hover:bg-slate-700/20 transition-colors">
      <td class="py-3 pr-4 font-mono text-sm text-blue-400">${esc(r.run)}</td>
      <td class="py-3 pr-4 text-slate-400 text-sm">${esc(r.date)}</td>
      <td class="py-3 pr-4 text-right text-slate-300 text-sm">${r.total}</td>
      <td class="py-3 pr-4 text-right text-emerald-400 text-sm">${r.passed}</td>
      <td class="py-3 pr-4 text-right text-red-400 text-sm">${r.failed}</td>
      <td class="py-3 pr-4 text-right text-sm font-medium" style="color:${passRateColor(r.passRate)}">${r.passRate}%</td>
      <td class="py-3 pr-4 text-right text-slate-400 text-sm">${r.durationFormatted}</td>
      <td class="py-3 text-center">${statusBadge(r.status)}</td>
    </tr>
  `).join('');
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const res  = await fetch('/api/metrics');
    const data = await res.json();

    renderSummary(data.summary);
    if (data.history?.length)    renderTrendChart(data.history);
    if (data.suites?.length)     renderSuitesChart(data.suites);
    if (data.browsers?.length)   renderBrowserChart(data.browsers);
    renderTopFailures(data.topFailures || []);
    if (data.recentRuns?.length) renderRecentRuns(data.recentRuns);
  } catch (err) {
    console.error('Failed to load metrics:', err);
    const banner = el('lastRun');
    if (banner) banner.textContent = 'Failed to load metrics — is the server running?';
  }
}

loadDashboard();
setInterval(loadDashboard, 30_000); // auto-refresh every 30s

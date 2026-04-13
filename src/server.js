'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { getMockData }        = require('./mockData');
const { parseJUnitResults }  = require('./parser');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

function getMetrics() {
  const reportsDir = path.join(__dirname, '../reports');
  try {
    if (fs.existsSync(reportsDir)) {
      const xmlFiles = fs.readdirSync(reportsDir).filter(f => f.endsWith('.xml'));
      if (xmlFiles.length > 0) {
        console.log(`Parsing ${xmlFiles.length} JUnit result file(s)…`);
        return parseJUnitResults(reportsDir, xmlFiles);
      }
    }
  } catch (err) {
    console.warn('XML parse failed, falling back to mock data:', err.message);
  }
  return getMockData();
}

app.get('/api/metrics', (_req, res) => {
  try {
    res.json(getMetrics());
  } catch (err) {
    console.error('[ERROR] /api/metrics failed:', err.message);
    res.status(500).json({ error: 'Failed to load metrics' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  QA Metrics Dashboard → http://localhost:${PORT}\n`);
});

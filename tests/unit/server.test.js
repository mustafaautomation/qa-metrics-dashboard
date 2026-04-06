import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import path from 'path';
import { getMockData } from '../../src/mockData.js';

let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.static(path.join(__dirname, '../../public')));

  app.get('/api/metrics', (_req, res) => {
    res.json(getMockData());
  });

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

describe('Dashboard Server API', () => {
  it('should serve metrics endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.summary).toBeDefined();
    expect(data.suites).toBeDefined();
    expect(data.history).toBeDefined();
  });

  it('should return JSON content type', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should serve static HTML', async () => {
    const res = await fetch(`${baseUrl}/index.html`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html');
  });

  it('should return valid summary in metrics', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);
    const data = await res.json();

    expect(data.summary.total).toBeGreaterThan(0);
    expect(data.summary.passRate).toBeGreaterThan(0);
    expect(data.summary.lastRun).toBeTruthy();
  });

  it('should return suites array', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);
    const data = await res.json();

    expect(data.suites).toBeInstanceOf(Array);
    expect(data.suites.length).toBeGreaterThan(0);
  });
});

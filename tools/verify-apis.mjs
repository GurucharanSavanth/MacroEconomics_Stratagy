import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.resolve(ROOT, 'data/raw');
const BIS_DIR = path.resolve(RAW_DIR, 'bis');
const WB_DIR = path.resolve(RAW_DIR, 'worldbank');
const IMF_DIR = path.resolve(RAW_DIR, 'imf');

await fs.mkdir(RAW_DIR, { recursive: true });

const checks = [
  {
    id: 'BIS_CBPOL_ZIP',
    url: 'https://data.bis.org/static/bulk/WS_CBPOL_csv_col.zip',
    fallbackPath: path.resolve(BIS_DIR, 'WS_CBPOL_latest.csv')
  },
  {
    id: 'BIS_GLI_ZIP',
    url: 'https://data.bis.org/static/bulk/WS_GLI_csv_col.zip',
    fallbackPath: path.resolve(BIS_DIR, 'WS_GLI_latest.csv')
  },
  {
    id: 'WB_IDS_SAMPLE',
    url: 'https://api.worldbank.org/v2/sources/6/country/BRA/counterpart-area/WLD/series/DT.TDS.DECT.EX.ZS/data?format=json&per_page=5',
    fallbackPath: path.resolve(WB_DIR, 'BRA_DT.TDS.DECT.EX.ZS.json')
  },
  {
    id: 'IMF_SDMX_21',
    url: 'https://api.imf.org/external/sdmx/2.1/dataflow',
    fallbackPath: path.resolve(IMF_DIR, 'sdmx-dataflow.xml')
  },
  {
    id: 'IMF_DATAMAPPER_COFER',
    url: 'https://www.imf.org/external/datamapper/api/v1/COFER_USD',
    fallbackPath: path.resolve(IMF_DIR, 'cofer-fallback.json')
  }
];

const startedAt = new Date().toISOString();
const results = [];

for (const check of checks) {
  const start = Date.now();
  try {
    const response = await fetch(check.url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': 'macro-tightening-atlas/1.0'
      }
    });

    results.push({
      id: check.id,
      url: check.url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type') ?? null,
      elapsedMs: Date.now() - start,
      checkedAtUtc: new Date().toISOString()
    });
  } catch (error) {
    const fallbackAvailable = await exists(check.fallbackPath);
    results.push({
      id: check.id,
      url: check.url,
      ok: fallbackAvailable,
      status: null,
      statusText: fallbackAvailable ? 'Local cache available' : null,
      contentType: null,
      elapsedMs: Date.now() - start,
      checkedAtUtc: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      fallbackPath: check.fallbackPath,
      fallbackAvailable
    });
  }
}

const report = {
  startedAtUtc: startedAt,
  finishedAtUtc: new Date().toISOString(),
  checks: results
};

await fs.writeFile(path.resolve(RAW_DIR, 'api-health.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const result of results) {
  const status = result.status ?? (result.fallbackAvailable ? 'CACHE' : 'ERR');
  const ok = result.ok ? (result.fallbackAvailable ? 'OK-CACHED' : 'OK') : 'FAIL';
  const extra = result.error ? ` error=${result.error}` : '';
  console.log(`${ok} ${result.id} status=${status} ${result.elapsedMs}ms${extra}`);
}

console.log('API health report written to data/raw/api-health.json');

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

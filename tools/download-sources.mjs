import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import AdmZip from 'adm-zip';
import { fetchBuffer, fetchJson, fetchText } from './fetch/http.mjs';
import { COUNTRY_SET, SOURCES, WORLD_BANK_SERIES } from './sources.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const RAW_ROOT = path.resolve(ROOT, 'data/raw');
const BIS_DIR = path.resolve(RAW_ROOT, 'bis');
const WB_DIR = path.resolve(RAW_ROOT, 'worldbank');
const IMF_DIR = path.resolve(RAW_ROOT, 'imf');

await fs.mkdir(BIS_DIR, { recursive: true });
await fs.mkdir(WB_DIR, { recursive: true });
await fs.mkdir(IMF_DIR, { recursive: true });

const manifest = {
  generatedAtUtc: new Date().toISOString(),
  artifacts: []
};

await downloadBisDataset('BIS_CBPOL', SOURCES.BIS_CBPOL_ZIP, 'WS_CBPOL_csv_col.zip');
await downloadBisDataset('BIS_GLI', SOURCES.BIS_GLI_ZIP, 'WS_GLI_csv_col.zip');

await downloadWorldBankSeries();
await downloadImfResources();

const manifestPath = path.resolve(RAW_ROOT, 'manifest.json');
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`Raw sources downloaded. Manifest: ${manifestPath}`);

async function downloadBisDataset(id, url, filename) {
  const zipPath = path.resolve(BIS_DIR, filename);
  const errorPath = path.resolve(BIS_DIR, `${filename}.error.txt`);

  try {
    const buffer = await fetchBuffer(url);
    await fs.writeFile(zipPath, buffer);
    await removeIfExists(errorPath);

    const zip = new AdmZip(buffer);
    const csvEntry = zip.getEntries().find((entry) => entry.entryName.endsWith('.csv'));
    if (!csvEntry) {
      throw new Error('CSV entry not found in BIS ZIP');
    }

    const csvPath = path.resolve(BIS_DIR, csvEntry.entryName);
    await fs.writeFile(csvPath, csvEntry.getData());

    manifest.artifacts.push(await artifactRecord({
      id,
      sourceId: id,
      category: 'raw-bulk',
      localPath: rel(zipPath),
      description: `${id} raw bulk zip`
    }));

    manifest.artifacts.push(await artifactRecord({
      id: `${id}_CSV`,
      sourceId: id,
      category: 'raw-extract',
      localPath: rel(csvPath),
      description: `${id} extracted CSV`
    }));

    console.log(`Downloaded ${id}`);
  } catch (error) {
    const cachedCsvPath = await findExistingBisCsv(id);
    if (cachedCsvPath) {
      await removeIfExists(errorPath);
      manifest.artifacts.push(await artifactRecord({
        id: `${id}_CSV_CACHE`,
        sourceId: id,
        category: 'raw-cache',
        localPath: rel(cachedCsvPath),
        description: `${id} cached CSV used after fetch failure`,
        extra: {
          cached: true,
          reason: error instanceof Error ? error.message : String(error)
        }
      }));
      console.warn(`Using cached ${id} CSV: ${rel(cachedCsvPath)}`);
      return;
    }

    await fs.writeFile(errorPath, `${String(error)}\n`, 'utf8');

    manifest.artifacts.push({
      id,
      sourceId: id,
      category: 'raw-bulk',
      localPath: rel(zipPath),
      description: `${id} raw bulk zip`,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      capturedAtUtc: new Date().toISOString()
    });

    console.warn(`Failed to download ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function downloadWorldBankSeries() {
  const seriesList = [
    WORLD_BANK_SERIES.debtService,
    WORLD_BANK_SERIES.interestPayments,
    WORLD_BANK_SERIES.usdDebtShare
  ];
  let successCount = 0;
  let failedCount = 0;

  for (const country of COUNTRY_SET) {
    for (const series of seriesList) {
      const url = SOURCES.WB_IDS_COUNTERPART_SERIES
        .replace('{cc}', country.iso3)
        .replace('{series}', series);

      const baseName = `${country.iso3}_${series}`;
      const jsonPath = path.resolve(WB_DIR, `${baseName}.json`);
      const errorPath = path.resolve(WB_DIR, `${baseName}.error.txt`);

      try {
        const parsed = await fetchJson(url);

        const rows = parsed?.source?.data ?? [];
        const nonNullRows = rows.filter((row) => row?.value !== null && row?.value !== undefined).length;

        await fs.writeFile(jsonPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');

        manifest.artifacts.push(await artifactRecord({
          id: `WB_${baseName}`,
          sourceId: 'WB_IDS',
          category: 'raw-api-json',
          localPath: rel(jsonPath),
          description: `World Bank IDS ${country.iso3} ${series}`,
          extra: {
            rows: rows.length,
            nonNullRows
          }
        }));
        await removeIfExists(errorPath);
        successCount += 1;
      } catch (error) {
        if (await exists(jsonPath)) {
          await removeIfExists(errorPath);
          manifest.artifacts.push(await artifactRecord({
            id: `WB_${baseName}_CACHE`,
            sourceId: 'WB_IDS',
            category: 'raw-api-cache',
            localPath: rel(jsonPath),
            description: `World Bank IDS ${country.iso3} ${series} cached JSON used`,
            extra: {
              cached: true,
              reason: error instanceof Error ? error.message : String(error)
            }
          }));
          successCount += 1;
          continue;
        }

        await fs.writeFile(errorPath, `${String(error)}\n`, 'utf8');
        manifest.artifacts.push(await artifactRecord({
          id: `WB_${baseName}_ERR`,
          sourceId: 'WB_IDS',
          category: 'raw-api-error',
          localPath: rel(errorPath),
          description: `World Bank IDS ${country.iso3} ${series} failed`,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        }));
        failedCount += 1;
      }
    }
  }

  console.log(`World Bank raw responses: success=${successCount} failed=${failedCount}`);
}

async function downloadImfResources() {
  let successCount = 0;
  let failedCount = 0;
  const resources = [
    {
      id: 'IMF_SDMX_DATAFLOW',
      url: `${SOURCES.IMF_SDMX_21}/dataflow`,
      filename: 'sdmx-dataflow.xml'
    },
    {
      id: 'IMF_DATAMAPPER_COFER',
      url: 'https://www.imf.org/external/datamapper/api/v1/COFER_USD',
      filename: 'datamapper-cofer.json'
    }
  ];

  for (const resource of resources) {
      const targetPath = path.resolve(IMF_DIR, resource.filename);
      const failPath = path.resolve(IMF_DIR, `${resource.filename}.error.txt`);
    try {
      const text = await fetchText(resource.url);

      await fs.writeFile(targetPath, text, 'utf8');
      await removeIfExists(failPath);
      manifest.artifacts.push(await artifactRecord({
        id: resource.id,
        sourceId: 'IMF_COFER',
        category: 'raw-api',
        localPath: rel(targetPath),
        description: `IMF resource ${resource.url}`
      }));
      successCount += 1;
    } catch (error) {
      if (await exists(targetPath)) {
        await removeIfExists(failPath);
        manifest.artifacts.push(await artifactRecord({
          id: `${resource.id}_CACHE`,
          sourceId: 'IMF_COFER',
          category: 'raw-api-cache',
          localPath: rel(targetPath),
          description: `IMF resource cache used ${resource.url}`,
          extra: {
            cached: true,
            reason: error instanceof Error ? error.message : String(error)
          }
        }));
        successCount += 1;
        continue;
      }

      await fs.writeFile(failPath, `${String(error)}\n`, 'utf8');
      manifest.artifacts.push(await artifactRecord({
        id: `${resource.id}_ERR`,
        sourceId: 'IMF_COFER',
        category: 'raw-api-error',
        localPath: rel(failPath),
        description: `IMF resource failed ${resource.url}`,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      }));
      failedCount += 1;
    }
  }

  const fallbackSource = path.resolve(ROOT, 'tools/references/imf-cofer-fallback.json');
  const fallbackTarget = path.resolve(IMF_DIR, 'cofer-fallback.json');
  await fs.copyFile(fallbackSource, fallbackTarget);
  manifest.artifacts.push(await artifactRecord({
    id: 'IMF_COFER_FALLBACK',
    sourceId: 'IMF_COFER',
    category: 'raw-reference',
    localPath: rel(fallbackTarget),
    description: 'Fallback COFER series used when IMF API access is restricted'
  }));

  console.log(`IMF resources: success=${successCount} failed=${failedCount} + fallback copied`);
}

async function artifactRecord({ id, sourceId, category, localPath, description, status = 'ok', error = null, extra = null }) {
  const absolutePath = path.resolve(ROOT, localPath);
  const stat = await fs.stat(absolutePath);
  const content = await fs.readFile(absolutePath);

  return {
    id,
    sourceId,
    category,
    localPath,
    description,
    status,
    error,
    sizeBytes: stat.size,
    sha256: sha256(content),
    capturedAtUtc: new Date().toISOString(),
    extra
  };
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function rel(absolutePath) {
  return path.relative(ROOT, absolutePath).replaceAll('\\', '/');
}

async function findExistingBisCsv(id) {
  const entries = await fs.readdir(BIS_DIR, { withFileTypes: true });
  const key = id === 'BIS_CBPOL' ? 'cbpol' : 'gli';
  const match = entries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.csv') && entry.name.toLowerCase().includes(key));
  if (!match) {
    return null;
  }
  return path.resolve(BIS_DIR, match.name);
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function removeIfExists(targetPath) {
  try {
    await fs.unlink(targetPath);
  } catch {
    // Ignore absent files.
  }
}

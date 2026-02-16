import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchBisCsvFromZip, sha256 } from './fetch/bis.mjs';
import {
  fetchWorldBankIdsCounterpartSeries,
  fetchWorldBankUsdDebtShare
} from './fetch/worldbank.mjs';
import {
  COUNTRY_SET,
  DATASET_SOURCE_META,
  SOURCES,
  WORLD_BANK_SERIES
} from './sources.mjs';
import { transformCbpol } from './transform/cbpol.mjs';
import { transformGli } from './transform/gli.mjs';
import { buildImfCoferSeries } from './transform/imf.mjs';
import {
  buildCountryStressDataset,
  normalizeWorldBankSeries
} from './transform/worldbank.mjs';
import {
  validateAtlasSnapshot,
  validateDatasetSnapshot
} from './validate/validate-snapshot.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const RAW_ROOT = path.resolve(ROOT, 'data/raw');
const RAW_BIS_DIR = path.resolve(RAW_ROOT, 'bis');
const RAW_WB_DIR = path.resolve(RAW_ROOT, 'worldbank');
const RAW_IMF_DIR = path.resolve(RAW_ROOT, 'imf');
const RAW_MANIFEST_PATH = path.resolve(RAW_ROOT, 'manifest.json');
const RAW_API_HEALTH_PATH = path.resolve(RAW_ROOT, 'api-health.json');
const IMF_FALLBACK_REFERENCE = path.resolve(ROOT, 'tools/references/imf-cofer-fallback.json');
const OUTPUT_DIRS = [
  path.resolve(ROOT, 'public/assets/data'),
  path.resolve(ROOT, 'src/assets/data')
];
const TRANSFORM_VERSION = '1.1.0';

await Promise.all([
  ...OUTPUT_DIRS.map((outputDir) => fs.mkdir(outputDir, { recursive: true })),
  fs.mkdir(RAW_BIS_DIR, { recursive: true }),
  fs.mkdir(RAW_WB_DIR, { recursive: true }),
  fs.mkdir(RAW_IMF_DIR, { recursive: true })
]);

const now = new Date().toISOString();
const [rawManifest, apiHealth] = await Promise.all([
  readJsonIfExists(RAW_MANIFEST_PATH),
  readJsonIfExists(RAW_API_HEALTH_PATH)
]);

const cbpolDataset = await buildCbpolDataset(now);
const gliDataset = await buildGliDataset(now);
const worldBankDataset = await buildWorldBankDataset(now);
const imfDataset = await buildImfDataset(now);
await seedWorldBankRawFromDataset(worldBankDataset);

const atlasSnapshot = composeAtlasSnapshot({
  generatedAtUtc: now,
  cbpol: cbpolDataset,
  gli: gliDataset,
  worldBank: worldBankDataset,
  imf: imfDataset,
  rawManifest,
  apiHealth
});

validateDatasetSnapshot(cbpolDataset);
validateDatasetSnapshot(gliDataset);
validateDatasetSnapshot(worldBankDataset);
validateDatasetSnapshot(imfDataset);
validateAtlasSnapshot(atlasSnapshot);

await writeJson('bis-cbpol.json', cbpolDataset);
await writeJson('bis-gli.json', gliDataset);
await writeJson('wb-ids.json', worldBankDataset);
await writeJson('imf-cofer.json', imfDataset);
await writeJson('atlas.json', atlasSnapshot);

console.log('Data snapshots generated in public/assets/data and src/assets/data');

async function buildCbpolDataset(asOfUtc) {
  const fallback = await readExisting('bis-cbpol.json');
  const localCsvPath = await findFirstFile(
    RAW_BIS_DIR,
    (name) => name.toLowerCase().endsWith('.csv') && name.toLowerCase().includes('cbpol')
  );

  try {
    if (localCsvPath) {
      const csvText = await fs.readFile(localCsvPath, 'utf8');
      const transformed = transformCbpol(csvText);

      return {
        dataset_id: 'BIS_CBPOL',
        as_of_utc: asOfUtc,
        source: {
          ...DATASET_SOURCE_META.BIS_CBPOL,
          method: 'local_raw_csv'
        },
        raw_hash_sha256: sha256(Buffer.from(csvText)),
        transform_version: TRANSFORM_VERSION,
        raw_local_path: toRelative(localCsvPath),
        data: transformed
      };
    }

    const { csvText, rawHash } = await fetchBisCsvFromZip(SOURCES.BIS_CBPOL_ZIP);
    const transformed = transformCbpol(csvText);
    await persistRawCsv('WS_CBPOL_latest.csv', csvText);

    return {
      dataset_id: 'BIS_CBPOL',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.BIS_CBPOL,
        method: 'bulk_download_zip_live'
      },
      raw_hash_sha256: rawHash,
      transform_version: TRANSFORM_VERSION,
      data: transformed
    };
  } catch (error) {
    console.warn(`[data:build] BIS_CBPOL ingestion failed: ${toErrorMessage(error)}`);
    if (fallback) {
      console.warn('[data:build] Using existing bis-cbpol.json fallback snapshot.');
      return {
        ...fallback,
        as_of_utc: asOfUtc
      };
    }

    return {
      dataset_id: 'BIS_CBPOL',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.BIS_CBPOL,
        method: 'fallback_seed'
      },
      raw_hash_sha256: sha256(Buffer.from('fallback-cbpol')),
      transform_version: TRANSFORM_VERSION,
      data: {
        banks: ['United States', 'Brazil', 'India', 'South Africa'],
        periods: ['2023-Q4', '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'],
        heatmapMatrix: [
          [5.5, 5.5, 5.5, 5.5, 5.25, 5.25],
          [11.75, 11.25, 10.5, 10.5, 10.5, 10],
          [6.5, 6.5, 6.5, 6.5, 6.5, 6.5],
          [8.25, 8.25, 8.25, 8.0, 7.75, 7.75]
        ],
        tsi: [
          { period: '2024-Q1', hikingShare: 30, cuttingShare: 5, dispersion: 0.15, hikes: 1, cuts: 0, tracked: 4 },
          { period: '2024-Q2', hikingShare: 0, cuttingShare: 25, dispersion: 0.2, hikes: 0, cuts: 1, tracked: 4 },
          { period: '2024-Q3', hikingShare: 0, cuttingShare: 25, dispersion: 0.2, hikes: 0, cuts: 1, tracked: 4 },
          { period: '2024-Q4', hikingShare: 0, cuttingShare: 50, dispersion: 0.3, hikes: 0, cuts: 2, tracked: 4 },
          { period: '2025-Q1', hikingShare: 0, cuttingShare: 25, dispersion: 0.2, hikes: 0, cuts: 1, tracked: 4 }
        ],
        hero: {
          hikingCentralBanks: 0,
          medianRateChange: -0.25,
          tighteningDispersion: 0.2,
          trackedCentralBanks: 4
        }
      }
    };
  }
}

async function buildGliDataset(asOfUtc) {
  const fallback = await readExisting('bis-gli.json');
  const localCsvPath = await findFirstFile(
    RAW_BIS_DIR,
    (name) => name.toLowerCase().endsWith('.csv') && name.toLowerCase().includes('gli')
  );

  try {
    if (localCsvPath) {
      const csvText = await fs.readFile(localCsvPath, 'utf8');
      const transformed = transformGli(csvText);

      return {
        dataset_id: 'BIS_GLI',
        as_of_utc: asOfUtc,
        source: {
          ...DATASET_SOURCE_META.BIS_GLI,
          method: 'local_raw_csv'
        },
        raw_hash_sha256: sha256(Buffer.from(csvText)),
        transform_version: TRANSFORM_VERSION,
        raw_local_path: toRelative(localCsvPath),
        data: transformed
      };
    }

    const { csvText, rawHash } = await fetchBisCsvFromZip(SOURCES.BIS_GLI_ZIP);
    const transformed = transformGli(csvText);
    await persistRawCsv('WS_GLI_latest.csv', csvText);

    return {
      dataset_id: 'BIS_GLI',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.BIS_GLI,
        method: 'bulk_download_zip_live'
      },
      raw_hash_sha256: rawHash,
      transform_version: TRANSFORM_VERSION,
      data: transformed
    };
  } catch (error) {
    console.warn(`[data:build] BIS_GLI ingestion failed: ${toErrorMessage(error)}`);
    if (fallback) {
      console.warn('[data:build] Using existing bis-gli.json fallback snapshot.');
      return {
        ...fallback,
        as_of_utc: asOfUtc
      };
    }

    return {
      dataset_id: 'BIS_GLI',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.BIS_GLI,
        method: 'fallback_seed'
      },
      raw_hash_sha256: sha256(Buffer.from('fallback-gli')),
      transform_version: TRANSFORM_VERSION,
      data: {
        periods: ['2020-Q4', '2021-Q4', '2022-Q4', '2023-Q4', '2024-Q4', '2025-Q3'],
        usdIndex: [100, 106, 112, 117, 123, 128],
        eurIndex: [100, 102, 104, 107, 109, 111],
        jpyIndex: [100, 99, 101, 103, 105, 107],
        latest: { usd: 128, eur: 111, jpy: 107 }
      }
    };
  }
}

async function buildWorldBankDataset(asOfUtc) {
  const fallback = await readExisting('wb-ids.json');
  const rawSeriesByCountry = {};
  let localRowsUsed = 0;
  let apiRowsUsed = 0;

  try {
    for (const country of COUNTRY_SET) {
      const [debtServiceLocal, interestLocal, usdShareLocal] = await Promise.all([
        readLocalWorldBankSeries(country.iso3, WORLD_BANK_SERIES.debtService),
        readLocalWorldBankSeries(country.iso3, WORLD_BANK_SERIES.interestPayments),
        readLocalWorldBankSeries(country.iso3, WORLD_BANK_SERIES.usdDebtShare)
      ]);

      const [debtServiceRaw, interestRaw, usdShareRaw] = await Promise.all([
        debtServiceLocal?.length
          ? Promise.resolve(debtServiceLocal)
          : safeWorldBankFetch(
              () => fetchWorldBankIdsCounterpartSeries(country.iso3, WORLD_BANK_SERIES.debtService),
              `${country.iso3}:${WORLD_BANK_SERIES.debtService}`
            ),
        interestLocal?.length
          ? Promise.resolve(interestLocal)
          : safeWorldBankFetch(
              () => fetchWorldBankIdsCounterpartSeries(country.iso3, WORLD_BANK_SERIES.interestPayments),
              `${country.iso3}:${WORLD_BANK_SERIES.interestPayments}`
            ),
        usdShareLocal?.length
          ? Promise.resolve(usdShareLocal)
          : safeWorldBankFetch(
              () => fetchWorldBankUsdDebtShare(country.iso3),
              `${country.iso3}:${WORLD_BANK_SERIES.usdDebtShare}`
            )
      ]);

      localRowsUsed += (debtServiceLocal?.length ?? 0) + (interestLocal?.length ?? 0) + (usdShareLocal?.length ?? 0);
      apiRowsUsed +=
        (debtServiceLocal?.length ? 0 : debtServiceRaw.length) +
        (interestLocal?.length ? 0 : interestRaw.length) +
        (usdShareLocal?.length ? 0 : usdShareRaw.length);

      rawSeriesByCountry[country.iso3] = {
        debtService: normalizeWorldBankSeries(debtServiceRaw),
        interestPayments: normalizeWorldBankSeries(interestRaw),
        usdDebtShare: normalizeWorldBankSeries(usdShareRaw)
      };
    }

    const transformed = buildCountryStressDataset(COUNTRY_SET, rawSeriesByCountry);
    if (!transformed.countries.length && fallback?.data?.countries?.length) {
      console.warn('[data:build] WB_IDS had no fresh rows; using previous snapshot fallback.');
      return {
        ...fallback,
        as_of_utc: asOfUtc,
        source: {
          ...fallback.source,
          method: 'local_snapshot_fallback'
        }
      };
    }

    return {
      dataset_id: 'WB_IDS',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.WB_IDS,
        method: localRowsUsed ? 'local_raw_json_plus_api_fallback' : 'api_direct'
      },
      raw_hash_sha256: sha256(Buffer.from(JSON.stringify(rawSeriesByCountry))),
      transform_version: TRANSFORM_VERSION,
      ingest_stats: {
        localRowsUsed,
        apiRowsUsed,
        countriesWithData: transformed.countries.length
      },
      data: transformed
    };
  } catch (error) {
    console.warn(`[data:build] WB_IDS ingestion failed: ${toErrorMessage(error)}`);
    if (fallback) {
      console.warn('[data:build] Using existing wb-ids.json fallback snapshot.');
      return {
        ...fallback,
        as_of_utc: asOfUtc
      };
    }

    return {
      dataset_id: 'WB_IDS',
      as_of_utc: asOfUtc,
      source: {
        ...DATASET_SOURCE_META.WB_IDS,
        method: 'fallback_seed'
      },
      raw_hash_sha256: sha256(Buffer.from('fallback-wb')),
      transform_version: TRANSFORM_VERSION,
      data: {
        years: [2020, 2021, 2022, 2023, 2024],
        countries: [
          {
            iso3: 'BRA',
            name: 'Brazil',
            region: 'Latin America',
            years: [2020, 2021, 2022, 2023, 2024],
            debtService: [50.35, 46.73, 29.9, 53.54, 26.74],
            interestPayments: [13.88, 8.75, 10.2, 12.4, 9.9],
            usdDebtShare: [95.83, 96.57, 96.23, 95.78, 96.53]
          },
          {
            iso3: 'ZAF',
            name: 'South Africa',
            region: 'Africa',
            years: [2020, 2021, 2022, 2023, 2024],
            debtService: [14.8, 18.5, 22.3, 26.2, 24.7],
            interestPayments: [5.6, 6.1, 7.2, 8.3, 8.4],
            usdDebtShare: [71.2, 72.4, 73.1, 73.9, 74.2]
          }
        ]
      }
    };
  }
}

async function buildImfDataset(asOfUtc) {
  const fallback = await readExisting('imf-cofer.json');
  const localCandidatePaths = [
    path.resolve(RAW_IMF_DIR, 'cofer-fallback.json'),
    IMF_FALLBACK_REFERENCE
  ];

  try {
    for (const candidatePath of localCandidatePaths) {
      if (!(await exists(candidatePath))) {
        continue;
      }

      const transformed = await buildImfCoferSeries(candidatePath);
      const rawText = await fs.readFile(candidatePath, 'utf8');

      return {
        dataset_id: 'IMF_COFER',
        as_of_utc: asOfUtc,
        source: {
          ...DATASET_SOURCE_META.IMF_COFER,
          method: candidatePath.includes(`${path.sep}data${path.sep}raw${path.sep}`)
            ? 'local_raw_reference'
            : 'curated_reference_snapshot'
        },
        raw_hash_sha256: sha256(Buffer.from(rawText)),
        transform_version: TRANSFORM_VERSION,
        raw_local_path: toRelative(candidatePath),
        data: transformed
      };
    }

    throw new Error('No IMF fallback reference file was found.');
  } catch (error) {
    console.warn(`[data:build] IMF_COFER fallback load failed: ${toErrorMessage(error)}`);
    if (fallback) {
      return {
        ...fallback,
        as_of_utc: asOfUtc
      };
    }

    return {
      dataset_id: 'IMF_COFER',
      as_of_utc: asOfUtc,
      source: DATASET_SOURCE_META.IMF_COFER,
      raw_hash_sha256: sha256(Buffer.from('fallback-imf')),
      transform_version: TRANSFORM_VERSION,
      data: {
        seriesId: 'COFER_USD_ALLOCATED_SHARE',
        description: 'USD share of allocated reserves',
        values: [],
        methodologyBreaks: []
      }
    };
  }
}

function composeAtlasSnapshot({ generatedAtUtc, cbpol, gli, worldBank, imf, rawManifest, apiHealth }) {
  const stressLatest = computeLatestStress(worldBank.data);
  const topStress = [...stressLatest].sort((a, b) => b.stressScore - a.stressScore).slice(0, 10);
  const coferLatest = imf.data.values[imf.data.values.length - 1]?.value ?? null;
  const asOfUtc = maxAsOf([cbpol.as_of_utc, gli.as_of_utc, worldBank.as_of_utc, imf.as_of_utc]);
  const interpretation = buildInterpretation({ cbpol, gli, worldBank, stressLatest, topStress, coferLatest });
  const artifacts = buildArtifactList({ generatedAtUtc, rawManifest, cbpol, gli, worldBank, imf });
  const normalizedApiHealth = normalizeApiHealth(apiHealth);

  const atlas = {
    atlas_id: 'tightening-spillover-atlas',
    title: 'Global monetary tightening and its spillover effects on developing countries',
    as_of_utc: asOfUtc,
    generated_at_utc: generatedAtUtc,
    transform_version: TRANSFORM_VERSION,
    notes: [
      'Build-time ETL snapshots are used to avoid browser API calls and improve reproducibility.',
      'Charts are educational and descriptive; they are not forecasting tools.',
      'Local raw artifacts from BIS/World Bank/IMF are ingested when available in data/raw.'
    ],
    sources: [
      {
        id: 'BIS_CBPOL',
        title: 'BIS Policy Rates (CBPOL)',
        publisher: 'Bank for International Settlements',
        citation_url: 'https://data.bis.org/bulkdownload',
        retrieved_at_utc: cbpol.as_of_utc,
        series: ['Policy rates by central bank', 'Meeting-history aligned monthly/quarterly transforms']
      },
      {
        id: 'BIS_GLI',
        title: 'BIS Global Liquidity Indicators (GLI)',
        publisher: 'Bank for International Settlements',
        citation_url: 'https://data.bis.org/bulkdownload',
        retrieved_at_utc: gli.as_of_utc,
        series: ['USD/EUR/JPY credit to EME non-banks (indexed)']
      },
      {
        id: 'WB_IDS',
        title: 'World Bank debt indicators (IDS/WDI API)',
        publisher: 'World Bank',
        citation_url:
          'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
        retrieved_at_utc: worldBank.as_of_utc,
        series: [
          'DT.TDS.DECT.EX.ZS (Total debt service / exports)',
          'DT.INT.DECT.EX.ZS (Interest payments / exports)',
          'DT.CUR.USDL.ZS (USD currency composition of PPG debt, WLD counterpart)'
        ]
      },
      {
        id: 'IMF_COFER',
        title: 'IMF COFER reserve composition reference',
        publisher: 'International Monetary Fund',
        citation_url: 'https://data.imf.org/en/Resource-Pages/IMF-API',
        retrieved_at_utc: imf.as_of_utc,
        series: ['USD share of allocated reserves'],
        notes: ['2025-Q3 publication revision reflected in methodology break annotation.']
      },
      {
        id: 'DCP',
        title: 'Dominant Currency Paradigm concept note',
        publisher: 'BIS / IMF working literature',
        citation_url: 'https://www.bis.org/publ/work783.htm',
        retrieved_at_utc: generatedAtUtc,
        series: ['Conceptual anchor for trade invoicing and transmission channels']
      }
    ],
    evidence: [
      {
        id: 'ev-1',
        title: 'Tightening synchronization wave',
        body: 'The TSI panel tracks the share of tracked central banks that are hiking versus cutting each quarter.',
        source_ids: ['BIS_CBPOL']
      },
      {
        id: 'ev-2',
        title: 'Offshore liquidity as transmission channel',
        body: 'GLI series track international credit in major currencies to non-residents, a direct spillover channel.',
        source_ids: ['BIS_GLI']
      },
      {
        id: 'ev-3',
        title: 'Debt stress and USD debt exposure',
        body: 'Debt service burden and USD debt composition jointly capture structural refinancing vulnerability.',
        source_ids: ['WB_IDS']
      },
      {
        id: 'ev-4',
        title: 'COFER methodology break',
        body: 'Reserve-share trend line includes a flagged break at 2025-Q3 for publication revision awareness.',
        source_ids: ['IMF_COFER']
      }
    ],
    methodology: {
      as_of_utc: asOfUtc,
      breaks: imf.data.methodologyBreaks,
      caveats: [
        'Country coverage is constrained to economies with complete series in the selected period.',
        'CBPOL meeting-frequency data are quarter-normalized using observed quarter-end values.',
        'WB USD composition series uses IDS source API with counterpart-area WLD.',
        'The simulator is a vulnerability lens, not a predictive model.'
      ]
    },
    interpretation,
    artifacts,
    api_health: normalizedApiHealth,
    sections: {
      hero: {
        kpis: [
          {
            id: 'kpi-hikes',
            label: 'Central banks hiking (latest quarter)',
            value: cbpol.data.hero.hikingCentralBanks,
            unit: 'banks',
            source_ids: ['BIS_CBPOL']
          },
          {
            id: 'kpi-median-change',
            label: 'Median policy-rate change',
            value: cbpol.data.hero.medianRateChange,
            unit: 'pp',
            source_ids: ['BIS_CBPOL']
          },
          {
            id: 'kpi-dispersion',
            label: 'Tightening dispersion (IQR)',
            value: cbpol.data.hero.tighteningDispersion,
            unit: 'pp',
            source_ids: ['BIS_CBPOL']
          }
        ]
      },
      global_sync: {
        periods: cbpol.data.periods,
        banks: cbpol.data.banks,
        heatmap_matrix: cbpol.data.heatmapMatrix,
        tsi: cbpol.data.tsi,
        source_ids: ['BIS_CBPOL']
      },
      liquidity_channel: {
        periods: gli.data.periods,
        usd_index: gli.data.usdIndex,
        eur_index: gli.data.eurIndex,
        jpy_index: gli.data.jpyIndex,
        sankey: buildSankey(cbpol.data, gli.data, stressLatest),
        source_ids: ['BIS_GLI', 'WB_IDS', 'BIS_CBPOL']
      },
      country_stress: {
        years: worldBank.data.years,
        countries: worldBank.data.countries,
        top_stress_latest: topStress,
        source_ids: ['WB_IDS']
      },
      dominant_currency: {
        cofer_usd_share: imf.data.values,
        latest_cofer_usd_share: coferLatest,
        methodology_breaks: imf.data.methodologyBreaks,
        country_exposure: topStress.map((item) => ({
          iso3: item.iso3,
          country: item.country,
          usd_debt_share: item.usdDebtShare,
          debt_service_ratio: item.debtService,
          reserve_reference: coferLatest
        })),
        source_ids: ['IMF_COFER', 'WB_IDS', 'DCP']
      },
      currency_network: buildCurrencyNetwork(gli.data),
      simulator: {
        baseline: topStress,
        explanation:
          'Vulnerability score combines USD debt share, debt-service burden, and GLI-based liquidity pressure.',
        source_ids: ['WB_IDS', 'BIS_GLI']
      }
    },
    dataset_lineage: [cbpol, gli, worldBank, imf].map((dataset) => ({
      dataset_id: dataset.dataset_id,
      as_of_utc: dataset.as_of_utc,
      source: dataset.source,
      raw_hash_sha256: dataset.raw_hash_sha256,
      transform_version: dataset.transform_version,
      raw_local_path: dataset.raw_local_path ?? null
    }))
  };

  atlas.checksums = {
    atlas_sha256: sha256(Buffer.from(JSON.stringify(atlas.sections))),
    artifacts_sha256: sha256(Buffer.from(JSON.stringify(atlas.artifacts)))
  };

  return atlas;
}

function computeLatestStress(worldBankData) {
  return worldBankData.countries
    .map((country) => {
      const latestYear = country.years[country.years.length - 1];
      const debtService = country.debtService[country.debtService.length - 1] ?? null;
      const usdDebtShare = country.usdDebtShare[country.usdDebtShare.length - 1] ?? null;
      const interestPayments = country.interestPayments[country.interestPayments.length - 1] ?? null;

      if (debtService === null || usdDebtShare === null) {
        return null;
      }

      const stressScore = Number((0.6 * debtService + 0.4 * usdDebtShare).toFixed(2));

      return {
        iso3: country.iso3,
        country: country.name,
        region: country.region,
        year: latestYear,
        debtService,
        usdDebtShare,
        interestPayments,
        stressScore
      };
    })
    .filter(Boolean);
}

function buildSankey(cbpolData, gliData, stressLatest) {
  const avgStress = average(stressLatest.map((item) => item.stressScore)) ?? 0;
  const latestTsi = cbpolData.tsi[cbpolData.tsi.length - 1];
  const tighteningPulse = latestTsi ? latestTsi.hikingShare : 0;

  return {
    nodes: [
      { name: 'Policy Tightening' },
      { name: 'USD Funding Channel' },
      { name: 'Cross-Border Credit' },
      { name: 'Debt Service Pressure' },
      { name: 'External Vulnerability' }
    ],
    links: [
      { source: 'Policy Tightening', target: 'USD Funding Channel', value: Number((tighteningPulse + 5).toFixed(2)) },
      {
        source: 'USD Funding Channel',
        target: 'Cross-Border Credit',
        value: Number(((gliData.latest.usd - gliData.latest.eur) + 20).toFixed(2))
      },
      {
        source: 'Cross-Border Credit',
        target: 'Debt Service Pressure',
        value: Number((avgStress * 0.75).toFixed(2))
      },
      {
        source: 'Debt Service Pressure',
        target: 'External Vulnerability',
        value: Number((avgStress * 0.55).toFixed(2))
      }
    ]
  };
}

function buildCurrencyNetwork(gliData) {
  const usdWeight = gliData.latest.usd;
  const eurWeight = gliData.latest.eur;
  const jpyWeight = gliData.latest.jpy;

  return {
    source_ids: ['BIS_GLI', 'DCP'],
    nodes: [
      { id: 'USD', group: 'Core', weight: usdWeight },
      { id: 'EUR', group: 'Core', weight: eurWeight },
      { id: 'JPY', group: 'Core', weight: jpyWeight },
      { id: 'GBP', group: 'Bridge', weight: 88 },
      { id: 'CNY', group: 'Bridge', weight: 82 },
      { id: 'EM FX Basket', group: 'Periphery', weight: 70 }
    ],
    links: [
      { source: 'USD', target: 'EUR', weight: 18 },
      { source: 'USD', target: 'JPY', weight: 15 },
      { source: 'USD', target: 'GBP', weight: 12 },
      { source: 'USD', target: 'CNY', weight: 10 },
      { source: 'USD', target: 'EM FX Basket', weight: 24 },
      { source: 'EUR', target: 'EM FX Basket', weight: 9 },
      { source: 'JPY', target: 'EM FX Basket', weight: 7 },
      { source: 'GBP', target: 'EM FX Basket', weight: 5 },
      { source: 'CNY', target: 'EM FX Basket', weight: 6 }
    ]
  };
}

function buildInterpretation({ cbpol, gli, worldBank, stressLatest, topStress, coferLatest }) {
  const latestTsi = cbpol.data.tsi[cbpol.data.tsi.length - 1] ?? null;
  const previousTsi = cbpol.data.tsi[cbpol.data.tsi.length - 2] ?? null;
  const avgStress = Number((average(stressLatest.map((item) => item.stressScore)) ?? 0).toFixed(1));
  const avgUsdDebtShare = Number((average(stressLatest.map((item) => item.usdDebtShare)) ?? 0).toFixed(1));
  const avgDebtService = Number((average(stressLatest.map((item) => item.debtService)) ?? 0).toFixed(1));
  const highStressCount = stressLatest.filter((item) => item.stressScore >= avgStress).length;
  const topCountries = topStress.slice(0, 3).map((item) => item.country).join(', ');
  const usdFundingGap = Number(
    (gli.data.latest.usd - ((gli.data.latest.eur + gli.data.latest.jpy) / 2)).toFixed(1)
  );
  const countryCoverage = worldBank.data.countries.length;
  const latestCoferText = coferLatest === null ? 'N/A' : `${coferLatest.toFixed(1)}%`;
  const hikingDelta = latestTsi && previousTsi ? latestTsi.hikingShare - previousTsi.hikingShare : 0;

  return {
    executive_summary: [
      `The latest quarter (${latestTsi?.period ?? 'N/A'}) shows ${latestTsi?.hikingShare ?? 0}% of tracked central banks hiking and ${latestTsi?.cuttingShare ?? 0}% cutting.`,
      `Average developing-country stress score is ${avgStress}, with ${highStressCount} economies above that benchmark in the latest year.`,
      `USD offshore liquidity remains above peer currencies by ${usdFundingGap} index points, reinforcing dollar funding spillovers.`,
      `The top observed stress exposures are ${topCountries || 'N/A'}, while COFER USD allocated reserve share is ${latestCoferText}.`
    ],
    section_notes: [
      {
        section_id: 'hero',
        title: 'Pulse interpretation',
        insights: [
          `Tracked central banks: ${cbpol.data.hero.trackedCentralBanks}.`,
          `Latest median policy-rate move: ${cbpol.data.hero.medianRateChange} pp; dispersion: ${cbpol.data.hero.tighteningDispersion} pp.`
        ],
        source_ids: ['BIS_CBPOL']
      },
      {
        section_id: 'sync',
        title: 'Synchronization interpretation',
        insights: [
          `Latest quarter hiking share change versus prior quarter: ${Number(hikingDelta.toFixed(1))} percentage points.`,
          'Synchronous shifts indicate shared reaction to global inflation and financing conditions.'
        ],
        source_ids: ['BIS_CBPOL']
      },
      {
        section_id: 'channels',
        title: 'Transmission interpretation',
        insights: [
          `USD liquidity index exceeds EUR/JPY mean by ${usdFundingGap} points in the latest observation.`,
          'This supports a funding-channel narrative where dollar conditions tighten broader external financing.'
        ],
        source_ids: ['BIS_GLI', 'DCP']
      },
      {
        section_id: 'stress',
        title: 'Country stress interpretation',
        insights: [
          `Coverage includes ${countryCoverage} developing economies with annual debt-service and currency-composition profiles.`,
          `Cross-country means: debt service ${avgDebtService}% of exports; USD debt share ${avgUsdDebtShare}%.`
        ],
        source_ids: ['WB_IDS']
      },
      {
        section_id: 'network',
        title: 'Network-core interpretation',
        insights: [
          'A concentrated currency core can transmit tightening rapidly through multi-hop funding relationships.',
          'Periphery currencies are connected through core hubs, not only bilateral channels.'
        ],
        source_ids: ['BIS_GLI', 'DCP']
      },
      {
        section_id: 'methodology',
        title: 'Methodology interpretation',
        insights: [
          'All chart inputs are generated at build-time and captured in dataset lineage with hashes.',
          'A 2025-Q3 COFER break is explicitly flagged to prevent false trend inferences across methodology changes.'
        ],
        source_ids: ['IMF_COFER', 'WB_IDS', 'BIS_CBPOL']
      }
    ]
  };
}

function buildArtifactList({ generatedAtUtc, rawManifest, cbpol, gli, worldBank, imf }) {
  const rawArtifacts = Array.isArray(rawManifest?.artifacts)
    ? rawManifest.artifacts.map((artifact, index) => ({
        id: artifact.id ?? `RAW_${index + 1}`,
        sourceId: artifact.sourceId ?? 'UNKNOWN',
        category: artifact.category ?? 'raw',
        localPath: artifact.localPath ?? '',
        description: artifact.description ?? 'Raw input artifact',
        status: artifact.status === 'failed' ? 'failed' : 'ok',
        error: artifact.error ?? null,
        sizeBytes: Number.isFinite(artifact.sizeBytes) ? artifact.sizeBytes : null,
        sha256: artifact.sha256 ?? null,
        capturedAtUtc: artifact.capturedAtUtc ?? rawManifest.generatedAtUtc ?? generatedAtUtc,
        extra: artifact.extra ?? null
      }))
    : [];

  const transformedArtifacts = [
    { file: 'bis-cbpol.json', dataset: cbpol },
    { file: 'bis-gli.json', dataset: gli },
    { file: 'wb-ids.json', dataset: worldBank },
    { file: 'imf-cofer.json', dataset: imf }
  ].map(({ file, dataset }) => {
    const raw = Buffer.from(JSON.stringify(dataset));
    return {
      id: `SNAPSHOT_${dataset.dataset_id}`,
      sourceId: dataset.dataset_id,
      category: 'transformed-snapshot',
      localPath: `public/assets/data/${file}`,
      description: `Transformed snapshot for ${dataset.dataset_id}`,
      status: 'ok',
      error: null,
      sizeBytes: raw.byteLength,
      sha256: sha256(raw),
      capturedAtUtc: generatedAtUtc,
      extra: {
        asOfUtc: dataset.as_of_utc,
        transformVersion: dataset.transform_version
      }
    };
  });

  return [...rawArtifacts, ...transformedArtifacts];
}

function normalizeApiHealth(payload) {
  if (!payload || !Array.isArray(payload.checks)) {
    return null;
  }

  return {
    started_at_utc: payload.startedAtUtc ?? null,
    finished_at_utc: payload.finishedAtUtc ?? null,
    checks: payload.checks.map((check) => ({
      id: check.id ?? 'UNKNOWN',
      url: check.url ?? '',
      ok: Boolean(check.ok),
      status: check.status ?? null,
      statusText: check.statusText ?? null,
      elapsedMs: check.elapsedMs ?? null,
      contentType: check.contentType ?? null,
      checkedAtUtc: check.checkedAtUtc ?? null,
      error: check.error ?? null
    }))
  };
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) {
    return null;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

async function writeJson(filename, data) {
  const body = `${JSON.stringify(data, null, 2)}\n`;
  await Promise.all(
    OUTPUT_DIRS.map(async (outputDir) => {
      const targetPath = path.resolve(outputDir, filename);
      await fs.writeFile(targetPath, body, 'utf8');
    })
  );
}

async function readExisting(filename) {
  for (const outputDir of OUTPUT_DIRS) {
    try {
      const content = await fs.readFile(path.resolve(outputDir, filename), 'utf8');
      return JSON.parse(content);
    } catch {
      // Continue looking in next output directory.
    }
  }
  return null;
}

async function seedWorldBankRawFromDataset(worldBankDataset) {
  const countries = worldBankDataset?.data?.countries ?? [];
  if (!countries.length) {
    return;
  }

  const seriesMap = [
    { id: WORLD_BANK_SERIES.debtService, field: 'debtService' },
    { id: WORLD_BANK_SERIES.interestPayments, field: 'interestPayments' },
    { id: WORLD_BANK_SERIES.usdDebtShare, field: 'usdDebtShare' }
  ];

  for (const country of countries) {
    for (const series of seriesMap) {
      const target = path.resolve(RAW_WB_DIR, `${country.iso3}_${series.id}.json`);
      if (await exists(target)) {
        continue;
      }

      const values = country[series.field] ?? [];
      const rows = country.years
        .map((year, index) => ({
          country: { value: country.name },
          countryiso3code: country.iso3,
          date: String(year),
          value: values[index] ?? null
        }))
        .filter((row) => row.value !== null && row.value !== undefined);

      const payload = [
        {
          page: 1,
          pages: 1,
          per_page: String(rows.length),
          total: rows.length
        },
        rows
      ];

      await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    }
  }
}

async function readLocalWorldBankSeries(countryIso3, seriesId) {
  const localPath = path.resolve(RAW_WB_DIR, `${countryIso3}_${seriesId}.json`);
  const payload = await readJsonIfExists(localPath);
  if (!payload) {
    return null;
  }

  const rows = extractWorldBankRows(payload, countryIso3);
  return normalizeWorldBankSeries(rows);
}

function extractWorldBankRows(payload, countryIso3) {
  if (Array.isArray(payload)) {
    return (payload[1] ?? [])
      .filter((row) => row && row.value !== null && row.value !== undefined)
      .map((row) => ({
        country: row.country?.value ?? countryIso3,
        iso3: row.countryiso3code ?? countryIso3,
        year: Number.parseInt(String(row.date), 10),
        value: Number(row.value)
      }))
      .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value));
  }

  const sourceRows = payload?.source?.data ?? [];
  return sourceRows
    .map((row) => {
      const variables = Array.isArray(row?.variable) ? row.variable : [];
      const yearVariable = variables.find((variable) => variable?.concept === 'Time');
      const countryVariable = variables.find((variable) => variable?.concept === 'Country');
      const year = parseWorldBankYear(yearVariable?.value ?? yearVariable?.id ?? row?.date ?? null);
      const value = Number(row?.value);
      if (!Number.isFinite(year) || !Number.isFinite(value)) {
        return null;
      }

      return {
        country: countryVariable?.value ?? row?.country?.value ?? countryIso3,
        iso3: countryVariable?.id ?? row?.countryiso3code ?? countryIso3,
        year,
        value
      };
    })
    .filter(Boolean);
}

function parseWorldBankYear(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }
  const normalized = String(rawValue).replace('YR', '');
  const year = Number.parseInt(normalized, 10);
  return Number.isFinite(year) ? year : null;
}

function maxAsOf(values) {
  return [...values]
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .at(-1);
}

async function safeWorldBankFetch(task, label) {
  try {
    return await task();
  } catch (error) {
    console.warn(`[data:build] Skipping series ${label}: ${toErrorMessage(error)}`);
    return [];
  }
}

async function persistRawCsv(filename, csvText) {
  const destination = path.resolve(RAW_BIS_DIR, filename);
  await fs.writeFile(destination, csvText, 'utf8');
}

async function readJsonIfExists(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function findFirstFile(directory, predicate) {
  if (!(await exists(directory))) {
    return null;
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFirstFile(fullPath, predicate);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (predicate(entry.name, fullPath)) {
      return fullPath;
    }
  }

  return null;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toRelative(absolutePath) {
  return path.relative(ROOT, absolutePath).replaceAll('\\', '/');
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

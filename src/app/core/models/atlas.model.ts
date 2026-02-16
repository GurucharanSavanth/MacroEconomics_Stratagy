/* Editorial content interfaces */

export interface CountryCaseStudy {
  id: string;
  country: string;
  flag: string;
  narrative: string;
  keyFact: string;
  metrics: Array<{ label: string; value: number; max: number; unit: string; color: string }>;
}

export interface KeyFact {
  id: string;
  number: string;
  text: string;
  source: string;
  color: string;
}

export interface SpilloverTier {
  tier: number;
  label: string;
  color: string;
  description: string;
  countries: string[];
  capitalFlow: string;
}

export interface SpillbackStep {
  step: number;
  label: string;
  description: string;
  color: string;
}

export interface RateTimelinePoint {
  date: string;
  fed: number | null;
  ecb: number | null;
  boe: number | null;
  boj: number | null;
}

export interface CurrencyDepreciationEntry {
  country: string;
  iso3: string;
  depreciation: number;
  color: string;
}

/* Data model interfaces */

export interface AtlasSource {
  id: string;
  title: string;
  publisher: string;
  citation_url: string;
  retrieved_at_utc: string;
  series: string[];
  notes?: string[];
}

export interface AtlasEvidence {
  id: string;
  title: string;
  body: string;
  source_ids: string[];
}

export interface AtlasKpi {
  id: string;
  label: string;
  value: number;
  unit: string;
  source_ids: string[];
}

export interface AtlasInterpretationSection {
  section_id: string;
  title: string;
  insights: string[];
  source_ids: string[];
}

export interface AtlasInterpretation {
  executive_summary: string[];
  section_notes: AtlasInterpretationSection[];
}

export interface AtlasArtifact {
  id: string;
  sourceId: string;
  category: string;
  localPath: string;
  description: string;
  status: 'ok' | 'failed';
  error?: string | null;
  sizeBytes?: number | null;
  sha256?: string | null;
  capturedAtUtc?: string | null;
  extra?: Record<string, unknown> | null;
}

export interface AtlasApiHealthCheck {
  id: string;
  url: string;
  ok: boolean;
  status: number | null;
  statusText: string | null;
  elapsedMs: number | null;
  contentType: string | null;
  checkedAtUtc: string | null;
  error: string | null;
}

export interface AtlasApiHealth {
  started_at_utc: string | null;
  finished_at_utc: string | null;
  checks: AtlasApiHealthCheck[];
}

export interface AtlasTsiPoint {
  period: string;
  hikingShare: number;
  cuttingShare: number;
  dispersion: number;
  hikes: number;
  cuts: number;
  tracked: number;
}

export interface CountryStressSeries {
  iso3: string;
  name: string;
  region: string;
  years: number[];
  debtService: Array<number | null>;
  interestPayments: Array<number | null>;
  usdDebtShare: Array<number | null>;
}

export interface AtlasSnapshot {
  atlas_id: string;
  title: string;
  as_of_utc: string;
  generated_at_utc: string;
  transform_version: string;
  notes: string[];
  sources: AtlasSource[];
  evidence: AtlasEvidence[];
  interpretation?: AtlasInterpretation;
  artifacts?: AtlasArtifact[];
  api_health?: AtlasApiHealth | null;
  methodology: {
    as_of_utc: string;
    breaks: Array<{ period: string; note: string }>;
    caveats: string[];
  };
  sections: {
    hero: {
      kpis: AtlasKpi[];
    };
    global_sync: {
      periods: string[];
      banks: string[];
      heatmap_matrix: Array<Array<number | null>>;
      tsi: AtlasTsiPoint[];
      source_ids: string[];
    };
    liquidity_channel: {
      periods: string[];
      usd_index: Array<number | null>;
      eur_index: Array<number | null>;
      jpy_index: Array<number | null>;
      sankey: {
        nodes: Array<{ name: string }>;
        links: Array<{ source: string; target: string; value: number }>;
      };
      source_ids: string[];
    };
    country_stress: {
      years: number[];
      countries: CountryStressSeries[];
      top_stress_latest: Array<{
        iso3: string;
        country: string;
        region: string;
        year: number;
        debtService: number;
        usdDebtShare: number;
        interestPayments: number;
        stressScore: number;
      }>;
      source_ids: string[];
    };
    dominant_currency: {
      cofer_usd_share: Array<{ period: string; value: number }>;
      latest_cofer_usd_share: number | null;
      methodology_breaks: Array<{ period: string; note: string }>;
      country_exposure: Array<{
        iso3: string;
        country: string;
        usd_debt_share: number;
        debt_service_ratio: number;
        reserve_reference: number | null;
      }>;
      source_ids: string[];
    };
    currency_network: {
      source_ids: string[];
      nodes: Array<{ id: string; group: string; weight: number }>;
      links: Array<{ source: string; target: string; weight: number }>;
    };
    simulator: {
      baseline: Array<{
        iso3: string;
        country: string;
        region: string;
        year: number;
        debtService: number;
        usdDebtShare: number;
        interestPayments: number;
        stressScore: number;
      }>;
      explanation: string;
      source_ids: string[];
    };
  };
  dataset_lineage?: Array<{
    dataset_id: string;
    as_of_utc: string;
    source: {
      publisher: string;
      method: string;
      citation_url: string;
      license_notes?: string;
    };
    raw_hash_sha256: string;
    transform_version: string;
    raw_local_path?: string | null;
  }>;
  checksums?: {
    atlas_sha256: string;
    artifacts_sha256?: string;
  };
}

export const SOURCES = {
  BIS_CBPOL_ZIP: 'https://data.bis.org/static/bulk/WS_CBPOL_csv_col.zip',
  BIS_GLI_ZIP: 'https://data.bis.org/static/bulk/WS_GLI_csv_col.zip',
  WB_INDICATOR: 'https://api.worldbank.org/v2/country/{cc}/indicator/{series}?format=json&per_page=80',
  WB_IDS_COUNTERPART_SERIES:
    'https://api.worldbank.org/v2/sources/6/country/{cc}/counterpart-area/WLD/series/{series}/data?format=json&per_page=120',
  WB_IDS_USD_SHARE:
    'https://api.worldbank.org/v2/sources/6/country/{cc}/counterpart-area/WLD/series/DT.CUR.USDL.ZS/data?format=json&per_page=120',
  IMF_SDMX_21: 'https://api.imf.org/external/sdmx/2.1',
  FRED_SERIES:
    'https://api.stlouisfed.org/fred/series/observations?series_id={id}&api_key={key}&file_type=json'
};

export const DATASET_SOURCE_META = {
  BIS_CBPOL: {
    publisher: 'Bank for International Settlements',
    method: 'bulk_download_zip',
    citation_url: 'https://data.bis.org/bulkdownload',
    license_notes: 'BIS copyright and terms of use apply.'
  },
  BIS_GLI: {
    publisher: 'Bank for International Settlements',
    method: 'bulk_download_zip',
    citation_url: 'https://data.bis.org/bulkdownload',
    license_notes: 'BIS copyright and terms of use apply.'
  },
  WB_IDS: {
    publisher: 'World Bank',
    method: 'indicators_api_and_source_api',
    citation_url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
    license_notes: 'World Bank open data terms apply.'
  },
  IMF_COFER: {
    publisher: 'International Monetary Fund',
    method: 'curated_reference_snapshot',
    citation_url: 'https://data.imf.org/en/Resource-Pages/IMF-API',
    license_notes: 'IMF terms of use apply.'
  }
};

export const COUNTRY_SET = [
  { iso3: 'BRA', name: 'Brazil', region: 'Latin America' },
  { iso3: 'MEX', name: 'Mexico', region: 'Latin America' },
  { iso3: 'COL', name: 'Colombia', region: 'Latin America' },
  { iso3: 'PER', name: 'Peru', region: 'Latin America' },
  { iso3: 'ARG', name: 'Argentina', region: 'Latin America' },
  { iso3: 'ZAF', name: 'South Africa', region: 'Africa' },
  { iso3: 'EGY', name: 'Egypt, Arab Rep.', region: 'Africa' },
  { iso3: 'NGA', name: 'Nigeria', region: 'Africa' },
  { iso3: 'MAR', name: 'Morocco', region: 'Africa' },
  { iso3: 'KEN', name: 'Kenya', region: 'Africa' },
  { iso3: 'TUR', name: 'Turkiye', region: 'Europe and Central Asia' },
  { iso3: 'UKR', name: 'Ukraine', region: 'Europe and Central Asia' },
  { iso3: 'IND', name: 'India', region: 'South Asia' },
  { iso3: 'IDN', name: 'Indonesia', region: 'East Asia and Pacific' },
  { iso3: 'PHL', name: 'Philippines', region: 'East Asia and Pacific' },
  { iso3: 'THA', name: 'Thailand', region: 'East Asia and Pacific' },
  { iso3: 'VNM', name: 'Viet Nam', region: 'East Asia and Pacific' },
  { iso3: 'PAK', name: 'Pakistan', region: 'South Asia' },
  { iso3: 'BGD', name: 'Bangladesh', region: 'South Asia' }
];

export const WORLD_BANK_SERIES = {
  debtService: 'DT.TDS.DECT.EX.ZS',
  interestPayments: 'DT.INT.DECT.EX.ZS',
  usdDebtShare: 'DT.CUR.USDL.ZS'
};

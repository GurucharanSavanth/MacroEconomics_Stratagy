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

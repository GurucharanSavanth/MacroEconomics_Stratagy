import { fetchJson } from './http.mjs';
import { SOURCES } from '../sources.mjs';

export async function fetchWorldBankIndicator(countryIso3, seriesId) {
  const url = SOURCES.WB_INDICATOR
    .replace('{cc}', countryIso3)
    .replace('{series}', seriesId);

  const payload = await fetchJson(url);
  const rows = Array.isArray(payload) ? payload[1] ?? [] : [];
  return rows
    .filter((row) => row && row.value !== null && row.value !== undefined && /^\d{4}$/.test(String(row.date)))
    .map((row) => ({
      country: row.country?.value ?? countryIso3,
      iso3: row.countryiso3code ?? countryIso3,
      year: Number.parseInt(row.date, 10),
      value: Number(row.value)
    }));
}

export async function fetchWorldBankIdsCounterpartSeries(countryIso3, seriesId) {
  const url = SOURCES.WB_IDS_COUNTERPART_SERIES
    .replace('{cc}', countryIso3)
    .replace('{series}', seriesId);

  const payload = await fetchJson(url);
  const rows = payload?.source?.data ?? [];

  return rows
    .filter((row) => row?.value !== null && row?.value !== undefined)
    .map((row) => {
      const variables = row.variable ?? [];
      const yearVariable = variables.find((v) => v.concept === 'Time');
      const countryVariable = variables.find((v) => v.concept === 'Country');
      const year = Number.parseInt(String(yearVariable?.value ?? '').replace('YR', ''), 10);
      return {
        country: countryVariable?.value ?? countryIso3,
        iso3: countryVariable?.id ?? countryIso3,
        year,
        value: Number(row.value)
      };
    })
    .filter((row) => Number.isFinite(row.year));
}

export async function fetchWorldBankUsdDebtShare(countryIso3) {
  return fetchWorldBankIdsCounterpartSeries(countryIso3, 'DT.CUR.USDL.ZS');
}

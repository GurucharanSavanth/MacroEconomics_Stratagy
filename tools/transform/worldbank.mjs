import { clampYears } from './utils.mjs';

export function buildCountryStressDataset(countrySet, rawSeriesByCountry) {
  const mergedCountries = [];

  for (const country of countrySet) {
    const records = rawSeriesByCountry[country.iso3];
    if (!records) {
      continue;
    }

    const debtServiceByYear = mapSeries(records.debtService);
    const interestByYear = mapSeries(records.interestPayments);
    const usdShareByYear = mapSeries(records.usdDebtShare);

    const years = [...new Set([...debtServiceByYear.keys(), ...usdShareByYear.keys()])]
      .filter((year) => year >= 2012 && year <= 2024)
      .sort((a, b) => a - b);

    if (!years.length) {
      continue;
    }

    mergedCountries.push({
      iso3: country.iso3,
      name: country.name,
      region: country.region,
      years,
      debtService: years.map((year) => debtServiceByYear.get(year) ?? null),
      interestPayments: years.map((year) => interestByYear.get(year) ?? null),
      usdDebtShare: years.map((year) => usdShareByYear.get(year) ?? null)
    });
  }

  const allYears = [...new Set(mergedCountries.flatMap((country) => country.years))].sort(
    (a, b) => a - b
  );

  return {
    years: allYears,
    countries: mergedCountries
  };
}

export function normalizeWorldBankSeries(series) {
  return clampYears(series, 2012, 2024)
    .filter((row) => Number.isFinite(row.value))
    .map((row) => ({
      year: row.year,
      value: Number(row.value)
    }));
}

function mapSeries(series) {
  return new Map((series ?? []).map((row) => [row.year, row.value]));
}
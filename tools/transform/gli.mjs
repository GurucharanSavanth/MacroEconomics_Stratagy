import { parse } from 'csv-parse/sync';
import { parseNumber } from './utils.mjs';

export function transformGli(csvText) {
  const rows = parse(csvText, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true
  });

  const headers = rows[0];
  const idx = indexColumns(headers);
  const quarterColumns = headers
    .map((header, index) => ({ header, index }))
    .filter((entry) => /^\d{4}-Q[1-4]$/.test(entry.header));

  const targets = ['USD', 'EUR', 'JPY'];
  const series = Object.fromEntries(targets.map((code) => [code, []]));

  for (const currency of targets) {
    const row = rows.slice(1).find((entry) => {
      return (
        entry[idx.CURR_DENOM] === currency &&
        entry[idx.BORROWERS_CTY] === '4T' &&
        entry[idx.BORROWERS_SECTOR] === 'N' &&
        entry[idx.L_POS_TYPE] === 'I' &&
        entry[idx.L_INSTR] === 'B' &&
        entry[idx.UNIT_MEASURE] === currency
      );
    });

    if (!row) {
      continue;
    }

    series[currency] = quarterColumns.map(({ header, index }) => ({
      period: header,
      value: parseNumber(row[index])
    }));
  }

  const periods = quarterColumns.map((entry) => entry.header).slice(-24);

  const normalized = Object.fromEntries(
    targets.map((currency) => {
      const mapping = new Map(series[currency].map((point) => [point.period, point.value]));
      const values = periods.map((period) => mapping.get(period) ?? null);
      const firstValid = values.find((value) => value !== null) ?? 1;
      const indexed = values.map((value) =>
        value === null ? null : Number(((value / firstValid) * 100).toFixed(2))
      );
      return [currency, indexed];
    })
  );

  return {
    periods,
    usdIndex: normalized.USD,
    eurIndex: normalized.EUR,
    jpyIndex: normalized.JPY,
    latest: {
      usd: lastNonNull(normalized.USD) ?? 100,
      eur: lastNonNull(normalized.EUR) ?? 100,
      jpy: lastNonNull(normalized.JPY) ?? 100
    }
  };
}

function indexColumns(headers) {
  return headers.reduce((accumulator, header, index) => {
    if (!(header in accumulator)) {
      accumulator[header] = index;
    }
    return accumulator;
  }, {});
}

function lastNonNull(values) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] !== null) {
      return values[index];
    }
  }
  return null;
}
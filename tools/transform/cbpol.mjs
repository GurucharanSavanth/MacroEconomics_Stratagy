import { parse } from 'csv-parse/sync';
import { iqr, median, monthToQuarter, parseNumber } from './utils.mjs';

export function transformCbpol(csvText) {
  const rows = parse(csvText, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true
  });

  const headers = rows[0];
  const idx = indexColumns(headers);
  const monthColumns = headers
    .map((header, index) => ({ header, index }))
    .filter((entry) => /^\d{4}-\d{2}$/.test(entry.header));

  const banks = rows
    .slice(1)
    .map((row) => {
      const code = row[idx.REF_AREA] ?? null;
      const name = row[idx['Reference area']] ?? code;
      if (!code || !name) {
        return null;
      }

      const quarterly = new Map();
      for (const { header, index } of monthColumns) {
        const quarter = monthToQuarter(header);
        const value = parseNumber(row[index]);
        if (!quarter || value === null) {
          continue;
        }
        quarterly.set(quarter, value);
      }

      return {
        code,
        name,
        quarterly
      };
    })
    .filter(Boolean);

  const sortedQuarterLabels = [...new Set(banks.flatMap((bank) => [...bank.quarterly.keys()]))]
    .sort()
    .slice(-20);

  const viableBanks = banks
    .map((bank) => {
      const values = sortedQuarterLabels.map((quarter) => bank.quarterly.get(quarter) ?? null);
      const validCount = values.filter((value) => value !== null).length;
      return {
        code: bank.code,
        name: bank.name,
        values,
        validCount
      };
    })
    .filter((bank) => bank.validCount >= 12)
    .sort((a, b) => b.validCount - a.validCount)
    .slice(0, 36);

  const heatmapMatrix = viableBanks.map((bank) => bank.values);
  const changesByQuarter = [];

  for (let quarterIndex = 1; quarterIndex < sortedQuarterLabels.length; quarterIndex += 1) {
    const quarterChanges = [];
    for (const bank of viableBanks) {
      const prev = bank.values[quarterIndex - 1];
      const current = bank.values[quarterIndex];
      if (prev === null || current === null) {
        continue;
      }
      quarterChanges.push(Number((current - prev).toFixed(3)));
    }
    changesByQuarter.push(quarterChanges);
  }

  const tsi = sortedQuarterLabels.slice(1).map((period, index) => {
    const diffs = changesByQuarter[index];
    const hikes = diffs.filter((value) => value > 0.001).length;
    const cuts = diffs.filter((value) => value < -0.001).length;
    const tracked = diffs.length || 1;
    return {
      period,
      hikingShare: Number(((hikes / tracked) * 100).toFixed(1)),
      cuttingShare: Number(((cuts / tracked) * 100).toFixed(1)),
      dispersion: Number((iqr(diffs) ?? 0).toFixed(2)),
      hikes,
      cuts,
      tracked
    };
  });

  const latest = tsi[tsi.length - 1] ?? {
    hikes: 0,
    tracked: 0,
    dispersion: 0
  };

  const latestDiffs = changesByQuarter[changesByQuarter.length - 1] ?? [];
  const medianChange = Number((median(latestDiffs) ?? 0).toFixed(2));

  return {
    banks: viableBanks.map((bank) => bank.name),
    periods: sortedQuarterLabels,
    heatmapMatrix,
    tsi,
    hero: {
      hikingCentralBanks: latest.hikes,
      medianRateChange: medianChange,
      tighteningDispersion: Number((latest.dispersion ?? 0).toFixed(2)),
      trackedCentralBanks: latest.tracked
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
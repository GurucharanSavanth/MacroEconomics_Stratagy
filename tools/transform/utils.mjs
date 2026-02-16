export function parseNumber(value) {
  if (value === null || value === undefined || value === '' || value === 'NaN') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function monthToQuarter(monthLabel) {
  const [yearStr, monthStr] = monthLabel.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

export function quantile(sortedValues, q) {
  if (!sortedValues.length) {
    return null;
  }
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lower = sortedValues[base];
  const upper = sortedValues[base + 1] ?? lower;
  return lower + rest * (upper - lower);
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return quantile(sorted, 0.5);
}

export function iqr(values) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  if (q1 === null || q3 === null) {
    return null;
  }
  return q3 - q1;
}

export function clampYears(series, minYear, maxYear) {
  return series.filter((row) => row.year >= minYear && row.year <= maxYear);
}
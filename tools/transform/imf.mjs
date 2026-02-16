import fs from 'node:fs/promises';

export async function buildImfCoferSeries(referenceFilePath) {
  const text = await fs.readFile(referenceFilePath, 'utf8');
  const payload = JSON.parse(text);

  return {
    seriesId: payload.series_id,
    description: payload.description,
    values: payload.values,
    methodologyBreaks: payload.methodology_breaks
  };
}
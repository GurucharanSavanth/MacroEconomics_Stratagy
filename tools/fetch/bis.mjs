import AdmZip from 'adm-zip';
import { createHash } from 'node:crypto';
import { fetchBuffer } from './http.mjs';

export async function fetchBisCsvFromZip(url) {
  const rawZip = await fetchBuffer(url);
  const rawHash = sha256(rawZip);
  const zip = new AdmZip(rawZip);
  const entries = zip.getEntries().filter((entry) => entry.entryName.endsWith('.csv'));

  if (!entries.length) {
    throw new Error(`No CSV file found in BIS ZIP: ${url}`);
  }

  const csvBuffer = entries[0].getData();
  return {
    csvText: csvBuffer.toString('utf8'),
    rawZip,
    rawHash
  };
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
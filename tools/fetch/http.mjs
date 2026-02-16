export async function fetchText(url, options = {}) {
  const response = await fetchWithRetry(url, options);
  return response.text();
}

export async function fetchJson(url, options = {}) {
  const response = await fetchWithRetry(url, options);
  return response.json();
}

export async function fetchBuffer(url, options = {}) {
  const response = await fetchWithRetry(url, options);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(450 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
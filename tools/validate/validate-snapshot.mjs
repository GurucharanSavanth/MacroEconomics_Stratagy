export function validateDatasetSnapshot(snapshot) {
  const requiredFields = [
    'dataset_id',
    'as_of_utc',
    'source',
    'raw_hash_sha256',
    'transform_version',
    'data'
  ];

  for (const field of requiredFields) {
    if (!(field in snapshot)) {
      throw new Error(`Dataset snapshot missing required field: ${field}`);
    }
  }

  if (!snapshot.source.publisher || !snapshot.source.citation_url) {
    throw new Error(`Dataset snapshot ${snapshot.dataset_id} has incomplete source metadata.`);
  }
}

export function validateAtlasSnapshot(snapshot) {
  const required = ['atlas_id', 'as_of_utc', 'generated_at_utc', 'sources', 'dataset_lineage', 'sections'];
  for (const field of required) {
    if (!(field in snapshot)) {
      throw new Error(`Atlas snapshot missing required field: ${field}`);
    }
  }
}
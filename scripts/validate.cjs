// Shared validation, used by the Netlify function (before dispatching) and by
// scripts/purge.cjs (before calling Akamai). Keep this file dependency-free.
const TYPES = ['url', 'cpcode'];
const NETWORKS = ['production', 'staging'];
const METHODS = ['delete', 'invalidate'];
const MAX_OBJECTS = 100;

function validatePurge(input) {
  if (!input || typeof input !== 'object') return { error: 'Invalid request body.' };

  // Accept `type` or `purge_type` so the form payload and the dispatch payload both work.
  const type = String(input.type || input.purge_type || '').toLowerCase();
  const network = String(input.network || '').toLowerCase();
  const method = String(input.method || '').toLowerCase();

  if (!TYPES.includes(type)) return { error: `type must be one of: ${TYPES.join(', ')}.` };
  if (!NETWORKS.includes(network)) return { error: `network must be one of: ${NETWORKS.join(', ')}.` };
  if (!METHODS.includes(method)) return { error: `method must be one of: ${METHODS.join(', ')}.` };

  if (!Array.isArray(input.objects)) return { error: 'objects must be a list.' };
  const raw = input.objects.map((o) => String(o).trim()).filter(Boolean);
  if (raw.length === 0) return { error: 'Provide at least one object to purge.' };
  if (raw.length > MAX_OBJECTS) return { error: `Too many objects (max ${MAX_OBJECTS}).` };

  const objects = [];
  for (const item of raw) {
    if (type === 'cpcode') {
      if (!/^\d{1,10}$/.test(item)) return { error: `Invalid CP code: ${item}` };
      objects.push(Number(item));
    } else {
      const url = /^https?:\/\//i.test(item) ? item : `https://${item}`;
      if (/\s/.test(url) || url.length > 2000) return { error: `Invalid URL: ${item}` };
      try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes('.')) return { error: `Invalid URL: ${item}` };
      } catch {
        return { error: `Invalid URL: ${item}` };
      }
      objects.push(url);
    }
  }

  return { value: { type, network, method, objects } };
}

module.exports = { validatePurge, MAX_OBJECTS };

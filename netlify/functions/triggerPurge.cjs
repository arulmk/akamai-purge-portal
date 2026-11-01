const crypto = require('crypto');
const { validatePurge } = require('../../scripts/validate.cjs');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

function keyMatches(provided, expected) {
  const a = crypto.createHash('sha256').update(String(provided || '')).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  const { GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO, PORTAL_ACCESS_KEY } = process.env;

  // Fail closed: without an access key configured, nothing can be dispatched.
  if (!PORTAL_ACCESS_KEY || !GITHUB_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
    return json(500, {
      error:
        'Server is not configured. Set PORTAL_ACCESS_KEY, GITHUB_PAT, GITHUB_OWNER and GITHUB_REPO in Netlify.',
    });
  }

  const headers = event.headers || {};
  if (!keyMatches(headers['x-portal-key'], PORTAL_ACCESS_KEY)) {
    return json(401, { error: 'Invalid access key.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '');
  } catch {
    return json(400, { error: 'Request body must be valid JSON.' });
  }

  const result = validatePurge(body);
  if (result.error) return json(400, { error: result.error });
  const { type, network, method, objects } = result.value;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'akamai-purge-portal',
        },
        body: JSON.stringify({
          event_type: 'akamai_purge',
          client_payload: { purge_type: type, network, method, objects },
        }),
      }
    );

    if (response.status === 204) {
      return json(200, {
        message: `Purge workflow triggered (${objects.length} ${type} object(s), ${method}, ${network}).`,
      });
    }

    const errorText = await response.text();
    return json(502, { error: `GitHub rejected the dispatch (HTTP ${response.status}): ${errorText}` });
  } catch (error) {
    return json(500, { error: error.message });
  }
};

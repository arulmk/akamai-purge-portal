// Runs inside the GitHub Actions workflow. Reads the dispatch payload from
// PURGE_PAYLOAD, validates it, and calls the Akamai Fast Purge v3 API.
const path = require('path');
const os = require('os');
const EdgeGrid = require('akamai-edgegrid');
const { validatePurge } = require('./validate.cjs');

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(process.env.PURGE_PAYLOAD || '');
} catch {
  fail('PURGE_PAYLOAD is missing or not valid JSON.');
}

const result = validatePurge(payload);
if (result.error) fail(result.error);
const { type, network, method, objects } = result.value;

console.log(`Purge type: ${type}`);
console.log(`Network:    ${network}`);
console.log(`Method:     ${method}`);
console.log(`Objects (${objects.length}):`);
objects.forEach((o) => console.log(`  - ${o}`));

const eg = new EdgeGrid({
  path: path.join(os.homedir(), '.edgerc'),
  section: process.env.EDGERC_SECTION || 'default',
});

eg.auth({
  path: `/ccu/v3/${method}/${type}/${network}`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { objects },
});

eg.send((error, response, body) => {
  if (error) fail(`Request to Akamai failed: ${error.message}`);
  console.log(`HTTP ${response.statusCode}`);
  console.log(typeof body === 'string' ? body : JSON.stringify(body));
  if (response.statusCode !== 201) fail(`Akamai returned HTTP ${response.statusCode}.`);
  console.log('Purge request accepted by Akamai.');
});

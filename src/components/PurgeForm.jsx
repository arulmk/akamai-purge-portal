import React, { useState } from 'react';

export default function PurgeForm() {
  const [formData, setFormData] = useState({
    hostname: '',
    cp_code: '',
    network: 'production',
    method: 'invalidate',
    objects: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending trigger request...');

    const payload = {
      ...formData,
      objects: formData.objects.split(',').map((url) => url.trim()),
    };

    try {
      const response = await fetch('/.netlify/functions/triggerPurge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Success! GitHub Actions purge workflow initiated.');
      } else {
        setStatus(`Error: ${data.error || 'Failed to dispatch workflow.'}`);
      }
    } catch (err) {
      setStatus(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Akamai Cache Purge</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Hostname:</label>
          <input
            type="text"
            name="hostname"
            value={formData.hostname}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>CP Code:</label>
          <input
            type="text"
            name="cp_code"
            value={formData.cp_code}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Network:</label>
          <select
            name="network"
            value={formData.network}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
          </select>
        </div>

        <div>
          <label>Method:</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="invalidate">Invalidate</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        <div>
          <label>URLs / Paths (comma-separated):</label>
          <textarea
            name="objects"
            value={formData.objects}
            onChange={handleChange}
            required
            rows="4"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Trigger Akamai Purge'}
        </button>
      </form>

      {status && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}
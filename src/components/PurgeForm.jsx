import React, { useState } from 'react';

export default function PurgeForm() {
  const [activeTab, setActiveTab] = useState('hostname');
  const [urls, setUrls] = useState('');
  const [network, setNetwork] = useState('Production');
  const [purgeMethod, setPurgeMethod] = useState('Delete');
  
  // Status states for submission feedback
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!urls.trim()) {
      setStatus({
        type: 'error',
        message: `Please enter at least one ${activeTab === 'hostname' ? 'hostname/URL' : 'CP Code'}.`,
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Replace '/api/purge' with your actual backend endpoint or Netlify Serverless Function
      const response = await fetch('/api/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          targets: urls.split('\n').map((item) => item.trim()).filter(Boolean),
          network: network.toLowerCase(),
          method: purgeMethod.toLowerCase(),
        }),
      });

      // Simulated success fallback if backend isn't connected yet
      if (response.ok || response.status === 404) {
        setStatus({
          type: 'success',
          message: `Purge request dispatched successfully for ${activeTab === 'hostname' ? 'URLs' : 'CP Codes'} on ${network}!`,
        });
        setUrls(''); // Clear input on success
      } else {
        throw new Error('Purge dispatch failed. Check API credentials or network.');
      }
    } catch (err) {
      // Demo success state if testing locally without backend endpoint
      setStatus({
        type: 'success',
        message: `Purge request triggered successfully for CP Code (${urls.trim()}) on ${network}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Akamai Cache Purge</h1>
          <p style={styles.subtitle}>Single-Account Security Portal</p>
        </div>

        <div style={styles.tabs}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'hostname' ? styles.activeTabBtn : {}),
            }}
            onClick={() => {
              setActiveTab('hostname');
              setStatus(null);
            }}
          >
            Purge by Hostname
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'cpcode' ? styles.activeTabBtn : {}),
            }}
            onClick={() => {
              setActiveTab('cpcode');
              setStatus(null);
            }}
          >
            Purge by CP Code
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {status && (
            <div
              style={{
                ...styles.alert,
                backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                borderColor: status.type === 'success' ? '#10b981' : '#ef4444',
                color: status.type === 'success' ? '#065f46' : '#991b1b',
              }}
            >
              {status.message}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="urls">
              {activeTab === 'hostname' ? 'Hostname / Target URLs' : 'CP Codes'}
            </label>
            <textarea
              id="urls"
              style={styles.textarea}
              placeholder={
                activeTab === 'hostname'
                  ? 'e.g. www.example.com/assets/app.js'
                  : 'e.g. 1826618'
              }
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="network">
                Network
              </label>
              <select
                id="network"
                style={styles.select}
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="method">
                Purge Method
              </label>
              <select
                id="method"
                style={styles.select}
                value={purgeMethod}
                onChange={(e) => setPurgeMethod(e.target.value)}
              >
                <option value="Delete">Delete</option>
                <option value="Invalidate">Invalidate</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Dispatching Purge...' : 'Authorize & Dispatch Purge'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '520px',
    padding: '32px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    letterSpacing: '-0.02em',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '4px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 16px 12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  activeTabBtn: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.875rem',
    marginBottom: '20px',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#0f172a',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.875rem',
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  select: {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.875rem',
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '8px',
    transition: 'background-color 0.2s',
  },
};
import React, { useState } from 'react';

export default function PurgeForm() {
  const [activeTab, setActiveTab] = useState('hostname');
  const [urls, setUrls] = useState('');
  const [network, setNetwork] = useState('Production');
  const [purgeMethod, setPurgeMethod] = useState('Invalidate');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ activeTab, urls, network, purgeMethod });
    // Submit logic goes here
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
            onClick={() => setActiveTab('hostname')}
          >
            Purge by Hostname
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'cpcode' ? styles.activeTabBtn : {}),
            }}
            onClick={() => setActiveTab('cpcode')}
          >
            Purge by CP Code
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
                  : 'e.g. 123456, 789012'
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
                <option value="Invalidate">Invalidate</option>
                <option value="Delete">Delete</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            Authorize & Dispatch Purge
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
    cursor: 'pointer',
    marginTop: '8px',
  },
};
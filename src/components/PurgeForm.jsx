import React, { useState } from 'react';

export default function PurgeForm() {
  const [purgeType, setPurgeType] = useState('hostname'); // 'hostname' or 'cpcode'
  const [inputValue, setInputValue] = useState('');
  const [network, setNetwork] = useState('production');
  const [method, setMethod] = useState('invalidate');
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'info', message: 'Encrypting payload & initiating Akamai Edge purge...' });

    const itemsArray = inputValue
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      purge_type: purgeType,
      hostname: purgeType === 'hostname' ? itemsArray[0] : '',
      cp_code: purgeType === 'cpcode' ? itemsArray[0] : '',
      network,
      method,
      objects: itemsArray,
    };

    try {
      const response = await fetch('/.netlify/functions/triggerPurge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: `Purge dispatched successfully for ${itemsArray.length} object(s).`,
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Access denied or invalid Akamai credentials.',
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `Security Gateway Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Security Mesh Animation */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] animate-pulse"></div>

      {/* Security Glowing Shield / Radar Backdrop */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-ping pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-cyan-950/50">
        
        {/* Animated Security Icon & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 mb-4 animate-bounce">
            {/* Lock/Shield Animated SVG Icon */}
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Akamai Cache Purge
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Single-Account Security Portal
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setPurgeType('hostname'); setInputValue(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              purgeType === 'hostname'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Purge by Hostname
          </button>
          <button
            type="button"
            onClick={() => { setPurgeType('cpcode'); setInputValue(''); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              purgeType === 'cpcode'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Purge by CP Code
          </button>
        </div>

        {/* Purge Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Dynamic Single Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider font-mono">
              {purgeType === 'hostname' ? 'Hostname / Target URLs' : 'Akamai CP Code(s)'}
            </label>
            <div className="relative">
              <textarea
                required
                rows={purgeType === 'hostname' ? 3 : 1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  purgeType === 'hostname'
                    ? 'e.g. www.example.com/assets/app.js, /css/style.css'
                    : 'e.g. 123456, 789012'
                }
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono resize-none"
              />
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Network</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Purge Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="invalidate">Invalidate</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-xl p-0.5 font-semibold text-sm transition-all duration-300 disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 rounded-xl group-hover:opacity-100 transition-opacity"></span>
            <div className="relative px-6 py-3 bg-slate-900 rounded-[10px] transition-all group-hover:bg-transparent flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span className="text-cyan-300 font-mono">Executing Edge Task...</span>
                </>
              ) : (
                <span className="text-cyan-300 group-hover:text-white transition-colors">
                  Authorize & Dispatch Purge
                </span>
              )}
            </div>
          </button>
        </form>

        {/* Animated Status Feed */}
        {status && (
          <div
            className={`mt-6 p-4 rounded-xl border text-xs font-mono transition-all duration-500 flex items-start space-x-3 ${
              status.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : status.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <div className="mt-0.5">
              {status.type === 'success' && '✓'}
              {status.type === 'error' && '✕'}
              {status.type === 'info' && 'ℹ'}
            </div>
            <div>{status.message}</div>
          </div>
        )}

      </div>
    </div>
  );
}
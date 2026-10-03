import React, { useState } from 'react';

const CRON_PRESETS = [
  { label: 'Every 15 Min', exp: '*/15 * * * *' },
  { label: 'Hourly', exp: '0 * * * *' },
  { label: 'Daily (Midnight)', exp: '0 0 * * *' },
  { label: 'Daily (08:00 AM)', exp: '0 8 * * *' },
  { label: 'Weekly (Mon 06:00)', exp: '0 6 * * 1' },
];

const DIRECTORS = ['CHARLIE', 'JACK', 'TESS', 'SKYLA', 'ROXY', 'VANCE', 'SILAS'];

export default function NewCronModal({ isOpen, onClose, projectName, onSaveCron }) {
  const [formData, setFormData] = useState({
    title: '',
    director: 'JACK',
    cadence: 'Daily (08:00 AM)',
    cronExpression: '0 8 * * *',
    targetCommand: '',
    guardrail: 'Halt and alert Monty on Base 1 if 2 failures occur.'
  });

  if (!isOpen) return null;

  const handleCadenceSelect = (preset) => {
    setFormData({
      ...formData,
      cadence: preset.label,
      cronExpression: preset.exp
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter a cron job designation.');
      return;
    }
    onSaveCron({
      id: `CRON-${Date.now().toString().slice(-4)}`,
      ...formData,
      status: 'RUNNING',
      lastRun: 'Never',
      nextRun: 'Calculated by Daemon'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 10, 12, 0.90)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: 'monospace'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '640px',
        backgroundColor: '#0d0f12',
        border: '1px solid #1f242d',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(255, 184, 0, 0.12)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #1f242d',
          backgroundColor: '#14171c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>
              [ ATTACH CRON DAEMON // {projectName} ]
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '16px'
            }}>✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Job Title */}
          <div>
            <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Cron Designation & Intent
            </label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })} 
              placeholder="e.g., NIGHTLY TELEMETRY LEDGER RECONCILIATION"
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                padding: '9px 10px',
                color: '#fff',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Director & Cadence Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Executing Director
              </label>
              <select
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  padding: '9px 10px',
                  color: '#ffb800',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                {DIRECTORS.map(d => (
                  <option key={d} value={d}>⚡ {d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Cron Schedule Format
              </label>
              <input 
                type="text" 
                value={formData.cronExpression} 
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })} 
                placeholder="e.g., 0 8 * * *"
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  padding: '9px 10px',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div>
            <label style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Quick Cadence Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {CRON_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handleCadenceSelect(p)}
                  style={{
                    backgroundColor: formData.cronExpression === p.exp ? 'rgba(255, 184, 0, 0.2)' : '#080a0c',
                    border: formData.cronExpression === p.exp ? '1px solid #ffb800' : '1px solid #1f242d',
                    color: formData.cronExpression === p.exp ? '#ffb800' : '#94a3b8',
                    fontSize: '10px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Script / Command */}
          <div>
            <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Target Script / Webhook Endpoint
            </label>
            <input 
              type="text" 
              value={formData.targetCommand} 
              onChange={(e) => setFormData({ ...formData, targetCommand: e.target.value })} 
              placeholder="e.g., node scripts/audit_reconciliation.js"
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                padding: '9px 10px',
                color: '#10b981',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Guardrails */}
          <div>
            <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Failure / Guardrail Policy
            </label>
            <input 
              type="text" 
              value={formData.guardrail} 
              onChange={(e) => setFormData({ ...formData, guardrail: e.target.value })} 
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                padding: '9px 10px',
                color: '#94a3b8',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #1f242d',
                color: '#94a3b8',
                padding: '8px 16px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}>
              CANCEL
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#ffb800',
                border: 'none',
                color: '#080a0c',
                fontWeight: 'bold',
                padding: '8px 18px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}>
              REGISTER CRON DAEMON ⏱️️
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import './Tab09Previews.css';

export default function Tab09Previews({ ws }) {
    const [previewMode, setPreviewMode] = useState('ALL');

    return (
        <div className="view-section tab-09-container">
            {/* HEADER */}
            <div className="previews-header">
                <div className="previews-title-group">
                    <h2>09 PREVIEWS // COMPONENT & ASSET STAGING DECK</h2>
                    <p>Live design system staging &bull; Glass telemetry, micro-widgets &amp; UI tokens</p>
                </div>

                <div className="previews-mode-strip">
                    {['ALL', 'BUTTONS', 'BADGES', 'TELEMETRY'].map(mode => (
                        <button
                            key={mode}
                            className={`preview-mode-btn ${previewMode === mode ? 'active' : ''}`}
                            onClick={() => setPreviewMode(mode)}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* STAGING GRID */}
            <div className="previews-grid">
                {/* BUTTONS & ACTIONS STAGE */}
                {(previewMode === 'ALL' || previewMode === 'BUTTONS') && (
                    <div className="stage-card">
                        <div className="stage-card-title">
                            <span>BUTTON STATES &amp; TRIGGERS</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>HIGH FINANCE</span>
                        </div>
                        <div className="preview-sample-box">
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)', fontFamily: 'monospace' }}>INTERACTIVE BUTTONS</span>
                            <div className="preview-button-row">
                                <button className="btn-sample-primary">PRIMARY EXEC</button>
                                <button className="btn-sample-success">CONFIRM DISPATCH</button>
                                <button className="btn-sample-danger">TERMINATE CAP</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BADGES & TELEMETRY PILLS */}
                {(previewMode === 'ALL' || previewMode === 'BADGES') && (
                    <div className="stage-card">
                        <div className="stage-card-title">
                            <span>STATUS PILLS &amp; BADGES</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>SYSTEM LABELS</span>
                        </div>
                        <div className="preview-sample-box">
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)', fontFamily: 'monospace' }}>TELEMETRY STATUS PILLS</span>
                            <div className="preview-badge-row">
                                <span className="badge-pill badge-gold">GOLD CORE</span>
                                <span className="badge-pill badge-emerald">ACTIVE (BASE 1)</span>
                                <span className="badge-pill badge-ruby">STANDBY / HALT</span>
                                <span className="badge-pill badge-gold">FOUNDER PASS</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TELEMETRY METRIC CARDS */}
                {(previewMode === 'ALL' || previewMode === 'TELEMETRY') && (
                    <div className="stage-card">
                        <div className="stage-card-title">
                            <span>DATA FEED &amp; METRIC CARDS</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>QUANT DISPLAY</span>
                        </div>
                        <div className="preview-sample-box">
                            <div className="metric-mock">
                                <span className="metric-mock-label">TESS VOLATILITY SCAN</span>
                                <span className="metric-mock-val">0.842 ATR</span>
                            </div>
                            <div className="metric-mock">
                                <span className="metric-mock-label">BASE 1 TELEMETRY</span>
                                <span className="metric-mock-val" style={{ color: '#00FF66' }}>CONNECTED</span>
                            </div>
                            <div className="metric-mock">
                                <span className="metric-mock-label">TOKEN CONSUMPTION</span>
                                <span className="metric-mock-val">142.6k / 250k</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import './Tab10Tokens.css';

export default function Tab10Tokens({ ws }) {
    const [providers, setProviders] = useState({
        openrouter: { balance: 'FETCHING...', spent30d: '--', status: 'SYNCING' },
        groq: { balance: 'FETCHING...', spent30d: '--', status: 'SYNCING' },
        nvidia: { balance: 'DEV TIER', spent30d: '--', status: 'ACTIVE' },
        gemini: { balance: 'PAYG', spent30d: '--', status: 'ACTIVE' }
    });

    const [attribution, setAttribution] = useState([]);
    const [summary, setSummary] = useState({ totalBalance: '$0.00', totalBurn: '$0.00', hardCap: '$50.00' });

    // 1. Direct OpenRouter Balance Fetch if API key exists in environment
    const fetchOpenRouterCredits = async () => {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) {
            setProviders(prev => ({
                ...prev,
                openrouter: { balance: 'SET API KEY', spent30d: '--', status: 'NO_KEY' }
            }));
            return;
        }

        try {
            const res = await fetch('https://openrouter.ai/api/v1/credits', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data && data.data) {
                const totalCredits = data.data.total_credits || 0;
                const totalUsage = data.data.total_usage || 0;
                const remaining = Math.max(0, totalCredits - totalUsage);

                setProviders(prev => ({
                    ...prev,
                    openrouter: {
                        balance: `$${remaining.toFixed(2)}`,
                        spent30d: `$${totalUsage.toFixed(2)}`,
                        status: 'LIVE'
                    }
                }));

                setSummary(prev => ({
                    ...prev,
                    totalBalance: `$${remaining.toFixed(2)}`,
                    totalBurn: `$${totalUsage.toFixed(2)}`
                }));
            }
        } catch (err) {
            console.error('[OPENROUTER API ERROR]', err);
            setProviders(prev => ({
                ...prev,
                openrouter: { balance: 'API ERROR', spent30d: '--', status: 'ERROR' }
            }));
        }
    };

    // 2. Consume Base 1 WebSocket Telemetry if live daemon sends TOKEN_SYNC
    useEffect(() => {
        fetchOpenRouterCredits();

        if (!ws) return;

        const handleMessage = (evt) => {
            try {
                const payload = JSON.parse(evt.data);
                if (payload.type === 'TOKEN_TELEMETRY') {
                    if (payload.providers) setProviders(payload.providers);
                    if (payload.attribution) setAttribution(payload.attribution);
                    if (payload.summary) setSummary(payload.summary);
                }
            } catch (err) {
                // Ignore non-json daemon traffic
            }
        };

        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws]);

    return (
        <div className="view-section tab-10-container">
            {/* HEADER */}
            <div className="tokens-header">
                <div className="tokens-title-group">
                    <h2>10 TOKENS // INFERENCE TELEMETRY &amp; COST ATTRIBUTION</h2>
                    <p>Live gateway sync &bull; Heavy-lifting cost analysis &bull; Base 1 Telemetry</p>
                </div>

                <div className="tokens-summary-pills">
                    <div className="token-stat-pill">
                        <span className="lbl">OPENROUTER BAL:</span>
                        <span className="val" style={{ color: '#00FF66' }}>{providers.openrouter.balance}</span>
                    </div>
                    <div className="token-stat-pill">
                        <span className="lbl">30-DAY BURN:</span>
                        <span className="val">{summary.totalBurn}</span>
                    </div>
                    <div className="token-stat-pill">
                        <span className="lbl">MONTHLY HARD CAP:</span>
                        <span className="val">{summary.hardCap}</span>
                    </div>
                </div>
            </div>

            {/* 4 CORE PROVIDER CARDS */}
            <div className="provider-deck">
                {/* OPENROUTER */}
                <div className="provider-card primary">
                    <div className="provider-top">
                        <span className="provider-name">OPENROUTER</span>
                        <span className="provider-badge" style={{ 
                            background: 'rgba(255, 184, 0, 0.15)', 
                            color: 'var(--gold-core)', 
                            border: '1px solid rgba(255, 184, 0, 0.3)' 
                        }}>
                            {providers.openrouter.status}
                        </span>
                    </div>
                    <div className="provider-balance-row">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mist)' }}>BALANCE / TIER:</span>
                        <span className="big-balance">{providers.openrouter.balance}</span>
                    </div>
                    <div className="provider-details">
                        <div className="detail-line">
                            <span>Total Usage Burn:</span>
                            <span className="val">{providers.openrouter.spent30d}</span>
                        </div>
                        <div className="detail-line">
                            <span>Core Engine:</span>
                            <span className="val" style={{ fontSize: '0.7rem' }}>Claude 3.5 / Qwen 2.5 / R1</span>
                        </div>
                        <div className="detail-line">
                            <span>Rate Profile:</span>
                            <span className="val" style={{ color: 'var(--gold-core)' }}>Dynamic / Pay-per-Token</span>
                        </div>
                    </div>
                </div>

                {/* GROQ */}
                <div className="provider-card">
                    <div className="provider-top">
                        <span className="provider-name">GROQ LPU</span>
                        <span className="provider-badge" style={{ 
                            background: 'rgba(0, 255, 102, 0.15)', 
                            color: '#00FF66', 
                            border: '1px solid rgba(0, 255, 102, 0.3)' 
                        }}>
                            HIGH VELOCITY
                        </span>
                    </div>
                    <div className="provider-balance-row">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mist)' }}>BALANCE / TIER:</span>
                        <span className="big-balance">{providers.groq.balance}</span>
                    </div>
                    <div className="provider-details">
                        <div className="detail-line">
                            <span>30-Day Burn:</span>
                            <span className="val">{providers.groq.spent30d}</span>
                        </div>
                        <div className="detail-line">
                            <span>Core Engine:</span>
                            <span className="val" style={{ fontSize: '0.7rem' }}>Llama 3.3 70B Versatile</span>
                        </div>
                        <div className="detail-line">
                            <span>Rate Profile:</span>
                            <span className="val" style={{ color: 'var(--gold-core)' }}>Ultra-Cheap / Routing</span>
                        </div>
                    </div>
                </div>

                {/* NVIDIA NIM */}
                <div className="provider-card">
                    <div className="provider-top">
                        <span className="provider-name">NVIDIA NIM</span>
                        <span className="provider-badge" style={{ 
                            background: 'rgba(0, 255, 102, 0.15)', 
                            color: '#00FF66', 
                            border: '1px solid rgba(0, 255, 102, 0.3)' 
                        }}>
                            MICROSERVICES
                        </span>
                    </div>
                    <div className="provider-balance-row">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mist)' }}>BALANCE / TIER:</span>
                        <span className="big-balance">{providers.nvidia.balance}</span>
                    </div>
                    <div className="provider-details">
                        <div className="detail-line">
                            <span>Usage Tier:</span>
                            <span className="val">Developer API Active</span>
                        </div>
                        <div className="detail-line">
                            <span>Core Engine:</span>
                            <span className="val" style={{ fontSize: '0.7rem' }}>DeepSeek-R1 / Nemotron</span>
                        </div>
                        <div className="detail-line">
                            <span>Rate Profile:</span>
                            <span className="val" style={{ color: 'var(--gold-core)' }}>Free Quota Tier</span>
                        </div>
                    </div>
                </div>

                {/* GEMINI */}
                <div className="provider-card">
                    <div className="provider-top">
                        <span className="provider-name">GOOGLE GEMINI</span>
                        <span className="provider-badge" style={{ 
                            background: 'rgba(255, 184, 0, 0.15)', 
                            color: 'var(--gold-core)', 
                            border: '1px solid rgba(255, 184, 0, 0.3)' 
                        }}>
                            HIGH CONTEXT
                        </span>
                    </div>
                    <div className="provider-balance-row">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mist)' }}>BALANCE / TIER:</span>
                        <span className="big-balance">{providers.gemini.balance}</span>
                    </div>
                    <div className="provider-details">
                        <div className="detail-line">
                            <span>30-Day Ingestion:</span>
                            <span className="val">{providers.gemini.spent30d}</span>
                        </div>
                        <div className="detail-line">
                            <span>Core Engine:</span>
                            <span className="val" style={{ fontSize: '0.7rem' }}>Gemini 1.5 Pro / Flash</span>
                        </div>
                        <div className="detail-line">
                            <span>Rate Profile:</span>
                            <span className="val" style={{ color: 'var(--gold-core)' }}>Direct Cloud Invoicing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATTRIBUTION SECTION */}
            <div className="tokens-lower-grid">
                <div className="tokens-card">
                    <div className="card-title-bar">
                        <span>AGENT COST ATTRIBUTION // ACTIVE EXECUTION</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>BASE 1 DISPATCH</span>
                    </div>

                    {attribution.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-mist)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Awaiting agent execution telemetry from Base 1 WebSocket daemon (Port 8081)...
                        </div>
                    ) : (
                        <table className="attribution-table">
                            <thead>
                                <tr>
                                    <th>DIRECTOR AGENT</th>
                                    <th>ROLE / TASK</th>
                                    <th>PRIMARY ENGINE</th>
                                    <th>PROVIDER</th>
                                    <th>COST TIER</th>
                                    <th style={{ textAlign: 'right' }}>EST. BURN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attribution.map((row, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{row.agent}</td>
                                        <td style={{ color: 'var(--text-mist)' }}>{row.task}</td>
                                        <td>{row.engine}</td>
                                        <td style={{ color: 'var(--gold-core)' }}>{row.provider}</td>
                                        <td>
                                            <span className={row.tier === 'HEAVY' ? 'tag-heavy' : 'tag-lite'}>
                                                {row.tier}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: row.tier === 'HEAVY' ? '#FFB800' : '#00FF66' }}>
                                            {row.burn}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="tokens-card">
                    <div className="card-title-bar">
                        <span>ENGINE ROUTING GUARDRAILS</span>
                        <span style={{ fontSize: '0.7rem', color: '#00FF66' }}>VANCE ENFORCED</span>
                    </div>

                    <div className="guardrail-list">
                        <div className="guardrail-item">
                            <div className="gh-top">
                                <span>CHEAP FAST FALLBACK</span>
                                <span style={{ color: '#00FF66' }}>ACTIVE</span>
                            </div>
                            <p>Routing agent handshakes, short tool routing, and heartbeat formatting to Groq (Llama 3.3).</p>
                        </div>

                        <div className="guardrail-item">
                            <div className="gh-top">
                                <span>HEAVY LIFTING ISOLATION</span>
                                <span style={{ color: 'var(--gold-core)' }}>STANDBY</span>
                            </div>
                            <p>Full-file coding transformations (Charlie) and heavy reasoning passes (Orion) require explicit triggers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
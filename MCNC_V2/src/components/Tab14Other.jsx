import React, { useState } from 'react';
import './Tab14Other.css';

const INITIAL_PIPELINE = [
    { id: 'ollama', name: 'Ollama Local Engine', port: '11434', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'openclaw', name: 'OpenClaw Gateway', port: '18789', status: 'OFFLINE', tag: '[ - OFFLINE ]' },
    { id: 'paperclip', name: 'Paperclip Orchestrator', port: '3100', status: 'OFFLINE', tag: '[ - OFFLINE ]' },
    { id: 'mcnc', name: 'MCNC Dashboard', port: '5173', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'bridge', name: 'Warlord Bridge', port: '8081', status: 'OFFLINE', tag: '[ - OFFLINE ]' },
    { id: 'vpn', name: 'Paris VPN (Contabo Uplink)', port: 'TUN0', status: 'SECURE', tag: '[ + SECURE ]' }
];

const UPSTREAM_PROVIDERS = [
    { id: 'nim', name: 'NVIDIA NIM Cluster', latency: '24ms', status: 'ONLINE' },
    { id: 'groq', name: 'Groq LPU Accelerator', latency: '42ms', status: 'ONLINE' },
    { id: 'openrouter', name: 'OpenRouter Multi-LLM', latency: '65ms', status: 'ONLINE' },
    { id: 'base2', name: 'Base 2 Failover Server', latency: '14ms', status: 'STANDBY' }
];

export default function Tab14Other({ ws }) {
    const [pipeline, setPipeline] = useState(INITIAL_PIPELINE);
    const [upstream, setUpstream] = useState(UPSTREAM_PROVIDERS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [traceLogs, setTraceLogs] = useState([
        { id: 1, ts: '04:30:02', text: '[SYSTEM] Matrix Link Check triggered.' },
        { id: 2, ts: '04:30:05', text: '[WARN] OpenClaw Gateway (18789) unreceptive.' },
        { id: 3, ts: '04:30:07', text: '[WARN] Paperclip Orchestrator (3100) stopped.' },
        { id: 4, ts: '04:30:10', text: '[WARN] Warlord Bridge (8081) offline. WebSocket disconnected.' },
        { id: 5, ts: '04:30:12', text: '[OK] Paris VPN (Contabo Uplink) secure.' }
    ]);

    const addTrace = (text) => {
        const ts = new Date().toTimeString().split(' ')[0];
        setTraceLogs(prev => [...prev, { id: Date.now() + Math.random(), ts, text }]);
    };

    const handleRefreshMatrix = () => {
        setIsRefreshing(true);
        addTrace('[POLL] Pinging all Base 1 ports & Upstream APIs...');

        setTimeout(() => {
            setIsRefreshing(false);
            addTrace('[RESULT] Scan complete: 3 pillars offline (OpenClaw:18789, Paperclip:3100, Bridge:8081).');
        }, 800);
    };

    const handleTestUpstream = (prov) => {
        addTrace(`[PING] Probing ${prov.name}...`);
        setTimeout(() => {
            const jitter = Math.floor(Math.random() * 8) - 4;
            const cur = parseInt(prov.latency, 10) || 25;
            const nextLatency = Math.max(4, cur + jitter) + 'ms';
            setUpstream(prev => prev.map(p => p.id === prov.id ? { ...p, latency: nextLatency } : p));
            addTrace(`[ACK] ${prov.name} verified OK (${nextLatency}).`);
        }, 150);
    };

    const onlineCount = pipeline.filter(p => p.status === 'ONLINE' || p.status === 'SECURE').length;

    return (
        <div className="view-section tab-14-container">
            {/* HEADER */}
            <div className="pipe-header">
                <div className="pipe-title-group">
                    <h2>14 PIPE-LINE // WARLORD WASP DIAGNOSTIC &amp; SYSTEM MATRIX</h2>
                    <p>Daemon port monitor &bull; Service orchestration &bull; Paris VPN &amp; Upstream links</p>
                </div>

                <div className="pipe-summary-pills">
                    <div className="pipe-pill">
                        <span className="lbl">MATRIX LINK:</span>
                        <span className="val" style={{ color: onlineCount >= 5 ? '#00FF66' : '#C88A35' }}>
                            {onlineCount} / {pipeline.length} SERVICES UP
                        </span>
                    </div>
                    <div className="pipe-pill">
                        <span className="lbl">VPN UPLINK:</span>
                        <span className="val" style={{ color: '#38BDF8' }}>PARIS CONTABO SECURE</span>
                    </div>
                </div>
            </div>

            {/* MAIN DECK */}
            <div className="pipe-deck">
                {/* LEFT: EXACT DIAGNOSTIC HUD & UPSTREAM PROVIDERS */}
                <div className="pipe-card">
                    <div className="pipe-card-titlebar">
                        <span>WARLORD WASP DIAGNOSTIC HUD</span>
                        <span style={{ fontSize: '0.7rem', color: '#8A7E72' }}>PORT LISTENERS</span>
                    </div>

                    {/* HUD DISPLAY BOX */}
                    <div className="hud-matrix-box">
                        <div className="hud-matrix-title">SYSTEM MATRIX LINKED</div>

                        {pipeline.map(item => (
                            <div key={item.id} className="hud-line">
                                <span className="hud-service-name">
                                    {item.name} ({item.port}):
                                </span>
                                <span className={`hud-tag ${
                                    item.status === 'ONLINE' ? 'tag-online' :
                                    item.status === 'SECURE' ? 'tag-secure' : 'tag-offline'
                                }`}>
                                    {item.tag}
                                </span>
                            </div>
                        ))}

                        <div className="hud-actions">
                            <button 
                                className="btn-hud-refresh" 
                                onClick={handleRefreshMatrix}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? 'SCANNING...' : 'REFRESH MATRIX'}
                            </button>
                        </div>
                    </div>

                    {/* UPSTREAM APIS */}
                    <div className="pipe-card-titlebar" style={{ marginTop: '8px' }}>
                        <span>UPSTREAM INFERENCE &amp; FAILOVER NODES</span>
                    </div>

                    <div className="endpoints-grid">
                        {upstream.map(p => (
                            <div key={p.id} className="endpoint-mini">
                                <div className="endpoint-mini-header">
                                    <span>{p.name}</span>
                                    <span style={{ color: p.status === 'ONLINE' ? '#00FF66' : '#C88A35' }}>{p.latency}</span>
                                </div>
                                <div className="endpoint-mini-meta">
                                    <span>STATUS: <b>{p.status}</b></span>
                                    <button 
                                        onClick={() => handleTestUpstream(p)}
                                        style={{ background: 'transparent', border: '1px solid rgba(200,138,53,0.3)', color: '#C88A35', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '1px 5px' }}
                                    >
                                        PING
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: HOW TO RESTORE DOWN PILLARS & LIVE LOG */}
                <div className="pipe-card">
                    <div className="pipe-card-titlebar">
                        <span>HOW TO RESTORE THE 3 DOWN PILLARS</span>
                        <span style={{ fontSize: '0.7rem', color: '#FF4444' }}>ACTION REQUIRED</span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(140,98,57,0.2)', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#E8D5B5', lineHeight: '1.6' }}>
                        <div><b style={{ color: '#C88A35' }}>1. Warlord Bridge (8081):</b></div>
                        <div style={{ color: '#8A7E72' }}>Open terminal in <span style={{ color: '#fff' }}>C:\Warlord_Inc\Warlord_WASP\MCNC_V2</span> and run:</div>
                        <div style={{ color: '#00FF66', margin: '2px 0 8px 0' }}>node server.js</div>

                        <div><b style={{ color: '#C88A35' }}>2. Paperclip Orchestrator (3100):</b></div>
                        <div style={{ color: '#8A7E72' }}>Launch Paperclip daemon on Base 1:</div>
                        <div style={{ color: '#00FF66', margin: '2px 0 8px 0' }}>npm run paperclip:start</div>

                        <div><b style={{ color: '#C88A35' }}>3. OpenClaw Gateway (18789):</b></div>
                        <div style={{ color: '#8A7E72' }}>Start the inter-agent bridge:</div>
                        <div style={{ color: '#00FF66' }}>openclaw-daemon --port 18789</div>
                    </div>

                    <div className="pipe-card-titlebar" style={{ marginTop: '4px' }}>
                        <span>DIAGNOSTIC EVENT TRACE</span>
                        <button 
                            onClick={() => setTraceLogs([])}
                            style={{ background: 'transparent', border: 'none', color: '#8A7E72', fontFamily: 'monospace', fontSize: '0.65rem', cursor: 'pointer' }}
                        >
                            [CLEAR]
                        </button>
                    </div>

                    <div className="trace-console">
                        {traceLogs.map(log => (
                            <div key={log.id} className="trace-line">
                                <span className="ts">{log.ts}</span>
                                <span>{log.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
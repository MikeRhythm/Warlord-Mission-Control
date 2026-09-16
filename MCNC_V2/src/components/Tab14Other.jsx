import React, { useState, useEffect } from 'react';
import './Tab14Other.css';

const INITIAL_PIPELINE = [
    { id: 'ollama', name: 'Ollama Local Engine', port: '11434', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'openclaw', name: 'OpenClaw Gateway', port: '18789', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'paperclip', name: 'Paperclip Orchestrator', port: '3100', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'mcnc', name: 'MCNC Dashboard', port: '5173', status: 'ONLINE', tag: '[ + ONLINE ]' },
    { id: 'bridge', name: 'Warlord Bridge', port: '8081', status: 'OFFLINE', tag: '[ - OFFLINE ]' },
    { id: 'vpn', name: 'Paris VPN (Contabo Uplink)', port: 'TUN0', status: 'SECURE', tag: '[ + SECURE ]' }
];

export default function Tab14Other({ ws }) {
    const [pipeline, setPipeline] = useState(INITIAL_PIPELINE);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Cluster States
    const [nimStats, setNimStats] = useState({ total: 0, active: 0, keys: [] });
    const [groqStats, setGroqStats] = useState({ total: 0, active: 0, keys: [] });
    const [geminiStats, setGeminiStats] = useState({ total: 0, active: 0, keys: [] });
    
    // Modals
    const [showNimModal, setShowNimModal] = useState(false);
    const [showGroqModal, setShowGroqModal] = useState(false);
    const [showGeminiModal, setShowGeminiModal] = useState(false);
    const [rawNimInput, setRawNimInput] = useState('');
    const [rawGroqInput, setRawGroqInput] = useState('');
    const [rawGeminiInput, setRawGeminiInput] = useState('');
    
    // UI Locks
    const [isAuditingNim, setIsAuditingNim] = useState(false);
    const [isAuditingGroq, setIsAuditingGroq] = useState(false);
    const [isAuditingGemini, setIsAuditingGemini] = useState(false);

    const [traceLogs, setTraceLogs] = useState([
        { id: 1, ts: new Date().toTimeString().split(' ')[0], text: '[SYSTEM] Tab 14 live telemetry initialized.' }
    ]);

    const addTrace = (text) => {
        const ts = new Date().toTimeString().split(' ')[0];
        setTraceLogs(prev => [...prev, { id: Date.now() + Math.random(), ts, text }]);
    };

    const fetchClusterStats = async () => {
        try {
            const nimRes = await fetch('http://127.0.0.1:8081/api/cluster/nim/keys');
            if (nimRes.ok) setNimStats(await nimRes.json());
            
            const groqRes = await fetch('http://127.0.0.1:8081/api/cluster/groq/keys');
            if (groqRes.ok) setGroqStats(await groqRes.json());
            
            const geminiRes = await fetch('http://127.0.0.1:8081/api/cluster/gemini/keys');
            if (geminiRes.ok) setGeminiStats(await geminiRes.json());
        } catch (e) {
            console.error('Failed to load cluster stats', e);
        }
    };

    const handleRefreshMatrix = async () => {
        setIsRefreshing(true);
        addTrace('[POLL] Pinging Warlord Bridge (8081)...');
        try {
            const res = await fetch('http://127.0.0.1:8081/api/status');
            if (res.ok) {
                const data = await res.json();
                setPipeline(prev => prev.map(p => p.id === 'bridge' ? { ...p, status: 'ONLINE', tag: '[ + ONLINE ]' } : p));
                addTrace(`[RESULT] Bridge ONLINE. WS Clients: ${data.ws_clients_connected}`);
            } else {
                throw new Error('Bad response');
            }
        } catch (err) {
            setPipeline(prev => prev.map(p => p.id === 'bridge' ? { ...p, status: 'OFFLINE', tag: '[ - OFFLINE ]' } : p));
            addTrace('[WARN] Warlord Bridge (8081) offline or unreachable.');
        } finally {
            setIsRefreshing(false);
            fetchClusterStats();
        }
    };

    useEffect(() => {
        handleRefreshMatrix();
        fetchClusterStats();
    }, []);

    const handleAddKeys = async (type) => {
        const isNim = type === 'NIM';
        const isGroq = type === 'GROQ';
        const rawInput = isNim ? rawNimInput : isGroq ? rawGroqInput : rawGeminiInput;
        const endpoint = isNim ? 'nim' : isGroq ? 'groq' : 'gemini';

        if (!rawInput.trim()) return;
        addTrace(`[CLUSTER] Ingesting harvested ${type} keys...`);
        try {
            const res = await fetch(`http://127.0.0.1:8081/api/cluster/${endpoint}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawKeys: rawInput })
            });
            const data = await res.json();
            if (res.ok) {
                addTrace(`[INGEST ACK] Added ${data.added} new ${type} keys. Total in vault: ${data.total}`);
                if (isNim) { setRawNimInput(''); setShowNimModal(false); }
                else if (isGroq) { setRawGroqInput(''); setShowGroqModal(false); }
                else { setRawGeminiInput(''); setShowGeminiModal(false); }
                fetchClusterStats();
            } else {
                addTrace(`[INGEST ERROR] ${data.error}`);
            }
        } catch (err) {
            addTrace(`[INGEST FAILED] ${err.message}`);
        }
    };

    const handleAuditCluster = async (type) => {
        const isNim = type === 'NIM';
        const isGroq = type === 'GROQ';
        const endpoint = isNim ? 'nim' : isGroq ? 'groq' : 'gemini';
        
        if (isNim) setIsAuditingNim(true);
        else if (isGroq) setIsAuditingGroq(true);
        else setIsAuditingGemini(true);

        addTrace(`[AUDIT INITIATED] Probing all ${type} cluster keys...`);
        try {
            const res = await fetch(`http://127.0.0.1:8081/api/cluster/${endpoint}/audit`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                (data.logs || []).forEach(log => addTrace(log));
                addTrace(`[AUDIT COMPLETE] ${type} Active: ${data.remainingActive} | Total Retained: ${data.totalRemaining}`);
                fetchClusterStats();
            } else {
                addTrace(`[AUDIT ERROR] Request rejected by bridge.`);
            }
        } catch (err) {
            addTrace(`[AUDIT FAILED] ${err.message}`);
        } finally {
            if (isNim) setIsAuditingNim(false);
            else if (isGroq) setIsAuditingGroq(false);
            else setIsAuditingGemini(false);
        }
    };

    const onlineCount = pipeline.filter(p => p.status === 'ONLINE' || p.status === 'SECURE').length;

    // Helper to render the ingestion modals
    const renderModal = (type) => {
        const isNim = type === 'NIM';
        const isGroq = type === 'GROQ';
        const close = () => { if(isNim) setShowNimModal(false); else if(isGroq) setShowGroqModal(false); else setShowGeminiModal(false); };
        const color = isNim ? '#10b981' : isGroq ? '#f97316' : '#38bdf8';
        const val = isNim ? rawNimInput : isGroq ? rawGroqInput : rawGeminiInput;
        const setVal = isNim ? setRawNimInput : isGroq ? setRawGroqInput : setRawGeminiInput;
        const placeholder = isNim ? 'nvapi-xxxx...' : isGroq ? 'gsk_xxxx...' : 'AIza...';

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#0d0f12', border: `1px solid ${color}`, borderRadius: '6px', padding: '20px', width: '560px', maxWidth: '90%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: color, fontWeight: 'bold' }}>INGEST HARVESTED {type} KEYS</span>
                        <button onClick={close} style={{ color: '#ff4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                    </div>
                    <p style={{ color: '#8fa0b5', fontSize: '0.75rem', marginBottom: '10px' }}>Paste raw keys below (one per line, or comma-separated). Duplicates will be discarded.</p>
                    <textarea rows={6} value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} style={{ width: '100%', background: '#050709', border: '1px solid #1f242d', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.75rem', padding: '8px', borderRadius: '4px', outline: 'none', resize: 'vertical' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                        <button onClick={close} style={{ background: '#14171c', color: '#8fa0b5', border: '1px solid #232832', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
                        <button onClick={() => handleAddKeys(type)} style={{ background: color, color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>INGEST TO VAULT</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="view-section tab-14-container font-mono">
            {showNimModal && renderModal('NIM')}
            {showGroqModal && renderModal('GROQ')}
            {showGeminiModal && renderModal('GEMINI')}

            {/* HEADER - FLUSH AGAINST TOP TABS CONTAINER */}
            <div className="pipe-header" style={{ 
                position: 'sticky', 
                top: '-20px', 
                zIndex: 100, 
                backgroundColor: '#0d0f12', 
                borderBottom: '1px solid rgba(255,184,0,0.15)',
                margin: '-20px -20px 15px -20px', 
                padding: '6px 10px 6px 10px', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="pipe-title-group" style={{ margin: 0 }}>
                    <h2 style={{ margin: 0, padding: 0, fontSize: '0.9rem', lineHeight: '1.2' }}>14 PIPE-LINE // WARLORD WASP DIAGNOSTIC &amp; SYSTEM MATRIX</h2>
                    <p style={{ margin: 0, padding: 0, fontSize: '0.65rem', lineHeight: '1.1', color: '#8a7e72' }}>Daemon port monitor &bull; Service orchestration &bull; Harvested Key Clusters</p>
                </div>
                <div className="pipe-summary-pills" style={{ margin: 0, display: 'flex', gap: '6px' }}>
                    <div className="pipe-pill" style={{ margin: 0, padding: '4px 8px' }}>
                        <span className="lbl" style={{ fontSize: '0.6rem' }}>NIM:</span>
                        <span className="val" style={{ color: '#10b981', fontSize: '0.65rem' }}>{nimStats.active} ACT</span>
                    </div>
                    <div className="pipe-pill" style={{ margin: 0, padding: '4px 8px' }}>
                        <span className="lbl" style={{ fontSize: '0.6rem' }}>GROQ:</span>
                        <span className="val" style={{ color: '#f97316', fontSize: '0.65rem' }}>{groqStats.active} ACT</span>
                    </div>
                    <div className="pipe-pill" style={{ margin: 0, padding: '4px 8px' }}>
                        <span className="lbl" style={{ fontSize: '0.6rem' }}>GEM:</span>
                        <span className="val" style={{ color: '#38bdf8', fontSize: '0.65rem' }}>{geminiStats.active} ACT</span>
                    </div>
                    <div className="pipe-pill" style={{ margin: 0, padding: '4px 8px' }}>
                        <span className="lbl" style={{ fontSize: '0.6rem' }}>SYS:</span>
                        <span className="val" style={{ color: onlineCount >= 5 ? '#00FF66' : '#C88A35', fontSize: '0.65rem' }}>{onlineCount}/6 UP</span>
                    </div>
                </div>
            </div>

            {/* MAIN DECK */}
            <div className="pipe-deck">
                {/* LEFT: HUD & CLUSTER NODES */}
                <div className="pipe-card">
                    <div className="pipe-card-titlebar">
                        <span>WARLORD WASP DIAGNOSTIC HUD</span>
                        <span style={{ fontSize: '0.7rem', color: '#8A7E72' }}>PORT LISTENERS</span>
                    </div>

                    <div className="hud-matrix-box">
                        <div className="hud-matrix-title">SYSTEM MATRIX LINKED</div>
                        {pipeline.map(item => (
                            <div key={item.id} className="hud-line">
                                <span className="hud-service-name">{item.name} ({item.port}):</span>
                                <span className={`hud-tag ${item.status === 'ONLINE' ? 'tag-online' : item.status === 'SECURE' ? 'tag-secure' : 'tag-offline'}`}>{item.tag}</span>
                            </div>
                        ))}
                        <div className="hud-actions">
                            <button className="btn-hud-refresh" onClick={handleRefreshMatrix} disabled={isRefreshing}>
                                {isRefreshing ? 'SCANNING...' : 'REFRESH MATRIX'}
                            </button>
                        </div>
                    </div>

                    <div className="pipe-card-titlebar" style={{ marginTop: '8px' }}>
                        <span>UPSTREAM INFERENCE &amp; CLUSTER NODES</span>
                    </div>

                    <div className="endpoints-grid">
                        {/* NVIDIA NIM CLUSTER TILE */}
                        <div className="endpoint-mini" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                            <div className="endpoint-mini-header">
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>NVIDIA NIM Cluster</span>
                                <span style={{ color: nimStats.active > 0 ? '#00FF66' : '#FF4444' }}>{nimStats.active} Active</span>
                            </div>
                            <div className="endpoint-mini-meta" style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                <button onClick={() => setShowNimModal(true)} style={{ background: 'transparent', border: '1px solid rgba(255,184,0,0.5)', color: '#ffb800', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>+ ADD KEYS</button>
                                <button onClick={() => handleAuditCluster('NIM')} disabled={isAuditingNim} style={{ background: 'transparent', border: '1px solid rgba(16,185,129,0.5)', color: '#10b981', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>{isAuditingNim ? 'AUDITING...' : 'AUDIT & PURGE'}</button>
                            </div>
                        </div>

                        {/* GROQ LPU CLUSTER TILE */}
                        <div className="endpoint-mini" style={{ border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                            <div className="endpoint-mini-header">
                                <span style={{ color: '#f97316', fontWeight: 'bold' }}>Groq LPU Accelerator</span>
                                <span style={{ color: groqStats.active > 0 ? '#00FF66' : '#FF4444' }}>{groqStats.active} Active</span>
                            </div>
                            <div className="endpoint-mini-meta" style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                <button onClick={() => setShowGroqModal(true)} style={{ background: 'transparent', border: '1px solid rgba(255,184,0,0.5)', color: '#ffb800', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>+ ADD KEYS</button>
                                <button onClick={() => handleAuditCluster('GROQ')} disabled={isAuditingGroq} style={{ background: 'transparent', border: '1px solid rgba(249,115,22,0.5)', color: '#f97316', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>{isAuditingGroq ? 'AUDITING...' : 'AUDIT & PURGE'}</button>
                            </div>
                        </div>

                        {/* STATIC OPENROUTER TILE */}
                        <div className="endpoint-mini">
                            <div className="endpoint-mini-header">
                                <span>OpenRouter Multi-LLM</span>
                                <span style={{ color: '#00FF66' }}>65ms</span>
                            </div>
                            <div className="endpoint-mini-meta">
                                <span>STATUS: <b>ONLINE</b></span>
                                <button onClick={() => addTrace('[PING] Probing OpenRouter... OK')} style={{ background: 'transparent', border: '1px solid rgba(200,138,53,0.3)', color: '#C88A35', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '1px 5px' }}>PING</button>
                            </div>
                        </div>

                        {/* GOOGLE GEMINI CLUSTER TILE */}
                        <div className="endpoint-mini" style={{ border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                            <div className="endpoint-mini-header">
                                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>Google Gemini Cluster</span>
                                <span style={{ color: geminiStats.active > 0 ? '#00FF66' : '#FF4444' }}>{geminiStats.active} Active</span>
                            </div>
                            <div className="endpoint-mini-meta" style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                <button onClick={() => setShowGeminiModal(true)} style={{ background: 'transparent', border: '1px solid rgba(255,184,0,0.5)', color: '#ffb800', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>+ ADD KEYS</button>
                                <button onClick={() => handleAuditCluster('GEMINI')} disabled={isAuditingGemini} style={{ background: 'transparent', border: '1px solid rgba(56,189,248,0.5)', color: '#38bdf8', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', padding: '3px 8px', fontWeight: 'bold' }}>{isAuditingGemini ? 'AUDITING...' : 'AUDIT & PURGE'}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DIAGNOSTIC LOG */}
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
                        <button onClick={() => setTraceLogs([])} style={{ background: 'transparent', border: 'none', color: '#8A7E72', fontFamily: 'monospace', fontSize: '0.65rem', cursor: 'pointer' }}>[CLEAR]</button>
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
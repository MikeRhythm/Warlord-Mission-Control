import React, { useState, useEffect } from 'react';
import './index.css'; 

import Tab01Exec from './components/Tab01Exec'; 
import Tab02WarRoom from './components/Tab02WarRoom';
import Tab03Projects from './components/Tab03Projects';
import Tab04TaskBoard from './components/Tab04TaskBoard'; // Task Board mounted

const TABS = [
    '01 EXEC', '02 WAR ROOM', '03 PROJECTS', '04 TASK BOARD',
    '05 CALENDAR', '06 MEMORY', '07 PAPERCLIP', '08 PALETTES',
    '09 ORG', '10 TOKENS', '11 GALAXY', '12 REVIEW', // Reverted to 11 GALAXY
    '13 DOCS', '14 OTHER'
];

export default function App() {
    const [activeTab, setActiveTab] = useState('02 WAR ROOM');
    const [mcncSocket, setMcncSocket] = useState(null);
    const [wsStatus, setWsStatus] = useState('DISCONNECTED');

    // Initialize Base 1 WebSocket Telemetry Bridge
    useEffect(() => {
        let ws;
        const connectWS = () => {
            ws = new WebSocket('ws://localhost:8081');
            
            ws.onopen = () => {
                setWsStatus('ACTIVE');
                setMcncSocket(ws);
                window.mcncSocket = ws;
            };
            
            ws.onclose = () => {
                setWsStatus('DISCONNECTED');
                setMcncSocket(null);
                window.mcncSocket = null;
                setTimeout(connectWS, 3000); 
            };

            ws.onerror = (err) => {
                console.error('[WS ERROR] Base 1 Daemon offline or port 8081 blocked.');
                ws.close();
            };
        };

        connectWS();

        return () => {
            if (ws) ws.close();
        };
    }, []);

    return (
        <div className="mcnc-master-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--glass-panel, #050608)' }}>
            
            {/* TOP NAVIGATION / BRANDING HEADER */}
            <header className="mcnc-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid var(--border-dim, #2A2D35)', backgroundColor: '#080A0E' }}>
                <div className="brand-title" style={{ color: 'var(--gold-core, #D4AF37)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '1px' }}>
                    WARLORD MISSION CONTROL // MCNC MASTER
                </div>
                <div className="system-status" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--text-mist, #94A3B8)' }}>
                    BRIDGE: <span style={{ color: wsStatus === 'ACTIVE' ? 'var(--emerald-core, #10B981)' : 'var(--orange-red, #FF4500)', fontWeight: 'bold' }}>{wsStatus} (BASE 1)</span> | FRAMEWORK: REACT VITE
                </div>
            </header>

            {/* 14-TAB NAVIGATION BAR */}
            <nav className="tab-navigation" style={{ display: 'flex', gap: '2px', padding: '10px 20px', background: 'rgba(0,0,0,0.8)', overflowX: 'auto', borderBottom: '1px solid var(--border-dim, #2A2D35)' }}>
                {TABS.map(tab => (
                    <button 
                        key={tab} 
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: activeTab === tab ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                            border: '1px solid',
                            borderColor: activeTab === tab ? 'var(--gold-core, #D4AF37)' : 'transparent',
                            color: activeTab === tab ? 'var(--gold-core, #D4AF37)' : 'var(--text-mist, #94A3B8)',
                            padding: '10px 18px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* DYNAMIC TAB MOUNTING AREA (PERSISTENT STATE) */}
            <main className="tab-content-area" style={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
                
                {/* ACTIVE MODULES (Mounted permanently, hidden via CSS when inactive) */}
                <div style={{ display: activeTab === '01 EXEC' ? 'block' : 'none', height: '100%' }}>
                    <Tab01Exec ws={mcncSocket} />
                </div>
                
                <div style={{ display: activeTab === '02 WAR ROOM' ? 'block' : 'none', height: '100%' }}>
                    <Tab02WarRoom ws={mcncSocket} />
                </div>
                
                <div style={{ display: activeTab === '03 PROJECTS' ? 'block' : 'none', height: '100%' }}>
                    <Tab03Projects />
                </div>
                
                <div style={{ display: activeTab === '04 TASK BOARD' ? 'block' : 'none', height: '100%' }}>
                    <Tab04TaskBoard ws={mcncSocket} />
                </div>

                {/* DEFAULT PLACEHOLDER FOR UNMOUNTED TABS */}
                {![
                    '01 EXEC', 
                    '02 WAR ROOM', 
                    '03 PROJECTS',
                    '04 TASK BOARD'
                ].includes(activeTab) && (
                    <div className="placeholder-module" style={{ 
                        padding: '40px', 
                        fontFamily: "'JetBrains Mono', monospace",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            border: '1px solid var(--border-dim, #2A2D35)',
                            background: 'rgba(0,0,0,0.4)',
                            padding: '30px',
                            borderRadius: '4px',
                            maxWidth: '500px'
                        }}>
                            <h3 style={{ color: 'var(--gold-core, #D4AF37)', letterSpacing: '2px', margin: '0 0 15px 0' }}>
                                ACTIVE MODULE: {activeTab}
                            </h3>
                            <p style={{ color: 'var(--text-mist, #94A3B8)', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                                This module is currently offline. Awaiting React JSX conversion from Charlie via Base 1 pipeline.
                            </p>
                            <div style={{ display: 'inline-block', padding: '5px 10px', border: '1px solid var(--orange-red, #FF4500)', color: 'var(--orange-red, #FF4500)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>
                                STATUS: STANDBY
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
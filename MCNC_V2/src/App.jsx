import React, { useState, useEffect } from 'react';
import './index.css'; 
import './high_finance_master.css';
import { initGlobalInterceptor } from './utils/execBus';

import Tab01Exec from './components/Tab01Exec'; 
import Tab02WarRoom from './components/Tab02WarRoom';
import Tab03Projects from './components/Tab03Projects';
import Tab04TaskBoard from './components/Tab04TaskBoard'; 
import Tab05Calendar from './components/Tab05Calendar';
import Tab06Memory from './components/Tab06Memory';
import Tab07Paperclip from './components/Tab07Paperclip';
import Tab08Palettes from './components/Tab08Palettes';
import Tab09Previews from './components/Tab09Previews';
import Tab10Tokens from './components/Tab10Tokens';
import Tab11Galaxy from './components/Tab11Galaxy';
import Tab12Review from './components/Tab12Review';
import Tab13Docs from './components/Tab13Docs';
import Tab14PipeLine from './components/Tab14PipeLine';

// Initialize global network listener once across entire runtime
initGlobalInterceptor();

const TABS = [
  '01 EXEC', '02 WAR ROOM', '03 PROJECTS', '04 TASK BOARD',
  '05 CALENDAR', '06 MEMORY', '07 PAPERCLIP', '08 PALETTES',
  '09 PREVIEWS', '10 TOKENS', '11 GALAXY', '12 REVIEW', 
  '13 DOCS', '14 PIPE-LINE'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('01 EXEC');
  const [mcncSocket, setMcncSocket] = useState(null);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  
  // Universal Background Busy State (Tracks active dispatches without blocking UI)
  const [isSystemBusy, setIsSystemBusy] = useState(false);
  const [busyCount, setBusyCount] = useState(0);

  // Shared state for War Room payload transfers from Tab 01
  const [warRoomPayload, setWarRoomPayload] = useState(null);

  // Listen for Global Busy Events across fetch and agent dispatches
  useEffect(() => {
    const handleBusy = (e) => {
      setIsSystemBusy(Boolean(e.detail?.isBusy));
      setBusyCount(e.detail?.count || 0);
    };

    window.addEventListener('mcnc-busy-state', handleBusy);
    return () => window.removeEventListener('mcnc-busy-state', handleBusy);
  }, []);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    let ws;
    const connectWS = () => {
      ws = new WebSocket('ws://[::1]:8081');
      
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

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Global listener for the "Push to War Room" event dispatched from Tab 01
  useEffect(() => {
    const handleWarRoomPush = (e) => {
      if (e.detail) {
        setWarRoomPayload(e.detail);
        setActiveTab('02 WAR ROOM');
      }
    };

    window.addEventListener('push-to-warroom', handleWarRoomPush);
    return () => {
      window.removeEventListener('push-to-warroom', handleWarRoomPush);
    };
  }, []);

  return (
    <div className="mcnc-glass-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* GLOBAL MASTER HEADER */}
      <header className="mcnc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(6px, 0.6vw, 10px) clamp(10px, 1vw, 16px)', borderBottom: '1px solid var(--wire-border)', backgroundColor: 'rgba(12, 12, 12, 0.85)', flexShrink: 0 }}>
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold-core)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '1px', fontSize: 'var(--fs-title)' }}>
          <span>MISSION CONTROL // MCNC MASTER</span>
        </div>

        <div className="system-status" style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--fs-meta)', color: 'var(--text-mist)' }}>
          {/* NON-BLOCKING TELEMETRY PILL */}
          {isSystemBusy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '2px 8px', borderRadius: '4px', color: '#38bdf8' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', animation: 'pulse 1.5s infinite' }} />
              <span>DISPATCH RUNNING ({busyCount})</span>
            </div>
          )}

          <div>
            BRIDGE: <span style={{ color: wsStatus === 'ACTIVE' ? 'var(--emerald-core)' : 'var(--ruby-core)', fontWeight: 'bold' }}>{wsStatus}</span> | FRAMEWORK: REACT VITE
          </div>
        </div>
      </header>

      {/* AUTO-FITTING 14-TAB NAVIGATION BAR (METAL CHAMPAGNE, PROPORTIONED TO TASK BOARD) */}
      <nav className="tab-navigation" style={{ 
        display: 'flex', 
        alignItems: 'stretch', 
        gap: '1.5px', 
        padding: '3px 4px', 
        background: 'rgba(0, 0, 0, 0.85)', 
        borderBottom: '1px solid var(--wire-border)',
        flexShrink: 0,
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}>
        {TABS.map(tab => {
          const isWarRoomActive = tab === '02 WAR ROOM' && isSystemBusy;
          const isSelected = activeTab === tab;

          return (
            <button 
              key={tab} 
              className={`btn-glass-nav ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: '1 1 0px',
                minWidth: 0,
                height: 'var(--nav-btn-h)',
                color: isSelected ? 'var(--gold-core)' : isWarRoomActive ? '#38bdf8' : '#C5BD9F',
                padding: '0 1px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(0.74rem, 0.82vw, 0.94rem)',
                letterSpacing: '0.01em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textOverflow: 'clip',
                overflow: 'hidden',
                textTransform: 'uppercase',
                fontWeight: isSelected ? '700' : '600',
                textAlign: 'center',
                boxSizing: 'border-box',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'color 0.15s ease, border-color 0.15s ease'
              }}
            >
              {/* NON-BLOCKING SPINNER DOT ON TAB 02 WHEN EXECUTING */}
              {isWarRoomActive && (
                <span 
                  style={{
                    display: 'inline-block',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 6px #38bdf8',
                    animation: 'pulse 1s infinite'
                  }} 
                />
              )}
              <span>{tab}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA: PRESERVES DOM STATE ACROSS ALL 14 TABS */}
      <main className="tab-content-area" style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: activeTab === '01 EXEC' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab01Exec ws={mcncSocket} />
        </div>
        
        <div style={{ display: activeTab === '02 WAR ROOM' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab02WarRoom ws={mcncSocket} initialPayload={warRoomPayload} />
        </div>
        
        <div style={{ display: activeTab === '03 PROJECTS' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab03Projects />
        </div>
        
        <div style={{ display: activeTab === '04 TASK BOARD' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab04TaskBoard ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '05 CALENDAR' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab05Calendar ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '06 MEMORY' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab06Memory ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '07 PAPERCLIP' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab07Paperclip ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '08 PALETTES' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab08Palettes ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '09 PREVIEWS' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab09Previews ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '10 TOKENS' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab10Tokens ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '11 GALAXY' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab11Galaxy ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '12 REVIEW' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab12Review ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '13 DOCS' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab13Docs ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '14 PIPE-LINE' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab14PipeLine ws={mcncSocket} />
        </div>
      </main>
    </div>
  );
}
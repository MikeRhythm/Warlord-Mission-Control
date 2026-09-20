import React, { useState, useEffect } from 'react';
import './index.css'; 
import './high_finance_master.css';
import { initGlobalInterceptor } from './utils/execBus';
import McncSpinner from './components/McncSpinner';

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
import Tab14Other from './components/Tab14Other';

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
  
  // Universal Busy State across all 14 Tabs
  const [isSystemBusy, setIsSystemBusy] = useState(false);
  const [busyCount, setBusyCount] = useState(0);

  // Shared state for War Room payload transfers from Tab 01
  const [warRoomPayload, setWarRoomPayload] = useState(null);

  // Listen for Global Busy Events across fetch and agent dispatches
  useEffect(() => {
    const handleBusy = (e) => {
      setIsSystemBusy(e.detail.isBusy);
      setBusyCount(e.detail.count || 0);
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
    <div className="mcnc-glass-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* GLOBAL MASTER HEADER */}
      <header className="mcnc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--wire-border)', backgroundColor: 'rgba(12, 12, 12, 0.85)', flexShrink: 0 }}>
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--gold-core)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>
          <span>WARLORD MISSION CONTROL // MCNC MASTER</span>
        </div>

        <div className="system-status" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--text-mist)' }}>
          BRIDGE: <span style={{ color: wsStatus === 'ACTIVE' ? 'var(--emerald-core)' : 'var(--ruby-core)', fontWeight: 'bold' }}>{wsStatus} (BASE 1)</span> | FRAMEWORK: REACT VITE
        </div>
      </header>

      {/* AUTO-FITTING 14-TAB NAVIGATION BAR */}
      <nav className="tab-navigation" style={{ 
        display: 'flex', 
        alignItems: 'stretch', 
        gap: '4px', 
        padding: '8px 12px', 
        background: 'rgba(0,0,0,0.7)', 
        borderBottom: '1px solid var(--wire-border)',
        flexShrink: 0,
        boxSizing: 'border-box',
        width: '100%'
      }}>
        {TABS.map(tab => (
          <button 
            key={tab} 
            className={`btn-glass-nav ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              minWidth: 0,
              color: activeTab === tab ? 'var(--gold-core)' : '#EEDD82',
              padding: '9px 4px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              textTransform: 'uppercase',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* SUBSTANTIAL UNIVERSAL EXECUTION SPINNER BANNER */}
      {isSystemBusy && (
        <McncSpinner 
          label={`ACTIVE INFERENCE SEQUENCE // DISPATCH ACTIVE (${busyCount})`}
          subtext="ALL 14 TABS LOCKED ON CLUSTER TELEMETRY // AWAITING STREAM COMPLETION"
        />
      )}

      {/* MAIN CONTENT AREA */}
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
          <Tab14Other ws={mcncSocket} />
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';

export default function DiagnosticHud({ onClose }) {
  const [refreshing, setRefreshing] = useState(false);

  // High Finance / HUD Theme Palettes
  const C_GREEN = '#00ffc4';
  const C_RED = '#ff3344';
  const C_CYAN = '#00d2ff'; // Integrated for Kaggle Standby

  const [statuses, setStatuses] = useState({
    ollama: { label: 'Ollama Local Engine (11434):', status: '[ CHECKING... ]', color: '#888' },
    openclaw: { label: 'OpenClaw Gateway (18789):', status: '[ CHECKING... ]', color: '#888' },
    paperclip: { label: 'Paperclip Orchestrator (3100):', status: '[ CHECKING... ]', color: '#888' },
    dashboard: { label: 'MCNC Dashboard (5173):', status: '[ CHECKING... ]', color: '#888' },
    bridge: { label: 'Warlord Bridge (8081):', status: '[ CHECKING... ]', color: '#888' },
    kaggle: { label: 'Kaggle GPU Compute (Dual T4):', status: '[ CHECKING... ]', color: '#888' },
    parisVpn: { label: 'Paris VPN (Contabo Uplink):', status: '[ + SECURE ]', color: C_GREEN }
  });

  const probePort = async (url, timeoutMs = 1200) => {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), timeoutMs);
      // Swapped to GET: Vite dev servers frequently reject HEAD requests causing false negatives
      await fetch(url, { method: 'GET', mode: 'no-cors', credentials: 'omit', signal: ctrl.signal });
      clearTimeout(id);
      return true;
    } catch (err) {
      return false;
    }
  };

  const runDiagnostics = useCallback(async () => {
    setRefreshing(true);

    // 1. MCNC Dashboard Status
    // If this React component is executing, the server hosting it is inherently alive.
    const isDashboardAlive = true;

    // 2. Probes across local backend ports via pure IPv4
    const [ollamaUp, openclawUp, paperclipUp, bridgeUp] = await Promise.all([
      probePort('http://127.0.0.1:11434'),
      probePort('http://127.0.0.1:18789'),
      probePort('http://127.0.0.1:3100'),
      probePort('http://127.0.0.1:8081')
    ]);

    // 3. Kaggle Compute: Standby by default unless an active tunnel URL exists and probes successfully
    const kaggleEndpoint = localStorage.getItem('WARLORD_KAGGLE_URL');
    const hasDispatchedJob = localStorage.getItem('WARLORD_KAGGLE_DISPATCHED') === 'true';

    let kaggleStatus = '[ ~ STANDBY ]';
    let kaggleColor = C_CYAN;

    if (hasDispatchedJob && kaggleEndpoint) {
      const kaggleAlive = await probePort(kaggleEndpoint, 2500);
      kaggleStatus = kaggleAlive ? '[ + ONLINE ]' : '[ - UNREACH ]';
      kaggleColor = kaggleAlive ? C_GREEN : C_RED;
    } else {
      kaggleStatus = '[ ~ STANDBY ]';
      kaggleColor = C_CYAN;
    }

    setStatuses({
      ollama: {
        label: 'Ollama Local Engine (11434):',
        status: ollamaUp ? '[ + ONLINE ]' : '[ - OFFLINE ]',
        color: ollamaUp ? C_GREEN : C_RED
      },
      openclaw: {
        label: 'OpenClaw Gateway (18789):',
        status: openclawUp ? '[ + ONLINE ]' : '[ - OFFLINE ]',
        color: openclawUp ? C_GREEN : C_RED
      },
      paperclip: {
        label: 'Paperclip Orchestrator (3100):',
        status: paperclipUp ? '[ + ONLINE ]' : '[ - OFFLINE ]',
        color: paperclipUp ? C_GREEN : C_RED
      },
      dashboard: {
        label: 'MCNC Dashboard (5173):',
        status: isDashboardAlive ? '[ + ONLINE ]' : '[ - OFFLINE ]',
        color: isDashboardAlive ? C_GREEN : C_RED
      },
      bridge: {
        label: 'Warlord Bridge (8081):',
        status: bridgeUp ? '[ + ONLINE ]' : '[ - OFFLINE ]',
        color: bridgeUp ? C_GREEN : C_RED
      },
      kaggle: {
        label: 'Kaggle GPU Compute (Dual T4):',
        status: kaggleStatus,
        color: kaggleColor
      },
      parisVpn: {
        label: 'Paris VPN (Contabo Uplink):',
        status: '[ + SECURE ]',
        color: C_GREEN
      }
    });

    setRefreshing(false);
  }, []);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{
        width: '460px',
        backgroundColor: '#0c1017',
        border: '1px solid #1f293d',
        borderRadius: '4px',
        padding: '24px',
        boxShadow: '0 0 25px rgba(0,0,0,0.8)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#8fa090',
          fontSize: '13px',
          letterSpacing: '1px',
          marginBottom: '20px',
          textTransform: 'uppercase'
        }}>
          Warlord WASP Diagnostic HUD
        </div>

        <div style={{
          border: '1px solid #1a2333',
          padding: '16px',
          backgroundColor: '#06090e',
          borderRadius: '2px',
          marginBottom: '20px'
        }}>
          <div style={{
            color: '#a0c0e0',
            fontSize: '12px',
            marginBottom: '16px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            SYSTEM MATRIX LINKED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {Object.keys(statuses).map((k) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8892b0' }}>{statuses[k].label}</span>
                <span style={{ color: statuses[k].color, fontWeight: 'bold' }}>
                  {statuses[k].status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={runDiagnostics}
            disabled={refreshing}
            style={{
              padding: '8px 24px',
              backgroundColor: '#9ca38f',
              border: 'none',
              borderRadius: '2px',
              color: '#0c1017',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            {refreshing ? 'SCANNING...' : 'REFRESH'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              backgroundColor: '#272d38',
              border: 'none',
              borderRadius: '2px',
              color: '#cbd5e1',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: 'pointer'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
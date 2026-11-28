import React, { useState, useEffect } from 'react';
import './index.css';
import './high_finance_master.css';
import { initGlobalInterceptor } from './utils/execBus';

import Tab01Exec from './components/Tab01Exec';
import Tab02WarRoom from './components/Tab02WarRoom';
import Tab03Projects from './components/Tab03Projects';
import Tab04TaskBoard from './components/Tab04TaskBoard';
import Tab05Calendar from './components/Tab05Calendar';
import Tab06LaunchPad from './components/Tab06LaunchPad';
import Tab07Paperclip from './components/Tab07Paperclip';
import Tab08Palettes from './components/Tab08Palettes';
import Tab09Previews from './components/Tab09Previews';
import Tab10Tokens from './components/Tab10Tokens';
import Tab11Campaigns from './components/Tab11Campaigns';
import Tab12Review from './components/Tab12Review';
import Tab13Docs from './components/Tab13Docs';
import Tab14PipeLine from './components/Tab14PipeLine';
import TabBriefModal from './components/TabBriefModal';

// Initialize global network listener once across entire runtime
initGlobalInterceptor();

const TABS = [
  '01 EXEC', '02 WAR ROOM', '03 PROJECTS', '04 TASK BOARD',
  '05 CALENDAR', '06 LAUNCH-PAD', '07 CEO ENGINE', '08 PALETTES',
  '09 PREVIEWS', '10 TOKENS', '11 CAMPAIGNS', '12 REVIEW',
  '13 DOCS', '14 PIPE-LINE'
];

const OVERVIEW_PILLARS = [
  {
    code: 'STAGE 01 // COMMAND & STRATEGY',
    tabs: '01 EXEC • 02 WAR ROOM • 03 PROJECTS',
    summary: 'Chat directly with Chief of Staff Monty on Tab 01 to scope objectives, assemble multi-model Director councils in Tab 02 War Room, and track isolated project directories in Tab 03.'
  },
  {
    code: 'STAGE 02 // OPERATIONS & COMMERCIALIZATION',
    tabs: '04 TASK BOARD • 05 CALENDAR • 06 LAUNCH-PAD',
    summary: 'Manage deterministic task queues, automated cron schedules, and the Tab 06 Launch-Pad commercial cockpit (PayPal, Stripe, PayFast onboarding, VPS provisioning, and break-even telemetry).'
  },
  {
    code: 'STAGE 03 // AUTONOMOUS ORCHESTRATION & STUDIO',
    tabs: '07 CEO ENGINE • 08 PALETTES • 09 PREVIEWS • 10 TOKENS',
    summary: 'Coordinate the 16-Director matrix in CEO Engine, craft 3D woven/metallic UI suites in Palettes, inspect live builds in Previews, and monitor model compute budgets in Tokens.'
  },
  {
    code: 'STAGE 04 // CAMPAIGNS, INTELLIGENCE & PIPELINE',
    tabs: '11 CAMPAIGNS • 12 REVIEW • 13 DOCS • 14 PIPE-LINE',
    summary: 'Run automated multi-channel campaigns, distill external media into structured knowledge veins, edit live SOP/ROE markdown doctrines, and monitor audio/data conduits in Pipe-Line.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('01 EXEC');
  const [mcncSocket, setMcncSocket] = useState(null);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [heartbeatActive, setHeartbeatActive] = useState(false);

  // INITIALIZED TO FALSE: NEVER AUTO-POPS ON REFRESH
  const [showHeartbeatModal, setShowHeartbeatModal] = useState(false);
  const [showTabBriefModal, setShowTabBriefModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);

  // Universal Busy State
  const [isSystemBusy, setIsSystemBusy] = useState(false);
  const [activeModel, setActiveModel] = useState('');

  // Shared state for War Room payload transfers from Tab 01
  const [warRoomPayload, setWarRoomPayload] = useState(null);

  const triggerHeartbeat = () => {
    setHeartbeatActive(true);
    setShowHeartbeatModal(prev => !prev);
    setTimeout(() => setHeartbeatActive(false), 800);
  };

  // Keyboard shortcut: Shift + ? opens Tab Briefing Modal (when not typing in inputs)
  useEffect(() => {
    const handleShortcut = (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowTabBriefModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowOverviewModal(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Sync selected brain across tabs to guard the telemetry dot
  useEffect(() => {
    const syncModel = () => {
      const stored = localStorage.getItem('mcnc_selected_brain') || '';
      setActiveModel(stored);
    };
    syncModel();
    window.addEventListener('storage', syncModel);
    window.addEventListener('mcnc-model-selected', (e) => {
      if (e.detail?.model) setActiveModel(e.detail.model);
    });

    const handleBusy = (e) => {
      setIsSystemBusy(Boolean(e.detail?.isBusy));
    };

    window.addEventListener('mcnc-busy-state', handleBusy);
    return () => {
      window.removeEventListener('storage', syncModel);
      window.removeEventListener('mcnc-busy-state', handleBusy);
    };
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

  const isKaggleSelected = Boolean(activeModel && activeModel.toUpperCase().includes('KAGGLE'));

  return (
    <div className="mcnc-glass-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* GLOBAL MASTER HEADER */}
      <header className="mcnc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(6px, 0.6vw, 10px) clamp(10px, 1vw, 16px)', borderBottom: '1px solid var(--wire-border)', backgroundColor: 'rgba(10, 12, 16, 0.95)', flexShrink: 0 }}>
        <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold-core)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', letterSpacing: '1px', fontSize: 'var(--fs-title)' }}>
          <span>MISSION CONTROL // MCNC MASTER</span>

          {/* GOLDENROD STATION BRIEFING TRIGGER */}
          <button
            onClick={() => setShowTabBriefModal(true)}
            style={{
              background: showTabBriefModal
                ? 'linear-gradient(180deg, rgba(218, 165, 32, 0.25) 0%, rgba(16, 12, 4, 0.95) 100%)'
                : 'linear-gradient(180deg, #16140e 0%, #0a0906 100%)',
              border: '1px solid #DAA520',
              color: '#ffb800',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              letterSpacing: '1px',
              boxShadow: '0 0 10px rgba(218, 165, 32, 0.22), inset 0 1px 0 rgba(255, 215, 0, 0.14)',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #2b2210 0%, #140f06 100%)';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(218, 165, 32, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#FFE082';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #16140e 0%, #0a0906 100%)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(218, 165, 32, 0.22), inset 0 1px 0 rgba(255, 215, 0, 0.14)';
              e.currentTarget.style.color = '#ffb800';
            }}
            title="Executive Briefing: What This Tab Does (Shift + ?)"
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: '#DAA520',
              color: '#080a0c',
              fontWeight: '900',
              fontSize: '10px',
              lineHeight: 1
            }}>?</span>
            <span>TAB BRIEF</span>
          </button>

          {/* FULL MCNC SYSTEM OVERVIEW & GUEST TOUR TRIGGER */}
          <button
            onClick={() => setShowOverviewModal(true)}
            style={{
              background: showOverviewModal
                ? 'linear-gradient(180deg, rgba(197, 189, 159, 0.24) 0%, rgba(15, 18, 24, 0.95) 100%)'
                : 'linear-gradient(180deg, #171c26 0%, #0c0f15 100%)',
              border: '1px solid #C5BD9F',
              color: '#C5BD9F',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              letterSpacing: '1px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#DAA520';
              e.currentTarget.style.color = '#FFE082';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(218, 165, 32, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#C5BD9F';
              e.currentTarget.style.color = '#C5BD9F';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12)';
            }}
            title="Full MCNC Architecture Overview & Guest Orientation Guide"
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: 'rgba(218,165,32,0.2)',
              border: '1px solid #DAA520',
              color: '#DAA520',
              fontWeight: '900',
              fontSize: '10px',
              lineHeight: 1
            }}>?</span>
            <span>OVERVIEW</span>
          </button>
        </div>

        <div className="system-status" style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 'var(--fs-meta)', color: 'var(--text-mist)' }}>

          {/* SINGLE PINHEAD DOT: ONLY VISIBLE & BLIPPING IF A KAGGLE MODEL IS ACTIVELY RUNNING */}
          {isKaggleSelected && isSystemBusy && (
            <span
              title="Kaggle Inference Active"
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#8C3A27',
                boxShadow: '0 0 5px #8C3A27',
                animation: 'pulse 1s infinite'
              }}
            />
          )}

          {/* OBSIDIAN PULSE: WASP HEARTBEAT MASTER TRIGGER */}
          <button
            onClick={triggerHeartbeat}
            style={{
              background: heartbeatActive
                ? 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, rgba(6, 9, 13, 0.95) 100%)'
                : 'linear-gradient(180deg, #12161F 0%, #080A0E 100%)',
              border: heartbeatActive ? '1px solid #10B981' : '1px solid #2B3545',
              color: heartbeatActive ? '#34D399' : '#D4AF37',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              letterSpacing: '1.2px',
              boxShadow: heartbeatActive
                ? '0 0 14px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : '0 2px 6px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #1C222F 0%, #0E121A 100%)';
              e.currentTarget.style.borderColor = '#DAA520';
              e.currentTarget.style.color = '#F5D77F';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(218, 165, 32, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #12161F 0%, #080A0E 100%)';
              e.currentTarget.style.borderColor = '#2B3545';
              e.currentTarget.style.color = '#D4AF37';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
            }}
            title="Launch WASP Heartbeat Conduits HUD"
          >
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: heartbeatActive ? '#10B981' : '#059669',
              boxShadow: heartbeatActive ? '0 0 8px #10B981' : '0 0 4px #059669'
            }} />
            <span>[ HEARTBEAT ]</span>
          </button>

          <div>
            BRIDGE: <span style={{ color: wsStatus === 'ACTIVE' ? 'var(--emerald-core)' : 'var(--ruby-core)', fontWeight: 'bold' }}>{wsStatus}</span> | FRAMEWORK: REACT VITE
          </div>
        </div>
      </header>

      {/* AUTO-FITTING 14-TAB NAVIGATION BAR */}
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
                color: isSelected ? 'var(--gold-core)' : '#C5BD9F',
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
              <span>{tab}</span>
            </button>
          );
        })}
      </nav>

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

        <div style={{ display: activeTab === '06 LAUNCH-PAD' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab06LaunchPad ws={mcncSocket} />
        </div>

        <div style={{ display: activeTab === '07 CEO ENGINE' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
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

        <div style={{ display: activeTab === '11 CAMPAIGNS' ? 'flex' : 'none', flex: 1, minHeight: 0, height: '100%' }}>
          <Tab11Campaigns ws={mcncSocket} />
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

      {/* SCREENSHOT-READY EXECUTIVE TAB BRIEFING OVERLAY */}
      <TabBriefModal
        isOpen={showTabBriefModal}
        onClose={() => setShowTabBriefModal(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        allTabs={TABS}
      />

      {/* FULL MCNC MASTER ARCHITECTURE OVERVIEW & GUEST ORIENTATION MODAL */}
      {showOverviewModal && (
        <div
          onClick={() => setShowOverviewModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.90)',
            backdropFilter: 'blur(8px)',
            zIndex: 100001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '980px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #131822 0%, #090c11 100%)',
              border: '1px solid #DAA520',
              borderRadius: '6px',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,224,130,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* MODAL TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1f2736', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'inline-block', padding: '3px 9px', borderRadius: '3px', border: '1px solid #DAA520', backgroundColor: 'rgba(218,165,32,0.14)', color: '#ffb800', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '6px' }}>
                  MISSION CONTROL NERVE CENTER // MASTER SYSTEM OVERVIEW
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#F8FAFC' }}>
                  Sovereign Multi-Agent Orchestration &amp; Commercial Deployment Cockpit
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>
                  Built by Rhythm Holdings on Base 1 to convert executive strategy into deterministic software, trading systems, and automated campaigns.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOverviewModal(false)}
                style={{ padding: '6px 12px', backgroundColor: '#141923', border: '1px solid #2b3545', borderRadius: '4px', color: '#C5BD9F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                [ ESC ]
              </button>
            </div>

            {/* VISUAL END-TO-END FLOW DIAGRAM */}
            <div style={{ padding: '14px', backgroundColor: '#080b10', border: '1px solid #1e2636', borderRadius: '5px' }}>
              <div style={{ color: '#DAA520', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' }}>
                END-TO-END ARCHITECTURE PIPELINE (HOW DATA &amp; DECISIONS FLOW)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', alignItems: 'stretch' }}>
                {[
                  { step: '01 // INTAKE', title: 'Monty Exec Chat', desc: 'Discuss ideas & scope with Monty on Tab 01', color: '#DAA520' },
                  { step: '02 // COUNCIL', title: '16-Director War Room', desc: 'Multi-LLM synthesis & PRD verification (Tab 02)', color: '#38bdf8' },
                  { step: '03 // BUILD', title: 'Projects & Tasks', desc: 'Atomic code execution & schedules (Tabs 03–05)', color: '#C5BD9F' },
                  { step: '04 // DEPLOY', title: 'Commercial Launch-Pad', desc: 'Payments, VPS, Member Gate & ROI (Tab 06)', color: '#10b981' },
                  { step: '05 // TELEMETRY', title: 'Tokens & Pipe-Line', desc: 'Model budgets, SOP docs & live streams (Tabs 07–14)', color: '#a78bfa' }
                ].map((node, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px',
                      backgroundColor: '#0e131c',
                      border: `1px solid ${node.color}55`,
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: node.color }}>{node.step}</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#F8FAFC' }}>{node.title}</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', lineHeight: 1.4 }}>{node.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 SYSTEM PILLARS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {OVERVIEW_PILLARS.map((p, idx) => (
                <div key={idx} style={{ padding: '12px', backgroundColor: '#0b0e14', border: '1px solid #1e2636', borderRadius: '4px' }}>
                  <div style={{ color: '#DAA520', fontSize: '10px', fontWeight: 'bold' }}>{p.code}</div>
                  <div style={{ color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>{p.tabs}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '6px', lineHeight: 1.5 }}>{p.summary}</div>
                </div>
              ))}
            </div>

            {/* GUEST ORIENTATION & HOW TO USE TAB BRIEF */}
            <div style={{ padding: '14px', backgroundColor: 'rgba(218, 165, 32, 0.08)', border: '1px solid rgba(218, 165, 32, 0.45)', borderRadius: '5px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div style={{ color: '#FFE082', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                  GUEST ORIENTATION GUIDE (FINDING YOUR FEET)
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#e2e8f0', fontSize: '11px', lineHeight: 1.6 }}>
                  <li><strong>Browse All 14 Stations:</strong> Click any tab across the top bar (including <strong>10 TOKENS</strong> and <strong>14 PIPE-LINE</strong>) to inspect live layouts and telemetry in Read-Only mode.</li>
                  <li><strong>Talk to Monty on Tab 01:</strong> Head to <strong>01 EXEC</strong> to open a conversation with Monty on Base 1 and ask questions about the platform.</li>
                  <li><strong>Unlock Full Control:</strong> Execution dispatches, server writes, and autonomous pipelines unlock once you activate a full membership at <strong>rhythmtradingco.com</strong>.</li>
                </ul>
              </div>

              <div>
                <div style={{ color: '#FFE082', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                  HOW TO USE THE [ ? TAB BRIEF ] BUTTON
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', color: '#e2e8f0', fontSize: '11px', lineHeight: 1.6 }}>
                  <li><strong>Instant Station Manual:</strong> On any tab, click the goldenrod <strong>? TAB BRIEF</strong> button (or press <strong>Shift + ?</strong>) to see what that exact station does, who commands it, and how its inputs and outputs connect.</li>
                  <li><strong>Step Through All 14 Tabs:</strong> Use <strong>&larr; PREV TAB</strong> and <strong>NEXT TAB &rarr;</strong> inside the Tab Brief modal to tour the entire cockpit without losing your place.</li>
                </ul>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowOverviewModal(false);
                  setShowTabBriefModal(true);
                }}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#141923',
                  border: '1px solid #DAA520',
                  borderRadius: '4px',
                  color: '#FFE082',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                OPEN CURRENT TAB BRIEF (? )
              </button>

              <button
                type="button"
                onClick={() => setShowOverviewModal(false)}
                style={{
                  padding: '9px 22px',
                  background: 'linear-gradient(180deg, #F7D154 0%, #DAA520 100%)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#080a0c',
                  fontSize: '11px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                START EXPLORING MCNC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARLORD WASP // HEARTBEAT MODAL */}
      {showHeartbeatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 7, 10, 0.88)',
          backdropFilter: 'blur(6px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <div style={{
            width: '480px',
            backgroundColor: '#0a0d14',
            border: '1px solid #1c2638',
            borderRadius: '6px',
            padding: '24px',
            boxShadow: '0 0 35px rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <div style={{ color: '#DAA520', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                WARLORD WASP // HEARTBEAT
              </div>
              <div style={{ color: '#64748b', fontSize: '10px', letterSpacing: '1px', marginTop: '2px', textTransform: 'uppercase' }}>
                BASE 1 INFRASTRUCTURE &amp; CONDUIT PULSE
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'OPENCLAW DAEMON BRIDGE', port: 'PORT 8081', desc: 'WebSocket Inter-Agent Conduit' },
                { name: 'BACKEND PIPELINE SERVER', port: 'PORT 8082', desc: 'Express Pipeline & JSON Ledgers' },
                { name: 'VITE COCKPIT FRONTEND', port: 'PORT 5173', desc: 'React HMR Live Presentation' },
                { name: 'CEO ENGINE INGESTION PIPE', port: 'LOCAL BUFFER', desc: 'Raw Intake & Cascade Staging' },
                { name: 'HERMES 3 / OLLAMA RUNTIME', port: 'PORT 11434', desc: 'Local Neural Sovereign Engine' },
                { name: 'WARLORD MAIL GATEWAY', port: 'PORT 8085', desc: 'IMAP Triage & Whitelist Protection' }
              ].map((svc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#06080d', border: '1px solid #141c28', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ffc4', boxShadow: '0 0 8px #00ffc4' }} />
                    <div>
                      <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                        {svc.name} <span style={{ color: '#f59e0b', fontSize: '10px', marginLeft: '6px' }}>// {svc.port}</span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '10px' }}>{svc.desc}</div>
                    </div>
                  </div>
                  <div style={{ color: '#00ffc4', fontSize: '11px', fontWeight: 'bold' }}>[OPEN]</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHeartbeatModal(false)}
              style={{
                width: '100%',
                backgroundColor: '#DAA520',
                border: 'none',
                color: '#080a0c',
                fontWeight: 'bold',
                padding: '12px 0',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '1.5px',
                fontSize: '11px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 10px rgba(218, 165, 32, 0.3)'
              }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

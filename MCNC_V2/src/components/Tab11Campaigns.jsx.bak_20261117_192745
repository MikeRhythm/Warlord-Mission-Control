import React, { useState, useEffect, useRef } from 'react';

export default function Tab11Campaigns() {
  const [selectedProjectId, setSelectedProjectId] = useState('BOUNTY_ENGINE');

  // Funnel Registry State
  const [bounties, setBounties] = useState([]);
  const [activeBountyId, setActiveBountyId] = useState('');

  // Column 01 Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [cpmRate, setCpmRate] = useState('1.50');
  const [viewFloor, setViewFloor] = useState('1000');
  const [sourceVideoPath, setSourceVideoPath] = useState('');
  const [hookHeadline, setHookHeadline] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:01:00');
  const [mandatoryTags, setMandatoryTags] = useState('');

  // Hook Extractor, Discovery & War Room Spinner State
  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);
  const [rawTranscript, setRawTranscript] = useState('');
  const [isExtractingHooks, setIsExtractingHooks] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const abortControllerRef = useRef(null);

  // Column 02 Telemetry State
  const [telemetryLog, setTelemetryLog] = useState([
    '[INIT] Universal Campaigns & Action Station mounted.',
    '[BRIDGE] Connected to Port 8081 execution conduits.'
  ]);
  const [pipelineState, setPipelineState] = useState('IDLE');

  // Column 03 Disk Artifacts State
  const [artifacts, setArtifacts] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const addLog = (msg) => {
    setTelemetryLog(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 49)
    ]);
  };

  // Live Timer for War Room Radar Spinner
  useEffect(() => {
    let timer = null;
    if (isExtractingHooks || isDiscovering || pipelineState === 'RENDERING') {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExtractingHooks, isDiscovering, pipelineState]);

  const formatTimer = (secs) => {
    const mins = String(Math.floor(secs / 60)).padStart(2, '0');
    const rem = String(secs % 60).padStart(2, '0');
    return `${mins}:${rem}`;
  };

  const projects = [
    { id: 'BOUNTY_ENGINE', label: 'CREATOR BOUNTIES', color: '#ffb800' },
    { id: 'The Chief Madothi F', label: 'THE CHIEF MADOTHI FUND', color: '#38bdf8' },
    { id: 'PEPTIDES', label: 'PEPTIDES FOR AFRICA', color: '#10b981' },
    { id: 'John Tanton - Proje', label: 'JOHN TANTON // PM BOOK', color: '#C5BD9F' }
  ];

  // ZERO-STATE RESET FUNCTION
  const resetFormToZeroState = () => {
    setActiveBountyId('');
    setCampaignTitle('');
    setCpmRate('1.50');
    setViewFloor('1000');
    setSourceVideoPath('');
    setHookHeadline('');
    setRawTranscript('');
    setStartTime('00:00:00');
    setEndTime('00:01:00');
    setMandatoryTags('');
    setArtifacts([]);
    setIsCreatingNew(false);
  };

  const fetchBounties = async (preventAutoSelect = false) => {
    try {
      const res = await fetch('http://localhost:8081/api/bounties');
      if (res.ok) {
        const data = await res.json();
        const activeList = Array.isArray(data) ? data : (data.active || data.value || []);
        setBounties(activeList);

        if (!preventAutoSelect && activeList.length > 0 && !activeBountyId) {
          loadBountyIntoForm(activeList[0]);
        } else if (activeList.length === 0) {
          resetFormToZeroState();
        }
      }
    } catch (e) {
      addLog(`API ERROR: Could not fetch bounties.`);
    }
  };

  useEffect(() => {
    if (selectedProjectId === 'BOUNTY_ENGINE') {
      fetchBounties();
    }
  }, [selectedProjectId]);

  const loadBountyIntoForm = (bounty) => {
    setActiveBountyId(bounty.id);
    setCampaignTitle(bounty.campaignTitle || bounty.title || bounty.name || '');
    setCpmRate(bounty.cpmRate || bounty.cpm_rate || '1.50');
    setViewFloor(bounty.viewFloor || bounty.view_floor || '1000');
    setSourceVideoPath(bounty.sourceVideoPath || bounty.sourcePath || bounty.intake_file || '');
    setHookHeadline(bounty.hookHeadline || bounty.hook_banner || '');
    setStartTime(bounty.startTime || '00:00:00');
    setEndTime(bounty.endTime || '00:01:00');
    setMandatoryTags(bounty.mandatoryTags || bounty.tags || '');
    setIsCreatingNew(false);
    loadDiskArtifacts('BOUNTY_ENGINE', bounty.id);
    addLog(`WORKSPACE: Loaded sub-funnel [${bounty.id}]`);
  };

  const loadDiskArtifacts = async (projId, bId = '') => {
    try {
      const targetBounty = bId || activeBountyId;
      if (!targetBounty && projId === 'BOUNTY_ENGINE') {
        setArtifacts([]);
        return;
      }
      const url = projId === 'BOUNTY_ENGINE'
        ? `http://localhost:8081/api/campaigns/artifacts/${projId}?bountyId=${targetBounty}`
        : `http://localhost:8081/api/campaigns/artifacts/${projId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data.artifacts || []);
        addLog(`DISK SYNC: Loaded ${data.count || (data.artifacts ? data.artifacts.length : 0)} artifacts.`);
      }
    } catch (e) {
      addLog(`DISK ERROR: ${e.message}`);
    }
  };

  const handleTerminateJob = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExtractingHooks(false);
    setIsDiscovering(false);
    setPipelineState('IDLE');
    addLog('EMERGENCY BRAKE: Batch inference job terminated by Commander.');
  };

  // AUTOMATED TESS & JACK BOUNTY DISCOVERY HANDLER
  const handleDiscoverBounties = async () => {
    setIsDiscovering(true);
    addLog('DISCOVERY: Dispatching Jack & Tess to scrape Whop & Vyro...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('http://localhost:8081/api/campaigns/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      const data = await res.json();
      if (data.success) {
        addLog(`DISCOVERY COMPLETE: Tess approved ${data.added || 0} qualifying bounties.`);
        await fetchBounties(false);
        window.dispatchEvent(new CustomEvent('mcnc-bounties-discovered', { detail: { bounties: data.bounties } }));
      } else {
        addLog(`DISCOVERY FAILED: ${data.error || 'Scraper returned no targets.'}`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`DISCOVERY ERROR: ${err.message}`);
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleExtractHooks = async () => {
    if (!rawTranscript.trim()) {
      addLog('HOOKS: Enter a YouTube URL or Transcript text.');
      return;
    }
    setIsExtractingHooks(true);
    addLog(`INTAKE: Processing intake stream for [${activeBountyId || 'NEW'}]...`);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const [res] = await Promise.all([
        fetch('http://localhost:8081/api/campaigns/bounty/find-hooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bountyId: activeBountyId,
            intakeInput: rawTranscript
          }),
          signal: controller.signal
        }),
        new Promise(r => setTimeout(r, 1200))
      ]);

      const data = await res.json();
      if (data.success && data.hook) {
        setHookHeadline(data.hook.hookHeadline || hookHeadline);
        setStartTime(data.hook.startTime || startTime);
        setEndTime(data.hook.endTime || endTime);
        if (data.hook.mandatoryTags) setMandatoryTags(data.hook.mandatoryTags);
        addLog(`HOOKS APPLIED: Viral segment locked [${data.hook.startTime} -> ${data.hook.endTime}]`);
        setTranscriptDrawerOpen(false);
      } else {
        addLog(`HOOKS FAILED: ${data.error || 'Unknown parsing failure'}`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        addLog(`INFERENCE ERROR: ${err.message}`);
      }
    } finally {
      setIsExtractingHooks(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!sourceVideoPath) {
      addLog('PIPELINE REJECTED: Missing source video path.');
      return;
    }
    setPipelineState('RENDERING');
    addLog(`RENDER DISPATCH: Cropping 9:16 and burning hook [${hookHeadline}]`);

    try {
      const res = await fetch('http://localhost:8081/api/campaigns/bounty/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bountyId: activeBountyId,
          sourceFile: sourceVideoPath,
          hookText: hookHeadline,
          startTimestamp: startTime,
          endTimestamp: endTime
        })
      });

      const data = await res.json();
      if (data.success) {
        setPipelineState('COMPLETE');
        addLog(`RENDER COMMITTED: Saved ${data.filename}`);
        loadDiskArtifacts('BOUNTY_ENGINE', activeBountyId);
      } else {
        setPipelineState('FAILED');
        addLog(`FFMPEG FAILED: ${data.error}`);
      }
    } catch (err) {
      setPipelineState('FAILED');
      addLog(`RENDER ERROR: ${err.message}`);
    }
  };

  // ENHANCED ZERO-STATE PURGE HANDLER
  const handlePurgeBounty = async () => {
    if (!window.confirm(`WARNING: This will permanently delete bounty [${activeBountyId}] and obliterate physical MP4 clips off disk. Proceed?`)) return;

    const targetId = activeBountyId;

    try {
      const res = await fetch(`http://localhost:8081/api/bounties/${targetId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addLog(`PURGED: Obliterated ledger & disk files for [${targetId}]`);
        setBounties(prev => prev.filter(b => b.id !== targetId));
        resetFormToZeroState();
        await fetchBounties(true);
      } else {
        const err = await res.json();
        addLog(`PURGE FAILED: ${err.message || 'Server rejected purge'}`);
      }
    } catch (e) {
      addLog(`PURGE ERROR: ${e.message}`);
    }
  };

  return (
    <div style={{
      backgroundColor: '#080a0c',
      color: '#C5BD9F',
      minHeight: '100%',
      padding: '16px',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      {/* KEYFRAMES FOR WAR ROOM TRIPLE-ARC RADAR SPINNER */}
      <style>{`
        @keyframes warRoomSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes warRoomSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes warRoomSpinFast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        @keyframes warRoomGlow {
          0%, 100% { opacity: 0.75; text-shadow: 0 0 12px rgba(255, 184, 0, 0.55); }
          50% { opacity: 1; text-shadow: 0 0 22px rgba(255, 184, 0, 0.95); }
        }
      `}</style>

      {/* WAR ROOM INFERENCE SPINNER MODAL OVERLAY */}
      {(isExtractingHooks || isDiscovering || pipelineState === 'RENDERING') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 10, 12, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* TRIPLE CONCENTRIC RADAR RINGS */}
          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '28px' }}>
            <svg viewBox="0 0 150 150" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              animation: 'warRoomSpinSlow 2.6s linear infinite'
            }}>
              <circle cx="75" cy="75" r="64" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="180 240" />
            </svg>

            <svg viewBox="0 0 150 150" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              animation: 'warRoomSpinReverse 1.9s linear infinite'
            }}>
              <circle cx="75" cy="75" r="49" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeDasharray="130 200" />
            </svg>

            <svg viewBox="0 0 150 150" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              animation: 'warRoomSpinFast 2.2s ease-in-out infinite'
            }}>
              <circle cx="75" cy="75" r="34" fill="none" stroke="#ffb800" strokeWidth="4" strokeLinecap="round" strokeDasharray="85 150" />
            </svg>

            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: '#ffb800', fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>⚡</span>
              <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div style={{
            color: '#ffb800',
            fontSize: '15px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            marginBottom: '18px',
            animation: 'warRoomGlow 1.5s infinite'
          }}>
            {isDiscovering
              ? 'TESS & JACK SCANNING WHOP & VYRO BOUNTIES...'
              : pipelineState === 'RENDERING'
              ? 'EXECUTING FFMPEG 9:16 RENDER RUN...'
              : 'EXECUTING WAR ROOM INFERENCE RUN...'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', fontSize: '12px', letterSpacing: '1.5px' }}>
            <span style={{ color: '#94A3B8' }}>ENGINE:</span>
            <span style={{
              border: '1px solid #38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '4px',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)'
            }}>
              {isDiscovering ? 'PUPPETEER + TESS QUANT FILTER' : 'LOCAL / FREE CLUSTERS'}
            </span>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>PROCESS IS LOCKED & RUNNING</span>
          </div>

          <button
            onClick={handleTerminateJob}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '10px 28px',
              borderRadius: '4px',
              fontSize: '12px',
              letterSpacing: '2px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            TERMINATE BATCH JOB
          </button>
        </div>
      )}

      {/* TOP DECK */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid #1f242d',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '13px' }}>ACTION STATION //</span>
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => {
                setSelectedProjectId(proj.id);
                setArtifacts([]);
              }}
              style={{
                backgroundColor: selectedProjectId === proj.id ? 'rgba(255,255,255,0.06)' : '#0d0f12',
                border: selectedProjectId === proj.id ? `1px solid ${proj.color}` : '1px solid #1f242d',
                color: selectedProjectId === proj.id ? proj.color : '#94A3B8',
                padding: '6px 14px',
                fontSize: '11px',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              {proj.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '11px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>PORT 8081 DAEMON: <strong style={{ color: '#10b981' }}>READY</strong></span>
          <span>WHISPER CLUSTER: <strong style={{ color: '#ffb800' }}>NIM ONLINE</strong></span>
        </div>
      </div>

      {/* SUB-FUNNEL NAVIGATION BAR */}
      {selectedProjectId === 'BOUNTY_ENGINE' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>ACTIVE BOUNTIES:</span>
            {bounties.map(b => (
              <button
                key={b.id}
                onClick={() => loadBountyIntoForm(b)}
                style={{
                  backgroundColor: activeBountyId === b.id ? 'rgba(255, 184, 0, 0.15)' : '#14171c',
                  border: activeBountyId === b.id ? '1px solid #ffb800' : '1px solid #1f242d',
                  color: activeBountyId === b.id ? '#ffb800' : '#C5BD9F',
                  padding: '5px 12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '3px'
                }}
              >
                {b.campaignTitle || b.title || b.name || b.id}
              </button>
            ))}
            <button
              onClick={() => {
                resetFormToZeroState();
                setIsCreatingNew(true);
              }}
              style={{
                backgroundColor: '#1f242d',
                border: 'none',
                color: '#F8FAFC',
                padding: '5px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                borderRadius: '3px'
              }}
            >
              + NEW FUNNEL
            </button>
          </div>

          <button
            onClick={handleDiscoverBounties}
            disabled={isDiscovering}
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#10b981',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: isDiscovering ? 'not-allowed' : 'pointer',
              borderRadius: '3px',
              letterSpacing: '0.5px'
            }}
          >
            {isDiscovering ? 'SCANNING WHOP & VYRO...' : '⚡ AUTO-DISCOVER BOUNTIES (TESS)'}
          </button>
        </div>
      )}

      {/* 3-COLUMN COCKPIT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px'
      }}>
        {/* COLUMN 01: INTAKE & PLAYBOOK */}
        <div style={{
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>01 // BOUNTY RULES</span>
            {activeBountyId && (
              <button
                onClick={handlePurgeBounty}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                [ PURGE FUNNEL ]
              </button>
            )}
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>CAMPAIGN TARGET</label>
            <input
              type="text"
              value={campaignTitle}
              onChange={e => setCampaignTitle(e.target.value)}
              placeholder="Target Video / Campaign Name"
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                color: '#fff',
                padding: '6px',
                fontSize: '11px',
                marginTop: '4px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>CPM RATE</label>
              <input
                type="text"
                value={cpmRate}
                onChange={e => setCpmRate(e.target.value)}
                placeholder="1.50"
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  color: '#10b981',
                  padding: '6px',
                  fontSize: '11px',
                  marginTop: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>VIEW FLOOR</label>
              <input
                type="text"
                value={viewFloor}
                onChange={e => setViewFloor(e.target.value)}
                placeholder="1000"
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  color: '#ffb800',
                  padding: '6px',
                  fontSize: '11px',
                  marginTop: '4px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>SOURCE PATH</label>
            <input
              type="text"
              value={sourceVideoPath}
              onChange={e => setSourceVideoPath(e.target.value)}
              placeholder="C:\Warlord_Inc\..."
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                color: '#C5BD9F',
                padding: '6px',
                fontSize: '11px',
                marginTop: '4px'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>HOOK HEADLINE</label>
              <button
                onClick={() => setTranscriptDrawerOpen(!transcriptDrawerOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                {transcriptDrawerOpen ? '[ CLOSE DRAWER ]' : '[ AI HOOK / YT URL ]'}
              </button>
            </div>
            <input
              type="text"
              value={hookHeadline}
              onChange={e => setHookHeadline(e.target.value)}
              placeholder="High-retention viral headline"
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                color: '#ffb800',
                padding: '6px',
                fontSize: '11px',
                marginTop: '4px'
              }}
            />
          </div>

          {/* DUAL INTAKE DRAWER */}
          {transcriptDrawerOpen && (
            <div style={{
              backgroundColor: '#14171c',
              border: '1px solid #38bdf8',
              padding: '12px',
              borderRadius: '4px'
            }}>
              <label style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                PASTE YOUTUBE URL OR TRANSCRIPT TEXT:
              </label>

              <textarea
                rows={3}
                disabled={isExtractingHooks}
                value={rawTranscript}
                onChange={e => setRawTranscript(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... OR paste transcript text"
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '8px',
                  fontFamily: 'monospace'
                }}
              />

              <button
                onClick={handleExtractHooks}
                disabled={isExtractingHooks}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  backgroundColor: '#38bdf8',
                  color: '#080a0c',
                  border: 'none',
                  fontWeight: 'bold',
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  borderRadius: '2px'
                }}
              >
                PROCESS INTAKE & EXTRACT
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>START TIME</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  color: '#fff',
                  padding: '6px',
                  fontSize: '11px',
                  marginTop: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>END TIME</label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#080a0c',
                  border: '1px solid #1f242d',
                  color: '#fff',
                  padding: '6px',
                  fontSize: '11px',
                  marginTop: '4px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>MANDATORY TAGS</label>
            <input
              type="text"
              value={mandatoryTags}
              onChange={e => setMandatoryTags(e.target.value)}
              placeholder="#mindset #shorts"
              style={{
                width: '100%',
                backgroundColor: '#080a0c',
                border: '1px solid #1f242d',
                color: '#38bdf8',
                padding: '6px',
                fontSize: '11px',
                marginTop: '4px'
              }}
            />
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={pipelineState === 'RENDERING'}
            style={{
              backgroundColor: pipelineState === 'RENDERING' ? '#1f242d' : '#ffb800',
              color: '#080a0c',
              fontWeight: 'bold',
              border: 'none',
              padding: '10px',
              fontSize: '11px',
              cursor: pipelineState === 'RENDERING' ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {pipelineState === 'RENDERING' ? 'RENDERING VERTICAL CLIP...' : 'DISPATCH FFMPEG CROP & RENDER'}
          </button>
        </div>

        {/* COLUMN 02: TELEMETRY FEED */}
        <div style={{
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>02 // TELEMETRY</span>
            <span style={{ color: pipelineState === 'RENDERING' ? '#38bdf8' : '#94A3B8', fontSize: '11px' }}>
              [{pipelineState}]
            </span>
          </div>

          <div style={{
            flex: 1,
            backgroundColor: '#080a0c',
            border: '1px solid #1f242d',
            borderRadius: '4px',
            padding: '10px',
            fontSize: '11px',
            overflowY: 'auto',
            maxHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {telemetryLog.map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.includes('ERROR') || log.includes('FAILED') || log.includes('BRAKE')
                    ? '#ef4444'
                    : log.includes('HOOKS APPLIED') || log.includes('RENDER COMMITTED') || log.includes('DISCOVERY COMPLETE')
                    ? '#10b981'
                    : log.includes('INFERENCE') || log.includes('INTAKE') || log.includes('DISPATCH') || log.includes('PURGED') || log.includes('DISCOVERY:')
                    ? '#38bdf8'
                    : '#94A3B8'
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 03: DISK ARTIFACTS */}
        <div style={{
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>
              03 // DISK ARTIFACTS ({artifacts.length})
            </span>
            <button
              onClick={() => loadDiskArtifacts(selectedProjectId, activeBountyId)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              [SCAN DISK]
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {artifacts.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
                No physical artifacts found in workspace.
              </div>
            ) : (
              artifacts.map(art => (
                <div
                  key={art.id || art.name}
                  style={{
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '10px',
                    borderRadius: '3px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>{art.name}</span>
                    <span style={{ color: '#10b981', fontSize: '10px' }}>{art.sizeKb || art.size || '0'} KB</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>
                    MODIFIED: {art.modified || 'N/A'} | STATE: {art.status || 'SYNCED'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(campaignTitle)}
                      style={{
                        flex: 1,
                        backgroundColor: '#14171c',
                        border: '1px solid #1f242d',
                        color: '#94A3B8',
                        fontSize: '10px',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      COPY TITLE
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${hookHeadline}\n\n${mandatoryTags}`)}
                      style={{
                        flex: 1,
                        backgroundColor: '#14171c',
                        border: '1px solid #1f242d',
                        color: '#94A3B8',
                        fontSize: '10px',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      COPY DESC
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


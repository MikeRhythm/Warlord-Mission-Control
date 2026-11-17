import React, { useState, useEffect, useRef } from 'react';

export default function Tab11Campaigns() {
  const [selectedProjectId, setSelectedProjectId] = useState('BOUNTY_ENGINE');

  // Funnel Registry State
  const [bounties, setBounties] = useState([]);
  const [activeBountyId, setActiveBountyId] = useState('');

  // Column 01 Form & Breakdown State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [cpmRate, setCpmRate] = useState('$2.00');
  const [viewFloor, setViewFloor] = useState('1000');
  const [sourceVideoPath, setSourceVideoPath] = useState('');
  const [hookHeadline, setHookHeadline] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:01:00');
  const [mandatoryTags, setMandatoryTags] = useState('');

  // Bounty Telemetry Breakdown State (Runway, Clicks, Daily Allocation)
  const [poolStatus, setPoolStatus] = useState('ACTIVE // 88% Pool Left (~14 Days)');
  const [runwayDays, setRunwayDays] = useState(14);
  const [totalClicks, setTotalClicks] = useState(0);
  const [dailyPostsUsed, setDailyPostsUsed] = useState(0);
  const [dailyPostCap] = useState(5);

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

  const addLog = (msg) => {
    setTelemetryLog(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 49)
    ]);
  };

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

  const resetFormToZeroState = () => {
    setActiveBountyId('');
    setCampaignTitle('');
    setCpmRate('$2.00');
    setViewFloor('1000');
    setSourceVideoPath('');
    setHookHeadline('');
    setRawTranscript('');
    setStartTime('00:00:00');
    setEndTime('00:01:00');
    setMandatoryTags('');
    setPoolStatus('STANDBY // Select or Add Funnel');
    setRunwayDays(0);
    setTotalClicks(0);
    setDailyPostsUsed(0);
    setArtifacts([]);
  };

  const fetchBounties = async (preventAutoSelect = false) => {
    try {
      const res = await fetch('http://localhost:8081/api/bounties');
      if (res.ok) {
        const data = await res.json();
        const activeList = Array.isArray(data) ? data : (data.active || data.value || []);
        setBounties(activeList);

        if (!preventAutoSelect && activeList.length > 0) {
          const current = activeList.find(b => b.id === activeBountyId) || activeList[0];
          loadBountyIntoForm(current);
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
    setCpmRate(bounty.cpmRate || bounty.cpm_rate || '$2.00');
    setViewFloor(bounty.viewFloor || bounty.view_floor || '1000');
    setSourceVideoPath(bounty.sourceVideoPath || bounty.sourcePath || '');
    setHookHeadline(bounty.hookHeadline || '');
    setStartTime(bounty.startTime || '00:00:00');
    setEndTime(bounty.endTime || '00:01:00');
    setMandatoryTags(bounty.mandatoryTags || '');
    setPoolStatus(bounty.poolStatus || 'ACTIVE // 85% Pool Left (~12 Days)');
    setRunwayDays(bounty.runwayDays !== undefined ? bounty.runwayDays : 12);
    setTotalClicks(bounty.totalClicks || 0);
    setDailyPostsUsed(bounty.dailyPostsUsed || 0);
    loadDiskArtifacts('BOUNTY_ENGINE', bounty.id);
    addLog(`WORKSPACE: Loaded [${bounty.title || bounty.id}] | Runway: ${bounty.runwayDays || 12}d | Allocation: ${bounty.dailyPostsUsed || 0}/5 posts`);
  };

  const syncBountyStats = async (overrides = {}) => {
    if (!activeBountyId) return;
    const payload = {
      id: activeBountyId,
      totalClicks: overrides.totalClicks !== undefined ? overrides.totalClicks : totalClicks,
      dailyPostsUsed: overrides.dailyPostsUsed !== undefined ? overrides.dailyPostsUsed : dailyPostsUsed,
      poolStatus: overrides.poolStatus !== undefined ? overrides.poolStatus : poolStatus,
      runwayDays: overrides.runwayDays !== undefined ? overrides.runwayDays : runwayDays,
      cpmRate,
      viewFloor,
      mandatoryTags,
      hookHeadline,
      sourcePath: sourceVideoPath
    };

    try {
      const res = await fetch('http://localhost:8081/api/bounties/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.active) setBounties(data.active);
      }
    } catch (e) {
      addLog(`SYNC ERROR: ${e.message}`);
    }
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
      }
    } catch (e) {
      addLog(`DISK ERROR: ${e.message}`);
    }
  };

  const handleTerminateJob = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsExtractingHooks(false);
    setIsDiscovering(false);
    setPipelineState('IDLE');
    addLog('EMERGENCY BRAKE: Batch inference job terminated by Commander.');
  };

  const handleDiscoverBounties = async () => {
    setIsDiscovering(true);
    addLog('DISCOVERY: Dispatching Jack & Tess to scrape open Vyro CPM bounties...');

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
        const list = data.bounties || [];
        setBounties(list);
        if (list.length > 0) loadBountyIntoForm(list[0]);
        addLog(`DISCOVERY COMPLETE: Tess synced ${list.length} active CPM bounties.`);
        window.dispatchEvent(new CustomEvent('mcnc-bounties-discovered', { detail: { bounties: list } }));
      } else {
        addLog(`DISCOVERY FAILED: ${data.error || 'Scraper returned no targets.'}`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') addLog(`DISCOVERY ERROR: ${err.message}`);
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
    addLog(`INTAKE: Maverick & Skyla extracting viral hook + SEO cluster for [${activeBountyId || 'NEW'}]...`);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('http://localhost:8081/api/campaigns/bounty/find-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId: activeBountyId, intakeInput: rawTranscript }),
        signal: controller.signal
      });
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
      if (err.name !== 'AbortError') addLog(`INFERENCE ERROR: ${err.message}`);
    } finally {
      setIsExtractingHooks(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!activeBountyId) {
      addLog('PIPELINE REJECTED: Select an active bounty first.');
      return;
    }
    if (dailyPostsUsed >= dailyPostCap) {
      addLog(`ALLOCATION GATE: Daily 5-post limit reached for [${campaignTitle}].`);
      return;
    }
    setPipelineState('RENDERING');
    addLog(`1-CLICK AUTO-PILOT: Jack harvesting YouTube MP4 -> Tess slicing 3 (30-60s) hooks -> Charlie rendering 9:16 -> Roxy staging uploads...`);

    try {
      const res = await fetch('http://localhost:8081/api/campaigns/bounty/auto-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bounty: {
            id: activeBountyId,
            title: campaignTitle,
            cpmRate,
            viewFloor,
            hookHeadline,
            mandatoryTags
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setPipelineState('COMPLETE');
        if (data.sourceFile) setSourceVideoPath(data.sourceFile);
        if (data.updatedBounty) {
          setDailyPostsUsed(data.updatedBounty.dailyPostsUsed);
        }
        if (data.activeList) setBounties(data.activeList);
        addLog(`AUTO-PILOT COMPLETE: 3 vertical shorts rendered, allocation updated (${data.updatedBounty?.dailyPostsUsed || 3}/5), and @EchoPodMedia upload studio launched.`);
        loadDiskArtifacts('BOUNTY_ENGINE', activeBountyId);
      } else {
        setPipelineState('FAILED');
        addLog(`AUTO-PILOT FAILED: ${data.error}`);
      }
    } catch (err) {
      setPipelineState('FAILED');
      addLog(`AUTO-PILOT ERROR: ${err.message}`);
    }
  };

  const handleCreateNewFunnel = async () => {
    const newId = `bty_custom_${Date.now().toString().slice(-4)}`;
    const newBounty = {
      id: newId,
      title: 'New Custom Bounty',
      cpmRate: '$2.00',
      viewFloor: '1000',
      poolStatus: 'ACTIVE // 100% Pool Left (~14 Days)',
      runwayDays: 14,
      totalClicks: 0,
      dailyPostsUsed: 0,
      dailyPostCap: 5,
      mandatoryTags: '#shorts #viral #echopod',
      hookHeadline: 'VIRAL HOOK HEADLINE'
    };
    const nextList = [...bounties, newBounty];
    setBounties(nextList);
    loadBountyIntoForm(newBounty);
  };

  const handlePurgeBounty = async () => {
    if (!window.confirm(`WARNING: Permanently delete bounty [${activeBountyId}] and obliterate its physical MP4 clips off disk?`)) return;
    const targetId = activeBountyId;
    try {
      const res = await fetch(`http://localhost:8081/api/bounties/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        addLog(`PURGED: Obliterated ledger & disk files for [${targetId}]`);
        const remaining = bounties.filter(b => b.id !== targetId);
        setBounties(remaining);
        if (remaining.length > 0) loadBountyIntoForm(remaining[0]);
        else resetFormToZeroState();
      }
    } catch (e) {
      addLog(`PURGE ERROR: ${e.message}`);
    }
  };

  const totalDailyUsedAcrossAll = bounties.reduce((sum, b) => sum + (Number(b.dailyPostsUsed) || 0), 0);
  const estEarnings = ((totalClicks / 1000) * (parseFloat(String(cpmRate).replace(/[^0-9.]/g, '')) || 2.0)).toFixed(2);

  return (
    <div style={{
      backgroundColor: '#080a0c',
      color: '#C5BD9F',
      height: 'calc(100vh - 68px)', overflowY: 'auto', padding: '12px 16px 48px 16px', fontFamily: 'monospace', position: 'relative'
    }}>
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
          <span>GLOBAL DAILY ALLOCATION: <strong style={{ color: totalDailyUsedAcrossAll >= 5 ? '#ef4444' : '#38bdf8' }}>{totalDailyUsedAcrossAll} / 5 POSTS TODAY</strong></span>
          <span>PORT 8081 DAEMON: <strong style={{ color: '#10b981' }}>READY</strong></span>
        </div>
      </div>

      {/* CLICKABLE BOUNTY SELECTOR BAR */}
      {selectedProjectId === 'BOUNTY_ENGINE' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold' }}>ACTIVE BOUNTIES ({bounties.length}):</span>
            {bounties.map(b => {
              const isSelected = activeBountyId === b.id;
              const isDry = (b.poolStatus || '').includes('DRY');
              return (
                <button
                  key={b.id}
                  onClick={() => loadBountyIntoForm(b)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 184, 0, 0.18)' : '#14171c',
                    border: isSelected ? '1px solid #ffb800' : isDry ? '1px solid #ef4444' : '1px solid #262c36',
                    color: isSelected ? '#ffb800' : isDry ? '#ef4444' : '#E2E8F0',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{b.title || b.id}</span>
                  <span style={{
                    fontSize: '9px',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    backgroundColor: isDry ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.18)',
                    color: isDry ? '#ef4444' : '#10b981'
                  }}>
                    {b.cpmRate || '$2.00'} • {b.runwayDays !== undefined ? `${b.runwayDays}d` : '12d'}
                  </span>
                </button>
              );
            })}
            <button
              onClick={handleCreateNewFunnel}
              style={{
                backgroundColor: '#1f242d',
                border: '1px solid #334155',
                color: '#F8FAFC',
                padding: '6px 10px',
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
              borderRadius: '3px'
            }}
          >
            {isDiscovering ? 'SYNCING VYRO BOUNTIES...' : '⚡ AUTO-DISCOVER BOUNTIES (TESS)'}
          </button>
        </div>
      )}

      {/* LIVE BOUNTY BREAKDOWN HUD (RUNWAY, CLICKS/VIEWS, DAILY 5-POST ALLOCATION) */}
      {selectedProjectId === 'BOUNTY_ENGINE' && activeBountyId && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* CARD 1: POOL STATUS & RUNWAY */}
          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>BOUNTY RUNWAY // POOL STATUS</span>
              <button
                onClick={() => {
                  const nextDry = poolStatus.includes('DRY') ? 'ACTIVE // 85% Pool Left (~12 Days)' : 'POOL DRY // PURGE READY';
                  const nextDays = nextDry.includes('DRY') ? 0 : 12;
                  setPoolStatus(nextDry);
                  setRunwayDays(nextDays);
                  syncBountyStats({ poolStatus: nextDry, runwayDays: nextDays });
                }}
                style={{ background: 'none', border: '1px solid #334155', color: '#38bdf8', fontSize: '9px', padding: '2px 6px', cursor: 'pointer' }}
              >
                TOGGLE DRY/ACTIVE
              </button>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: poolStatus.includes('DRY') ? '#ef4444' : '#10b981' }}>
              {poolStatus}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              EST. TIME REMAINING: <strong style={{ color: '#E2E8F0' }}>{runwayDays} DAYS</strong> (06:30 SAST Cron Audited)
            </div>
          </div>

          {/* CARD 2: CLICKS / VIEWS & EST PAYOUT */}
          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>TOTAL CLICKS / VIEWS (@EchoPodMedia)</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => {
                    const next = totalClicks + 250;
                    setTotalClicks(next);
                    syncBountyStats({ totalClicks: next });
                  }}
                  style={{ background: '#14171c', border: '1px solid #334155', color: '#10b981', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}
                >
                  +250
                </button>
                <button
                  onClick={() => {
                    const next = totalClicks + 1000;
                    setTotalClicks(next);
                    syncBountyStats({ totalClicks: next });
                  }}
                  style={{ background: '#14171c', border: '1px solid #334155', color: '#ffb800', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}
                >
                  +1K
                </button>
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>
              {totalClicks.toLocaleString()} CLICKS <span style={{ fontSize: '11px', color: '#10b981' }}>(${estEarnings} EST.)</span>
            </div>
            <div style={{ fontSize: '10px', color: totalClicks >= Number(viewFloor) ? '#10b981' : '#ffb800', marginTop: '4px' }}>
              VIEW FLOOR: {Number(viewFloor).toLocaleString()} ({totalClicks >= Number(viewFloor) ? 'FLOOR CLEARED' : `${Math.max(0, Number(viewFloor) - totalClicks)} TO FLOOR`})
            </div>
          </div>

          {/* CARD 3: DAILY ALLOCATION (5 POSTS / DAY CAP) */}
          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>DAILY POST ALLOCATION (MAX 5/DAY)</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => {
                    const next = Math.min(dailyPostCap, dailyPostsUsed + 1);
                    setDailyPostsUsed(next);
                    syncBountyStats({ dailyPostsUsed: next });
                  }}
                  style={{ background: '#14171c', border: '1px solid #334155', color: '#38bdf8', fontSize: '9px', padding: '2px 6px', cursor: 'pointer' }}
                >
                  +1 POST
                </button>
                <button
                  onClick={() => {
                    setDailyPostsUsed(0);
                    syncBountyStats({ dailyPostsUsed: 0 });
                  }}
                  style={{ background: '#14171c', border: '1px solid #334155', color: '#94A3B8', fontSize: '9px', padding: '2px 6px', cursor: 'pointer' }}
                >
                  RESET
                </button>
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: dailyPostsUsed >= dailyPostCap ? '#ef4444' : '#38bdf8' }}>
              {dailyPostsUsed} / {dailyPostCap} POSTS DISPATCHED
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              REMAINING TODAY: <strong style={{ color: '#10b981' }}>{Math.max(0, dailyPostCap - dailyPostsUsed)} SLOTS</strong> (YT / TikTok / IG)
            </div>
          </div>

          {/* CARD 4: PAYOUT RATE & VERDICT */}
          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '6px' }}>TESS QUANT VERDICT</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb800' }}>
              {cpmRate} CPM // {poolStatus.includes('DRY') ? 'PURGE NOW' : 'KEEP RUNNING'}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
              CLIENT: <strong style={{ color: '#fff' }}>{(campaignTitle || '').split('//')[0]}</strong>
            </div>
          </div>
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
          padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>01 // BOUNTY RULES</span>
            {activeBountyId && (
              <button
                onClick={handlePurgeBounty}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  fontSize: '10px',
                  padding: '3px 8px',
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
              onBlur={() => syncBountyStats()}
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
                onBlur={() => syncBountyStats()}
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
                onBlur={() => syncBountyStats()}
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
              onBlur={() => syncBountyStats()}
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
              onBlur={() => syncBountyStats()}
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
                PROCESS INTAKE & EXTRACT SEO HOOKS
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
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>MANDATORY TAGS (SEO CLUSTER)</label>
            <input
              type="text"
              value={mandatoryTags}
              onChange={e => setMandatoryTags(e.target.value)}
              onBlur={() => syncBountyStats()}
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
            {pipelineState === 'RENDERING' ? 'AUTO-HARVESTING YT & RENDERING 3 SHORTS...' : '⚡ 1-CLICK AUTO-HARVEST, CUT 3 SHORTS & POST'}
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
                  color: log.includes('ERROR') || log.includes('FAILED') || log.includes('BRAKE') || log.includes('GATE:')
                    ? '#ef4444'
                    : log.includes('HOOKS APPLIED') || log.includes('RENDER COMMITTED') || log.includes('DISCOVERY COMPLETE')
                    ? '#10b981'
                    : log.includes('WORKSPACE') || log.includes('INTAKE') || log.includes('DISPATCH') || log.includes('PURGED') || log.includes('DISCOVERY:')
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
                      COPY SEO DESC
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



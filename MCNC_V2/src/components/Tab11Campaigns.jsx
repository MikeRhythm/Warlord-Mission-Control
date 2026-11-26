import React, { useState, useEffect, useCallback } from 'react';

const PIPELINE_API_BASE = 'http://localhost:8082/api';
const MASTER_API_BASE = 'http://localhost:8081/api';

const PROJECT_THEME_PALETTE = ['#ffb800', '#38bdf8', '#10b981', '#C5BD9F', '#a78bfa'];

function normalizeProjectKey(name) {
  return String(name || '')
    .trim()
    .replace(/[\s_]+/g, '_')
    .toLowerCase();
}

function isBountyDryOrExpired(b) {
  if (!b) return true;
  const statusStr = `${b.poolStatus || ''} ${b.status || ''} ${b.title || ''}`.toUpperCase();
  if (
    statusStr.includes('DRY') ||
    statusStr.includes('LOCKED') ||
    statusStr.includes('EXPIRED') ||
    statusStr.includes('ENDED') ||
    statusStr.includes('CLOSED') ||
    statusStr.includes('0% POOL')
  ) {
    return true;
  }
  if (b.runwayDays !== undefined && Number(b.runwayDays) <= 0) {
    return true;
  }
  return false;
}

export default function Tab11Campaigns() {
  const [projects, setProjects] = useState([
    { id: 'BOUNTY_ENGINE', label: 'CREATOR BOUNTIES', color: '#ffb800' }
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState('BOUNTY_ENGINE');
  const [bounties, setBounties] = useState([]);
  const [activeBountyId, setActiveBountyId] = useState('');
  const [activePlatform, setActivePlatform] = useState('');

  const [campaignTitle, setCampaignTitle] = useState('');
  const [cpmRate, setCpmRate] = useState('');
  const [viewFloor, setViewFloor] = useState('');
  const [sourceVideoPath, setSourceVideoPath] = useState('');
  const [hookHeadline, setHookHeadline] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mandatoryTags, setMandatoryTags] = useState('');

  const [poolStatus, setPoolStatus] = useState('');
  const [runwayDays, setRunwayDays] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [dailyPostsUsed, setDailyPostsUsed] = useState(0);
  const [dailyPostCap] = useState(6);

  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(false);
  const [rawTranscript, setRawTranscript] = useState('');
  const [isExtractingHooks, setIsExtractingHooks] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverSeconds, setDiscoverSeconds] = useState(0);
  const [copiedFlash, setCopiedFlash] = useState({});
  const [copiedHistory, setCopiedHistory] = useState({});

  const [telemetryLog, setTelemetryLog] = useState([
    '[INIT] Universal Campaigns & Action Station mounted.',
    '[BRIDGE] Connected to Port 8081 execution conduits (Vyro + Whop).'
  ]);
  const [pipelineState, setPipelineState] = useState('IDLE');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [artifacts, setArtifacts] = useState([]);

  // Elapsed timer for discovery / hook extraction spinners
  useEffect(() => {
    if (!isDiscovering && !isExtractingHooks) {
      setDiscoverSeconds(0);
      return;
    }
    setDiscoverSeconds(1);
    const t = setInterval(() => setDiscoverSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isDiscovering, isExtractingHooks]);

  const resetBountyFormToZeroState = () => {
    setActiveBountyId('');
    setActivePlatform('');
    setCampaignTitle('');
    setCpmRate('');
    setViewFloor('');
    setSourceVideoPath('');
    setHookHeadline('');
    setStartTime('');
    setEndTime('');
    setMandatoryTags('');
    setPoolStatus('');
    setRunwayDays(0);
    setTotalClicks(0);
    setDailyPostsUsed(0);
    setTranscriptDrawerOpen(false);
    setRawTranscript('');
    setArtifacts([]);
    setCopiedFlash({});
    setCopiedHistory({});
  };

  // Sync live on-disk projects from Port 8082 + listen for purge/create broadcasts
  const syncDiskProjects = useCallback(async () => {
    try {
      const res = await fetch(`${PIPELINE_API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.projects)) {
          const activeDiskProjects = data.projects.filter(p => p.status !== 'ARCHIVED');
          const mapped = [];

          const bountyEntry = activeDiskProjects.find(
            p => normalizeProjectKey(p.id || p.name) === 'bounty_engine'
          );
          if (bountyEntry) {
            mapped.push({
              id: 'BOUNTY_ENGINE',
              label: 'CREATOR BOUNTIES',
              color: '#ffb800'
            });
          }

          activeDiskProjects.forEach((p, idx) => {
            const rawId = p.id || p.name;
            if (normalizeProjectKey(rawId) === 'bounty_engine') return;
            const displayLabel = String(p.name || rawId).replace(/_/g, ' ').toUpperCase();
            mapped.push({
              id: rawId,
              label: displayLabel,
              color: PROJECT_THEME_PALETTE[(idx + 1) % PROJECT_THEME_PALETTE.length]
            });
          });

          const finalList = mapped.length > 0
            ? mapped
            : [{ id: 'BOUNTY_ENGINE', label: 'CREATOR BOUNTIES', color: '#ffb800' }];

          setProjects(finalList);
          setSelectedProjectId(prev => {
            const exists = finalList.some(item => normalizeProjectKey(item.id) === normalizeProjectKey(prev));
            return exists ? prev : finalList[0].id;
          });
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    syncDiskProjects();
    const interval = setInterval(syncDiskProjects, 6000);

    const handleProjectPurged = (event) => {
      const deletedName = event?.detail?.projectName || event?.detail?.project;
      if (!deletedName) return;
      const targetKey = normalizeProjectKey(deletedName);

      setProjects(prev => {
        const filtered = prev.filter(p => normalizeProjectKey(p.id) !== targetKey);
        const fallbackList = filtered.length > 0
          ? filtered
          : [{ id: 'BOUNTY_ENGINE', label: 'CREATOR BOUNTIES', color: '#ffb800' }];

        setSelectedProjectId(curr =>
          normalizeProjectKey(curr) === targetKey ? fallbackList[0].id : curr
        );
        return fallbackList;
      });
    };

    const handleProjectCreated = () => {
      syncDiskProjects();
    };

    window.addEventListener('mcnc-project-purged', handleProjectPurged);
    window.addEventListener('mcnc-project-created', handleProjectCreated);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mcnc-project-purged', handleProjectPurged);
      window.removeEventListener('mcnc-project-created', handleProjectCreated);
    };
  }, [syncDiskProjects]);

  const getDefaultSourcePath = (bId) => {
    if (!bId) return '';
    return `C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects\\Bounty_Engine\\campaigns\\${bId}\\intake\\${bId}_source.mp4`;
  };

  const detectPlatform = (b) => {
    if (!b) return '';
    if (b.platform) return b.platform;
    return String(b.id || '').toLowerCase().startsWith('whop_') ? 'Whop' : 'Vyro';
  };

  const toSentenceCase = (str) => {
    const clean = String(str || '').trim().toLowerCase();
    if (!clean) return '';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const buildOrganicTitle = (artName, idx) => {
    const brandRaw = (campaignTitle || '').split('//')[0].replace(/Whop Content Rewards/i, '').trim();
    const hookClean = toSentenceCase((hookHeadline || '').replace(/\[.*?\]/g, '').trim());
    const clipMatch = String(artName || '').match(/short_(\d+)/i);
    const clipNum = clipMatch ? Number(clipMatch[1]) : (idx + 1);

    const angles = [
      hookClean ? `${hookClean} 😂 #shorts` : `${brandRaw || 'This'} moment had everyone losing it 😂 #shorts`,
      hookClean ? `Wait till the end of this ${brandRaw || 'clip'} 👀 #shorts` : `Nobody saw this coming in ${brandRaw || 'this clip'} 👀 #shorts`,
      hookClean ? `Still can't believe they kept a straight face 💀 #shorts` : `Peak ${brandRaw || 'comedy'} energy right here 💀 #shorts`
    ];
    return angles[(clipNum - 1) % angles.length];
  };

  const buildCreativeSeoDesc = (artName, idx) => {
    const organicTitle = buildOrganicTitle(artName, idx).replace(/\s*#shorts\s*$/i, '').trim();
    const brandRaw = (campaignTitle || '').split('//')[0].replace(/Whop Content Rewards/i, '').trim();
    const tags = (mandatoryTags || '#shorts #viral').trim();
    const ctas = [
      'Wait until the final seconds — rate this moment 1–10 in the comments 👇',
      'Would you have kept a straight face here? Drop your take below 👇',
      'Tag someone who needs to see this clip today 🔥'
    ];
    const ctaLine = ctas[idx % ctas.length];
    return `${organicTitle}${brandRaw ? ` (${brandRaw})` : ''}\n\n${ctaLine}\n\n${tags}`;
  };

  const triggerCopyWithFeedback = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedFlash(prev => ({ ...prev, [key]: true }));
    setCopiedHistory(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedFlash(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleDeleteArtifact = async (fileName) => {
    if (!window.confirm(`Delete published clip [${fileName}] from disk?`)) return;
    try {
      const res = await fetch(`${MASTER_API_BASE}/campaigns/artifacts/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          bountyId: activeBountyId,
          fileName
        })
      });
      if (res.ok) {
        setArtifacts(prev => prev.filter(a => a.name !== fileName));
      } else {
        alert('Could not delete file on backend — make sure START_WASP.bat was restarted to load the delete endpoint.');
      }
    } catch (e) {
      alert('Bridge connection error while deleting artifact.');
    }
  };

  const loadBountyIntoForm = (bounty) => {
    if (!bounty) {
      resetBountyFormToZeroState();
      return;
    }
    const autoPath = (bounty.sourcePath && bounty.sourcePath.trim())
      ? bounty.sourcePath.trim()
      : getDefaultSourcePath(bounty.id);

    setActiveBountyId(bounty.id);
    setActivePlatform(detectPlatform(bounty));
    setCampaignTitle(bounty.campaignTitle || bounty.title || bounty.name || '');
    setCpmRate(bounty.cpmRate || bounty.cpm_rate || '');
    setViewFloor(bounty.viewFloor || bounty.view_floor || '');
    setSourceVideoPath(autoPath);
    setHookHeadline(bounty.hookHeadline || '');
    setStartTime(bounty.startTime || '00:00:00');
    setEndTime(bounty.endTime || '00:01:00');
    setMandatoryTags(bounty.mandatoryTags || '');
    setPoolStatus(bounty.poolStatus || '');
    setRunwayDays(bounty.runwayDays !== undefined ? bounty.runwayDays : 0);
    setTotalClicks(bounty.totalClicks || 0);
    setDailyPostsUsed(bounty.dailyPostsUsed || 0);
    loadDiskArtifacts('BOUNTY_ENGINE', bounty.id);
  };

  // Auto-purge dry/expired bounties from ledger & disk whenever fetched
  const purgeDryBountiesFromList = async (rawList) => {
    const valid = [];
    const expired = [];
    (rawList || []).forEach(b => {
      if (isBountyDryOrExpired(b)) {
        expired.push(b);
      } else {
        valid.push(b);
      }
    });

    if (expired.length > 0) {
      for (const dead of expired) {
        try {
          await fetch(`${MASTER_API_BASE}/bounties/${dead.id}`, { method: 'DELETE' });
        } catch (e) {}
      }
      setTelemetryLog(prev => [
        `[${new Date().toLocaleTimeString()}] [AUTO-PURGE] Purged ${expired.length} dry/expired funnel(s): ${expired.map(x => x.id).join(', ')}`,
        ...prev
      ]);
    }
    return valid.slice(0, 5);
  };

  const fetchBounties = async () => {
    try {
      const res = await fetch(`${MASTER_API_BASE}/bounties`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.active || data.value || []);
        const activeList = await purgeDryBountiesFromList(rawList);
        setBounties(activeList);
        if (activeList.length > 0) {
          const current = activeList.find(b => b.id === activeBountyId) || activeList[0];
          loadBountyIntoForm(current);
        } else {
          resetBountyFormToZeroState();
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    let active = true;
    const pollJob = async () => {
      try {
        const res = await fetch(`${MASTER_API_BASE}/campaigns/bounty/job-status`);
        if (res.ok && active) {
          const job = await res.json();
          if (Array.isArray(job.logs) && job.logs.length > 0) {
            setTelemetryLog(job.logs);
          }
          setPipelineState(job.status || 'IDLE');
          if (job.running && job.startedAt) {
            setElapsedSeconds(Math.max(1, Math.floor((Date.now() - job.startedAt) / 1000)));
          } else {
            setElapsedSeconds(0);
          }
          if (job.status === 'COMPLETE' && job.lastResult && job.lastResult.activeList) {
            const updatedList = await purgeDryBountiesFromList(job.lastResult.activeList);
            setBounties(updatedList);
            if (updatedList.length === 0) {
              resetBountyFormToZeroState();
            } else if (activeBountyId) {
              const target = updatedList.find(b => b.id === activeBountyId);
              if (target) {
                setActiveBountyId(target.id);
                setActivePlatform(detectPlatform(target));
                setDailyPostsUsed(target.dailyPostsUsed || 0);
                setSourceVideoPath(target.sourcePath || getDefaultSourcePath(target.id));
                loadDiskArtifacts('BOUNTY_ENGINE', target.id);
              }
            }
          }
        }
      } catch (e) {}
    };

    pollJob();
    const interval = setInterval(pollJob, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeBountyId]);

  useEffect(() => {
    if (selectedProjectId === 'BOUNTY_ENGINE') {
      fetchBounties();
    } else {
      resetBountyFormToZeroState();
      loadDiskArtifacts(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleClearTelemetry = async () => {
    try {
      const res = await fetch(`${MASTER_API_BASE}/campaigns/bounty/clear-logs`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTelemetryLog(data.job.logs);
        setPipelineState(data.job.status);
      }
    } catch (e) {
      setTelemetryLog([`[${new Date().toLocaleTimeString()}] [TELEMETRY CLEARED] Ready.`]);
    }
  };

  const syncBountyStats = async (overrides = {}) => {
    if (!activeBountyId) return;
    const payload = {
      id: activeBountyId,
      platform: activePlatform,
      totalClicks: overrides.totalClicks !== undefined ? overrides.totalClicks : totalClicks,
      dailyPostsUsed: overrides.dailyPostsUsed !== undefined ? overrides.dailyPostsUsed : dailyPostsUsed,
      poolStatus: overrides.poolStatus !== undefined ? overrides.poolStatus : poolStatus,
      runwayDays: overrides.runwayDays !== undefined ? overrides.runwayDays : runwayDays,
      cpmRate,
      viewFloor,
      mandatoryTags,
      hookHeadline,
      sourcePath: sourceVideoPath || getDefaultSourcePath(activeBountyId)
    };
    try {
      const res = await fetch(`${MASTER_API_BASE}/bounties/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.active) {
          const clean = await purgeDryBountiesFromList(data.active);
          setBounties(clean);
        }
      }
    } catch (e) {}
  };

  const loadDiskArtifacts = async (projId, bId = '') => {
    try {
      const targetBounty = bId || activeBountyId;
      if (!targetBounty && projId === 'BOUNTY_ENGINE') {
        setArtifacts([]);
        return;
      }
      const url = projId === 'BOUNTY_ENGINE'
        ? `${MASTER_API_BASE}/campaigns/artifacts/${projId}?bountyId=${targetBounty}`
        : `${MASTER_API_BASE}/campaigns/artifacts/${projId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data.artifacts || []);
      }
    } catch (e) {}
  };

  const handleDiscoverBounties = async () => {
    if (isDiscovering) return;
    setIsDiscovering(true);
    setTelemetryLog(prev => [
      `[${new Date().toLocaleTimeString()}] [TESS RADAR] Scanning Vyro + Whop marketplaces & purging dry/expired pools...`,
      ...prev
    ]);
    try {
      const res = await fetch(`${MASTER_API_BASE}/campaigns/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        const list = await purgeDryBountiesFromList(data.bounties || []);
        setBounties(list);
        setTelemetryLog(prev => [
          `[${new Date().toLocaleTimeString()}] [TESS RADAR COMPLETE] Synced ${list.length} verified active bounties.`,
          ...prev
        ]);
        if (list.length > 0) {
          loadBountyIntoForm(list[0]);
        } else {
          resetBountyFormToZeroState();
        }
      }
    } catch (err) {
      setTelemetryLog(prev => [
        `[${new Date().toLocaleTimeString()}] [TESS RADAR ERROR] ${err.message}`,
        ...prev
      ]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleExtractHooks = async () => {
    if (!rawTranscript.trim()) return;
    setIsExtractingHooks(true);
    try {
      const res = await fetch(`${MASTER_API_BASE}/campaigns/bounty/find-hooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId: activeBountyId, youtubeUrl: rawTranscript, intakeInput: rawTranscript })
      });
      const data = await res.json();
      if (data.success && data.hook) {
        setHookHeadline(data.hook.hookHeadline || hookHeadline);
        setStartTime(data.hook.startTime || startTime);
        setEndTime(data.hook.endTime || endTime);
        if (data.hook.mandatoryTags) setMandatoryTags(data.hook.mandatoryTags);
        setTranscriptDrawerOpen(false);
      } else if (data.success && Array.isArray(data.rendered)) {
        loadDiskArtifacts('BOUNTY_ENGINE', activeBountyId);
        setTranscriptDrawerOpen(false);
      }
    } catch (err) {} finally {
      setIsExtractingHooks(false);
    }
  };

  const handleUpdateDailyDispatches = async () => {
    if (pipelineState === 'RUNNING') return;
    setPipelineState('RUNNING');
    setElapsedSeconds(1);
    const resolvedSource = sourceVideoPath || getDefaultSourcePath(activeBountyId);
    if (resolvedSource) setSourceVideoPath(resolvedSource);

    try {
      await fetch(`${MASTER_API_BASE}/campaigns/bounty/auto-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bounty: activeBountyId ? {
            id: activeBountyId,
            platform: activePlatform,
            title: campaignTitle,
            cpmRate,
            viewFloor,
            hookHeadline,
            mandatoryTags,
            poolStatus,
            runwayDays,
            sourcePath: resolvedSource
          } : null
        })
      });
    } catch (err) {
      setPipelineState('FAILED');
    }
  };

  const handleCreateNewFunnel = () => {
    const newId = `whop_custom_${Date.now().toString().slice(-4)}`;
    const newBounty = {
      id: newId,
      platform: 'Whop',
      title: 'New Whop / Vyro Bounty',
      cpmRate: '$2.50',
      viewFloor: '1000',
      poolStatus: 'ACTIVE // 100% Pool Left (~14 Days)',
      runwayDays: 14,
      totalClicks: 0,
      dailyPostsUsed: 0,
      dailyPostCap: 6,
      sourcePath: getDefaultSourcePath(newId),
      mandatoryTags: '#shorts #viral #echopod',
      hookHeadline: 'VIRAL HOOK HEADLINE'
    };
    const nextList = [...bounties, newBounty].slice(0, 5);
    setBounties(nextList);
    loadBountyIntoForm(newBounty);
  };

  const handlePurgeBounty = async () => {
    if (!activeBountyId) {
      resetBountyFormToZeroState();
      return;
    }
    if (!window.confirm(`Permanently delete [${activeBountyId}] and its physical clips?`)) return;
    const targetId = activeBountyId;
    try {
      const res = await fetch(`${MASTER_API_BASE}/bounties/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = bounties.filter(b => b.id !== targetId);
        setBounties(remaining);
        if (remaining.length > 0) {
          loadBountyIntoForm(remaining[0]);
        } else {
          resetBountyFormToZeroState();
        }
        setTelemetryLog(prev => [
          `[${new Date().toLocaleTimeString()}] [PURGE COMPLETE] Obliterated [${targetId}] from ledger & disk.`,
          ...prev
        ]);
      }
    } catch (e) {}
  };

  const totalDailyUsedAcrossAll = bounties.reduce((sum, b) => sum + (Number(b.dailyPostsUsed) || 0), 0);
  const remainingGlobalSlots = Math.max(0, dailyPostCap - totalDailyUsedAcrossAll);
  const estEarnings = ((totalClicks / 1000) * (parseFloat(String(cpmRate).replace(/[^0-9.]/g, '')) || 0)).toFixed(2);
  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isOverlayActive = isDiscovering || pipelineState === 'RUNNING' || isExtractingHooks;
  const overlayTitle = isDiscovering
    ? 'TESS SCANNING VYRO + WHOP MARKETPLACES...'
    : isExtractingHooks
      ? 'EXTRACTING VIRAL HOOKS & TIMESTAMPS...'
      : 'EXECUTING AUTONOMOUS BOUNTY DISPATCH...';
  const overlayTimer = isDiscovering || isExtractingHooks
    ? formatTimer(discoverSeconds)
    : formatTimer(elapsedSeconds);

  return (
    <div style={{
      backgroundColor: '#080a0c',
      color: '#C5BD9F',
      height: 'calc(100vh - 68px)',
      overflowY: 'auto',
      padding: '12px 16px 48px 16px',
      fontFamily: 'monospace',
      position: 'relative'
    }}>
      <style>{`
        @keyframes mcncSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mcncSpinReverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
      `}</style>

      {/* FULL-VIEWPORT ORBITAL HUD SPINNER */}
      {isOverlayActive && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(8, 10, 12, 0.86)',
            backdropFilter: 'blur(7px)',
            WebkitBackdropFilter: 'blur(7px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div style={{ position: 'relative', width: '124px', height: '124px', marginBottom: '20px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="75 160"
                style={{ transformOrigin: '50% 50%', animation: 'mcncSpin 2.2s linear infinite' }}
              />
              <circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="50 120"
                style={{ transformOrigin: '50% 50%', animation: 'mcncSpinReverse 1.6s linear infinite' }}
              />
              <circle
                cx="50"
                cy="50"
                r="24"
                fill="none"
                stroke="#ffb800"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="38 90"
                style={{ transformOrigin: '50% 50%', animation: 'mcncSpin 1.1s ease-in-out infinite' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#ffb800' }}>⚡</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                {overlayTimer}
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#ffb800',
              textTransform: 'uppercase',
              marginBottom: '8px',
              textShadow: '0 0 14px rgba(255, 184, 0, 0.45)'
            }}
          >
            {overlayTitle}
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>CONDUIT:</span>
            <span style={{ color: '#10b981', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '3px', fontWeight: 'bold' }}>
              PORT 8081 // AUTO-PURGE ARMED
            </span>
          </div>
        </div>
      )}

      {/* TOP DECK */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '10px',
        borderBottom: '1px solid #1f242d',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '13px' }}>ACTION STATION //</span>
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => { setSelectedProjectId(proj.id); setArtifacts([]); }}
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
          {pipelineState === 'RUNNING' && (
            <span style={{ color: '#ffb800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid #ffb800', borderTopColor: 'transparent', borderRadius: '50%', animation: 'mcncSpin 0.8s linear infinite' }} />
              AUTO-PILOT ACTIVE ({formatTimer(elapsedSeconds)})
            </span>
          )}
          <span>GLOBAL DAILY ALLOCATION: <strong style={{ color: totalDailyUsedAcrossAll >= 6 ? '#ef4444' : '#38bdf8' }}>{totalDailyUsedAcrossAll} / 6 POSTS TODAY</strong></span>
          <span>PORT 8081 DAEMON: <strong style={{ color: '#10b981' }}>READY</strong></span>
        </div>
      </div>

      {/* TOP 5 BOUNTY BUTTON BAR + MASTER UPDATE TRIGGER */}
      {selectedProjectId === 'BOUNTY_ENGINE' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#0d0f12',
          border: '1px solid #1f242d',
          borderRadius: '4px',
          marginBottom: '12px',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold' }}>ACTIVE BOUNTIES ({bounties.length}/5):</span>
            {bounties.map(b => {
              const isSelected = activeBountyId === b.id;
              const plat = detectPlatform(b);
              const isWhop = plat.toLowerCase() === 'whop';
              return (
                <button
                  key={b.id}
                  onClick={() => loadBountyIntoForm(b)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 184, 0, 0.18)' : '#14171c',
                    border: isSelected ? '1px solid #ffb800' : '1px solid #262c36',
                    color: isSelected ? '#ffb800' : '#E2E8F0',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{
                    fontSize: '9px',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    fontWeight: 'bold',
                    backgroundColor: isWhop ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 184, 0, 0.2)',
                    color: isWhop ? '#38bdf8' : '#ffb800'
                  }}>
                    {plat.toUpperCase()}
                  </span>
                  <span>{b.title || b.id}</span>
                  <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '2px', backgroundColor: 'rgba(16,185,129,0.18)', color: '#10b981' }}>
                    {b.cpmRate || '$0.00'} • {b.runwayDays !== undefined ? `${b.runwayDays}d` : '0d'}
                  </span>
                </button>
              );
            })}
            {bounties.length < 5 && (
              <button
                onClick={handleCreateNewFunnel}
                style={{ backgroundColor: '#1f242d', border: '1px solid #334155', color: '#F8FAFC', padding: '6px 10px', fontSize: '11px', cursor: 'pointer', borderRadius: '3px' }}
              >
                + NEW FUNNEL
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleUpdateDailyDispatches}
              disabled={pipelineState === 'RUNNING'}
              style={{
                backgroundColor: pipelineState === 'RUNNING' ? '#1f242d' : '#ffb800',
                border: pipelineState === 'RUNNING' ? '1px solid #ffb800' : 'none',
                color: pipelineState === 'RUNNING' ? '#ffb800' : '#080a0c',
                padding: '7px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: pipelineState === 'RUNNING' ? 'not-allowed' : 'pointer',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {pipelineState === 'RUNNING' && (
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid #ffb800', borderTopColor: 'transparent', borderRadius: '50%', animation: 'mcncSpin 0.8s linear infinite' }} />
              )}
              <span>{pipelineState === 'RUNNING' ? `UPDATING (${formatTimer(elapsedSeconds)})...` : '⚡ UPDATE DAILY DISPATCHES'}</span>
            </button>

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
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isDiscovering && (
                <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'mcncSpin 0.8s linear infinite' }} />
              )}
              <span>{isDiscovering ? `SYNCING VYRO + WHOP (${formatTimer(discoverSeconds)})...` : '⚡ AUTO-DISCOVER VYRO + WHOP (TESS)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4-CARD BREAKDOWN HUD */}
      {selectedProjectId === 'BOUNTY_ENGINE' && activeBountyId && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>BOUNTY RUNWAY // POOL STATUS</span>
              <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid #1f242d', padding: '1px 5px' }}>AUTO-PURGE ON DRY</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: poolStatus.includes('DRY') ? '#ef4444' : '#10b981' }}>{poolStatus || 'STANDBY'}</div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>PLATFORM: <strong style={{ color: activePlatform === 'Whop' ? '#38bdf8' : '#ffb800' }}>{(activePlatform || 'NONE').toUpperCase()}</strong> • EST. REMAINING: <strong style={{ color: '#E2E8F0' }}>{runwayDays} DAYS</strong></div>
          </div>

          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>TOTAL CLICKS / VIEWS (@EchoPodMedia)</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => { const n = totalClicks + 250; setTotalClicks(n); syncBountyStats({ totalClicks: n }); }} style={{ background: '#14171c', border: '1px solid #334155', color: '#10b981', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}>+250</button>
                <button onClick={() => { const n = totalClicks + 1000; setTotalClicks(n); syncBountyStats({ totalClicks: n }); }} style={{ background: '#14171c', border: '1px solid #334155', color: '#ffb800', fontSize: '9px', padding: '2px 5px', cursor: 'pointer' }}>+1K</button>
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{totalClicks.toLocaleString()} CLICKS <span style={{ fontSize: '11px', color: '#10b981' }}>(${estEarnings} EST.)</span></div>
            <div style={{ fontSize: '10px', color: totalClicks >= Number(viewFloor || 0) ? '#10b981' : '#ffb800', marginTop: '4px' }}>VIEW FLOOR: {Number(viewFloor || 0).toLocaleString()}</div>
          </div>

          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>DAILY POST ALLOCATION (STEALTH CAP 6/DAY • 3/CAMPAIGN)</span>
              <span style={{ fontSize: '9px', color: '#38bdf8', border: '1px solid #1f242d', padding: '1px 5px' }}>CRON-GOVERNED</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: totalDailyUsedAcrossAll >= dailyPostCap ? '#ef4444' : '#38bdf8' }}>{totalDailyUsedAcrossAll} / {dailyPostCap} POSTS DISPATCHED</div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              {remainingGlobalSlots > 0
                ? <>OPEN SLOTS TODAY: <strong style={{ color: '#10b981' }}>{remainingGlobalSlots} SLOTS</strong></>
                : <strong style={{ color: '#ffb800' }}>CRON SLEEPING UNTIL NEW DAY / BETTER BOUNTY</strong>}
            </div>
          </div>

          <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '6px' }}>TESS QUANT VERDICT</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb800' }}>{cpmRate || '$0.00'} CPM // {poolStatus.includes('DRY') ? 'AUTO-PURGING' : 'KEEP RUNNING'}</div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>NETWORK: <strong style={{ color: '#fff' }}>{(activePlatform || 'NONE').toUpperCase()}</strong> • {(campaignTitle || '').split('//')[0]}</div>
          </div>
        </div>
      )}

      {/* 3-COLUMN COCKPIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* COLUMN 01: BOUNTY RULES */}
        <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>01 // BOUNTY RULES ({(activePlatform || 'STANDBY').toUpperCase()})</span>
            {activeBountyId && (
              <button onClick={handlePurgeBounty} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '10px', padding: '3px 8px', cursor: 'pointer' }}>[ PURGE FUNNEL ]</button>
            )}
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>CAMPAIGN TARGET</label>
            <input type="text" value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} onBlur={() => syncBountyStats()} placeholder="No active bounty selected" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#fff', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>CPM RATE</label>
              <input type="text" value={cpmRate} onChange={e => setCpmRate(e.target.value)} onBlur={() => syncBountyStats()} placeholder="$0.00" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#10b981', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>VIEW FLOOR</label>
              <input type="text" value={viewFloor} onChange={e => setViewFloor(e.target.value)} onBlur={() => syncBountyStats()} placeholder="0" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#ffb800', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>SOURCE PATH (AUTO-ASSIGNED PER BOUNTY)</label>
            <input type="text" value={sourceVideoPath} onChange={e => setSourceVideoPath(e.target.value)} onBlur={() => syncBountyStats()} placeholder="Clean slate" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#38bdf8', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>HOOK HEADLINE</label>
              <button onClick={() => setTranscriptDrawerOpen(!transcriptDrawerOpen)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '10px', cursor: 'pointer' }}>{transcriptDrawerOpen ? '[ CLOSE DRAWER ]' : '[ AI HOOK / YT URL ]'}</button>
            </div>
            <input type="text" value={hookHeadline} onChange={e => setHookHeadline(e.target.value)} onBlur={() => syncBountyStats()} placeholder="" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#ffb800', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
          </div>

          {transcriptDrawerOpen && (
            <div style={{ backgroundColor: '#14171c', border: '1px solid #38bdf8', padding: '10px', borderRadius: '4px' }}>
              <textarea rows={2} value={rawTranscript} onChange={e => setRawTranscript(e.target.value)} placeholder="Paste YouTube URL or Transcript..." style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#fff', fontSize: '10px', padding: '6px' }} />
              <button onClick={handleExtractHooks} disabled={isExtractingHooks} style={{ width: '100%', marginTop: '6px', backgroundColor: '#38bdf8', color: '#080a0c', border: 'none', fontWeight: 'bold', padding: '6px', cursor: 'pointer', fontSize: '11px' }}>
                {isExtractingHooks ? `EXTRACTING (${formatTimer(discoverSeconds)})...` : 'EXTRACT VIRAL HOOKS'}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>START TIME</label>
              <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="00:00:00" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#fff', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#94A3B8' }}>END TIME</label>
              <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="00:01:00" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#fff', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#94A3B8' }}>MANDATORY TAGS (SEO CLUSTER)</label>
            <input type="text" value={mandatoryTags} onChange={e => setMandatoryTags(e.target.value)} onBlur={() => syncBountyStats()} placeholder="" style={{ width: '100%', backgroundColor: '#080a0c', border: '1px solid #1f242d', color: '#38bdf8', padding: '6px', fontSize: '11px', marginTop: '4px' }} />
          </div>

          <button
            onClick={handleUpdateDailyDispatches}
            disabled={pipelineState === 'RUNNING'}
            style={{
              backgroundColor: pipelineState === 'RUNNING' ? '#1f242d' : '#ffb800',
              color: pipelineState === 'RUNNING' ? '#ffb800' : '#080a0c',
              border: pipelineState === 'RUNNING' ? '1px solid #ffb800' : 'none',
              fontWeight: 'bold',
              padding: '10px',
              fontSize: '11px',
              cursor: pipelineState === 'RUNNING' ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {pipelineState === 'RUNNING' ? (
              <>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #ffb800', borderTopColor: 'transparent', borderRadius: '50%', animation: 'mcncSpin 0.8s linear infinite' }} />
                <span>UPDATING DAILY DISPATCHES ({formatTimer(elapsedSeconds)})</span>
              </>
            ) : (
              '⚡ UPDATE DAILY DISPATCHES'
            )}
          </button>
        </div>

        {/* COLUMN 02: CLINICAL TELEMETRY FEED */}
        <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>02 // TELEMETRY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: pipelineState === 'RUNNING' ? '#ffb800' : pipelineState === 'COMPLETE' ? '#10b981' : pipelineState === 'FAILED' ? '#ef4444' : '#94A3B8', fontSize: '11px', fontWeight: 'bold' }}>
                [{pipelineState === 'RUNNING' ? `RUNNING ${formatTimer(elapsedSeconds)}` : pipelineState}]
              </span>
              <button
                onClick={handleClearTelemetry}
                style={{ background: '#14171c', border: '1px solid #334155', color: '#94A3B8', fontSize: '10px', padding: '2px 8px', cursor: 'pointer', borderRadius: '2px' }}
              >
                [ CLEAR SCREEN ]
              </button>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#080a0c', border: '1px solid #1f242d', borderRadius: '4px', padding: '10px', fontSize: '11px', overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {telemetryLog.map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.includes('FAILED') || log.includes('ERROR') || log.includes('PURGE')
                    ? '#ef4444'
                    : log.includes('COMPLETE') || log.includes('SAVED') || log.includes('UPLOADED') || log.includes('VERIFIED')
                    ? '#10b981'
                    : log.includes('[1/4') || log.includes('[2/4') || log.includes('[3/4') || log.includes('[4/4') || log.includes('[GOVERNOR') || log.includes('[CRON')
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
        <div style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '4px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>03 // DISK ARTIFACTS ({artifacts.length})</span>
            <button onClick={() => loadDiskArtifacts(selectedProjectId, activeBountyId)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '11px' }}>[SCAN DISK]</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {artifacts.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>No physical artifacts found in workspace.</div>
            ) : (
              artifacts.map((art, idx) => {
                const artKey = art.id || art.name || String(idx);
                const titleFlashing = !!copiedFlash[`title_${artKey}`];
                const titleEverCopied = !!copiedHistory[`title_${artKey}`];
                const descFlashing = !!copiedFlash[`desc_${artKey}`];
                const descEverCopied = !!copiedHistory[`desc_${artKey}`];
                const previewTitle = buildOrganicTitle(art.name, idx);
                return (
                  <div key={artKey} style={{ backgroundColor: '#080a0c', border: '1px solid #1f242d', padding: '10px', borderRadius: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ color: '#10b981', fontSize: '10px' }}>{art.sizeKb || art.size || '0'} KB</span>
                        <button
                          onClick={() => handleDeleteArtifact(art.name)}
                          title="Delete published clip from disk"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.45)',
                            color: '#ef4444',
                            fontSize: '10px',
                            padding: '1px 5px',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            lineHeight: 1.2
                          }}
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#ffb800', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      TITLE: {previewTitle}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>MODIFIED: {art.modified || 'N/A'} | STATE: {art.status || 'SYNCED'}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => triggerCopyWithFeedback(`title_${artKey}`, previewTitle)}
                        style={{
                          flex: 1,
                          backgroundColor: titleFlashing ? 'rgba(16, 185, 129, 0.22)' : '#14171c',
                          border: titleFlashing ? '1px solid #10b981' : '1px solid #1f242d',
                          color: titleFlashing ? '#10b981' : '#94A3B8',
                          fontWeight: titleFlashing ? 'bold' : 'normal',
                          fontSize: '10px',
                          padding: '5px',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        {titleFlashing ? '✓ COPIED TITLE' : (titleEverCopied ? '✓ COPY TITLE' : 'COPY TITLE')}
                      </button>
                      <button
                        onClick={() => triggerCopyWithFeedback(`desc_${artKey}`, buildCreativeSeoDesc(art.name, idx))}
                        style={{
                          flex: 1,
                          backgroundColor: descFlashing ? 'rgba(16, 185, 129, 0.22)' : '#14171c',
                          border: descFlashing ? '1px solid #10b981' : '1px solid #1f242d',
                          color: descFlashing ? '#10b981' : '#94A3B8',
                          fontWeight: descFlashing ? 'bold' : 'normal',
                          fontSize: '10px',
                          padding: '5px',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        {descFlashing ? '✓ COPIED SEO' : (descEverCopied ? '✓ COPY SEO DESC' : 'COPY SEO DESC')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
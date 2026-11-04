// ============================================================================
// WARLORD WASP // MCNC FRONTEND // TAB 03: PROJECTS (DISK-TRUTH + CRON EDITION)
// ============================================================================

import React, { useState, useEffect } from 'react';
import NewProjectModal from './NewProjectModal';
import NewCronModal from './NewCronModal';

const PIPELINE_API_BASE = 'http://localhost:8082/api';

const ARCHETYPES = [
  {
    id: 'COMMERCE',
    label: 'DIGITAL COMMERCE // INFO-PRODUCT',
    desc: 'Ebooks, digital goods, 1-page landing funnels, SEO & Leads.',
    icon: '🛒',
    dirs: ['01_PRD', '02_LANDING_PAGE', '03_SEO_METADATA', '04_EMAIL_SEQUENCES', '05_PAYMENT_PORTALS', 'Web_And_Social', 'Assets_And_Artwork', 'Leads'],
    prd: `# DIGITAL COMMERCE PRD\n\n## 1. Funnel Architecture\n- 1-page landing sales copy\n- Lead-gen capture hook\n- SEO metadata pack\n\n## 2. Email Sourcing & Sequences\n- Welcome, Pitch, Abandoned Cart\n\n## 3. Payment Portals\n- Stripe / Crypto / Fast-checkout`
  },
  {
    id: 'PHILANTHROPY',
    label: 'PHILANTHROPIC TRUST',
    desc: 'The Chief Madothi Model: Transparency, human-centric, zero-fee direct.',
    icon: '🌍',
    dirs: ['01_PRD', '02_GOVERNANCE', '03_DONATION_LEDGER', '04_DISBURSEMENT_REPORTS', '05_TRANSPARENCY_DOCS', 'Web_And_Social', 'Responses_And_Donations'],
    prd: `# PHILANTHROPIC TRUST PRD\n\n## 1. Transparency Ledger\n- Live donation tracking\n- Impact matrix (Human-centric)\n\n## 2. Disbursements\n- Zero-fee direct funding protocols\n- Direct nutrition & school fee routing`
  },
  {
    id: 'HIGHRISK',
    label: 'HIGH-RISK VENTURE',
    desc: 'Peptides & Research: Age-gated, Decoupled Funnels, RUO.',
    icon: '☣️',
    dirs: ['01_PRD', '02_COMPLIANCE_LEGAL', '03_AGE_GATE_MODALS', '04_LAB_COA_REPORTS', '05_HIGH_RISK_MERCHANT', 'Web_And_Social', 'Assets_And_Artwork'],
    prd: `# HIGH-RISK VENTURE PRD\n\n## 1. Decoupled Funnel\n- Educational Hub vs Commercial Storefront\n- Age-verification & RUO enforcement\n\n## 2. Compliance\n- CoA lookup frames\n- High-risk payment routing`
  },
  {
    id: 'QUANT',
    label: 'QUANT ALGORITHMIC',
    desc: 'Rhythm Trading: MQL5, Python, automated execution scripts.',
    icon: '📈',
    dirs: ['01_PRD', '02_STRATEGY_SCHEMAS', '03_BACKTEST_DATA', '04_MQL_SCRIPTS', '05_RISK_PARAMS', 'Source_Artifacts', 'Tick_Data'],
    prd: `# QUANT ALGORITHMIC PRD\n\n## 1. Strategy Specs\n- Entry/Exit triggers\n- Tick & Candle data intake pipes\n\n## 2. Risk Management\n- Max drawdown limits\n- Exposure thresholds\n\n## 3. Execution Bridge\n- MQL5 / Python bridge boilerplate`
  },
  {
    id: 'BLANK',
    label: 'CUSTOM / MANUAL',
    desc: 'Open the standard MCNC project intake form for manual configuration.',
    icon: '⚙️',
    dirs: [],
    prd: ''
  }
];

export default function Tab03Projects({ onNavigateToWarRoom }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);
  const [archeprojectName, setArcheprojectName] = useState('');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState('COMMERCE');

  const [cronModalTarget, setCronModalTarget] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedPillarProjectId, setExpandedPillarProjectId] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [projects, setProjects] = useState([]);

  const fetchDiskProjects = async () => {
    try {
      const res = await fetch(`${PIPELINE_API_BASE}/projects`);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setServerOnline(true);
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('[!] Pipeline server on 8082 unreachable:', err.message);
      setServerOnline(false);
    }
  };

  useEffect(() => {
    fetchDiskProjects();
    const interval = setInterval(fetchDiskProjects, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateProjectLocally = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleToggleArchive = async (id, e) => {
    e.stopPropagation();
    const target = projects.find(p => p.id === id);
    if (!target) return;

    const confirmArchive = window.confirm(`ARCHIVE TO OBSIDIAN: Move [${target.name}] to Obsidian Vault Archive and purge active tab ledgers?`);
    if (!confirmArchive) return;

    try {
      await fetch(`${PIPELINE_API_BASE}/projects/archive-obsidian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: target.name })
      });

      try {
        const stored = JSON.parse(localStorage.getItem('MCNC_PROJECT_LIST') || '[]');
        localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(stored.filter(p => p !== target.name)));
      } catch (err) {}

      window.dispatchEvent(new CustomEvent('mcnc-project-purged', { detail: { projectName: target.name } }));
      window.dispatchEvent(new CustomEvent('MCNC_REVERT_CHAT'));

      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      fetchDiskProjects();
    } catch (err) {
      console.error('[!] Failed to archive project:', err);
    }
  };

  const handlePermanentDelete = async (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`NUCLEAR PURGE: Obliterate [${name}] from disk, active ledgers, chats, and all tabs?`);
    if (!confirmDelete) return;

    try {
      await fetch(`${PIPELINE_API_BASE}/projects/purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: name })
      });

      try {
        const stored = JSON.parse(localStorage.getItem('MCNC_PROJECT_LIST') || '[]');
        localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(stored.filter(p => p !== name)));
      } catch (err) {}

      window.dispatchEvent(new CustomEvent('mcnc-project-purged', { detail: { projectName: name } }));
      window.dispatchEvent(new CustomEvent('MCNC_REVERT_CHAT'));

      setProjects(prev => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      if (expandedPillarProjectId === id) setExpandedPillarProjectId(null);
      fetchDiskProjects();
    } catch (err) {
      console.error('[!] Failed to purge project:', err);
    }
  };

  const handleSaveProject = async (formData) => {
    const rawName = formData.name || `PROJECT_${Date.now()}`;
    const cleanId = rawName.trim().replace(/[^a-zA-Z0-9_\- ]/g, '_');

    const dynamicDirs = formData.required_directories && Array.isArray(formData.required_directories)
      ? formData.required_directories
      : ['Leads', 'Responses_And_Donations', 'Assets_And_Artwork', 'Web_And_Social', 'Source_Artifacts'];

    try {
      await fetch(`${PIPELINE_API_BASE}/projects/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: cleanId,
          subdirectories: dynamicDirs,
          prdPayload: formData
        })
      });

      // Dispatch global broadcast across all tabs to sync instantaneously
      window.dispatchEvent(new CustomEvent('mcnc-project-created', { detail: { projectName: rawName } }));
      window.dispatchEvent(new CustomEvent('MCNC_REVERT_CHAT'));
      
      try {
        const stored = JSON.parse(localStorage.getItem('MCNC_PROJECT_LIST') || '[]');
        if (!stored.includes(rawName)) {
          stored.push(rawName);
          localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(stored));
        }
      } catch (e) {}

    } catch (err) {
      console.error('[!] Failed to provision project on disk:', err);
    }

    setIsModalOpen(false);
    setShowArchetypeModal(false);
    fetchDiskProjects();
  };

  const handleDeployArchetype = () => {
    const targetArch = ARCHETYPES.find(a => a.id === selectedArchetypeId);
    if (targetArch.id === 'BLANK') {
      setShowArchetypeModal(false);
      setIsModalOpen(true);
      return;
    }
    
    if (!archeprojectName.trim()) {
      alert("Please enter a Venture Codename.");
      return;
    }

    const formData = {
      name: archeprojectName,
      required_directories: targetArch.dirs,
      prdContent: targetArch.prd
    };

    handleSaveProject(formData);
    setArcheprojectName('');
  };

  const handlePushToWarRoom = (formData, warRoomPayload) => {
    handleSaveProject(formData);
    if (onNavigateToWarRoom) {
      onNavigateToWarRoom(warRoomPayload);
    }
  };

  const handleSaveCronJob = (cronData) => {
    const target = projects.find(p => p.id === cronModalTarget.id);
    if (target) {
      updateProjectLocally({ ...target, cronJobs: [...(target.cronJobs || []), cronData] });
    }
    setCronModalTarget(null);
  };

  const handleToggleCronStatus = (projectId, cronId) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      updateProjectLocally({
        ...target,
        cronJobs: (target.cronJobs || []).map(c => 
          c.id === cronId ? { ...c, status: c.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' } : c
        )
      });
    }
  };

  const handleDeleteCron = (projectId, cronId) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      updateProjectLocally({ ...target, cronJobs: (target.cronJobs || []).filter(c => c.id !== cronId) });
    }
  };

  const totalIngested = projects.length;
  const activePipelines = projects.filter((p) => p.status === 'ACTIVE').length;
  const archivedCount = projects.filter((p) => p.status === 'ARCHIVED').length;
  const totalFiles = projects.reduce((acc, p) => acc + (p.fileCount || 0), 0);

  const displayedProjects = projects.filter((p) => {
    if (selectedProjectId) return p.id === selectedProjectId;
    if (filter === 'ACTIVE') return p.status === 'ACTIVE';
    if (filter === 'ARCHIVED') return p.status === 'ARCHIVED';
    return true;
  });

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 80px)', backgroundColor: '#080a0c', color: '#fff', fontFamily: 'monospace', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR: ON-DISK DIRECTORY */}
      <div style={{ width: '260px', minWidth: '260px', backgroundColor: '#0a0d10', borderRight: '1px solid #1f242d', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #1f242d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.05em' }}>📁 PROJECT DIRECTORY</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '8px', padding: '2px 4px', backgroundColor: serverOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: serverOnline ? '#10b981' : '#ef4444', border: `1px solid ${serverOnline ? '#10b981' : '#ef4444'}` }}>
              {serverOnline ? 'DISK: 8082' : 'OFFLINE'}
            </span>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255, 184, 0, 0.1)', border: '1px solid #ffb800', color: '#ffb800', padding: '2px 6px', borderRadius: '2px' }}>
              {projects.length} REG
            </span>
          </div>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid #1f242d' }}>
          <button
            onClick={() => setShowArchetypeModal(true)}
            style={{ width: '100%', padding: '10px 8px', backgroundColor: 'rgba(255, 184, 0, 0.12)', border: '1px solid #ffb800', color: '#ffb800', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            + NEW PROJECT INTAKE
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <div onClick={() => setSelectedProjectId(null)} style={{ padding: '10px', border: selectedProjectId === null ? '1px solid #ffb800' : '1px solid #1f242d', backgroundColor: selectedProjectId === null ? '#14171c' : '#080a0c', color: selectedProjectId === null ? '#ffb800' : '#C5BD9F', fontSize: '11px', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>[00] VIEW ALL PROJECTS</span><span>›</span>
          </div>

          {projects.map((proj) => (
            <div key={proj.id} onClick={() => setSelectedProjectId(proj.id)} style={{ padding: '10px', border: selectedProjectId === proj.id ? '1px solid #ffb800' : '1px solid #1f242d', backgroundColor: selectedProjectId === proj.id ? '#14171c' : '#080a0c', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: selectedProjectId === proj.id ? '#ffb800' : '#fff', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '125px' }}>
                {proj.name}
              </span>
              <span style={{ fontSize: '9px', padding: '2px 5px', border: `1px solid ${proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8'}`, color: proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8' }}>
                {proj.fileCount || 0} FILES
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1f242d', backgroundColor: '#0a0d10', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>❖ 03 PROJECTS // DISK-TRUTH DIRECTORY BOARD</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'ACTIVE', 'ARCHIVED'].map((f) => (
              <button key={f} onClick={() => { setFilter(f); setSelectedProjectId(null); }} style={{ padding: '4px 12px', backgroundColor: filter === f && !selectedProjectId ? '#ffb800' : '#080a0c', border: filter === f && !selectedProjectId ? '1px solid #ffb800' : '1px solid #1f242d', color: filter === f && !selectedProjectId ? '#080a0c' : '#94a3b8', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', cursor: 'pointer' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '20px 24px', borderBottom: '1px solid #1f242d' }}>
          {[ { label: 'PROJECTS ON DISK', val: totalIngested, col: '#fff' }, { label: 'ACTIVE PIPELINES', val: activePipelines, col: '#38bdf8' }, { label: 'TOTAL ARTIFACTS', val: totalFiles, col: '#10b981' }, { label: 'ARCHIVED', val: archivedCount, col: '#94a3b8' } ].map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.col, marginBottom: '4px' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedProjects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #1f242d' }}>NO ON-DISK PROJECTS FOUND IN DATA/PROJECTS/.</div>
          ) : (
            displayedProjects.map((proj) => {
              const isArchived = proj.status === 'ARCHIVED';
              const strokeColor = isArchived ? '#64748b' : '#38bdf8';

              return (
                <div key={proj.id} style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', borderRadius: '2px', padding: '20px', opacity: isArchived ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb800' }}>{proj.name}</span>
                        {proj.industry && <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#14171c', color: '#C5BD9F', border: '1px solid #1f242d' }}>{proj.industry}</span>}
                        {proj.dominantMetric && <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(255, 184, 0, 0.1)', color: '#ffb800', border: '1px solid rgba(255, 184, 0, 0.3)' }}>{proj.dominantMetric}</span>}
                        <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>FILES: {proj.fileCount || 0}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{proj.description}</div>

                      {proj.directories && proj.directories.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>ON DISK:</span>
                          {proj.directories.map((dir, i) => (
                            <span key={i} style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#080a0c', color: '#cbd5e1', border: '1px solid #1f242d' }}>📁 /{dir}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 'bold', border: `1px solid ${strokeColor}`, color: strokeColor, backgroundColor: 'rgba(0,0,0,0.3)' }}>{proj.status}</span>
                      <button onClick={(e) => { e.stopPropagation(); setExpandedPillarProjectId(expandedPillarProjectId === proj.id ? null : proj.id); }} style={{ background: expandedPillarProjectId === proj.id ? '#ffb800' : 'rgba(255, 184, 0, 0.1)', border: '1px solid #ffb800', color: expandedPillarProjectId === proj.id ? '#080a0c' : '#ffb800', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', marginLeft: '8px' }}>{expandedPillarProjectId === proj.id ? '▲ CLOSE DETAILS' : '🏛️ VIEW PILLARS & DAEMONS'}</button>
                      <button onClick={(e) => handleToggleArchive(proj.id, e)} title={isArchived ? "Restore to Active" : "Archive Manifest"} style={{ background: isArchived ? 'rgba(56, 189, 248, 0.15)' : '#14171c', border: `1px solid ${isArchived ? '#38bdf8' : '#1f242d'}`, color: isArchived ? '#38bdf8' : '#94a3b8', cursor: 'pointer', padding: '3px 6px', fontSize: '11px', marginLeft: '8px' }}>📦</button>
                      <button onClick={(e) => handlePermanentDelete(proj.id, proj.name, e)} title="Permanent Delete Manifest" style={{ background: '#14171c', border: '1px solid #1f242d', color: '#ef4444', cursor: 'pointer', padding: '3px 6px', fontSize: '11px' }}>🗑</button>
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid #14171c', paddingTop: '8px', marginTop: '8px' }}>PATH: {proj.path}</div>

                  {expandedPillarProjectId === proj.id && (
                    <div style={{ marginTop: '16px', backgroundColor: '#0a0d10', border: '1px solid #1f242d', borderTop: '2px solid #ffb800', padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div>
                        <div style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px', marginBottom: '12px' }}>PHYSICAL ARTIFACTS ON DISK:</div>
                        {(!proj.files || proj.files.length === 0) ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '10px', border: '1px dashed #1f242d' }}>NO FILES CREATED IN SUBDIRECTORIES YET.</div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                            {proj.files.map((file, idx) => (
                              <div key={idx} style={{ padding: '8px', backgroundColor: '#0d0f12', border: '1px solid #1f242d', fontSize: '10px', color: '#38bdf8' }}>📄 {file}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid #1f242d', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div>
                            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '11px' }}>⏱️ SCHEDULED CRON DAEMONS</span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '8px' }}>Automated background processes attached to this venture</span>
                          </div>
                          <button onClick={() => setCronModalTarget({ id: proj.id, name: proj.name })} style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>+ ATTACH CRON DAEMON</button>
                        </div>
                        {(!proj.cronJobs || proj.cronJobs.length === 0) ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '10px', border: '1px dashed #1f242d' }}>NO SCHEDULED DAEMONS ATTACHED. CLICK '+ ATTACH CRON DAEMON' TO SCHEDULE ONE.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {proj.cronJobs.map((cron) => (
                              <div key={cron.id} style={{ backgroundColor: '#0d0f12', border: '1px solid #1f242d', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '11px' }}>[{cron.id}] {cron.title}</span>
                                    <span style={{ fontSize: '9px', padding: '1px 5px', border: `1px solid ${cron.status === 'RUNNING' ? '#10b981' : '#64748b'}`, color: cron.status === 'RUNNING' ? '#10b981' : '#64748b', backgroundColor: 'rgba(0,0,0,0.3)' }}>● {cron.status}</span>
                                    <span style={{ color: '#ffb800', fontSize: '10px' }}>⚡ {cron.director}</span>
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    <span>CADENCE: <strong style={{ color: '#fff' }}>{cron.cadence} ({cron.cronExpression})</strong></span>
                                    <span style={{ marginLeft: '12px' }}>CMD: <strong style={{ color: '#10b981' }}>{cron.targetCommand}</strong></span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button onClick={() => handleToggleCronStatus(proj.id, cron.id)} style={{ background: cron.status === 'RUNNING' ? '#1f242d' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${cron.status === 'RUNNING' ? '#333' : '#10b981'}`, color: cron.status === 'RUNNING' ? '#94a3b8' : '#10b981', fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>{cron.status === 'RUNNING' ? 'PAUSE' : 'RESUME'}</button>
                                  <button onClick={() => handleDeleteCron(proj.id, cron.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: '2px 4px' }}>✕</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ARCHETYPES SELECTOR MODAL */}
      {showArchetypeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5,7,10,0.85)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '880px', backgroundColor: '#0a0d14', border: '1px solid #ffb800', borderRadius: '4px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 0 40px rgba(0,0,0,0.9)' }}>
            <div style={{ fontSize: '14px', color: '#ffb800', fontWeight: 'bold', letterSpacing: '1px' }}>❖ SELECT VENTURE ARCHETYPE</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {ARCHETYPES.map(arch => (
                <div key={arch.id} onClick={() => setSelectedArchetypeId(arch.id)} style={{ border: selectedArchetypeId === arch.id ? '2px solid #ffb800' : '1px solid #1f242d', backgroundColor: selectedArchetypeId === arch.id ? '#14171c' : '#080a0c', padding: '16px', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '13px', color: selectedArchetypeId === arch.id ? '#ffb800' : '#38bdf8', fontWeight: 'bold' }}>{arch.icon} {arch.label}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', minHeight: '24px' }}>{arch.desc}</div>
                  {arch.dirs.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {arch.dirs.slice(0, 4).map(d => <span key={d} style={{ border: '1px solid #1f242d', padding: '3px 6px', backgroundColor: '#05070a' }}>{d}</span>)}
                      {arch.dirs.length > 4 && <span style={{ padding: '3px 6px' }}>+{arch.dirs.length - 4} more</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <input 
                value={archeprojectName} 
                onChange={e => setArcheprojectName(e.target.value)} 
                disabled={selectedArchetypeId === 'BLANK'} 
                placeholder={selectedArchetypeId === 'BLANK' ? "NAME ASSIGNED IN NEXT STEP..." : "ENTER VENTURE CODENAME..."} 
                style={{ flex: 1, backgroundColor: '#080a0c', border: '1px solid #38bdf8', color: '#fff', padding: '12px', fontSize: '13px', outline: 'none', fontFamily: 'monospace', opacity: selectedArchetypeId === 'BLANK' ? 0.5 : 1 }} 
              />
              <button onClick={handleDeployArchetype} style={{ backgroundColor: '#ffb800', color: '#080a0c', fontWeight: 'bold', padding: '0 24px', cursor: 'pointer', border: 'none', fontSize: '11px', letterSpacing: '1px' }}>
                {selectedArchetypeId === 'BLANK' ? 'CONTINUE TO MANUAL SETUP ➔' : 'SCAFFOLD WORKSPACE ⚡'}
              </button>
              <button onClick={() => setShowArchetypeModal(false)} style={{ backgroundColor: '#1f242d', color: '#fff', padding: '0 20px', cursor: 'pointer', border: 'none', fontSize: '11px', fontWeight: 'bold' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* ORIGINAL MANUAL PROJECT INTAKE MODAL (Triggered via "BLANK" Archetype) */}
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveProject={handleSaveProject} onPushToWarRoom={handlePushToWarRoom} />
      <NewCronModal isOpen={!!cronModalTarget} projectName={cronModalTarget?.name || ''} onClose={() => setCronModalTarget(null)} onSaveCron={handleSaveCronJob} />
    </div>
  );
}
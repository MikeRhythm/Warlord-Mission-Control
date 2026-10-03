import React, { useState } from 'react';
import NewProjectModal from './NewProjectModal';
import NewCronModal from './NewCronModal';

const DEFAULT_SEED_PROJECTS = [
  {
    id: '01',
    name: 'MAKING MONEY IDEAS',
    status: 'ACTIVE',
    description: 'PRD Executed. Task sequence handed off to Paperclip daemon.',
    progress: 33,
    tasksDone: 6,
    tasksTotal: 18,
    agent: 'MONTY // CHIEF OF STAFF',
    dispatched: '12:14:00 PM',
    industry: 'Corporate Strategy',
    stakeholder: 'Mike',
    dominantMetric: 'Speed to Market',
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#C5BD9F' },
      { id: '2', role: 'ACCENT', hex: '#ffb800' },
      { id: '3', role: 'CANVAS BG', hex: '#080a0c' }
    ],
    pillars: [
      {
        id: "P01",
        title: "Local Compliance & Entity Infrastructure",
        directors: ["VANCE", "TESS"],
        priority: "CRITICAL",
        status: "APPROVED",
        definitionOfDone: "ZAR banking rails mapped, POPIA legal constraints locked."
      },
      {
        id: "P02",
        title: "Regional Digital Portal & UI Dashboard",
        directors: ["CHARLIE", "ROXY"],
        priority: "HIGH",
        status: "STAGED",
        definitionOfDone: "Responsive Glassmorphic web presence live with Brand Hex tokens."
      },
      {
        id: "P03",
        title: "Lead Intake & Automated Outreach Pipeline",
        directors: ["JACK", "SKYLA"],
        priority: "MEDIUM",
        status: "LOCKED",
        definitionOfDone: "CRM ingestion endpoints verified with active SMTP dispatch."
      }
    ],
    cronJobs: [
      {
        id: 'CRON-01',
        title: 'NIGHTLY LEDGER RECONCILIATION',
        director: 'JACK',
        cadence: 'Daily (Midnight)',
        cronExpression: '0 0 * * *',
        targetCommand: 'npm run reconcile:wallets',
        status: 'RUNNING',
        lastRun: 'Yesterday 23:59',
        nextRun: 'Today 00:00'
      }
    ]
  }
];

export default function Tab03Projects({ onNavigateToWarRoom }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cronModalTarget, setCronModalTarget] = useState(null); // { id, name }
  const [filter, setFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  const [expandedPillarProjectId, setExpandedPillarProjectId] = useState(null);
  const [selectedDirectorFilter, setSelectedDirectorFilter] = useState('ALL');

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('MCNC_PROJECT_MANIFESTS');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading MCNC_PROJECT_MANIFESTS:', e);
    }
    return DEFAULT_SEED_PROJECTS;
  });

  const persistProjects = (updatedList) => {
    setProjects(updatedList);
    localStorage.setItem('MCNC_PROJECT_MANIFESTS', JSON.stringify(updatedList));
  };

  const handleToggleArchive = (id, e) => {
    e.stopPropagation();
    const updated = projects.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === 'ARCHIVED' ? (p.progress === 100 ? 'COMPLETED' : 'ACTIVE') : 'ARCHIVED';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    persistProjects(updated);
  };

  const handlePermanentDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`PERMANENT PURGE: Are you sure you want to completely erase [${name}] from the MCNC Manifest?`);
    if (confirmDelete) {
      const updated = projects.filter((p) => p.id !== id);
      persistProjects(updated);
      if (selectedProjectId === id) setSelectedProjectId(null);
      if (expandedPillarProjectId === id) setExpandedPillarProjectId(null);
    }
  };

  const handleSaveProject = (formData) => {
    const nextNumeric = projects.length > 0 
      ? Math.max(...projects.map(p => parseInt(p.id, 10) || 0)) + 1 
      : 1;
    const nextId = String(nextNumeric).padStart(2, '0');

    const newProject = {
      id: nextId,
      name: formData.name.toUpperCase() || `NEW PROJECT [${nextId}]`,
      status: 'ACTIVE',
      description: formData.objective || 'Discovery completed. Staged for PRD compilation.',
      progress: 0,
      tasksDone: 0,
      tasksTotal: formData.toolStack ? formData.toolStack.length : 4,
      agent: 'MONTY // CHIEF OF STAFF',
      dispatched: new Date().toLocaleTimeString(),
      industry: formData.industry,
      stakeholder: formData.stakeholder,
      contactEmail: formData.contactEmail,
      webStatus: formData.webStatus,
      webUrl: formData.webUrl,
      selectedSocials: formData.selectedSocials,
      dominantMetric: formData.dominantMetric,
      definitionOfDone: formData.definitionOfDone,
      forbiddenVectors: formData.forbiddenVectors,
      palette: formData.palette,
      uploadedFiles: formData.uploadedFiles || [],
      pillars: [],
      cronJobs: []
    };

    persistProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  const handlePushToWarRoom = (formData, warRoomPayload) => {
    handleSaveProject(formData);
    if (onNavigateToWarRoom) {
      onNavigateToWarRoom(warRoomPayload);
    }
  };

  // Add Cron Job to Specific Project
  const handleSaveCronJob = (cronData) => {
    const updated = projects.map(p => {
      if (p.id === cronModalTarget.id) {
        return {
          ...p,
          cronJobs: [...(p.cronJobs || []), cronData]
        };
      }
      return p;
    });
    persistProjects(updated);
    setCronModalTarget(null);
  };

  const handleToggleCronStatus = (projectId, cronId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          cronJobs: (p.cronJobs || []).map(c => {
            if (c.id === cronId) {
              return { ...c, status: c.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' };
            }
            return c;
          })
        };
      }
      return p;
    });
    persistProjects(updated);
  };

  const handleDeleteCron = (projectId, cronId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          cronJobs: (p.cronJobs || []).filter(c => c.id !== cronId)
        };
      }
      return p;
    });
    persistProjects(updated);
  };

  const totalIngested = projects.length;
  const activePipelines = projects.filter((p) => p.status === 'ACTIVE').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const archivedCount = projects.filter((p) => p.status === 'ARCHIVED').length;

  const displayedProjects = projects.filter((p) => {
    if (selectedProjectId) return p.id === selectedProjectId;
    if (filter === 'ACTIVE') return p.status === 'ACTIVE';
    if (filter === 'COMPLETED') return p.status === 'COMPLETED';
    if (filter === 'ARCHIVED') return p.status === 'ARCHIVED';
    return true;
  });

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 80px)',
      backgroundColor: '#080a0c',
      color: '#fff',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#0a0d10',
        borderRight: '1px solid #1f242d',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1f242d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.05em' }}>
            📁 PROJECT DIRECTORY
          </span>
          <span style={{
            fontSize: '10px',
            backgroundColor: 'rgba(255, 184, 0, 0.1)',
            border: '1px solid #ffb800',
            color: '#ffb800',
            padding: '2px 6px',
            borderRadius: '2px'
          }}>
            {projects.length} REG
          </span>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid #1f242d' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%',
              padding: '10px 8px',
              backgroundColor: 'rgba(255, 184, 0, 0.12)',
              border: '1px solid #ffb800',
              color: '#ffb800',
              fontWeight: 'bold',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
            + NEW PROJECT INTAKE
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <div
            onClick={() => setSelectedProjectId(null)}
            style={{
              padding: '10px',
              border: selectedProjectId === null ? '1px solid #ffb800' : '1px solid #1f242d',
              backgroundColor: selectedProjectId === null ? '#14171c' : '#080a0c',
              color: selectedProjectId === null ? '#ffb800' : '#C5BD9F',
              fontSize: '11px',
              marginBottom: '8px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span>[00] VIEW ALL MANIFESTS</span>
            <span>›</span>
          </div>

          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              style={{
                padding: '10px',
                border: selectedProjectId === proj.id ? '1px solid #ffb800' : '1px solid #1f242d',
                backgroundColor: selectedProjectId === proj.id ? '#14171c' : '#080a0c',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <span style={{
                color: selectedProjectId === proj.id ? '#ffb800' : '#fff',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '125px'
              }}>
                [{proj.id}] {proj.name}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 5px',
                border: `1px solid ${
                  proj.status === 'COMPLETED' ? '#10b981' : 
                  proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8'
                }`,
                color: 
                  proj.status === 'COMPLETED' ? '#10b981' : 
                  proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8'
              }}>
                {proj.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Top Control Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1f242d',
          backgroundColor: '#0a0d10',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '12px' }}>
            ❖ 03 PROJECTS // PORTFOLIO MANIFEST BOARD
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedProjectId(null); }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: filter === f && !selectedProjectId ? '#ffb800' : '#080a0c',
                  border: filter === f && !selectedProjectId ? '1px solid #ffb800' : '1px solid #1f242d',
                  color: filter === f && !selectedProjectId ? '#080a0c' : '#94a3b8',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '20px 24px',
          borderBottom: '1px solid #1f242d'
        }}>
          {[
            { label: 'TOTAL INGESTED', val: totalIngested, col: '#fff' },
            { label: 'ACTIVE PIPELINES', val: activePipelines, col: '#38bdf8' },
            { label: '100% SHIPPED', val: completedCount, col: '#10b981' },
            { label: 'ARCHIVED', val: archivedCount, col: '#94a3b8' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              backgroundColor: '#0d0f12',
              border: '1px solid #1f242d',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.col, marginBottom: '4px' }}>
                {stat.val}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Projects Feed */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedProjects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #1f242d' }}>
              NO PROJECT MANIFESTS MATCHING CURRENT CRITERIA.
            </div>
          ) : (
            displayedProjects.map((proj) => {
              const isDone = proj.status === 'COMPLETED';
              const isArchived = proj.status === 'ARCHIVED';
              const strokeColor = isDone ? '#10b981' : isArchived ? '#64748b' : '#38bdf8';

              return (
                <div key={proj.id} style={{
                  backgroundColor: '#0d0f12',
                  border: '1px solid #1f242d',
                  borderRadius: '2px',
                  padding: '20px',
                  opacity: isArchived ? 0.65 : 1
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                          {proj.name}
                        </span>
                        {proj.industry && (
                          <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#14171c', color: '#C5BD9F', border: '1px solid #1f242d' }}>
                            {proj.industry}
                          </span>
                        )}
                        {proj.dominantMetric && (
                          <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(255, 184, 0, 0.1)', color: '#ffb800', border: '1px solid rgba(255, 184, 0, 0.3)' }}>
                            {proj.dominantMetric}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                        {proj.description}
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        fontWeight: 'bold',
                        border: `1px solid ${strokeColor}`,
                        color: strokeColor,
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}>
                        {proj.status}
                      </span>
                      
                      {/* VIEW PILLARS TOGGLE */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPillarProjectId(expandedPillarProjectId === proj.id ? null : proj.id);
                        }}
                        style={{
                          background: expandedPillarProjectId === proj.id ? '#ffb800' : 'rgba(255, 184, 0, 0.1)',
                          border: '1px solid #ffb800',
                          color: expandedPillarProjectId === proj.id ? '#080a0c' : '#ffb800',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginLeft: '8px'
                        }}>
                        {expandedPillarProjectId === proj.id ? '▲ CLOSE DETAILS' : '🏛️ VIEW PILLARS & DAEMONS'}
                      </button>

                      <button
                        onClick={(e) => handleToggleArchive(proj.id, e)}
                        title={isArchived ? "Restore to Active" : "Archive Manifest"}
                        style={{
                          background: isArchived ? 'rgba(56, 189, 248, 0.15)' : '#14171c',
                          border: `1px solid ${isArchived ? '#38bdf8' : '#1f242d'}`,
                          color: isArchived ? '#38bdf8' : '#94a3b8',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          fontSize: '11px',
                          marginLeft: '8px'
                        }}>
                        📦
                      </button>

                      <button
                        onClick={(e) => handlePermanentDelete(proj.id, proj.name, e)}
                        title="Permanent Delete Manifest"
                        style={{
                          background: '#14171c',
                          border: '1px solid #1f242d',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          fontSize: '11px'
                        }}>
                        🗑
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: strokeColor, marginBottom: '8px' }}>
                    <span>{isDone ? '⊙ 100% COMPLETED' : `⊙ ${proj.progress}% COMPLETED`}</span>
                    <span>{proj.tasksDone} / {proj.tasksTotal} TASKS</span>
                  </div>

                  <div style={{ width: '100%', height: '3px', backgroundColor: '#14171c', marginBottom: '14px' }}>
                    <div style={{
                      width: `${proj.progress}%`,
                      height: '100%',
                      backgroundColor: strokeColor,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '10px',
                    color: '#94a3b8',
                    borderTop: '1px solid #14171c',
                    paddingTop: '10px'
                  }}>
                    <div>{proj.agent}</div>
                    <div>DISPATCHED: {proj.dispatched}</div>
                  </div>

                  {/* EXPANDABLE DETAILS: PILLARS + CRON DAEMONS */}
                  {expandedPillarProjectId === proj.id && (
                    <div style={{
                      marginTop: '16px',
                      backgroundColor: '#0a0d10',
                      border: '1px solid #1f242d',
                      borderTop: '2px solid #ffb800',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px'
                    }}>
                      {/* 1. ATOMIC PILLARS SECTION */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px' }}>
                              🏛️ ATOMIC CORE PILLARS
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '8px' }}>
                              Execute branch-by-branch
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#C5BD9F' }}>FILTER:</span>
                            {['ALL', 'CHARLIE', 'TESS', 'ROXY', 'JACK', 'SKYLA', 'VANCE'].map((dir) => (
                              <button
                                key={dir}
                                onClick={() => setSelectedDirectorFilter(dir)}
                                style={{
                                  background: selectedDirectorFilter === dir ? 'rgba(255, 184, 0, 0.2)' : '#080a0c',
                                  border: selectedDirectorFilter === dir ? '1px solid #ffb800' : '1px solid #1f242d',
                                  color: selectedDirectorFilter === dir ? '#ffb800' : '#94a3b8',
                                  fontSize: '9px',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  fontFamily: 'monospace'
                                }}>
                                {dir}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(!proj.pillars || proj.pillars.length === 0) ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '10px', border: '1px dashed #1f242d' }}>
                            NO DECONSTRUCTED PILLARS GENERATED YET.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {proj.pillars
                              .filter((pillar) => selectedDirectorFilter === 'ALL' || pillar.directors.includes(selectedDirectorFilter))
                              .map((pillar) => (
                                <div key={pillar.id} style={{
                                  backgroundColor: '#0d0f12',
                                  border: '1px solid #1f242d',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                      <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px' }}>
                                        [{pillar.id}] {pillar.title}
                                      </span>
                                      <span style={{
                                        fontSize: '8px',
                                        padding: '1px 4px',
                                        backgroundColor: pillar.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                                        color: pillar.priority === 'CRITICAL' ? '#ef4444' : '#38bdf8',
                                        border: `1px solid ${pillar.priority === 'CRITICAL' ? '#ef4444' : '#1f242d'}`
                                      }}>
                                        {pillar.priority}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                      <strong style={{ color: '#C5BD9F' }}>DoD:</strong> {pillar.definitionOfDone}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => alert(`DISPATCHING PILLAR [${pillar.id}] TO BASE ONE DAEMON.`)}
                                    style={{
                                      backgroundColor: 'rgba(255, 184, 0, 0.12)',
                                      border: '1px solid #ffb800',
                                      color: '#ffb800',
                                      padding: '6px 10px',
                                      fontSize: '9px',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                      fontFamily: 'monospace'
                                    }}>
                                    DISPATCH BRANCH ⚡
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* 2. SCHEDULED CRON DAEMONS SECTION */}
                      <div style={{ borderTop: '1px solid #1f242d', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div>
                            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '11px' }}>
                              ⏱️ SCHEDULED CRON DAEMONS
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '8px' }}>
                              Automated background processes attached to this venture
                            </span>
                          </div>

                          <button
                            onClick={() => setCronModalTarget({ id: proj.id, name: proj.name })}
                            style={{
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid #38bdf8',
                              color: '#38bdf8',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              padding: '3px 8px',
                              cursor: 'pointer',
                              fontFamily: 'monospace'
                            }}>
                            + ATTACH CRON DAEMON
                          </button>
                        </div>

                        {(!proj.cronJobs || proj.cronJobs.length === 0) ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '10px', border: '1px dashed #1f242d' }}>
                            NO SCHEDULED DAEMONS ATTACHED. CLICK '+ ATTACH CRON DAEMON' TO SCHEDULE ONE.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {proj.cronJobs.map((cron) => (
                              <div key={cron.id} style={{
                                backgroundColor: '#0d0f12',
                                border: '1px solid #1f242d',
                                padding: '10px 14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '11px' }}>
                                      [{cron.id}] {cron.title}
                                    </span>
                                    <span style={{
                                      fontSize: '9px',
                                      padding: '1px 5px',
                                      border: `1px solid ${cron.status === 'RUNNING' ? '#10b981' : '#64748b'}`,
                                      color: cron.status === 'RUNNING' ? '#10b981' : '#64748b',
                                      backgroundColor: 'rgba(0,0,0,0.3)'
                                    }}>
                                      ● {cron.status}
                                    </span>
                                    <span style={{ color: '#ffb800', fontSize: '10px' }}>
                                      ⚡ {cron.director}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                    <span>CADENCE: <strong style={{ color: '#fff' }}>{cron.cadence} ({cron.cronExpression})</strong></span>
                                    <span style={{ marginLeft: '12px' }}>CMD: <strong style={{ color: '#10b981' }}>{cron.targetCommand}</strong></span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    onClick={() => handleToggleCronStatus(proj.id, cron.id)}
                                    style={{
                                      background: cron.status === 'RUNNING' ? '#1f242d' : 'rgba(16, 185, 129, 0.15)',
                                      border: `1px solid ${cron.status === 'RUNNING' ? '#333' : '#10b981'}`,
                                      color: cron.status === 'RUNNING' ? '#94a3b8' : '#10b981',
                                      fontSize: '9px',
                                      padding: '3px 8px',
                                      cursor: 'pointer',
                                      fontFamily: 'monospace'
                                    }}>
                                    {cron.status === 'RUNNING' ? 'PAUSE' : 'RESUME'}
                                  </button>

                                  <button
                                    onClick={() => alert(`FORCING MANUAL DISPATCH: [${cron.title}] via ${cron.director}`)}
                                    style={{
                                      background: 'rgba(255, 184, 0, 0.1)',
                                      border: '1px solid #ffb800',
                                      color: '#ffb800',
                                      fontSize: '9px',
                                      padding: '3px 8px',
                                      cursor: 'pointer',
                                      fontFamily: 'monospace'
                                    }}>
                                    TRIGGER ⚡
                                  </button>

                                  <button
                                    onClick={() => handleDeleteCron(proj.id, cron.id)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ef4444',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      padding: '2px 4px'
                                    }}>
                                    ✕
                                  </button>
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

      {/* NEW PROJECT INTAKE MODAL */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveProject={handleSaveProject}
        onPushToWarRoom={handlePushToWarRoom}
      />

      {/* NEW CRON JOB ATTACH MODAL */}
      <NewCronModal
        isOpen={!!cronModalTarget}
        projectName={cronModalTarget?.name || ''}
        onClose={() => setCronModalTarget(null)}
        onSaveCron={handleSaveCronJob}
      />
    </div>
  );
}
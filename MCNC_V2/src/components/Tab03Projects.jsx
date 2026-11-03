// ============================================================================
// WARLORD WASP // MCNC FRONTEND // TAB 03: PROJECTS (DISK-TRUTH + CRON EDITION)
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC_V2\src\components\Tab03Projects.jsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import NewProjectModal from './NewProjectModal';
import NewCronModal from './NewCronModal';

const PIPELINE_API_BASE = 'http://localhost:8082/api';

export default function Tab03Projects({ onNavigateToWarRoom }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cronModalTarget, setCronModalTarget] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedPillarProjectId, setExpandedPillarProjectId] = useState(null);
  const [selectedDirectorFilter, setSelectedDirectorFilter] = useState('ALL');
  const [serverOnline, setServerOnline] = useState(false);
  const [projects, setProjects] = useState([]);

  // Fetch disk-truth projects directly from server_pipeline.js (Port 8082)
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

  // Update local state and trigger a re-fetch to sync with backend
  const updateProjectLocally = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    // Note: In a full implementation, you would also push this state change to Port 8082
    // e.g. await fetch(`${PIPELINE_API_BASE}/projects/${updatedProject.id}/update`, ...)
  };

  const handleToggleArchive = (id, e) => {
    e.stopPropagation();
    const target = projects.find(p => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    updateProjectLocally({ ...target, status: nextStatus });
  };

  const handlePermanentDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`PERMANENT PURGE: Are you sure you want to completely erase [${name}] from the MCNC Manifest?`);
    if (confirmDelete) {
      setProjects(prev => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
      if (expandedPillarProjectId === id) setExpandedPillarProjectId(null);
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
    } catch (err) {
      console.error('[!] Failed to provision project on disk:', err);
    }

    setIsModalOpen(false);
    fetchDiskProjects();
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
      updateProjectLocally({
        ...target,
        cronJobs: [...(target.cronJobs || []), cronData]
      });
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
      updateProjectLocally({
        ...target,
        cronJobs: (target.cronJobs || []).filter(c => c.id !== cronId)
      });
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
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 80px)',
      backgroundColor: '#080a0c',
      color: '#fff',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR: ON-DISK DIRECTORY */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '8px',
              padding: '2px 4px',
              backgroundColor: serverOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: serverOnline ? '#10b981' : '#ef4444',
              border: `1px solid ${serverOnline ? '#10b981' : '#ef4444'}`
            }}>
              {serverOnline ? 'DISK: 8082' : 'OFFLINE'}
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
            <span>[00] VIEW ALL PROJECTS</span>
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
                {proj.name}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 5px',
                border: `1px solid ${proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8'}`,
                color: proj.status === 'ARCHIVED' ? '#64748b' : '#38bdf8'
              }}>
                {proj.fileCount || 0} FILES
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
            ❖ 03 PROJECTS // DISK-TRUTH DIRECTORY BOARD
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'ACTIVE', 'ARCHIVED'].map((f) => (
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
            { label: 'PROJECTS ON DISK', val: totalIngested, col: '#fff' },
            { label: 'ACTIVE PIPELINES', val: activePipelines, col: '#38bdf8' },
            { label: 'TOTAL ARTIFACTS', val: totalFiles, col: '#10b981' },
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
              NO ON-DISK PROJECTS FOUND IN DATA/PROJECTS/.
            </div>
          ) : (
            displayedProjects.map((proj) => {
              const isArchived = proj.status === 'ARCHIVED';
              const strokeColor = isArchived ? '#64748b' : '#38bdf8';

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffb800' }}>
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
                        <span style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                          FILES: {proj.fileCount || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                        {proj.description}
                      </div>

                      {/* Render Real Subdirectories Scanned From Disk */}
                      {proj.directories && proj.directories.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>ON DISK:</span>
                          {proj.directories.map((dir, i) => (
                            <span key={i} style={{
                              fontSize: '9px',
                              padding: '2px 6px',
                              backgroundColor: '#080a0c',
                              color: '#cbd5e1',
                              border: '1px solid #1f242d'
                            }}>
                              📁 /{dir}
                            </span>
                          ))}
                        </div>
                      )}
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
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
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

                  {/* Physical Path Label */}
                  <div style={{
                    fontSize: '10px',
                    color: '#64748b',
                    borderTop: '1px solid #14171c',
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                    PATH: {proj.path}
                  </div>

                  {/* EXPANDABLE DETAILS: PILLARS + ARTIFACTS + CRON DAEMONS */}
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
                      
                      {/* 1. PHYSICAL ARTIFACTS ON DISK */}
                      <div>
                        <div style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '11px', marginBottom: '12px' }}>
                          PHYSICAL ARTIFACTS ON DISK:
                        </div>
                        {(!proj.files || proj.files.length === 0) ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '10px', border: '1px dashed #1f242d' }}>
                            NO FILES CREATED IN SUBDIRECTORIES YET.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                            {proj.files.map((file, idx) => (
                              <div key={idx} style={{
                                padding: '8px',
                                backgroundColor: '#0d0f12',
                                border: '1px solid #1f242d',
                                fontSize: '10px',
                                color: '#38bdf8'
                              }}>
                                📄 {file}
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
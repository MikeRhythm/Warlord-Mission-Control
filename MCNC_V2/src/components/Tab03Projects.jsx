import React, { useState, useEffect } from 'react';
import NewProjectModal from './NewProjectModal';

const DEFAULT_SEED_PROJECTS = [
  {
    id: '01',
    name: 'MAKING MONEY IDEAS',
    status: 'COMPLETED',
    description: 'PRD Executed. Task sequence handed off to Paperclip daemon.',
    progress: 100,
    tasksDone: 18,
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
    ]
  }
];

export default function Tab03Projects({ onNavigateToWarRoom }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Initialize strictly from localStorage to avoid resurrecting deleted projects
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

  // Toggle Archive / Restore
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

  // Permanent Hard Purge / Delete
  const handlePermanentDelete = (id, name, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`PERMANENT PURGE: Are you sure you want to completely erase [${name}] from the MCNC Manifest?`);
    if (confirmDelete) {
      const updated = projects.filter((p) => p.id !== id);
      persistProjects(updated);
      if (selectedProjectId === id) setSelectedProjectId(null);
    }
  };

  // Register New Project from Modal
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
      uploadedFiles: formData.uploadedFiles || []
    };

    persistProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  // Direct Handoff to War Room
  const handlePushToWarRoom = (formData, warRoomPayload) => {
    handleSaveProject(formData);
    if (onNavigateToWarRoom) {
      onNavigateToWarRoom(warRoomPayload);
    }
  };

  // Metric Counts
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
      {/* LEFT SIDEBAR: DIRECTORY */}
      <div style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#0a0d10',
        borderRight: '1px solid #1f242d',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
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

        {/* Action Button: Modal Trigger */}
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

        {/* Sidebar Project Manifest List */}
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

      {/* RIGHT MAIN PANEL: MANIFEST BOARD */}
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

          {/* Filter Pills */}
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

        {/* Metric Rack */}
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

        {/* Project Cards Feed */}
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

                    {/* Controls: Status Badge + Archive Toggle + Delete Purge */}
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

                      {/* Archive / Restore Button */}
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
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                        📦
                      </button>

                      {/* Hard Purge / Delete Button */}
                      <button
                        onClick={(e) => handlePermanentDelete(proj.id, proj.name, e)}
                        title="Permanent Delete Manifest"
                        style={{
                          background: '#14171c',
                          border: '1px solid #1f242d',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: strokeColor, marginBottom: '8px' }}>
                    <span>{isDone ? '⊙ 100% COMPLETED' : `⊙ ${proj.progress}% COMPLETED`}</span>
                    <span>{proj.tasksDone} / {proj.tasksTotal} TASKS</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div style={{ width: '100%', height: '3px', backgroundColor: '#14171c', marginBottom: '14px' }}>
                    <div style={{
                      width: `${proj.progress}%`,
                      height: '100%',
                      backgroundColor: strokeColor,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  {/* Footer Meta Details */}
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
    </div>
  );
}
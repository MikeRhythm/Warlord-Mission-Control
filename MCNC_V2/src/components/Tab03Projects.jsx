import React, { useState } from 'react';
import './Tab03Projects.css';

export default function Tab03Projects() {
    // Clean Zero-State: Projects populate dynamically from active state / telemetry
    const [projects, setProjects] = useState([]);

    const activeCount = projects.filter(p => p.status?.toLowerCase() === 'active').length;
    const planningCount = projects.filter(p => p.status?.toLowerCase() === 'planning').length;

    return (
        <div className="view-section tab-03-container">
            <h2 className="projects-header">03 PROJECTS // ACTIVE MANIFEST</h2>

            <div className="projects-header-stats">
                <span><strong className="hf-text-main">{projects.length}</strong> Total</span>
                <span><strong className="hf-text-main">{activeCount}</strong> Active</span>
                <span><strong className="hf-text-main">{planningCount}</strong> Planning</span>
            </div>

            <div className="projects-grid">
                {projects.length === 0 ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '30px',
                        textAlign: 'center',
                        color: 'var(--text-muted, #64748b)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.85rem',
                        border: '1px dashed rgba(255, 184, 0, 0.2)',
                        borderRadius: '4px'
                    }}>
                        ACTIVE MANIFEST ZERO-STATE // NO PROJECTS DISPATCHED
                    </div>
                ) : (
                    projects.map(proj => (
                        <div key={proj.id || proj.title} className="proj-card">
                            <div className="proj-header">
                                <div className="proj-title">{proj.title}</div>
                                <div className={`proj-status ${proj.status?.toLowerCase()}`}>{proj.status}</div>
                            </div>

                            <div className="proj-desc">{proj.desc}</div>

                            <div className="proj-progress-container">
                                <div className="proj-progress-labels">
                                    <span className="hf-accent-green">{proj.progress || 0}%</span>
                                    <span>{proj.completedTasks || 0}/{proj.totalTasks || 0}</span>
                                </div>
                                <div className="proj-progress-bar-bg">
                                    <div className="proj-progress-fill" style={{ width: `${proj.progress || 0}%` }}></div>
                                </div>
                            </div>

                            <div className="proj-footer">
                                <span className={`agent-badge badge-${proj.lead?.toLowerCase().replace(' ', '-')}`}>
                                    {proj.lead ? `${proj.lead.charAt(0)} ${proj.lead}` : 'UNASSIGNED'}
                                </span>
                                <span className={`proj-priority priority-${proj.priority?.toLowerCase() || 'normal'}`}>
                                    {proj.priority || 'Normal'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
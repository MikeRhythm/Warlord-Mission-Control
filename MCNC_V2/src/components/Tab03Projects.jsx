import React, { useState, useEffect } from 'react';
import './Tab03Projects.css';

export default function Tab03Projects() {
    // Clean Zero-State: Projects populate dynamically from active state / telemetry
    const [projects, setProjects] = useState([]);

    // 1. Loader function to read dispatched manifests from Base 1 Storage
    const loadProjects = () => {
        try {
            const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
            if (stored) {
                const parsedManifests = JSON.parse(stored);
                
                // Map the raw manifest data into the UI card structure
                const formattedProjects = parsedManifests.map(manifest => {
                    const completed = manifest.tasks ? manifest.tasks.filter(t => t.status === 'COMPLETED').length : 0;
                    const total = manifest.totalTasks || 0;
                    const progressRatio = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return {
                        id: manifest.name,
                        title: manifest.name,
                        status: manifest.status || 'ACTIVE',
                        desc: `Warlord PRD Executed. Task sequence handed off to Paperclip daemon.`,
                        progress: progressRatio,
                        completedTasks: completed,
                        totalTasks: total,
                        lead: 'MONTY // COMMAND',
                        priority: 'HIGH'
                    };
                });
                
                setProjects(formattedProjects);
            }
        } catch (e) {
            console.error("Failed to parse project manifests", e);
        }
    };

    // 2. Listeners: Trigger load on mount, on cross-tab dispatch, or on storage change
    useEffect(() => {
        loadProjects();

        window.addEventListener('warlord-project-dispatched', loadProjects);
        window.addEventListener('storage', loadProjects);

        return () => {
            window.removeEventListener('warlord-project-dispatched', loadProjects);
            window.removeEventListener('storage', loadProjects);
        };
    }, []);

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
                                <span className={`agent-badge badge-${proj.lead?.toLowerCase().split(' ')[0]}`}>
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
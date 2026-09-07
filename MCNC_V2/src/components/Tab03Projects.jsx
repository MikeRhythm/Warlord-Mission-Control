import React from 'react';
import './Tab03Projects.css';

export default function Tab03Projects() {
    return (
        <div className="view-section tab-03-container">
            <h2 className="projects-header">03 PROJECTS // ACTIVE MANIFEST</h2>
            
            <div className="projects-header-stats">
                <span><strong className="hf-text-main">6</strong> Total</span>
                <span><strong className="hf-text-main">4</strong> Active</span>
                <span><strong className="hf-text-main">2</strong> Planning</span>
            </div>
            
            <div className="projects-grid">
                {/* Warlord Mission Control Card */}
                <div className="proj-card">
                    <div className="proj-header">
                        <div className="proj-title">Warlord Mission Control</div>
                        <div className="proj-status active">Active</div>
                    </div>
                    
                    <div className="proj-desc">
                        Central dashboard for the agent organization. Tasks, projects, approvals, and real-time Base 1 pipeline monitoring.
                    </div>
                    
                    <div className="proj-progress-container">
                        <div className="proj-progress-labels">
                            <span className="hf-accent-green">100%</span>
                            <span>10/10</span>
                        </div>
                        <div className="proj-progress-bar-bg">
                            <div className="proj-progress-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                    
                    <div className="proj-footer">
                        <span className="agent-badge badge-charlie">C Charlie</span>
                        <span className="proj-priority priority-high">High</span>
                    </div>
                </div>
                
                {/* Additional project cards can be mapped here */}
            </div>
        </div>
    );
}
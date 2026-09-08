import React, { useState } from 'react';
import './Tab04TaskBoard.css';

const ACTIVE_PROJECTS = ['ALL PROJECTS', 'MCNC REACT VITE', 'RHYTHM WASP V8.5', 'PAPERCLIP DAEMON'];

export default function Tab04TaskBoard({ ws }) {
    const [activeProject, setActiveProject] = useState('ALL PROJECTS');

    // Clean Zero-State: Tasks populate dynamically from backend / orchestration stream
    const [tasks, setTasks] = useState([]);

    const deleteTask = (taskId) => {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    };

    const approveTask = (taskId) => {
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === taskId ? { ...t, column: 'SHIPPED', isReview: false, meta: 'Just Shipped' } : t
        ));
    };

    // Filter logic based purely on Project Scope
    const filteredTasks = activeProject === 'ALL PROJECTS'
        ? tasks
        : tasks.filter(t => t.project === activeProject);

    const getColumnTasks = (colId) => filteredTasks.filter(t => t.column === colId);

    return (
        <div className="view-section tab-04-container">
            <div className="task-grid-layout">
                {/* LEFT: MAIN KANBAN AREA */}
                <div className="task-main-area">

                    {/* STATS HEADER */}
                    <div className="task-stats glass-panel">
                        <div className="stat-group"><span className="stat-num hf-green">0</span><span className="stat-label">Active Daemons</span></div>
                        <div className="stat-group"><span className="stat-num hf-blue">{getColumnTasks('BUILD').length}</span><span className="stat-label">Building</span></div>
                        <div className="stat-group"><span className="stat-num hf-gold">{getColumnTasks('GATE').length}</span><span className="stat-label">Human Gate</span></div>
                        <div className="stat-group"><span className="stat-num hf-text">{getColumnTasks('SHIPPED').length}</span><span className="stat-label">Total Shipped</span></div>
                    </div>

                    {/* FILTERS: PROJECT SCOPE ONLY */}
                    <div className="task-filters" style={{ justifyContent: 'space-between' }}>
                        <div style={{ color: 'var(--gold-core)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold', fontSize: '0.9rem' }}>
                            WARLORD PROJECT SCOPE:
                        </div>
                        <div className="filter-pill-container">
                            {ACTIVE_PROJECTS.map(project => (
                                <span
                                    key={project}
                                    className={`filter-pill ${activeProject === project ? 'active' : ''}`}
                                    onClick={() => setActiveProject(project)}
                                    style={{ textTransform: 'uppercase', padding: '6px 16px', fontWeight: activeProject === project ? 'bold' : 'normal' }}
                                >
                                    {project}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* KANBAN BOARD */}
                    <div className="kanban-board">

                        {/* COL 1: CAPTURE & PLAN */}
                        <div className="k-col">
                            <div className="k-col-header">
                                <span><span className="col-dot muted">&bull;</span> Capture &amp; Plan</span>
                                <span className="col-count">{getColumnTasks('CAPTURE').length}</span>
                            </div>
                            {getColumnTasks('CAPTURE').map(task => (
                                <div key={task.id} className="k-card">
                                    <div className="k-card-header-row">
                                        <div className="k-card-title">{task.id}</div>
                                        <button className="task-del-btn" onClick={() => deleteTask(task.id)}>x</button>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-core)', marginBottom: '5px' }}>[{task.project}]</div>
                                    <div className="k-card-desc">{task.title}</div>
                                    <div className="k-card-footer">
                                        <span className={`agent-badge badge-${task.agent.toLowerCase().replace(' ', '-')}`}>{task.agent.charAt(0)} {task.agent}</span>
                                        <span className="time-meta">{task.meta}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* COL 2: AGENT BUILD */}
                        <div className="k-col">
                            <div className="k-col-header">
                                <span><span className="col-dot blue">&bull;</span> Agent Build</span>
                                <span className="col-count">{getColumnTasks('BUILD').length}</span>
                            </div>
                            {getColumnTasks('BUILD').map(task => (
                                <div key={task.id} className="k-card task-active">
                                    <div className="k-card-header-row">
                                        <div className="k-card-title">{task.id}</div>
                                        <button className="task-del-btn" onClick={() => deleteTask(task.id)}>x</button>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-core)', marginBottom: '5px' }}>[{task.project}]</div>
                                    <div className="k-card-desc">{task.title}</div>
                                    <div className="k-card-footer">
                                        <span className={`agent-badge badge-${task.agent.toLowerCase().replace(' ', '-')}`}>{task.agent.charAt(0)} {task.agent}</span>
                                        {task.tag && <span className="status-tag tag-active">{task.tag}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* COL 3: HUMAN GATE */}
                        <div className="k-col">
                            <div className="k-col-header">
                                <span><span className="col-dot gold">&bull;</span> Human Gate</span>
                                <span className="col-count">{getColumnTasks('GATE').length}</span>
                            </div>
                            {getColumnTasks('GATE').map(task => (
                                <div key={task.id} className="k-card task-review">
                                    <div className="k-card-header-row">
                                        <div className="k-card-title">{task.id}</div>
                                        <button className="task-del-btn" onClick={() => deleteTask(task.id)}>x</button>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-core)', marginBottom: '5px' }}>[{task.project}]</div>
                                    <div className="k-card-desc">{task.desc}</div>
                                    <div className="k-card-footer">
                                        <span className={`agent-badge badge-${task.agent.toLowerCase().replace(' ', '-')}`}>{task.agent.charAt(0)} {task.agent}</span>
                                        {task.isReview && <button className="approve-btn" onClick={() => approveTask(task.id)}>APPROVE</button>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* COL 4: SHIPPED */}
                        <div className="k-col">
                            <div className="k-col-header">
                                <span><span className="col-dot green">&bull;</span> Shipped</span>
                                <span className="col-count">{getColumnTasks('SHIPPED').length}</span>
                            </div>
                            {getColumnTasks('SHIPPED').map(task => (
                                <div key={task.id} className="k-card task-done">
                                    <div className="k-card-header-row">
                                        <div className="k-card-title">{task.id}</div>
                                        <button className="task-del-btn" onClick={() => deleteTask(task.id)}>x</button>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-core)', marginBottom: '5px' }}>[{task.project}]</div>
                                    <div className="k-card-desc">{task.title}</div>
                                    <div className="k-card-footer">
                                        <span className={`agent-badge badge-${task.agent.toLowerCase().replace(' ', '-')}`}>{task.agent.charAt(0)} {task.agent}</span>
                                        <span className="time-meta">{task.meta}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* RIGHT: LIVE ACTIVITY FEED */}
                <div className="live-sidebar glass-panel">
                    <h4 className="sidebar-header">Live Hermes Orchestration</h4>
                    <div className="activity-item">
                        <span className="activity-agent hf-blue">Monty (Chief of Staff)</span>
                        <span className="activity-log">Zero-state initialized. Standing by for telemetry dispatch.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import './Tab07Paperclip.css';

const WASP_DIRECTORS = [
    { id: '00-tess', name: '00 TESS', role: 'Quant Lead', spec: 'Volatility Scans & Triggers', engine: 'DeepSeek-R1', cap: '250k' },
    { id: '01-silas', name: '01 SILAS', role: 'Database Architect', spec: 'Telemetry & Vector Store', engine: 'PostgreSQL / RAG', cap: '150k' },
    { id: '02-amber', name: '02 AMBER', role: 'Copywriter Lead', spec: 'Communications & Editorial', engine: 'Llama 3.3', cap: '100k' },
    { id: '03-ares', name: '03 ARES', role: 'Execution Engine', spec: 'Trade Routing & FIX Engine', engine: 'MQL5 / FIX', cap: '300k' },
    { id: '04-atlas', name: '04 ATLAS', role: 'Infrastructure Lead', spec: 'Enterprise Hardware & Bare Metal', engine: 'Linux / IPMI', cap: '100k' },
    { id: '05-valerie', name: '05 VALERIE', role: 'Relations & Comms', spec: 'Partner & Stakeholder Ops', engine: 'Hermes 3', cap: '100k' },
    { id: '06-jack', name: '06 JACK', role: 'Marketing Lead', spec: 'Funnels & Public Campaigns', engine: 'Node.js Agent', cap: '150k' },
    { id: '07-maverick', name: '07 MAVERICK', role: 'SEO Discovery', spec: 'Algorithmic Indexing & Radar', engine: 'Crawler Node', cap: '120k' },
    { id: '08-skyla', name: '08 SKYLA', role: 'Frontend Web', spec: 'React Vite & Control UI', engine: 'React / Vite', cap: '200k' },
    { id: '09-jax', name: '09 JAX', role: 'Artwork Omega', spec: 'Dynamic Render & Assets', engine: 'Canvas / SVG', cap: '150k' },
    { id: '10-roxy', name: '10 ROXY', role: 'Artwork Alpha', spec: 'Creative Director & Brand Aesthetics', engine: 'High Finance Core', cap: '150k' },
    { id: '11-charlie', name: '11 CHARLIE', role: 'Code Lead', spec: 'MQL5, Python, Multi-Agent Orchestrator', engine: 'Qwen 2.5 Coder', cap: '350k' },
    { id: '12-askari', name: '12 THE ASKARI', role: 'Security & Sentinel', spec: 'Zero-Trust Gatekeeper & Audits', engine: 'Sentinel Shield', cap: '200k' },
    { id: '13-vance', name: '13 VANCE', role: 'Finance Director', spec: 'Treasury & Margin Controls', engine: 'High Finance Ledger', cap: '200k' },
    { id: '14-justin', name: '14 JUSTIN', role: 'Risk & Legal', spec: 'Compliance & Governance Caps', engine: 'Guardrail Daemon', cap: '150k' },
    { id: '15-orion', name: '15 ORION', role: 'Strategic Intel', spec: 'Macro Recon & Horizon Scans', engine: 'Hermes 3 Macro', cap: '250k' }
];

const INITIAL_PROJECTS = [
    { 
        id: 'p1', 
        name: "The Chief Madothi Children's Fund", 
        ceo: '06-jack', 
        status: 'ACTIVE', 
        progress: '62%',
        activePrd: {
            id: 'PRD-CMD-02',
            title: 'Phase 2 Donor Campaign & Regional Outreach Pipeline',
            status: 'DISPATCHED_FROM_WARROOM',
            tokenBudget: '150,000'
        },
        assignedTeam: [
            { 
                id: '05-valerie', 
                minions: [
                    { id: 'm-val-01', name: 'OUTREACH SCRAPER #1', role: 'NGO Record Parser', engine: 'Ollama / Llama-3.2-3B', cap: '25k', status: 'IDLE' }
                ] 
            },
            { id: '02-amber', minions: [] },
            { id: '10-roxy', minions: [] }
        ]
    },
    { 
        id: 'p2', 
        name: 'Rhythm Algo Engine (MQL5 / V8.5)', 
        ceo: '11-charlie', 
        status: 'ACTIVE', 
        progress: '84%',
        activePrd: {
            id: 'PRD-RHY-08',
            title: 'DodgerBlue/OrangeRed Zero-Histogram Normalization Audit',
            status: 'IN_EXECUTION',
            tokenBudget: '300,000'
        },
        assignedTeam: [
            { id: '00-tess', minions: [] },
            { id: '03-ares', minions: [] },
            { id: '14-justin', minions: [] }
        ]
    },
    { 
        id: 'p3', 
        name: 'Base 1 Enterprise Stack (Dell R520)', 
        ceo: '04-atlas', 
        status: 'SYNCHRONIZED', 
        progress: '100%',
        activePrd: {
            id: 'PRD-INFRA-01',
            title: 'Base 1 Kleinmond IPMI & Port 3100 Bridge Hardening',
            status: 'SYNCHRONIZED',
            tokenBudget: '80,000'
        },
        assignedTeam: [
            { id: '01-silas', minions: [] },
            { id: '12-askari', minions: [] }
        ]
    }
];

export default function Tab07Paperclip({ ws }) {
    const [projects, setProjects] = useState(INITIAL_PROJECTS);
    const [selectedProject, setSelectedProject] = useState(INITIAL_PROJECTS[0]);
    const [overrideDirective, setOverrideDirective] = useState('');
    const [isDispatching, setIsDispatching] = useState(false);
    
    // Monty Advisory Modal State
    const [activeAdviceModal, setActiveAdviceModal] = useState(null);

    const [deliverables, setDeliverables] = useState([
        {
            id: 'DEL-090',
            type: 'WORK_PRODUCT',
            project: "The Chief Madothi Children's Fund",
            assignedAgent: '06 JACK & 02 AMBER',
            title: 'Phase 2 Donor Outreach Copy & Dark Earth Palette Assets',
            summary: 'Finalized campaign deck copy aligning with Roxy brand guidelines for humanitarian deployment.',
            timestamp: '15:01:44',
            status: 'PENDING_APPROVAL',
            montyAdvice: "Commander Mike: Amber and Jack nailed the tone. Dark Earth palette conforms to brand doctrine, and donor retention copy is sharp. No risk detected. Recommendation: APPROVE [SEAL]."
        },
        {
            id: 'DEL-091',
            type: 'REQUISITION_MINION',
            project: "The Chief Madothi Children's Fund",
            assignedAgent: '05 VALERIE',
            title: 'Requisition: Spawn 2x NGO Directory Scraper Minions',
            summary: 'Valerie requests permission to hire 2 local Ollama 3B scraper workers to index 300 regional contact registries.',
            timestamp: '15:20:10',
            status: 'PENDING_APPROVAL',
            montyAdvice: "Mike, hear me out: Valerie has 300 records to parse manually if this is denied, which stalls her partner outreach schedule by 3 days. Spawning 2 local 3B minions runs at 0.00 USD API cost on Base 1 metal. Recommendation: APPROVE & SPAWN immediately."
        },
        {
            id: 'DEL-089',
            type: 'CODE_AUDIT',
            project: 'Rhythm Algo Engine (MQL5 / V8.5)',
            assignedAgent: '11 CHARLIE',
            title: 'DodgerBlue/OrangeRed Zero-Histogram Visualizer Audit',
            summary: 'Compiled and verified atomic line rendering without memory leakage or NaN corruption.',
            timestamp: '14:52:10',
            status: 'PENDING_APPROVAL',
            montyAdvice: "Commander: Charlie verified zero-state initialization and atomic array normalization. Memory leak tests passed on Base 1. Safe to seal into master build."
        }
    ]);

    const activeCeo = WASP_DIRECTORS.find(d => d.id === selectedProject.ceo) || WASP_DIRECTORS[6];
    const activeTeamData = selectedProject.assignedTeam.map(member => ({
        ...WASP_DIRECTORS.find(d => d.id === member.id),
        minions: member.minions || []
    }));
    const filteredDeliverables = deliverables.filter(d => d.project === selectedProject.name);

    // Direct Founder Override Dispatch
    const handleDispatchOverride = () => {
        if (!overrideDirective.trim()) return;

        setIsDispatching(true);
        const payload = {
            type: 'PAPERCLIP_COMMANDER_OVERRIDE',
            project: selectedProject.name,
            ceo: activeCeo.name,
            directive: overrideDirective.trim(),
            timestamp: new Date().toLocaleTimeString(),
            auth: 'MIKE // SUPREME COMMAND'
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }

        setTimeout(() => {
            setDeliverables(prev => [
                {
                    id: `DEL-${Math.floor(100 + Math.random() * 900)}`,
                    type: 'COMMANDER_TASK',
                    project: selectedProject.name,
                    assignedAgent: activeCeo.name,
                    title: overrideDirective.slice(0, 48) + (overrideDirective.length > 48 ? '...' : ''),
                    summary: `Executing high-priority founder directive issued to ${activeCeo.name}.`,
                    timestamp: new Date().toLocaleTimeString(),
                    status: 'IN_EXECUTION',
                    montyAdvice: `Commander Mike issued this order directly. Tracking execution under ${activeCeo.name}.`
                },
                ...prev
            ]);
            setOverrideDirective('');
            setIsDispatching(false);
        }, 500);
    };

    const handleSignOff = (id, action) => {
        setDeliverables(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: action === 'APPROVE' ? 'APPROVED // SEALED' : 'REVISION_REQUESTED' };
            }
            return item;
        }));
        if (activeAdviceModal && activeAdviceModal.id === id) {
            setActiveAdviceModal(null);
        }
    };

    return (
        <div className="view-section tab-07-container">
            {/* HEADER & GOVERNANCE BAR */}
            <div className="paperclip-header">
                <div className="paperclip-title-group">
                    <h2>07 PAPERCLIP // AGENT ORCHESTRATION &amp; CEO GATEWAY</h2>
                    <p>Monty High Command &bull; Autonomous Project CEOs &bull; Deliverables &amp; PRD Sign-off</p>
                </div>

                <div className="paperclip-stats-strip">
                    <div className="stat-pill">
                        <span className="label">PROJECT BRIDGE:</span>
                        <span className="val" style={{ color: '#00FF66' }}>PORT 3100 ONLINE</span>
                    </div>
                    <div className="stat-pill">
                        <span className="label">ACTIVE SQUAD:</span>
                        <span className="val">{activeTeamData.length + 1} AGENTS</span>
                    </div>
                    <div className="stat-pill">
                        <span className="label">AUTHORITY:</span>
                        <span className="val" style={{ color: '#E8D5B5' }}>MIKE // SUPREME</span>
                    </div>
                </div>
            </div>

            {/* INGESTED PRD & FOUNDER OVERRIDE STRIP */}
            <div className="paperclip-control-deck">
                <div className="deck-col">
                    <label className="deck-label">TARGET ENTERPRISE PROJECT</label>
                    <select 
                        className="deck-select"
                        value={selectedProject.id}
                        onChange={(e) => {
                            const proj = projects.find(p => p.id === e.target.value);
                            setSelectedProject(proj);
                        }}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.progress})</option>
                        ))}
                    </select>
                </div>

                <div className="prd-stage-box">
                    <div className="prd-stage-tag">WAR ROOM PRD INGESTED &bull; MONTY SIGN-OFF</div>
                    <div className="prd-stage-content">
                        <span className="prd-id">{selectedProject.activePrd.id}</span>
                        <span className="prd-title">{selectedProject.activePrd.title}</span>
                        <span className="prd-budget">CAP: {selectedProject.activePrd.tokenBudget} TOKENS</span>
                    </div>
                </div>

                <div className="deck-col-grow">
                    <label className="deck-label">FOUNDER DIRECT OVERRIDE &rarr; {activeCeo.name}</label>
                    <div className="dispatch-input-wrap">
                        <input 
                            type="text"
                            className="deck-input"
                            placeholder={`Issue direct voice/text command to ${activeCeo.name}...`}
                            value={overrideDirective}
                            onChange={(e) => setOverrideDirective(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDispatchOverride()}
                        />
                        <button 
                            className="deck-btn-dispatch"
                            onClick={handleDispatchOverride}
                            disabled={isDispatching}
                        >
                            {isDispatching ? 'ROUTING...' : 'DISPATCH DIRECTIVE'}
                        </button>
                    </div>
                </div>
            </div>

            {/* WORKSPACE: ORG TREE + DELIVERABLES PIPELINE */}
            <div className="paperclip-workspace-grid">
                {/* LEFT: PROJECT COMMAND & TEAM HIERARCHY */}
                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>OPERATIONAL COMMAND // {selectedProject.name.toUpperCase()}</span>
                        <span style={{ fontSize: '0.7rem', color: '#C88A35' }}>REPORTS TO: MONTY</span>
                    </div>

                    {/* CEO SPOTLIGHT CARD */}
                    <div className="ceo-spotlight-box">
                        <div className="ceo-spotlight-badge">DESIGNATED PROJECT CEO</div>
                        <div className="ceo-spotlight-header">
                            <h3 className="ceo-spotlight-name">{activeCeo.name}</h3>
                            <span className="node-status-pill status-active">ACTIVE IN COMMAND</span>
                        </div>
                        <div className="ceo-spotlight-desc">{activeCeo.role} &bull; {activeCeo.spec}</div>
                        <div className="ceo-spotlight-meta">
                            <span>ENGINE: <b>{activeCeo.engine}</b></span>
                            <span>TOKEN CAP: <b>{activeCeo.cap}</b></span>
                        </div>
                    </div>

                    {/* ASSIGNED PROJECT SQUAD WITH NESTED MINIONS */}
                    <div className="card-subhead subhead-secondary">
                        <span>ASSIGNED PROJECT SQUAD ({activeTeamData.length})</span>
                    </div>

                    <div className="org-node-list">
                        {activeTeamData.map(agent => (
                            <div key={agent.id} className="squad-member-container">
                                <div className="org-node-card">
                                    <div className="org-node-info">
                                        <span className="org-node-name">{agent.name}</span>
                                        <span className="org-node-role">{agent.role} &bull; {agent.spec}</span>
                                    </div>
                                    <div className="org-node-meta">
                                        <span className="node-status-pill status-active">ACTIVE</span>
                                        <span className="node-cap">CAP: {agent.cap}</span>
                                    </div>
                                </div>

                                {/* NESTED WORKER MINIONS */}
                                {agent.minions && agent.minions.length > 0 && (
                                    <div className="minion-sublist">
                                        {agent.minions.map(minion => (
                                            <div key={minion.id} className="minion-card">
                                                <div className="minion-indicator">&bull; SUB-WORKER:</div>
                                                <div className="minion-info">
                                                    <b>{minion.name}</b> ({minion.role}) &bull; <span style={{ color: '#8A857A' }}>{minion.engine}</span>
                                                </div>
                                                <div className="minion-status">{minion.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: TICKET / DELIVERABLE REVIEW PIPELINE */}
                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>ACTIONABLE DELIVERABLES &amp; SIGN-OFFS ({filteredDeliverables.length})</span>
                        <span style={{ fontSize: '0.7rem', color: '#00FF66' }}>FOUNDER SIGN-OFF: MIKE</span>
                    </div>

                    <div className="deliverable-list">
                        {filteredDeliverables.length === 0 ? (
                            <div className="paperclip-empty-state">
                                ZERO-STATE // NO DELIVERABLES AWAITING REVIEW FOR THIS PROJECT
                                <br />
                                <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                                    Directives issued to {activeCeo.name} will compile results here.
                                </span>
                            </div>
                        ) : (
                            filteredDeliverables.map(ticket => (
                                <div key={ticket.id} className={`ticket-item-card ${ticket.status.includes('APPROVED') ? 'ticket-approved' : ''}`}>
                                    <div className="ticket-header">
                                        <div className="ticket-header-left">
                                            <span className="ticket-id">{ticket.id}</span>
                                            <span className="ticket-type-badge">{ticket.type}</span>
                                        </div>
                                        <span className="ticket-time">{ticket.timestamp}</span>
                                    </div>

                                    <h4 className="ticket-title">{ticket.title}</h4>
                                    <p className="ticket-summary">{ticket.summary}</p>

                                    <div className="ticket-footer">
                                        <span className="ticket-agent">EXECUTING: <b>{ticket.assignedAgent}</b></span>
                                        <div className="ticket-actions">
                                            {/* MONTY ADVISORY TRIGGER BUTTON */}
                                            <button 
                                                className="btn-action-monty"
                                                onClick={() => setActiveAdviceModal(ticket)}
                                            >
                                                &bull; MONTY ADVICE
                                            </button>

                                            {ticket.status === 'PENDING_APPROVAL' ? (
                                                <>
                                                    <button 
                                                        className="btn-action-revise"
                                                        onClick={() => handleSignOff(ticket.id, 'REVISE')}
                                                    >
                                                        REVISE
                                                    </button>
                                                    <button 
                                                        className="btn-action-approve"
                                                        onClick={() => handleSignOff(ticket.id, 'APPROVE')}
                                                    >
                                                        APPROVE [SEAL]
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`status-badge-seal ${ticket.status.includes('APPROVED') ? 'badge-seal-green' : 'badge-seal-amber'}`}>
                                                    {ticket.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MONTY ADVISORY MODAL POP-UP */}
            {activeAdviceModal && (
                <div className="monty-modal-backdrop" onClick={() => setActiveAdviceModal(null)}>
                    <div className="monty-modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="monty-modal-header">
                            <div className="monty-modal-title">
                                <span className="monty-badge">CHIEF OF STAFF</span>
                                <h3>MONTY // TACTICAL ADVISORY DECK</h3>
                            </div>
                            <button className="btn-close-modal" onClick={() => setActiveAdviceModal(null)}>&times;</button>
                        </div>

                        <div className="monty-modal-ticket-context">
                            <span className="modal-context-label">TARGET AUDIT:</span>
                            <span className="modal-context-id">{activeAdviceModal.id} &bull; {activeAdviceModal.title}</span>
                        </div>

                        <div className="monty-modal-body">
                            <div className="monty-briefing-quote">
                                {activeAdviceModal.montyAdvice}
                            </div>
                        </div>

                        <div className="monty-modal-footer">
                            <button className="btn-modal-dismiss" onClick={() => setActiveAdviceModal(null)}>
                                DISMISS
                            </button>
                            <button 
                                className="btn-modal-revise"
                                onClick={() => handleSignOff(activeAdviceModal.id, 'REVISE')}
                            >
                                REQUEST REVISION
                            </button>
                            <button 
                                className="btn-modal-approve"
                                onClick={() => handleSignOff(activeAdviceModal.id, 'APPROVE')}
                            >
                                SEAL APPROVAL WITH MONTY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import './Tab07Paperclip.css';

// 16 WASP DIRECTOR AGENT MATRIX (02_Director_Board)
const WASP_DIRECTOR_BOARD = [
    { id: '00-tess', name: '00 TESS', role: 'Quant Lead // Volatility Scans & Triggers', engine: 'DeepSeek-R1 / Quant Node', status: 'ACTIVE', tokenCap: '250k' },
    { id: '01-silas', name: '01 SILAS', role: 'Database Architect // Telemetry & Vector Store', engine: 'PostgreSQL / RAG Node', status: 'ACTIVE', tokenCap: '150k' },
    { id: '02-amber', name: '02 AMBER', role: 'Copywriter // Communications & Directives', engine: 'Llama 3.3 / Claude Engine', status: 'ACTIVE', tokenCap: '100k' },
    { id: '03-ares', name: '03 ARES', role: 'Execution Engine // Trade Routing & Dispatch', engine: 'MQL5 / Fix Protocol Bridge', status: 'ACTIVE', tokenCap: '300k' },
    { id: '04-atlas', name: '04 ATLAS', role: 'Infrastructure // Enterprise Hardware & Bare Metal', engine: 'Linux Daemon / IPMI Base 1', status: 'ACTIVE', tokenCap: '100k' },
    { id: '05-valerie', name: '05 VALERIE', role: 'Relations // Partner Comms & Stakeholder Ops', engine: 'Hermes 3 / Outreach Agent', status: 'ACTIVE', tokenCap: '100k' },
    { id: '06-jack', name: '06 JACK', role: 'Marketing Lead // Funnels & Growth Architecture', engine: 'Node.js / Campaign Agent', status: 'ACTIVE', tokenCap: '150k' },
    { id: '07-maverick', name: '07 MAVERICK', role: 'SEO & Algorithmic Discovery Lead', engine: 'Crawler Engine / Indexer', status: 'ACTIVE', tokenCap: '120k' },
    { id: '08-skyla', name: '08 SKYLA', role: 'Frontend Web // React Vite & UI Implementation', engine: 'React / Vite Pipeline', status: 'ACTIVE', tokenCap: '200k' },
    { id: '09-jax', name: '09 JAX', role: 'Artwork Omega // Dynamic Render & Production Visuals', engine: 'Canvas / SVG / Asset Rig', status: 'ACTIVE', tokenCap: '150k' },
    { id: '10-roxy', name: '10 ROXY', role: 'Artwork Alpha // Creative Director & Brand Aesthetics', engine: 'High Finance Palette Core', status: 'ACTIVE', tokenCap: '150k' },
    { id: '11-charlie', name: '11 CHARLIE', role: 'Code Lead // MQL5, Python, Multi-Agent Orchestrator', engine: 'Qwen 2.5 Coder / Base 1 Stack', status: 'ACTIVE', tokenCap: '350k' },
    { id: '12-askari', name: '12 THE ASKARI', role: 'Security // Firewall, Endpoint Defense & Sentinel Ops', engine: 'Zero-Trust Gatekeeper', status: 'ACTIVE', tokenCap: '200k' },
    { id: '13-vance', name: '13 VANCE', role: 'Finance Director // Treasury, Margins & PnL Balances', engine: 'High Finance Ledger', status: 'ACTIVE', tokenCap: '200k' },
    { id: '14-justin', name: '14 JUSTIN', role: 'Risk & Legal // Compliance, Exposure & Governance Caps', engine: 'Audit & Guardrail Daemon', status: 'ACTIVE', tokenCap: '150k' },
    { id: '15-orion', name: '15 ORION', role: 'Strategic Intelligence // Horizon Scans & Macro Recon', engine: 'Hermes 3 / Macro Vector', status: 'ACTIVE', tokenCap: '250k' }
];

export default function Tab07Paperclip({ ws }) {
    // Zero-State Deliverables & Issues Queue
    const [deliverables, setDeliverables] = useState([]);
    const [agents, setAgents] = useState(WASP_DIRECTOR_BOARD);

    return (
        <div className="view-section tab-07-container">
            {/* HEADER & GOVERNANCE BAR */}
            <div className="paperclip-header">
                <div className="paperclip-title-group">
                    <h2>07 PAPERCLIP // AGENT OS ORG MANAGEMENT</h2>
                    <p>WASP 16-Director Board &bull; Heartbeat Execution &bull; Deliverables &amp; Token Caps</p>
                </div>

                <div className="paperclip-stats-strip">
                    <div className="stat-pill">
                        <span className="label">ORG ROSTER:</span>
                        <span className="val">{agents.length} DIRECTORS</span>
                    </div>
                    <div className="stat-pill">
                        <span className="label">HEARTBEAT:</span>
                        <span className="val" style={{ color: '#00FF66' }}>5 MIN</span>
                    </div>
                    <div className="stat-pill">
                        <span className="label">TOKEN CAP:</span>
                        <span className="val">HARD CAP ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* WORKSPACE: ORG TREE + DELIVERABLES PIPELINE */}
            <div className="paperclip-workspace-grid">
                {/* LEFT: 16 DIRECTOR BOARD ROSTER */}
                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>MANAGED DIRECTOR ROSTER ({agents.length})</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>FOUNDER: MIKE</span>
                    </div>

                    <div className="org-node-list">
                        {agents.map(agent => (
                            <div key={agent.id} className="org-node-card">
                                <div className="org-node-info">
                                    <span className="org-node-name">{agent.name}</span>
                                    <span className="org-node-role">{agent.role}</span>
                                </div>
                                <div className="org-node-meta">
                                    <span className={`node-status-pill ${agent.status === 'ACTIVE' ? 'status-active' : 'status-standby'}`}>
                                        {agent.status}
                                    </span>
                                    <span style={{ color: 'var(--text-mist)' }}>CAP: {agent.tokenCap}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: TICKET / DELIVERABLE REVIEW PIPELINE */}
                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>DELIVERABLE REVIEW QUEUE</span>
                        <span style={{ fontSize: '0.7rem', color: '#00FF66' }}>FOUNDER SIGN-OFF</span>
                    </div>

                    {deliverables.length === 0 ? (
                        <div className="paperclip-empty-state">
                            ZERO-STATE // NO PENDING DELIVERABLES AWAITING REVIEW
                            <br />
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                                Director tickets and deliverables will route here for founder approval.
                            </span>
                        </div>
                    ) : (
                        deliverables.map(ticket => (
                            <div key={ticket.id} className="ticket-item">
                                <h4>{ticket.title}</h4>
                                <p>{ticket.summary}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
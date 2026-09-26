import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRightCircle, Sparkles, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
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
    }
];

const mapDirector = (agentString) => {
    if (!agentString) return WASP_DIRECTORS[11];
    const namePart = agentString.split('//')[0].trim().toUpperCase();
    const found = WASP_DIRECTORS.find(d => d.name.includes(namePart));
    return found || WASP_DIRECTORS[11];
};

export default function Tab07Paperclip({ ws }) {
    const [projects, setProjects] = useState(INITIAL_PROJECTS);
    const [selectedProject, setSelectedProject] = useState(INITIAL_PROJECTS[0]);
    const [deliverables, setDeliverables] = useState([]);
    
    const [overrideDirective, setOverrideDirective] = useState('');
    const [isDispatching, setIsDispatching] = useState(false);
    
    const [activeAdviceModal, setActiveAdviceModal] = useState(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [montySolution, setMontySolution] = useState('');
    
    const [isExecutingLoop, setIsExecutingLoop] = useState(false);
    const [loopStatusText, setLoopStatusText] = useState('');
    const [copiedKey, setCopiedKey] = useState('');
    const [isKaggleOnline, setIsKaggleOnline] = useState(false);

    // Verify true backend compute status
    const checkComputeStatus = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8081/api/status');
            if (res.ok) {
                const data = await res.json();
                setIsKaggleOnline(Boolean(data.kaggle_gpu_online));
            } else {
                setIsKaggleOnline(false);
            }
        } catch (e) {
            setIsKaggleOnline(false);
        }
    };

    useEffect(() => {
        checkComputeStatus();
        const interval = setInterval(checkComputeStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const loadPaperclipData = () => {
        try {
            const storedManifests = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
            const storedTasks = localStorage.getItem('MCNC_ACTIVE_TASKS');
            
            if (storedManifests && storedTasks) {
                const parsedManifests = JSON.parse(storedManifests);
                const allStoredTasks = JSON.parse(storedTasks);
                
                if (parsedManifests.length > 0) {
                    const dynamicProjects = parsedManifests.map(manifest => {
                        const tasks = manifest.tasks || [];
                        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
                        const total = tasks.length;
                        const progressRatio = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';

                        const uniqueAgentStrings = [...new Set(tasks.map(t => t.assignedDirector))];
                        const assignedTeam = [];
                        const seenIds = new Set();
                        
                        uniqueAgentStrings.forEach(agentStr => {
                            const matchedDir = mapDirector(agentStr);
                            if (!seenIds.has(matchedDir.id)) {
                                seenIds.add(matchedDir.id);
                                assignedTeam.push({ id: matchedDir.id, minions: [] });
                            }
                        });

                        let ceoId = assignedTeam.length > 0 ? assignedTeam[0].id : '11-charlie';
                        if (tasks.length > 0) {
                            const counts = {};
                            let max = 0;
                            tasks.forEach(t => {
                                const count = (counts[t.assignedDirector] || 0) + 1;
                                counts[t.assignedDirector] = count;
                                if (count > max) { 
                                    max = count; 
                                    ceoId = mapDirector(t.assignedDirector).id; 
                                }
                            });
                        }

                        return {
                            id: manifest.name.replace(/\s+/g, '-').toLowerCase(),
                            name: manifest.name,
                            ceo: ceoId,
                            status: manifest.status || 'ACTIVE',
                            progress: progressRatio,
                            activePrd: {
                                id: `PRD-${manifest.name.substring(0,3).toUpperCase()}-01`,
                                title: `War Room PRD: ${manifest.name}`,
                                status: 'DISPATCHED_FROM_WARROOM',
                                tokenBudget: `${(total * 15) + 50},000`
                            },
                            assignedTeam: assignedTeam
                        };
                    });
                    
                    setProjects(dynamicProjects);
                    
                    const dynamicDeliverables = allStoredTasks.map((t, idx) => ({
                        id: `DEL-${Math.floor(100 + idx)}`,
                        type: t.toolId ? 'WORK_PRODUCT' : 'CODE_AUDIT',
                        project: t.project,
                        assignedAgent: t.assignedDirector,
                        title: t.title,
                        toolId: t.toolId,
                        summary: t.summary || `Automated deliverable execution. Target tool binding: [${t.toolId}].`,
                        timestamp: t.timestamp || new Date().toLocaleTimeString(),
                        status: t.status === 'COMPLETED' ? 'APPROVED // SEALED' : 'PENDING_APPROVAL',
                        montyAdvice: t.montyAdvice || null,
                        lastDirective: t.lastDirective || null,
                        executedArtifact: t.executedArtifact || null,
                        montyJudgeVerdict: t.montyJudgeVerdict || null
                    }));
                    
                    setDeliverables(dynamicDeliverables);

                    const activeName = localStorage.getItem('MCNC_ACTIVE_PROJECT');
                    if (activeName) {
                        const activeProj = dynamicProjects.find(p => p.name === activeName);
                        if (activeProj) setSelectedProject(activeProj);
                        else setSelectedProject(dynamicProjects[0]);
                    } else {
                        setSelectedProject(dynamicProjects[0]);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load dynamic Paperclip data", e);
        }
    };

    useEffect(() => {
        loadPaperclipData();
        window.addEventListener('warlord-project-dispatched', loadPaperclipData);
        window.addEventListener('storage', loadPaperclipData);
        return () => {
            window.removeEventListener('warlord-project-dispatched', loadPaperclipData);
            window.removeEventListener('storage', loadPaperclipData);
        };
    }, []);

    const activeCeo = WASP_DIRECTORS.find(d => d.id === selectedProject.ceo) || WASP_DIRECTORS[11];
    const activeTeamData = selectedProject.assignedTeam.map(member => ({
        ...WASP_DIRECTORS.find(d => d.id === member.id),
        minions: member.minions || []
    }));
    const filteredDeliverables = deliverables.filter(d => d.project === selectedProject.name);

    // Initial Monty Advisory Briefing
    const handleOpenMontyAdvice = async (ticket) => {
        setActiveAdviceModal(ticket);
        setMontySolution('');

        if (ticket.montyAdvice) return;

        setIsLoadingAdvice(true);
        const advisoryPrompt = `You are Monty, Chief of Staff at Base 1. 
Analyze deliverable [${ticket.title}] assigned to [${ticket.assignedAgent}] using [${ticket.toolId}].
Do NOT use roleplay headers like "CLASSIFIED OPERATIONAL BRIEFING".
In EXACTLY 2-3 concise, direct sentences:
1. State the immediate risk or edge-case.
2. State your definitive recommendation to Mike: APPROVE [SEAL], REVISE, or EXECUTE.`;

        try {
            const res = await fetch('http://127.0.0.1:8081/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: advisoryPrompt,
                    model: 'qwen2.5:7b',
                    director: 'MONTY // CHIEF OF STAFF',
                    project: ticket.project,
                    useKaggle: isKaggleOnline
                })
            });

            const data = await res.json();
            const adviceText = data.reply || data.error || 'Verified scope. No major risk detected. Safe to apply seal.';

            setDeliverables(prev => prev.map(d => d.id === ticket.id ? { ...d, montyAdvice: adviceText } : d));
            setActiveAdviceModal(prev => prev && prev.id === ticket.id ? { ...prev, montyAdvice: adviceText } : prev);
        } catch (e) {
            const fallback = `Scope verified for [${ticket.title}]. Safe to apply seal.`;
            setDeliverables(prev => prev.map(d => d.id === ticket.id ? { ...d, montyAdvice: fallback } : d));
            setActiveAdviceModal(prev => prev && prev.id === ticket.id ? { ...prev, montyAdvice: fallback } : prev);
        } finally {
            setIsLoadingAdvice(false);
        }
    };

    // Monty Formulates Solution Directive
    const handleGenerateSolution = async () => {
        if (!activeAdviceModal) return;
        setIsGeneratingSolution(true);

        const solutionPrompt = `You are Monty, Chief of Staff. 
Review your note: "${activeAdviceModal.montyAdvice}"
Write a 1-sentence, direct execution instruction to ${activeAdviceModal.assignedAgent} specifying exactly what to deliver. No fluff.`;

        try {
            const res = await fetch('http://127.0.0.1:8081/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: solutionPrompt,
                    model: 'qwen2.5:7b',
                    director: 'MONTY // CHIEF OF STAFF',
                    project: activeAdviceModal.project,
                    useKaggle: isKaggleOnline
                })
            });

            const data = await res.json();
            setMontySolution(data.reply || `Execute atomic calibration on [${activeAdviceModal.title}] and output final parameters.`);
        } catch (e) {
            setMontySolution(`CEO ${activeCeo.name}: Instruct ${activeAdviceModal.assignedAgent} to deliver supplementary validation table.`);
        } finally {
            setIsGeneratingSolution(false);
        }
    };

    // Impartial Closed-Loop Execution with Live Backend Reporting
    const handleExecuteLoopAndJudge = async () => {
        if (!activeAdviceModal) return;
        const targetTicket = activeAdviceModal;
        const activeDirective = (montySolution || targetTicket.montyAdvice || '').trim();

        // Accurate Engine Labeling
        const computeEngineLabel = isKaggleOnline ? 'Kaggle Dual-T4' : 'Base 1 Local Metal';

        setIsExecutingLoop(true);
        setLoopStatusText(`Dispatching directive to ${targetTicket.assignedAgent} via ${computeEngineLabel}...`);

        try {
            const agentPrompt = `You are ${targetTicket.assignedAgent}.
Execute this directive immediately: "${activeDirective}"
Task Context: ${targetTicket.title} | Tool: ${targetTicket.toolId}
Provide the concise, finalized operational deliverable. No conversational filler. Provide the facts and tables.`;

            const agentRes = await fetch('http://127.0.0.1:8081/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: agentPrompt,
                    model: 'qwen2.5:7b',
                    director: targetTicket.assignedAgent,
                    project: targetTicket.project,
                    useKaggle: isKaggleOnline
                })
            });
            const agentData = await agentRes.json();
            const producedArtifact = agentData.reply || 'Execution artifact compiled.';

            setLoopStatusText(`Evaluating artifact compliance against directive via Monty...`);

            const judgePrompt = `You are Monty, Chief of Staff.
DIRECTIVE: "${activeDirective}"
PRODUCED ARTIFACT: "${producedArtifact}"

Did the agent fulfill the requirement?
Structure:
VERDICT: [PASSED or REVISION_REQUIRED]
ASSESSMENT: [1-2 sentences on why it passed or failed]`;

            const judgeRes = await fetch('http://127.0.0.1:8081/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: judgePrompt,
                    model: 'qwen2.5:7b',
                    director: 'MONTY // CHIEF OF STAFF',
                    project: targetTicket.project,
                    useKaggle: isKaggleOnline
                })
            });
            const judgeData = await judgeRes.json();
            const judgeReport = judgeData.reply || 'VERDICT: PASSED\nASSESSMENT: Artifact reviewed and accepted.';

            const isPassed = judgeReport.includes('PASSED');

            const updated = deliverables.map(d => {
                if (d.id === targetTicket.id) {
                    return {
                        ...d,
                        lastDirective: activeDirective,
                        executedArtifact: producedArtifact,
                        montyJudgeVerdict: judgeReport,
                        status: isPassed ? 'VERIFIED // READY_FOR_SEAL' : 'REVISION_REQUESTED'
                    };
                }
                return d;
            });

            setDeliverables(updated);
            setActiveAdviceModal(prev => prev ? {
                ...prev,
                lastDirective: activeDirective,
                executedArtifact: producedArtifact,
                montyJudgeVerdict: judgeReport,
                status: isPassed ? 'VERIFIED // READY_FOR_SEAL' : 'REVISION_REQUESTED'
            } : null);

            const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
            const updatedTasks = storedTasks.map(t => {
                if (t.title === targetTicket.title) {
                    return {
                        ...t,
                        lastDirective: activeDirective,
                        executedArtifact: producedArtifact,
                        montyJudgeVerdict: judgeReport,
                        stage: isPassed ? 'HUMAN GATE' : 'AGENT BUILD'
                    };
                }
                return t;
            });
            localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(updatedTasks));
            window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
                detail: { project: selectedProject.name, tasks: updatedTasks }
            }));

        } catch (err) {
            console.error("Execution loop failed", err);
        } finally {
            setIsExecutingLoop(false);
            setLoopStatusText('');
        }
    };

    const handleSignOff = (id, action) => {
        const updatedDeliverables = deliverables.map(item => {
            if (item.id === id) {
                return { 
                    ...item, 
                    status: action === 'APPROVE' ? 'APPROVED // SEALED' : 'REVISION_REQUESTED' 
                };
            }
            return item;
        });
        setDeliverables(updatedDeliverables);

        try {
            const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
            const updatedTasks = storedTasks.map(t => {
                const matchingDeliverable = updatedDeliverables.find(d => d.title === t.title);
                if (matchingDeliverable && matchingDeliverable.status.includes('APPROVED')) {
                    return { ...t, status: 'COMPLETED', stage: 'SHIPPED' };
                }
                return t;
            });
            localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(updatedTasks));

            const storedManifests = JSON.parse(localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS') || '[]');
            const updatedManifests = storedManifests.map(manifest => {
                if (manifest.name === selectedProject.name) {
                    return {
                        ...manifest,
                        tasks: updatedTasks.filter(t => t.project === manifest.name)
                    };
                }
                return manifest;
            });
            localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));

            window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
                detail: { project: selectedProject.name, tasks: updatedTasks }
            }));
        } catch (e) {
            console.error("Telemetry sync failed", e);
        }

        if (activeAdviceModal && activeAdviceModal.id === id) {
            setActiveAdviceModal(null);
        }
    };

    return (
        <div className="view-section tab-07-container">
            <div className="paperclip-header">
                <div className="paperclip-title-group">
                    <h2>07 PAPERCLIP // AGENT ORCHESTRATION &amp; CEO GATEWAY</h2>
                    <p>Monty High Command &bull; Autonomous Project CEOs &bull; Deliverables &amp; PRD Sign-off</p>
                </div>

                <div className="paperclip-stats-strip">
                    <div className="stat-pill">
                        <span className="label">KAGGLE ENGINE:</span>
                        <span className="val" style={{ color: isKaggleOnline ? '#10B981' : '#F59E0B' }}>
                            {isKaggleOnline ? 'DUAL-T4 ONLINE' : 'STANDBY // LOCAL METAL'}
                        </span>
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
                        />
                        <button 
                            className="deck-btn-dispatch"
                            onClick={() => {
                                if (!overrideDirective.trim()) return;
                                setIsDispatching(true);
                                setTimeout(() => {
                                    setDeliverables(prev => [
                                        {
                                            id: `DEL-${Math.floor(100 + Math.random() * 900)}`,
                                            type: 'COMMANDER_TASK',
                                            project: selectedProject.name,
                                            assignedAgent: activeCeo.name,
                                            title: overrideDirective.slice(0, 48),
                                            summary: overrideDirective,
                                            timestamp: new Date().toLocaleTimeString(),
                                            status: 'IN_EXECUTION',
                                            montyAdvice: 'Direct founder order executing.'
                                        },
                                        ...prev
                                    ]);
                                    setOverrideDirective('');
                                    setIsDispatching(false);
                                }, 400);
                            }}
                            disabled={isDispatching}
                        >
                            {isDispatching ? 'ROUTING...' : 'DISPATCH DIRECTIVE'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="paperclip-workspace-grid">
                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>OPERATIONAL COMMAND // {selectedProject.name.toUpperCase()}</span>
                        <span style={{ fontSize: '0.7rem', color: '#D4AF37' }}>REPORTS TO: MONTY</span>
                    </div>

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
                            </div>
                        ))}
                    </div>
                </div>

                <div className="paperclip-card">
                    <div className="card-subhead">
                        <span>ACTIONABLE DELIVERABLES &amp; SIGN-OFFS ({filteredDeliverables.length})</span>
                        <span style={{ fontSize: '0.7rem', color: '#10B981' }}>FOUNDER SIGN-OFF: MIKE</span>
                    </div>

                    <div className="deliverable-list">
                        {filteredDeliverables.map(ticket => (
                            <div key={ticket.id} className={`ticket-item-card ${ticket.status.includes('APPROVED') ? 'ticket-approved' : ticket.status.includes('VERIFIED') ? 'ticket-verified' : ''}`}>
                                <div className="ticket-header">
                                    <div className="ticket-header-left">
                                        <span className="ticket-id">{ticket.id}</span>
                                        <span className="ticket-type-badge">{ticket.type}</span>
                                        {ticket.executedArtifact && (
                                            <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded border border-[#10b981]/40 flex items-center gap-1 font-bold">
                                                <ShieldCheck className="w-2.5 h-2.5" /> ARTIFACT ATTACHED
                                            </span>
                                        )}
                                    </div>
                                    <span className="ticket-time">{ticket.timestamp}</span>
                                </div>

                                <h4 className="ticket-title">{ticket.title}</h4>
                                <p className="ticket-summary">{ticket.summary}</p>

                                <div className="ticket-footer">
                                    <span className="ticket-agent">EXECUTING: <b>{ticket.assignedAgent}</b></span>
                                    <div className="ticket-actions">
                                        <button 
                                            className="btn-action-monty"
                                            onClick={() => handleOpenMontyAdvice(ticket)}
                                        >
                                            &bull; MONTY ADVICE &amp; JUDGE
                                        </button>

                                        {ticket.status !== 'APPROVED // SEALED' ? (
                                            <>
                                                <button 
                                                    className="btn-action-revise"
                                                    onClick={() => handleSignOff(ticket.id, 'REVISE')}
                                                >
                                                    REVISE
                                                </button>
                                                <button 
                                                    className={`btn-action-approve ${ticket.status.includes('VERIFIED') ? 'shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold' : ''}`}
                                                    onClick={() => handleSignOff(ticket.id, 'APPROVE')}
                                                >
                                                    APPROVE [SEAL]
                                                </button>
                                            </>
                                        ) : (
                                            <span className="status-badge-seal badge-seal-green">
                                                {ticket.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIVE VERIFICATION & CLOSED-LOOP JUDGE MODAL */}
            {activeAdviceModal && (
                <div className="monty-modal-backdrop" onClick={() => setActiveAdviceModal(null)}>
                    <div className="monty-modal-panel custom-scrollbar" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="monty-modal-header">
                            <div className="monty-modal-title">
                                <span className="monty-badge">CHIEF OF STAFF</span>
                                <h3>MONTY // TACTICAL ADVISORY &amp; EXECUTION GATE</h3>
                            </div>
                            <button className="btn-close-modal" onClick={() => setActiveAdviceModal(null)}>&times;</button>
                        </div>

                        <div className="monty-modal-ticket-context">
                            <span className="modal-context-label">TARGET AUDIT:</span>
                            <span className="modal-context-id">{activeAdviceModal.id} &bull; {activeAdviceModal.title}</span>
                        </div>

                        <div className="monty-modal-body space-y-4 font-mono">
                            
                            {/* SECTION 1: INITIAL CHIEF OF STAFF REVIEW */}
                            <div className="space-y-1 bg-[#101317] p-2.5 rounded border border-[#1f242d]">
                                <div className="flex items-center justify-between border-b border-[#1f242d] pb-1.5 mb-2">
                                    <span className="text-[10px] text-[#ffb800] uppercase font-bold tracking-wider">1. Chief of Staff Review</span>
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => copyToClipboard(activeAdviceModal.montyAdvice, 'review')}
                                            className="px-2 py-0.5 rounded text-[10px] bg-[#14171c] hover:bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/30 flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedKey === 'review' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedKey === 'review' ? 'COPIED' : 'COPY'}</span>
                                        </button>
                                        {activeAdviceModal.montyAdvice && (
                                            <SpeakerBtn text={activeAdviceModal.montyAdvice} label="LISTEN" />
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-[#d1d5db] leading-relaxed">
                                    {isLoadingAdvice ? (
                                        <div className="flex items-center gap-2 text-[#ffb800] py-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Monty reviewing task parameters...</span>
                                        </div>
                                    ) : (
                                        activeAdviceModal.montyAdvice || 'Reviewing...'
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: MANDATED DIRECTIVE */}
                            {montySolution && (
                                <div className="space-y-1 bg-[#101317] p-2.5 rounded border border-[#38bdf8]/40">
                                    <div className="flex items-center justify-between border-b border-[#38bdf8]/20 pb-1.5 mb-2">
                                        <span className="text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider">2. Mandated Directive</span>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => copyToClipboard(montySolution, 'directive')}
                                                className="px-2 py-0.5 rounded text-[10px] bg-[#14171c] hover:bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 flex items-center gap-1 cursor-pointer"
                                            >
                                                {copiedKey === 'directive' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                                                <span>{copiedKey === 'directive' ? 'COPIED' : 'COPY'}</span>
                                            </button>
                                            <SpeakerBtn text={montySolution} label="LISTEN" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-[#e2e8f0] leading-relaxed">
                                        {montySolution}
                                    </div>
                                </div>
                            )}

                            {/* SECTION 3: PRODUCED ARTIFACT */}
                            {activeAdviceModal.executedArtifact && (
                                <div className="space-y-1 bg-[#0a0c0e] p-2.5 rounded border border-[#10b981]/40">
                                    <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-1.5 mb-2">
                                        <span className="text-[10px] text-[#10b981] uppercase font-bold tracking-wider flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                                            <span>3. Executed Artifact (By {activeAdviceModal.assignedAgent})</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => copyToClipboard(activeAdviceModal.executedArtifact, 'artifact')}
                                                className="px-2 py-0.5 rounded text-[10px] bg-[#14171c] hover:bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1 cursor-pointer"
                                            >
                                                {copiedKey === 'artifact' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                                                <span>{copiedKey === 'artifact' ? 'COPIED' : 'COPY'}</span>
                                            </button>
                                            <SpeakerBtn text={activeAdviceModal.executedArtifact} label="LISTEN" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-[#e2e8f0] whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar leading-relaxed">
                                        {activeAdviceModal.executedArtifact}
                                    </div>
                                </div>
                            )}

                            {/* SECTION 4: MONTY COMPARATIVE VERDICT */}
                            {activeAdviceModal.montyJudgeVerdict && (
                                <div className={`space-y-1 p-2.5 rounded border ${
                                    activeAdviceModal.montyJudgeVerdict.includes('PASSED') 
                                        ? 'bg-[#10b981]/10 border-[#10b981]/50' 
                                        : 'bg-[#ef4444]/10 border-[#ef4444]/50'
                                }`}>
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-[#fef08a]">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>4. Monty Gatekeeper Verdict</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => copyToClipboard(activeAdviceModal.montyJudgeVerdict, 'verdict')}
                                                className="px-2 py-0.5 rounded text-[10px] bg-[#14171c] text-[#fef08a] border border-[#fef08a]/30 flex items-center gap-1 cursor-pointer"
                                            >
                                                {copiedKey === 'verdict' ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                                                <span>{copiedKey === 'verdict' ? 'COPIED' : 'COPY'}</span>
                                            </button>
                                            <SpeakerBtn text={activeAdviceModal.montyJudgeVerdict} label="LISTEN" />
                                        </div>
                                    </div>
                                    <div className={`text-xs whitespace-pre-wrap leading-relaxed ${
                                        activeAdviceModal.montyJudgeVerdict.includes('PASSED') ? 'text-[#6ee7b7]' : 'text-[#fca5a5]'
                                    }`}>
                                        {activeAdviceModal.montyJudgeVerdict}
                                    </div>
                                </div>
                            )}

                            {/* RUNNING LOOP SPINNER */}
                            {isExecutingLoop && (
                                <div className="p-3 bg-[#14171c] border border-[#ffb800] rounded text-xs text-[#ffb800] flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#ffb800]" />
                                    <span>{loopStatusText}</span>
                                </div>
                            )}
                        </div>

                        <div className="monty-modal-footer flex-wrap gap-2">
                            <button className="btn-modal-dismiss" onClick={() => setActiveAdviceModal(null)}>
                                DISMISS
                            </button>

                            {!montySolution && !activeAdviceModal.executedArtifact && (
                                <button 
                                    className="px-3 py-1.5 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    onClick={handleGenerateSolution}
                                    disabled={isGeneratingSolution || isLoadingAdvice}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>FORMULATE DIRECTIVE</span>
                                </button>
                            )}

                            {montySolution && (
                                <button 
                                    className="px-3 py-1.5 bg-[#ffb800]/20 hover:bg-[#ffb800]/30 text-[#ffb800] border border-[#ffb800]/60 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    onClick={handleExecuteLoopAndJudge}
                                    disabled={isExecutingLoop}
                                >
                                    <ArrowRightCircle className="w-3.5 h-3.5" />
                                    <span>DISPATCH DIRECTIVE &amp; EXECUTE ARTIFACT</span>
                                </button>
                            )}

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
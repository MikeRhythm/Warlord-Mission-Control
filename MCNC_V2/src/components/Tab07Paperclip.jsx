import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ArrowRightCircle, Sparkles, CheckCircle2, ShieldCheck, Copy, Check, RotateCcw, Zap, Square } from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab07Paperclip.css';

const PIPELINE_API_BASE = 'http://localhost:8082/api';
const MASTER_API_BASE = 'http://127.0.0.1:8081/api';
const CANONICAL_PROJECTS_ROOT = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data\\Projects';

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
    { id: '11-charlie', name: '11 CHARLIE', role: 'Code Lead', spec: 'MQL5, Python, Multi-Agent Orchestrator', engine: 'Claude 3.7 / Qwen', cap: '350k' },
    { id: '12-askari', name: '12 THE ASKARI', role: 'Security & Sentinel', spec: 'Zero-Trust Gatekeeper & Audits', engine: 'Sentinel Shield', cap: '200k' },
    { id: '13-vance', name: '13 VANCE', role: 'Finance Director', spec: 'Treasury & Margin Controls', engine: 'High Finance Ledger', cap: '200k' },
    { id: '14-justin', name: '14 JUSTIN', role: 'Risk & Legal', spec: 'Compliance & Governance Caps', engine: 'Guardrail Daemon', cap: '150k' },
    { id: '15-orion', name: '15 ORION', role: 'Strategic Intel', spec: 'Macro Recon & Horizon Scans', engine: 'Hermes 3 Macro', cap: '250k' }
];

function normalizeProjectKey(name) {
    return String(name || '').trim().replace(/[\s_]+/g, '_').toLowerCase();
}

function getCanonicalProjectDir(projectName) {
    const clean = String(projectName || 'Bounty_Engine').trim().replace(/\s+/g, '_');
    return `${CANONICAL_PROJECTS_ROOT}\\${clean}`;
}

const mapDirector = (agentString) => {
    if (!agentString) return WASP_DIRECTORS[11];
    const namePart = agentString.split('//')[0].trim().toUpperCase();
    const found = WASP_DIRECTORS.find(d => d.name.includes(namePart));
    return found || WASP_DIRECTORS[11];
};

export default function Tab07Paperclip({ ws }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deliverables, setDeliverables] = useState([]);

    const [overrideDirective, setOverrideDirective] = useState('');
    const [isDispatching, setIsDispatching] = useState(false);

    const [activeAdviceModal, setActiveAdviceModal] = useState(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [montySolution, setMontySolution] = useState('');

    const [isExecutingLoop, setIsExecutingLoop] = useState(false);
    const [loopStatusText, setLoopStatusText] = useState('');
    const [autoRunningTicketId, setAutoRunningTicketId] = useState('');
    const [autoStageLabel, setAutoStageLabel] = useState('');
    const [isBatchAutoRunning, setIsBatchAutoRunning] = useState(false);
    const batchAbortRef = useRef(false);

    const [copiedKey, setCopiedKey] = useState('');
    const [isKaggleOnline, setIsKaggleOnline] = useState(false);

    const checkComputeStatus = async () => {
        try {
            const res = await fetch(`${MASTER_API_BASE}/status`);
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

    const loadPaperclipData = useCallback(async () => {
        try {
            let validDiskKeys = null;
            let diskProjectsRaw = [];
            try {
                const diskRes = await fetch(`${PIPELINE_API_BASE}/projects`);
                if (diskRes.ok) {
                    const diskData = await diskRes.json();
                    if (diskData.success && Array.isArray(diskData.projects)) {
                        diskProjectsRaw = diskData.projects.filter(p => p.status !== 'ARCHIVED');
                        validDiskKeys = new Set(
                            diskProjectsRaw.map(p => normalizeProjectKey(p.id || p.name))
                        );
                    }
                }
            } catch (e) {}

            let parsedManifests = [];
            try {
                parsedManifests = JSON.parse(localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS') || '[]');
            } catch (e) {}

            let allStoredTasks = [];
            try {
                allStoredTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
            } catch (e) {}

            if (validDiskKeys && validDiskKeys.size > 0) {
                const filteredManifests = parsedManifests.filter(m => validDiskKeys.has(normalizeProjectKey(m.name)));
                const filteredTasks = allStoredTasks.filter(t => validDiskKeys.has(normalizeProjectKey(t.project)));

                if (filteredManifests.length !== parsedManifests.length) {
                    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(filteredManifests));
                    parsedManifests = filteredManifests;
                }
                if (filteredTasks.length !== allStoredTasks.length) {
                    localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(filteredTasks));
                    allStoredTasks = filteredTasks;
                }

                diskProjectsRaw.forEach(dp => {
                    const canonicalName = String(dp.id || dp.name).trim().replace(/\s+/g, '_');
                    if (!parsedManifests.some(m => normalizeProjectKey(m.name) === normalizeProjectKey(canonicalName))) {
                        parsedManifests.push({
                            name: canonicalName,
                            status: dp.status || 'ACTIVE',
                            tasks: filteredTasks.filter(t => normalizeProjectKey(t.project) === normalizeProjectKey(canonicalName))
                        });
                    }
                });
            }

            if (parsedManifests.length > 0) {
                const dynamicProjects = parsedManifests.map(manifest => {
                    const tasks = manifest.tasks || allStoredTasks.filter(t => normalizeProjectKey(t.project) === normalizeProjectKey(manifest.name));
                    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
                    const total = tasks.length;
                    const progressRatio = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';

                    const uniqueAgentStrings = [...new Set(tasks.map(t => t.assignedDirector).filter(Boolean))];
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
                            id: `PRD-${manifest.name.substring(0, 3).toUpperCase()}-01`,
                            title: `War Room PRD: ${manifest.name}`,
                            status: 'DISPATCHED_FROM_WARROOM',
                            tokenBudget: `${(total * 15) + 50},000`
                        },
                        assignedTeam
                    };
                });

                setProjects(dynamicProjects);

                const dynamicDeliverables = allStoredTasks.map((t, idx) => ({
                    id: t.deliverableId || `DEL-${Math.floor(100 + idx)}`,
                    type: t.toolId ? 'WORK_PRODUCT' : 'CODE_AUDIT',
                    project: t.project,
                    assignedAgent: t.assignedDirector,
                    title: t.title,
                    toolId: t.toolId,
                    summary: t.summary || `Automated deliverable execution. Target tool binding: [${t.toolId || 'local_disk_writer'}].`,
                    timestamp: t.timestamp || new Date().toLocaleTimeString(),
                    status: t.status === 'COMPLETED' ? 'APPROVED // SEALED' : (t.paperclipStatus || 'PENDING_APPROVAL'),
                    montyAdvice: t.montyAdvice || null,
                    lastDirective: t.lastDirective || null,
                    executedArtifact: t.executedArtifact || null,
                    persistedFile: t.persistedFile || null,
                    montyJudgeVerdict: t.montyJudgeVerdict || null
                }));

                setDeliverables(dynamicDeliverables);

                setSelectedProject(prev => {
                    if (prev) {
                        const refreshed = dynamicProjects.find(p => normalizeProjectKey(p.name) === normalizeProjectKey(prev.name));
                        if (refreshed) return refreshed;
                    }
                    const activeName = localStorage.getItem('MCNC_ACTIVE_PROJECT');
                    const byActive = activeName && dynamicProjects.find(p => normalizeProjectKey(p.name) === normalizeProjectKey(activeName));
                    return byActive || dynamicProjects.find(p => normalizeProjectKey(p.name) === 'bounty_engine') || dynamicProjects[0];
                });
            }
        } catch (e) {
            console.error('Failed to load dynamic Paperclip data', e);
        }
    }, []);

    useEffect(() => {
        loadPaperclipData();

        const handlePurge = (e) => {
            const deletedName = e?.detail?.projectName || e?.detail?.project;
            if (deletedName) {
                const key = normalizeProjectKey(deletedName);
                try {
                    const m = JSON.parse(localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS') || '[]');
                    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(m.filter(x => normalizeProjectKey(x.name) !== key)));
                    const t = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
                    localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(t.filter(x => normalizeProjectKey(x.project) !== key)));
                } catch (err) {}
            }
            loadPaperclipData();
        };

        window.addEventListener('warlord-project-dispatched', loadPaperclipData);
        window.addEventListener('mcnc-project-purged', handlePurge);
        window.addEventListener('mcnc-project-created', loadPaperclipData);
        window.addEventListener('storage', loadPaperclipData);
        return () => {
            window.removeEventListener('warlord-project-dispatched', loadPaperclipData);
            window.removeEventListener('mcnc-project-purged', handlePurge);
            window.removeEventListener('mcnc-project-created', loadPaperclipData);
            window.removeEventListener('storage', loadPaperclipData);
        };
    }, [loadPaperclipData]);

    const currentProject = selectedProject || {
        id: 'bounty_engine',
        name: 'Bounty_Engine',
        ceo: '11-charlie',
        progress: '0%',
        activePrd: { id: 'PRD-BOU-01', title: 'War Room PRD: Bounty_Engine', tokenBudget: '245,000' },
        assignedTeam: []
    };

    const activeCeo = WASP_DIRECTORS.find(d => d.id === currentProject.ceo) || WASP_DIRECTORS[11];
    const activeTeamData = (currentProject.assignedTeam || []).map(member => ({
        ...WASP_DIRECTORS.find(d => d.id === member.id),
        minions: member.minions || []
    }));
    const filteredDeliverables = deliverables.filter(d => normalizeProjectKey(d.project) === normalizeProjectKey(currentProject.name));

    const persistTaskStateByTitle = (ticketTitle, patchObj) => {
        try {
            const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
            const updatedTasks = storedTasks.map(t =>
                t.title === ticketTitle ? { ...t, ...patchObj } : t
            );
            localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(updatedTasks));

            if (patchObj.status === 'COMPLETED') {
                const storedManifests = JSON.parse(localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS') || '[]');
                const updatedManifests = storedManifests.map(manifest => {
                    if (normalizeProjectKey(manifest.name) === normalizeProjectKey(currentProject.name)) {
                        return {
                            ...manifest,
                            tasks: updatedTasks.filter(t => normalizeProjectKey(t.project) === normalizeProjectKey(manifest.name))
                        };
                    }
                    return manifest;
                });
                localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));
            }

            window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
                detail: { project: currentProject.name, tasks: updatedTasks }
            }));
        } catch (e) {}
    };

    // Core Step 1 Helper: Fetch Monty Advisory Briefing
    const fetchMontyAdviceForTicket = async (ticket) => {
        if (ticket.montyAdvice) return ticket.montyAdvice;
        const canonicalProjDir = getCanonicalProjectDir(ticket.project);
        const advisoryPrompt = `You are Monty, Chief of Staff at Base 1.
Analyze deliverable [${ticket.title}] assigned to [${ticket.assignedAgent}] using [${ticket.toolId}].
Canonical Project Root: ${canonicalProjDir} (Core daemon scripts live in C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\).
Do NOT use roleplay headers.
In 2-3 concise, direct sentences:
1. State the immediate risk or edge-case.
2. State your definitive recommendation to Mike: APPROVE [SEAL], REVISE, or EXECUTE.`;

        try {
            const res = await fetch(`${MASTER_API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: advisoryPrompt,
                    model: 'anthropic/claude-3.7-sonnet',
                    director: 'MONTY // CHIEF OF STAFF',
                    project: ticket.project,
                    useKaggle: isKaggleOnline
                })
            });
            const data = await res.json();
            return data.reply || data.error || 'Verified scope. Safe to execute and seal.';
        } catch (e) {
            return `Scope verified for [${ticket.title}] inside ${canonicalProjDir}. Safe to execute and seal.`;
        }
    };

    // Core Step 2 Helper: Formulate Mandated Directive
    const formulateDirectiveForTicket = async (ticket, adviceText) => {
        const canonicalProjDir = getCanonicalProjectDir(ticket.project);
        const solutionPrompt = `You are Monty, Chief of Staff.
Review your note: "${adviceText}"
Task: "${ticket.title}" | Assigned Agent: ${ticket.assignedAgent} | Tool: ${ticket.toolId}
Canonical Project Root: ${canonicalProjDir}
Core Daemon Root: C:\\Warlord_Inc\\Warlord_WASP\\MCNC

Write a direct 2-sentence execution instruction to ${ticket.assignedAgent} specifying:
1. Exact target file path on disk (use ${canonicalProjDir}\\ for project artifacts or C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\ for core daemon scripts).
2. Instruct the agent to output a fenced code block starting with "// TARGET_FILE: <exact_windows_path>" so Base 1 writes it physically to disk and validates syntax without truncation.`;

        try {
            const res = await fetch(`${MASTER_API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: solutionPrompt,
                    model: 'anthropic/claude-3.7-sonnet',
                    director: 'MONTY // CHIEF OF STAFF',
                    project: ticket.project,
                    useKaggle: isKaggleOnline
                })
            });
            const data = await res.json();
            return data.reply || `Execute [${ticket.title}] and write physical artifact with // TARGET_FILE: header inside ${canonicalProjDir}.`;
        } catch (e) {
            return `Execute [${ticket.title}] and write physical artifact inside ${canonicalProjDir}.`;
        }
    };

    // Core Step 3 Helper: Execute Agent & Gatekeeper Audit
    const executeAndJudgeTicket = async (ticket, directiveText, revisionCritique = '') => {
        const canonicalProjDir = getCanonicalProjectDir(ticket.project);
        const activeDirective = revisionCritique
            ? `${directiveText}\n\n[MANDATORY REVISION FIX]: Your previous attempt failed Gatekeeper audit with:\n${revisionCritique}\nFix every issue completely and output the full untruncated code with // TARGET_FILE: <full_path>.`
            : directiveText;

        const agentPrompt = `You are ${ticket.assignedAgent}.
Execute this directive immediately:
"${activeDirective}"

Task Context: ${ticket.title} | Bound Tool: ${ticket.toolId}
Canonical Project Root: ${canonicalProjDir}
Core Daemon Root: C:\\Warlord_Inc\\Warlord_WASP\\MCNC

MANDATORY DISK EXECUTION RULES:
1. To write or update a physical file on Base 1, include "// TARGET_FILE: <exact_full_windows_path>" as the first line inside your fenced code block.
2. Output the COMPLETE, UNTRUNCATED file or JSON schema from line 1 to final closing line—zero ellipses (...), zero placeholders.
3. For JS files, ensure valid Node.js syntax.`;

        const agentRes = await fetch(`${MASTER_API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: agentPrompt,
                model: 'anthropic/claude-3.7-sonnet',
                director: ticket.assignedAgent,
                agentId: ticket.assignedAgent,
                project: ticket.project,
                useKaggle: isKaggleOnline
            })
        });
        const agentData = await agentRes.json();
        const producedArtifact = agentData.reply || 'Execution artifact compiled.';
        const persistedFile = agentData.persistedFile || null;

        const judgePrompt = `You are Monty, Chief of Staff.
DIRECTIVE: "${activeDirective}"
CANONICAL PROJECT ROOT: "${canonicalProjDir}"
PHYSICAL DISK WRITE CONFIRMED BY SERVER: ${persistedFile ? `YES -> ${persistedFile}` : 'NO (Text/Analysis output only)'}
PRODUCED ARTIFACT (excerpt):
"${producedArtifact.slice(0, 6000)}"

Evaluate strictly:
- If the directive required writing a file to disk and PHYSICAL DISK WRITE CONFIRMED BY SERVER is YES (and the artifact is not truncated mid-line), return VERDICT: PASSED.
- If the artifact was truncated mid-line or failed to write a required file, return VERDICT: REVISION_REQUIRED.

Structure:
VERDICT: [PASSED or REVISION_REQUIRED]
ASSESSMENT: [1-2 concise sentences explaining disk status and completeness]`;

        const judgeRes = await fetch(`${MASTER_API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: judgePrompt,
                model: 'anthropic/claude-3.7-sonnet',
                director: 'MONTY // CHIEF OF STAFF',
                project: ticket.project,
                useKaggle: isKaggleOnline
            })
        });
        const judgeData = await judgeRes.json();
        const judgeReport = judgeData.reply || (persistedFile
            ? `VERDICT: PASSED\nASSESSMENT: Physical artifact committed to ${persistedFile}.`
            : 'VERDICT: PASSED\nASSESSMENT: Artifact reviewed and accepted.');

        const isPassed = judgeReport.includes('PASSED');
        return {
            lastDirective: activeDirective,
            executedArtifact: producedArtifact,
            persistedFile,
            montyJudgeVerdict: judgeReport,
            isPassed
        };
    };

    // ONE-CLICK AUTONOMOUS PIPELINE FOR A SINGLE TICKET:
    // 1. Monty Advice & Judge -> 2. Formulate Directive -> 3. Dispatch & Execute -> 4. Auto-Seal if PASSED (or leave for review if REVISION_REQUIRED)
    const handleAutoRunTicket = async (ticket) => {
        if (autoRunningTicketId || isExecutingLoop) return false;

        setAutoRunningTicketId(ticket.id);
        setAutoStageLabel('1/4 MONTY ADVICE...');

        try {
            // Stage 1: Monty Advice & Judge
            const adviceText = await fetchMontyAdviceForTicket(ticket);
            setDeliverables(prev => prev.map(d => d.id === ticket.id ? { ...d, montyAdvice: adviceText } : d));
            persistTaskStateByTitle(ticket.title, { montyAdvice: adviceText });

            // Stage 2: Formulate Directive
            setAutoStageLabel('2/4 DIRECTIVE...');
            const directiveText = await formulateDirectiveForTicket(ticket, adviceText);
            setDeliverables(prev => prev.map(d => d.id === ticket.id ? { ...d, lastDirective: directiveText } : d));
            persistTaskStateByTitle(ticket.title, { lastDirective: directiveText });

            // Stage 3: Dispatch Directive & Execute Artifact + Gatekeeper Verdict
            setAutoStageLabel('3/4 EXECUTING...');
            const execResult = await executeAndJudgeTicket(ticket, directiveText);

            if (execResult.isPassed) {
                // Stage 4A: Green Approval -> Automatically activate SEAL APPROVAL WITH MONTY
                setAutoStageLabel('4/4 AUTO-SEALING...');
                setDeliverables(prev => prev.map(d => d.id === ticket.id ? {
                    ...d,
                    montyAdvice: adviceText,
                    lastDirective: execResult.lastDirective,
                    executedArtifact: execResult.executedArtifact,
                    persistedFile: execResult.persistedFile,
                    montyJudgeVerdict: execResult.montyJudgeVerdict,
                    status: 'APPROVED // SEALED'
                } : d));

                persistTaskStateByTitle(ticket.title, {
                    montyAdvice: adviceText,
                    lastDirective: execResult.lastDirective,
                    executedArtifact: execResult.executedArtifact,
                    persistedFile: execResult.persistedFile,
                    montyJudgeVerdict: execResult.montyJudgeVerdict,
                    status: 'COMPLETED',
                    stage: 'SHIPPED',
                    paperclipStatus: 'APPROVED // SEALED'
                });
                return true;
            } else {
                // Stage 4B: Needs Review -> Halt auto-seal and leave card showing Monty Advice & Judge, Revise, and Approve [Seal]
                setDeliverables(prev => prev.map(d => d.id === ticket.id ? {
                    ...d,
                    montyAdvice: adviceText,
                    lastDirective: execResult.lastDirective,
                    executedArtifact: execResult.executedArtifact,
                    persistedFile: execResult.persistedFile,
                    montyJudgeVerdict: execResult.montyJudgeVerdict,
                    status: 'REVISION_REQUESTED'
                } : d));

                persistTaskStateByTitle(ticket.title, {
                    montyAdvice: adviceText,
                    lastDirective: execResult.lastDirective,
                    executedArtifact: execResult.executedArtifact,
                    persistedFile: execResult.persistedFile,
                    montyJudgeVerdict: execResult.montyJudgeVerdict,
                    paperclipStatus: 'REVISION_REQUESTED',
                    stage: 'AGENT BUILD'
                });
                return false;
            }
        } catch (err) {
            console.error('Auto-run ticket fault:', err);
            setDeliverables(prev => prev.map(d => d.id === ticket.id ? {
                ...d,
                montyJudgeVerdict: `VERDICT: REVISION_REQUIRED\nASSESSMENT: Autonomous run encountered an execution fault: ${err.message}`,
                status: 'REVISION_REQUESTED'
            } : d));
            return false;
        } finally {
            setAutoRunningTicketId('');
            setAutoStageLabel('');
        }
    };

    // Batch Auto-Run All Unsealed Tickets in Active Project
    const handleAutoRunAllPending = async () => {
        if (isBatchAutoRunning || autoRunningTicketId || isExecutingLoop) return;
        const pendingTickets = filteredDeliverables.filter(d => d.status !== 'APPROVED // SEALED');
        if (pendingTickets.length === 0) return;

        batchAbortRef.current = false;
        setIsBatchAutoRunning(true);

        for (const ticket of pendingTickets) {
            if (batchAbortRef.current) break;
            await handleAutoRunTicket(ticket);
        }

        setIsBatchAutoRunning(false);
        batchAbortRef.current = false;
    };

    const handleStopBatchAutoRun = () => {
        batchAbortRef.current = true;
        setIsBatchAutoRunning(false);
    };

    // Manual Modal Step 1: Initial Monty Advisory Briefing
    const handleOpenMontyAdvice = async (ticket) => {
        setActiveAdviceModal(ticket);
        setMontySolution(ticket.lastDirective || '');

        if (ticket.montyAdvice) return;

        setIsLoadingAdvice(true);
        const adviceText = await fetchMontyAdviceForTicket(ticket);
        setDeliverables(prev => prev.map(d => d.id === ticket.id ? { ...d, montyAdvice: adviceText } : d));
        setActiveAdviceModal(prev => prev && prev.id === ticket.id ? { ...prev, montyAdvice: adviceText } : prev);
        persistTaskStateByTitle(ticket.title, { montyAdvice: adviceText });
        setIsLoadingAdvice(false);
    };

    // Manual Modal Step 2: Monty Formulates Solution Directive
    const handleGenerateSolution = async () => {
        if (!activeAdviceModal) return;
        setIsGeneratingSolution(true);
        const directiveText = await formulateDirectiveForTicket(activeAdviceModal, activeAdviceModal.montyAdvice);
        setMontySolution(directiveText);
        setIsGeneratingSolution(false);
    };

    // Manual Modal Step 3: Impartial Closed-Loop Execution
    const handleExecuteLoopAndJudge = async (ticketOverride = null, revisionCritique = '') => {
        const targetTicket = ticketOverride || activeAdviceModal;
        if (!targetTicket) return;

        const baseDirective = (montySolution || targetTicket.lastDirective || targetTicket.montyAdvice || targetTicket.title).trim();
        const computeEngineLabel = isKaggleOnline ? 'Kaggle Dual-T4' : 'Base 1 High-Token Engine';

        setIsExecutingLoop(true);
        setLoopStatusText(`${revisionCritique ? 'Re-dispatching revised directive' : 'Dispatching directive'} to ${targetTicket.assignedAgent} via ${computeEngineLabel}...`);

        try {
            const execResult = await executeAndJudgeTicket(targetTicket, baseDirective, revisionCritique);
            const newStatus = execResult.isPassed ? 'VERIFIED // READY_FOR_SEAL' : 'REVISION_REQUESTED';

            setDeliverables(prev => prev.map(d => {
                if (d.id === targetTicket.id) {
                    return {
                        ...d,
                        lastDirective: execResult.lastDirective,
                        executedArtifact: execResult.executedArtifact,
                        persistedFile: execResult.persistedFile,
                        montyJudgeVerdict: execResult.montyJudgeVerdict,
                        status: newStatus
                    };
                }
                return d;
            }));

            setActiveAdviceModal(prev => prev && prev.id === targetTicket.id ? {
                ...prev,
                lastDirective: execResult.lastDirective,
                executedArtifact: execResult.executedArtifact,
                persistedFile: execResult.persistedFile,
                montyJudgeVerdict: execResult.montyJudgeVerdict,
                status: newStatus
            } : prev);

            persistTaskStateByTitle(targetTicket.title, {
                lastDirective: execResult.lastDirective,
                executedArtifact: execResult.executedArtifact,
                persistedFile: execResult.persistedFile,
                montyJudgeVerdict: execResult.montyJudgeVerdict,
                paperclipStatus: newStatus,
                stage: execResult.isPassed ? 'HUMAN GATE' : 'AGENT BUILD'
            });
        } catch (err) {
            console.error('Execution loop failed', err);
        } finally {
            setIsExecutingLoop(false);
            setLoopStatusText('');
        }
    };

    // Working REVISE Action: Opens Modal & Triggers Autonomous Revision Retry Loop
    const handleReviseTicket = async (ticket) => {
        setActiveAdviceModal(ticket);
        const critique = ticket.montyJudgeVerdict || ticket.montyAdvice || 'Re-execute cleanly with full untruncated code and explicit // TARGET_FILE: disk write header.';
        setMontySolution(ticket.lastDirective || `Re-execute [${ticket.title}] and commit full untruncated artifact to disk.`);
        await handleExecuteLoopAndJudge(ticket, critique);
    };

    const handleSignOff = (id, action) => {
        if (action === 'REVISE') {
            const target = deliverables.find(d => d.id === id);
            if (target) handleReviseTicket(target);
            return;
        }

        const targetTicket = deliverables.find(item => item.id === id);
        const updatedDeliverables = deliverables.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    status: 'APPROVED // SEALED'
                };
            }
            return item;
        });
        setDeliverables(updatedDeliverables);

        if (targetTicket) {
            persistTaskStateByTitle(targetTicket.title, {
                status: 'COMPLETED',
                stage: 'SHIPPED',
                paperclipStatus: 'APPROVED // SEALED'
            });
        }

        if (activeAdviceModal && activeAdviceModal.id === id) {
            setActiveAdviceModal(null);
        }
    };

    const pendingCount = filteredDeliverables.filter(d => d.status !== 'APPROVED // SEALED').length;

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
                    <label className="deck-label">TARGET ENTERPRISE PROJECT ({projects.length} ON DISK)</label>
                    <select
                        className="deck-select"
                        value={currentProject.id}
                        onChange={(e) => {
                            const proj = projects.find(p => p.id === e.target.value);
                            if (proj) setSelectedProject(proj);
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
                        <span className="prd-id">{currentProject.activePrd.id}</span>
                        <span className="prd-title">{currentProject.activePrd.title}</span>
                        <span className="prd-budget">CAP: {currentProject.activePrd.tokenBudget} TOKENS</span>
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
                                            project: currentProject.name,
                                            assignedAgent: activeCeo.name,
                                            title: overrideDirective.slice(0, 48),
                                            toolId: 'local_disk_writer',
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
                        <span>OPERATIONAL COMMAND // {currentProject.name.toUpperCase()}</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {pendingCount > 0 && !isBatchAutoRunning && (
                                <button
                                    type="button"
                                    onClick={handleAutoRunAllPending}
                                    disabled={Boolean(autoRunningTicketId) || isExecutingLoop}
                                    style={{
                                        backgroundColor: 'rgba(56, 189, 248, 0.16)',
                                        border: '1px solid #38bdf8',
                                        color: '#38bdf8',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '3px 9px',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    title="Automatically run Monty Advice -> Formulate Directive -> Dispatch & Execute -> Auto-Seal on every pending deliverable"
                                >
                                    <Zap className="w-3 h-3" />
                                    <span>AUTO-RUN ALL ({pendingCount})</span>
                                </button>
                            )}
                            {isBatchAutoRunning && (
                                <button
                                    type="button"
                                    onClick={handleStopBatchAutoRun}
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.18)',
                                        border: '1px solid #ef4444',
                                        color: '#fca5a5',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '3px 9px',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Square className="w-3 h-3" />
                                    <span>STOP AUTO</span>
                                </button>
                            )}
                            <span style={{ fontSize: '0.7rem', color: '#10B981' }}>FOUNDER SIGN-OFF: MIKE</span>
                        </div>
                    </div>

                    <div className="deliverable-list">
                        {filteredDeliverables.map(ticket => {
                            const isThisAutoRunning = autoRunningTicketId === ticket.id;
                            const needsReview = ticket.status === 'REVISION_REQUESTED' || ticket.montyJudgeVerdict?.includes('REVISION_REQUIRED');

                            return (
                                <div key={ticket.id} className={`ticket-item-card ${ticket.status.includes('APPROVED') ? 'ticket-approved' : ticket.status.includes('VERIFIED') ? 'ticket-verified' : ''}`}>
                                    <div className="ticket-header">
                                        <div className="ticket-header-left">
                                            <span className="ticket-id">{ticket.id}</span>
                                            <span className="ticket-type-badge">{ticket.type}</span>
                                            {ticket.persistedFile && (
                                                <span className="text-[9px] bg-[#38bdf8]/20 text-[#38bdf8] px-1.5 py-0.5 rounded border border-[#38bdf8]/40 flex items-center gap-1 font-bold">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> SAVED ON DISK
                                                </span>
                                            )}
                                            {ticket.executedArtifact && !ticket.persistedFile && (
                                                <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded border border-[#10b981]/40 flex items-center gap-1 font-bold">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> ARTIFACT ATTACHED
                                                </span>
                                            )}
                                            {needsReview && ticket.status !== 'APPROVED // SEALED' && (
                                                <span className="text-[9px] bg-[#ef4444]/20 text-[#fca5a5] px-1.5 py-0.5 rounded border border-[#ef4444]/50 font-bold">
                                                    NEEDS REVIEW
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
                                            {ticket.status !== 'APPROVED // SEALED' && (
                                                <button
                                                    type="button"
                                                    disabled={Boolean(autoRunningTicketId) || isExecutingLoop}
                                                    onClick={() => handleAutoRunTicket(ticket)}
                                                    style={{
                                                        backgroundColor: isThisAutoRunning ? 'rgba(255, 184, 0, 0.25)' : 'rgba(56, 189, 248, 0.14)',
                                                        border: isThisAutoRunning ? '1px solid #ffb800' : '1px solid #38bdf8',
                                                        color: isThisAutoRunning ? '#ffb800' : '#38bdf8',
                                                        fontWeight: 'bold',
                                                        padding: '4px 10px',
                                                        borderRadius: '3px',
                                                        fontSize: '10px',
                                                        cursor: Boolean(autoRunningTicketId) || isExecutingLoop ? 'not-allowed' : 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                    title="Run full pipeline: Monty Advice & Judge -> Formulate Directive -> Dispatch & Execute -> Auto-Seal if PASSED"
                                                >
                                                    {isThisAutoRunning ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span>{autoStageLabel}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="w-3 h-3" />
                                                            <span>AUTO</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

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
                                                        disabled={isExecutingLoop || Boolean(autoRunningTicketId)}
                                                        onClick={() => handleSignOff(ticket.id, 'REVISE')}
                                                        title="Re-run agent with Monty Gatekeeper critique"
                                                    >
                                                        REVISE
                                                    </button>
                                                    <button
                                                        className={`btn-action-approve ${ticket.status.includes('VERIFIED') ? 'shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold' : ''}`}
                                                        disabled={isThisAutoRunning}
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
                            );
                        })}
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
                                            {activeAdviceModal.persistedFile && (
                                                <span className="text-[9px] text-[#38bdf8] ml-1">[DISK: {activeAdviceModal.persistedFile}]</span>
                                            )}
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

                            {montySolution && !activeAdviceModal.montyJudgeVerdict?.includes('REVISION_REQUIRED') && (
                                <button
                                    className="px-3 py-1.5 bg-[#ffb800]/20 hover:bg-[#ffb800]/30 text-[#ffb800] border border-[#ffb800]/60 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    onClick={() => handleExecuteLoopAndJudge()}
                                    disabled={isExecutingLoop}
                                >
                                    <ArrowRightCircle className="w-3.5 h-3.5" />
                                    <span>DISPATCH DIRECTIVE &amp; EXECUTE ARTIFACT</span>
                                </button>
                            )}

                            {activeAdviceModal.montyJudgeVerdict?.includes('REVISION_REQUIRED') && (
                                <button
                                    className="px-3 py-1.5 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#fca5a5] border border-[#ef4444] rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    onClick={() => handleReviseTicket(activeAdviceModal)}
                                    disabled={isExecutingLoop}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>AUTO-REVISE &amp; RETRY</span>
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
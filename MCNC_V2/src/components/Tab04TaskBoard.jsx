import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, PlayCircle, AlertCircle, ArrowRight,
  Layers, Filter, Sparkles, Terminal, ShieldAlert, Check, X,
  RefreshCw, PlusCircle, Send, CheckSquare, Eye, FileText,
  Trash2, Search, ShieldCheck, Compass, Cpu, Archive
} from 'lucide-react';
import './Tab04TaskBoard.css';

const PIPELINE_PORT = 8082;
const PIPELINE_BASE = `http://localhost:${PIPELINE_PORT}`;

const METALLIC_PLATES = {
  titanium: {
    background: 'linear-gradient(135deg, #2d3540 0%, #1a2028 52%, #11151b 100%)',
    borderColor: '#475569',
    accentColor: '#E2E8F0',
    badgeBg: 'rgba(148, 163, 184, 0.16)',
    glow: 'inset 0 1px 0 rgba(255,255,255,0.14)'
  },
  antiqueBrass: {
    background: 'linear-gradient(135deg, #493610 0%, #271d09 55%, #161005 100%)',
    borderColor: '#DAA520',
    accentColor: '#ffb800',
    badgeBg: 'rgba(255, 184, 0, 0.18)',
    glow: 'inset 0 1px 0 rgba(255,184,0,0.28)'
  },
  deepTeal: {
    background: 'linear-gradient(135deg, #0f3a4a 0%, #0b222d 55%, #07141b 100%)',
    borderColor: '#38bdf8',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    glow: 'inset 0 1px 0 rgba(56,189,248,0.24)'
  },
  sageEmerald: {
    background: 'linear-gradient(135deg, #103d2e 0%, #0a241b 55%, #061510 100%)',
    borderColor: '#10b981',
    accentColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    glow: 'inset 0 1px 0 rgba(16,185,129,0.24)'
  },
  maroonRust: {
    background: 'linear-gradient(135deg, #45141b 0%, #240b0f 55%, #140608 100%)',
    borderColor: '#ef4444',
    accentColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    glow: 'inset 0 1px 0 rgba(239,68,68,0.24)'
  }
};

export default function Tab04TaskBoard({ ws }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectScope, setSelectedProjectScope] = useState('ALL PROJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineConnected, setPipelineConnected] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedDirector, setSelectedDirector] = useState('MONTY // COMMAND');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskList, setTaskList] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_HERMES_KANBAN_TASKS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Purge legacy uppercase BOUNTY ENGINE / stale BTY-* tickets automatically
          return parsed.filter(
            t => !String(t.id || '').startsWith('BTY-') && String(t.project || '').toUpperCase() !== 'BOUNTY ENGINE'
          );
        }
      }
    } catch (e) {}

    return [
      {
        id: 'CMF-INIT-1',
        project: 'CHIEF MADOTHI FUND',
        title: 'Community Ingestion Engine & Telegram Broadcast Pipe',
        plan: 'Map inbound lead streams to automated sentiment scoring and dispatch summaries to Monty.',
        assignedDirector: 'MONTY // COMMAND',
        stage: 'AGENT BUILD',
        status: 'BUILDING',
        judgeVerified: false,
        milestones: ['Scan inbound API', 'Format message deck', 'Deploy telemetry hook'],
        timestamp: new Date().toISOString()
      },
      {
        id: 'RHY-SCAN-1',
        project: 'RHYTHM TRADING',
        title: 'Volatility Scan Calibration & Breakout Trigger Verification',
        plan: 'Validate tick-level breakout algorithms across Asian and London sessions using Warlord line standards.',
        assignedDirector: 'TESS // QUANT',
        stage: 'HUMAN GATE',
        status: 'WAITING_APPROVAL',
        judgeVerified: false,
        milestones: ['Compute ATR bands', 'Verify spread variance', 'Draft trigger payload'],
        timestamp: new Date().toISOString()
      },
      {
        id: 'CMF-DOCS-1',
        project: 'CHIEF MADOTHI FUND',
        title: 'Project Directory Doctrine Architecture Verification',
        plan: 'Enforce standard 4-folder schema across vault directories on disk.',
        assignedDirector: 'CHARLIE // DEV LEAD',
        stage: 'SHIPPED',
        status: 'COMPLETED',
        judgeVerified: true,
        milestones: ['Verify root paths', 'Flatten docs structure', 'Deploy server_pipeline.js'],
        timestamp: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('MCNC_HERMES_KANBAN_TASKS', JSON.stringify(taskList));
  }, [taskList]);

  useEffect(() => {
    const handleBountyDiscovered = (event) => {
      const bounties = event.detail.bounties || [];
      if (bounties.length > 0) {
        setTaskList(prev => {
          const newTasks = bounties.map((b, idx) => ({
            id: `BTY-${Date.now()}-${idx}`,
            project: 'Bounty_Engine',
            title: `Process Viral Campaign: ${b.title || b.id}`,
            plan: 'Autonomously discovered by Tess (Active-Only Filter). Ready for hook alignment and FFmpeg 9:16 Proof-of-Done rendering.',
            assignedDirector: 'CHARLIE // DEV LEAD',
            stage: 'AGENT BUILD',
            status: 'BUILDING',
            judgeVerified: false,
            milestones: ['Verify non-locked status', 'Render 9:16 + audio check', 'Stage in Outbox'],
            timestamp: new Date().toISOString()
          }));
          return [...newTasks, ...prev];
        });
      }
    };

    window.addEventListener('mcnc-bounties-discovered', handleBountyDiscovered);
    return () => window.removeEventListener('mcnc-bounties-discovered', handleBountyDiscovered);
  }, []);

  const fetchProjectsFromPipeline = useCallback(async () => {
    try {
      const res = await fetch(`${PIPELINE_BASE}/api/projects/disk`);
      if (res.ok) {
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : (raw.projects || raw.data || []);
        if (list.length > 0) {
          setProjects(list);
          setPipelineConnected(true);
          return;
        }
      }
    } catch (e) {}

    try {
      const local = localStorage.getItem('MCNC_PROJECT_MANIFESTS');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setPipelineConnected(true);
          return;
        }
      }
    } catch (e) {}

    setPipelineConnected(false);
  }, []);

  useEffect(() => {
    fetchProjectsFromPipeline();
  }, [fetchProjectsFromPipeline]);

  const projectOptions = [
    'ALL PROJECTS',
    ...projects.map(p => (typeof p === 'string' ? p : p.name || p.id))
  ];

  const filteredTasks = taskList.filter(t => {
    const matchesScope = selectedProjectScope === 'ALL PROJECTS' || (() => {
      const taskProj = (t.project || '').toUpperCase();
      const scopeProj = selectedProjectScope.toUpperCase();
      return taskProj === scopeProj || taskProj.replace(/_/g, ' ') === scopeProj.replace(/_/g, ' ');
    })();

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      String(t.title || '').toLowerCase().includes(q) ||
      String(t.id || '').toLowerCase().includes(q) ||
      String(t.project || '').toLowerCase().includes(q) ||
      String(t.assignedDirector || '').toLowerCase().includes(q);

    return matchesScope && matchesSearch;
  });

  const captureAndPlanTasks = filteredTasks.filter(t => t.stage === 'CAPTURE & PLAN' || t.status === 'PLANNING');
  const humanGateTasks = filteredTasks.filter(t => t.stage === 'HUMAN GATE' || t.status === 'WAITING_APPROVAL');
  const agentBuildTasks = filteredTasks.filter(t => t.stage === 'AGENT BUILD' || t.status === 'BUILDING');
  const shippedTasks = filteredTasks.filter(t => t.stage === 'SHIPPED' || t.status === 'COMPLETED');

  const handleCaptureIdea = (e) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;

    setIsSubmitting(true);

    const activeProjectName = selectedProjectScope === 'ALL PROJECTS'
      ? (typeof projects[0] === 'string' ? projects[0] : (projects[0]?.name || 'Bounty_Engine'))
      : selectedProjectScope;

    const prefix = activeProjectName.split(/[\s_]+/).map(w => w[0]).join('').substring(0, 3).toUpperCase();
    const newId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newTask = {
      id: newId,
      project: activeProjectName,
      title: newIdeaText.trim(),
      plan: `Autonomously classified by Hermes Executive Core. Dispatched to ${selectedDirector.split('//')[0].trim()} for execution staging.`,
      assignedDirector: selectedDirector,
      stage: 'CAPTURE & PLAN',
      status: 'PLANNING',
      judgeVerified: false,
      milestones: ['Autonomous classification', 'Three-Tier Gate check', 'Staging build package'],
      timestamp: new Date().toISOString()
    };

    setTaskList(prev => [newTask, ...prev]);
    setNewIdeaText('');
    setIsSubmitting(false);
  };

  const handleApprove = (taskId) => {
    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          stage: 'AGENT BUILD',
          status: 'BUILDING',
          approvedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId) => {
    setTaskList(prev => prev.filter(t => t.id !== taskId));
  };

  const handlePurgeStaleBountyCards = () => {
    setTaskList(prev => prev.filter(
      t => !String(t.id || '').startsWith('BTY-') && !String(t.project || '').toLowerCase().includes('bounty')
    ));
  };

  const toggleJudgeVerified = (taskId) => {
    setTaskList(prev => prev.map(t => (t.id === taskId ? { ...t, judgeVerified: !t.judgeVerified } : t)));
  };

  const advanceTask = (taskId) => {
    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        let nextStage = 'AGENT BUILD';
        let nextStatus = 'BUILDING';
        let nextJudge = t.judgeVerified;
        if (t.stage === 'CAPTURE & PLAN') { nextStage = 'HUMAN GATE'; nextStatus = 'WAITING_APPROVAL'; }
        else if (t.stage === 'HUMAN GATE') { nextStage = 'AGENT BUILD'; nextStatus = 'BUILDING'; }
        else if (t.stage === 'AGENT BUILD') { nextStage = 'SHIPPED'; nextStatus = 'COMPLETED'; nextJudge = true; }
        else if (t.stage === 'SHIPPED') { nextStage = 'CAPTURE & PLAN'; nextStatus = 'PLANNING'; nextJudge = false; }
        return { ...t, stage: nextStage, status: nextStatus, judgeVerified: nextJudge };
      }
      return t;
    }));
  };

  const hasBountyCards = taskList.some(
    t => String(t.id || '').startsWith('BTY-') || String(t.project || '').toLowerCase().includes('bounty')
  );

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">

      {/* MAIN KANBAN BOARD */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">

        {/* HIGH-FINANCE METALLIC TELEMETRY TOP BAR */}
        <div className="grid grid-cols-5 gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2">
          <div style={METALLIC_PLATES.titanium} className="border rounded p-2 text-center">
            <div className="text-lg font-bold text-white font-mono">{filteredTasks.length}</div>
            <div className="text-[9px] text-[#C5BD9F] uppercase tracking-wider mt-0.5">ACTIVE TASKS</div>
          </div>
          <div style={METALLIC_PLATES.titanium} className="border rounded p-2 text-center">
            <div className="text-lg font-bold text-gray-200 font-mono">{captureAndPlanTasks.length}</div>
            <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider mt-0.5">FLOOR 1: TRIAGE</div>
          </div>
          <div style={METALLIC_PLATES.antiqueBrass} className="border rounded p-2 text-center">
            <div className="text-lg font-bold text-[#ffb800] font-mono">{humanGateTasks.length}</div>
            <div className="text-[9px] text-[#ffb800] uppercase tracking-wider mt-0.5">FLOOR 3: HUMAN GATE</div>
          </div>
          <div style={METALLIC_PLATES.deepTeal} className="border rounded p-2 text-center">
            <div className="text-lg font-bold text-[#38bdf8] font-mono">{agentBuildTasks.length}</div>
            <div className="text-[9px] text-[#38bdf8] uppercase tracking-wider mt-0.5">FLOOR 4: AGENT BUILD</div>
          </div>
          <div style={METALLIC_PLATES.sageEmerald} className="border rounded p-2 text-center">
            <div className="text-lg font-bold text-[#10b981] font-mono">{shippedTasks.length}</div>
            <div className="text-[9px] text-[#10b981] uppercase tracking-wider mt-0.5">FLOOR 5: SHIPPED</div>
          </div>
        </div>

        {/* PROJECT SCOPE, SEARCH & PURGE CONTROLS */}
        <div className="flex items-center justify-between border border-[#1f242d] rounded bg-[#0d0f12] px-3 py-1.5 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
              <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider">
                PROJECT SCOPE:
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${pipelineConnected ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
              <span className="text-[9px] text-gray-400">
                {pipelineConnected ? 'DISK PIPELINE (PORT 8082)' : 'OFFLINE (CACHED MANIFEST)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-[#94A3B8] absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter cards..."
                className="bg-[#080a0c] border border-[#232832] rounded pl-6 pr-2 py-0.5 text-[9px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb800] w-32"
              />
            </div>

            {projectOptions.map(p => (
              <button
                key={p}
                onClick={() => setSelectedProjectScope(p)}
                className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                  selectedProjectScope === p
                    ? 'bg-[#ffb800] text-black border-[#ffb800]'
                    : 'bg-[#14171c] text-[#8fa0b5] border-[#232832] hover:text-white hover:border-gray-500'
                }`}
              >
                {p}
              </button>
            ))}

            {hasBountyCards && (
              <button
                onClick={handlePurgeStaleBountyCards}
                title="Purge all Bounty Engine cards from board"
                className="px-2 py-1 rounded text-[9px] font-bold cursor-pointer border bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/50 hover:bg-[#ef4444] hover:text-white transition-all flex items-center gap-1"
              >
                <Trash2 className="w-2.5 h-2.5" />
                PURGE BOUNTY CARDS
              </button>
            )}
          </div>
        </div>

        {/* FLOOR 1: CAPTURE & PLAN IDEA INPUT */}
        <form onSubmit={handleCaptureIdea} className="flex gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2">
          <input
            type="text"
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            placeholder="[FLOOR 1 CAPTURE] Drop a prompt into triage — Hermes decomposes & routes to the 16-Director Matrix..."
            className="flex-1 bg-[#0a0c0e] border border-[#232832] rounded px-3 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb800] text-[11px]"
          />
          <select
            value={selectedDirector}
            onChange={(e) => setSelectedDirector(e.target.value)}
            className="bg-[#0a0c0e] border border-[#232832] text-[#ffb800] text-[10px] rounded px-2 py-1.5 focus:outline-none"
          >
            <option value="MONTY // COMMAND">MONTY // COMMAND</option>
            <option value="CHARLIE // DEV LEAD">CHARLIE // DEV LEAD</option>
            <option value="TESS // QUANT">TESS // QUANT</option>
            <option value="JACK // BACKEND">JACK // BACKEND</option>
            <option value="SKYLA // MEDIA">SKYLA // MEDIA</option>
            <option value="ROXY // ARTWORK">ROXY // ARTWORK</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting || !newIdeaText.trim()}
            className="bg-[#ffb800] text-black font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[#e0a300] disabled:opacity-40 transition-all cursor-pointer text-[10px]"
          >
            <Send className="w-3 h-3" />
            DISPATCH IDEA
          </button>
        </form>

        {/* HERMES 4-STAGE KANBAN LANES WITH METALLIC HEADER PLATES */}
        <div className="flex-1 grid grid-cols-4 gap-2 overflow-hidden">

          {/* LANE 1: CAPTURE & PLAN (METAL TITANIUM) */}
          <div className="border border-[#2b3340] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div
              style={METALLIC_PLATES.titanium}
              className="px-3 py-2.5 border-b flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col z-10">
                <span className="text-[8px] tracking-widest uppercase text-[#94A3B8] font-bold">
                  FLOOR 01 // INTAKE
                </span>
                <span className="text-[12px] font-bold text-white tracking-wide flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#C5BD9F]" />
                  Triage &amp; Plan
                </span>
              </div>
              <div className="flex items-center gap-2 z-10">
                <Compass className="w-5 h-5 text-white/15" />
                <span
                  style={{ backgroundColor: METALLIC_PLATES.titanium.badgeBg, color: METALLIC_PLATES.titanium.accentColor }}
                  className="text-[10px] border border-white/20 px-2 py-0.5 rounded font-bold"
                >
                  {captureAndPlanTasks.length}
                </span>
              </div>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {captureAndPlanTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No ideas currently awaiting planning. Use the triage bar above.
                </div>
              ) : (
                captureAndPlanTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onAdvance={() => advanceTask(t.id)}
                    onDelete={() => handleDeleteTask(t.id)}
                    onToggleJudge={() => toggleJudgeVerified(t.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* LANE 2: HUMAN GATE (METAL ANTIQUE BRASS / GOLD) */}
          <div className="border border-[#DAA520]/45 rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div
              style={METALLIC_PLATES.antiqueBrass}
              className="px-3 py-2.5 border-b flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col z-10">
                <span className="text-[8px] tracking-widest uppercase text-[#C5BD9F] font-bold">
                  FLOOR 03 // THREE-TIER GATE
                </span>
                <span className="text-[12px] font-bold text-[#ffb800] tracking-wide flex items-center gap-1.5 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ffb800]" />
                  Human Gate
                </span>
              </div>
              <div className="flex items-center gap-2 z-10">
                <ShieldCheck className="w-5 h-5 text-[#ffb800]/20" />
                <span
                  style={{ backgroundColor: METALLIC_PLATES.antiqueBrass.badgeBg, color: '#ffb800' }}
                  className="text-[10px] border border-[#ffb800]/45 px-2 py-0.5 rounded font-bold"
                >
                  {humanGateTasks.length} PENDING
                </span>
              </div>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {humanGateTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  Zero approval bottlenecks pending.
                </div>
              ) : (
                humanGateTasks.map(t => (
                  <HumanGateCard
                    key={t.id}
                    task={t}
                    onApprove={() => handleApprove(t.id)}
                    onReject={() => handleDeleteTask(t.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* LANE 3: AGENT BUILD (METAL DEEP TEAL) */}
          <div className="border border-[#38bdf8]/40 rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div
              style={METALLIC_PLATES.deepTeal}
              className="px-3 py-2.5 border-b flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col z-10">
                <span className="text-[8px] tracking-widest uppercase text-[#94A3B8] font-bold">
                  FLOOR 04 // OPENCLAW RUNTIME
                </span>
                <span className="text-[12px] font-bold text-[#38bdf8] tracking-wide flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                  Agent Build
                </span>
              </div>
              <div className="flex items-center gap-2 z-10">
                <Cpu className="w-5 h-5 text-[#38bdf8]/20" />
                <span
                  style={{ backgroundColor: METALLIC_PLATES.deepTeal.badgeBg, color: '#38bdf8' }}
                  className="text-[10px] border border-[#38bdf8]/40 px-2 py-0.5 rounded font-bold"
                >
                  {agentBuildTasks.length}
                </span>
              </div>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {agentBuildTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No autonomous agent builds running.
                </div>
              ) : (
                agentBuildTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onAdvance={() => advanceTask(t.id)}
                    onDelete={() => handleDeleteTask(t.id)}
                    onToggleJudge={() => toggleJudgeVerified(t.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* LANE 4: SHIPPED & VAULT (METAL SAGE EMERALD) */}
          <div className="border border-[#10b981]/40 rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div
              style={METALLIC_PLATES.sageEmerald}
              className="px-3 py-2.5 border-b flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col z-10">
                <span className="text-[8px] tracking-widest uppercase text-[#94A3B8] font-bold">
                  FLOOR 05 // PROOF-OF-DONE
                </span>
                <span className="text-[12px] font-bold text-[#10b981] tracking-wide flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  Shipped &amp; Vault
                </span>
              </div>
              <div className="flex items-center gap-2 z-10">
                <Archive className="w-5 h-5 text-[#10b981]/20" />
                <span
                  style={{ backgroundColor: METALLIC_PLATES.sageEmerald.badgeBg, color: '#10b981' }}
                  className="text-[10px] border border-[#10b981]/40 px-2 py-0.5 rounded font-bold"
                >
                  {shippedTasks.length}
                </span>
              </div>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {shippedTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No artifacts marked as shipped.
                </div>
              ) : (
                shippedTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onAdvance={() => advanceTask(t.id)}
                    onDelete={() => handleDeleteTask(t.id)}
                    onToggleJudge={() => toggleJudgeVerified(t.id)}
                    isShipped
                  />
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDEBAR: LIVE HERMES ORCHESTRATION FEED */}
      <div className="w-80 border border-[#1f242d] rounded bg-[#0d0f12] p-3 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div
          style={METALLIC_PLATES.antiqueBrass}
          className="border rounded px-2.5 py-2 flex items-center justify-between"
        >
          <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ffb800]" />
            HERMES ORCHESTRATION CORE
          </span>
          <span className="text-[8px] text-[#10b981] bg-[#080a0c]/80 border border-[#10b981]/40 px-1.5 py-0.5 rounded font-bold">
            DAEMON 8082
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[10px]">
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
              <Sparkles className="w-3 h-3 text-[#38bdf8]" />
              Monty (Chief of Staff)
            </div>
            <p className="text-[#8fa0b5] leading-relaxed text-[9px]">
              {selectedProjectScope === 'ALL PROJECTS'
                ? 'Overseeing operational pipelines across registered projects. Zero-state initialization active.'
                : `Focused on [${selectedProjectScope}]. Ready to execute agent sub-threads and pipeline artifacts.`}
            </p>
          </div>

          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2.5 space-y-1.5">
            <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider">
              WARLORD ACTIVE DIRECTORS:
            </span>
            <div className="flex flex-col gap-1 text-[9px]">
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>CHARLIE // DEV LEAD</span>
                <span className="text-[#10b981]">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>TESS // QUANT ANALYST</span>
                <span className="text-[#10b981]">STANDBY</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>SKYLA // MEDIA</span>
                <span className="text-[#10b981]">STANDBY</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>JACK // BACKEND</span>
                <span className="text-[#38bdf8] animate-pulse">ACTIVE 8082</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>ROXY // UI/UX</span>
                <span className="text-[#10b981]">READY</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2.5 space-y-1 text-[9px] text-[#8fa0b5]">
            <span className="font-bold text-[#ffb800] block uppercase flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#ffb800]" />
              Obsidian Vault Sync
            </span>
            <p className="leading-snug text-[#5c6b7f]">
              Target: <span className="text-gray-300">C:\Warlord_Inc\Warlord_WASP\MCNC\vault\Docs</span>
            </p>
            <p className="text-[8px] text-gray-500 pt-1 border-t border-[#1f242d]">
              Every approved &amp; shipped task generates persistent memory in Obsidian.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// Subcomponent: Floor 3 Human-in-the-Loop Checkpoint Card
function HumanGateCard({ task, onApprove, onReject }) {
  return (
    <div className="bg-[#0e1117] border-2 border-[#ffb800]/60 rounded p-2.5 flex flex-col gap-2 transition-all shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-[#ffb800] font-bold px-1.5 py-0.5 rounded bg-[#ffb800]/10 border border-[#ffb800]/30">
          APPROVAL REQUIRED
        </span>
        <span className="text-[8px] font-mono text-gray-400 truncate max-w-[100px]">
          {task.project}
        </span>
      </div>

      <div className="text-[11px] font-bold text-white leading-snug">
        {task.title}
      </div>

      {task.plan && (
        <div className="bg-[#080a0c] p-2 rounded border border-[#232832] text-[9px] text-[#8fa0b5] space-y-1">
          <span className="text-[#ffb800] font-bold block text-[8px] uppercase tracking-wider">EXECUTION PLAN:</span>
          <p className="leading-relaxed">{task.plan}</p>
        </div>
      )}

      {task.milestones && task.milestones.length > 0 && (
        <div className="space-y-0.5 text-[8px] text-gray-400">
          {task.milestones.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-[#ffb800]">›</span> {m}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#1f242d]">
        <button
          onClick={onReject}
          className="bg-[#1c1214] hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/40 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
        >
          <X className="w-3 h-3" />
          REJECT
        </button>
        <button
          onClick={onApprove}
          className="bg-[#12231c] hover:bg-[#10b981] text-[#10b981] hover:text-black border border-[#10b981]/40 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
        >
          <Check className="w-3 h-3" />
          APPROVE &amp; BUILD
        </button>
      </div>
    </div>
  );
}

// Subcomponent: Standard Task Card with Proof-of-Done Judge Gate & Delete Control
function TaskCard({ task, onAdvance, onDelete, onToggleJudge, isShipped }) {
  const getBadgeColor = (director) => {
    if (director.includes('CHARLIE')) return 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/10';
    if (director.includes('TESS')) return 'text-[#ffb800] border-[#ffb800]/40 bg-[#ffb800]/10';
    if (director.includes('JACK')) return 'text-[#C5BD9F] border-[#C5BD9F]/40 bg-[#C5BD9F]/10';
    if (director.includes('SKYLA')) return 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10';
    if (director.includes('ROXY')) return 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10';
    return 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10';
  };

  return (
    <div className="bg-[#0a0c0e] border border-[#1f242d] hover:border-[#C5BD9F]/40 rounded p-2.5 flex flex-col gap-1.5 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[8px] font-mono text-[#5c6b7f] font-bold">
          {task.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-[#C5BD9F] truncate max-w-[90px]">
            {task.project}
          </span>
          <button
            onClick={onDelete}
            title="Purge task card"
            className="text-[#5c6b7f] hover:text-[#ef4444] transition-colors cursor-pointer p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="text-[10px] font-bold text-gray-200 leading-snug">
        {task.title}
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-[#1f242d]/60 mt-1 gap-1">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${getBadgeColor(task.assignedDirector || 'MONTY')}`}>
          {(task.assignedDirector || 'MONTY').split('//')[0].trim()}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleJudge}
            title="SOP 05 Judge Gate / Proof-of-Done Status"
            className={`text-[8px] px-1.5 py-0.5 rounded font-bold border cursor-pointer transition-all ${
              task.judgeVerified
                ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                : 'bg-[#14171c] text-[#94A3B8] border-[#232832] hover:border-[#ffb800]'
            }`}
          >
            {task.judgeVerified ? '✓ PROOF' : 'JUDGE'}
          </button>

          <button
            onClick={onAdvance}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              isShipped
                ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981] hover:text-black'
                : 'bg-[#14171c] hover:bg-[#ffb800] text-[#8fa0b5] hover:text-black border-[#232832]'
            }`}
            title={isShipped ? 'Re-cycle task to planning' : 'Advance to next Kanban stage'}
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
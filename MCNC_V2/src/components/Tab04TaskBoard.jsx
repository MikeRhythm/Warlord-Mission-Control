import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, Clock, PlayCircle, AlertCircle, ArrowRight, 
  Layers, Filter, Sparkles, Terminal, ShieldAlert, Check, X,
  RefreshCw, PlusCircle, Send, CheckSquare, Eye, FileText
} from 'lucide-react';
import './Tab04TaskBoard.css';

const PIPELINE_PORT = 8082;
const PIPELINE_BASE = `http://localhost:${PIPELINE_PORT}`;

export default function Tab04TaskBoard({ ws }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectScope, setSelectedProjectScope] = useState('ALL PROJECTS');
  const [pipelineConnected, setPipelineConnected] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedDirector, setSelectedDirector] = useState('MONTY // COMMAND');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize task store directly from real project manifests or persistent storage
  const [taskList, setTaskList] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_HERMES_KANBAN_TASKS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Seed tasks for real active disk projects if none exist
    return [
      {
        id: 'CMF-INIT-1',
        project: 'CHIEF MADOTHI FUND',
        title: 'Community Ingestion Engine & Telegram Broadcast Pipe',
        plan: 'Map inbound lead streams to automated sentiment scoring and dispatch summaries to Monty.',
        assignedDirector: 'MONTY // COMMAND',
        stage: 'AGENT BUILD',
        status: 'BUILDING',
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
        milestones: ['Verify root paths', 'Flatten docs structure', 'Deploy server_pipeline.js'],
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Save task updates locally
  useEffect(() => {
    localStorage.setItem('MCNC_HERMES_KANBAN_TASKS', JSON.stringify(taskList));
  }, [taskList]);

  // Fetch real project manifests from Port 8082 or fallback to local manifest cache
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
    } catch (e) {
      // Pipeline offline or endpoint unmapped, proceed to fallback cache
    }

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

  // Project scope options dynamically populated from disk projects
  const projectOptions = [
    'ALL PROJECTS',
    ...projects.map(p => (typeof p === 'string' ? p : p.name || p.id))
  ];

  // Filter tasks based on selected project scope
  const filteredTasks = taskList.filter(t => {
    if (selectedProjectScope === 'ALL PROJECTS') return true;
    const taskProj = (t.project || '').toUpperCase();
    const scopeProj = selectedProjectScope.toUpperCase();
    return taskProj === scopeProj || taskProj.replace(/_/g, ' ') === scopeProj.replace(/_/g, ' ');
  });

  // 4 Hermes Kanban Stages (Floor 1-5 Pipeline)
  const captureAndPlanTasks = filteredTasks.filter(t => t.stage === 'CAPTURE & PLAN' || t.status === 'PLANNING');
  const agentBuildTasks = filteredTasks.filter(t => t.stage === 'AGENT BUILD' || t.status === 'BUILDING');
  const humanGateTasks = filteredTasks.filter(t => t.stage === 'HUMAN GATE' || t.status === 'WAITING_APPROVAL');
  const shippedTasks = filteredTasks.filter(t => t.stage === 'SHIPPED' || t.status === 'COMPLETED');

  // Floor 1: Capture single idea and auto-classify
  const handleCaptureIdea = (e) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;

    setIsSubmitting(true);

    const activeProjectName = selectedProjectScope === 'ALL PROJECTS' 
      ? (typeof projects[0] === 'string' ? projects[0] : (projects[0]?.name || 'CHIEF MADOTHI FUND'))
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
      milestones: ['Autonomous classification', 'Resource allocation', 'Staging build package'],
      timestamp: new Date().toISOString()
    };

    setTaskList(prev => [newTask, ...prev]);
    setNewIdeaText('');
    setIsSubmitting(false);
  };

  // Floor 3: Human-in-the-Loop Gate (Approve & Build)
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

  // Floor 3: Human-in-the-Loop Gate (Reject)
  const handleReject = (taskId) => {
    setTaskList(prev => prev.filter(t => t.id !== taskId));
  };

  // Interactive Stage Advance (Manual override or click advance)
  const advanceTask = (taskId) => {
    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        let nextStage = 'AGENT BUILD';
        let nextStatus = 'BUILDING';
        if (t.stage === 'CAPTURE & PLAN') { nextStage = 'HUMAN GATE'; nextStatus = 'WAITING_APPROVAL'; }
        else if (t.stage === 'HUMAN GATE') { nextStage = 'AGENT BUILD'; nextStatus = 'BUILDING'; }
        else if (t.stage === 'AGENT BUILD') { nextStage = 'SHIPPED'; nextStatus = 'COMPLETED'; }
        else if (t.stage === 'SHIPPED') { nextStage = 'CAPTURE & PLAN'; nextStatus = 'PLANNING'; }
        return { ...t, stage: nextStage, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      
      {/* MAIN KANBAN BOARD */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        
        {/* TELEMETRY TOP BAR */}
        <div className="grid grid-cols-5 gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2.5">
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-white font-mono">{filteredTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">ACTIVE TASKS</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-gray-300 font-mono">{captureAndPlanTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">FLOOR 1: CAPTURE</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#ffb800] font-mono">{humanGateTasks.length}</div>
            <div className="text-[9px] text-[#ffb800] uppercase tracking-wider mt-0.5">FLOOR 3: HUMAN GATE</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#38bdf8] font-mono">{agentBuildTasks.length}</div>
            <div className="text-[9px] text-[#38bdf8] uppercase tracking-wider mt-0.5">FLOOR 4: AGENT BUILD</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#10b981] font-mono">{shippedTasks.length}</div>
            <div className="text-[9px] text-[#10b981] uppercase tracking-wider mt-0.5">FLOOR 5: SHIPPED</div>
          </div>
        </div>

        {/* PROJECT SCOPE & PIPELINE STATUS */}
        <div className="flex items-center justify-between border border-[#1f242d] rounded bg-[#0d0f12] px-3 py-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
              <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider">
                PROJECT SCOPE:
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${pipelineConnected ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`} />
              <span className="text-[9px] text-gray-400">
                {pipelineConnected ? 'DISK PIPELINE (PORT 8082)' : 'OFFLINE (USING CACHED MANIFEST)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
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
          </div>
        </div>

        {/* FLOOR 1: CAPTURE & PLAN IDEA INPUT */}
        <form onSubmit={handleCaptureIdea} className="flex gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2">
          <input
            type="text"
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            placeholder="[FLOOR 1 CAPTURE] Type one idea (e.g. Build Telegram lead scraper or calibrate breakout logic)..."
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

        {/* HERMES 4-STAGE KANBAN LANES */}
        <div className="flex-1 grid grid-cols-4 gap-2 overflow-hidden">
          
          {/* LANE 1: CAPTURE & PLAN */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                FLOOR 1: CAPTURE & PLAN
              </span>
              <span className="text-[9px] bg-[#1a202c] text-gray-400 px-1.5 py-0.5 rounded font-bold">
                {captureAndPlanTasks.length}
              </span>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {captureAndPlanTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No ideas currently awaiting planning. Use the input bar above.
                </div>
              ) : (
                captureAndPlanTasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
                ))
              )}
            </div>
          </div>

          {/* LANE 2: HUMAN GATE (FLOOR 3) */}
          <div className="border border-[#ffb800]/30 rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#ffb800]/30 bg-[#ffb800]/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#ffb800] flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-[#ffb800]" />
                FLOOR 3: HUMAN GATE
              </span>
              <span className="text-[9px] bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/40 px-1.5 py-0.5 rounded font-bold">
                {humanGateTasks.length} PENDING
              </span>
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
                    onReject={() => handleReject(t.id)} 
                  />
                ))
              )}
            </div>
          </div>

          {/* LANE 3: AGENT BUILD (FLOOR 4) */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#38bdf8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                FLOOR 4: AGENT BUILD
              </span>
              <span className="text-[9px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-1.5 py-0.5 rounded font-bold">
                {agentBuildTasks.length}
              </span>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {agentBuildTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No autonomous agent builds running.
                </div>
              ) : (
                agentBuildTasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
                ))
              )}
            </div>
          </div>

          {/* LANE 4: SHIPPED (FLOOR 5) */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#10b981] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                FLOOR 5: SHIPPED & VAULT
              </span>
              <span className="text-[9px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-1.5 py-0.5 rounded font-bold">
                {shippedTasks.length}
              </span>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {shippedTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No artifacts marked as shipped.
                </div>
              ) : (
                shippedTasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} isShipped />
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDEBAR: LIVE HERMES ORCHESTRATION FEED */}
      <div className="w-80 border border-[#1f242d] rounded bg-[#0d0f12] p-3 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border-b border-[#1f242d] pb-2 flex items-center justify-between">
          <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ffb800]" />
            HERMES ORCHESTRATION CORE
          </span>
          <span className="text-[8px] text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-1.5 py-0.5 rounded font-bold">
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
                ? `Overseeing operational pipelines across registered projects. Zero-state initialization active.` 
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
              Every approved & shipped task generates persistent memory in Obsidian.
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
          className="bg-[#1c1214] hover:bg-[#f43f5e] text-[#f43f5e] hover:text-white border border-[#f43f5e]/40 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
        >
          <X className="w-3 h-3" />
          REJECT
        </button>
        <button
          onClick={onApprove}
          className="bg-[#12231c] hover:bg-[#10b981] text-[#10b981] hover:text-black border border-[#10b981]/40 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
        >
          <Check className="w-3 h-3" />
          APPROVE & BUILD
        </button>
      </div>
    </div>
  );
}

// Subcomponent: Standard Task Card
function TaskCard({ task, onAdvance, isShipped }) {
  const getBadgeColor = (director) => {
    if (director.includes('CHARLIE')) return 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/10';
    if (director.includes('TESS')) return 'text-[#ffb800] border-[#ffb800]/40 bg-[#ffb800]/10';
    if (director.includes('JACK')) return 'text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10';
    if (director.includes('ROXY')) return 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#f43f5e]/10';
    return 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10';
  };

  return (
    <div className="bg-[#0a0c0e] border border-[#1f242d] hover:border-gray-500 rounded p-2.5 flex flex-col gap-1.5 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-[#5c6b7f] font-bold">
          {task.id}
        </span>
        <span className="text-[8px] font-mono text-gray-400 truncate max-w-[90px]">
          {task.project}
        </span>
      </div>

      <div className="text-[10px] font-bold text-gray-200 leading-snug">
        {task.title}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#1f242d]/60 mt-1">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${getBadgeColor(task.assignedDirector || 'MONTY')}`}>
          {(task.assignedDirector || 'MONTY').split('//')[0].trim()}
        </span>

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
  );
}
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
const MASTER_PORT = 8081;
const MASTER_BASE = `http://localhost:${MASTER_PORT}`;

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

function normalizeProjectKey(name) {
  return String(name || '')
    .trim()
    .replace(/[\s_]+/g, '_')
    .toLowerCase();
}

function formatProjectLabel(name) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  return raw.replace(/\s+/g, '_');
}

function purgeProjectFromLocalStorage(projectName) {
  const targetKey = normalizeProjectKey(projectName);
  if (!targetKey) return;

  try {
    const rawList = localStorage.getItem('MCNC_PROJECT_LIST');
    if (rawList) {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        localStorage.setItem(
          'MCNC_PROJECT_LIST',
          JSON.stringify(parsed.filter(p => normalizeProjectKey(p) !== targetKey))
        );
      }
    }
  } catch (e) {}

  try {
    const rawManifests = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
    if (rawManifests) {
      const parsed = JSON.parse(rawManifests);
      if (Array.isArray(parsed)) {
        localStorage.setItem(
          'MCNC_ACTIVE_PROJECT_MANIFESTS',
          JSON.stringify(parsed.filter(m => normalizeProjectKey(m.name) !== targetKey))
        );
      }
    }
  } catch (e) {}

  try {
    const rawActiveTasks = localStorage.getItem('MCNC_ACTIVE_TASKS');
    if (rawActiveTasks) {
      const parsed = JSON.parse(rawActiveTasks);
      if (Array.isArray(parsed)) {
        localStorage.setItem(
          'MCNC_ACTIVE_TASKS',
          JSON.stringify(parsed.filter(t => normalizeProjectKey(t.project) !== targetKey))
        );
      }
    }
  } catch (e) {}

  try {
    if (normalizeProjectKey(localStorage.getItem('MCNC_ACTIVE_PROJECT')) === targetKey) {
      localStorage.removeItem('MCNC_ACTIVE_PROJECT');
    }
  } catch (e) {}
}

function mergeDispatchedTasksIntoList(existingList) {
  const merged = [...existingList];
  const existingKeys = new Set(
    merged.map(t => `${normalizeProjectKey(t.project)}::${String(t.title || '').trim().toLowerCase()}`)
  );

  const ingestRaw = (rawTasks, fallbackProject = 'Bounty_Engine') => {
    if (!Array.isArray(rawTasks)) return;
    rawTasks.forEach((rt, idx) => {
      const proj = formatProjectLabel(rt.project || fallbackProject);
      const title = String(rt.title || '').trim();
      if (!title || !proj) return;
      const dedupeKey = `${normalizeProjectKey(proj)}::${title.toLowerCase()}`;
      if (existingKeys.has(dedupeKey)) return;
      existingKeys.add(dedupeKey);

      merged.unshift({
        id: rt.id || `DEL-${100 + idx}`,
        project: proj,
        title,
        plan: rt.toolId
          ? `Dispatched from War Room Manifest. Bound tool: [${rt.toolId}].`
          : 'Dispatched from War Room Manifest to Paperclip & Hermes Kanban.',
        assignedDirector: String(rt.assignedDirector || 'CHARLIE // CODE').toUpperCase(),
        stage: rt.stage || 'AGENT BUILD',
        status: rt.status || 'BUILDING',
        judgeVerified: false,
        milestones: rt.toolId ? [`Tool: ${rt.toolId}`, 'Execute & verify DoD'] : ['Execute & verify DoD'],
        timestamp: rt.timestamp || new Date().toISOString()
      });
    });
  };

  try {
    const manifestsRaw = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
    if (manifestsRaw) {
      const manifests = JSON.parse(manifestsRaw);
      if (Array.isArray(manifests)) {
        manifests.forEach(m => ingestRaw(m.tasks, m.name || 'Bounty_Engine'));
      }
    }
  } catch (e) {}

  try {
    const activeTasksRaw = localStorage.getItem('MCNC_ACTIVE_TASKS');
    if (activeTasksRaw) {
      const activeTasks = JSON.parse(activeTasksRaw);
      ingestRaw(activeTasks, localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'Bounty_Engine');
    }
  } catch (e) {}

  return merged;
}

export default function Tab04TaskBoard({ ws }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectScope, setSelectedProjectScope] = useState('ALL PROJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineConnected, setPipelineConnected] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedDirector, setSelectedDirector] = useState('MONTY // COMMAND');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskList, setTaskList] = useState(() => {
    let baseTasks = [];
    try {
      const stored = localStorage.getItem('MCNC_HERMES_KANBAN_TASKS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          baseTasks = parsed.filter(
            t => !String(t.id || '').startsWith('BTY-') &&
                 String(t.id || '') !== 'RHY-SCAN-1' &&
                 normalizeProjectKey(t.project) !== 'rhythm_trading'
          );
        }
      }
    } catch (e) {}

    return mergeDispatchedTasksIntoList(baseTasks);
  });

  useEffect(() => {
    localStorage.setItem('MCNC_HERMES_KANBAN_TASKS', JSON.stringify(taskList));
  }, [taskList]);

  // Listen for Project Deletions / Archives from Tab 03 Projects
  useEffect(() => {
    const handleProjectPurged = (event) => {
      const deletedName = event?.detail?.projectName || event?.detail?.project;
      if (!deletedName) return;
      const targetKey = normalizeProjectKey(deletedName);

      purgeProjectFromLocalStorage(deletedName);
      setProjects(prev => prev.filter(p => normalizeProjectKey(p) !== targetKey));
      setTaskList(prev => prev.filter(t => normalizeProjectKey(t.project) !== targetKey));
      setSelectedProjectScope(prev =>
        normalizeProjectKey(prev) === targetKey ? 'ALL PROJECTS' : prev
      );
    };

    window.addEventListener('mcnc-project-purged', handleProjectPurged);
    return () => window.removeEventListener('mcnc-project-purged', handleProjectPurged);
  }, []);

  // Listen for War Room Dispatches (Tab 02 -> Tab 04 & Paperclip)
  useEffect(() => {
    const handleWarRoomDispatch = (event) => {
      const detail = event?.detail || {};
      const incoming = Array.isArray(detail.tasks) ? detail.tasks : [];
      const projName = formatProjectLabel(detail.project || 'Bounty_Engine');

      setTaskList(prev => {
        const withoutOldProject = prev.filter(
          t => normalizeProjectKey(t.project) !== normalizeProjectKey(projName)
        );
        if (incoming.length > 0) {
          const formatted = incoming.map((rt, idx) => ({
            id: rt.id || `DEL-${100 + idx}`,
            project: projName,
            title: rt.title || `Execution Unit ${idx + 1}`,
            plan: rt.toolId
              ? `Dispatched from War Room Manifest. Bound tool: [${rt.toolId}].`
              : 'Dispatched from War Room Manifest.',
            assignedDirector: String(rt.assignedDirector || 'CHARLIE // CODE').toUpperCase(),
            stage: 'AGENT BUILD',
            status: 'BUILDING',
            judgeVerified: false,
            milestones: rt.toolId ? [`Tool: ${rt.toolId}`, 'Verify SOP 05 DoD'] : ['Verify SOP 05 DoD'],
            timestamp: rt.timestamp || new Date().toISOString()
          }));
          return [...formatted, ...withoutOldProject];
        }
        return mergeDispatchedTasksIntoList(withoutOldProject);
      });
    };

    window.addEventListener('warlord-project-dispatched', handleWarRoomDispatch);
    return () => window.removeEventListener('warlord-project-dispatched', handleWarRoomDispatch);
  }, []);

  // Listen for Automated Bounty Discovery broadcasts from Tab 11
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

  // Fetch live on-disk projects from Port 8082 and prune deleted projects from Kanban state
  const fetchProjectsFromPipeline = useCallback(async () => {
    try {
      const res8082 = await fetch(`${PIPELINE_BASE}/api/projects`);
      if (res8082.ok) {
        const raw = await res8082.json();
        const list = Array.isArray(raw) ? raw : (raw.projects || raw.data || []);
        const diskMap = new Map();

        list.forEach(item => {
          if (item && item.status === 'ARCHIVED') return;
          const rawLabel = typeof item === 'string' ? item : (item?.id || item?.name);
          const label = formatProjectLabel(rawLabel);
          if (!label) return;
          diskMap.set(normalizeProjectKey(label), label);
        });

        const liveProjects = Array.from(diskMap.values());
        setProjects(liveProjects);
        setPipelineConnected(true);

        // Prune stale tasks whose project folder no longer exists on disk
        if (diskMap.size > 0) {
          setTaskList(prev => prev.filter(t => diskMap.has(normalizeProjectKey(t.project))));
          setSelectedProjectScope(prev => {
            if (prev === 'ALL PROJECTS') return prev;
            return diskMap.has(normalizeProjectKey(prev)) ? prev : 'ALL PROJECTS';
          });
        }
        return;
      }
    } catch (e) {}

    setPipelineConnected(false);
  }, []);

  useEffect(() => {
    fetchProjectsFromPipeline();
    const interval = setInterval(fetchProjectsFromPipeline, 5000);
    window.addEventListener('mcnc-project-created', fetchProjectsFromPipeline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mcnc-project-created', fetchProjectsFromPipeline);
    };
  }, [fetchProjectsFromPipeline]);

  // Build deduplicated list strictly from live disk projects
  const projectMap = new Map();
  projects.forEach(p => {
    const label = formatProjectLabel(p);
    if (!label) return;
    const key = normalizeProjectKey(label);
    if (!projectMap.has(key)) projectMap.set(key, label);
  });

  const projectOptions = ['ALL PROJECTS', ...Array.from(projectMap.values())];

  const filteredTasks = taskList.filter(t => {
    const matchesScope = selectedProjectScope === 'ALL PROJECTS' ||
      normalizeProjectKey(t.project) === normalizeProjectKey(selectedProjectScope);

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
      ? (projects[0] || 'Bounty_Engine')
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

  const handleSyncFromWarRoom = () => {
    setTaskList(prev => mergeDispatchedTasksIntoList(prev));
    fetchProjectsFromPipeline();
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

  const countTasksForProject = (projName) => {
    if (projName === 'ALL PROJECTS') return taskList.length;
    return taskList.filter(t => normalizeProjectKey(t.project) === normalizeProjectKey(projName)).length;
  };

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

        {/* EXPANDED DISK-TRUTH PROJECT SCOPE SELECTOR BAR */}
        <div className="flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] px-3 py-2 gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
                <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider">
                  PROJECT SCOPE ({projectOptions.length - 1} ON DISK):
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${pipelineConnected ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
                <span className="text-[9px] text-gray-400">
                  {pipelineConnected ? 'DISK PIPELINE (PORT 8082)' : 'OFFLINE (WAITING FOR 8082)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Search className="w-3 h-3 text-[#94A3B8] absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter cards..."
                  className="bg-[#080a0c] border border-[#232832] rounded pl-6 pr-2 py-1 text-[9px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#ffb800] w-36"
                />
              </div>

              <button
                onClick={handleSyncFromWarRoom}
                title="Sync live disk projects and dispatched tasks"
                className="px-2.5 py-1 rounded text-[9px] font-bold cursor-pointer border bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/50 hover:bg-[#38bdf8] hover:text-black transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                SYNC DISPATCH
              </button>
            </div>
          </div>

          {/* FULL-WIDTH WRAPPED PROJECT PILLS */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#1f242d]/70">
            {projectOptions.map(p => {
              const count = countTasksForProject(p);
              const isSelected = selectedProjectScope === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedProjectScope(p)}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#ffb800] text-black border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                      : 'bg-[#14171c] text-[#C5BD9F] border-[#232832] hover:text-white hover:border-[#ffb800]/60'
                  }`}
                >
                  <span>{p}</span>
                  <span className={`px-1 rounded text-[8px] ${
                    isSelected
                      ? 'bg-black/20 text-black'
                      : count > 0
                        ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                        : 'bg-[#1f242d] text-[#64748B]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FLOOR 1: CAPTURE & PLAN IDEA INPUT */}
        <form onSubmit={handleCaptureIdea} className="flex gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2">
          <input
            type="text"
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            placeholder={`[FLOOR 1 CAPTURE] Drop a prompt into triage for [${selectedProjectScope === 'ALL PROJECTS' ? (projects[0] || 'Bounty_Engine') : selectedProjectScope}]...`}
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
            <option value="SILAS // DATABASE">SILAS // DATABASE</option>
            <option value="ROXY // UI/UX">ROXY // UI/UX</option>
            <option value="THE ASKARI // SECURITY">THE ASKARI // SECURITY</option>
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
                ? `Overseeing operational pipelines across ${projects.length} active on-disk project(s). Zero-state disk-truth active.`
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
                <span>SILAS // DATABASE</span>
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
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>THE ASKARI // SECURITY</span>
                <span className="text-[#10b981]">ARMED</span>
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
          className="bg-[#1c1214] hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#f43f5e]/40 font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-all cursor-pointer text-[9px]"
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
    if (director.includes('SILAS')) return 'text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10';
    if (director.includes('ASKARI')) return 'text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10';
    if (director.includes('ROXY')) return 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#f43f5e]/10';
    return 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10';
  };

  return (
    <div className="bg-[#0a0c0e] border border-[#1f242d] hover:border-[#C5BD9F]/40 rounded p-2.5 flex flex-col gap-1.5 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[8px] font-mono text-[#5c6b7f] font-bold">
          {task.id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono text-[#C5BD9F] truncate max-w-[110px]">
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
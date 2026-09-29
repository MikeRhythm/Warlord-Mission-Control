import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, PlayCircle, AlertCircle, ArrowRight, 
  Layers, Filter, Sparkles, Terminal, ShieldAlert, Check, RefreshCw
} from 'lucide-react';
import './Tab04TaskBoard.css';

const DEFAULT_PROJECT_MANIFESTS = [
  {
    name: 'MAKING MONEY IDEAS',
    totalTasks: 18,
    status: 'COMPLETED',
    dispatchedAt: '2026-09-27T10:14:00.000Z',
    tasks: Array.from({ length: 18 }, (_, i) => ({
      id: `TASK-MMI-${i + 1}`,
      project: 'MAKING MONEY IDEAS',
      title: `Execution Node Pipeline Step ${i + 1}`,
      assignedDirector: 'MONTY // COMMAND',
      toolId: 'daemon_runner',
      status: 'COMPLETED',
      stage: 'SHIPPED',
      timestamp: '2026-09-27T12:00:00.000Z'
    }))
  },
  {
    name: 'ZAMBEZI SAFARI',
    totalTasks: 3,
    status: 'ACTIVE',
    dispatchedAt: '2026-09-28T18:30:00.000Z',
    tasks: [
      { 
        id: 'TASK-ZAM-1', 
        project: 'ZAMBEZI SAFARI', 
        title: 'Landing Page Viewport Staging', 
        assignedDirector: 'ROXY // ARTWORK ALPHA', 
        toolId: 'ui_inspector', 
        status: 'COMPLETED', 
        stage: 'SHIPPED', 
        timestamp: '2026-09-28T18:30:00.000Z' 
      },
      { 
        id: 'TASK-ZAM-2', 
        project: 'ZAMBEZI SAFARI', 
        title: 'Private Charter Dossier & Copy Deck', 
        assignedDirector: 'AMBER // COPYWRITER', 
        toolId: 'copy_generator', 
        status: 'COMPLETED', 
        stage: 'SHIPPED', 
        timestamp: '2026-09-28T18:35:00.000Z' 
      },
      { 
        id: 'TASK-ZAM-3', 
        project: 'ZAMBEZI SAFARI', 
        title: 'Lake Malawi & Zambezi Concession Sync', 
        assignedDirector: 'ATLAS // INFRASTRUCTURE', 
        toolId: 'booking_sync', 
        status: 'BUILDING', 
        stage: 'AGENT BUILD', 
        timestamp: '2026-09-28T19:00:00.000Z' 
      }
    ]
  }
];

export default function Tab04TaskBoard({ ws }) {
  const [selectedProjectScope, setSelectedProjectScope] = useState(() => {
    return localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'ALL PROJECTS';
  });

  const [manifests, setManifests] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_PROJECT_MANIFESTS;
    } catch (e) {
      return DEFAULT_PROJECT_MANIFESTS;
    }
  });

  // Pull all tasks flattened from all manifests
  const getAllTasks = () => {
    let all = [];
    manifests.forEach(m => {
      if (m.tasks && Array.isArray(m.tasks)) {
        all = all.concat(m.tasks);
      }
    });
    return all;
  };

  const [taskList, setTaskList] = useState(getAllTasks);

  // Sync when localStorage or manifests change
  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
        if (stored) {
          const parsed = JSON.parse(stored);
          setManifests(parsed);
          let all = [];
          parsed.forEach(m => {
            if (m.tasks && Array.isArray(m.tasks)) {
              all = all.concat(m.tasks);
            }
          });
          setTaskList(all);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter tasks based on project scope
  const filteredTasks = taskList.filter(t => {
    if (selectedProjectScope === 'ALL PROJECTS') return true;
    return t.project === selectedProjectScope;
  });

  // Map tasks to Hermes Super Kanban 4-Stage Lanes
  const captureAndPlanTasks = filteredTasks.filter(t => t.stage === 'CAPTURE & PLAN' || t.status === 'PLANNING');
  const agentBuildTasks = filteredTasks.filter(t => t.stage === 'AGENT BUILD' || t.status === 'BUILDING');
  const humanGateTasks = filteredTasks.filter(t => t.stage === 'HUMAN GATE' || t.status === 'WAITING_APPROVAL');
  const shippedTasks = filteredTasks.filter(t => t.stage === 'SHIPPED' || t.status === 'COMPLETED');

  // Interactive Stage Advance
  const advanceTask = (taskId) => {
    const updated = taskList.map(t => {
      if (t.id === taskId) {
        let nextStage = 'AGENT BUILD';
        let nextStatus = 'BUILDING';
        if (t.stage === 'CAPTURE & PLAN') { nextStage = 'AGENT BUILD'; nextStatus = 'BUILDING'; }
        else if (t.stage === 'AGENT BUILD') { nextStage = 'HUMAN GATE'; nextStatus = 'WAITING_APPROVAL'; }
        else if (t.stage === 'HUMAN GATE') { nextStage = 'SHIPPED'; nextStatus = 'COMPLETED'; }
        else if (t.stage === 'SHIPPED') { nextStage = 'CAPTURE & PLAN'; nextStatus = 'PLANNING'; }
        return { ...t, stage: nextStage, status: nextStatus };
      }
      return t;
    });

    setTaskList(updated);

    // Save back to manifests in localStorage
    const updatedManifests = manifests.map(m => {
      return {
        ...m,
        tasks: updated.filter(t => t.project === m.name)
      };
    });
    setManifests(updatedManifests);
    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));
  };

  const projectOptions = ['ALL PROJECTS', ...manifests.map(m => m.name)];

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      
      {/* LEFT AREA: KANBAN BOARD */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        
        {/* TELEMETRY TOP BAR */}
        <div className="grid grid-cols-4 gap-2 border border-[#1f242d] rounded bg-[#0d0f12] p-2.5">
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-white font-mono">{filteredTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">ACTIVE DAEMONS</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#38bdf8] font-mono">{agentBuildTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">BUILDING</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#ffb800] font-mono">{humanGateTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">HUMAN GATE</div>
          </div>
          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2 text-center">
            <div className="text-lg font-bold text-[#10b981] font-mono">{shippedTasks.length}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-0.5">TOTAL SHIPPED</div>
          </div>
        </div>

        {/* PROJECT SCOPE CONTROLLER */}
        <div className="flex items-center justify-between border border-[#1f242d] rounded bg-[#0d0f12] px-3 py-1.5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
            <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider">
              WARLORD PROJECT SCOPE:
            </span>
          </div>

          <div className="flex items-center gap-1.5">
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

        {/* HERMES 4-STAGE KANBAN LANES */}
        <div className="flex-1 grid grid-cols-4 gap-2 overflow-hidden">
          
          {/* LANE 1: CAPTURE & PLAN */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                CAPTURE & PLAN
              </span>
              <span className="text-[9px] bg-[#1a202c] text-gray-400 px-1.5 py-0.5 rounded font-bold">
                {captureAndPlanTasks.length}
              </span>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {captureAndPlanTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  No ideas currently awaiting planning.
                </div>
              ) : (
                captureAndPlanTasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
                ))
              )}
            </div>
          </div>

          {/* LANE 2: AGENT BUILD */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#38bdf8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                AGENT BUILD
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

          {/* LANE 3: HUMAN GATE */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#ffb800] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffb800]" />
                HUMAN GATE
              </span>
              <span className="text-[9px] bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/30 px-1.5 py-0.5 rounded font-bold">
                {humanGateTasks.length}
              </span>
            </div>

            <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {humanGateTasks.length === 0 ? (
                <div className="text-[#5c6b7f] text-center p-6 italic text-[10px]">
                  Zero approval bottlenecks pending.
                </div>
              ) : (
                humanGateTasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
                ))
              )}
            </div>
          </div>

          {/* LANE 4: SHIPPED */}
          <div className="border border-[#1f242d] rounded bg-[#0d0f12] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0a0c0e] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#10b981] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                SHIPPED
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
                  <TaskCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDEBAR: LIVE HERMES ORCHESTRATION FEED */}
      <div className="w-72 border border-[#1f242d] rounded bg-[#0d0f12] p-3 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border-b border-[#1f242d] pb-2 flex items-center justify-between">
          <span className="text-[#ffb800] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ffb800]" />
            LIVE HERMES ORCHESTRATION
          </span>
          <span className="text-[8px] text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-1.5 py-0.5 rounded font-bold">
            ONLINE
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
                ? 'Managing full cluster across all registered manifests. 21 daemons assigned.' 
                : `Focused on [${selectedProjectScope}]. Telemetry streams synchronized with Tab 09 Previews.`}
            </p>
          </div>

          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2.5 space-y-1.5">
            <span className="text-gray-400 font-bold block text-[9px] uppercase tracking-wider">
              ACTIVE DIRECTOR ROSTER:
            </span>
            <div className="flex flex-col gap-1 text-[9px]">
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>ROXY // ARTWORK ALPHA</span>
                <span className="text-[#10b981]">SHIPPED</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>AMBER // COPYWRITER</span>
                <span className="text-[#10b981]">SHIPPED</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>ATLAS // INFRASTRUCTURE</span>
                <span className="text-[#38bdf8] animate-pulse">BUILDING</span>
              </div>
              <div className="flex justify-between items-center text-[#ffb800]">
                <span>MONTY // COMMAND</span>
                <span className="text-[#10b981]">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0c0e] border border-[#1f242d] rounded p-2.5 space-y-1 text-[9px] text-[#5c6b7f]">
            <span className="font-bold text-gray-400 block uppercase">Self-Driving Protocol:</span>
            <p>Cards transition automatically upon LLM directive completion or via manual click-advance.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

// Subcomponent: Individual Kanban Task Card
function TaskCard({ task, onAdvance }) {
  const getBadgeColor = (director) => {
    if (director.includes('ROXY')) return 'text-[#ffb800] border-[#ffb800]/40 bg-[#ffb800]/10';
    if (director.includes('AMBER')) return 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#f43f5e]/10';
    if (director.includes('ATLAS')) return 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/10';
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
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${getBadgeColor(task.assignedDirector)}`}>
          {task.assignedDirector.split('//')[0].trim()}
        </span>

        <button
          onClick={onAdvance}
          className="p-1 rounded bg-[#14171c] hover:bg-[#ffb800] text-[#8fa0b5] hover:text-black border border-[#232832] transition-colors cursor-pointer"
          title="Advance to next Kanban stage"
        >
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Cpu, CheckCircle, ShieldAlert, Zap, Server } from 'lucide-react';

export default function Tab04TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [selectedScope, setSelectedScope] = useState('ALL PROJECTS');
  const [projectList, setProjectList] = useState(['ALL PROJECTS']);

  // 1. Load active tasks safely from Base 1 Storage
  const loadTasks = () => {
    try {
      const storedTasks = localStorage.getItem('MCNC_ACTIVE_TASKS');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
          
          // Extract unique project names for the scope filter
          const uniqueProjects = [...new Set(parsedTasks.map(t => t?.project).filter(Boolean))];
          setProjectList(['ALL PROJECTS', ...uniqueProjects]);
        }
      }
    } catch (e) {
      console.error("Failed to parse active tasks", e);
    }
  };

  // 2. Listeners for real-time War Room dispatch syncing
  useEffect(() => {
    loadTasks();
    window.addEventListener('warlord-project-dispatched', loadTasks);
    window.addEventListener('storage', loadTasks);
    return () => {
      window.removeEventListener('warlord-project-dispatched', loadTasks);
      window.removeEventListener('storage', loadTasks);
    };
  }, []);

  // Filter tasks by selected project scope
  const filteredTasks = selectedScope === 'ALL PROJECTS' 
    ? tasks 
    : tasks.filter(t => t?.project === selectedScope);

  // Kanban Swimlane Categories
  const captureTasks = filteredTasks.filter(t => t?.stage === 'CAPTURE & PLAN');
  const buildTasks = filteredTasks.filter(t => t?.stage === 'AGENT BUILD' || (!t?.stage && t?.status === 'BUILDING'));
  const gateTasks = filteredTasks.filter(t => t?.stage === 'HUMAN GATE');
  const shippedTasks = filteredTasks.filter(t => t?.stage === 'SHIPPED' || t?.status === 'COMPLETED');

  // Safe Extraction of Active Daemons as an Array
  const uniqueDaemonsList = Array.from(new Set(
    buildTasks.map(t => (t && t.assignedDirector ? t.assignedDirector : 'MONTY // COMMAND'))
  ));
  const activeDaemonsCount = uniqueDaemonsList.length;

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono text-[#e2e8f0] p-3 gap-3 select-none overflow-hidden">
      
      {/* MAIN LEFT AREA */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        
        {/* TOP STATS PANEL */}
        <div className="bg-[#0d0f12] border border-[#1f242d] rounded flex items-center justify-around py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#10b981]">{activeDaemonsCount}</span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">ACTIVE DAEMONS</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#38bdf8]">{buildTasks.length}</span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">BUILDING</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#ffb800]">{gateTasks.length}</span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">HUMAN GATE</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#e2e8f0]">{shippedTasks.length}</span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">TOTAL SHIPPED</span>
          </div>
        </div>

        {/* PROJECT SCOPE FILTER */}
        <div className="flex items-center gap-3">
          <span className="text-[#ffb800] font-bold text-[11px] tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            WARLORD PROJECT SCOPE:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {projectList.map(proj => (
              <button 
                key={proj}
                onClick={() => setSelectedScope(proj)}
                className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                  selectedScope === proj 
                    ? 'border-[#ffb800] text-[#ffb800] bg-[#ffb800]/10' 
                    : 'border-[#1f242d] text-[#8fa0b5] bg-[#0d0f12] hover:border-[#5c6b7f]'
                }`}
              >
                {proj}
              </button>
            ))}
          </div>
        </div>

        {/* KANBAN SWIMLANES */}
        <div className="flex-1 grid grid-cols-4 gap-3 min-h-0">
          
          {/* COLUMN 1: CAPTURE & PLAN */}
          <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#14171c] border-b border-[#1f242d] flex items-center justify-between">
              <span className="text-[10px] text-[#5c6b7f] font-bold tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5c6b7f]"></div>
                CAPTURE &amp; PLAN
              </span>
              <span className="text-[#8fa0b5] font-bold">{captureTasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {captureTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </div>

          {/* COLUMN 2: AGENT BUILD */}
          <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#14171c] border-b border-[#1f242d] flex items-center justify-between">
              <span className="text-[10px] text-[#38bdf8] font-bold tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></div>
                AGENT BUILD
              </span>
              <span className="text-[#38bdf8] font-bold">{buildTasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {buildTasks.map(task => <TaskCard key={task.id} task={task} accent="#38bdf8" />)}
            </div>
          </div>

          {/* COLUMN 3: HUMAN GATE */}
          <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#14171c] border-b border-[#1f242d] flex items-center justify-between">
              <span className="text-[10px] text-[#ffb800] font-bold tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffb800]"></div>
                HUMAN GATE
              </span>
              <span className="text-[#ffb800] font-bold">{gateTasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {gateTasks.map(task => <TaskCard key={task.id} task={task} accent="#ffb800" />)}
            </div>
          </div>

          {/* COLUMN 4: SHIPPED */}
          <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#14171c] border-b border-[#1f242d] flex items-center justify-between">
              <span className="text-[10px] text-[#10b981] font-bold tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                SHIPPED
              </span>
              <span className="text-[#10b981] font-bold">{shippedTasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {shippedTasks.map(task => <TaskCard key={task.id} task={task} accent="#10b981" />)}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR: LIVE ORCHESTRATION */}
      <div className="w-72 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden flex-shrink-0">
        <div className="px-3 py-3 bg-[#14171c] border-b border-[#1f242d]">
          <span className="text-[11px] text-[#e2e8f0] font-bold tracking-wider">LIVE HERMES ORCHESTRATION</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Monty (Chief of Staff)</span>
            </div>
            <p className="text-[#8fa0b5] text-[10px] leading-relaxed">
              {tasks.length > 0 
                ? `Active PRD ingested. Dispatched ${tasks.length} execution unit(s) to Paperclip daemon. Monitoring director telemetry...` 
                : 'Zero-state initialized. Standing by for telemetry dispatch.'}
            </p>
          </div>

          {tasks.length > 0 && (
            <div className="pt-4 border-t border-[#1f242d] space-y-3">
              <span className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-widest">Active Daemon Sub-Routines</span>
              {uniqueDaemonsList.map(daemon => (
                <div key={daemon} className="flex items-center justify-between bg-[#14171c] p-2 rounded border border-[#232832]">
                  <span className="text-[10px] font-bold text-[#e2e8f0] truncate pr-2">{daemon}</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering individual task cards with robust zero-state fallbacks
function TaskCard({ task, accent }) {
  const rawDirector = task?.assignedDirector || 'MONTY // COMMAND';
  const agentName = rawDirector.includes('//') ? rawDirector.split('//')[0].trim() : rawDirector;
  const badgeChar = agentName ? agentName.charAt(0).toUpperCase() : 'M';

  return (
    <div 
      className="bg-[#101317] border border-[#232832] p-2.5 rounded hover:border-[#5c6b7f] transition-colors flex flex-col gap-2 relative overflow-hidden"
      style={{ borderLeftColor: accent ? accent : undefined, borderLeftWidth: accent ? '2px' : '1px' }}
    >
      <div className="font-bold text-[11px] text-[#e2e8f0] leading-tight pr-4">
        {task?.title || 'Untitled Execution Unit'}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] bg-[#1a1f26] text-[#8fa0b5] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#2d3748]">
          <Server className="w-2.5 h-2.5" />
          {task?.toolId || 'system_node'}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[#1f242d] pt-2 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#1f242d] flex items-center justify-center text-[9px] font-bold text-[#ffb800]">
            {badgeChar}
          </div>
          <span className="text-[9px] text-[#8fa0b5] font-bold truncate max-w-[100px]">
            {agentName}
          </span>
        </div>
        
        {(task?.stage === 'AGENT BUILD' || (!task?.stage && task?.status === 'BUILDING')) && (
          <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
        )}
        {task?.stage === 'HUMAN GATE' && (
          <ShieldAlert className="w-3.5 h-3.5 text-[#ffb800]" />
        )}
        {(task?.stage === 'SHIPPED' || task?.status === 'COMPLETED') && (
          <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, CheckCircle2, Clock, PlayCircle, Archive, Trash2, 
  ExternalLink, Layers, ArrowUpDown, Filter, ChevronRight, Terminal, RefreshCw
} from 'lucide-react';
import './Tab03Projects.css';

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
      stage: 'STAGE 14',
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
        stage: 'STAGE 09', 
        timestamp: '2026-09-28T18:30:00.000Z' 
      },
      { 
        id: 'TASK-ZAM-2', 
        project: 'ZAMBEZI SAFARI', 
        title: 'Private Charter Dossier & Copy Deck', 
        assignedDirector: 'AMBER // COPYWRITER', 
        toolId: 'copy_generator', 
        status: 'COMPLETED', 
        stage: 'STAGING', 
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

export default function Tab03Projects({ ws }) {
  const [manifests, setManifests] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
      if (!stored) {
        localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(DEFAULT_PROJECT_MANIFESTS));
        return DEFAULT_PROJECT_MANIFESTS;
      }
      
      let parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(DEFAULT_PROJECT_MANIFESTS));
        return DEFAULT_PROJECT_MANIFESTS;
      }

      // Auto-heal empty task manifests (e.g. ZAMBEZI SAFARI with 0/0 tasks)
      let stateModified = false;
      const healed = parsed.map(p => {
        if (p.name === 'ZAMBEZI SAFARI' && (!p.tasks || p.tasks.length === 0)) {
          stateModified = true;
          return {
            ...p,
            totalTasks: 3,
            status: 'ACTIVE',
            tasks: DEFAULT_PROJECT_MANIFESTS[1].tasks
          };
        }
        return p;
      });

      // Ensure ZAMBEZI SAFARI exists in the manifest board if missing
      if (!healed.some(p => p.name === 'ZAMBEZI SAFARI')) {
        healed.push(DEFAULT_PROJECT_MANIFESTS[1]);
        stateModified = true;
      }

      if (stateModified) {
        localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(healed));
      }
      return healed;
    } catch (e) {
      return DEFAULT_PROJECT_MANIFESTS;
    }
  });

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedProjectName, setSelectedProjectName] = useState('ALL');

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
        if (stored) {
          setManifests(JSON.parse(stored));
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalIngested = manifests.length;
  const activePipelines = manifests.filter(m => m.status === 'ACTIVE').length;
  const shippedPipelines = manifests.filter(m => m.status === 'COMPLETED').length;

  const filteredManifests = manifests.filter(m => {
    if (selectedProjectName !== 'ALL' && m.name !== selectedProjectName) return false;
    if (activeFilter === 'ACTIVE') return m.status === 'ACTIVE';
    if (activeFilter === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  const handleDelete = (name) => {
    const updated = manifests.filter(m => m.name !== name);
    setManifests(updated);
    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updated));
    if (selectedProjectName === name) setSelectedProjectName('ALL');
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      
      {/* LEFT COLUMN: ACTIVE PROJECTS DIRECTORY */}
      <div className="w-80 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#ffb800]" />
              ACTIVE PROJECTS
            </span>
            <span className="text-[9px] text-[#38bdf8] border border-[#38bdf8]/40 px-1.5 py-0.5 rounded font-bold">
              {manifests.length} REG
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <div
              onClick={() => setSelectedProjectName('ALL')}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                selectedProjectName === 'ALL'
                  ? 'bg-[#14171c] border-[#ffb800] text-[#ffb800] font-bold shadow-[0_0_8px_rgba(255,184,0,0.15)]'
                  : 'bg-[#0a0c0e] border-[#1f242d] text-[#8fa0b5] hover:border-gray-600'
              }`}
            >
              <span>[00] VIEW ALL MANIFESTS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            {manifests.map((m, idx) => {
              const isSelected = selectedProjectName === m.name;
              return (
                <div
                  key={m.name}
                  onClick={() => setSelectedProjectName(m.name)}
                  className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#14171c] border-[#ffb800] text-white shadow-[0_0_8px_rgba(255,184,0,0.15)]'
                      : 'bg-[#0a0c0e] border-[#1f242d] text-[#8fa0b5] hover:border-gray-600'
                  }`}
                >
                  <span className={`text-[10px] font-bold truncate max-w-[190px] ${isSelected ? 'text-[#ffb800]' : 'text-gray-300'}`}>
                    [{String(idx + 1).padStart(2, '0')}] {m.name}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                    m.status === 'COMPLETED'
                      ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/40'
                      : 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40'
                  }`}>
                    {m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MANIFEST TILES & PROGRESS DECK */}
      <div className="flex-1 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        
        {/* HEADER TOOLBAR */}
        <div className="p-2.5 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
            <span className="text-[#ffb800] font-bold text-[11px] uppercase tracking-wider">
              03 PROJECTS // {selectedProjectName === 'ALL' ? 'PORTFOLIO MANIFEST BOARD' : selectedProjectName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#14171c] border border-[#1f242d] rounded p-0.5 gap-0.5">
              {['ALL', 'ACTIVE', 'COMPLETED'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                    activeFilter === f ? 'bg-[#ffb800] text-black' : 'text-[#8fa0b5] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TELEMETRY TOP BAR */}
        <div className="grid grid-cols-4 gap-2 p-3 border-b border-[#1f242d] bg-[#0a0c0e]">
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-3 text-center">
            <div className="text-xl font-bold text-white font-mono">{totalIngested}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-1">TOTAL INGESTED</div>
          </div>
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-3 text-center">
            <div className="text-xl font-bold text-[#38bdf8] font-mono">{activePipelines}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-1">ACTIVE PIPELINES</div>
          </div>
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-3 text-center">
            <div className="text-xl font-bold text-[#10b981] font-mono">{shippedPipelines}</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-1">100% SHIPPED</div>
          </div>
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-3 text-center">
            <div className="text-xl font-bold text-[#ffb800] font-mono">0</div>
            <div className="text-[9px] text-[#8fa0b5] uppercase tracking-wider mt-1">ARCHIVED</div>
          </div>
        </div>

        {/* PROJECT MANIFEST CARDS */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
          {filteredManifests.map(m => {
            const completedCount = m.tasks ? m.tasks.filter(t => t.status === 'COMPLETED').length : 0;
            const totalCount = m.totalTasks || (m.tasks ? m.tasks.length : 0);
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div 
                key={m.name} 
                className="border border-[#1f242d] rounded bg-[#0a0c0e] p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#ffb800] tracking-wide">{m.name}</h3>
                    <p className="text-[10px] text-[#8fa0b5] mt-0.5">
                      Warlord PRD Executed. Task sequence handed off to Paperclip daemon.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                      m.status === 'COMPLETED'
                        ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/40'
                        : 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40'
                    }`}>
                      {m.status}
                    </span>
                    <button 
                      onClick={() => handleDelete(m.name)}
                      className="p-1 rounded bg-[#1f242d]/50 hover:bg-[#ef4444]/20 text-[#8fa0b5] hover:text-[#ef4444] transition-colors cursor-pointer"
                      title="Delete Manifest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#10b981] flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                      {progress}% COMPLETED
                    </span>
                    <span className="text-[#8fa0b5]">{completedCount} / {totalCount} TASKS</span>
                  </div>
                  <div className="w-full bg-[#14171c] h-1.5 rounded-full overflow-hidden border border-[#1f242d]">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        progress === 100 ? 'bg-[#10b981]' : 'bg-[#38bdf8]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* FOOTER PILL CONTROLS */}
                <div className="flex justify-between items-center pt-2 border-t border-[#1f242d]/60 select-none">
                  <span className="text-[9px] text-[#5c6b7f] font-mono">
                    M MONTY // COMMAND
                  </span>
                  <div className="text-[9px] text-[#8fa0b5] font-mono">
                    DISPATCHED: {new Date(m.dispatchedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
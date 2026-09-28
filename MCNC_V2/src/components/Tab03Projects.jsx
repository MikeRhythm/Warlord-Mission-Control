import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Trash2, CheckCircle2, ArrowUpDown, Filter, Archive, Download, RefreshCw } from 'lucide-react';

const DEFAULT_MANIFESTS = [
  {
    name: 'MAKING MONEY IDEAS',
    status: 'ACTIVE',
    totalTasks: 18,
    tasks: []
  }
];

export default function Tab03Projects() {
  const [manifests, setManifests] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
      return stored ? JSON.parse(stored) : DEFAULT_MANIFESTS;
    } catch (e) {
      return DEFAULT_MANIFESTS;
    }
  });

  const [sortOrder, setSortOrder] = useState('COMPLETION_DESC');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [selectedProject, setSelectedProject] = useState('ALL'); // New Sidebar State

  const loadManifests = () => {
    try {
      const stored = localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
      if (stored) {
        setManifests(JSON.parse(stored));
      } else {
        setManifests([]);
      }
    } catch (e) {
      setManifests([]);
    }
  };

  useEffect(() => {
    loadManifests();
    window.addEventListener('warlord-project-dispatched', loadManifests);
    window.addEventListener('storage', loadManifests);
    return () => {
      window.removeEventListener('warlord-project-dispatched', loadManifests);
      window.removeEventListener('storage', loadManifests);
    };
  }, []);

  // PERMANENT PURGE
  const handleDeleteProject = (projectName) => {
    if (!window.confirm(`Are you sure you want to permanently purge project [${projectName}] and all associated tasks?`)) {
      return;
    }

    const updatedManifests = manifests.filter(m => m.name !== projectName);
    setManifests(updatedManifests);
    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));

    try {
      const storedProjList = JSON.parse(localStorage.getItem('MCNC_PROJECT_LIST') || '[]');
      const updatedProjList = storedProjList.filter(p => p !== projectName);
      localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(updatedProjList));
    } catch (e) {}

    try {
      const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
      const updatedTasks = storedTasks.filter(t => t.project !== projectName);
      localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(updatedTasks));
    } catch (e) {}

    if (localStorage.getItem('MCNC_ACTIVE_PROJECT') === projectName) {
      localStorage.setItem('MCNC_ACTIVE_PROJECT', updatedManifests.length > 0 ? updatedManifests[0].name : '');
    }
    
    if (selectedProject === projectName) setSelectedProject('ALL');

    window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
      detail: { project: projectName, tasks: [] }
    }));
  };

  // ARCHIVE / RESTORE TOGGLE
  const handleToggleArchive = (projectName, currentStatus) => {
    const newStatus = currentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    
    const updatedManifests = manifests.map(m => {
      if (m.name === projectName) {
        return { ...m, status: newStatus };
      }
      return m;
    });

    setManifests(updatedManifests);
    localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));

    // Update Task Visibility on Tab 04
    try {
      const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
      const updatedTasks = storedTasks.map(t => {
        if (t.project === projectName) {
          return { ...t, isArchived: newStatus === 'ARCHIVED' };
        }
        return t;
      });
      localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(updatedTasks));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
      detail: { project: projectName, status: newStatus }
    }));
  };

  // EXPORT MASTER DOSSIER
  const handleExportDossier = (manifest) => {
    const storedTasks = JSON.parse(localStorage.getItem('MCNC_ACTIVE_TASKS') || '[]');
    const projectTasks = storedTasks.filter(t => t.project === manifest.name);

    let markdown = `# MASTER PRODUCTION DOSSIER: ${manifest.name.toUpperCase()}\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n`;
    markdown += `Total Sealed Execution Units: ${projectTasks.length}\n`;
    markdown += `Status: 100% COMPLETED // SHIPPED\n\n`;
    markdown += `==================================================\n\n`;

    projectTasks.forEach((t, i) => {
      markdown += `### [UNIT ${i + 1}] ${t.title}\n`;
      markdown += `- Director: ${t.assignedDirector}\n`;
      markdown += `- Tool Binding: ${t.toolId || 'System Core'}\n`;
      markdown += `- Status: ${t.status}\n\n`;
      if (t.executedArtifact) {
        markdown += `#### Executed Solution Artifact:\n${t.executedArtifact}\n\n`;
      }
      if (t.montyJudgeVerdict) {
        markdown += `#### Gatekeeper Verdict:\n${t.montyJudgeVerdict}\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manifest.name.replace(/\s+/g, '_')}_MASTER_DOSSIER.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Metrics & Sorted View
  const processedProjects = useMemo(() => {
    const listWithStats = manifests.map(m => {
      const tasks = m.tasks || [];
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const total = m.totalTasks || tasks.length || 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...m,
        completedCount: completed,
        totalCount: total,
        percentage: pct
      };
    });

    let filtered = listWithStats;
    
    // Status Filter (Top Right)
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => (p.status || 'ACTIVE') === statusFilter);
    }
    
    // Sidebar Project Filter
    if (selectedProject !== 'ALL') {
      filtered = filtered.filter(p => p.name === selectedProject);
    }

    return filtered.sort((a, b) => {
      if (sortOrder === 'COMPLETION_DESC') return b.percentage - a.percentage;
      if (sortOrder === 'COMPLETION_ASC') return a.percentage - b.percentage;
      if (sortOrder === 'STATUS_ACTIVE') return (b.status === 'ACTIVE' ? 1 : 0) - (a.status === 'ACTIVE' ? 1 : 0);
      if (sortOrder === 'ALPHABETICAL') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [manifests, sortOrder, statusFilter, selectedProject]);

  // Global Stats (Calculated from all manifests, not just filtered ones)
  const activeCount = manifests.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length;
  const archivedCount = manifests.filter(m => m.status === 'ARCHIVED').length;
  const completedCount = manifests.filter(m => {
    const tasks = m.tasks || [];
    const comp = tasks.filter(t => t.status === 'COMPLETED').length;
    const total = m.totalTasks || tasks.length || 0;
    return total > 0 && comp === total;
  }).length;

  return (
    <div className="flex flex-row h-full w-full bg-[#080a0c] text-xs font-mono text-[#e2e8f0] select-none overflow-hidden">
      
      {/* LEFT NAVIGATION MENU (SIDEBAR) */}
      <div className="w-[280px] border-r border-[#1f242d] bg-[#0a0c0f] flex flex-col flex-shrink-0">
        
        {/* SIDEBAR HEADER */}
        <div className="p-5 border-b border-[#1f242d] bg-[#0d0f12]">
          <h3 className="text-[#ffb800] m-0 text-[13px] uppercase tracking-widest font-bold">Active Projects</h3>
          <div className="text-[10px] text-[#5c6b7f] mt-1 font-bold">WARLORD // PORTFOLIO MATRIX</div>
        </div>

        {/* SIDEBAR MENU ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
          <button 
            onClick={() => setSelectedProject('ALL')}
            className={`w-full text-left p-3 border rounded text-[11px] transition-all font-bold ${
              selectedProject === 'ALL' 
                ? 'bg-[#15151e] border-[#ffb800] text-[#ffb800]' 
                : 'bg-transparent border-[#1f242d] text-[#5c6b7f] hover:bg-[#111116] hover:border-[#5c6b7f]'
            }`}
          >
            [00] VIEW ALL MANIFESTS
          </button>
          
          {manifests.map((manifest, idx) => (
            <button 
              key={manifest.name}
              onClick={() => setSelectedProject(manifest.name)}
              className={`w-full text-left p-3 border rounded text-[11px] transition-all font-bold truncate ${
                selectedProject === manifest.name 
                  ? 'bg-[#15151e] border-[#ffb800] text-[#ffb800]' 
                  : 'bg-transparent border-[#1f242d] text-[#5c6b7f] hover:bg-[#111116] hover:border-[#5c6b7f]'
              }`}
            >
              <span className={`mr-2 ${selectedProject === manifest.name ? 'text-white' : 'text-[#38bdf8]'}`}>
                [{String(idx + 1).padStart(2, '0')}]
              </span> 
              {manifest.name}
            </button>
          ))}
        </div>

        {/* SIDEBAR FOOTER (ACTION AREA) */}
        <div className="p-4 border-t border-[#1f242d] bg-[#0d0f12]">
          <button className="w-full bg-[#ffb800]/5 border border-dashed border-[#ffb800]/50 text-[#ffb800] p-3 text-[11px] font-bold uppercase hover:bg-[#ffb800]/10 transition-colors">
            + Initialize Project
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE CANVAS (YOUR EXISTING LOGIC) */}
      <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto custom-scrollbar">
        
        {/* HEADER STRIP */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#1f242d] pb-4 gap-2">
          <div className="text-[14px] text-[#ffb800] uppercase font-bold tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ffb800]" />
            <span>03 PROJECTS // {selectedProject === 'ALL' ? 'ACTIVE MANIFEST BOARD' : selectedProject}</span>
          </div>

          {/* SORT & FILTER CONTROLS */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#101317] border border-[#1f242d] px-2 py-1.5 rounded">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ffb800]" />
              <span className="text-[10px] text-[#5c6b7f] font-bold">SORT:</span>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-[#ffb800] text-[11px] font-bold outline-none cursor-pointer"
              >
                <option value="COMPLETION_DESC" className="bg-[#0d0f12] text-[#e2e8f0]">CLOSEST TO COMPLETION (RANKED %)</option>
                <option value="COMPLETION_ASC" className="bg-[#0d0f12] text-[#e2e8f0]">LEAST PROGRESS</option>
                <option value="STATUS_ACTIVE" className="bg-[#0d0f12] text-[#e2e8f0]">STATUS: ACTIVE FIRST</option>
                <option value="ALPHABETICAL" className="bg-[#0d0f12] text-[#e2e8f0]">PROJECT NAME (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#101317] border border-[#1f242d] px-2 py-1.5 rounded">
              <Filter className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-[10px] text-[#5c6b7f] font-bold">STATUS:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[#38bdf8] text-[11px] font-bold outline-none cursor-pointer"
              >
                <option value="ACTIVE" className="bg-[#0d0f12] text-[#e2e8f0]">ACTIVE ONLY</option>
                <option value="ARCHIVED" className="bg-[#0d0f12] text-[#e2e8f0]">ARCHIVED VAULT</option>
                <option value="ALL" className="bg-[#0d0f12] text-[#e2e8f0]">ALL (INC. ARCHIVED)</option>
              </select>
            </div>
          </div>
        </div>

        {/* TOP SUMMARY STATS */}
        <div className="bg-[#0d0f12] border border-[#1f242d] rounded-lg p-4 flex items-center justify-around shadow-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">{manifests.length}</span>
            <span className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">TOTAL INGESTED</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#38bdf8]">{activeCount}</span>
            <span className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">ACTIVE PIPELINES</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#10b981]">{completedCount}</span>
            <span className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">100% SHIPPED</span>
          </div>
          <div className="w-px h-8 bg-[#1f242d]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-[#eab308]">{archivedCount}</span>
            <span className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">ARCHIVED</span>
          </div>
        </div>

        {/* RESPONSIVE PROJECT CARDS GRID */}
        {processedProjects.length === 0 ? (
          <div className="p-12 text-center border border-[#1f242d] rounded-lg bg-[#0d0f12] text-[#5c6b7f] mt-4">
            ZERO-STATE // NO PROJECTS FOUND FOR "{selectedProject !== 'ALL' ? selectedProject : statusFilter}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 mt-2">
            {processedProjects.map((manifest) => {
              const isCompleted = manifest.percentage === 100;
              const isArchived = manifest.status === 'ARCHIVED';

              return (
                <div 
                  key={manifest.name}
                  className={`bg-[#0d0f12] border rounded-lg p-4 flex flex-col justify-between gap-4 transition-all relative overflow-hidden shadow-sm ${
                    isArchived 
                      ? 'border-[#334155]/40 opacity-70' 
                      : isCompleted 
                        ? 'border-[#10b981]/40 hover:border-[#10b981]' 
                        : 'border-[#1f242d] hover:border-[#38bdf8]/50'
                  }`}
                >
                  {/* TOP TITLE & CONTROLS */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[#ffb800] font-bold text-[13px] tracking-wide leading-snug">
                        {manifest.name}
                      </span>
                      
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          isArchived
                            ? 'bg-[#334155]/20 text-[#94a3b8] border-[#334155]'
                            : isCompleted 
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50'
                              : 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30'
                        }`}>
                          {isArchived ? 'ARCHIVED' : isCompleted ? 'COMPLETED' : 'ACTIVE'}
                        </span>

                        {/* ARCHIVE / UNARCHIVE TOGGLE */}
                        <button
                          onClick={() => handleToggleArchive(manifest.name, manifest.status)}
                          className="p-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-white border border-[#334155] rounded-md cursor-pointer transition-colors"
                          title={isArchived ? "Restore to Active" : "Archive Project"}
                        >
                          {isArchived ? <RefreshCw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>

                        {/* PERMANENT PURGE BUTTON */}
                        <button
                          onClick={() => handleDeleteProject(manifest.name)}
                          className="p-1.5 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#fca5a5] hover:text-[#ef4444] border border-[#ef4444]/30 rounded-md cursor-pointer transition-colors"
                          title="Permanently purge project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[#8fa0b5] text-[11px] leading-relaxed line-clamp-2 mt-1">
                      {isArchived 
                        ? 'Project execution preserved in cold storage.' 
                        : 'Warlord PRD Executed. Task sequence handed off to Paperclip daemon.'}
                    </p>
                  </div>

                  {/* PROGRESS BAR & STATS */}
                  <div className="space-y-2 bg-[#101317] p-3 rounded-md border border-[#191e26]">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={`flex items-center gap-1.5 ${isCompleted ? 'text-[#10b981]' : 'text-[#ffb800]'}`}>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{manifest.percentage}% COMPLETED</span>
                      </span>
                      <span className="text-[#8fa0b5]">
                        {manifest.completedCount} / {manifest.totalCount} TASKS
                      </span>
                    </div>

                    <div className="w-full bg-[#0a0c0e] h-2 rounded-full overflow-hidden border border-[#232832]">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCompleted ? 'bg-[#10b981]' : 'bg-[#ffb800]'
                        }`}
                        style={{ width: `${manifest.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#14181f] text-[10px]">
                    <span className="bg-[#14171c] text-[#8fa0b5] px-2 py-1 rounded border border-[#232832] font-bold">
                      M MONTY // COMMAND
                    </span>

                    {isCompleted && (
                      <button
                        onClick={() => handleExportDossier(manifest)}
                        className="px-2.5 py-1 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>EXPORT DOSSIER</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
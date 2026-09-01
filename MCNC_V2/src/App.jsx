import React, { useState } from 'react';
import { 
  Terminal, Shield, FolderKanban, CheckSquare, Calendar, 
  BookOpen, Paperclip, Palette, Network, Coins, 
  Orbit, Eye, FileText, LayoutGrid 
} from 'lucide-react';
import Tab01Exec from './components/Tab01Exec';

const TABS = [
  { id: '01_exec', label: '01 EXEC', type: 'gold', icon: Terminal },
  { id: '02_warroom', label: '02 WAR ROOM', type: 'obsidian', icon: Shield },
  { id: '03_projects', label: '03 PROJECTS', type: 'teal', icon: FolderKanban },
  { id: '04_taskboard', label: '04 TASK BOARD', type: 'teal', icon: CheckSquare },
  { id: '05_calendar', label: '05 CALENDAR', type: 'teal', icon: Calendar },
  { id: '06_memory', label: '06 MEMORY', type: 'obsidian', icon: BookOpen },
  { id: '07_paperclip', label: '07 PAPERCLIP', type: 'teal', icon: Paperclip },
  { id: '08_palettes', label: '08 PALETTES', type: 'ruby', icon: Palette },
  { id: '09_org', label: '09 ORG', type: 'obsidian', icon: Network },
  { id: '10_tokens', label: '10 TOKENS', type: 'bronze', icon: Coins },
  { id: '11_galaxy', label: '11 GALAXY', type: 'brass', icon: Orbit },
  { id: '12_review', label: '12 REVIEW', type: 'bronze', icon: Eye },
  { id: '13_docs', label: '13 DOCS', type: 'bronze', icon: FileText },
  { id: '14_other', label: '14 OTHER', type: 'obsidian', icon: LayoutGrid },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('01_exec');

  const getTabStyle = (tab) => {
    const isActive = activeTab === tab.id;
    if (isActive) {
      return 'bg-[#0d0f12] text-[#ffb800] border-2 border-[#ffb800] shadow-[0_0_10px_rgba(255,184,0,0.4)]';
    }

    switch (tab.type) {
      case 'teal':
        return 'bg-[#2b4c59] text-[#e2e8f0] border border-[#3d6a7d] hover:bg-[#365e6f]';
      case 'ruby':
        return 'bg-[#592525] text-[#fca5a5] border border-[#7f3535] hover:bg-[#6e2e2e]';
      case 'brass':
        return 'bg-[#4d4930] text-[#fef08a] border border-[#6b6643] hover:bg-[#5c583a]';
      case 'bronze':
        return 'bg-[#4a3838] text-[#e2e8f0] border border-[#664d4d] hover:bg-[#5c4545]';
      case 'obsidian':
      default:
        return 'bg-[#14171c] text-[#a0aec0] border border-[#232832] hover:bg-[#1c2129] hover:text-white';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080a0c] select-none">
      {/* Top Telemetry Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0d0f12] border-b border-[#1f242d] text-xs">
        <div className="font-extrabold text-[#ffb800] tracking-wider">
          WARLORD MISSION CONTROL // MCNC MASTER
        </div>
        <div className="text-[#5c6b7f] font-medium">
          BRIDGE: <span className="text-[#10b981]">ACTIVE (BASE 1)</span> | FRAMEWORK: REACT VITE
        </div>
      </div>

      {/* 14-Pill Master Navigation Deck */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 bg-[#080a0c] border-b-2 border-[#14181f]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded text-[11px] font-bold tracking-wider transition-all duration-150 cursor-pointer ${getTabStyle(tab)}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Dynamic Viewport */}
      <div className="flex-1 overflow-hidden p-3 bg-[#0a0c0e]">
        {activeTab === '01_exec' ? (
          <Tab01Exec />
        ) : (
          <div className="h-full border border-[#1f242d] rounded bg-[#0d0f12] p-6 text-sm">
            <div className="text-[#ffb800] font-bold text-base mb-2">
              ACTIVE MODULE: {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <div className="text-[#5c6b7f]">
              Module container initialized. Ready for component mounting.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
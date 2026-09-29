import React, { useState, useEffect } from 'react';
import { 
  Palette, Droplets, Sliders, Check, Copy, RefreshCw, 
  Sparkles, Layers, ShieldCheck, ArrowRight, Eye, Monitor
} from 'lucide-react';
import './Tab08Palettes.css';

// Master Warlord High-Finance Default Swatches
const PRESET_SWATCHES = [
  { name: 'Obsidian Void', hex: '#080a0c', category: 'SURFACE' },
  { name: 'Nerve Base', hex: '#0d0f12', category: 'SURFACE' },
  { name: 'Card Slate', hex: '#14171c', category: 'SURFACE' },
  { name: 'Gold Core', hex: '#ffb800', category: 'ACCENT' },
  { name: 'Amber Glow', hex: '#f59e0b', category: 'ACCENT' },
  { name: 'Cyan Marker', hex: '#38bdf8', category: 'ACCENT' },
  { name: 'Neon Emerald', hex: '#10b981', category: 'ACCENT' },
  { name: 'Wire Dark', hex: '#1f242d', category: 'BORDER' },
  { name: 'Wire Active', hex: '#2d3748', category: 'BORDER' },
  { name: 'Crimson Breach', hex: '#ef4444', category: 'STATUS' },
  { name: 'Text Primary', hex: '#f8fafc', category: 'TEXT' },
  { name: 'Text Muted', hex: '#8fa0b5', category: 'TEXT' }
];

// Default UI Target Key Bindings
const DEFAULT_KEY_BINDINGS = [
  { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedHex: '#080a0c', description: 'Top navigation deck and control headers' },
  { key: 'main-bg', label: 'Dashboard Base Surface', targetCss: '--warlord-bg-base', assignedHex: '#080a0c', description: 'Master root canvas background' },
  { key: 'card-bg', label: 'Card & Container Slate', targetCss: '--warlord-card-bg', assignedHex: '#0d0f12', description: 'Inner modules, viewport holders, sidebars' },
  { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedHex: '#1f242d', description: 'Structural lines, divider rails, grid bounds' },
  { key: 'gold-accent', label: 'Primary Core Accent', targetCss: '--warlord-accent-gold', assignedHex: '#ffb800', description: 'Primary branding, active navigation, key titles' },
  { key: 'cyan-active', label: 'Telemetry & Progress Cyan', targetCss: '--warlord-accent-cyan', assignedHex: '#38bdf8', description: 'Real-time counters, building progress indicators' },
  { key: 'button-cta', label: 'Interactive CTA Button Fill', targetCss: '--warlord-btn-cta', assignedHex: '#ffb800', description: 'Primary action triggers and dispatch buttons' },
  { key: 'text-primary', label: 'Primary Typography', targetCss: '--warlord-text-main', assignedHex: '#f8fafc', description: 'High-contrast headings and values' },
  { key: 'text-muted', label: 'Telemetry Muted Text', targetCss: '--warlord-text-muted', assignedHex: '#8fa0b5', description: 'Labels, captions, secondary timestamps' }
];

export default function Tab08Palettes({ ws }) {
  const [bindings, setBindings] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PALETTE_BINDINGS');
      return stored ? JSON.parse(stored) : DEFAULT_KEY_BINDINGS;
    } catch (e) {
      return DEFAULT_KEY_BINDINGS;
    }
  });

  const [activeSelectedColor, setActiveSelectedColor] = useState(PRESET_SWATCHES[3].hex); // Default Gold Core
  const [copiedContract, setCopiedContract] = useState(false);
  const [livePreviewTab, setLivePreviewTab] = useState('DESKTOP_SNIPPET');

  // Push CSS Custom Properties dynamically onto the root document
  const applyTokensToDom = (currentBindings) => {
    const root = document.documentElement;
    currentBindings.forEach(b => {
      root.style.setProperty(b.targetCss, b.assignedHex);
    });
  };

  useEffect(() => {
    applyTokensToDom(bindings);
  }, [bindings]);

  // Drag and Drop handlers
  const handleDragStart = (e, hex) => {
    e.dataTransfer.setData('text/plain', hex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    const droppedHex = e.dataTransfer.getData('text/plain');
    if (!droppedHex) return;
    assignColorToKey(targetKey, droppedHex);
  };

  // Direct Assign (either via Drop or Click-to-Assign)
  const assignColorToKey = (targetKey, hex) => {
    const updated = bindings.map(b => {
      if (b.key === targetKey) {
        return { ...b, assignedHex: hex };
      }
      return b;
    });
    setBindings(updated);
    localStorage.setItem('MCNC_PALETTE_BINDINGS', JSON.stringify(updated));
    applyTokensToDom(updated);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setBindings(DEFAULT_KEY_BINDINGS);
    localStorage.setItem('MCNC_PALETTE_BINDINGS', JSON.stringify(DEFAULT_KEY_BINDINGS));
    applyTokensToDom(DEFAULT_KEY_BINDINGS);
  };

  // Export Token Contract for Roxy / Amber System Prompts
  const generateAgentPromptPayload = () => {
    const lines = [
      '### WARLORD UI/UX HIGH-FINANCE TOKEN CONTRACT',
      'All generated components, pages, and dashboards MUST strictly adhere to the following color contract:',
      ...bindings.map(b => `- ${b.label} (${b.targetCss}): ${b.assignedHex}`)
    ];
    return lines.join('\n');
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(generateAgentPromptPayload());
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      
      {/* LEFT COLUMN: SWATCH DECK & PALETTE REPOSITORY */}
      <div className="w-80 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        
        {/* PALETTE SOURCE BOX */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[#ffb800] font-bold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#ffb800]" />
              WARLORD SWATCH VAULT
            </span>
            <span className="text-[9px] text-[#38bdf8] border border-[#38bdf8]/40 px-1.5 py-0.5 rounded font-bold">
              HIGH-FINANCE
            </span>
          </div>
          <p className="text-[10px] text-[#8fa0b5] leading-relaxed">
            Drag any swatch card, or click to select and drop directly onto target keys.
          </p>

          <div className="flex items-center gap-2 bg-[#080a0c] border border-[#1f242d] p-2 rounded">
            <div 
              className="w-6 h-6 rounded border border-white/20 shadow-inner flex-shrink-0"
              style={{ backgroundColor: activeSelectedColor }}
            />
            <div className="flex-1">
              <span className="text-[9px] text-gray-400 block">SELECTED COLOR:</span>
              <span className="text-[11px] font-bold text-white font-mono uppercase">{activeSelectedColor}</span>
            </div>
          </div>
        </div>

        {/* SWATCH CARDS LIST (DRAGGABLE) */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#1f242d]">
            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#ffb800]" />
              DRAGGABLE SWATCHES
            </span>
            <button 
              onClick={handleResetDefaults}
              className="text-[9px] text-[#8fa0b5] hover:text-[#ffb800] flex items-center gap-1 cursor-pointer"
              title="Reset default bindings"
            >
              <RefreshCw className="w-3 h-3" />
              RESET
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {PRESET_SWATCHES.map((swatch) => {
              const isSelected = activeSelectedColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <div
                  key={swatch.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, swatch.hex)}
                  onClick={() => setActiveSelectedColor(swatch.hex)}
                  className={`p-2 rounded border cursor-grab active:cursor-grabbing transition-all flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'border-[#ffb800] bg-[#14171c] shadow-[0_0_8px_rgba(255,184,0,0.2)]' 
                      : 'border-[#1f242d] bg-[#0a0c0e] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-200 truncate">{swatch.name}</span>
                    <span className="text-[7px] text-[#5c6b7f] uppercase">{swatch.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded border border-white/20 shadow-sm"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-[9px] font-mono text-gray-400 uppercase">{swatch.hex}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CENTER & RIGHT COLUMN: TARGET ASSIGNMENT BOARD & AGENT CONTRACT */}
      <div className="flex-1 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        
        {/* HEADER TOOLBAR */}
        <div className="p-2.5 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#ffb800]" />
            <span className="text-[#ffb800] font-bold text-[11px] uppercase tracking-wider">
              08 PALETTES // ACTION TARGET ASSIGNMENT BOARD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContract}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                copiedContract 
                  ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]' 
                  : 'bg-[#14171c] hover:bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/40 hover:border-[#ffb800]'
              }`}
            >
              {copiedContract ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedContract ? 'CONTRACT COPIED' : 'COPY AGENT CONTRACT'}</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA: DUAL COLUMN (BINDING TARGETS + LIVE HARMONY PREVIEW) */}
        <div className="flex-1 flex gap-2 p-3 overflow-hidden">
          
          {/* ASSIGNMENT LANES */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>TARGET ELEMENT BINDING</span>
              <span className="text-[#8fa0b5] text-[9px] font-normal">DROP OR CLICK "ASSIGN"</span>
            </div>

            {bindings.map((b) => (
              <div
                key={b.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, b.key)}
                className="bg-[#0a0c0e] border border-[#1f242d] hover:border-gray-500 rounded p-3 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border border-white/20 shadow-md flex-shrink-0"
                    style={{ backgroundColor: b.assignedHex }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-100">{b.label}</span>
                      <span className="text-[9px] text-[#ffb800] font-mono">{b.targetCss}</span>
                    </div>
                    <span className="text-[9px] text-[#8fa0b5] block mt-0.5">{b.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-300 font-bold uppercase bg-[#14171c] px-2 py-1 rounded border border-[#1f242d]">
                    {b.assignedHex}
                  </span>
                  <button
                    onClick={() => assignColorToKey(b.key, activeSelectedColor)}
                    className="px-2.5 py-1 rounded bg-[#14171c] hover:bg-[#ffb800] text-[#8fa0b5] hover:text-black border border-[#232832] text-[9px] font-bold transition-colors cursor-pointer"
                  >
                    ASSIGN SELECTED
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: LIVE UI HARMONY MOCKUP */}
          <div className="w-80 border border-[#1f242d] rounded bg-[#0a0c0e] flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#1f242d] bg-[#0d0f12] flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#38bdf8]" />
                LIVE HARMONY RENDER
              </span>
              <span className="text-[8px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 px-1.5 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
              
              {/* Simulated Header */}
              <div 
                className="p-2.5 rounded border border-white/10 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: bindings.find(b => b.key === 'header-bg')?.assignedHex }}
              >
                <span className="font-bold text-[10px]" style={{ color: bindings.find(b => b.key === 'gold-accent')?.assignedHex }}>
                  WARLORD // HIGH-FINANCE
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded" style={{ 
                  color: bindings.find(b => b.key === 'cyan-active')?.assignedHex,
                  border: `1px solid ${bindings.find(b => b.key === 'cyan-active')?.assignedHex}40`
                }}>
                  ACTIVE
                </span>
              </div>

              {/* Simulated Card */}
              <div 
                className="p-3 rounded border flex flex-col gap-2"
                style={{ 
                  backgroundColor: bindings.find(b => b.key === 'card-bg')?.assignedHex,
                  borderColor: bindings.find(b => b.key === 'wire-border')?.assignedHex
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold" style={{ color: bindings.find(b => b.key === 'text-primary')?.assignedHex }}>
                    Concession Execution Matrix
                  </span>
                  <span className="text-[8px]" style={{ color: bindings.find(b => b.key === 'text-muted')?.assignedHex }}>
                    STAGE 09
                  </span>
                </div>

                <p className="text-[9px] leading-relaxed" style={{ color: bindings.find(b => b.key === 'text-muted')?.assignedHex }}>
                  Telemetry stream verifying that all UI buttons, card backgrounds, and typography sync cleanly.
                </p>

                {/* Simulated CTA Button */}
                <button 
                  className="w-full py-1.5 rounded text-[9px] font-bold uppercase transition-all shadow-md mt-1"
                  style={{ 
                    backgroundColor: bindings.find(b => b.key === 'button-cta')?.assignedHex,
                    color: '#080a0c'
                  }}
                >
                  DISPATCH DIRECTIVE
                </button>
              </div>

              {/* Agent Contract Status Box */}
              <div className="bg-[#080a0c] border border-[#1f242d] rounded p-2.5 space-y-1.5 mt-auto">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">
                  Agent Enforcement Status:
                </span>
                <p className="text-[9px] text-[#8fa0b5] leading-relaxed">
                  All 16 Warlord directors dynamically read these values from localStorage. Roxy cannot output non-compliant colors while this contract is active.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Palette, Sliders, Check, Copy, RefreshCw, 
  Monitor, Layers, Droplets, ArrowRight, Folder, FileImage, TreePine
} from 'lucide-react';
import './Tab08Palettes.css';

// Master Metallic High Finance Swatches
const HIGH_FINANCE_METALS = [
  { id: 'metal-maroon', name: 'Metal Maroon', gradient: 'linear-gradient(180deg, #C46D63 0%, #8C3A32 50%, #4A1C16 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-sepia', name: 'Metal Sepia', gradient: 'linear-gradient(180deg, #D1C4C0 0%, #9E8C87 50%, #594944 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-bronze', name: 'Metal Bronze', gradient: 'linear-gradient(180deg, #B39E96 0%, #7A635B 50%, #382A26 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-silver', name: 'Metal Silver', gradient: 'linear-gradient(180deg, #CED6DC 0%, #929CA3 50%, #4E5459 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-gunmetal', name: 'Metal Gunmetal', gradient: 'linear-gradient(180deg, #5C666E 0%, #353B40 50%, #121517 100%)', sub: 'TYPE: Gradient', category: 'WARM' },

  { id: 'metal-champagne', name: 'Metal Champagne', gradient: 'linear-gradient(180deg, #E8E6C8 0%, #9C9973 50%, #4A4932 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-sage', name: 'Metal Sage', gradient: 'linear-gradient(180deg, #C2D6C8 0%, #7A9685 50%, #3D5245 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-olive', name: 'Metal Olive', gradient: 'linear-gradient(180deg, #B5C4A3 0%, #6E8059 50%, #364229 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-slate', name: 'Metal Slate', gradient: 'linear-gradient(180deg, #94A1A6 0%, #546369 50%, #273238 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-onyx', name: 'Metal Onyx', gradient: 'linear-gradient(180deg, #444444 0%, #222222 50%, #050505 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },

  { id: 'metal-charcoal', name: 'Metal Charcoal', gradient: 'linear-gradient(180deg, #6E767C 0%, #40454A 50%, #1C1E20 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-graphite', name: 'Metal Graphite', gradient: 'linear-gradient(180deg, #A0AAB2 0%, #687178 50%, #3A3F44 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-taupe', name: 'Metal Taupe', gradient: 'linear-gradient(180deg, #877C75 0%, #544C47 50%, #2B2522 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-espresso', name: 'Metal Espresso', gradient: 'linear-gradient(180deg, #544740 0%, #2E2521 50%, #120E0C 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-antique-brass', name: 'Metal Antique Brass', gradient: 'linear-gradient(180deg, #A8A876 0%, #666645 50%, #2E2E1E 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },

  { id: 'metal-titanium', name: 'Metal Titanium', gradient: 'linear-gradient(180deg, #E2E8ED 0%, #A1A9AF 50%, #55595C 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-brushed-steel', name: 'Metal Brushed Steel', gradient: 'linear-gradient(180deg, #CBD4DB 0%, #8B939A 50%, #454A4E 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-deep-teal', name: 'Metal Deep Teal', gradient: 'linear-gradient(180deg, #5092A8 0%, #265261 50%, #0F252B 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-midnight', name: 'Metal Midnight', gradient: 'linear-gradient(180deg, #2D5063 0%, #142933 50%, #071014 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' }
];

// Africa Palette Master Swatches (From AFRICA_PALETTE_MASTER.md)
const AFRICA_MASTER_SWATCHES = [
  // Static Core Tokens
  { id: 'madothi-charcoal', name: 'Madothi Charcoal', gradient: '#1A0F0A', sub: 'TYPE: Solid Hex', category: 'FOUNDATIONS' },
  { id: 'madothi-espresso', name: 'Madothi Espresso', gradient: '#2B1A11', sub: 'TYPE: Solid Hex', category: 'FOUNDATIONS' },
  { id: 'malawi-sunset', name: 'Malawi Sunset', gradient: '#E35503', sub: 'TYPE: Solid Hex', category: 'IDENTITY ACCENTS' },
  { id: 'african-ochre', name: 'African Ochre', gradient: '#C7923E', sub: 'TYPE: Solid Hex', category: 'IDENTITY ACCENTS' },
  { id: 'canopy-forest', name: 'Canopy Forest', gradient: '#2B4422', sub: 'TYPE: Solid Hex', category: 'PROGRAM & CANOPY' },
  { id: 'canopy-sage', name: 'Canopy Sage', gradient: '#547A4E', sub: 'TYPE: Solid Hex', category: 'PROGRAM & CANOPY' },
  { id: 'safari-tan', name: 'Safari Tan', gradient: '#C49A7D', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'wicker-sand', name: 'Wicker Sand', gradient: '#D9C3B0', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'linen-canvas', name: 'Linen Canvas', gradient: '#F5F0EA', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'linen-highlight', name: 'Linen Highlight', gradient: '#FAF8F5', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },

  // 10-Tier Wood & Timber Matrix
  { id: 'timber-w01', name: 'W-01 Charred Ironwood', gradient: '#1A0F0A', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w02', name: 'W-02 Deep Ebony Sinker', gradient: '#26160E', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w03', name: 'W-03 Roasted Mopane', gradient: '#362015', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w04', name: 'W-04 Aged African Walnut', gradient: '#4A2E1F', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w05', name: 'W-05 Seasoned Teak', gradient: '#5E3D2B', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w06', name: 'W-06 Earthy Kiaat', gradient: '#75503A', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w07', name: 'W-07 Wild Tamboti', gradient: '#8F664C', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w08', name: 'W-08 Sun-Baked Mahogany', gradient: '#AA7F62', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w09', name: 'W-09 Weathered Safari Plank', gradient: '#C49A7D', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w10', name: 'W-10 Bleached Limba', gradient: '#DFBAA0', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' }
];

// Physical Asset Manifest (Expanded Tranches 1-7 Mapping)
const AFRICA_ASSET_MANIFEST = [
  { name: "Aged Ochre Weave.jpg", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Background 1.png", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 2.png", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 3.png", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Border Strip 2.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 3.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 4.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 5.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 6.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 7.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Green.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Weave Wide.png", role: "Class A: Full-Width Primary Landing Header Band", type: "PNG" },
  { name: "Border Strip Weave.png", role: "Class A: Intermediate Section Header Band", type: "PNG" },
  { name: "Border Strip.png", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Fine Beige Weave.jpeg", role: "Class B: Rustic Reading Surface", type: "JPEG" },
  { name: "Fine Thin Weave.jpg", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Graphics.png", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Header Strip.png", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip2.png", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip3.png", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Mat Weave Rich.png", role: "Class B: Rustic Reading Surface", type: "PNG" },
  { name: "pattern-beige-floor.jpg", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-green.jpg", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-main.jpeg", role: "Class C: General UI Asset", type: "JPEG" },
  { name: "pattern-main.jpg", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-wicker.jpg", role: "Class C: General UI Asset", type: "JPG" },
  { name: "Ratan Fine Beige.jpg", role: "Class C: General UI Asset", type: "JPG" },
  { name: "row1.png", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row2.png", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row3.png", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Thick Green Palm Weave.jpg", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Trim 1.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 13.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 2.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 3.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 4.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim12.png", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Vine 2.png", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 3.png", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 4.png", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "vine.png", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "woven-basket-dry.jpg", role: "Class C: General UI Asset", type: "JPG" }
];

const DEFAULT_KEY_BINDINGS = [
  { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: '#0C0C0C', description: 'Top navigation deck & controls' },
  { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: '#0C0C0C', description: 'Master root page backdrop' },
  { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: 'linear-gradient(180deg, #5C666E 0%, #353B40 50%, #121517 100%)', description: 'Modules, preview panels, kanban lanes' },
  { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: '#1E1E1E', description: 'Divider lines and grid boundaries' },
  { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: 'linear-gradient(180deg, #A8A876 0%, #666645 50%, #2E2E1E 100%)', description: 'Trigger actions & dispatch buttons' },
  { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: '#F8FAFC', description: 'High-contrast typography' },
  { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: '#DAA520', description: 'Active tabs and title callouts' }
];

const AFRICA_KEY_BINDINGS = [
  { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: '#1A0F0A', description: 'Madothi Charcoal Top Bar' },
  { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: '#2B1A11', description: 'Madothi Espresso Deep Foundation' },
  { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: '#362015', description: 'W-03 Roasted Mopane Timber Slate' },
  { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: '#4A2E1F', description: 'W-04 Aged African Walnut Framing' },
  { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: '#DAA520', description: 'Goldenrod Action Trigger' },
  { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: '#F5F0EA', description: 'Linen Canvas High Readability' },
  { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: '#C7923E', description: 'African Ochre Focal Highlight' }
];

export default function Tab08Palettes({ ws }) {
  const [activeSideView, setActiveSideView] = useState('MASTER');
  const [selectedMetal, setSelectedMetal] = useState(HIGH_FINANCE_METALS[5]);
  const [draggedMetal, setDraggedMetal] = useState(null);
  const [copiedContract, setCopiedContract] = useState(false);

  const [bindings, setBindings] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PALETTE_METALLIC_BINDINGS_V3');
      return stored ? JSON.parse(stored) : DEFAULT_KEY_BINDINGS;
    } catch (e) {
      return DEFAULT_KEY_BINDINGS;
    }
  });

  const applyTokensToDom = (currentBindings) => {
    const root = document.documentElement;
    currentBindings.forEach(b => {
      root.style.setProperty(b.targetCss, b.assignedValue);
    });
  };

  useEffect(() => {
    applyTokensToDom(bindings);
  }, [bindings]);

  const handleSelectSideView = (view) => {
    setActiveSideView(view);
    if (view === 'AFRICA') {
      setSelectedMetal(AFRICA_MASTER_SWATCHES[3]); // African Ochre
    } else if (view === 'MASTER') {
      setSelectedMetal(HIGH_FINANCE_METALS[5]);
    }
  };

  const handleDragStart = (e, metal) => {
    setDraggedMetal(metal);
    e.dataTransfer.setData('application/json', JSON.stringify(metal));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    let metalToAssign = draggedMetal;
    if (!metalToAssign) {
      try {
        metalToAssign = JSON.parse(e.dataTransfer.getData('application/json'));
      } catch (err) {}
    }
    if (metalToAssign) {
      assignMetalToTarget(targetKey, metalToAssign.gradient);
    }
    setDraggedMetal(null);
  };

  const assignMetalToTarget = (targetKey, value) => {
    const updated = bindings.map(b => {
      if (b.key === targetKey) {
        return { ...b, assignedValue: value };
      }
      return b;
    });
    setBindings(updated);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(updated));
    applyTokensToDom(updated);
  };

  const handleApplyAfricaMaster = () => {
    setBindings(AFRICA_KEY_BINDINGS);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(AFRICA_KEY_BINDINGS));
    applyTokensToDom(AFRICA_KEY_BINDINGS);
  };

  const handleReset = () => {
    setBindings(DEFAULT_KEY_BINDINGS);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(DEFAULT_KEY_BINDINGS));
    applyTokensToDom(DEFAULT_KEY_BINDINGS);
  };

  const handleCopyContract = () => {
    const title = activeSideView === 'AFRICA' 
      ? '### WARLORD AFRICA PALETTE MASTER APPLIED CONTRACT' 
      : '### WARLORD HIGH-FINANCE APPLIED SPEC CONTRACT';

    const lines = [
      title,
      ...bindings.map(b => `- ${b.label} (${b.targetCss}): ${b.assignedValue}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const activeSwatches = activeSideView === 'AFRICA' ? AFRICA_MASTER_SWATCHES : HIGH_FINANCE_METALS;

  return (
    <div className="flex h-full w-full bg-[#0C0C0C] text-xs font-mono select-none p-2 gap-2 overflow-hidden text-[#E2E8F0]">
      
      {/* 1. LEFT NAVIGATION DECK */}
      <div className="w-56 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border border-[#1E1E1E] rounded bg-[#090C0E] p-3 flex flex-col gap-3 flex-1">
          <div>
            <span className="text-[#DAA520] font-bold text-[10px] tracking-widest block uppercase">
              WARLORD PALETTES
            </span>
            <span className="text-[8px] text-[#94A3B8] uppercase">CORE GOVERNANCE</span>
          </div>

          <div className="space-y-1.5 pt-2">
            <button
              onClick={() => handleSelectSideView('MASTER')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                activeSideView === 'MASTER'
                  ? 'border-[#047857] text-[#047857] bg-[#047857]/10 shadow-[0_0_8px_rgba(4,120,87,0.3)]'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-white bg-[#0C0C0C]'
              }`}
            >
              High Finance Master
            </button>

            <button
              onClick={() => handleSelectSideView('AFRICA')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'AFRICA'
                  ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10 shadow-[0_0_8px_rgba(218,165,32,0.3)]'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-[#DAA520] bg-[#0C0C0C]'
              }`}
            >
              <span>Africa Palette Master</span>
              <span className="text-[8px] bg-[#DAA520]/20 text-[#DAA520] px-1 rounded font-bold">20 TOKENS</span>
            </button>

            <button
              onClick={() => handleSelectSideView('DRIFT')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                activeSideView === 'DRIFT'
                  ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-white bg-[#0C0C0C]'
              }`}
            >
              ANALYTICS / 14-DAY DRIFT
            </button>

            <button
              onClick={() => handleSelectSideView('GUIDE')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                activeSideView === 'GUIDE'
                  ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-white bg-[#0C0C0C]'
              }`}
            >
              MCNC GUIDE DECK
            </button>
          </div>

          {/* Quick Apply Africa Preset */}
          {activeSideView === 'AFRICA' && (
            <div className="pt-2 border-t border-[#1E1E1E]">
              <button
                onClick={handleApplyAfricaMaster}
                className="w-full py-2 px-2 bg-[#DAA520]/10 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[9px] font-bold uppercase transition-all shadow-[0_0_8px_rgba(218,165,32,0.2)] cursor-pointer"
              >
                APPLY AFRICA PRESET TO DOM
              </button>
            </div>
          )}

          {/* Active Brush Readout */}
          <div className="mt-auto border border-[#1E1E1E] bg-[#0C0C0C] p-2.5 rounded flex flex-col gap-1.5">
            <span className="text-[8px] text-[#94A3B8] uppercase font-bold">DRAG SWATCH:</span>
            <div 
              className="h-8 w-full rounded border border-white/20 shadow-inner"
              style={{ background: selectedMetal.gradient }}
            />
            <span className="text-[10px] text-white font-bold truncate">{selectedMetal.name}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER: DRAGGABLE SWATCH DECK & ASSETS DRAWER */}
      <div className="flex-1 flex flex-col border border-[#1E1E1E] rounded bg-[#090C0E] overflow-hidden">
        
        {/* Status Header */}
        <div className="p-2.5 bg-[#0C0C0C] border-b border-[#1E1E1E] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] font-bold text-[10px] uppercase tracking-wider">
              {activeSideView === 'AFRICA' ? 'CHIEF MADOTHI OUTREACH //' : 'ACTIVE PIPELINE //'}
            </span>
            <span className="text-[#E2E8F0] font-bold text-[10px] uppercase tracking-widest">
              [ DRAG ANY SWATCH CARD TO ASSIGN ]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-[9px] text-[#94A3B8] hover:text-[#DAA520] flex items-center gap-1 cursor-pointer mr-1"
              title="Reset default bindings"
            >
              <RefreshCw className="w-3 h-3" />
              RESET HIGH FINANCE
            </button>
            <button
              onClick={handleCopyContract}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                copiedContract 
                  ? 'bg-[#047857]/20 text-[#047857] border-[#047857]' 
                  : 'bg-[#14171C] hover:bg-[#DAA520]/20 text-[#DAA520] border-[#DAA520]/40'
              }`}
            >
              {copiedContract ? <Check className="w-3 h-3 text-[#047857]" /> : <Copy className="w-3 h-3 text-[#DAA520]" />}
              <span>{copiedContract ? 'CONTRACT COPIED' : 'COPY SPEC'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Swatches Grid */}
        <div className="flex-1 p-2.5 overflow-y-auto grid grid-cols-4 gap-2 custom-scrollbar">
          {activeSwatches.map((metal) => {
            const isSelected = selectedMetal.id === metal.id;
            return (
              <div
                key={metal.id}
                draggable
                onDragStart={(e) => handleDragStart(e, metal)}
                onClick={() => setSelectedMetal(metal)}
                className={`border rounded flex flex-col overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${
                  isSelected 
                    ? 'border-[#DAA520] shadow-[0_0_10px_rgba(218,165,32,0.3)] scale-[1.01]' 
                    : 'border-[#1E1E1E] hover:border-gray-500 bg-[#0C0C0C]'
                }`}
              >
                <div 
                  className="h-12 w-full p-1.5 flex items-start"
                  style={{ background: metal.gradient }}
                >
                  <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-black/70 text-white shadow-sm truncate">
                    {metal.name}
                  </span>
                </div>
                <div className="bg-[#0C0C0C] px-2 py-1 flex justify-between items-center border-t border-[#1E1E1E]">
                  <span className="text-[7px] text-[#94A3B8] uppercase">{metal.sub}</span>
                  <span className="text-[7px] text-[#DAA520] font-bold uppercase">&larr; DRAG</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Physical Assets Drawer */}
        {activeSideView === 'AFRICA' && (
          <div className="border-t border-[#1E1E1E] bg-[#0A0D10] p-2.5 max-h-48 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1E1E1E] mb-2">
              <span className="text-[9px] font-bold text-[#DAA520] flex items-center gap-1.5 uppercase">
                <Folder className="w-3.5 h-3.5 text-[#DAA520]" />
                PHYSICAL ASSET MAPPING // C:\Warlord_Inc\...\Africa Assets
              </span>
              <span className="text-[8px] text-[#94A3B8]">TRANCHES 1-7 READY</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {AFRICA_ASSET_MANIFEST.map((asset, idx) => (
                <div 
                  key={idx}
                  className="bg-[#0C0C0C] border border-[#1E1E1E] rounded p-1.5 flex items-center justify-between gap-1 hover:border-[#DAA520] transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileImage className="w-3.5 h-3.5 text-[#DAA520] flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-gray-200 block truncate">{asset.name}</span>
                      <span className="text-[7px] text-[#94A3B8] block truncate">{asset.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(asset.name)}
                    className="text-[7.5px] bg-[#14171C] hover:bg-[#DAA520] hover:text-black text-[#94A3B8] px-1 py-0.5 rounded border border-[#232832] font-mono cursor-pointer flex-shrink-0"
                    title="Copy filename"
                  >
                    COPY
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. RIGHT COLUMN: ACTION DROP TARGETS & LIVE PREVIEW */}
      <div className="w-88 flex flex-col border border-[#1E1E1E] rounded bg-[#090C0E] overflow-hidden flex-shrink-0">
        
        <div className="p-2.5 bg-[#0C0C0C] border-b border-[#1E1E1E] flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#DAA520]" />
            UI ACTION DROP SHELF
          </span>
          <span className="text-[8px] text-[#047857] bg-[#047857]/10 px-1.5 py-0.5 rounded border border-[#047857]/30 font-bold">
            DROP TARGETS
          </span>
        </div>

        {/* Action Targets List */}
        <div className="flex-1 p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {bindings.map((b) => (
            <div
              key={b.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, b.key)}
              className="bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#DAA520] rounded p-2 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded border border-white/20 shadow-inner flex-shrink-0"
                  style={{ background: b.assignedValue }}
                />
                <div>
                  <span className="text-[10px] font-bold text-gray-200 block leading-tight">{b.label}</span>
                  <span className="text-[8px] text-[#94A3B8]">{b.description}</span>
                </div>
              </div>

              <button
                onClick={() => assignMetalToTarget(b.key, selectedMetal.gradient)}
                className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#DAA520] text-[#94A3B8] hover:text-black border border-[#1E1E1E] text-[8px] font-bold transition-colors cursor-pointer"
              >
                APPLY
              </button>
            </div>
          ))}
        </div>

        {/* Live Preview Viewport */}
        <div className="border-t border-[#1E1E1E] p-2.5 bg-[#0C0C0C] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-300 uppercase flex items-center gap-1">
              <Monitor className="w-3 h-3 text-[#38bdf8]" />
              HARMONY PREVIEW
            </span>
            <span className="text-[7px] text-[#047857] uppercase font-bold">LIVE DOM</span>
          </div>

          <div 
            className="p-2.5 rounded border border-white/10 flex flex-col gap-1.5 shadow-sm"
            style={{ background: bindings.find(b => b.key === 'card-bg')?.assignedValue }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-white">Chief Madothi Landing Scope</span>
              <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-[#C7923E]">
                STAGE 01
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-white">Children's Daily Feeding & Education</div>
            <button
              className="w-full py-1.5 rounded text-[9px] font-bold uppercase transition-all shadow-md mt-0.5 cursor-pointer"
              style={{ background: bindings.find(b => b.key === 'button-cta')?.assignedValue, color: '#0C0C0C' }}
            >
              DONATE TO THE BOREHOLE FUND
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
import React, { useState } from 'react';
import { Download, Plus, Trash2, Copy, Check, Upload } from 'lucide-react';

const HIGH_FINANCE_MASTER = [
  { name: "Specular Pale Champagne", hex: "#e6e5c5", token: "--metal-champagne-specular", role: "High-Value Sheen", metallic: "linear-gradient(90deg, #6e6b4e 0%, #d8d7b2 25%, #fffee4 50%, #9e9c73 75%, #59573e 100%)" },
  { name: "Deep Milled Champagne", hex: "#b5b084", token: "--metal-champagne-milled", role: "Low-Glare Panel", metallic: "linear-gradient(90deg, #3d3b2a 0%, #87835f 30%, #dedcbd 50%, #636147 70%, #29281d 100%)" },
  { name: "Silvery Sage Luster", hex: "#b2c2b6", token: "--metal-sage-luster", role: "Telemetry Panel", metallic: "linear-gradient(90deg, #516358 0%, #a4b7ab 25%, #e1ebe3 50%, #768a7d 75%, #425248 100%)" },
  { name: "Tactical Deep Sage", hex: "#6c8072", token: "--metal-sage-tactical", role: "Alloy Border", metallic: "linear-gradient(90deg, #242e27 0%, #56695d 30%, #9db5a5 50%, #44544a 70%, #171f1a 100%)" },
  { name: "Muted Olive Titanium", hex: "#8a9685", token: "--metal-olive-specular", role: "Chassis Armor", metallic: "linear-gradient(90deg, #444e40 0%, #85917f 25%, #c5d1bf 50%, #5d6958 75%, #323b2e 100%)" },
  { name: "Shadow Olive Drab", hex: "#545d50", token: "--metal-olive-shadow", role: "Military Ground", metallic: "linear-gradient(90deg, #1e241c 0%, #485244 30%, #7e8c78 50%, #3a4237 70%, #121711 100%)" },
  { name: "Brushed Slate Gunmetal", hex: "#687373", token: "--metal-slate-gunmetal", role: "Structural Rail", metallic: "linear-gradient(90deg, #252b2b 0%, #636f6f 25%, #9da8a8 50%, #454f4f 75%, #181d1d 100%)" },
  { name: "Dark Milled Slate", hex: "#404949", token: "--metal-slate-milled", role: "Dark Rail", metallic: "linear-gradient(90deg, #131717 0%, #363e3e 30%, #6b7777 50%, #2a3030 70%, #0d0f0f 100%)" },
  { name: "Antique Raw Bronze", hex: "#8c7f56", token: "--metal-bronze-sheen", role: "Commodity Accent", metallic: "linear-gradient(90deg, #2a2517 0%, #6d6342 25%, #baa97b 50%, #544c33 75%, #19160d 100%)" },
  { name: "Cool Platinum Silver", hex: "#c5d1d6", token: "--metal-silver-cool", role: "Sovereign Badges", metallic: "linear-gradient(90deg, #3d464b 0%, #8b9ea6 25%, #edf4f7 50%, #5f6d74 75%, #252b2e 100%)" },
  { name: "Glacier Titanium Blue", hex: "#9cb8c4", token: "--metal-glacier-blue", role: "Velocity Subtext", metallic: "linear-gradient(90deg, #2d414a 0%, #6c8d9c 25%, #d1e8f2 50%, #4a6673 75%, #1a272d 100%)" },
  { name: "Teal Gunmetal Shadow", hex: "#304347", token: "--metal-teal-gunmetal", role: "Card Backdrops", metallic: "linear-gradient(90deg, #0e1617 0%, #29383c 25%, #5a747b 50%, #1f2b2e 75%, #080d0e 100%)" },
  { name: "Anodized Cobalt Quant", hex: "#5d99c4", token: "--metal-cobalt-quant", role: "Quant Signal", metallic: "linear-gradient(90deg, #1e3c54 0%, #477c9f 25%, #a6d8fb 50%, #2f5975 75%, #112332 100%)" },
  { name: "Metallic Maroon Oxblood", hex: "#783c3c", token: "--metal-maroon-oxblood", role: "Critical Fault", metallic: "linear-gradient(90deg, #311313 0%, #834040 25%, #c57d7d 50%, #5a2727 75%, #1c0808 100%)" },
  { name: "Brushed Sepia Rose", hex: "#9c827c", token: "--metal-sepia-rose", role: "Executive Badges", metallic: "linear-gradient(90deg, #443431 0%, #997e78 25%, #dac1bc 50%, #6b5550 75%, #251b19 100%)" },
  { name: "Deep Umber Bronze", hex: "#6e5952", token: "--metal-umber-bronze", role: "Armor Plates", metallic: "linear-gradient(90deg, #281d1a 0%, #6f5851 25%, #ab9189 50%, #4b3934 75%, #160e0c 100%)" },
  { name: "Specular Pure Chrome", hex: "#d8dfe4", token: "--metal-chrome-specular", role: "Core Highlights", metallic: "linear-gradient(90deg, #3e484e 0%, #9cb2be 25%, #ffffff 50%, #677c87 75%, #20272b 100%)" },
  { name: "Obsidian Steel Carbon", hex: "#30363a", token: "--metal-obsidian-carbon", role: "Contrast Base", metallic: "linear-gradient(90deg, #0d1012 0%, #2f363b 25%, #59646b 50%, #21272b 75%, #080a0b 100%)" },
  { name: "High-Glare Mirror Chrome", hex: "#f0f2f5", token: "--metal-mirror-chrome", role: "Rim Highlight", metallic: "linear-gradient(90deg, #33393f 0%, #b8c2cc 25%, #ffffff 50%, #8a96a3 75%, #1e2226 100%)" },
  { name: "Brushed Pure Aluminum", hex: "#c8cfd6", token: "--metal-pure-aluminum", role: "Cockpit Bezels", metallic: "linear-gradient(90deg, #475058 0%, #a2adba 25%, #e4eaf0 50%, #6d7885 75%, #2a3036 100%)" },
  { name: "Hardened Titanium Slate", hex: "#8c97a0", token: "--metal-hardened-titanium", role: "Enclosures", metallic: "linear-gradient(90deg, #2b333a 0%, #6b7782 25%, #b4c0cb 50%, #4a545e 75%, #1b2126 100%)" },
  { name: "Deep Anodized Cyan", hex: "#27474d", token: "--metal-anodized-cyan", role: "Tactical Sub-Panels", metallic: "linear-gradient(90deg, #09191c 0%, #224950 25%, #46828d 50%, #17363b 75%, #061113 100%)" },
  { name: "Stealth Carbon Abyss", hex: "#151e21", token: "--metal-stealth-abyss", role: "Chassis Ground", metallic: "linear-gradient(90deg, #06090a 0%, #152226 25%, #2a3c42 50%, #0e171a 75%, #030505 100%)" }
];

export default function Tab08Palettes() {
  const [palettes, setPalettes] = useState([
    { id: 'high-finance', name: 'High Finance Master', swatches: HIGH_FINANCE_MASTER },
    {
      id: 'african-earth',
      name: 'African Weaves & Earth',
      swatches: [
        { name: 'Dark Ochre', hex: '#8b4513', token: '--earth-ochre', role: 'Foundation Clay', metallic: 'linear-gradient(145deg, #a0522d, #8b4513)' },
        { name: 'Zambezi Sand', hex: '#d2b48c', token: '--sand-zambezi', role: 'River Basins', metallic: 'linear-gradient(145deg, #f5deb3, #d2b48c)' },
        { name: 'Raw Acacia', hex: '#4a3b32', token: '--wood-acacia', role: 'Bark / Timber', metallic: 'linear-gradient(145deg, #5c4033, #4a3b32)' },
        { name: 'Copper Sunrise', hex: '#b87333', token: '--copper-sun', role: 'Highlands Accent', metallic: 'linear-gradient(135deg, #d48e4d, #b87333)' }
      ]
    }
  ]);

  const [activePaletteId, setActivePaletteId] = useState('high-finance');
  const [copiedHex, setCopiedHex] = useState(null);
  const [showDumpModal, setShowDumpModal] = useState(false);
  const [rawDumpText, setRawDumpText] = useState('');

  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#ffb800');
  const [newToken, setNewToken] = useState('');
  const [newRole, setNewRole] = useState('');

  const activePalette = palettes.find(p => p.id === activePaletteId) || palettes[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePalette.swatches, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activePalette.id}_tokens.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDumpImport = () => {
    try {
      const parsed = JSON.parse(rawDumpText);
      if (Array.isArray(parsed)) {
        setPalettes(prev => prev.map(p => {
          if (p.id === activePaletteId) return { ...p, swatches: parsed };
          return p;
        }));
        setShowDumpModal(false);
        setRawDumpText('');
      } else {
        alert('Invalid JSON: Must be an array.');
      }
    } catch (e) {
      alert('JSON Parse Error: ' + e.message);
    }
  };

  const handleAddSwatch = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newHex.trim()) return;

    const newSwatch = {
      name: newName.trim(),
      hex: newHex.trim(),
      token: newToken.trim() || `--token-${Date.now()}`,
      role: newRole.trim() || 'Custom Spec',
      metallic: `linear-gradient(135deg, ${newHex}, #0d0f12)`
    };

    setPalettes(prev => prev.map(p => {
      if (p.id === activePaletteId) return { ...p, swatches: [...p.swatches, newSwatch] };
      return p;
    }));

    setNewName('');
    setNewToken('');
    setNewRole('');
  };

  const handleDeleteSwatch = (index) => {
    setPalettes(prev => prev.map(p => {
      if (p.id === activePaletteId) {
        const updated = [...p.swatches];
        updated.splice(index, 1);
        return { ...p, swatches: updated };
      }
      return p;
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080a0c] text-xs font-mono select-none overflow-hidden p-3 gap-2.5">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0f12] border border-[#1f242d] rounded flex-shrink-0">
        <div>
          <span className="text-[#ffb800] font-black text-xs tracking-wider">08 PALETTES // HIGH FINANCE SWATCH COCKPIT</span>
          <span className="text-[10px] text-[#5c6b7f] ml-3">({activePalette.swatches.length} Swatches Loaded • 1-Click Copy)</span>
        </div>

        <button 
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#14171c] text-[#ffb800] border border-[#ffb800]/40 rounded hover:bg-[#ffb800]/10 font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT JSON</span>
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        
        {/* LEFT COMPACT SIDEBAR */}
        <div className="w-56 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 flex-shrink-0 gap-2">
          <div className="text-[10px] text-[#5c6b7f] font-black tracking-widest uppercase">PALETTES</div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {palettes.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePaletteId(p.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-all ${
                  activePaletteId === p.id 
                    ? 'bg-[#14171c] border border-[#ffb800] text-[#ffb800] font-bold shadow-[0_0_8px_rgba(255,184,0,0.15)]' 
                    : 'bg-[#080a0c] border border-[#1f242d] text-[#8fa0b5] hover:border-[#38bdf8]/50 hover:text-white'
                }`}
              >
                <span className="truncate text-[11px]">{p.name}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-[#101317] border border-[#1f242d] text-[#5c6b7f]">
                  {p.swatches.length}c
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1f242d]">
            <button 
              onClick={() => {
                const name = prompt("Enter new palette name:");
                if (name) {
                  const id = name.toLowerCase().replace(/\s+/g, '-');
                  setPalettes(prev => [...prev, { id, name, swatches: [] }]);
                  setActivePaletteId(id);
                }
              }}
              className="w-full py-1.5 bg-[#14171c] text-[#8fa0b5] hover:text-[#ffb800] border border-[#1f242d] rounded font-bold transition-all text-center text-[10px]"
            >
              + NEW PALETTE
            </button>
            <button 
              onClick={() => setShowDumpModal(true)}
              className="w-full py-1.5 bg-[#101317] text-[#38bdf8] hover:bg-[#38bdf8]/10 border border-[#38bdf8]/40 rounded font-bold transition-all flex items-center justify-center gap-1.5 text-[10px]"
            >
              <Upload className="w-3 h-3" />
              <span>BULK JSON DUMP</span>
            </button>
          </div>
        </div>

        {/* RIGHT AREA: HIGH DENSITY SWATCH CARDS WITH PROMINENT COLOR SQUARES */}
        <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-3 min-h-0 overflow-hidden">
          
          {/* HIGH-DENSITY 6-COLUMN GRID */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-6 gap-2.5 content-start custom-scrollbar">
            {activePalette.swatches.map((swatch, idx) => (
              <div 
                key={idx}
                onClick={() => handleCopy(swatch.hex)}
                className="bg-[#080a0c] border border-[#1f242d] hover:border-[#ffb800] rounded p-2 flex flex-col gap-2 cursor-pointer transition-all group hover:shadow-[0_0_12px_rgba(255,184,0,0.2)] select-none"
              >
                {/* PROMINENT DEDICATED COLOR SQUARE WITH SPECULAR METALLIC SHEEN */}
                <div 
                  className="w-full aspect-[4/3] rounded border border-white/10 relative overflow-hidden shadow-inner flex items-center justify-center"
                  style={{ background: swatch.metallic || swatch.hex }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/20 pointer-events-none" />
                  
                  {/* HOVER COPY OVERLAY */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[#ffb800] font-black text-[10px] gap-1">
                    {copiedHex === swatch.hex ? (
                      <>
                        <Check className="w-3 h-3 text-[#10b981]" />
                        <span className="text-[#10b981]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </div>
                </div>

                {/* COMPACT DATA DETAILS */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f1f5f9] truncate text-[10px]">{swatch.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSwatch(idx); }}
                      className="text-[#5c6b7f] hover:text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#ffb800] font-bold">{swatch.hex}</span>
                  <span className="text-[8.5px] text-[#5c6b7f] truncate">{swatch.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DOCK QUICK ADD */}
          <form onSubmit={handleAddSwatch} className="pt-2.5 mt-2 border-t border-[#1f242d] flex items-center gap-2 flex-shrink-0">
            <input 
              type="color" 
              value={newHex} 
              onChange={(e) => setNewHex(e.target.value)}
              className="w-7 h-7 rounded bg-transparent border border-[#1f242d] cursor-pointer"
            />
            <input 
              type="text" 
              placeholder="Swatch Name..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-[#080a0c] border border-[#1f242d] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:border-[#ffb800] focus:outline-none"
            />
            <input 
              type="text" 
              placeholder="Token (e.g. --metal-brass)..." 
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="w-40 bg-[#080a0c] border border-[#1f242d] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:border-[#ffb800] focus:outline-none"
            />
            <input 
              type="text" 
              placeholder="Role..." 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-36 bg-[#080a0c] border border-[#1f242d] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:border-[#ffb800] focus:outline-none"
            />
            <button 
              type="submit" 
              className="px-3 py-1 bg-[#14171c] text-[#ffb800] hover:bg-[#ffb800] hover:text-black border border-[#ffb800] font-bold rounded text-xs transition-all"
            >
              + ADD
            </button>
          </form>

        </div>

      </div>

      {/* BULK DUMP MODAL */}
      {showDumpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0f12] border-2 border-[#ffb800] rounded p-4 w-[600px] shadow-[0_0_30px_rgba(255,184,0,0.3)] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#1f242d] pb-2">
              <span className="text-[#ffb800] font-black text-xs tracking-wider">BULK JSON INGESTION</span>
              <span className="text-[10px] text-[#5c6b7f]">TARGET: {activePalette.name}</span>
            </div>

            <textarea 
              rows={12}
              value={rawDumpText}
              onChange={(e) => setRawDumpText(e.target.value)}
              placeholder="Paste JSON array here..."
              className="w-full bg-[#080a0c] border border-[#1f242d] rounded p-2.5 text-xs text-[#38bdf8] font-mono focus:border-[#ffb800] focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f242d]">
              <button 
                onClick={() => { setShowDumpModal(false); setRawDumpText(''); }}
                className="px-3 py-1 bg-[#14171c] text-[#8fa0b5] hover:text-white rounded border border-[#1f242d] text-xs"
              >
                CANCEL
              </button>
              <button 
                onClick={handleDumpImport}
                className="px-4 py-1 bg-[#ffb800] text-black font-black rounded hover:bg-[#e6a600] text-xs transition-colors"
              >
                APPLY & INGEST
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
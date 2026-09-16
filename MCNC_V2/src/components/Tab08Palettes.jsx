import React, { useState } from 'react';
import { Copy, Edit3, Trash2, Plus, Download, Upload, Check, Layers, Sparkles, X } from 'lucide-react';
import './Tab08Palettes.css';

const INITIAL_PALETTES = [
  {
    id: 'high-finance',
    name: 'High Finance Master',
    description: 'Core terminal palette: Obsidian, Jet-Black, Onyx, Gold Core, Emerald, Ruby',
    colors: [
      { name: 'Obsidian Black', hex: '#0a0a0c', role: 'Main Background' },
      { name: 'Metal Onyx', hex: '#16191f', role: 'Card Surfaces' },
      { name: 'Gold Core', hex: '#FFB800', role: 'Active Accents & Headers' },
      { name: 'Goldenrod Sand', hex: '#EEDD82', role: 'Body Typography' },
      { name: 'Emerald Core', hex: '#00FF66', role: 'Live State / Success' },
      { name: 'Ruby Core', hex: '#FF3344', role: 'Standby / Error' },
      { name: 'Wire Border', hex: 'rgba(255, 184, 0, 0.15)', role: 'Dividers' }
    ],
    assets: [
      { id: 'hf-mesh', name: 'Micro-Grid Mesh', type: 'CSS Overlay', token: 'radial-gradient(rgba(255,184,0,0.05) 1px, transparent 0)', desc: 'Telemetry background texture' }
    ]
  },
  {
    id: 'african-weaves',
    name: 'African Weaves & Earth',
    description: 'Kente, Kasai, Mudcloth geometric motifs & Zambezi earth mineral tones',
    colors: [
      { name: 'Kalahari Sand', hex: '#C29B38', role: 'Primary Ochre' },
      { name: 'Zambezi River Bed', hex: '#1F2421', role: 'Deep Sediment Black' },
      { name: 'Kasai Terracotta', hex: '#B85D19', role: 'Earth Ceramic Accent' },
      { name: 'Domwe Granitic', hex: '#5A6365', role: 'Island Granite Core' },
      { name: 'Mumbo Cyan Water', hex: '#2A9D8F', role: 'Lake Malawi Mineral' },
      { name: 'Raw Acacia Charcoal', hex: '#14120E', role: 'Dense Charcoal Border' }
    ],
    assets: [
      { id: 'weave-chevron', name: 'Kasai Geometric Chevron', type: 'Weave Pattern', token: 'repeating-linear-gradient(45deg, #1f2421, #1f2421 10px, #b85d19 10px, #b85d19 20px)', desc: 'Linear chevron rhythmic lattice' },
      { id: 'weave-basket', name: 'Zambezi Reed Lattice', type: 'Weave Pattern', token: 'repeating-linear-gradient(0deg, #14120e 0, #14120e 4px, #c29b38 4px, #c29b38 8px)', desc: 'Woven river reed crosshatch' },
      { id: 'mudcloth-dash', name: 'Bamako Mudcloth Glyph', type: 'Motif Stamp', token: 'data-glyph="mudcloth-v1"', desc: 'Geometric tribal dash motif' }
    ]
  }
];

export default function Tab08Palettes({ ws }) {
  const [palettes, setPalettes] = useState(INITIAL_PALETTES);
  const [activePaletteId, setActivePaletteId] = useState('high-finance');
  
  // Creation & Editing states
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFB800');
  const [newColorRole, setNewColorRole] = useState('UI Token');
  
  // Modals & Overlays
  const [editingSwatch, setEditingSwatch] = useState(null); // { index, name, hex, role }
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkDumpText, setBulkDumpText] = useState('');
  const [copiedStatus, setCopiedStatus] = useState('');

  const activePalette = palettes.find(p => p.id === activePaletteId) || palettes[0];

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(`COPIED: ${label}`);
    setTimeout(() => setCopiedStatus(''), 2000);
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const updated = palettes.map(pal => {
      if (pal.id === activePaletteId) {
        return {
          ...pal,
          colors: [...pal.colors, { name: newColorName.trim(), hex: newColorHex.trim(), role: newColorRole.trim() || 'Custom Token' }]
        };
      }
      return pal;
    });
    setPalettes(updated);
    setNewColorName('');
    setNewColorRole('UI Token');
  };

  const handleDeleteSwatch = (index) => {
    const updated = palettes.map(pal => {
      if (pal.id === activePaletteId) {
        const filteredColors = pal.colors.filter((_, i) => i !== index);
        return { ...pal, colors: filteredColors };
      }
      return pal;
    });
    setPalettes(updated);
  };

  const handleSaveEditedSwatch = () => {
    if (!editingSwatch || !editingSwatch.name.trim()) return;
    const { index, name, hex, role } = editingSwatch;
    const updated = palettes.map(pal => {
      if (pal.id === activePaletteId) {
        const newColors = [...pal.colors];
        newColors[index] = { name: name.trim(), hex: hex.trim(), role: role.trim() };
        return { ...pal, colors: newColors };
      }
      return pal;
    });
    setPalettes(updated);
    setEditingSwatch(null);
  };

  // Bulk Dump Parser: Supports "Name: #HEX (Role)" or just hex lists
  const handleBulkImport = () => {
    if (!bulkDumpText.trim()) return;
    const lines = bulkDumpText.split('\n');
    const parsedColors = [];

    lines.forEach(line => {
      const hexMatch = line.match(/#([A-Fa-f0-9]{3,8})/);
      if (hexMatch) {
        const hex = hexMatch[0];
        let remainder = line.replace(hex, '').replace(/[:,\(\)]/g, ' ').trim();
        let name = remainder ? remainder.split(/\s+/)[0] + (remainder.split(/\s+/)[1] ? ' ' + remainder.split(/\s+/)[1] : '') : `Token ${parsedColors.length + 1}`;
        let role = remainder.replace(name, '').trim() || 'Imported Asset';
        parsedColors.push({ name: name.toUpperCase(), hex, role });
      }
    });

    if (parsedColors.length === 0) {
      alert('No valid HEX codes found in dump. Ensure format includes #HEX values.');
      return;
    }

    const updated = palettes.map(pal => {
      if (pal.id === activePaletteId) {
        return { ...pal, colors: [...pal.colors, ...parsedColors] };
      }
      return pal;
    });

    setPalettes(updated);
    setBulkDumpText('');
    setIsBulkModalOpen(false);
    setCopiedStatus(`IMPORTED ${parsedColors.length} SWATCHES`);
    setTimeout(() => setCopiedStatus(''), 3000);
  };

  // Export Palette to JSON
  const exportPaletteJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePalette, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activePalette.id}_palette.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="view-section tab-08-container" style={{ position: 'relative' }}>
      
      {/* HEADER */}
      <div className="palettes-header">
        <div className="palettes-title-group">
          <h2>08 PALETTES // ASSET &amp; DESIGN SYSTEM CORE</h2>
          <p>Dynamic token management, bulk ingestion &bull; 1-click clipboard injection</p>
        </div>

        <div className="palettes-stats-strip">
          {copiedStatus && (
            <span style={{ color: '#00FF66', fontWeight: 'bold', fontFamily: 'monospace' }}>{copiedStatus}</span>
          )}
          <button 
            onClick={exportPaletteJSON}
            style={{ background: '#14171c', border: '1px solid #232832', color: '#ffb800', padding: '4px 10px', borderRadius: '3px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Export active palette as JSON"
          >
            <Download className="w-3 h-3" /> EXPORT JSON
          </button>
          <span style={{ color: 'var(--text-mist)' }}>PALETTES: {palettes.length}</span>
        </div>
      </div>

      <div className="palettes-workspace">
        {/* SIDEBAR */}
        <aside className="palettes-sidebar">
          <span style={{ fontSize: '0.75rem', color: 'var(--gold-core)', fontFamily: 'monospace' }}>ACTIVE PALETTES</span>
          
          <div className="palette-nav-list">
            {palettes.map(pal => (
              <button
                key={pal.id}
                className={`palette-select-btn ${activePalette.id === pal.id ? 'active' : ''}`}
                onClick={() => setActivePaletteId(pal.id)}
              >
                <span>{pal.name}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{pal.colors.length}c</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#1f242d]">
            <button 
              className="btn-new-palette"
              onClick={() => {
                const name = prompt('Enter new Palette Name:');
                if (!name) return;
                const id = name.toLowerCase().replace(/\s+/g, '-');
                setPalettes([...palettes, { id, name, description: 'Custom User Palette', colors: [], assets: [] }]);
                setActivePaletteId(id);
              }}
            >
              + CREATE NEW PALETTE
            </button>
            <button 
              className="btn-new-palette"
              style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              onClick={() => setIsBulkModalOpen(true)}
            >
              <Upload className="w-3 h-3 inline mr-1" /> BULK DATA DUMP
            </button>
          </div>
        </aside>

        {/* MAIN DECK */}
        <main className="palettes-main-deck">
          <div className="deck-section">
            <div className="deck-section-title">
              <span>COLOR SWATCHES // {activePalette.name.toUpperCase()}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>HOVER TO EDIT / DELETE &bull; CLICK TO COPY HEX</span>
            </div>

            <div className="swatch-grid">
              {activePalette.colors.map((color, idx) => (
                <div 
                  key={idx} 
                  className="swatch-card group relative" 
                  title="Click to copy HEX code"
                >
                  {/* Hover Control Overlay */}
                  <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-[#0d0f12]/90 border border-[#232832] p-1 rounded z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(color.hex, color.name); }}
                      className="p-1 text-[#ffb800] hover:bg-[#ffb800]/20 rounded cursor-pointer"
                      title="Copy HEX"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingSwatch({ index: idx, ...color }); }}
                      className="p-1 text-[#38bdf8] hover:bg-[#38bdf8]/20 rounded cursor-pointer"
                      title="Edit Swatch"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSwatch(idx); }}
                      className="p-1 text-[#ef4444] hover:bg-[#ef4444]/20 rounded cursor-pointer"
                      title="Delete Swatch"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div 
                    className="swatch-color-box cursor-pointer" 
                    style={{ background: color.hex }}
                    onClick={() => copyToClipboard(color.hex, color.name)}
                  ></div>
                  <div className="swatch-info cursor-pointer" onClick={() => copyToClipboard(color.hex, color.name)}>
                    <span className="swatch-name">{color.name}</span>
                    <span className="swatch-hex">{color.hex}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold-core)' }}>{color.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD SWATCH BAR */}
            <div className="add-color-bar flex gap-2 items-center mt-3 bg-[#0d0f12] p-2 border border-[#1f242d] rounded">
              <input 
                type="color" 
                value={newColorHex} 
                onChange={(e) => setNewColorHex(e.target.value)} 
                className="w-8 h-8 bg-transparent cursor-pointer border-none"
              />
              <input 
                type="text" 
                placeholder="Swatch Name (e.g. Copper Sun)..." 
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 bg-[#101317] text-[#e2e8f0] border border-[#1f242d] px-3 py-1.5 rounded text-xs outline-none focus:border-[#ffb800]"
              />
              <input 
                type="text" 
                placeholder="Role / Use Case..." 
                value={newColorRole}
                onChange={(e) => setNewColorRole(e.target.value)}
                className="w-44 bg-[#101317] text-[#e2e8f0] border border-[#1f242d] px-3 py-1.5 rounded text-xs outline-none focus:border-[#ffb800]"
              />
              <button className="btn-add-token bg-[#ffb800] text-black font-bold px-4 py-1.5 rounded text-xs hover:bg-[#e6a600] cursor-pointer flex items-center gap-1" onClick={handleAddColor}>
                <Plus className="w-3.5 h-3.5" /> ADD SWATCH
              </button>
            </div>
          </div>

          {/* ASSETS SECTION */}
          <div className="deck-section mt-4">
            <div className="deck-section-title">
              <span>TEXTURES, WEAVES &amp; DESIGN ASSETS</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>CLICK TO COPY TOKEN</span>
            </div>

            {activePalette.assets.length === 0 ? (
              <div style={{ color: 'var(--text-mist)', fontSize: '0.8rem', fontStyle: 'italic', padding: '10px' }}>
                // No textures or weaves loaded in this palette yet.
              </div>
            ) : (
              <div className="asset-grid">
                {activePalette.assets.map(asset => (
                  <div key={asset.id} className="asset-card">
                    <div 
                      className="asset-preview-weave" 
                      style={{ background: asset.token.startsWith('repeating') || asset.token.startsWith('radial') ? asset.token : '#16191f' }}
                    ></div>
                    <div className="asset-title">{asset.name}</div>
                    <div className="asset-desc">{asset.desc}</div>
                    <button 
                      className="btn-copy-token"
                      onClick={() => copyToClipboard(asset.token, asset.name)}
                    >
                      COPY CSS TOKEN
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* EDIT SWATCH MODAL */}
      {editingSwatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-5 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-[#1f242d] pb-2">
              <span className="text-[#ffb800] font-bold text-sm">EDIT SWATCH</span>
              <button onClick={() => setEditingSwatch(null)} className="text-[#5c6b7f] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#5c6b7f] uppercase font-bold block mb-1">Swatch Name</label>
                <input 
                  type="text" 
                  value={editingSwatch.name} 
                  onChange={(e) => setEditingSwatch({ ...editingSwatch, name: e.target.value })}
                  className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] p-2 rounded outline-none focus:border-[#ffb800]"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[#5c6b7f] uppercase font-bold block mb-1">HEX Code</label>
                  <input 
                    type="text" 
                    value={editingSwatch.hex} 
                    onChange={(e) => setEditingSwatch({ ...editingSwatch, hex: e.target.value })}
                    className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] p-2 rounded outline-none focus:border-[#ffb800]"
                  />
                </div>
                <div>
                  <label className="text-[#5c6b7f] uppercase font-bold block mb-1">Color Preview</label>
                  <div className="w-10 h-8 rounded border border-[#232832]" style={{ background: editingSwatch.hex }}></div>
                </div>
              </div>
              <div>
                <label className="text-[#5c6b7f] uppercase font-bold block mb-1">Role / Use Case</label>
                <input 
                  type="text" 
                  value={editingSwatch.role} 
                  onChange={(e) => setEditingSwatch({ ...editingSwatch, role: e.target.value })}
                  className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] p-2 rounded outline-none focus:border-[#ffb800]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f242d]">
              <button onClick={() => setEditingSwatch(null)} className="px-4 py-1.5 bg-[#14171c] text-[#5c6b7f] rounded hover:text-white cursor-pointer">CANCEL</button>
              <button onClick={handleSaveEditedSwatch} className="px-4 py-1.5 bg-[#ffb800] text-black font-bold rounded hover:bg-[#e6a600] cursor-pointer">SAVE CHANGES</button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT DATA DUMP MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-5 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-[#1f242d] pb-2">
              <span className="text-[#38bdf8] font-bold text-sm">BULK DATA DUMP // SWATCH INGESTION</span>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-[#5c6b7f] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] text-[#8fa0b5] leading-relaxed">
              Paste your raw color declarations, Tailwind configs, CSS variables, or lists containing HEX codes below. The parser will automatically extract and map them into <b className="text-[#ffb800]">{activePalette.name}</b>.
            </p>

            <textarea 
              rows={8}
              placeholder={`--primary-gold: #FFB800;\n--surface-onyx: #16191f;\n#00FF66 Success Green\n#FF3344 Error Red`}
              value={bulkDumpText}
              onChange={(e) => setBulkDumpText(e.target.value)}
              className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] p-3 rounded text-xs outline-none focus:border-[#38bdf8] font-mono resize-none custom-scrollbar"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1f242d]">
              <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-1.5 bg-[#14171c] text-[#5c6b7f] rounded hover:text-white cursor-pointer">CANCEL</button>
              <button onClick={handleBulkImport} className="px-4 py-1.5 bg-[#38bdf8] text-black font-bold rounded hover:bg-[#0ea5e9] cursor-pointer">PARSE &amp; INGEST</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
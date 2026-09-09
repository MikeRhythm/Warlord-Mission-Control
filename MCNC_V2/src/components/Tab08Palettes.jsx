import React, { useState } from 'react';
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
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFB800');
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
          colors: [...pal.colors, { name: newColorName, hex: newColorHex, role: 'User Token' }]
        };
      }
      return pal;
    });
    setPalettes(updated);
    setNewColorName('');
  };

  return (
    <div className="view-section tab-08-container">
      <div className="palettes-header">
        <div className="palettes-title-group">
          <h2>08 PALETTES // ASSET &amp; DESIGN SYSTEM CORE</h2>
          <p>Dynamic token management, African weaves &bull; 1-click clipboard injection</p>
        </div>

        <div className="palettes-stats-strip">
          {copiedStatus && (
            <span style={{ color: '#00FF66', fontWeight: 'bold' }}>{copiedStatus}</span>
          )}
          <span style={{ color: 'var(--text-mist)' }}>PALETTES: {palettes.length}</span>
        </div>
      </div>

      <div className="palettes-workspace">
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
        </aside>

        <main className="palettes-main-deck">
          <div className="deck-section">
            <div className="deck-section-title">
              <span>COLOR SWATCHES // {activePalette.name.toUpperCase()}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>CLICK TO COPY HEX</span>
            </div>

            <div className="swatch-grid">
              {activePalette.colors.map((color, idx) => (
                <div 
                  key={idx} 
                  className="swatch-card" 
                  onClick={() => copyToClipboard(color.hex, color.name)}
                  title="Click to copy color code"
                >
                  <div className="swatch-color-box" style={{ background: color.hex }}></div>
                  <div className="swatch-info">
                    <span className="swatch-name">{color.name}</span>
                    <span className="swatch-hex">{color.hex}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold-core)' }}>{color.role}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-color-bar">
              <input 
                type="color" 
                value={newColorHex} 
                onChange={(e) => setNewColorHex(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Swatch Name (e.g. Copper Sun, Slate Grey)..." 
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
              />
              <button className="btn-add-token" onClick={handleAddColor}>ADD SWATCH</button>
            </div>
          </div>

          <div className="deck-section">
            <div className="deck-section-title">
              <span>TEXTURES, WEAVES &amp; DESIGN ASSETS</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-mist)' }}>CLICK TO COPY TOKEN</span>
            </div>

            {activePalette.assets.length === 0 ? (
              <div style={{ color: 'var(--text-mist)', fontSize: '0.8rem', fontStyle: 'italic', padding: '10px' }}>
                No textures or weaves loaded in this palette yet.
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
    </div>
  );
}
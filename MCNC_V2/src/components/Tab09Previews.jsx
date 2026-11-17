import React, { useState, useEffect, useRef } from 'react';

// Default system presets
const DEFAULT_PALETTES = [
  {
    id: 'HIGH_FINANCE',
    name: '⚡ HIGH FINANCE',
    bg: '#080a0c',
    border: '#ffb800',
    color: '#ffb800',
    directive: `[COLOR PALETTE: HIGH FINANCE OBSIDIAN]
- Background: Obsidian Core (#080a0c) with subtle wire grid (rgba(255,255,255,0.02)).
- Primary Accent: Gold Core (#ffb800) and Gold Secondary (#d49a00).
- Borders: Wire Gold (rgba(255, 184, 0, 0.2)) with 1px precision.
- Typography: Restrained scale. Max H1 size: 2.5rem (Cinzel or Space Grotesk). Body: Inter 0.9rem. Data/Metrics: JetBrains Mono.`
  },
  {
    id: 'AFRICA_LUXURY',
    name: '🌍 AFRICA LUXURY',
    bg: '#1A0F0A',
    border: '#C7923E',
    color: '#C7923E',
    directive: `[COLOR PALETTE: AUTHENTIC AFRICA LUXURY]
- Background: Madothi Charcoal (#1A0F0A) & Madothi Espresso (#2B1A11).
- Accents: African Ochre (#C7923E) and Malawi Sunset (#E35503).
- Typography: Warm, refined serif (Cinzel) paired with clean sans (Inter). No oversized clumsy text.`
  },
  {
    id: 'BIOLAB_DARK',
    name: '🔬 BIOLAB DARK',
    bg: '#07090e',
    border: '#10b981',
    color: '#10b981',
    directive: `[COLOR PALETTE: CLINICAL BIOLAB DARK]
- Background: Darkroom Navy (#07090e).
- Accents: Bio-Emerald (#10b981) and Cyan HPLC (#38bdf8).
- Typography: Clean technical sans (Space Grotesk) with tight JetBrains Mono data labels.`
  },
  {
    id: 'TACTICAL_MONO',
    name: '🎯 TACTICAL MONO',
    bg: '#0f172a',
    border: '#1e90ff',
    color: '#1e90ff',
    directive: `[COLOR PALETTE: TACTICAL STEALTH MONO]
- Background: Slate Charcoal (#0f172a).
- Accents: Electric DodgerBlue (#1e90ff) and Cool Silver (#94a3b8).
- Typography: Ultra-clean technical HUD layout with monospace numerical displays.`
  }
];

const GRAPHIC_PRESETS = [
  {
    id: 'ANTI_GRAVITY_KINETIC',
    name: '🚀 ANTI-GRAVITY / 3D CANVAS',
    color: '#38bdf8',
    directive: `[GRAPHICS STANDARD: ANTI-GRAVITY & KINETIC DEPTH]
- Physics-based mouse-tilt 3D perspective on all primary cards (transform: perspective(1000px) rotateX/rotateY on hover).
- Floating zero-g visual elements using subtle CSS keyframe levitation animations (@keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(1deg); } }).
- Embed an interactive background canvas: subtle glowing particle mesh constellation or ambient animated noise shader that tracks mouse movement.
- Backdrop-filter: blur(16px) with semi-transparent frosted glass layers, luminous subtle border sweeps (1px solid rgba(255,255,255,0.12)), and radial glow spotlights behind key metrics.
- Multi-layered visual depth: Background canvas -> middle blurred glass cards -> foreground floating badges with crisp drop-shadows.`
  },
  {
    id: 'HIGH_FINANCE_OBSIDIAN',
    name: '⚡ HIGH-FINANCE / GOLD CORE',
    color: '#ffb800',
    directive: `[GRAPHICS STANDARD: HIGH FINANCE & OBSIDIAN CORE]
- Deep obsidian background (#080a0c) paired with electric Gold Core (#ffb800) and Wire Border (#1f242d).
- Kinetic pulsing border glow accents (box-shadow: 0 0 25px rgba(255,184,0,0.15)).
- Bento-grid layout with varied card spans, mono-spaced live telemetry tickers, and animated SVG sparkline charts.
- Dark mode glassmorphism with high-contrast emerald (+profit) and ruby (-drawdown) badges.`
  },
  {
    id: 'AUTHENTIC_AFRICA_LUXURY',
    name: '🌍 AUTHENTIC AFRICA / TIMBER',
    color: '#E35503',
    directive: `[GRAPHICS STANDARD: AUTHENTIC AFRICA & TIMBER MATRIX]
- Palette: Madothi Charcoal (#1A0F0A), Madothi Espresso (#2B1A11), African Ochre (#C7923E), Malawi Sunset (#E35503), Canopy Forest (#2B4422), Linen Canvas (#F5F0EA).
- 10-Tier Wood & Timber Matrix: Rich dark grain borders, warm golden-brown ambient glows.
- Authentic African geometric border patterns and warm sunset gradients instead of sterile white tech boxes.
- Direct humanitarian focus: School fees and nutrition impact visual meters.`
  },
  {
    id: 'BIOLAB_CYBER_GLASS',
    name: '🔬 BIOLAB / HPLC NEON',
    color: '#10b981',
    directive: `[GRAPHICS STANDARD: CLINICAL BIOLAB & CYBER GLASS]
- Clinical darkroom aesthetics: Obsidian (#090b0e), Bio-Emerald (#10b981), Cyan HPLC traces (#06b6d4).
- Floating molecular lattice or SVG HPLC chromatogram waves running on HTML5 canvas.
- Interactive CoA (Certificate of Analysis) purity verification seal with metallic holographic gradient sheen.
- Micro-interactions on buttons with active neon scanlines and chemical structure watermark textures.`
  }
];

export default function Tab09Previews() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [allArtifacts, setAllArtifacts] = useState([]);
  const [projectArtifacts, setProjectArtifacts] = useState([]);
  const [selectedArtifactPath, setSelectedArtifactPath] = useState('');
  const [viewport, setViewport] = useState('1920');
  const [viewMode, setViewMode] = useState('RENDER');
  const [rawHtmlCode, setRawHtmlCode] = useState('');
  const [isRedLineOpen, setIsRedLineOpen] = useState(false);
  const [critiqueText, setCritiqueText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  // Dynamic Palettes State
  const [palettes, setPalettes] = useState([]);
  const [isAddingPalette, setIsAddingPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newPaletteBg, setNewPaletteBg] = useState('#0d0f14');
  const [newPaletteAccent, setNewPaletteAccent] = useState('#38bdf8');
  const [newPaletteDirectives, setNewPaletteDirectives] = useState('');

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load and synchronize dynamic palettes from localStorage
  const loadPalettes = () => {
    try {
      const stored = localStorage.getItem('MCNC_PALETTES');
      if (stored) {
        setPalettes(JSON.parse(stored));
      } else {
        localStorage.setItem('MCNC_PALETTES', JSON.stringify(DEFAULT_PALETTES));
        setPalettes(DEFAULT_PALETTES);
      }
    } catch (e) {
      setPalettes(DEFAULT_PALETTES);
    }
  };

  useEffect(() => {
    loadPalettes();
    const handleStorageChange = (e) => {
      if (!e.key || e.key === 'MCNC_PALETTES') loadPalettes();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mcnc-palettes-updated', loadPalettes);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mcnc-palettes-updated', loadPalettes);
    };
  }, []);

  const handleCreatePalette = () => {
    if (!newPaletteName.trim()) return;

    const id = newPaletteName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const autoDirective = newPaletteDirectives.trim() || `[COLOR PALETTE: ${newPaletteName.toUpperCase()}]
- Background: ${newPaletteBg}
- Primary Accent: ${newPaletteAccent}
- Borders: 1px solid ${newPaletteAccent} (semi-transparent)
- Typography: Clean restrained scale, high-contrast readable elements.`;

    const newPal = {
      id,
      name: newPaletteName.trim(),
      bg: newPaletteBg,
      border: newPaletteAccent,
      color: newPaletteAccent,
      directive: autoDirective
    };

    const updated = [...palettes.filter(p => p.id !== id), newPal];
    setPalettes(updated);
    localStorage.setItem('MCNC_PALETTES', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mcnc-palettes-updated'));

    // Select the new palette immediately
    setCritiqueText(prev => prev ? `${prev}\n\n${autoDirective}` : autoDirective);
    setNewPaletteName('');
    setNewPaletteDirectives('');
    setIsAddingPalette(false);
  };

  const syncConduitWithTarget = async (targetProj) => {
    setSyncStatus('SYNCING...');
    try {
      const res = await fetch('http://localhost:8082/api/previews/list');
      if (!res.ok) throw new Error('Pipeline offline');
      const data = await res.json();

      const discoveredProjects = data.projects || [];
      const discoveredArtifacts = data.artifacts || [];

      setProjects(discoveredProjects);
      setAllArtifacts(discoveredArtifacts);

      const activeProject = targetProj || selectedProject || discoveredProjects[0] || '';
      setSelectedProject(activeProject);

      const filtered = discoveredArtifacts.filter(a => a.project.toLowerCase() === activeProject.toLowerCase());
      setProjectArtifacts(filtered);

      if (filtered.length > 0) {
        const primaryArtifact = filtered[0];
        setSelectedArtifactPath(primaryArtifact.path);
        const resolvedUrl = `http://localhost:8082/api/previews/content?path=${encodeURIComponent(primaryArtifact.path)}&t=${Date.now()}`;
        setPreviewUrl(resolvedUrl);

        try {
          const codeRes = await fetch(resolvedUrl);
          if (codeRes.ok) {
            const codeText = await codeRes.text();
            setRawHtmlCode(codeText);
          }
        } catch (err) {}
      } else {
        setSelectedArtifactPath('');
        setPreviewUrl('');
        setRawHtmlCode('');
      }

      setSyncStatus('SYNCED');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      console.error('[TAB 09 SYNC ERROR]', e);
      setSyncStatus('OFFLINE');
      setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  useEffect(() => {
    syncConduitWithTarget();
  }, []);

  const handleProjectSelect = (e) => {
    const nextProject = e.target.value;
    setSelectedProject(nextProject);
    syncConduitWithTarget(nextProject);
  };

  const handleArtifactSelect = async (art) => {
    setSelectedArtifactPath(art.path);
    const resolvedUrl = `http://localhost:8082/api/previews/content?path=${encodeURIComponent(art.path)}&t=${Date.now()}`;
    setPreviewUrl(resolvedUrl);

    try {
      const codeRes = await fetch(resolvedUrl);
      if (codeRes.ok) {
        const codeText = await codeRes.text();
        setRawHtmlCode(codeText);
      }
    } catch (err) {}
  };

  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalChunk += event.results[i][0].transcript;
        }
        if (finalChunk.trim()) {
          setCritiqueText(prev => {
            const clean = prev ? prev.trim() : '';
            return clean ? `${clean} ${finalChunk.trim()}` : finalChunk.trim();
          });
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleInjectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCritiqueText(prev => {
      const clean = prev ? prev.trim() : '';
      if (clean.includes(preset.directive.slice(0, 30))) return clean;
      return clean ? `${clean}\n\n${preset.directive}` : preset.directive;
    });
  };

  const copyCritiqueToClipboard = () => {
    if (!critiqueText) return;
    navigator.clipboard.writeText(critiqueText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleClearScreen = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setCritiqueText('');
    setAttachedFiles([]);
    setSelectedPresetId('');
    setCopySuccess(false);
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles(prev => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            dataUrl: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachedFile = (idx) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDispatchCritique = async () => {
    if (!critiqueText.trim() && attachedFiles.length === 0) return;

    const targetArtifact = selectedArtifactPath 
      ? selectedArtifactPath.split(/[\/\\]/).pop() 
      : 'index.html';

    const newCritiqueItem = {
      target: targetArtifact,
      project: selectedProject,
      critique: critiqueText,
      attachments: attachedFiles,
      timestamp: new Date().toISOString()
    };

    try {
      const existingQueue = JSON.parse(localStorage.getItem('WAR_ROOM_CRITIQUES') || '[]');
      const updatedQueue = [newCritiqueItem, ...existingQueue];
      localStorage.setItem('WAR_ROOM_CRITIQUES', JSON.stringify(updatedQueue));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('[!] Failed to store critique telemetry:', err);
    }

    try {
      await fetch('http://localhost:8082/api/previews/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVISE',
          project: selectedProject,
          artifactId: selectedArtifactPath,
          artifactPath: selectedArtifactPath,
          critique: critiqueText,
          attachments: attachedFiles,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {}

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setCritiqueText('');
    setAttachedFiles([]);
    setIsRedLineOpen(false);

    alert(`[✓] Visual Red-Line Critique dispatched to Tab 02 War Room.`);
  };

  const handleAcceptStage = async () => {
    try {
      await fetch('http://localhost:8082/api/previews/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          project: selectedProject,
          artifactPath: selectedArtifactPath,
          timestamp: new Date().toISOString()
        })
      });
      alert(`Artifact [${selectedArtifactPath}] Approved and Staged.`);
    } catch (e) {}
  };

  const getViewportWidth = () => {
    if (viewport === '375') return '375px';
    if (viewport === '768') return '768px';
    return '100%';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0d0907',
      color: '#F5F0EA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace'
    }}>
      {/* TOP STATUS SUB-BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        backgroundColor: '#160f0c',
        borderBottom: '1px solid rgba(199, 146, 62, 0.25)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#DAA520', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            09 // ARTIFACT APPROVAL COCKPIT
          </span>
          <span style={{ color: '#6b7280' }}>|</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>PROJECT:</span>
          <select
            value={selectedProject}
            onChange={handleProjectSelect}
            style={{
              backgroundColor: '#221510',
              color: '#F5F0EA',
              border: '1px solid rgba(199, 146, 62, 0.4)',
              borderRadius: '3px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={() => syncConduitWithTarget(selectedProject)}
            style={{
              backgroundColor: '#221510',
              border: '1px solid #C7923E',
              color: '#C7923E',
              borderRadius: '3px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {syncStatus ? syncStatus : 'SYNC CONDUIT'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setViewport('1920')}
            style={{
              backgroundColor: viewport === '1920' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '1920' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '1920' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '1920' ? 'bold' : 'normal'
            }}
          >
            🖥️ DESKTOP 1920
          </button>
          <button
            onClick={() => setViewport('768')}
            style={{
              backgroundColor: viewport === '768' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '768' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '768' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '768' ? 'bold' : 'normal'
            }}
          >
            📱 TABLET 768
          </button>
          <button
            onClick={() => setViewport('375')}
            style={{
              backgroundColor: viewport === '375' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '375' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '375' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '375' ? 'bold' : 'normal'
            }}
          >
            📲 MOBILE 375
          </button>

          <span style={{ color: '#4b5563', margin: '0 0.25rem' }}>|</span>

          <button
            onClick={() => setViewMode('RENDER')}
            style={{
              backgroundColor: viewMode === 'RENDER' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'RENDER' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'RENDER' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            RENDER
          </button>
          <button
            onClick={() => setViewMode('SPLIT')}
            style={{
              backgroundColor: viewMode === 'SPLIT' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'SPLIT' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'SPLIT' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            SPLIT
          </button>
          <button
            onClick={() => setViewMode('CODE')}
            style={{
              backgroundColor: viewMode === 'CODE' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'CODE' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'CODE' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            CODE
          </button>
        </div>
      </div>

      {/* MAIN COCKPIT BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT RAIL */}
        <div style={{
          width: '240px',
          backgroundColor: '#120c09',
          borderRight: '1px solid rgba(199, 146, 62, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              STAGED ARTIFACTS ({projectArtifacts.length})
            </div>

            {projectArtifacts.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
                No artifacts staged for <span style={{ color: '#DAA520' }}>{selectedProject}</span>.
                <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>Build or place files in Data/Projects/{selectedProject}/Web_And_Social.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {projectArtifacts.map((art) => (
                  <button
                    key={art.id || art.path}
                    title={art.path}
                    onClick={() => handleArtifactSelect(art)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      backgroundColor: selectedArtifactPath === art.path ? 'rgba(218, 165, 32, 0.15)' : 'transparent',
                      border: `1px solid ${selectedArtifactPath === art.path ? '#DAA520' : 'transparent'}`,
                      color: selectedArtifactPath === art.path ? '#DAA520' : '#e5e7eb',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    📄 {art.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={handleAcceptStage}
              disabled={!selectedArtifactPath}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#22c55e',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: selectedArtifactPath ? 'pointer' : 'not-allowed',
                opacity: selectedArtifactPath ? 1 : 0.4,
                letterSpacing: '0.05em'
              }}
            >
              ACCEPT & STAGE
            </button>
            <button
              onClick={() => setIsRedLineOpen(true)}
              disabled={!selectedArtifactPath}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: selectedArtifactPath ? 'pointer' : 'not-allowed',
                opacity: selectedArtifactPath ? 1 : 0.4,
                letterSpacing: '0.05em'
              }}
            >
              RED-LINE / REVISE
            </button>
          </div>
        </div>

        {/* CENTER VIEWPORT */}
        <div style={{
          flex: 1,
          backgroundColor: '#0a0705',
          display: 'flex',
          overflow: 'hidden',
          padding: '1rem'
        }}>
          {previewUrl ? (
            <div style={{ display: 'flex', width: '100%', height: '100%', gap: '1rem' }}>
              {(viewMode === 'RENDER' || viewMode === 'SPLIT') && (
                <div style={{
                  flex: viewMode === 'SPLIT' ? 1 : 'unset',
                  width: viewMode === 'SPLIT' ? '50%' : getViewportWidth(),
                  margin: viewMode === 'SPLIT' ? '0' : '0 auto',
                  height: '100%',
                  backgroundColor: '#fff',
                  boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                  transition: 'width 0.25s ease',
                  borderRadius: viewport === '1920' ? '0px' : '8px',
                  overflow: 'hidden'
                }}>
                  <iframe
                    key={previewUrl}
                    title="Artifact Preview"
                    src={previewUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                </div>
              )}

              {(viewMode === 'CODE' || viewMode === 'SPLIT') && (
                <div style={{
                  flex: viewMode === 'SPLIT' ? 1 : 'unset',
                  width: viewMode === 'SPLIT' ? '50%' : '100%',
                  height: '100%',
                  backgroundColor: '#120d0b',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  padding: '1rem',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#93c5fd',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box'
                }}>
                  {rawHtmlCode || '// Loading source code...'}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#6b7280' }}>
              <div style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                [ NO ARTIFACT AVAILABLE FOR {selectedProject.toUpperCase()} ]
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                Run Artifact Build in Tab 02 War Room to generate this project's index.html.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RED-LINE CRITIQUE & DYNAMIC PALETTE MODAL */}
      {isRedLineOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '840px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#120d0b',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '1.25rem',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.35)',
            fontFamily: 'monospace',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                [ RED-LINE CRITIQUE // GRAPHIC &amp; PALETTE REVISION COCKPIT ]
              </span>
              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setIsRedLineOpen(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
              Target: <span style={{ color: '#F5F0EA' }}>{selectedArtifactPath || 'index.html'}</span> | Project: <span style={{ color: '#DAA520' }}>{selectedProject}</span>
            </div>

            {/* DYNAMIC PALETTE SELECTOR DOCK */}
            <div style={{
              backgroundColor: '#19110d',
              border: '1px solid rgba(199, 146, 62, 0.3)',
              borderRadius: '3px',
              padding: '0.6rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ffb800', letterSpacing: '0.05em' }}>
                  🎨 COLOR PALETTES &amp; DESIGN TOKENS ({palettes.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingPalette(!isAddingPalette)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ffb800',
                    color: '#ffb800',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '2px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isAddingPalette ? '✕ CANCEL' : '+ ADD PALETTE'}
                </button>
              </div>

              {/* INLINE PALETTE INTAKE */}
              {isAddingPalette && (
                <div style={{
                  backgroundColor: '#110906',
                  border: '1px dashed #ffb800',
                  padding: '0.6rem',
                  borderRadius: '3px',
                  marginBottom: '0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Palette Name (e.g. Cyber Tokyo, Royal Navy)"
                      value={newPaletteName}
                      onChange={(e) => setNewPaletteName(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: '#1b120d',
                        border: '1px solid #4b5563',
                        color: '#fff',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
                      <span>BG:</span>
                      <input
                        type="color"
                        value={newPaletteBg}
                        onChange={(e) => setNewPaletteBg(e.target.value)}
                        style={{ border: 'none', width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
                      <span>ACCENT:</span>
                      <input
                        type="color"
                        value={newPaletteAccent}
                        onChange={(e) => setNewPaletteAccent(e.target.value)}
                        style={{ border: 'none', width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional: Custom CSS / Font Directives (or leave empty for auto)"
                    value={newPaletteDirectives}
                    onChange={(e) => setNewPaletteDirectives(e.target.value)}
                    style={{
                      backgroundColor: '#1b120d',
                      border: '1px solid #4b5563',
                      color: '#fff',
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreatePalette}
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: '#ffb800',
                      color: '#000',
                      border: 'none',
                      padding: '0.3rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '2px'
                    }}
                  >
                    SAVE &amp; INJECT ⚡
                  </button>
                </div>
              )}

              {/* PALETTE BUTTONS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.4rem' }}>
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setCritiqueText(prev => prev ? `${prev}\n\n${p.directive}` : p.directive);
                    }}
                    style={{
                      padding: '0.4rem 0.5rem',
                      backgroundColor: p.bg || '#080a0c',
                      border: `1px solid ${p.border || p.color || '#ffb800'}`,
                      color: p.color || '#ffb800',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* GRAPHICS & ANTI-GRAVITY PRESET INJECTOR */}
            <div style={{
              backgroundColor: '#19110d',
              border: '1px solid rgba(199, 146, 62, 0.3)',
              borderRadius: '3px',
              padding: '0.6rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#DAA520', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                ⚡ INJECT GRAPHICS ENGINE PRESET (ANTI-GRAVITY / 3D CANVAS / SHADERS):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {GRAPHIC_PRESETS.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleInjectPreset(preset)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0d0806',
                        border: `1px solid ${isSelected ? preset.color : '#2e2019'}`,
                        color: preset.color,
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION TOOLBAR: VOICE, COPY, CLS, ATTACH */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleDictation}
                style={{
                  backgroundColor: isListening ? '#dc2626' : '#221510',
                  color: isListening ? '#ffffff' : '#DAA520',
                  border: `1px solid ${isListening ? '#ef4444' : '#DAA520'}`,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 'bold',
                  boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                }}
              >
                {isListening ? '🔴 LISTENING... (STOP)' : '🎙️ START DICTATION'}
              </button>

              <button
                type="button"
                onClick={copyCritiqueToClipboard}
                style={{
                  backgroundColor: '#221510',
                  color: '#9ca3af',
                  border: '1px solid #4b5563',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📋 COPY TEXT
              </button>

              <button
                type="button"
                onClick={handleClearScreen}
                style={{
                  backgroundColor: '#221510',
                  color: '#f87171',
                  border: '1px solid #7f1d1d',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🧹 CLS
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttach}
                multiple
                accept="image/*,.pdf,.txt,.md,.html"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  backgroundColor: '#221510',
                  color: '#C7923E',
                  border: '1px solid #C7923E',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📎 ATTACH BENCHMARKS
              </button>

              {copySuccess && (
                <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>

            {attachedFiles.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginBottom: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#1b120e',
                borderRadius: '3px',
                border: '1px dashed #C7923E'
              }}>
                {attachedFiles.map((f, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#2b1a11',
                      border: '1px solid #C7923E',
                      color: '#F5F0EA',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px'
                    }}
                  >
                    📄 {f.name} ({f.size})
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginLeft: '0.2rem'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <textarea
              rows={6}
              value={critiqueText}
              onChange={(e) => setCritiqueText(e.target.value)}
              placeholder="State precise visual critique, select a palette, or inject Anti-Gravity presets..."
              style={{
                width: '100%',
                minHeight: '120px',
                backgroundColor: '#0a0706',
                border: '1px solid #374151',
                borderRadius: '3px',
                color: '#e5e7eb',
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setIsRedLineOpen(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  color: '#9ca3af',
                  padding: '0.5rem 1rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDispatchCritique}
                style={{
                  backgroundColor: '#7f1d1d',
                  border: '1px solid #ef4444',
                  color: '#ffffff',
                  padding: '0.5rem 1.4rem',
                  borderRadius: '3px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.45)',
                  letterSpacing: '0.05em'
                }}
              >
                DISPATCH TO TAB 02 WAR ROOM ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
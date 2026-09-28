import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Tablet, Smartphone, Copy, Check, ExternalLink, Code, Eye, 
  RefreshCw, Layers, FileText, Globe, Sparkles, FolderOpen, Terminal
} from 'lucide-react';
import './Tab09Previews.css';

const DEFAULT_PROJECTS = [
  'DIGITAL ASSET MONETIZATION',
  'MAKING MONEY IDEAS',
  'WAR ROOM - DIRECTOR BOARD KAGGLE TEST',
  'MCNC REACT VITE',
  'RHYTHM WASP V8.5',
  'ZAMBEZI SAFARI'
];

// High-Finance Staged Seed Manifests
const SEED_ARTIFACTS = {
  'DIGITAL ASSET MONETIZATION': [
    {
      id: 'art-dam-1',
      title: 'High-Converting Monetization Landing Page',
      type: 'landing_page',
      director: 'ROXY // ARTWORK ALPHA',
      timestamp: '2026-09-28 14:20',
      description: 'Production-ready High Finance dark-mode landing page with hero CTA and feature matrix.',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Asset Monetization // Base 1</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; }
    body { background: #080a0c; color: #e2e8f0; padding: 40px 20px; text-align: center; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; border-radius: 9999px; background: rgba(255, 184, 0, 0.1); color: #ffb800; border: 1px solid rgba(255, 184, 0, 0.4); text-transform: uppercase; font-weight: bold; margin-bottom: 20px; }
    h1 { font-size: 2.5rem; font-weight: 800; color: #ffffff; margin-bottom: 16px; letter-spacing: -1px; }
    h1 span { color: #ffb800; }
    p { font-size: 1.1rem; color: #8fa0b5; max-width: 600px; margin: 0 auto 30px auto; line-height: 1.6; }
    .cta-btn { display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: bold; background: #ffb800; color: #080a0c; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; transition: 0.2s; box-shadow: 0 0 20px rgba(255, 184, 0, 0.3); }
    .cta-btn:hover { background: #e6a600; transform: translateY(-2px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; max-width: 900px; margin: 50px auto 0 auto; text-align: left; }
    .card { background: #0d0f12; border: 1px solid #1f242d; padding: 24px; border-radius: 8px; }
    .card h3 { color: #38bdf8; font-size: 1.1rem; margin-bottom: 10px; }
    .card p { font-size: 0.9rem; color: #8fa0b5; margin: 0; }
  </style>
</head>
<body>
  <div class="badge">Rhythm Protocol // Monetization Layer</div>
  <h1>Scalable Yield from <span>Digital Assets</span></h1>
  <p>Deconstruct, automate, and monetize intellectual property portfolios using high-throughput autonomous agent clusters.</p>
  <a href="#access" class="cta-btn">DEPLOY PROTOCOL</a>

  <div class="grid">
    <div class="card">
      <h3>01 // Autonomous Pipeline</h3>
      <p>Continuous AI-driven asset extraction and multi-director verification pipelines.</p>
    </div>
    <div class="card">
      <h3>02 // Algorithmic Execution</h3>
      <p>Precision execution triggers mapped directly to rhythm multiplier telemetry arrays.</p>
    </div>
    <div class="card">
      <h3>03 // Zero-State Isolation</h3>
      <p>Immature code containment preventing premature execution and NaN memory drift.</p>
    </div>
  </div>
</body>
</html>`
    },
    {
      id: 'art-dam-2',
      title: 'Strategic Market Pitch & Copy Manifest',
      type: 'copy',
      director: 'AMBER // COPYWRITER',
      timestamp: '2026-09-28 15:02',
      description: 'High-impact copy deck targeting quantitative and institutional partners.',
      code: `### CORE VALUE PROPOSITION: DIGITAL ASSET MONETIZATION

**Headline:** Turn Dormant IP Into Liquid Autonomous Capital.

**The Hook:** 
Traditional digital monetization is bleeding efficiency through fragmented operations, redundant SaaS subscriptions, and human latency. The Warlord Base 1 architecture collapses that entire cycle into a synchronized 16-director neural matrix.

**Three Unbreakable Tenets:**
1. **Precision Deconstruction:** Every macro objective undergoes forensic 5-turn deconstruction before a single line of execution code is committed.
2. **Deterministic Scaling:** 0.0 to 1.0 Rhythm Multipliers ensure quantitative risk parameters are locked to active volatility regimes.
3. **Sovereign Infrastructure:** Fully operable across zero-cost local clusters, Kaggle Dual-T4 accelerated cloud GPU nodes, or frontier failovers.

**Direct Execution Call to Action:**
> "Unlock the rhythm of your capital assets. Authorize execution on Base 1 today."`
    }
  ],
  'MAKING MONEY IDEAS': [
    {
      id: 'art-mmi-1',
      title: 'Lead Magnet Micro-Site: 10 High-Yield Vector Blueprints',
      type: 'landing_page',
      director: 'ROXY // ARTWORK ALPHA',
      timestamp: '2026-09-27 18:30',
      description: 'Single-page opt-in form with conversion funnel telemetry.',
      code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #080a0c; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { background: #0f1217; border: 1px solid #1f242d; padding: 32px; border-radius: 8px; width: 90%; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h2 { color: #ffb800; font-size: 1.2rem; margin-bottom: 8px; text-transform: uppercase; }
    p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; line-height: 1.5; }
    input { width: 100%; padding: 12px; background: #14171c; border: 1px solid #232832; color: #fff; font-size: 0.9rem; border-radius: 4px; margin-bottom: 12px; outline: none; box-sizing: border-box; }
    input:focus { border-color: #ffb800; }
    button { width: 100%; padding: 12px; background: #ffb800; border: none; font-weight: bold; color: #000; border-radius: 4px; cursor: pointer; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
    button:hover { background: #e6a600; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Access Tactical Dossier</h2>
    <p>Receive the 10 highest-converting automated digital workflows verified by Warlord MCNC.</p>
    <input type="email" placeholder="ENTER SECURE EMAIL..." />
    <button>TRANSMIT BLUEPRINT</button>
  </div>
</body>
</html>`
    }
  ]
};

export default function Tab09Previews({ ws }) {
  // Sync to active project from localStorage
  const [selectedProject, setSelectedProject] = useState(() => {
    return localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'DIGITAL ASSET MONETIZATION';
  });

  const [projectList, setProjectList] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PROJECT_LIST');
      return stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  });

  const [artifacts, setArtifacts] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PREVIEW_ARTIFACTS');
      return stored ? JSON.parse(stored) : SEED_ARTIFACTS;
    } catch (e) {
      return SEED_ARTIFACTS;
    }
  });

  const activeProjectArtifacts = artifacts[selectedProject] || [];
  const [selectedArtifactId, setSelectedArtifactId] = useState(activeProjectArtifacts[0]?.id || null);

  // Viewport & Display Controls
  const [viewportMode, setViewportMode] = useState('DESKTOP'); // DESKTOP, TABLET, MOBILE
  const [renderMode, setRenderMode] = useState('PREVIEW'); // PREVIEW, CODE
  const [copiedCode, setCopiedCode] = useState(false);

  const activeArtifact = activeProjectArtifacts.find(a => a.id === selectedArtifactId) || activeProjectArtifacts[0] || null;

  // Re-sync artifact selection when project shifts
  useEffect(() => {
    const currentList = artifacts[selectedProject] || [];
    if (currentList.length > 0) {
      setSelectedArtifactId(currentList[0].id);
    } else {
      setSelectedArtifactId(null);
    }
  }, [selectedProject, artifacts]);

  // Keep project synced across tabs
  useEffect(() => {
    const handleStorage = () => {
      const active = localStorage.getItem('MCNC_ACTIVE_PROJECT');
      if (active && active !== selectedProject) {
        setSelectedProject(active);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedProject]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'MOBILE': return '375px';
      case 'TABLET': return '768px';
      default: return '100%';
    }
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: PROJECT SELECTOR & ARTIFACT DIRECTORY (W-1/4)               */}
      {/* ========================================================================= */}
      <div className="w-80 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        
        {/* PROJECT CONTAINER BOX */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[#ffb800] font-bold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ffb800]" />
              PROJECT CONTAINER
            </span>
          </div>

          <select 
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              localStorage.setItem('MCNC_ACTIVE_PROJECT', e.target.value);
            }}
            className="w-full bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer"
          >
            {projectList.map(p => (
              <option key={p} value={p}>[ PROJECT: {p} ]</option>
            ))}
          </select>
        </div>

        {/* ARTIFACT CATALOG BOX */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-[#ffb800]" />
              STAGED ARTIFACTS
            </span>
            <span className="text-[9px] text-[#38bdf8] border border-[#38bdf8]/40 px-1.5 py-0.5 rounded">
              {activeProjectArtifacts.length} READY
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {activeProjectArtifacts.length === 0 ? (
              <div className="text-[#5c6b7f] text-center p-6 italic">
                No artifacts staged for this project yet. Run a directive in Tab 02 War Room to generate staging assets.
              </div>
            ) : (
              activeProjectArtifacts.map(art => {
                const isSelected = activeArtifact?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtifactId(art.id)}
                    className={`p-2.5 rounded border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#14171c] border-[#ffb800] text-white shadow-[0_0_8px_rgba(255,184,0,0.15)]'
                        : 'bg-[#0a0c0e] border-[#1f242d] text-[#8fa0b5] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold truncate max-w-[170px] ${isSelected ? 'text-[#ffb800]' : 'text-gray-200'}`}>
                        {art.title}
                      </span>
                      <span className="text-[8px] bg-[#1a202c] px-1 py-0.2 rounded border border-[#2d3748] uppercase">
                        {art.type === 'landing_page' ? 'HTML/DOM' : 'COPY/MD'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-[#5c6b7f]">
                      <span>{art.director}</span>
                      <span>{art.timestamp.split(' ')[1]}</span>
                    </div>

                    <p className="text-[9px] text-[#5c6b7f] line-clamp-2 leading-tight">
                      {art.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: INTERACTIVE STAGING VIEWPORT & CODE DOCK (FLEX-1)         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        
        {/* VIEWPORT HEADER & TOOLBAR */}
        <div className="p-2.5 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center select-none">
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[10px]">PREVIEWS // ASSET STAGING:</span>
            <span className="text-[#ffb800] font-bold text-[10px]">
              {activeArtifact ? activeArtifact.title : 'NO ARTIFACT ACTIVE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* VIEWPORT RESIZER (ONLY RELEVANT FOR LANDING PAGES) */}
            {activeArtifact?.type === 'landing_page' && (
              <div className="flex bg-[#14171c] border border-[#1f242d] rounded p-0.5 gap-0.5">
                <button
                  onClick={() => setViewportMode('DESKTOP')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewportMode === 'DESKTOP' ? 'bg-[#ffb800] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
                  }`}
                  title="Desktop (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('TABLET')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewportMode === 'TABLET' ? 'bg-[#ffb800] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('MOBILE')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewportMode === 'MOBILE' ? 'bg-[#ffb800] text-black font-bold' : 'text-[#8fa0b5] hover:text-white'
                  }`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* PREVIEW VS SOURCE TOGGLE */}
            <div className="flex bg-[#14171c] border border-[#1f242d] rounded p-0.5 gap-0.5">
              <button
                onClick={() => setRenderMode('PREVIEW')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  renderMode === 'PREVIEW' ? 'bg-[#38bdf8] text-black' : 'text-[#8fa0b5] hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>PREVIEW</span>
              </button>
              <button
                onClick={() => setRenderMode('CODE')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  renderMode === 'CODE' ? 'bg-[#38bdf8] text-black' : 'text-[#8fa0b5] hover:text-white'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>CODE</span>
              </button>
            </div>

            {/* COPY ARTIFACT PAYLOAD */}
            {activeArtifact && (
              <button
                onClick={() => handleCopy(activeArtifact.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  copiedCode 
                    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]' 
                    : 'bg-[#14171c] hover:bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/40 hover:border-[#ffb800]'
                }`}
              >
                {copiedCode ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3 text-[#ffb800]" />}
                <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
              </button>
            )}

          </div>

        </div>

        {/* STAGING STAGE VIEWPORT */}
        <div className="flex-1 bg-[#050608] overflow-auto flex items-center justify-center p-3 relative">
          
          {!activeArtifact ? (
            <div className="text-center text-[#5c6b7f] font-mono space-y-2">
              <Terminal className="w-8 h-8 text-[#1f242d] mx-auto" />
              <p>NO ARTIFACT SELECTED FOR STAGING.</p>
              <p className="text-[10px]">Select an asset from the left manifest or dispatch a build from Tab 02.</p>
            </div>
          ) : renderMode === 'CODE' ? (
            /* RAW CODE VIEWER */
            <div className="w-full h-full bg-[#0a0c0e] border border-[#1f242d] rounded p-4 overflow-auto font-mono text-xs select-text">
              <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                <code>{activeArtifact.code}</code>
              </pre>
            </div>
          ) : activeArtifact.type === 'landing_page' ? (
            /* ISOLATED IFRAME PREVIEW CONTAINER */
            <div 
              style={{ width: getViewportWidth() }}
              className="h-full bg-white rounded border border-[#1f242d] shadow-2xl transition-all duration-300 overflow-hidden relative flex flex-col"
            >
              {/* Simulated Browser URL bar */}
              <div className="bg-[#14171c] border-b border-[#232832] px-3 py-1.5 flex items-center gap-2 select-none">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffb800]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                </div>
                <div className="flex-1 bg-[#0a0c0e] text-[#8fa0b5] px-2 py-0.5 rounded text-[10px] font-mono truncate border border-[#1f242d]">
                  https://base1.warlord.internal/staging/{selectedProject.toLowerCase().replace(/\\s+/g, '-')}/index.html
                </div>
              </div>

              {/* Sandboxed iframe */}
              <iframe
                title="Artifact Staging Viewport"
                srcDoc={activeArtifact.code}
                sandbox="allow-scripts"
                className="w-full flex-1 border-none bg-white"
              />
            </div>
          ) : (
            /* FORMATTED COPY / DOSSIER CARDS */
            <div className="w-full max-w-3xl h-full bg-[#0d0f12] border border-[#1f242d] rounded p-6 overflow-auto font-mono text-xs text-gray-200 shadow-xl select-text">
              <div className="border-b border-[#1f242d] pb-3 mb-4 flex justify-between items-center select-none">
                <div>
                  <span className="text-[10px] text-[#ffb800] font-bold block">{activeArtifact.title}</span>
                  <span className="text-[9px] text-[#5c6b7f]">Author: {activeArtifact.director}</span>
                </div>
                <span className="text-[9px] bg-[#14171c] text-[#38bdf8] border border-[#38bdf8]/40 px-2 py-0.5 rounded font-bold">
                  VALIDATED PRD COPY
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed space-y-3">
                {activeArtifact.code}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
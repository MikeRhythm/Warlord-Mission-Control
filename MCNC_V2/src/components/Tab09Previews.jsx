import React, { useState, useEffect } from 'react';
import { 
  Monitor, Tablet, Smartphone, Copy, Check, Code, Eye, 
  Layers, FolderOpen, Terminal
} from 'lucide-react';
import './Tab09Previews.css';

const DEFAULT_PROJECTS = [
  'ZAMBEZI SAFARI',
  'DIGITAL ASSET MONETIZATION',
  'MAKING MONEY IDEAS',
  'WAR ROOM - DIRECTOR BOARD KAGGLE TEST',
  'MCNC REACT VITE',
  'RHYTHM WASP V8.5'
];

// Active High-Contrast Safari Seed Manifest
const SEED_ARTIFACTS = {
  'ZAMBEZI SAFARI': [
    {
      id: 'art-zam-v2',
      title: 'Zambezi Sanctuary Retreats // Landing Page',
      type: 'landing_page',
      director: 'ROXY // ARTWORK ALPHA',
      timestamp: '2026-09-28 19:45',
      description: 'Cinematic conservation expedition portal featuring Victoria Falls, Zambezi riverine herds, and Lake Malawi island camps.',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZAMBEZI EXPEDITIONS // PRIVATE SANCTUARIES</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #07090c; color: #f8fafc; line-height: 1.5; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

    /* NAVIGATION */
    nav { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 18px 40px; 
      background: rgba(7, 9, 12, 0.85); 
      position: absolute; 
      top: 0; 
      left: 0; 
      right: 0; 
      z-index: 50; 
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
    }
    .brand { font-size: 13px; font-weight: 800; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
    .brand span { color: #ffb800; }
    .status-badge { 
      font-size: 10px; 
      font-weight: 700; 
      letter-spacing: 1.5px; 
      color: #10b981; 
      background: rgba(16, 185, 129, 0.15); 
      border: 1px solid rgba(16, 185, 129, 0.4); 
      padding: 6px 14px; 
      border-radius: 2px; 
      text-transform: uppercase; 
    }

    /* HERO WITH ACTIVE ELEPHANT SUNSET BACKDROP */
    .hero { 
      position: relative; 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      text-align: center; 
      padding: 140px 24px 80px; 
      background: 
        linear-gradient(180deg, rgba(7, 9, 12, 0.45) 0%, rgba(7, 9, 12, 0.75) 60%, #07090c 100%),
        url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80') center center / cover no-repeat;
    }
    .hero-tag { 
      display: inline-block; 
      font-size: 11px; 
      font-weight: 800; 
      color: #ffb800; 
      letter-spacing: 3px; 
      text-transform: uppercase; 
      margin-bottom: 24px; 
      padding: 6px 16px;
      background: rgba(0, 0, 0, 0.65);
      border: 1px solid rgba(255, 184, 0, 0.4);
      border-radius: 2px;
      backdrop-filter: blur(4px);
    }
    .hero h1 { 
      font-size: 58px; 
      font-weight: 900; 
      color: #ffffff; 
      letter-spacing: -1.5px; 
      line-height: 1.08; 
      margin-bottom: 24px; 
      max-width: 980px;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.9);
    }
    .hero h1 em { font-style: normal; color: #ffb800; }
    .hero p { 
      font-size: 18px; 
      color: #e2e8f0; 
      max-width: 720px; 
      margin: 0 auto 42px; 
      line-height: 1.6; 
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
    }
    .cta-btn { 
      display: inline-block; 
      padding: 16px 44px; 
      font-size: 11px; 
      font-weight: 800; 
      letter-spacing: 2px; 
      text-transform: uppercase; 
      background: #ffb800; 
      color: #07090c; 
      border: none; 
      border-radius: 2px; 
      cursor: pointer; 
      transition: all 0.2s ease; 
      box-shadow: 0 0 25px rgba(255, 184, 0, 0.4); 
      text-decoration: none; 
    }
    .cta-btn:hover { 
      background: #e6a600; 
      box-shadow: 0 0 40px rgba(255, 184, 0, 0.65); 
      transform: translateY(-2px); 
    }

    /* TELEMETRY STRIP */
    .telemetry { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      max-width: 1040px; 
      margin: -60px auto 80px; 
      background: rgba(13, 17, 23, 0.9); 
      border: 1px solid rgba(255, 255, 255, 0.12); 
      border-radius: 4px; 
      overflow: hidden; 
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
      position: relative;
      z-index: 10;
    }
    .stat { padding: 30px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.08); }
    .stat:last-child { border-right: none; }
    .stat-val { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 4px; font-family: monospace; }
    .stat-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }

    /* CONCESSION CARDS */
    .section-header { text-align: center; margin-bottom: 48px; padding: 0 20px; }
    .section-tag { font-size: 11px; letter-spacing: 3px; color: #ffb800; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; display: block; }
    .section-header h2 { font-size: 34px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    
    .matrix { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 24px; 
      max-width: 1200px; 
      margin: 0 auto 90px; 
      padding: 0 24px; 
    }
    .card { 
      background: #0d1117; 
      border: 1px solid #1f2633; 
      border-radius: 4px; 
      overflow: hidden; 
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease; 
    }
    .card:hover { 
      border-color: rgba(255, 184, 0, 0.6); 
      transform: translateY(-4px);
      box-shadow: 0 16px 32px rgba(0,0,0,0.6);
    }
    .card-img { 
      height: 220px; 
      background-size: cover; 
      background-position: center; 
      position: relative;
    }
    .card-img::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(13, 17, 23, 0) 50%, rgba(13, 17, 23, 1) 100%);
    }
    .card-content { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    .card-id { font-size: 10px; font-weight: 700; color: #ffb800; letter-spacing: 2px; margin-bottom: 10px; font-family: monospace; }
    .card h3 { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .card p { font-size: 13px; color: #94a3b8; line-height: 1.6; }

    /* VICTORIA FALLS GORGE PANORAMA */
    .panorama {
      max-width: 1200px;
      margin: 0 auto 90px;
      padding: 0 24px;
    }
    .panorama-box {
      border: 1px solid #1f2633;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      min-height: 380px;
      background: 
        linear-gradient(90deg, rgba(7,9,12,0.95) 0%, rgba(7,9,12,0.5) 50%, rgba(7,9,12,0.95) 100%),
        url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80') center center / cover no-repeat;
      display: flex;
      align-items: center;
      padding: 48px;
    }
    .panorama-content {
      max-width: 560px;
    }
    .panorama-tag { font-size: 11px; letter-spacing: 2.5px; color: #38bdf8; text-transform: uppercase; font-weight: 700; margin-bottom: 12px; display: block; }
    .panorama-content h2 { font-size: 34px; font-weight: 900; color: #fff; margin-bottom: 16px; line-height: 1.2; text-shadow: 0 4px 16px rgba(0,0,0,0.8); }
    .panorama-content p { font-size: 14px; color: #cbd5e1; line-height: 1.7; margin-bottom: 28px; text-shadow: 0 2px 8px rgba(0,0,0,0.8); }

    /* BOOKING DOCK */
    .booking-wrap { 
      max-width: 820px; 
      margin: 0 auto 90px; 
      padding: 50px 40px; 
      background: #0d1117; 
      border: 1px solid #1f2633; 
      border-radius: 4px; 
      text-align: center; 
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .booking-wrap h2 { font-size: 26px; color: #ffffff; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
    .booking-wrap p { font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .form-grid input { 
      background: #141922; 
      border: 1px solid #232c3b; 
      color: #ffffff; 
      font-size: 11px; 
      font-family: monospace; 
      padding: 14px 16px; 
      border-radius: 2px; 
      outline: none; 
      transition: border-color 0.2s; 
    }
    .form-grid input:focus { border-color: #ffb800; }
    .form-grid input::placeholder { color: #64748b; }
    .submit-btn { 
      width: 100%; 
      padding: 16px; 
      background: #ffb800; 
      color: #07090c; 
      font-size: 11px; 
      font-weight: 800; 
      letter-spacing: 2px; 
      text-transform: uppercase; 
      border: none; 
      border-radius: 2px; 
      cursor: pointer; 
      transition: all 0.2s; 
      box-shadow: 0 0 20px rgba(255, 184, 0, 0.3); 
    }
    .submit-btn:hover { background: #e6a600; box-shadow: 0 0 35px rgba(255, 184, 0, 0.6); }

    /* FOOTER */
    footer { border-top: 1px solid #1f2633; padding: 32px 20px; text-align: center; font-size: 11px; color: #64748b; letter-spacing: 1.5px; }

    @media (max-width: 900px) {
      .matrix, .telemetry, .form-grid { grid-template-columns: 1fr; }
      .telemetry { margin-top: 20px; }
      .hero h1 { font-size: 38px; }
      nav { padding: 18px 24px; }
      .panorama-box { padding: 32px 24px; }
    }
  </style>
</head>
<body>

  <nav>
    <div class="brand">ZAMBEZI <span>//</span> EXPEDITIONS</div>
    <div class="status-badge">CONCESSION ACCESS: LIMITED // SEASON 2026/2027</div>
  </nav>

  <section class="hero">
    <span class="hero-tag">Private Sanctuary Retreats</span>
    <h1>The Untamed Horizon.<br><em>Zero Digital Noise.</em></h1>
    <p>Private chartered expeditions through Southern Africa's primary conservation basins. Drift the deep channels of the Lower Zambezi, walk among ancient elephant corridors, and retreat to secluded freshwater archipelagos.</p>
    <a href="#inquire" class="cta-btn">REQUEST PRIVATE ITINERARY</a>
  </section>

  <div class="telemetry">
    <div class="stat">
      <div class="stat-val">45,000 HA</div>
      <div class="stat-lbl">Protected Riverine Conservancy</div>
    </div>
    <div class="stat">
      <div class="stat-val">MAX 8</div>
      <div class="stat-lbl">Guests Per Sanctuary Rotation</div>
    </div>
    <div class="stat">
      <div class="stat-val">100% OFF-GRID</div>
      <div class="stat-lbl">Solar Powered & Low-Footprint</div>
    </div>
  </div>

  <div class="section-header">
    <span class="section-tag">Sanctuary Portfolio</span>
    <h2>Three Raw Wilderness Corridors</h2>
  </div>

  <div class="matrix">
    <div class="card">
      <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80');"></div>
      <div class="card-content">
        <div class="card-id">01 // LOWER ZAMBEZI</div>
        <h3>Mana Pools & Riverine Drift</h3>
        <p>Silent drift barges gliding through breeding elephant herds, podded hippos, and riverbanks where lions and leopards hunt unbothered by commercial game vehicles.</p>
      </div>
    </div>

    <div class="card">
      <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');"></div>
      <div class="card-content">
        <div class="card-id">02 // LAKE MALAWI ARCHIPELAGO</div>
        <h3>Mumbo & Domwe Island Sanctuaries</h3>
        <p>Pure isolation surrounded by gin-clear freshwater and ancient granite boulders. Wood and canvas chalets perched above the shoreline with zero vehicle traffic and no light pollution.</p>
      </div>
    </div>

    <div class="card">
      <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80');"></div>
      <div class="card-content">
        <div class="card-id">03 // BUSH AVIATION LOGISTICS</div>
        <h3>Direct Airstrip Charter Access</h3>
        <p>Privately chartered turboprop flights connecting directly to unpaved bush strips. Depart private hangars and touch down right on the concession perimeter with no public terminals.</p>
      </div>
    </div>
  </div>

  <div class="panorama">
    <div class="panorama-box">
      <div class="panorama-content">
        <span class="panorama-tag">Natural Monument</span>
        <h2>Mosi-oa-Tunya // The Smoke That Thunders</h2>
        <p>Fly directly over the Victoria Falls basalt gorge before landing upstream for private boat transfers directly into the conservancy boundary.</p>
        <a href="#inquire" class="cta-btn">EXPLORE THE PASSAGE</a>
      </div>
    </div>
  </div>

  <div class="booking-wrap" id="inquire">
    <h2>Transmit Confidential Inquiry</h2>
    <p>Itineraries are tailored individually per private charter party. Strictly limited to two parties per seasonal rotation.</p>
    <div class="form-grid">
      <input type="text" placeholder="LEAD GUEST NAME" />
      <input type="text" placeholder="PREFERRED ROTATION (MONTH)" />
      <input type="text" placeholder="SECURE EMAIL / SIGNAL" />
    </div>
    <button class="submit-btn">TRANSMIT EXPEDITION BRIEF</button>
  </div>

  <footer>
    WARLORD BASE 1 // EXCLUSIVE CONCESSION STAGING MATRIX // STRICTLY CONFIDENTIAL
  </footer>

</body>
</html>`
    },
    {
      id: 'art-zam-copy',
      title: 'Expedition Dossier & Market Pitch Copy',
      type: 'copy',
      director: 'AMBER // COPYWRITER',
      timestamp: '2026-09-28 19:45',
      description: 'Private high-net-worth narrative copy for bespoke charter reservations.',
      code: `### ZAMBEZI EXPEDITIONS // PRIVATE SANCTUARY RETREATS

**Target Demographics:** Ultra-High-Net-Worth Individuals, Conservation Investors, Private Chartered Groups.

**The Narrative Core:**
"The world has become loud, over-connected, and sanitized. Zambezi Expeditions exists to reverse that condition. We operate strictly off-grid private concessions across the Zambezi River basin and the untouched freshwater islands of Lake Malawi. No tourist convoys. No shared vehicles. No ambient interference."

**Pillars of Exclusivity:**
1. **Sanctuary Isolation:** 45,000 hectares of private conservancy strictly capped at eight guests per rotation.
2. **Bush Aviation Logistics:** Direct unpaved airstrip clearance via chartered turboprop aircraft. Depart from private hangars with zero international terminal exposure.
3. **Island Sanctuaries:** Complete ecological immersion across Mumbo and Domwe islands with zero light footprint and full solar independence.

**Booking Friction Reduction:**
All bookings handled via end-to-end encrypted concierge communication. Two parties maximum per seasonal window.`
    }
  ]
};

export default function Tab09Previews({ ws }) {
  const [selectedProject, setSelectedProject] = useState(() => {
    return localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'ZAMBEZI SAFARI';
  });

  const [projectList] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PROJECT_LIST');
      return stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  });

  // Always use the fresh SEED_ARTIFACTS directly
  const activeProjectArtifacts = SEED_ARTIFACTS[selectedProject] || [];
  const [selectedArtifactId, setSelectedArtifactId] = useState(activeProjectArtifacts[0]?.id || null);

  const [viewportMode, setViewportMode] = useState('DESKTOP');
  const [renderMode, setRenderMode] = useState('PREVIEW');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeArtifact = activeProjectArtifacts.find(a => a.id === selectedArtifactId) || activeProjectArtifacts[0] || null;

  useEffect(() => {
    const currentList = SEED_ARTIFACTS[selectedProject] || [];
    if (currentList.length > 0) {
      setSelectedArtifactId(currentList[0].id);
    } else {
      setSelectedArtifactId(null);
    }
  }, [selectedProject]);

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
      
      {/* LEFT COLUMN: PROJECT SELECTOR & ARTIFACT DIRECTORY */}
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
            <span className="text-[9px] text-[#38bdf8] border border-[#38bdf8]/40 px-1.5 py-0.5 rounded font-bold">
              {activeProjectArtifacts.length} READY
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {activeProjectArtifacts.length === 0 ? (
              <div className="text-[#5c6b7f] text-center p-6 italic">
                No artifacts staged for this project yet.
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

      {/* RIGHT COLUMN: INTERACTIVE STAGING VIEWPORT & CODE DOCK */}
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

        {/* STAGING VIEWPORT */}
        <div className="flex-1 bg-[#050608] overflow-auto flex items-center justify-center p-3 relative">
          
          {!activeArtifact ? (
            <div className="text-center text-[#5c6b7f] font-mono space-y-2">
              <Terminal className="w-8 h-8 text-[#1f242d] mx-auto" />
              <p>NO ARTIFACT SELECTED FOR STAGING.</p>
            </div>
          ) : renderMode === 'CODE' ? (
            <div className="w-full h-full bg-[#0a0c0e] border border-[#1f242d] rounded p-4 overflow-auto font-mono text-xs select-text">
              <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                <code>{activeArtifact.code}</code>
              </pre>
            </div>
          ) : activeArtifact.type === 'landing_page' ? (
            <div 
              style={{ width: getViewportWidth() }}
              className="h-full bg-white rounded border border-[#1f242d] shadow-2xl transition-all duration-300 overflow-hidden relative flex flex-col"
            >
              <div className="bg-[#14171c] border-b border-[#232832] px-3 py-1.5 flex items-center gap-2 select-none">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffb800]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                </div>
                <div className="flex-1 bg-[#0a0c0e] text-[#8fa0b5] px-2 py-0.5 rounded text-[10px] font-mono truncate border border-[#1f242d]">
                  https://base1.warlord.internal/staging/zambezi-safari/index.html
                </div>
              </div>

              <iframe
                title="Artifact Staging Viewport"
                srcDoc={activeArtifact.code}
                sandbox="allow-scripts"
                className="w-full flex-1 border-none bg-white"
              />
            </div>
          ) : (
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
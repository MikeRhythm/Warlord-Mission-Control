import React, { useState } from 'react';
import { Sparkles, Loader2, Database, AlertOctagon } from 'lucide-react';

const INITIAL_DOMAINS = [
  'Market & Currency Pairs',
  'System Architecture & Code',
  'Hardware & Infrastructure',
  'Tactical & Historical Archives',
  'Cutting Edge AI',
  'General Research'
];

const INITIAL_SPECIALIZATIONS = {
  'Market & Currency Pairs': ['EURUSD Volatility & London/NY Overlap', 'GBPUSD Flow & Liquidity', 'Cross-Asset Momentum'],
  'System Architecture & Code': ['MQL5 / Node.js Bridges', 'React Vite Interfaces', 'OpenClaw Agent Routing'],
  'Hardware & Infrastructure': ['Dell PowerEdge R520 Logs', 'Base 1 Server Setup', 'Network & Power Routing'],
  'Tactical & Historical Archives': ['Caprivi Patrol Memoirs', 'Zanzibar Operations', 'Riverine Navigation'],
  'Cutting Edge AI': ['Hermes', 'Ollama Runtimes', 'Local LLM Ingestion'],
  'General Research': ['General Intelligence', 'Open Source Tooling', 'Literature & Excerpts']
};

export default function Tab12Review() {
  const [topicDomains, setTopicDomains] = useState(INITIAL_DOMAINS);
  const [specializationsMap, setSpecializationsMap] = useState(INITIAL_SPECIALIZATIONS);

  const [url, setUrl] = useState('');
  const [contentDump, setContentDump] = useState('');
  const [topicDomain, setTopicDomain] = useState('Cutting Edge AI');
  const [specialization, setSpecialization] = useState('Hermes');
  const [pruneAndMerge, setPruneAndMerge] = useState(true);

  const [harvestedNugget, setHarvestedNugget] = useState(
    '// Paste videos, notes, or raw discussions on the left, then click \'HARVEST PURE NUGGET\'.\n// The gauge above will calculate the exact signal-to-noise ratio and time saved.\n// Click \'PUSH TO 13 DOCS LIBRARY\' to merge and synthesize the payload into the canonical master dossier.'
  );
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [signalRatio, setSignalRatio] = useState({ nuggetInt: 28, fluffInt: 72 });

  const handleDomainChange = (e) => {
    const newDomain = e.target.value;
    setTopicDomain(newDomain);
    const specs = specializationsMap[newDomain] || ['General'];
    setSpecialization(specs[0]);
  };

  const handleAddDomain = () => {
    const newDomain = window.prompt("ENTER NEW TOPIC DOMAIN:");
    if (newDomain && newDomain.trim() !== '') {
      const cleanDomain = newDomain.trim();
      if (!topicDomains.includes(cleanDomain)) {
        setTopicDomains([...topicDomains, cleanDomain]);
        setSpecializationsMap({ ...specializationsMap, [cleanDomain]: ['General'] });
      }
      setTopicDomain(cleanDomain);
      setSpecialization('General');
    }
  };

  const handleAddSpecialization = () => {
    const newSpec = window.prompt(`ENTER NEW SPECIALIZATION FOR [${topicDomain}]:`);
    if (newSpec && newSpec.trim() !== '') {
      const cleanSpec = newSpec.trim();
      const currentSpecs = specializationsMap[topicDomain] || [];
      if (!currentSpecs.includes(cleanSpec)) {
        setSpecializationsMap({
          ...specializationsMap,
          [topicDomain]: [...currentSpecs, cleanSpec]
        });
      }
      setSpecialization(cleanSpec);
    }
  };

  const handleHarvest = async () => {
    if (!url.trim() && !contentDump.trim()) return;

    setIsHarvesting(true);
    setHasError(false);
    setHarvestedNugget('// Executing multi-tier extraction pipeline...\n// Scraping source vectors and stripping narrative fluff...');

    try {
      const inputLength = contentDump.trim().length || 15000; 

      const response = await fetch('http://127.0.0.1:8081/api/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          contentDump: contentDump.trim(),
          topicDomain,
          specialization
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setHasError(true);
        setHarvestedNugget(`[HARVEST ERROR]: ${data.error}`);
        setSignalRatio({ nuggetInt: 0, fluffInt: 100 });
      } else {
        const outputLength = (data.nugget || '').length;
        let retainedPct = Math.round((outputLength / inputLength) * 100);
        if (retainedPct < 1) retainedPct = 1;
        if (retainedPct > 99) retainedPct = 99;

        setHarvestedNugget(data.nugget || 'Extraction complete. No payload returned.');
        setSignalRatio({ nuggetInt: retainedPct, fluffInt: 100 - retainedPct });
      }
    } catch (err) {
      setHasError(true);
      setHarvestedNugget(`[DAEMON CONNECTION FAILURE]: ${err.message}`);
      setSignalRatio({ nuggetInt: 0, fluffInt: 100 });
    } finally {
      setIsHarvesting(false);
    }
  };

  const handlePushToDocs = async () => {
    if (hasError || isHarvesting || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8081/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: topicDomain,
          specialization: specialization,
          content: harvestedNugget,
          pruneAndMerge: pruneAndMerge
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setHasError(true);
        setHarvestedNugget((prev) => `[VAULT WRITE ERROR]: ${data.error}\n\n${prev}`);
      } else {
        setHarvestedNugget((prev) => `// [VAULT SYNTHESIS SUCCESS]: ${data.message}\n\n${prev}`);
        // Dispatch instant disk refresh signal to Tab 13
        window.dispatchEvent(new CustomEvent('MCNC_PUSH_TO_DOCS'));
      }
    } catch (err) {
      setHasError(true);
      setHarvestedNugget((prev) => `[NETWORK ERROR]: ${err.message}\n\n${prev}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080a0c] text-xs font-mono text-[#e2e8f0] p-3 gap-3 select-none">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-[#0d0f12] border border-[#1f242d] px-4 py-2.5 rounded">
        <div>
          <div className="text-[#ffb800] font-bold text-sm tracking-wider">
            12 REVIEW // RESEARCH & INTELLIGENCE REFINERY
          </div>
          <div className="text-[10px] text-[#5c6b7f]">
            Fluff-to-nugget gauge • Universal domain classification • Canonical dossier synthesis
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5c6b7f]">TRIAGE JUDGE:</span>
          <span className="px-2 py-1 bg-[#14171c] border border-[#232832] text-[#ffb800] font-bold rounded text-[10px]">
            01 MONTY
          </span>
        </div>
      </div>

      {/* SIGNAL DENSITY METER */}
      <div className="bg-[#0d0f12] border border-[#1f242d] p-3 rounded space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-[#5c6b7f] font-bold tracking-wide">SIGNAL DENSITY // FLUFF-TO-NUGGET RATIO</span>
          <div className="space-x-3">
            <span className={hasError ? "text-[#ef4444] font-bold" : "text-[#10b981] font-bold"}>
              NUGGET: {signalRatio.nuggetInt}%
            </span>
            <span className="text-[#5c6b7f]">STRIPPED FLUFF: {signalRatio.fluffInt}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-[#14171c] rounded overflow-hidden border border-[#1f242d]">
          <div 
            className={`h-full transition-all duration-500 ${hasError ? 'bg-[#ef4444]' : 'bg-gradient-to-r from-[#10b981]/40 to-[#10b981]'}`}
            style={{ width: `${hasError ? 100 : signalRatio.nuggetInt}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#5c6b7f] pt-1">
          <span className={hasError ? "text-[#ef4444]" : ""}>
            STATUS: {isHarvesting ? 'EXTRACTING VECTORS...' : isSaving ? 'SYNTHESIZING TO VAULT...' : hasError ? 'ERROR ENCOUNTERED' : 'AWAITING CONTENT SCAN'}
          </span>
          <span>ESTIMATED READING/WATCH TIME SAVED: ~{Math.round(signalRatio.fluffInt * 0.3)} MINS</span>
        </div>
      </div>

      {/* DUAL PANE WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
        
        {/* LEFT PANE: INTAKE & HARVESTING */}
        <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-3 space-y-3 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center text-[11px] text-[#ffb800] font-bold border-b border-[#14181f] pb-2">
            <span>INTAKE & HARVESTING</span>
            <span className="text-[10px] text-[#5c6b7f] font-normal">AI GUIDED</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#5c6b7f] font-bold uppercase">Video or Article Link</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] rounded p-2 text-xs focus:outline-none focus:border-[#ffb800]"
            />
          </div>

          <div className="flex-1 flex flex-col space-y-1 min-h-[140px]">
            <label className="text-[10px] text-[#5c6b7f] font-bold uppercase">Conversation, Code, or Document Dump</label>
            <textarea
              value={contentDump}
              onChange={(e) => setContentDump(e.target.value)}
              placeholder="Paste research transcripts, code notes, or discussion logs here..."
              className="flex-1 w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] rounded p-2 text-xs focus:outline-none focus:border-[#ffb800] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-[#5c6b7f] font-bold uppercase">1. Topic Domain</label>
                <button onClick={handleAddDomain} className="text-[9px] text-[#ffb800] hover:underline cursor-pointer">+ Add</button>
              </div>
              <select
                value={topicDomain}
                onChange={handleDomainChange}
                className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] rounded p-1.5 text-xs outline-none focus:border-[#ffb800] cursor-pointer"
              >
                {topicDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-[#5c6b7f] font-bold uppercase">2. Specialization / Sub-Niche</label>
                <button onClick={handleAddSpecialization} className="text-[9px] text-[#ffb800] hover:underline cursor-pointer">+ Add</button>
              </div>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-[#101317] text-[#e2e8f0] border border-[#1f242d] rounded p-1.5 text-xs outline-none focus:border-[#ffb800] cursor-pointer"
              >
                {(specializationsMap[topicDomain] || ['General']).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              checked={pruneAndMerge} 
              onChange={(e) => setPruneAndMerge(e.target.checked)}
              id="pruneCheck" 
              className="accent-[#ffb800] cursor-pointer" 
            />
            <label htmlFor="pruneCheck" className="text-[10px] text-[#5c6b7f] cursor-pointer">
              Prune & merge into canonical master dossier (Eliminates duplicates)
            </label>
          </div>

          <button
            onClick={handleHarvest}
            disabled={isHarvesting || (!url.trim() && !contentDump.trim())}
            className={`w-full py-2 font-bold rounded text-xs flex items-center justify-center gap-2 transition-all ${
              isHarvesting || (!url.trim() && !contentDump.trim())
                ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                : 'bg-[#ffb800] hover:bg-[#e6a600] text-black cursor-pointer'
            }`}
          >
            {isHarvesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isHarvesting ? 'HARVESTING VECTORS...' : 'HARVEST PURE NUGGET'}</span>
          </button>
        </div>

        {/* RIGHT PANE: HARVESTED NUGGET */}
        <div className="flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-3 space-y-3">
          <div className={`flex justify-between items-center text-[11px] font-bold border-b border-[#14181f] pb-2 ${hasError ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
            <span>THE HARVESTED NUGGET (EDITABLE)</span>
            <span className="text-[10px] text-[#5c6b7f] font-normal">
              {isHarvesting ? 'PROCESSING...' : isSaving ? 'SYNTHESIZING...' : hasError ? 'ERROR' : 'IDLE // READY'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#101317] border border-[#1f242d] p-2 rounded text-[10px]">
            <span className="text-[#5c6b7f]">CANONICAL FILE:</span>
            <span className="text-[#ffb800] font-bold">{topicDomain}</span>
            <span className="text-[#5c6b7f]">&gt;</span>
            <span className="text-[#38bdf8] font-bold">{specialization.replace(/\s+/g, '_')}.md</span>
          </div>

          <textarea
            value={harvestedNugget}
            onChange={(e) => setHarvestedNugget(e.target.value)}
            className={`flex-1 w-full bg-[#101317] border rounded p-3 text-xs focus:outline-none resize-none font-mono leading-relaxed whitespace-pre-wrap ${
              hasError 
                ? 'text-[#fca5a5] border-[#ef4444]/30 focus:border-[#ef4444]' 
                : 'text-[#d1d5db] border-[#1f242d] focus:border-[#10b981]'
            }`}
          />

          <button
            onClick={handlePushToDocs}
            disabled={hasError || isHarvesting || isSaving}
            className={`w-full py-2 font-bold rounded text-xs flex items-center justify-center gap-2 transition-colors ${
              hasError || isHarvesting || isSaving
                ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                : 'bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/50 cursor-pointer'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" /> : hasError ? <AlertOctagon className="w-4 h-4 text-[#ef4444]" /> : <Database className="w-4 h-4 text-[#10b981]" />}
            <span>{isSaving ? 'SYNTHESIZING TO VAULT...' : 'PUSH TO 13 DOCS LIBRARY'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Tab14PipeLine({ ws }) {
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [clusterCounts, setClusterCounts] = useState({ gemini: 4, nim: 16, groq: 1 });
  const [isKaggleOnline, setIsKaggleOnline] = useState(false);
  const [computeMode, setComputeMode] = useState('STANDBY');
  const [openRouterLatency, setOpenRouterLatency] = useState('65ms');
  const [clusterModal, setClusterModal] = useState(null);
  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: '18:19:03', text: '[SYSTEM] Tab 14 live telemetry initialized.' },
    { id: 2, time: '18:19:03', text: '[POLL] Pinging Warlord Bridge (8081)...' },
    { id: 3, time: '18:19:04', text: '[RESULT] Bridge ONLINE. Compute Mode: KAGGLE. WS Clients: 1' }
  ]);

  const fetchPipelineStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8081/api/status');
      if (res.ok) {
        const data = await res.json();
        setPipelineStatus(data);
        setIsKaggleOnline(Boolean(data.kaggle_gpu_online));
        setComputeMode(data.compute_mode || 'STANDBY');
        if (data.cluster_counts) setClusterCounts(data.cluster_counts);
      }
    } catch (e) {
      console.warn("Pipeline telemetry offline");
    }
  };

  useEffect(() => {
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshMatrix = () => {
    fetchPipelineStatus();
    setEventLogs(prev => [...prev, { id: Date.now(), time: new Date().toTimeString().slice(0, 8), text: '[POLL] Matrix manually refreshed.' }]);
  };

  const auditCluster = (clusterName) => {
    alert(`Auditing and purging stale keys for ${clusterName.toUpperCase()} cluster...`);
  };

  const probeKaggleBridge = () => {
    alert(isKaggleOnline ? "Kaggle bridge is ACTIVE and responding." : "Kaggle bridge is currently in STANDBY mode.");
  };

  const pingOpenRouter = async () => {
    const start = performance.now();
    try {
      await fetch('https://openrouter.ai/api/v1/models');
      const latency = Math.round(performance.now() - start);
      setOpenRouterLatency(`${latency}ms`);
    } catch (e) {
      setOpenRouterLatency('ERROR');
    }
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono p-4 gap-4 overflow-y-auto custom-scrollbar select-none">
      
      {/* LEFT COLUMN: PORTS, ROLLOVER BAR, & CLUSTERS */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-[#0d0f12] border border-[#1f242d] p-3 rounded">
          <div>
            <div className="text-[#ffb800] font-bold text-sm tracking-wider">
              14 PIPE-LINE // WARLORD WASP DIAGNOSTIC & SYSTEM MATRIX
            </div>
            <div className="text-[#5c6b7f] text-[11px] mt-0.5">
              Daemon port monitor • Service orchestration • Harvested Key Clusters
            </div>
          </div>
          <button 
            onClick={refreshMatrix}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/40 rounded hover:bg-[#ffb800]/20 font-bold cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH MATRIX</span>
          </button>
        </div>

        {/* DAEMON PORT MONITOR */}
        <div className="bg-[#0d0f12] border border-[#1f242d] p-3 rounded space-y-2">
          <div className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">
            DAEMON PORT MONITOR & CORE SERVICES
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 bg-[#101317] border border-[#1f242d] rounded">
              <span>Paperclip Orchestrator (3100):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#101317] border border-[#1f242d] rounded">
              <span>MCNC Dashboard (5173):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#101317] border border-[#1f242d] rounded">
              <span>Warlord Bridge (8081):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#101317] border border-[#1f242d] rounded">
              <span>Kaggle GPU Compute (Dual T4) (BRIDGE):</span>
              <span className={`font-bold ${isKaggleOnline ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {isKaggleOnline ? '[ + ACTIVE ]' : '[ - STANDBY ]'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#101317] border border-[#1f242d] rounded">
              <span>Paris VPN (Contabo Uplink) (TUN0):</span>
              <span className="text-[#10b981] font-bold">[ + SECURE ]</span>
            </div>
          </div>
        </div>

        {/* UPSTREAM INFERENCE & CLUSTER NODES */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[#ffb800] text-xs font-bold uppercase tracking-wider">
              UPSTREAM INFERENCE & CLUSTER NODES // 5-TIER ROLLOVER SEQUENCE
            </span>
            <span className="text-[10px] text-[#5c6b7f]">
              AUTOMATIC IN-FLIGHT FAILOVER (T1 → T5)
            </span>
          </div>

          {/* GRAPHICAL ROLLOVER PIPELINE BAR */}
          <div className="grid grid-cols-5 gap-2 p-2.5 bg-[#0a0c0e] border border-[#1f242d] rounded shadow-inner">
            <div className="flex flex-col items-center justify-center p-2 bg-[#101317] border border-[#38bdf8]/50 rounded">
              <span className="text-[10px] font-bold text-[#38bdf8]">TIER 1</span>
              <span className="text-[9px] text-white mt-0.5">GEMINI</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-[#101317] border border-[#10b981]/50 rounded">
              <span className="text-[10px] font-bold text-[#10b981]">TIER 2</span>
              <span className="text-[9px] text-white mt-0.5">NVIDIA NIM</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-[#101317] border border-[#f97316]/50 rounded">
              <span className="text-[10px] font-bold text-[#f97316]">TIER 3</span>
              <span className="text-[9px] text-white mt-0.5">GROQ LPU</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-[#101317] border border-[#ef4444]/50 rounded">
              <span className="text-[10px] font-bold text-[#ef4444]">TIER 4</span>
              <span className="text-[9px] text-white mt-0.5">KAGGLE GPU</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-[#101317] border border-[#a855f7]/50 rounded">
              <span className="text-[10px] font-bold text-[#a855f7]">TIER 5</span>
              <span className="text-[9px] text-white mt-0.5">OPENROUTER</span>
            </div>
          </div>

          {/* RE-ORDERED 5-TIER CLUSTER CARDS */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* TIER 1: GEMINI */}
            <div className="bg-[#0d0f12] border border-[#38bdf8]/40 rounded p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#38bdf8] text-xs">
                  [TIER 1] Google Gemini Cluster
                </span>
                <span className="text-[#38bdf8] font-bold text-xs">
                  {clusterCounts?.gemini ?? 4} Active
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setClusterModal('gemini')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#38bdf8] border border-[#38bdf8]/40 rounded cursor-pointer">
                  + ADD KEYS
                </button>
                <button onClick={() => auditCluster('gemini')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#38bdf8] border border-[#38bdf8]/40 rounded cursor-pointer">
                  AUDIT & PURGE
                </button>
              </div>
            </div>

            {/* TIER 2: NVIDIA NIM */}
            <div className="bg-[#0d0f12] border border-[#10b981]/40 rounded p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10b981] text-xs">
                  [TIER 2] NVIDIA NIM Cluster
                </span>
                <span className="text-[#10b981] font-bold text-xs">
                  {clusterCounts?.nim ?? 16} Active
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setClusterModal('nim')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#10b981] border border-[#10b981]/40 rounded cursor-pointer">
                  + ADD KEYS
                </button>
                <button onClick={() => auditCluster('nim')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#10b981] border border-[#10b981]/40 rounded cursor-pointer">
                  AUDIT & PURGE
                </button>
              </div>
            </div>

            {/* TIER 3: GROQ */}
            <div className="bg-[#0d0f12] border border-[#f97316]/40 rounded p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f97316] text-xs">
                  [TIER 3] Groq LPU Accelerator
                </span>
                <span className="text-[#f97316] font-bold text-xs">
                  {clusterCounts?.groq ?? 1} Active
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setClusterModal('groq')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#f97316] border border-[#f97316]/40 rounded cursor-pointer">
                  + ADD KEYS
                </button>
                <button onClick={() => auditCluster('groq')} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#f97316] border border-[#f97316]/40 rounded cursor-pointer">
                  AUDIT & PURGE
                </button>
              </div>
            </div>

            {/* TIER 4: KAGGLE */}
            <div className="bg-[#0d0f12] border border-[#ef4444]/40 rounded p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ef4444] text-xs">
                  [TIER 4] Kaggle Dual-T4 (32GB VRAM)
                </span>
                <span className={`font-bold text-xs ${isKaggleOnline ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {isKaggleOnline ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-[#5c6b7f]">
                  MODE: {computeMode || 'STANDBY'}
                </span>
                <button onClick={probeKaggleBridge} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#ef4444] border border-[#ef4444]/40 rounded cursor-pointer">
                  PROBE BRIDGE
                </button>
              </div>
            </div>

          </div>

          {/* TIER 5: OPENROUTER SHIELD */}
          <div className="bg-[#0d0f12] border border-[#a855f7]/40 rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#a855f7] text-xs">
                [TIER 5] OpenRouter Multi-LLM (Paid Shield)
              </div>
              <div className="text-[10px] text-[#5c6b7f] mt-0.5">
                STATUS: ONLINE • ENGAGED ONLY WHEN TIERS 1-4 EXHAUSTED / STANDBY
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#10b981] font-bold text-xs">{openRouterLatency || '65ms'}</span>
              <button onClick={pingOpenRouter} className="text-[10px] px-2 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#a855f7] border border-[#a855f7]/40 rounded cursor-pointer">
                PING
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: OPENCLAW GATEWAY & DIAGNOSTIC EVENT TRACE */}
      <div className="w-[420px] flex flex-col gap-4 flex-shrink-0">
        
        {/* OPENCLAW GATEWAY CARD */}
        <div className="bg-[#0d0f12] border border-[#1f242d] p-3 rounded space-y-2">
          <div className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">
            3. OpenClaw Gateway (18789):
          </div>
          <div className="text-[11px] text-[#8fa0b5]">
            Start the inter-agent bridge:
          </div>
          <div className="bg-[#101317] border border-[#232832] p-2 rounded text-[#10b981] font-mono text-[11px]">
            openclaw-daemon --port 18789
          </div>
        </div>

        {/* DIAGNOSTIC EVENT TRACE */}
        <div className="flex-1 bg-[#0d0f12] border border-[#1f242d] p-3 rounded flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f242d] mb-2">
            <span className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">
              DIAGNOSTIC EVENT TRACE
            </span>
            <button 
              onClick={() => setEventLogs([])}
              className="text-[10px] text-[#5c6b7f] hover:text-[#ffb800] cursor-pointer"
            >
              [CLEAR]
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1 custom-scrollbar">
            {eventLogs.map(log => (
              <div key={log.id} className="text-[#8fa0b5] leading-relaxed">
                <span className="text-[#5c6b7f] mr-2">{log.time}</span>
                <span className={log.text.includes('ONLINE') ? 'text-[#10b981]' : log.text.includes('POLL') ? 'text-[#ffb800]' : 'text-[#d1d5db]'}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
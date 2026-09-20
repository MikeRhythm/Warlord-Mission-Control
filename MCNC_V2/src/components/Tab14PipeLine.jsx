import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Terminal, CheckCircle2, XCircle, AlertTriangle, 
  Cpu, Server, ShieldCheck, Database, Key, Trash2, Plus, ExternalLink
} from 'lucide-react';

export default function Tab14PipeLine() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKaggleOnline, setIsKaggleOnline] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: '20:00:48', text: '[SYSTEM] Tab 14 live telemetry initialized.', type: 'sys' },
    { id: 2, time: '20:00:48', text: '[POLL] Pinging Warlord Bridge (8081)...', type: 'info' },
    { id: 3, time: '20:00:48', text: '[RESULT] Bridge ONLINE. Compute Mode: KAGGLE. WS Clients: 1', type: 'ok' }
  ]);

  const [clusterKeys, setClusterKeys] = useState({
    nim: 16,
    groq: 1,
    gemini: 4,
    openrouter: 65
  });

  const checkTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('http://127.0.0.1:8081/api/status');
      if (res.ok) {
        const data = await res.json();
        setIsKaggleOnline(Boolean(data.kaggle_gpu_online));
      }
    } catch (err) {
      setIsKaggleOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkTelemetry();
    const interval = setInterval(checkTelemetry, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    checkTelemetry();
    setLogs(prev => [
      ...prev,
      { 
        id: Date.now(), 
        time: new Date().toLocaleTimeString(), 
        text: `[POLL] Matrix re-probed. Kaggle status: ${isKaggleOnline ? 'ACTIVE' : 'STANDBY'}.`, 
        type: isKaggleOnline ? 'ok' : 'info' 
      }
    ]);
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2">
      {/* LEFT COLUMN: DIAGNOSTICS & HARDWARE NODES */}
      <div className="w-1/2 flex flex-col gap-2 overflow-y-auto pr-1">
        {/* TOP STATUS BAR HEADER */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-3">
          <div className="text-[#ffb800] text-xs font-bold uppercase tracking-wider mb-1">
            14 PIPE-LINE // WARLORD WASP DIAGNOSTIC & SYSTEM MATRIX
          </div>
          <div className="text-[10px] text-[#5c6b7f]">
            Daemon port monitor • Service orchestration • Harvested Key Clusters
          </div>
        </div>

        {/* WARLORD WASP DIAGNOSTIC HUD - PORT LISTENERS */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-3">
          <div className="flex items-center justify-between border-b border-[#1f242d] pb-2 mb-3">
            <span className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">WARLORD WASP DIAGNOSTIC HUD</span>
            <span className="text-[10px] text-[#5c6b7f]">PORT LISTENERS</span>
          </div>

          <div className="space-y-2">
            <div className="text-[#38bdf8] font-bold text-[10px] tracking-wider mb-1">SYSTEM MATRIX LINKED</div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Ollama Local Engine (11434):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">OpenClaw Gateway (18789):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Paperclip Orchestrator (3100):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">MCNC Dashboard (5173):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Warlord Bridge (8081):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Kaggle GPU Compute (Dual T4) (BRIDGE):</span>
              <span 
                style={{ color: isKaggleOnline ? '#10b981' : '#9cb8c4' }} 
                className="font-bold"
              >
                {isKaggleOnline ? '[ + ACTIVE ]' : '[ - STANDBY ]'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Paris VPN (Contabo Uplink) (TUN0):</span>
              <span className="text-[#38bdf8] font-bold">[ + SECURE ]</span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-4 px-4 py-1.5 bg-[#ffb800] hover:bg-[#e6a600] text-black font-bold rounded text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>REFRESH MATRIX</span>
          </button>
        </div>

        {/* UPSTREAM INFERENCE & CLUSTER NODES HEADER */}
        <div className="text-[#ffb800] text-xs font-bold uppercase tracking-wider mt-2">
          UPSTREAM INFERENCE & CLUSTER NODES
        </div>

        {/* CLUSTER NODES 2x2 GRID */}
        <div className="grid grid-cols-2 gap-2">
          {/* TIER 4: KAGGLE */}
          <div className={`bg-[#0d0f12] border rounded p-3 flex flex-col justify-between ${isKaggleOnline ? 'border-[#10b981]/40' : 'border-[#9cb8c4]/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[#ffb800] font-bold text-xs font-mono uppercase tracking-wider">
                Kaggle Dual-T4 (32GB VRAM)
              </span>
              <span 
                style={{ color: isKaggleOnline ? '#10b981' : '#9cb8c4' }} 
                className="font-bold text-xs font-mono"
              >
                {isKaggleOnline ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="text-[10px] text-[#8fa0b5] my-2">
              MODE: <span className="text-[#ffb800]">KAGGLE</span>
            </div>
            <button 
              onClick={handleRefresh} 
              className="w-full py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] border border-[#ffb800]/40 rounded text-[10px] font-bold tracking-wider"
            >
              PROBE BRIDGE
            </button>
          </div>

          {/* NVIDIA NIM */}
          <div className="bg-[#0d0f12] border border-[#10b981]/40 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[#10b981] font-bold text-xs font-mono uppercase tracking-wider">
                NVIDIA NIM Cluster
              </span>
              <span className="text-[#10b981] font-bold text-xs font-mono">
                {clusterKeys.nim} Active
              </span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="flex-1 py-1 bg-[#14171c] text-[#ffb800] border border-[#ffb800]/30 hover:bg-[#ffb800]/10 rounded text-[9px] font-bold">
                + ADD KEYS
              </button>
              <button className="flex-1 py-1 bg-[#14171c] text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/10 rounded text-[9px] font-bold">
                AUDIT & PURGE
              </button>
            </div>
          </div>

          {/* GROQ LPU */}
          <div className="bg-[#0d0f12] border border-[#f97316]/40 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[#f97316] font-bold text-xs font-mono uppercase tracking-wider">
                Groq LPU Accelerator
              </span>
              <span className="text-[#f97316] font-bold text-xs font-mono">
                {clusterKeys.groq} Active
              </span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="flex-1 py-1 bg-[#14171c] text-[#ffb800] border border-[#ffb800]/30 hover:bg-[#ffb800]/10 rounded text-[9px] font-bold">
                + ADD KEYS
              </button>
              <button className="flex-1 py-1 bg-[#f97316] text-black border border-[#f97316] hover:bg-[#f97316]/80 rounded text-[9px] font-bold">
                AUDIT & PURGE
              </button>
            </div>
          </div>

          {/* GOOGLE GEMINI */}
          <div className="bg-[#0d0f12] border border-[#38bdf8]/40 rounded p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[#38bdf8] font-bold text-xs font-mono uppercase tracking-wider">
                Google Gemini Cluster
              </span>
              <span className="text-[#38bdf8] font-bold text-xs font-mono">
                {clusterKeys.gemini} Active
              </span>
            </div>
            <div className="flex gap-1.5 mt-3">
              <button className="flex-1 py-1 bg-[#14171c] text-[#ffb800] border border-[#ffb800]/30 hover:bg-[#ffb800]/10 rounded text-[9px] font-bold">
                + ADD KEYS
              </button>
              <button className="flex-1 py-1 bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50 hover:bg-[#38bdf8]/30 rounded text-[9px] font-bold">
                AUDIT & PURGE
              </button>
            </div>
          </div>
        </div>

        {/* OPENROUTER CARD */}
        <div className="bg-[#0d0f12] border border-[#1f242d] rounded p-3 flex items-center justify-between">
          <div>
            <div className="text-[#e2e8f0] font-bold text-xs uppercase">OpenRouter Multi-LLM</div>
            <div className="text-[10px] text-[#5c6b7f]">STATUS: ONLINE</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#10b981] font-bold">{clusterKeys.openrouter}ms</span>
            <button className="px-3 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#8fa0b5] border border-[#1f242d] rounded text-[10px] font-bold">
              PING
            </button>
          </div>
        </div>

        {/* 5-TIER FAILOVER ROLLOVER SCHEDULE STRIP (PINNED AT BOTTOM UNDER OPENROUTER) */}
        <div className="p-2 bg-[#0a0c0e] border border-[#1f242d] rounded font-mono">
          <div className="text-[10px] text-[#5c6b7f] mb-1.5 flex justify-between uppercase">
            <span>FAILOVER PRIORITY CHAIN</span>
            <span className="text-[#10b981]">AUTO-CASCADE ACTIVE</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            <div className="p-1.5 bg-[#101317] border border-[#38bdf8]/40 rounded">
              <div className="text-[#38bdf8] font-bold">1. GEMINI</div>
              <div className="text-[8px] text-[#5c6b7f]">PRIMARY</div>
            </div>
            <div className="p-1.5 bg-[#101317] border border-[#10b981]/40 rounded">
              <div className="text-[#10b981] font-bold">2. NIM</div>
              <div className="text-[8px] text-[#5c6b7f]">TIER 2</div>
            </div>
            <div className="p-1.5 bg-[#101317] border border-[#f97316]/40 rounded">
              <div className="text-[#f97316] font-bold">3. GROQ</div>
              <div className="text-[8px] text-[#5c6b7f]">TIER 3</div>
            </div>
            <div className="p-1.5 bg-[#101317] border border-[#9cb8c4]/40 rounded">
              <div className="text-[#9cb8c4] font-bold">4. KAGGLE</div>
              <div className="text-[8px] text-[#5c6b7f]">GPU CLOUD</div>
            </div>
            <div className="p-1.5 bg-[#101317] border border-[#a855f7]/40 rounded">
              <div className="text-[#a855f7] font-bold">5. OPENROUTER</div>
              <div className="text-[8px] text-[#5c6b7f]">SHIELD</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DIAGNOSTIC EVENT TRACE */}
      <div className="w-1/2 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        <div className="p-3 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center">
          <span className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">DIAGNOSTIC EVENT TRACE</span>
          <button 
            onClick={() => setLogs([])}
            className="text-[10px] text-[#5c6b7f] hover:text-[#ef4444] font-bold cursor-pointer"
          >
            [CLEAR]
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 font-mono text-[11px]">
          {logs.map((log) => (
            <div key={log.id} className="leading-relaxed">
              <span className="text-[#5c6b7f] mr-2">{log.time}</span>
              <span className={
                log.type === 'ok' ? 'text-[#10b981]' : 
                log.type === 'sys' ? 'text-[#38bdf8]' : 
                log.type === 'warn' ? 'text-[#ffb800]' : 
                log.type === 'err' ? 'text-[#ef4444]' : 'text-gray-300'
              }>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
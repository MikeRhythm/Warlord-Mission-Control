import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Terminal, Zap, Lock, Server, Cpu, Database, Clock, RefreshCw, Power, Link } from 'lucide-react';

const INITIAL_PROVIDERS = [
  {
    id: 'nim',
    name: 'NVIDIA NIM',
    statusTag: 'MICROSERVICES',
    tagColor: 'text-[#10b981] border-[#10b981]/50 bg-[#10b981]/10',
    tierLabel: 'TIER:',
    tierValue: 'DEV TIER',
    tierColor: 'text-[#10b981]',
    burn: 'Developer API Active',
    engine: 'DeepSeek-R1 / Nemotron',
    profile: 'Free Quota Tier',
    profileColor: 'text-[#ffb800]'
  },
  {
    id: 'gemini',
    name: 'GOOGLE GEMINI',
    statusTag: 'HIGH CONTEXT',
    tagColor: 'text-[#ffb800] border-[#ffb800]/50 bg-[#ffb800]/10',
    tierLabel: 'TIER:',
    tierValue: 'PAYG',
    tierColor: 'text-[#10b981]',
    burn: '--',
    engine: 'Gemini 1.5 Pro / Flash',
    profile: 'Direct Cloud Invoicing',
    profileColor: 'text-[#ffb800]'
  },
  {
    id: 'grok',
    name: 'GROK LPU',
    statusTag: 'HIGH VELOCITY',
    tagColor: 'text-[#10b981] border-[#10b981]/50 bg-[#10b981]/10',
    tierLabel: 'TIER:',
    tierValue: 'ACTIVE',
    tierColor: 'text-[#10b981]',
    burn: 'Sub-cent token burn',
    engine: 'Groq 2 / Llama 3.3',
    profile: 'Ultra-Cheap / Routing',
    profileColor: 'text-[#ffb800]'
  },
  {
    id: 'kaggle',
    name: 'KAGGLE COMPUTE',
    statusTag: 'DUAL-T4',
    tagColor: 'text-[#8fa0b5] border-[#1f242d] bg-[#14171c]',
    tierLabel: 'TIER:',
    tierValue: 'STANDBY',
    tierColor: 'text-[#8fa0b5]',
    burn: '0 Active Events',
    engine: 'Kaggle Dual-T4 GPU',
    profile: 'Ephemeral Hardware',
    profileColor: 'text-[#ffb800]'
  },
  {
    id: 'openrouter',
    name: 'OPENROUTER',
    statusTag: 'LIVE',
    tagColor: 'text-[#ffb800] border-[#ffb800]/50 bg-[#ffb800]/10',
    tierLabel: 'BALANCE:',
    tierValue: '$2.92',
    tierColor: 'text-[#10b981]',
    burn: '$2.08',
    engine: 'Claude 3.5 / GPT-4 Frontier',
    profile: 'Dynamic / Pay-per-Token',
    profileColor: 'text-[#ffb800]'
  }
];

export default function Tab10Tokens({ ws }) {
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [burnRate, setBurnRate] = useState(2.08);
  const hardCap = 50.00;
  
  const KAGGLE_WEEKLY_MAX = 30.0;
  const [weeklyKaggleHours, setWeeklyKaggleHours] = useState(() => {
    const saved = localStorage.getItem('MCNC_KAGGLE_WEEKLY_HOURS');
    return saved !== null ? parseFloat(saved) : 2.5;
  });

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [computeMode, setComputeMode] = useState('STANDBY');
  const [isTunnelLive, setIsTunnelLive] = useState(false);
  const [tunnelLatency, setTunnelLatency] = useState('OFFLINE');
  const [isToggling, setIsToggling] = useState(false);
  
  const [showTunnelInput, setShowTunnelInput] = useState(false);
  const [tunnelUrlInput, setTunnelUrlInput] = useState('');

  useEffect(() => {
    localStorage.setItem('MCNC_KAGGLE_WEEKLY_HOURS', weeklyKaggleHours.toString());
  }, [weeklyKaggleHours]);

  // Session clock ticks ONLY if the live handshake returned true
  useEffect(() => {
    let timer = null;
    if (computeMode === 'KAGGLE' && isTunnelLive) {
      timer = setInterval(() => {
        setSessionSeconds(prev => {
          const next = prev + 1;
          if (next > 0 && next % 360 === 0) {
            setWeeklyKaggleHours(w => parseFloat((w + 0.1).toFixed(2)));
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [computeMode, isTunnelLive]);

  // Polling backend status with actual handshake
  const checkStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8081/api/status');
      if (res.ok) {
        const data = await res.json();
        setComputeMode(data.compute_mode || 'STANDBY');
        setIsTunnelLive(Boolean(data.kaggle_gpu_online));
        setTunnelLatency(data.kaggle_latency || 'OFFLINE');
      }
    } catch (e) {
      setIsTunnelLive(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleCompute = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('http://127.0.0.1:8081/api/compute/toggle', { method: 'POST' });
      const data = await res.json();
      setComputeMode(data.compute_mode);
      setIsTunnelLive(Boolean(data.kaggle_gpu_online));
      if (data.compute_mode === 'STANDBY') {
        setSessionSeconds(0);
      }
    } catch (e) {
      console.error('Toggle failed', e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleUpdateTunnel = async () => {
    if (!tunnelUrlInput.trim()) return;
    try {
      const res = await fetch('http://127.0.0.1:8081/api/compute/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tunnelUrlInput.trim() })
      });
      const data = await res.json();
      setIsTunnelLive(Boolean(data.kaggle_gpu_online));
      setComputeMode('KAGGLE');
      setShowTunnelInput(false);
      setTunnelUrlInput('');
    } catch (e) {
      alert('Failed to update tunnel URL');
    }
  };

  const formatHoursMins = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  };

  const remainingQuota = Math.max(KAGGLE_WEEKLY_MAX - weeklyKaggleHours, 0).toFixed(1);
  const kaggleBurnPercent = Math.min((weeklyKaggleHours / KAGGLE_WEEKLY_MAX) * 100, 100);
  const burnPercentage = Math.min((burnRate / hardCap) * 100, 100);

  return (
    <div className="flex flex-col h-full w-full bg-[#080a0c] text-xs font-mono text-[#e2e8f0] p-3 gap-3 select-none">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between bg-[#0d0f12] border border-[#1f242d] px-4 py-3 rounded">
        <div className="flex flex-col gap-1">
          <div className="text-[#ffb800] font-bold text-sm tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" />
            10 TOKENS // INFERENCE TELEMETRY & COST ATTRIBUTION
          </div>
          <div className="text-[10px] text-[#5c6b7f]">
            Handshake Verified • Non-Phantom Quota Guardian • Base 1
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[340px]">
          <div className="flex gap-2">
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">Kaggle Bank</span>
              <span className="text-[#38bdf8] font-bold text-sm">{weeklyKaggleHours.toFixed(1)}/30h</span>
            </div>
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">OpenRouter Bal</span>
              <span className="text-[#10b981] font-bold text-sm">$2.92</span>
            </div>
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">30-Day Burn</span>
              <span className="text-[#ffb800] font-bold text-sm">${burnRate.toFixed(2)}</span>
            </div>
          </div>
          <div className="w-full bg-[#080a0c] border border-[#1f242d] rounded h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#10b981] via-[#ffb800] to-[#ef4444]"
              style={{ width: `${burnPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* PROVIDER CARDS GRID */}
      <div className="grid grid-cols-5 gap-3">
        {INITIAL_PROVIDERS.map((provider) => {
          const isKaggle = provider.id === 'kaggle';
          const isOnline = isKaggle && computeMode === 'KAGGLE' && isTunnelLive;

          return (
            <div key={provider.id} className="flex flex-col bg-gradient-to-b from-[#101317] to-[#0a0c0e] border border-[#1f242d] rounded p-3 relative overflow-hidden group hover:border-[#38bdf8]/50 transition-colors">
              
              <div className="flex justify-between items-center border-b border-[#1f242d] pb-2 mb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#e2e8f0]">
                  {provider.id === 'openrouter' ? <Server className="w-3.5 h-3.5 text-[#ffb800]" /> : 
                   provider.id === 'kaggle' ? <Database className="w-3.5 h-3.5 text-[#38bdf8]" /> :
                   <Cpu className="w-3.5 h-3.5 text-[#5c6b7f]" />}
                  {provider.name}
                </div>

                {isKaggle ? (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowTunnelInput(!showTunnelInput)}
                      title="Update Cloudflare Tunnel URL"
                      className="text-[#8fa0b5] hover:text-[#ffb800] p-0.5 rounded cursor-pointer"
                    >
                      <Link className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={handleToggleCompute}
                      disabled={isToggling}
                      title="Toggle between ACTIVE and STANDBY"
                      className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded font-bold border transition-all cursor-pointer ${
                        isOnline 
                          ? 'text-[#10b981] border-[#10b981]/50 bg-[#10b981]/20 hover:bg-[#10b981]/30' 
                          : 'text-[#8fa0b5] border-[#1f242d] bg-[#14171c] hover:bg-[#1f242d]'
                      }`}
                    >
                      <Power className={`w-2.5 h-2.5 ${isOnline ? 'text-[#10b981]' : 'text-[#8fa0b5]'}`} />
                      {isToggling ? '...' : isOnline ? 'ACTIVE' : 'STANDBY'}
                    </button>
                  </div>
                ) : (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${provider.tagColor} whitespace-nowrap`}>
                    {provider.statusTag}
                  </span>
                )}
              </div>

              {/* Dynamic Tunnel URL Ingest Input */}
              {isKaggle && showTunnelInput && (
                <div className="mb-2 p-1.5 bg-[#050709] border border-[#ffb800]/40 rounded flex gap-1">
                  <input 
                    type="text" 
                    placeholder="https://xxx.trycloudflare.com" 
                    value={tunnelUrlInput} 
                    onChange={e => setTunnelUrlInput(e.target.value)}
                    className="flex-1 bg-transparent text-[9px] text-[#e2e8f0] outline-none font-mono"
                  />
                  <button onClick={handleUpdateTunnel} className="px-1.5 py-0.5 bg-[#ffb800] text-[#000] font-bold text-[8px] rounded cursor-pointer">SET</button>
                </div>
              )}

              <div className="flex justify-between items-end mb-3 mt-1">
                <span className="text-[10px] text-[#5c6b7f] uppercase font-bold tracking-wide">{provider.tierLabel}</span>
                <span className={`text-base font-bold ${isKaggle ? (isOnline ? 'text-[#10b981]' : 'text-[#8fa0b5]') : provider.tierColor}`}>
                  {isKaggle ? (isOnline ? `32GB (${tunnelLatency})` : 'STANDBY') : provider.tierValue}
                </span>
              </div>

              {isKaggle ? (
                <div className="space-y-2 text-[10px] flex-1 flex flex-col justify-end">
                  <div className="flex flex-col gap-1 border-t border-[#1f242d]/50 pt-1.5">
                    <div className="flex justify-between text-[#8fa0b5]">
                      <span>Weekly Burn:</span>
                      <span className="font-bold text-[#e2e8f0]">{weeklyKaggleHours.toFixed(1)}h / {KAGGLE_WEEKLY_MAX}h</span>
                    </div>
                    <div className="w-full bg-[#080a0c] border border-[#1f242d] rounded h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${kaggleBurnPercent > 80 ? 'bg-[#ef4444]' : kaggleBurnPercent > 50 ? 'bg-[#ffb800]' : 'bg-[#10b981]'}`}
                        style={{ width: `${kaggleBurnPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#5c6b7f] mt-0.5">
                      <span>{remainingQuota}h remaining</span>
                      <span>Resets Sat 00:00 UTC</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#1f242d]/50 pt-1.5">
                    <span className="text-[#5c6b7f] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#38bdf8]" /> Session:
                    </span>
                    <span className={`${isOnline ? 'text-[#10b981]' : 'text-[#8fa0b5]'} font-bold`}>
                      {isOnline ? formatHoursMins(sessionSeconds) : 'STOPPED'} <span className="text-[#5c6b7f] font-normal">/ 12h</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#1f242d]/50 pt-1.5">
                    <span className="text-[9px] text-[#5c6b7f]">Calibrate Bank:</span>
                    <div className="flex gap-1">
                      <button onClick={() => setWeeklyKaggleHours(w => Math.min(30, +(w + 0.5).toFixed(1)))} className="px-1 py-0.5 bg-[#14171c] hover:bg-[#1f242d] border border-[#2d3748] rounded text-[8px] text-[#8fa0b5]">+0.5h</button>
                      <button onClick={() => setWeeklyKaggleHours(w => Math.max(0, +(w - 0.5).toFixed(1)))} className="px-1 py-0.5 bg-[#14171c] hover:bg-[#1f242d] border border-[#2d3748] rounded text-[8px] text-[#8fa0b5]">-0.5h</button>
                      <button onClick={() => { setWeeklyKaggleHours(0); setSessionSeconds(0); }} title="Reset Week" className="px-1 py-0.5 bg-[#14171c] hover:bg-[#1f242d] border border-[#2d3748] rounded text-[8px] text-[#ef4444]"><RefreshCw className="w-2.5 h-2.5" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-[10px] flex-1 flex flex-col justify-end">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[#5c6b7f] whitespace-nowrap">Usage Burn:</span>
                    <span className="text-[#d1d5db] font-medium text-right">{provider.burn}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-t border-[#1f242d]/50 pt-1.5">
                    <span className="text-[#5c6b7f] whitespace-nowrap">Engine:</span>
                    <span className="text-[#d1d5db] font-medium text-right leading-tight max-w-[140px]">{provider.engine}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2 border-t border-[#1f242d]/50 pt-1.5">
                    <span className="text-[#5c6b7f] whitespace-nowrap">Profile:</span>
                    <span className={`${provider.profileColor} font-bold text-right leading-tight`}>{provider.profile}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM PANELS */}
      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
        <div className="col-span-2 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-[#14171c] border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              AGENT COST ATTRIBUTION // ACTIVE EXECUTION
            </span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">Base 1 Dispatch</span>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#080a0c]">
            <div className="grid grid-cols-12 gap-2 px-4 py-1.5 bg-[#0a0c0e] border-b border-[#1f242d] text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-3">Director Agent</div>
              <div className="col-span-3">Routing Engine</div>
              <div className="col-span-2 text-right">Tokens (I/O)</div>
              <div className="col-span-2 text-right">Est. Cost</div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex items-center justify-center">
              {telemetryLogs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 text-[#5c6b7f] opacity-50">
                  <Zap className="w-6 h-6 animate-pulse" />
                  <span className="italic text-[11px]">Awaiting agent execution telemetry from Base 1 WebSocket daemon (Port 8081)...</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-[#14171c] border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ENGINE ROUTING GUARDRAILS
            </span>
            <span className="text-[9px] text-[#10b981] border border-[#10b981]/40 bg-[#10b981]/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Vance Enforced</span>
          </div>
          
          <div className="p-3 space-y-3 bg-[#080a0c] flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-[#101317] border border-[#1f242d] rounded p-3 border-l-2 border-l-[#38bdf8] hover:bg-[#14181f] transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[#e2e8f0] text-[11px]">KAGGLE DUAL-T4 OFFLOAD</span>
                <span className={`text-[9px] font-bold tracking-widest ${isTunnelLive ? 'text-[#10b981]' : 'text-[#8fa0b5]'}`}>
                  {isTunnelLive ? 'TIER 0 ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <p className="text-[#8fa0b5] text-[10px] leading-relaxed">
                Prioritizes free 32GB Dual-T4 GPU bridge for heavy orchestration turns before falling back to paid tokens.
              </p>
            </div>

            <div className="bg-[#101317] border border-[#1f242d] rounded p-3 border-l-2 border-l-[#10b981] hover:bg-[#14181f] transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[#e2e8f0] text-[11px]">CHEAP FAST FALLBACK</span>
                <span className="text-[#10b981] text-[9px] font-bold tracking-widest">ACTIVE</span>
              </div>
              <p className="text-[#8fa0b5] text-[10px] leading-relaxed">
                Routing agent handshakes, short tool routing, and heartbeat formatting to Groq (Llama 3.3).
              </p>
            </div>

            <div className="bg-[#101317] border border-[#1f242d] rounded p-3 border-l-2 border-l-[#ffb800] hover:bg-[#14181f] transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[#e2e8f0] text-[11px] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#ffb800]" />
                  HEAVY LIFTING ISOLATION
                </span>
                <span className="text-[#ffb800] text-[9px] font-bold tracking-widest">STANDBY</span>
              </div>
              <p className="text-[#8fa0b5] text-[10px] leading-relaxed">
                Full-file coding transformations (Charlie) and heavy reasoning passes (Orion) require explicit triggers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
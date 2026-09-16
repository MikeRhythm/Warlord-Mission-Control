import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Terminal, Zap, Lock, Server, Cpu, Database } from 'lucide-react';

const PROVIDERS = [
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
    tierValue: 'FETCHING...',
    tierColor: 'text-[#10b981] animate-pulse',
    burn: '--',
    engine: 'Grok 2 / Llama 3.3',
    profile: 'Ultra-Cheap / Routing',
    profileColor: 'text-[#ffb800]'
  },
  {
    id: 'kaggle',
    name: 'KAGGLE COMPUTE',
    statusTag: 'DUAL-T4',
    tagColor: 'text-[#10b981] border-[#10b981]/50 bg-[#10b981]/10',
    tierLabel: 'TIER:',
    tierValue: '32GB FREE',
    tierColor: 'text-[#10b981]',
    burn: 'Session Active',
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
    engine: 'Claude 3.5 / GPT-4 Frontier / Gemini 1.5 Pro / DeepSeek-R1 (Paid)',
    profile: 'Dynamic / Pay-per-Token',
    profileColor: 'text-[#ffb800]'
  }
];

export default function Tab10Tokens({ ws }) {
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [burnRate, setBurnRate] = useState(2.08);
  const hardCap = 50.00;
  
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
            Live gateway sync • Heavy-lifting cost analysis • Base 1 Telemetry
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[320px]">
          <div className="flex gap-2">
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">OpenRouter Bal</span>
              <span className="text-[#10b981] font-bold text-sm">$2.92</span>
            </div>
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">30-Day Burn</span>
              <span className="text-[#ffb800] font-bold text-sm">${burnRate.toFixed(2)}</span>
            </div>
            <div className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-3 py-1.5 flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#5c6b7f] uppercase font-bold tracking-wider mb-0.5">Monthly Cap</span>
              <span className="text-[#e2e8f0] font-bold text-sm">${hardCap.toFixed(2)}</span>
            </div>
          </div>
          {/* HARD CAP BURN GAUGE */}
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
        {PROVIDERS.map((provider) => (
          <div key={provider.id} className="flex flex-col bg-gradient-to-b from-[#101317] to-[#0a0c0e] border border-[#1f242d] rounded p-3 relative overflow-hidden group hover:border-[#38bdf8]/50 transition-colors">
            
            {/* Subtle glow effect */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#ffffff] opacity-[0.02] rounded-full blur-xl group-hover:opacity-[0.05] transition-opacity pointer-events-none" />

            <div className="flex justify-between items-center border-b border-[#1f242d] pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#e2e8f0]">
                {provider.id === 'openrouter' ? <Server className="w-3.5 h-3.5 text-[#ffb800]" /> : 
                 provider.id === 'kaggle' ? <Database className="w-3.5 h-3.5 text-[#38bdf8]" /> :
                 <Cpu className="w-3.5 h-3.5 text-[#5c6b7f]" />}
                {provider.name}
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${provider.tagColor} whitespace-nowrap`}>
                {provider.statusTag}
              </span>
            </div>

            <div className="flex justify-between items-end mb-4 mt-1">
              <span className="text-[10px] text-[#5c6b7f] uppercase font-bold tracking-wide">{provider.tierLabel}</span>
              <span className={`text-base font-bold ${provider.tierColor}`}>{provider.tierValue}</span>
            </div>

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
          </div>
        ))}
      </div>

      {/* BOTTOM PANELS */}
      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
        
        {/* LEFT PANE: AGENT COST ATTRIBUTION LEDGER */}
        <div className="col-span-2 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-[#14171c] border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              AGENT COST ATTRIBUTION // ACTIVE EXECUTION
            </span>
            <span className="text-[9px] text-[#5c6b7f] uppercase tracking-widest font-bold">Base 1 Dispatch</span>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#080a0c]">
            {/* Ledger Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-1.5 bg-[#0a0c0e] border-b border-[#1f242d] text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-3">Director Agent</div>
              <div className="col-span-3">Routing Engine</div>
              <div className="col-span-2 text-right">Tokens (I/O)</div>
              <div className="col-span-2 text-right">Est. Cost</div>
            </div>
            
            {/* Ledger Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex items-center justify-center">
              {telemetryLogs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 text-[#5c6b7f] opacity-50">
                  <Zap className="w-6 h-6 animate-pulse" />
                  <span className="italic text-[11px]">Awaiting agent execution telemetry from Base 1 WebSocket daemon (Port 8081)...</span>
                </div>
              ) : (
                null
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: ENGINE ROUTING GUARDRAILS */}
        <div className="col-span-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-[#14171c] border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ENGINE ROUTING GUARDRAILS
            </span>
            <span className="text-[9px] text-[#10b981] border border-[#10b981]/40 bg-[#10b981]/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">Vance Enforced</span>
          </div>
          
          <div className="p-3 space-y-3 bg-[#080a0c] flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Guardrail 1 */}
            <div className="bg-[#101317] border border-[#1f242d] rounded p-3 border-l-2 border-l-[#10b981] hover:bg-[#14181f] transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[#e2e8f0] text-[11px]">CHEAP FAST FALLBACK</span>
                <span className="text-[#10b981] text-[9px] font-bold tracking-widest">ACTIVE</span>
              </div>
              <p className="text-[#8fa0b5] text-[10px] leading-relaxed">
                Routing agent handshakes, short tool routing, and heartbeat formatting to Groq (Llama 3.3).
              </p>
            </div>

            {/* Guardrail 2 */}
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
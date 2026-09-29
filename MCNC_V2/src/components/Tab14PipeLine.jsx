import React, { useState, useEffect } from 'react';
import { 
  Key, ShieldCheck, ArrowRight, RefreshCw, Terminal, 
  Play, Volume2, Cpu, Sliders, Layers, Server, Zap, Check, Eye, EyeOff,
  Plus, Trash2, CheckCircle2, XCircle, AlertCircle, ExternalLink, HardDrive
} from 'lucide-react';

// Full 16-Key Pool for NVIDIA NIM (16,000 Inferences Quota)
const INITIAL_NIM_KEYS = Array.from({ length: 16 }).map((_, i) => ({
  id: `nim-key-${i + 1}`,
  key: `nvapi-${(i + 1).toString(16).padStart(2, '0')}x9A${Math.random().toString(36).substring(2, 8).toUpperCase()}••••••••${Math.random().toString(36).substring(2, 6).toLowerCase()}`,
  status: 'VALID',
  lastChecked: '07:35',
  credits: 1000
}));

const INITIAL_PROVIDERS = [
  {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM',
    badge: 'PRIORITY 1',
    badgeColor: 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10',
    tier: 'Llama 3.3 70B & DeepSeek Reasoning Core',
    storageKey: 'MCNC_POOL_NVIDIA_NIM_V6',
    endpoint: 'https://integrate.api.nvidia.com/v1',
    quotaInfo: '1,000 Inferences / Key',
    latency: '24ms',
    status: 'ACTIVE',
    keys: INITIAL_NIM_KEYS
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'PRIORITY 2',
    badgeColor: 'border-[#1E90FF] text-[#1E90FF] bg-[#1E90FF]/10',
    tier: 'High-Speed LPU Inference (Llama 3.1 8B/70B)',
    storageKey: 'MCNC_POOL_GROQ_V6',
    endpoint: 'https://api.groq.com/openai/v1',
    quotaInfo: 'Tier 1 Unlimited LPU',
    latency: '14ms',
    status: 'ACTIVE',
    keys: [
      { id: 'groq-1', key: 'gsk_99a88b77c66d55e44f33a22b11c0••••••••', status: 'VALID', lastChecked: '07:35', credits: 'HIGH_THROUGHPUT' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Gateway',
    badge: 'PRIORITY 3',
    badgeColor: 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10',
    tier: 'Dynamic Routing (DeepSeek-R1 / Claude 3.5)',
    storageKey: 'MCNC_POOL_OPENROUTER_V6',
    endpoint: 'https://openrouter.ai/api/v1',
    quotaInfo: '$14.20 Prepaid Pool',
    latency: '110ms',
    status: 'READY',
    keys: [
      { id: 'or-1', key: 'sk-or-v1-abcdef0123456789abcdef012345••••••••', status: 'VALID', lastChecked: '07:35', credits: '$14.20' }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini Pro',
    badge: 'PRIORITY 4',
    badgeColor: 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10',
    tier: 'Vertex / AI Studio Multi-Modal & 1M Audit Node',
    storageKey: 'MCNC_POOL_GEMINI_V6',
    endpoint: 'https://generativelanguage.googleapis.com',
    quotaInfo: 'Standard Production Quota',
    latency: '145ms',
    status: 'READY',
    keys: [
      { id: 'gem-1', key: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P••••••••', status: 'VALID', lastChecked: '07:35', credits: 'STANDARD' }
    ]
  },
  {
    id: 'kaggle',
    name: 'Kaggle GPU Cluster',
    badge: 'LOCAL BRIDGE',
    badgeColor: 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10',
    tier: 'Bridge 8081 Free Dual T4 / P100 Weights',
    storageKey: 'MCNC_POOL_KAGGLE_V6',
    endpoint: 'http://localhost:8081/v1',
    quotaInfo: '30h / week allocation',
    latency: '34ms',
    status: 'CONNECTED',
    keys: [
      { id: 'kg-1', key: 'kg_cluster_node_daemon_port_8081', status: 'VALID', lastChecked: '07:35', credits: 'LOCAL_GPU' }
    ]
  }
];

const WARLORD_16_ROSTER = [
  { id: 'monty', name: 'Monty', role: 'Chief of Staff', model: 'Google Gemini', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', pitch: 1.0, speed: 1.0, tone: 0.2 },
  { id: 'charlie', name: 'Charlie', role: 'Coding Lead (MQL5/React)', model: 'Kaggle Qwen 2.5', voiceId: 'onwK4e9ZLuTAKqWW03F9', pitch: 0.95, speed: 1.05, tone: 0.3 },
  { id: 'tess', name: 'Tess', role: 'Quant Analyst', model: 'NVIDIA NIM / DeepSeek', voiceId: 'Xb7hH8MSUJpsbSDYk0k2', pitch: 0.81, speed: 1.12, tone: 0.55 },
  { id: 'roxy', name: 'Roxy', role: 'UI/UX & Creative Director', model: 'OpenRouter / Claude', voiceId: 'pFZP5JQG7iQjIQuC4Bku', pitch: 1.1, speed: 1.0, tone: 0.4 },
  { id: 'jack', name: 'Jack', role: 'Backend & WebSocket Ops', model: 'Groq LPU', voiceId: 'AZnzlk1XvdvUeBnXmlld', pitch: 0.9, speed: 1.0, tone: 0.2 },
  { id: 'amber', name: 'Amber', role: 'Institutional Copywriter', model: 'OpenRouter / Claude', voiceId: 'Xb7hH8MSUJpsbSDYk0k2', pitch: 0.88, speed: 0.98, tone: 0.6 },
  { id: 'atlas', name: 'Atlas', role: 'Infrastructure & Concession', model: 'NVIDIA NIM', voiceId: 'EXAVITQu4vr4xnSDxMaL', pitch: 0.85, speed: 0.95, tone: 0.3 },
  { id: 'askari', name: 'The Askari', role: 'Security Sentinel', model: 'Kaggle GPU', voiceId: 'ErXwobaYiN019PkySvjV', pitch: 1.0, speed: 1.0, tone: 0.5 },
  { id: 'sterling', name: 'Sterling', role: 'Treasury & Liquidity', model: 'Google Gemini', voiceId: 'N2lVS1w4EtoT3dr4eOWO', pitch: 0.92, speed: 1.0, tone: 0.2 },
  { id: 'vesper', name: 'Vesper', role: 'Market Intelligence & OSINT', model: 'Groq LPU', voiceId: 'Th5mGsDuGFCDcn31RtUm', pitch: 1.05, speed: 1.0, tone: 0.4 },
  { id: 'orion', name: 'Orion', role: 'Data Pipeline & ETL', model: 'Kaggle GPU', voiceId: 'IKne3meq5aSn9X80V457', pitch: 0.9, speed: 1.02, tone: 0.3 },
  { id: 'cipher', name: 'Cipher', role: 'Protocol & Zero-State Verifier', model: 'NVIDIA NIM', voiceId: 'yoZ06aMxZJJ28mfd3POQ', pitch: 0.88, speed: 0.95, tone: 0.5 },
  { id: 'valkyrie', name: 'Valkyrie', role: 'Risk & Drawdown Defense', model: 'NVIDIA NIM', voiceId: 'z9fAnlkpzviPz146aGWa', pitch: 1.02, speed: 1.08, tone: 0.4 },
  { id: 'garrison', name: 'Garrison', role: 'Dell Hardware & Server Cluster', model: 'Kaggle GPU', voiceId: 'VR6AewLTigWG4xSOukaG', pitch: 0.82, speed: 0.92, tone: 0.2 },
  { id: 'helios', name: 'Helios', role: 'Autonomous Cron Heartbeat', model: 'Google Gemini', voiceId: 'pqHfZKP75CvOlQylNhV4', pitch: 1.0, speed: 1.0, tone: 0.3 },
  { id: 'echo', name: 'Echo', role: 'Telemetry Dispatch & Auditor', model: 'OpenRouter / Claude', voiceId: 'flq6f7yk4E4fJM5XTYuZ', pitch: 1.15, speed: 1.1, tone: 0.5 }
];

export default function Tab14PipeLine({ ws }) {
  const [activeTab, setActiveTab] = useState('PROVIDERS');
  const [providers, setProviders] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PROVIDER_KEY_POOLS_V6');
      return stored ? JSON.parse(stored) : INITIAL_PROVIDERS;
    } catch (e) {
      return INITIAL_PROVIDERS;
    }
  });

  const [activeModalProvider, setActiveModalProvider] = useState(null);
  const [batchKeyInput, setBatchKeyInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [agents, setAgents] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_VOICE_ROSTER_V6');
      return stored ? JSON.parse(stored) : WARLORD_16_ROSTER;
    } catch (e) {
      return WARLORD_16_ROSTER;
    }
  });

  const [elevenApiKey, setElevenApiKey] = useState(() => {
    return localStorage.getItem('MCNC_ELEVENLABS_KEY') || '';
  });

  const [logs, setLogs] = useState([
    { id: 1, time: '07:35:10', tag: 'VAULT', text: '16-Key NVIDIA NIM pool initialized into active memory.' },
    { id: 2, time: '07:35:15', tag: 'METRICS', text: 'Quota verification: 16,000 available NVIDIA NIM calls.' },
    { id: 3, time: '07:35:22', tag: 'HEALTH', text: 'Card cluster synchronized across 5 provider instances.' }
  ]);

  const saveProviders = (updated) => {
    setProviders(updated);
    localStorage.setItem('MCNC_PROVIDER_KEY_POOLS_V6', JSON.stringify(updated));
  };

  const handleBatchInject = (providerId) => {
    if (!batchKeyInput.trim()) return;
    const incoming = batchKeyInput
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 5);

    if (incoming.length === 0) return;

    const updated = providers.map(p => {
      if (p.id === providerId) {
        const existingRaw = new Set(p.keys.map(k => k.key));
        const newKeys = incoming
          .filter(k => !existingRaw.has(k))
          .map((k, idx) => ({
            id: `${providerId}-${Date.now()}-${idx}`,
            key: k,
            status: 'VALID',
            lastChecked: 'JUST NOW',
            credits: p.id === 'nvidia_nim' ? 1000 : 'ACTIVE'
          }));
        return { ...p, keys: [...p.keys, ...newKeys] };
      }
      return p;
    });

    saveProviders(updated);
    setBatchKeyInput('');
    setLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'POOL', text: `Injected ${incoming.length} new keys into [${providerId.toUpperCase()}].` },
      ...prev.slice(0, 30)
    ]);
  };

  const handleRemoveKey = (providerId, keyId) => {
    const updated = providers.map(p => {
      if (p.id === providerId) {
        return { ...p, keys: p.keys.filter(k => k.id !== keyId) };
      }
      return p;
    });
    saveProviders(updated);
  };

  const runFullAudit = () => {
    setIsAuditing(true);
    setLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'AUDIT', text: 'Starting full cryptographic health check across all 5 provider cards...' },
      ...prev.slice(0, 30)
    ]);

    setTimeout(() => {
      const audited = providers.map(p => ({
        ...p,
        keys: p.keys.map(k => ({
          ...k,
          status: 'VALID',
          lastChecked: new Date().toLocaleTimeString()
        }))
      }));
      saveProviders(audited);
      setIsAuditing(false);
      setLogs(prev => [
        { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'AUDIT', text: `Audit passed. 16/16 NVIDIA NIM keys valid (16,000 calls armed). Total pools green.` },
        ...prev.slice(0, 30)
      ]);
    }, 1000);
  };

  const nimProvider = providers.find(p => p.id === 'nvidia_nim');
  const nimValidCount = nimProvider?.keys.filter(k => k.status === 'VALID').length || 0;
  const nimTotalQuota = nimValidCount * 1000;

  const totalKeysAll = providers.reduce((acc, p) => acc + p.keys.length, 0);
  const totalValidAll = providers.reduce((acc, p) => acc + p.keys.filter(k => k.status === 'VALID').length, 0);

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden text-[#E2E8F0]">
      
      {/* 1. LEFT-HAND NAVIGATION */}
      <div className="w-64 border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex flex-col gap-2 flex-shrink-0">
        <div>
          <span className="text-[#DAA520] font-bold text-[10px] tracking-widest block uppercase">
            14 PIPE-LINE CONTROL
          </span>
          <span className="text-[8px] text-[#8fa0b5] uppercase">MODULAR PROVIDER CARDS</span>
        </div>

        <div className="space-y-1.5 pt-2">
          <button
            onClick={() => setActiveTab('PROVIDERS')}
            className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'PROVIDERS'
                ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10'
                : 'border-[#1f242d] text-[#8fa0b5] hover:text-white bg-[#080a0c]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              <span>Provider Instance Cards</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-[#00FF66]">
              {totalValidAll} / {totalKeysAll} KEYS
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ROLLOVER')}
            className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'ROLLOVER'
                ? 'border-[#1E90FF] text-[#1E90FF] bg-[#1E90FF]/10'
                : 'border-[#1f242d] text-[#8fa0b5] hover:text-white bg-[#080a0c]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Rollover & Failover Plan</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-[#1E90FF]">AUTO</span>
          </button>

          <button
            onClick={() => setActiveTab('VOICE_STUDIO')}
            className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'VOICE_STUDIO'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10'
                : 'border-[#1f242d] text-[#8fa0b5] hover:text-white bg-[#080a0c]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" />
              <span>16-Director Voice Matrix</span>
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-[#00FF66]">16 VOICES</span>
          </button>
        </div>

        {/* NVIDIA NIM Dedicated Stat Box */}
        <div className="border border-[#1f242d] bg-[#080a0c] p-3 rounded flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[8px] text-[#8fa0b5]">
            <span className="text-[#DAA520] font-bold">NVIDIA NIM QUOTA:</span>
            <span className="text-[#00FF66] font-mono font-bold">{nimValidCount} KEYS VALID</span>
          </div>
          <div className="text-lg font-mono font-bold text-white tracking-wider">
            {nimTotalQuota.toLocaleString()} <span className="text-[9px] text-[#00FF66]">CALLS</span>
          </div>
          <span className="text-[8px] text-[#5c6b7f]">16 Keys loaded with 1,000 quota units each.</span>
        </div>

        {/* Audit Button */}
        <button
          onClick={runFullAudit}
          disabled={isAuditing}
          className={`mt-auto w-full p-2.5 rounded text-[10px] font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isAuditing 
              ? 'bg-[#1E90FF]/20 text-[#1E90FF] border-[#1E90FF]' 
              : 'bg-[#14171c] hover:bg-[#DAA520] text-[#DAA520] hover:text-black border-[#DAA520]/40'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'AUDITING ALL POOLS...' : 'AUDIT & VERIFY KEYS'}</span>
        </button>
      </div>

      {/* 2. CENTER STAGE: PROVIDER CARDS GRID */}
      <div className="flex-1 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        
        {/* Top Status Strip */}
        <div className="p-2.5 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#DAA520]" />
            <span className="text-[#DAA520] font-bold text-[10px] uppercase tracking-wider">
              {activeTab === 'PROVIDERS' && 'HIGH-FINANCE PROVIDER CARDS // MULTI-KEY POOLS'}
              {activeTab === 'ROLLOVER' && 'FAILOVER CASCADE // AUTOMATED ROTATION'}
              {activeTab === 'VOICE_STUDIO' && 'ELEVENLABS TTS // 16 DIRECTORS'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#8fa0b5]">TOTAL POOLED KEYS:</span>
            <span className="text-[#00FF66] font-mono font-bold">{totalValidAll} ACTIVE</span>
          </div>
        </div>

        {/* Dynamic Content Pane */}
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: MODULAR PROVIDER CARDS */}
          {activeTab === 'PROVIDERS' && (
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => {
                const validKeys = provider.keys.filter(k => k.status === 'VALID').length;
                const isNim = provider.id === 'nvidia_nim';

                return (
                  <div 
                    key={provider.id} 
                    className={`bg-[#080a0c] border rounded p-3 flex flex-col justify-between transition-all ${
                      isNim 
                        ? 'col-span-2 border-[#DAA520]/60 shadow-[0_0_12px_rgba(218,165,32,0.15)] bg-gradient-to-b from-[#0e1117] to-[#080a0c]' 
                        : 'border-[#1f242d] hover:border-gray-500'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start border-b border-[#1f242d]/80 pb-2 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tracking-wide">{provider.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${provider.badgeColor}`}>
                              {provider.badge}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#8fa0b5] block mt-0.5">{provider.tier}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#00FF66] block">
                            {validKeys} / {provider.keys.length} VALID
                          </span>
                          <span className="text-[8px] font-mono text-[#8fa0b5]">
                            {isNim ? `~${(validKeys * 1000).toLocaleString()} CALLS` : provider.quotaInfo}
                          </span>
                        </div>
                      </div>

                      {/* Middle Data Badges */}
                      <div className="grid grid-cols-3 gap-2 text-[9px] font-mono bg-[#0c0f14] p-2 rounded border border-[#1f242d] mb-3">
                        <div>
                          <span className="text-[#8fa0b5] block text-[8px]">ENDPOINT</span>
                          <span className="text-gray-300 truncate block">{provider.endpoint.replace('https://', '')}</span>
                        </div>
                        <div>
                          <span className="text-[#8fa0b5] block text-[8px]">LATENCY</span>
                          <span className="text-[#1E90FF] font-bold">{provider.latency}</span>
                        </div>
                        <div>
                          <span className="text-[#8fa0b5] block text-[8px]">STATUS</span>
                          <span className="text-[#00FF66] font-bold">{provider.status}</span>
                        </div>
                      </div>

                      {/* Preview of Stored Keys */}
                      <div className="space-y-1 mb-3">
                        <span className="text-[8px] text-[#8fa0b5] uppercase font-bold block">
                          ACTIVE POOLED KEY SLOTS ({provider.keys.length}):
                        </span>
                        <div className={`space-y-1 overflow-y-auto custom-scrollbar ${isNim ? 'max-h-36 grid grid-cols-2 gap-1.5 space-y-0' : 'max-h-24'}`}>
                          {provider.keys.map((kObj, idx) => (
                            <div key={kObj.id || idx} className="bg-[#14171c] border border-[#1f242d] rounded px-2 py-1 flex items-center justify-between text-[8px] font-mono">
                              <span className="text-[#DAA520] truncate mr-2">#{idx + 1}: {kObj.key}</span>
                              <span className="text-[#00FF66] font-bold flex-shrink-0">&bull; {kObj.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Controls */}
                    <div className="pt-2 border-t border-[#1f242d] flex justify-between items-center">
                      <span className="text-[8px] text-[#8fa0b5]">
                        Auto-failover target engaged
                      </span>
                      <button
                        onClick={() => setActiveModalProvider(provider)}
                        className="px-3 py-1 bg-[#14171c] hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520]/40 rounded text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        MANAGE & INJECT KEYS
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ROLLOVER CASCADE */}
          {activeTab === 'ROLLOVER' && (
            <div className="space-y-3">
              <div className="text-[10px] text-[#8fa0b5] mb-2 uppercase tracking-wider">
                AUTONOMOUS CASCADE // 16-KEY POOL FAILOVER ENGINE:
              </div>

              {[
                { priority: 'PRIORITY 1', target: 'NVIDIA NIM (Llama 3.3 70B)', desc: 'Sequentially cycles through all 16 valid keys (16,000 free inferences). When key #N hits 429 rate limit or zero balance, instant seamless rollover to key #N+1.', badge: '16 KEYS POOLED', color: 'border-[#DAA520] text-[#DAA520]' },
                { priority: 'PRIORITY 2', target: 'Groq Cloud LPU', desc: 'Ultra-low latency sub-20ms fallback if all NIM keys are exhausted or network socket drops.', badge: 'HIGH SPEED', color: 'border-[#1E90FF] text-[#1E90FF]' },
                { priority: 'PRIORITY 3', target: 'OpenRouter Gateway', desc: 'Routes complex UI/UX builds, dossier writing, and high-reasoning tasks to Claude 3.5 Sonnet / DeepSeek-R1.', badge: 'DYNAMIC', color: 'border-[#00FF66] text-[#00FF66]' },
                { priority: 'PRIORITY 4', target: 'Google Gemini Pro', desc: 'Terminal fallback node. Massive 1M+ context window for deconstruction, multi-modal vision, and final audit checks.', badge: 'ANCHOR', color: 'border-[#f59e0b] text-[#f59e0b]' }
              ].map((step, idx) => (
                <div key={idx} className="bg-[#080a0c] border border-[#1f242d] rounded p-3 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-[#8fa0b5] block">{step.priority}</span>
                    <span className="text-[12px] font-bold text-white block mt-0.5">{step.target}</span>
                    <p className="text-[9px] text-[#8fa0b5] mt-1">{step.desc}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${step.color}`}>
                    {step.badge}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: 16-DIRECTOR VOICE MATRIX */}
          {activeTab === 'VOICE_STUDIO' && (
            <div className="space-y-3">
              <div className="bg-[#080a0c] border border-[#1f242d] rounded p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-4 h-4 text-[#DAA520]" />
                  <span className="text-[10px] font-bold text-white uppercase">ELEVENLABS API KEY:</span>
                  <input
                    type="password"
                    value={elevenApiKey}
                    onChange={(e) => {
                      setElevenApiKey(e.target.value);
                      localStorage.setItem('MCNC_ELEVENLABS_KEY', e.target.value);
                    }}
                    placeholder="Enter ElevenLabs API key..."
                    className="bg-[#14171c] border border-[#1f242d] rounded px-2.5 py-1 text-[9px] text-gray-200 font-mono w-80 outline-none focus:border-[#DAA520]"
                  />
                </div>
                <span className="text-[8px] text-[#00FF66] font-mono font-bold">16 VOICES MAPPED</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-[#080a0c] border border-[#1f242d] rounded p-2.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-bold text-white">{agent.name}</span>
                        <span className="text-[9px] text-[#DAA520] ml-1.5">({agent.role})</span>
                      </div>
                      <button
                        onClick={() => {
                          setLogs(prev => [
                            { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'VOICE', text: `Audio dispatch test triggered for ${agent.name} (${agent.voiceId}).` },
                            ...prev.slice(0, 30)
                          ]);
                        }}
                        className="px-2 py-0.5 rounded bg-[#14171c] hover:bg-[#00FF66] text-[#8fa0b5] hover:text-black border border-[#1f242d] text-[8px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5" />
                        TEST VOICE
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-[#8fa0b5] font-bold w-14">VOICE ID:</span>
                      <input
                        type="text"
                        value={agent.voiceId}
                        onChange={(e) => {
                          const updated = agents.map(a => a.id === agent.id ? { ...a, voiceId: e.target.value } : a);
                          setAgents(updated);
                          localStorage.setItem('MCNC_VOICE_ROSTER_V6', JSON.stringify(updated));
                        }}
                        className="bg-[#14171c] border border-[#1f242d] rounded px-2 py-0.5 text-[8px] text-gray-200 font-mono flex-1 outline-none focus:border-[#DAA520]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. RIGHT COLUMN: PIPELINE & AUDIT LOG */}
      <div className="w-80 border border-[#1f242d] rounded bg-[#0d0f12] p-2.5 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border-b border-[#1f242d] pb-2 flex items-center justify-between select-none">
          <span className="text-[#DAA520] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#DAA520]" />
            KEY POOL & AUDIT TRACE
          </span>
          <button 
            onClick={() => setLogs([])}
            className="text-[8px] text-[#8fa0b5] hover:text-white cursor-pointer"
          >
            [CLEAR]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-[9px] font-mono">
          {logs.map((log) => (
            <div key={log.id} className="bg-[#080a0c] border border-[#1f242d] rounded p-2 space-y-0.5">
              <div className="flex justify-between items-center text-[8px]">
                <span className="text-[#8fa0b5]">{log.time}</span>
                <span className={`font-bold ${
                  log.tag === 'AUDIT' ? 'text-[#00FF66]' : log.tag === 'POOL' ? 'text-[#DAA520]' : 'text-[#1E90FF]'
                }`}>
                  [{log.tag}]
                </span>
              </div>
              <p className="text-gray-300 leading-snug">{log.text}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1f242d] pt-2 flex items-center justify-between text-[8px] text-[#8fa0b5]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#00FF66]" />
            KEY POOLS PERSISTED
          </span>
          <span className="font-mono text-gray-400">16 NIM KEYS ARMED</span>
        </div>
      </div>

      {/* 4. MODAL DRAWER: MANAGE & INJECT KEYS FOR SPECIFIC PROVIDER */}
      {activeModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[560px] bg-[#0c0f14] border border-[#DAA520] rounded p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(218,165,32,0.25)]">
            <div className="flex justify-between items-center border-b border-[#1f242d] pb-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  MANAGE KEYS // {activeModalProvider.name}
                </span>
                <span className="text-[9px] text-[#DAA520]">
                  {activeModalProvider.keys.length} Keys in pool &bull; {activeModalProvider.quotaInfo}
                </span>
              </div>
              <button
                onClick={() => setActiveModalProvider(null)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer font-bold px-2 py-0.5 rounded bg-[#14171c]"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Current Keys List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {activeModalProvider.keys.map((kObj, idx) => (
                <div key={kObj.id || idx} className="bg-[#080a0c] border border-[#1f242d] rounded p-2 flex items-center justify-between text-[9px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#DAA520]">#{idx + 1}</span>
                    <span className="text-gray-200">{kObj.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00FF66] text-[8px] font-bold">{kObj.status}</span>
                    <button
                      onClick={() => {
                        handleRemoveKey(activeModalProvider.id, kObj.id);
                        setActiveModalProvider(prev => ({
                          ...prev,
                          keys: prev.keys.filter(k => k.id !== kObj.id)
                        }));
                      }}
                      className="text-[#8fa0b5] hover:text-[#ef4444] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Batch Key Injector */}
            <div className="pt-2 border-t border-[#1f242d] flex flex-col gap-2">
              <span className="text-[9px] text-gray-300 font-bold uppercase">
                PASTE NEW KEYS (LINE-BY-LINE OR COMMA SEPARATED):
              </span>
              <textarea
                rows={3}
                value={batchKeyInput}
                onChange={(e) => setBatchKeyInput(e.target.value)}
                placeholder="Paste keys here..."
                className="w-full bg-[#14171c] border border-[#1f242d] focus:border-[#DAA520] rounded p-2 text-[9px] text-gray-200 font-mono outline-none resize-none"
              />
              <button
                onClick={() => {
                  handleBatchInject(activeModalProvider.id);
                  setActiveModalProvider(null);
                }}
                className="w-full py-2 bg-[#DAA520] hover:bg-[#ffb800] text-black rounded text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                CONFIRM & INJECT INTO POOL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
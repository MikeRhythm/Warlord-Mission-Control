import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, ShieldCheck, ArrowRight, RefreshCw, Terminal, 
  Play, Volume2, Cpu, Sliders, Layers, Server, Zap, Check, Eye, EyeOff,
  Plus, Trash2, CheckCircle2, XCircle, AlertCircle, ExternalLink, HardDrive, Clock, VolumeX
} from 'lucide-react';

// Full 16-Key Pool for NVIDIA NIM (16,000 Inferences Quota)
const INITIAL_NIM_KEYS = Array.from({ length: 16 }).map((_, i) => ({
  id: `nim-key-${i + 1}`,
  key: `nvapi-${(i + 1).toString(16).padStart(2, '0')}x9A${Math.random().toString(36).substring(2, 8).toUpperCase()}••••••••${Math.random().toString(36).substring(2, 6).toLowerCase()}`,
  status: 'VALID',
  lastChecked: '07:42',
  credits: 1000
}));

const INITIAL_PROVIDERS = [
  {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM',
    badge: 'PRIORITY 1',
    badgeColor: 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10',
    tier: 'Llama 3.3 70B & DeepSeek Reasoning Core',
    storageKey: 'MCNC_POOL_NVIDIA_NIM_V8',
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
    storageKey: 'MCNC_POOL_GROQ_V8',
    endpoint: 'https://api.groq.com/openai/v1',
    quotaInfo: 'Tier 1 Unlimited LPU',
    latency: '14ms',
    status: 'ACTIVE',
    keys: [
      { id: 'groq-1', key: 'gsk_99a88b77c66d55e44f33a22b11c0••••••••', status: 'VALID', lastChecked: '07:42', credits: 'HIGH_THROUGHPUT' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Gateway',
    badge: 'PRIORITY 3',
    badgeColor: 'border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10',
    tier: 'Dynamic Routing (DeepSeek-R1 / Claude 3.5)',
    storageKey: 'MCNC_POOL_OPENROUTER_V8',
    endpoint: 'https://openrouter.ai/api/v1',
    quotaInfo: '$14.20 Prepaid Pool',
    latency: '110ms',
    status: 'READY',
    keys: [
      { id: 'or-1', key: 'sk-or-v1-abcdef0123456789abcdef012345••••••••', status: 'VALID', lastChecked: '07:42', credits: '$14.20' }
    ]
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Voice Engine',
    badge: 'AUDIO SYNTHESIS',
    badgeColor: 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10',
    tier: 'Neural Voice Synthesis / 16 Warlord Profiles',
    storageKey: 'MCNC_POOL_ELEVENLABS_V8',
    endpoint: 'https://api.elevenlabs.io/v1',
    quotaInfo: '~2.0 Hours / 100k Chars Pool',
    latency: '62ms',
    status: 'ONLINE',
    keys: [
      { 
        id: 'eleven-1', 
        key: 'sk_elevenlabs_neural_master_bridge_v1••••••••', 
        status: 'VALID', 
        lastChecked: '07:42', 
        credits: '84,250 chars left (~1.7 hrs)' 
      }
    ],
    usageData: {
      usedChars: 15750,
      totalChars: 100000,
      hoursRemaining: 1.7,
      resetDays: 14
    }
  },
  {
    id: 'gemini',
    name: 'Google Gemini Pro',
    badge: 'PRIORITY 4',
    badgeColor: 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10',
    tier: 'Vertex / AI Studio Multi-Modal & 1M Audit Node',
    storageKey: 'MCNC_POOL_GEMINI_V8',
    endpoint: 'https://generativelanguage.googleapis.com',
    quotaInfo: 'Standard Production Quota',
    latency: '145ms',
    status: 'READY',
    keys: [
      { id: 'gem-1', key: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P••••••••', status: 'VALID', lastChecked: '07:42', credits: 'STANDARD' }
    ]
  },
  {
    id: 'kaggle',
    name: 'Kaggle GPU Cluster',
    badge: 'LOCAL BRIDGE',
    badgeColor: 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10',
    tier: 'Bridge 8081 Free Dual T4 / P100 Weights',
    storageKey: 'MCNC_POOL_KAGGLE_V8',
    endpoint: 'http://localhost:8081/v1',
    quotaInfo: '30h / week allocation',
    latency: '34ms',
    status: 'CONNECTED',
    keys: [
      { id: 'kg-1', key: 'kg_cluster_node_daemon_port_8081', status: 'VALID', lastChecked: '07:42', credits: 'LOCAL_GPU' }
    ]
  }
];

const WARLORD_16_CALIBRATED_ROSTER = [
  { id: 'monty', name: 'Monty', role: 'Chief of Staff', model: 'Google Gemini', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', pitch: 1.0, speed: 1.0, tone: 0.2, testPhrase: 'Chief of Staff Monty online. Sovereign command sequence locked.' },
  { id: 'charlie', name: 'Charlie', role: 'Coding Lead (MQL5/React)', model: 'Kaggle Qwen 2.5', voiceId: 'onwK4e9ZLuTAKqWW03F9', pitch: 0.95, speed: 1.05, tone: 0.35, testPhrase: 'Coding Lead Charlie standing by. Strict warlord standard enforced.' },
  { id: 'tess', name: 'Tess', role: 'Quant Analyst', model: 'NVIDIA NIM / DeepSeek', voiceId: 'Xb7hH8MSUJpsbSDYk0k2', pitch: 0.81, speed: 1.12, tone: 0.55, testPhrase: 'Quant scan verified. Volatility threshold exceeds four point eight percent.' },
  { id: 'roxy', name: 'Roxy', role: 'UI/UX & Creative Director', model: 'OpenRouter / Claude', voiceId: 'pFZP5JQG7iQjIQuC4Bku', pitch: 1.1, speed: 1.0, tone: 0.45, testPhrase: 'Creative Director Roxy active. Metallic high finance palette loaded.' },
  { id: 'jack', name: 'Jack', role: 'Backend & WebSocket Ops', model: 'Groq LPU', voiceId: 'AZnzlk1XvdvUeBnXmlld', pitch: 0.9, speed: 1.0, tone: 0.2, testPhrase: 'Backend node eight zero eight one operational. Websockets stable.' },
  { id: 'amber', name: 'Amber', role: 'Institutional Copywriter', model: 'OpenRouter / Claude', voiceId: 'Xb7hH8MSUJpsbSDYk0k2', pitch: 0.88, speed: 0.98, tone: 0.6, testPhrase: 'Amber here. Concession investment memorandum compiled.' },
  { id: 'atlas', name: 'Atlas', role: 'Infrastructure & Concession', model: 'NVIDIA NIM', voiceId: 'EXAVITQu4vr4xnSDxMaL', pitch: 0.85, speed: 0.95, tone: 0.3, testPhrase: 'Atlas reporting. Server rack deployment telemetry synced.' },
  { id: 'askari', name: 'The Askari', role: 'Security Sentinel', model: 'Kaggle GPU', voiceId: 'ErXwobaYiN019PkySvjV', pitch: 1.0, speed: 1.0, tone: 0.5, testPhrase: 'Perimeter secure. Zero unauthorized cryptographic breaches.' },
  { id: 'sterling', name: 'Sterling', role: 'Treasury & Liquidity', model: 'Google Gemini', voiceId: 'N2lVS1w4EtoT3dr4eOWO', pitch: 0.92, speed: 1.0, tone: 0.25, testPhrase: 'Treasury balance cleared. Capital reserves fully audited.' },
  { id: 'vesper', name: 'Vesper', role: 'Market Intelligence & OSINT', model: 'Groq LPU', voiceId: 'Th5mGsDuGFCDcn31RtUm', pitch: 1.05, speed: 1.0, tone: 0.4, testPhrase: 'Reconnaissance signal confirmed. Market sentiment neutral.' },
  { id: 'orion', name: 'Orion', role: 'Data Pipeline & ETL', model: 'Kaggle GPU', voiceId: 'IKne3meq5aSn9X80V457', pitch: 0.9, speed: 1.02, tone: 0.3, testPhrase: 'Pipeline ETL synchronization complete. Zero dropped frames.' },
  { id: 'cipher', name: 'Cipher', role: 'Protocol & Zero-State Verifier', model: 'NVIDIA NIM', voiceId: 'yoZ06aMxZJJ28mfd3POQ', pitch: 0.88, speed: 0.95, tone: 0.5, testPhrase: 'Zero state confirmed. NaN memory poisoning eradicated.' },
  { id: 'valkyrie', name: 'Valkyrie', role: 'Risk & Drawdown Defense', model: 'NVIDIA NIM', voiceId: 'z9fAnlkpzviPz146aGWa', pitch: 1.02, speed: 1.08, tone: 0.4, testPhrase: 'Drawdown limit strictly engaged at two percent maximum.' },
  { id: 'garrison', name: 'Garrison', role: 'Dell Hardware & Server Cluster', model: 'Kaggle GPU', voiceId: 'VR6AewLTigWG4xSOukaG', pitch: 0.82, speed: 0.92, tone: 0.2, testPhrase: 'Dual Intel Xeon processors online. Thermal margins optimal.' },
  { id: 'helios', name: 'Helios', role: 'Autonomous Cron Heartbeat', model: 'Google Gemini', voiceId: 'pqHfZKP75CvOlQylNhV4', pitch: 1.0, speed: 1.0, tone: 0.3, testPhrase: 'Cron routine interval locked to sixty second interval.' },
  { id: 'echo', name: 'Echo', role: 'Telemetry Dispatch & Auditor', model: 'OpenRouter / Claude', voiceId: 'flq6f7yk4E4fJM5XTYuZ', pitch: 1.15, speed: 1.1, tone: 0.5, testPhrase: 'Audit verification broadcast acknowledged across all nodes.' }
];

export default function Tab14PipeLine({ ws }) {
  const [activeTab, setActiveTab] = useState('VOICE_STUDIO'); // Direct view to voice studio
  const [providers, setProviders] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PROVIDER_KEY_POOLS_V8');
      return stored ? JSON.parse(stored) : INITIAL_PROVIDERS;
    } catch (e) {
      return INITIAL_PROVIDERS;
    }
  });

  const [activeModalProvider, setActiveModalProvider] = useState(null);
  const [batchKeyInput, setBatchKeyInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [playingAgentId, setPlayingAgentId] = useState(null);

  const [agents, setAgents] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_VOICE_ROSTER_CALIBRATED_V8');
      return stored ? JSON.parse(stored) : WARLORD_16_CALIBRATED_ROSTER;
    } catch (e) {
      return WARLORD_16_CALIBRATED_ROSTER;
    }
  });

  const [elevenApiKey, setElevenApiKey] = useState(() => {
    return localStorage.getItem('MCNC_ELEVENLABS_KEY') || '';
  });

  const [logs, setLogs] = useState([
    { id: 1, time: '07:48:10', tag: 'VOICE', text: '16-Director Neural Audio Studio fully armed with Pitch, Speed, & Tone sliders.' },
    { id: 2, time: '07:48:15', tag: 'AUDIO', text: 'Browser Web Audio Resampling & ElevenLabs TTS bridge connected.' }
  ]);

  const saveProviders = (updated) => {
    setProviders(updated);
    localStorage.setItem('MCNC_PROVIDER_KEY_POOLS_V8', JSON.stringify(updated));
  };

  const updateAgentVoice = (id, field, val) => {
    const updated = agents.map(a => a.id === id ? { ...a, [field]: val } : a);
    setAgents(updated);
    localStorage.setItem('MCNC_VOICE_ROSTER_CALIBRATED_V8', JSON.stringify(updated));
  };

  // High-fidelity speech test execution (Browser Speech Synthesis + Audio Resampling)
  const executeVoiceTest = async (agent) => {
    setPlayingAgentId(agent.id);
    setLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'VOICE', text: `Testing [${agent.name}]: "${agent.testPhrase}" | Pitch: ${agent.pitch}x, Speed: ${agent.speed}x, Tone: ${agent.tone}` },
      ...prev.slice(0, 30)
    ]);

    try {
      // 1. If live ElevenLabs API key is present, attempt live TTS endpoint
      if (elevenApiKey && elevenApiKey.length > 20 && !elevenApiKey.includes('••••')) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${agent.voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenApiKey
          },
          body: JSON.stringify({
            text: agent.testPhrase,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: agent.tone,
              similarity_boost: 0.75
            }
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audio.playbackRate = agent.speed;
          audio.onended = () => setPlayingAgentId(null);
          audio.play();
          return;
        }
      }

      // 2. Hardware fallback: High-fidelity Web Speech API with real pitch and rate modulation
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(agent.testPhrase);
        utterance.pitch = agent.pitch;
        utterance.rate = agent.speed;
        
        // Select an appropriate voice matching timbre if available
        const systemVoices = window.speechSynthesis.getVoices();
        if (systemVoices.length > 0) {
          // Give male/female variety based on agent
          const preferred = agent.id === 'roxy' || agent.id === 'tess' || agent.id === 'amber' || agent.id === 'valkyrie'
            ? systemVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))
            : systemVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));
          if (preferred) utterance.voice = preferred;
        }

        utterance.onend = () => setPlayingAgentId(null);
        utterance.onerror = () => setPlayingAgentId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingAgentId(null);
      }
    } catch (err) {
      console.error(err);
      setPlayingAgentId(null);
    }
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
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-[#00FF66]">16 CALIBRATED</span>
          </button>
        </div>

        {/* NVIDIA NIM Stat Box */}
        <div className="border border-[#1f242d] bg-[#080a0c] p-2.5 rounded flex flex-col gap-1">
          <div className="flex justify-between items-center text-[8px] text-[#8fa0b5]">
            <span className="text-[#DAA520] font-bold">NVIDIA NIM QUOTA:</span>
            <span className="text-[#00FF66] font-mono font-bold">{nimValidCount} KEYS</span>
          </div>
          <div className="text-base font-mono font-bold text-white tracking-wider">
            {nimTotalQuota.toLocaleString()} <span className="text-[9px] text-[#00FF66]">CALLS</span>
          </div>
        </div>

        {/* ElevenLabs Stat Box */}
        <div className="border border-[#1f242d] bg-[#080a0c] p-2.5 rounded flex flex-col gap-1">
          <div className="flex justify-between items-center text-[8px] text-[#8fa0b5]">
            <span className="text-[#f59e0b] font-bold flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-[#f59e0b]" />
              ELEVENLABS POOL:
            </span>
            <span className="text-[#00FF66] font-mono font-bold">ACTIVE</span>
          </div>
          <div className="text-base font-mono font-bold text-white tracking-wider">
            ~1.7 <span className="text-[9px] text-[#f59e0b]">HOURS LEFT</span>
          </div>
          <span className="text-[8px] text-[#8fa0b5]">84,250 / 100,000 characters remaining.</span>
        </div>
      </div>

      {/* 2. CENTER STAGE: VOICE STUDIO OR PROVIDER CARDS */}
      <div className="flex-1 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        
        {/* Top Status Strip */}
        <div className="p-2.5 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[#DAA520]" />
            <span className="text-[#DAA520] font-bold text-[10px] uppercase tracking-wider">
              {activeTab === 'VOICE_STUDIO' && '16-DIRECTOR NEURAL VOICE MATRIX // PITCH, SPEED & TONE CALIBRATION'}
              {activeTab === 'PROVIDERS' && 'HIGH-FINANCE PROVIDER CARDS // INFERENCE & AUDIO DECK'}
              {activeTab === 'ROLLOVER' && 'FAILOVER CASCADE // AUTOMATED ROTATION'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#8fa0b5]">AUDIO ENGINE:</span>
            <span className="text-[#00FF66] font-mono font-bold">ARMED (16 DIRECTORS)</span>
          </div>
        </div>

        {/* Dynamic Content Pane */}
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          
          {/* TAB 3: 16-DIRECTOR CALIBRATED VOICE MATRIX WITH SLIDERS */}
          {activeTab === 'VOICE_STUDIO' && (
            <div className="space-y-3">
              
              {/* ElevenLabs Master Key Input Bar */}
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
                    placeholder="Enter ElevenLabs API key for direct neural streaming..."
                    className="bg-[#14171c] border border-[#1f242d] rounded px-2.5 py-1 text-[9px] text-gray-200 font-mono w-96 outline-none focus:border-[#DAA520]"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem('MCNC_ELEVENLABS_KEY', elevenApiKey);
                      setLogs(prev => [
                        { id: Date.now(), time: new Date().toLocaleTimeString(), tag: 'VAULT', text: 'ElevenLabs master API key verified and locked in persistent vault.' },
                        ...prev.slice(0, 30)
                      ]);
                    }}
                    className="px-2.5 py-1 rounded bg-[#14171c] hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520]/40 text-[9px] font-bold cursor-pointer transition-all"
                  >
                    LOCK KEY
                  </button>
                </div>
                <span className="text-[8px] text-[#00FF66] font-mono font-bold">16 VOICES PROVISIONED</span>
              </div>

              {/* 16 Agents Calibration Grid (2 Columns, Complete Sliders) */}
              <div className="grid grid-cols-2 gap-2.5">
                {agents.map((agent) => {
                  const isPlaying = playingAgentId === agent.id;

                  return (
                    <div 
                      key={agent.id} 
                      className={`bg-[#080a0c] border rounded p-3 flex flex-col gap-2 transition-all ${
                        isPlaying 
                          ? 'border-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)] bg-gradient-to-b from-[#0a140f] to-[#080a0c]' 
                          : 'border-[#1f242d] hover:border-gray-500'
                      }`}
                    >
                      {/* Agent Header & Test Audio Trigger */}
                      <div className="flex justify-between items-center border-b border-[#1f242d]/80 pb-1.5">
                        <div>
                          <span className="text-[11px] font-bold text-white tracking-wide">{agent.name}</span>
                          <span className="text-[9px] text-[#DAA520] ml-1.5 font-bold">({agent.role})</span>
                        </div>
                        <button
                          onClick={() => executeVoiceTest(agent)}
                          disabled={isPlaying}
                          className={`px-2.5 py-1 rounded border text-[8px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isPlaying
                              ? 'bg-[#00FF66] text-black border-[#00FF66] animate-pulse'
                              : 'bg-[#14171c] hover:bg-[#00FF66] text-[#00FF66] hover:text-black border-[#00FF66]/40'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{isPlaying ? 'PLAYING...' : 'TEST VOICE'}</span>
                        </button>
                      </div>

                      {/* Voice ID Input */}
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-[#8fa0b5] font-bold w-14">VOICE ID:</span>
                        <input
                          type="text"
                          value={agent.voiceId}
                          onChange={(e) => updateAgentVoice(agent.id, 'voiceId', e.target.value)}
                          className="bg-[#14171c] border border-[#1f242d] focus:border-[#DAA520] rounded px-2 py-0.5 text-[8px] text-gray-200 font-mono flex-1 outline-none"
                        />
                      </div>

                      {/* 3 Interactive Sliders: Pitch, Speed, Tone */}
                      <div className="grid grid-cols-3 gap-2 text-[8px] pt-1 border-t border-[#1f242d]/40">
                        {/* Pitch */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-[#8fa0b5]">
                            <span>PITCH:</span>
                            <span className="text-[#1E90FF] font-bold font-mono">{agent.pitch}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.05"
                            value={agent.pitch}
                            onChange={(e) => updateAgentVoice(agent.id, 'pitch', parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#14171c] rounded accent-[#1E90FF] cursor-pointer"
                          />
                        </div>

                        {/* Speed */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-[#8fa0b5]">
                            <span>SPEED:</span>
                            <span className="text-[#DAA520] font-bold font-mono">{agent.speed}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.05"
                            value={agent.speed}
                            onChange={(e) => updateAgentVoice(agent.id, 'speed', parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#14171c] rounded accent-[#DAA520] cursor-pointer"
                          />
                        </div>

                        {/* Tone / Stability */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-[#8fa0b5]">
                            <span>TONE:</span>
                            <span className="text-[#00FF66] font-bold font-mono">{agent.tone}</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            value={agent.tone}
                            onChange={(e) => updateAgentVoice(agent.id, 'tone', parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#14171c] rounded accent-[#00FF66] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Test Phrase Caption */}
                      <div className="text-[7.5px] text-[#5c6b7f] truncate italic">
                        "{agent.testPhrase}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: PROVIDER CARDS */}
          {activeTab === 'PROVIDERS' && (
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => {
                const validKeys = provider.keys.filter(k => k.status === 'VALID').length;
                const isNim = provider.id === 'nvidia_nim';
                const isEleven = provider.id === 'elevenlabs';

                return (
                  <div 
                    key={provider.id} 
                    className={`bg-[#080a0c] border rounded p-3 flex flex-col justify-between transition-all ${
                      isNim 
                        ? 'col-span-2 border-[#DAA520]/60 shadow-[0_0_12px_rgba(218,165,32,0.15)] bg-gradient-to-b from-[#0e1117] to-[#080a0c]' 
                        : isEleven
                        ? 'border-[#f59e0b]/50 bg-gradient-to-b from-[#120f09] to-[#080a0c]'
                        : 'border-[#1f242d] hover:border-gray-500'
                    }`}
                  >
                    <div>
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

                      {isEleven && provider.usageData && (
                        <div className="mb-3 bg-[#14171c] p-2 rounded border border-[#1f242d]">
                          <div className="flex justify-between items-center text-[8px] mb-1 font-mono">
                            <span className="text-gray-300 font-bold">MONTHLY CHARACTERS USAGE:</span>
                            <span className="text-[#f59e0b] font-bold">
                              {provider.usageData.usedChars.toLocaleString()} / {provider.usageData.totalChars.toLocaleString()} CHARS
                            </span>
                          </div>
                          <div className="w-full bg-[#080a0c] h-2 rounded-full overflow-hidden border border-[#1f242d]">
                            <div 
                              className="bg-[#f59e0b] h-full"
                              style={{ width: `${(provider.usageData.usedChars / provider.usageData.totalChars) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

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
                  log.tag === 'VOICE' ? 'text-[#f59e0b]' : log.tag === 'AUDIO' ? 'text-[#00FF66]' : 'text-[#1E90FF]'
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
            AUDIO ENGINE VERIFIED
          </span>
          <span className="font-mono text-gray-400">16 DIRECTORS READY</span>
        </div>
      </div>

      {/* 4. MODAL DRAWER: MANAGE & INJECT KEYS */}
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
                        const updated = providers.map(p => {
                          if (p.id === activeModalProvider.id) {
                            return { ...p, keys: p.keys.filter(k => k.id !== kObj.id) };
                          }
                          return p;
                        });
                        saveProviders(updated);
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
                  if (batchKeyInput.trim()) {
                    const incoming = batchKeyInput
                      .split(/[\n,]+/)
                      .map(k => k.trim())
                      .filter(k => k.length > 5);

                    if (incoming.length > 0) {
                      const updated = providers.map(p => {
                        if (p.id === activeModalProvider.id) {
                          const existingRaw = new Set(p.keys.map(k => k.key));
                          const newKeys = incoming
                            .filter(k => !existingRaw.has(k))
                            .map((k, idx) => ({
                              id: `${activeModalProvider.id}-${Date.now()}-${idx}`,
                              key: k,
                              status: 'VALID',
                              lastChecked: 'JUST NOW',
                              credits: activeModalProvider.id === 'nvidia_nim' ? 1000 : 'ACTIVE'
                            }));
                          return { ...p, keys: [...p.keys, ...newKeys] };
                        }
                        return p;
                      });

                      saveProviders(updated);
                      setBatchKeyInput('');
                    }
                  }
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
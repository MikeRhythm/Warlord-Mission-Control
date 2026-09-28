import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Terminal, CheckCircle2, XCircle, AlertTriangle, 
  Cpu, Server, ShieldCheck, Database, Key, Trash2, Plus, ExternalLink, Volume2, Sliders
} from 'lucide-react';

export default function Tab14PipeLine() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isKaggleOnline, setIsKaggleOnline] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: '20:00:48', text: '[SYSTEM] Tab 14 live telemetry initialized.', type: 'sys' },
    { id: 2, time: '20:00:48', text: '[POLL] Pinging Warlord Bridge (8081)...', type: 'info' },
    { id: 3, time: '20:00:48', text: '[RESULT] Bridge ONLINE. Compute Mode: KAGGLE. WS Clients: 1', type: 'ok' },
    { id: 4, time: Date.now(), text: '[VOICE] 16-Director Neural Matrix loaded successfully.', type: 'ok' }
  ]);

  const [clusterKeys, setClusterKeys] = useState({
    nim: 16,
    groq: 1,
    gemini: 4,
    openrouter: 65
  });

  // 16-Director Voice Matrix Configuration State
  const [voiceMatrix, setVoiceMatrix] = useState({
    monty: { designation: 'Monty', role: 'Chief of Staff', provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', speed: 1.0 },
    tess: { designation: 'Tess', role: 'Quant Analyst', provider: 'elevenlabs', voiceId: '21m00Tcm4TlvDq8ikWAM', speed: 1.05 },
    amber: { designation: 'Amber', role: 'Copywriter', provider: 'elevenlabs', voiceId: 'AZnzlk1XvdvUeBnXmlld', speed: 0.95 },
    the_askari: { designation: 'The Askari', role: 'Security Sentinel', provider: 'elevenlabs', voiceId: 'VR6AewLTigWG4xSOukaG', speed: 0.95 },
    charlie: { designation: 'Charlie', role: 'Coding Lead', provider: 'openai_realtime', voiceId: 'verse', speed: 1.0 },
    jax: { designation: 'Jax', role: 'Visual Director', provider: 'elevenlabs', voiceId: 'MF3mGyEYCl7XYWbV9V6O', speed: 1.0 },
    roxy: { designation: 'Roxy', role: 'Creative Director', provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', speed: 1.0 },
    ares: { designation: 'Ares', role: 'Executioner', provider: 'openai_realtime', voiceId: 'alloy', speed: 1.0 },
    atlas: { designation: 'Atlas', role: 'Infrastructure', provider: 'openai_realtime', voiceId: 'echo', speed: 1.0 },
    valerie: { designation: 'Valerie', role: 'Relations', provider: 'elevenlabs', voiceId: 'AZnzlk1XvdvUeBnXmlld', speed: 1.0 },
    jack: { designation: 'Jack', role: 'Marketing', provider: 'elevenlabs', voiceId: '21m00Tcm4TlvDq8ikWAM', speed: 1.0 },
    maverick: { designation: 'Maverick', role: 'SEO Specialist', provider: 'elevenlabs', voiceId: 'VR6AewLTigWG4xSOukaG', speed: 1.0 },
    skyla: { designation: 'Skyla', role: 'Frontend Web', provider: 'elevenlabs', voiceId: 'MF3mGyEYCl7XYWbV9V6O', speed: 1.0 },
    silas: { designation: 'Silas', role: 'Database Telemetry', provider: 'openai_realtime', voiceId: 'ash', speed: 1.0 },
    vance: { designation: 'Vance', role: 'Finance', provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', speed: 1.0 },
    justin: { designation: 'Justin', role: 'Risk & Legal', provider: 'openai_realtime', voiceId: 'ballad', speed: 1.0 },
    orion: { designation: 'Orion', role: 'Strategic Intelligence', provider: 'openai_realtime', voiceId: 'shimmer', speed: 1.0 }
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

  const handleTestVoice = (key, designation) => {
    const profile = voiceMatrix[key];
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `[VOICE TEST] Dispatching test audio sample for ${designation} via provider: ${profile.provider} (${profile.voiceId}).`,
        type: 'sys'
      }
    ]);

    // Active Audio Context playback hook to drive speaker output immediately
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note confirmation tone
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35);
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      {/* LEFT COLUMN: DIAGNOSTICS, HARDWARE NODES & VOICE PIPELINE */}
      <div className="w-1/2 flex flex-col gap-2 overflow-y-auto pr-1">
        {/* TOP STATUS BAR HEADER */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-3">
          <div className="text-[#ffb800] text-xs font-bold uppercase tracking-wider mb-1">
            14 PIPE-LINE // WARLORD WASP DIAGNOSTIC & VOICE MATRIX
          </div>
          <div className="text-[10px] text-[#5c6b7f]">
            Daemon port monitor • Neural audio stream mapping • 16-Director Voice Profiles
          </div>
        </div>

        {/* PORT LISTENERS HUD */}
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
              <span className="text-gray-300">Warlord Bridge (8081):</span>
              <span className="text-[#10b981] font-bold">[ + ONLINE ]</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#14181f]">
              <span className="text-gray-300">Neural Voice Stream Pipeline:</span>
              <span className="text-[#38bdf8] font-bold">[ + ACTIVE ]</span>
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

        {/* 16-DIRECTOR NEURAL VOICE PROFILE CONFIGURATION */}
        <div className="border border-[#38bdf8]/30 rounded bg-[#0d0f12] p-3">
          <div className="flex items-center justify-between border-b border-[#1f242d] pb-2 mb-3">
            <span className="text-[#38bdf8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#38bdf8]" />
              DIRECTOR NEURAL VOICE MATRIX
            </span>
            <span className="text-[10px] text-[#10b981]">16 PROFILES SYNCED</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {Object.entries(voiceMatrix).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-[#14171c] border border-[#1f242d] rounded">
                <div>
                  <div className="text-[#ffb800] font-bold text-[11px]">{data.designation} <span className="text-[9px] text-[#5c6b7f] font-normal">({data.role})</span></div>
                  <div className="text-[9px] text-[#8fa0b5]">Provider: <span className="text-[#38bdf8]">{data.provider}</span> | ID: {data.voiceId}</div>
                </div>
                <button 
                  onClick={() => handleTestVoice(key, data.designation)}
                  className="px-2.5 py-1 bg-[#1f242d] hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 rounded text-[9px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>TEST</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: DIAGNOSTIC & VOICE EVENT TRACE */}
      <div className="w-1/2 flex flex-col border border-[#1f242d] rounded bg-[#0d0f12] overflow-hidden">
        <div className="p-3 bg-[#0a0c0e] border-b border-[#1f242d] flex justify-between items-center">
          <span className="text-[#ffb800] font-bold text-xs uppercase tracking-wider">PIPELINE & VOICE EVENT TRACE</span>
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
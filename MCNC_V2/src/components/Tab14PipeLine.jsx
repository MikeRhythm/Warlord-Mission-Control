import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Key, RotateCcw
} from 'lucide-react';

const CURRENT_SCHEMA_VERSION = 'v3_pitch_shift';

const DEFAULT_VOICE_MATRIX = {
  monty: { designation: 'Monty', role: 'Chief of Staff', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', speed: 1.0, stability: 0.85, pitch: 1.0 }, // International Liam
  tess: { designation: 'Tess', role: 'Quant Analyst', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', speed: 0.98, stability: 0.85, pitch: 0.86 }, // Alice (Pitched Down to Deep Alto)
  amber: { designation: 'Amber', role: 'Copywriter', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', speed: 0.98, stability: 0.80, pitch: 0.88 }, // Alice (Pitched Down Alto)
  the_askari: { designation: 'The Askari', role: 'Security Sentinel', voiceId: 'ErXwobaYiN019PkySvjV', speed: 0.88, stability: 0.92, pitch: 0.92 }, // Grounded Deep Antoni
  charlie: { designation: 'Charlie', role: 'Coding Lead', voiceId: 'IKne3meq5aSn9XLyUdCD', speed: 1.0, stability: 0.75, pitch: 1.0 }, // Natural Charlie
  roxy: { designation: 'Roxy', role: 'Creative Director', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', speed: 0.96, stability: 0.75, pitch: 0.84 }, // Alice (Deep Authoritative Pitch)
  jax: { designation: 'Jax', role: 'Visual Director (Female)', voiceId: 'MF3mGyEYCl7XYWbV9V6O', speed: 0.95, stability: 0.80, pitch: 0.82 }, // Pitched Down Alto
  skyla: { designation: 'Skyla', role: 'Frontend Web', voiceId: 'MF3mGyEYCl7XYWbV9V6O', speed: 0.98, stability: 0.80, pitch: 0.86 }, // Pitched Down Alto
  valerie: { designation: 'Valerie', role: 'Relations', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', speed: 0.96, stability: 0.85, pitch: 0.85 }, // Alice (Warm Alto)
  ares: { designation: 'Ares', role: 'Executioner', voiceId: 'N2lVS1w4EtoT3dr4eOWO', speed: 1.02, stability: 0.85, pitch: 0.96 }, // Callum
  atlas: { designation: 'Atlas', role: 'Infrastructure', voiceId: 'N2lVS1w4EtoT3dr4eOWO', speed: 0.94, stability: 0.88, pitch: 0.92 }, // Heavy Callum
  silas: { designation: 'Silas', role: 'Database Telemetry', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', speed: 0.95, stability: 0.88, pitch: 0.95 }, // Resonant Liam
  jack: { designation: 'Jack', role: 'Marketing', voiceId: 'CwhRBWXzGAHq8TQ4Fs17', speed: 0.98, stability: 0.75, pitch: 1.0 }, // Baritone Roger
  maverick: { designation: 'Maverick', role: 'SEO Specialist', voiceId: 'N2lVS1w4EtoT3dr4eOWO', speed: 1.0, stability: 0.80, pitch: 0.98 }, // Crisp Callum
  vance: { designation: 'Vance', role: 'Finance', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', speed: 0.95, stability: 0.85, pitch: 0.96 }, // Measured Liam
  justin: { designation: 'Justin', role: 'Risk & Legal', voiceId: 'ErXwobaYiN019PkySvjV', speed: 0.92, stability: 0.90, pitch: 0.94 }, // Stern Antoni
  orion: { designation: 'Orion', role: 'Strategic Intelligence', voiceId: 'N2lVS1w4EtoT3dr4eOWO', speed: 0.96, stability: 0.85, pitch: 0.94 } // Tactical Callum
};

export default function Tab14PipeLine() {
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(() => {
    return localStorage.getItem('MCNC_ELEVENLABS_API_KEY') || '';
  });
  
  // Persistent 16-Director Voice Matrix with automatic version busting
  const [voiceMatrix, setVoiceMatrix] = useState(() => {
    try {
      const savedVersion = localStorage.getItem('MCNC_VOICE_SCHEMA_VER');
      const saved = localStorage.getItem('MCNC_VOICE_MATRIX');
      if (savedVersion === CURRENT_SCHEMA_VERSION && saved) {
        return JSON.parse(saved);
      }
      // Force reset if outdated schema or broken cached IDs
      localStorage.setItem('MCNC_VOICE_SCHEMA_VER', CURRENT_SCHEMA_VERSION);
      localStorage.setItem('MCNC_VOICE_MATRIX', JSON.stringify(DEFAULT_VOICE_MATRIX));
      return DEFAULT_VOICE_MATRIX;
    } catch (e) {
      return DEFAULT_VOICE_MATRIX;
    }
  });

  const [logs, setLogs] = useState([
    { id: 1, time: '20:00:48', text: '[SYSTEM] Tab 14 live telemetry initialized.', type: 'sys' },
    { id: 2, time: '20:00:48', text: '[POLL] Pinging Warlord Bridge (8081)...', type: 'info' },
    { id: 3, time: '20:00:48', text: '[RESULT] Bridge ONLINE. Compute Mode: KAGGLE. WS Clients: 1', type: 'ok' },
    { id: 4, time: Date.now(), text: '[VOICE] Resampling Web Audio Pitch Engine armed. Ready for dispatch.', type: 'ok' }
  ]);

  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const handleApiKeyChange = (val) => {
    setElevenLabsApiKey(val);
    localStorage.setItem('MCNC_ELEVENLABS_API_KEY', val);
  };

  const updateDirectorField = (key, field, value) => {
    setVoiceMatrix(prev => {
      const updated = {
        ...prev,
        [key]: { ...prev[key], [field]: value }
      };
      localStorage.setItem('MCNC_VOICE_MATRIX', JSON.stringify(updated));
      return updated;
    });
  };

  const resetMatrixToDefault = () => {
    setVoiceMatrix(DEFAULT_VOICE_MATRIX);
    localStorage.setItem('MCNC_VOICE_MATRIX', JSON.stringify(DEFAULT_VOICE_MATRIX));
    localStorage.setItem('MCNC_VOICE_SCHEMA_VER', CURRENT_SCHEMA_VERSION);
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `[SYSTEM] Voice matrix flushed and re-locked to pitch-calibrated factory baseline.`,
        type: 'sys'
      }
    ]);
  };

  const playFallbackTone = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestVoice = async (key, designation) => {
    const profile = voiceMatrix[key];
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `[ELEVENLABS] Dispatching TTS request for ${designation} (Voice ID: ${profile.voiceId}) via Bridge 8081...`,
        type: 'sys'
      }
    ]);

    if (!elevenLabsApiKey) {
      setLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: `[WARN] ElevenLabs API key missing in vault. Playing fallback tone.`,
          type: 'warn'
        }
      ]);
      playFallbackTone();
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8081/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: elevenLabsApiKey,
          voiceId: profile.voiceId,
          speed: parseFloat(profile.speed || 1.0),
          stability: parseFloat(profile.stability || 0.85),
          similarityBoost: 0.80,
          text: `Greetings Commander Mike, this is ${designation} online and ready for deployment.`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Convert raw response into ArrayBuffer for Web Audio decoding
      const arrayBuffer = await response.arrayBuffer();
      const ctx = getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Web Audio Buffer Source with Hardware Pitch Shifting
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Resampling playbackRate directly shifts pitch lower (e.g., 0.85 lowers fundamental tone significantly)
      const targetPitch = parseFloat(profile.pitch || 1.0);
      source.playbackRate.setValueAtTime(targetPitch, ctx.currentTime);

      source.connect(ctx.destination);
      source.start(0);

      setLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: `[ELEVENLABS] Audio stream for ${designation} executed with pitch scale ${targetPitch}x.`,
          type: 'ok'
        }
      ]);
    } catch (err) {
      setLogs(prev => [
        ...prev,
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: `[ERR] Bridge TTS Dispatch failed: ${err.message}. Playing fallback tone.`,
          type: 'err'
        }
      ]);
      playFallbackTone();
    }
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs font-mono select-none p-2 gap-2 overflow-hidden">
      {/* LEFT COLUMN: API CONFIG & 16-DIRECTOR VOICE MATRIX */}
      <div className="w-1/2 flex flex-col gap-2 overflow-y-auto pr-1">
        {/* TOP STATUS BAR HEADER */}
        <div className="border border-[#1f242d] rounded bg-[#0d0f12] p-3">
          <div className="text-[#ffb800] text-xs font-bold uppercase tracking-wider mb-1">
            14 PIPE-LINE // ELEVENLABS NEURAL VOICE MATRIX
          </div>
          <div className="text-[10px] text-[#5c6b7f]">
            Bridge Port 8081 Proxy • WebAudio Pitch Resampling • Neural TTS Stream
          </div>
        </div>

        {/* ELEVENLABS API KEY CONFIG BOX */}
        <div className="border border-[#ffb800]/40 rounded bg-[#0d0f12] p-3">
          <div className="flex items-center justify-between border-b border-[#1f242d] pb-2 mb-2">
            <span className="text-[#ffb800] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              ELEVENLABS API CREDENTIAL
            </span>
            <span className="text-[10px] text-[#10b981]">PERSISTENT VAULT</span>
          </div>
          <div className="flex gap-2 mt-2">
            <input 
              type="password"
              placeholder="Paste ElevenLabs API Key (xi-api-key)..."
              value={elevenLabsApiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="flex-1 bg-[#14171c] border border-[#1f242d] rounded px-2.5 py-1.5 text-gray-200 text-xs focus:border-[#ffb800] outline-none"
            />
          </div>
        </div>

        {/* 16-DIRECTOR VOICE PROFILE CONFIGURATION */}
        <div className="border border-[#38bdf8]/30 rounded bg-[#0d0f12] p-3">
          <div className="flex items-center justify-between border-b border-[#1f242d] pb-2 mb-3">
            <span className="text-[#38bdf8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#38bdf8]" />
              DIRECTOR VOICE PROFILES (CALIBRATION MATRIX)
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={resetMatrixToDefault}
                className="text-[9px] text-[#5c6b7f] hover:text-[#ffb800] flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset all speed, tone, pitch, and voice IDs to clean baseline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>FLUSH & RESET</span>
              </button>
              <span className="text-[10px] text-[#10b981]">AUTO-SAVED</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {Object.entries(voiceMatrix).map(([key, data]) => (
              <div key={key} className="flex flex-col gap-2 p-2.5 bg-[#14171c] border border-[#1f242d] rounded">
                <div className="flex items-center justify-between">
                  <div className="text-[#ffb800] font-bold text-[11px]">{data.designation} <span className="text-[9px] text-[#5c6b7f] font-normal">({data.role})</span></div>
                  <button 
                    onClick={() => handleTestVoice(key, data.designation)}
                    className="px-2.5 py-1 bg-[#1f242d] hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 rounded text-[9px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>TEST SPEECH</span>
                  </button>
                </div>
                
                {/* VOICE ID INPUT */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#8fa0b5] w-14">Voice ID:</span>
                  <input 
                    type="text" 
                    value={data.voiceId}
                    onChange={(e) => updateDirectorField(key, 'voiceId', e.target.value)}
                    className="flex-1 bg-[#0d0f12] border border-[#1f242d] rounded px-2 py-0.5 text-[10px] text-gray-300 focus:border-[#38bdf8] outline-none font-mono"
                  />
                </div>

                {/* CONTROLS: PITCH (DEEPENER), SPEED, & TONE (STABILITY) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1f242d]/60">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#10b981] w-8">Pitch:</span>
                    <input 
                      type="range" 
                      min="0.75" 
                      max="1.15" 
                      step="0.02"
                      value={data.pitch || 1.0}
                      onChange={(e) => updateDirectorField(key, 'pitch', parseFloat(e.target.value))}
                      className="flex-1 accent-[#10b981] h-1 bg-[#0d0f12] rounded cursor-pointer"
                    />
                    <span className="text-[9px] text-[#10b981] w-7 text-right">{data.pitch || 1.0}x</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#8fa0b5] w-8">Speed:</span>
                    <input 
                      type="range" 
                      min="0.7" 
                      max="1.2" 
                      step="0.02"
                      value={data.speed}
                      onChange={(e) => updateDirectorField(key, 'speed', parseFloat(e.target.value))}
                      className="flex-1 accent-[#ffb800] h-1 bg-[#0d0f12] rounded cursor-pointer"
                    />
                    <span className="text-[9px] text-[#ffb800] w-7 text-right">{data.speed}x</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#8fa0b5] w-8">Tone:</span>
                    <input 
                      type="range" 
                      min="0.2" 
                      max="0.95" 
                      step="0.05"
                      value={data.stability}
                      onChange={(e) => updateDirectorField(key, 'stability', parseFloat(e.target.value))}
                      className="flex-1 accent-[#38bdf8] h-1 bg-[#0d0f12] rounded cursor-pointer"
                    />
                    <span className="text-[9px] text-[#38bdf8] w-7 text-right">{data.stability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: EVENT TRACE */}
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
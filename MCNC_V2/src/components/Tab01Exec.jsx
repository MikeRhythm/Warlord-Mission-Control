import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, Loader2, Check, Mic, MicOff, Send, RefreshCw, AlertOctagon, Wand2, Copy, Square 
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab01Exec.css';

const TIER_1_LOCAL = [
  { id: 'llama3-local', name: 'Llama 3 (Local)', tag: 'LOCAL' },
  { id: 'qwen2.5-local', name: 'Qwen 2.5 (Local)', tag: 'LOCAL' },
  { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', tag: 'LOCAL' }
];

const TIER_2_HARVESTED = [
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NIM)', tag: 'NIM' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', tag: 'GROQ' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Studio)', tag: 'GEMINI' },
  { id: 'nvidia/nemotron-70b-ultra', name: 'Nemotron 70B Ultra (NIM)', tag: 'NIM' }
];

const TIER_3_OPENROUTER = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5', tag: 'ELITE' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek-R1 (Paid)', tag: 'ELITE' },
  { id: 'openai/gpt-4o', name: 'GPT-4o Frontier', tag: 'ELITE' }
];

export default function Tab01Exec({ ws }) {
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.3-70b-instruct');
  const [inputBuffer, setInputBuffer] = useState('');
  const [chatLog, setChatLog] = useState([
    { 
      id: 1, 
      sender: 'CHIEF OF STAFF // MONTY', 
      text: 'Mission Control Base 1 is live and standing by. Select an operational brain tier and submit instructions.', 
      type: 'system',
      agent: 'Monty'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const baseInputRef = useRef('');
  const streamBottomRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Elapsed Timer Effect
  useEffect(() => {
    let timer;
    if (isProcessing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isProcessing]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onstart = () => {
      setIsListening(true);
      baseInputRef.current = inputBuffer;
    };

    recog.onresult = (event) => {
      let accumulated = '';
      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript;
      }
      const base = baseInputRef.current ? baseInputRef.current.trim() + ' ' : '';
      setInputBuffer(base + accumulated.trimStart());
    };

    recog.onerror = (err) => {
      console.warn('Speech recognition warning:', err.error);
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        setIsListening(false);
        alert('Microphone access blocked. Please check browser permission settings.');
      } else if (err.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recog.onend = () => {
      if (isListeningRef.current) {
        try { recog.start(); } catch (e) { setIsListening(false); }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recog;
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const toggleMic = () => {
    if (isProcessing) return;
    if (!speechSupported) {
      alert('Chrome Web Speech is only supported natively in Google Chrome.');
      return;
    }
    if (!recognitionRef.current) return;

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try { recognitionRef.current.stop(); } catch (err) {}
    } else {
      try {
        baseInputRef.current = inputBuffer;
        isListeningRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(true);
      }
    }
  };

  const formatElapsed = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopySingleMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleTerminateBatchJob = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    window.dispatchEvent(new CustomEvent('universal-all-stop', {
      detail: { source: 'Tab01Exec', timestamp: Date.now() }
    }));

    try {
      await fetch('http://127.0.0.1:8081/api/all-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'TERMINATE_BATCH_JOB_TRIGGERED', timestamp: Date.now() })
      });
    } catch (e) {
      console.warn('Base 1 all-stop tripwire pinged:', e.message);
    }

    setIsProcessing(false);
    setInputBuffer('');

    setChatLog([
      { 
        id: Date.now(), 
        sender: 'SYSTEM // BATCH TERMINATED', 
        text: 'Batch job terminated. Active inference aborted and terminal cleared. System restored to idle state.', 
        type: 'error', 
        agent: 'System' 
      }
    ]);
  };

  const handleGenerateCleanDirective = () => {
    const cleanPayload = `### Operational System Architecture & PRD Synthesis Directive

**1. MISSION OBJECTIVE & SCOPE:**
Execute complete technical architecture, operational parameters, and production-grade specifications for the active project. Enforce strict adherence to Warlord SOP standards, zero-state telemetry initialization, and system memory integrity.

**2. STAGE EXECUTION MANDATES (NO PLACEHOLDERS):**
- TURN 1 (System Analysis & Architecture): Deconstruct technical requirements, service bindings, port listeners, and dependency chains. Provide concrete data layouts.
- TURN 2 (Director Critique & Attack Vectors): Identify performance bottlenecks, race conditions, edge-case memory poisoning (anti-NaN buffers), and failure modes.
- TURN 3 (Quant & Operational Synthesis): Synthesize architecture with execution triggers, telemetry streams, and backend bridge requirements.
- TURN 4 (Refinement & Code Hardening): Deliver interface structures, exact parameters, WebSocket payload formats, and runtime zero-state guards.
- TURN 5 (The Judge Gate Final PRD Lock & Tool Allocation): Validate all preceding turns, lock the final production specification, and append the formal '### DISPATCH MANIFEST' binding required tools from the Warlord Registry to assigned director agents.

**3. CORE EXECUTION MANDATE:**
Provide complete, production-ready specifications only. Zero truncated diffs. Zero conversational filler. Do not return one-word confirmations.`;

    setInputBuffer(cleanPayload);
  };

  const handleSend = async () => {
    if (!inputBuffer.trim() || isProcessing) return;

    const userText = inputBuffer.trim();
    setInputBuffer('');
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const lower = userText.toLowerCase();
    let targetedAgent = 'Monty';
    if (lower.includes('roxy')) targetedAgent = 'Roxy';
    else if (lower.includes('valery') || lower.includes('valerie')) targetedAgent = 'Valerie';
    else if (lower.includes('jaz') || lower.includes('jasmine')) targetedAgent = 'Jaz';
    else if (lower.includes('tess')) targetedAgent = 'Tess';
    else if (lower.includes('amber')) targetedAgent = 'Amber';
    else if (lower.includes('charlie')) targetedAgent = 'Charlie';
    else if (lower.includes('jack')) targetedAgent = 'Jack';
    else if (lower.includes('silas')) targetedAgent = 'Silas';
    else if (lower.includes('atlas')) targetedAgent = 'Atlas';

    setChatLog(prev => [
      ...prev,
      { id: Date.now(), sender: 'COMMANDER // MIKE', text: userText, type: 'user', agent: 'Mike' }
    ]);

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://127.0.0.1:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: selectedModel,
          prompt: userText,
          director: 'ALL DIRECTORS // AUTO-ROUTING'
        })
      });

      const data = await response.json();
      
      setChatLog(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          sender: `${targetedAgent.toUpperCase()} // ${data.activeModelUsed || selectedModel}`, 
          text: data.reply || data.error || 'No response returned from daemon.', 
          type: 'system', 
          agent: targetedAgent
        }
      ]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setChatLog(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'DAEMON // ERROR', text: `Failed to reach Base 1 Master Daemon: ${err.message}`, type: 'error', agent: 'Daemon' }
      ]);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handlePushToWarRoom = () => {
    if (isProcessing) return;

    let payload = inputBuffer.trim();
    if (!payload) {
      const lastSysMsg = [...chatLog].reverse().find(m => m.type === 'system' && m.agent !== 'System');
      if (lastSysMsg) {
        payload = lastSysMsg.text;
      } else {
        const lastUserMsg = [...chatLog].reverse().find(m => m.type === 'user');
        payload = lastUserMsg ? lastUserMsg.text : '';
      }
    }

    if (!payload) {
      alert('No prompt or message available to push to War Room.');
      return;
    }

    const currentProject = localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'WAR ROOM - DIRECTOR BOARD KAGGLE TEST';

    window.dispatchEvent(new CustomEvent('push-to-warroom', {
      detail: { payload, project: currentProject }
    }));

    setChatLog(prev => [
      ...prev,
      { id: Date.now(), sender: 'SYSTEM // ROUTER', text: `Clean directive payload successfully dispatched to Tab 02 War Room for [${currentProject}].`, type: 'system', agent: 'System' }
    ]);
  };

  const handleCls = () => {
    if (isProcessing) return;
    setInputBuffer('');
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setChatLog([
      { id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal cleared. Exec pipeline re-initialized.', type: 'system', agent: 'System' }
    ]);
  };

  const lastSystemMsg = [...chatLog].reverse().find(m => m.type === 'system');

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2 select-none">
      
      {/* LEFT NAVIGATION / BRAIN TIERS */}
      <div className="w-80 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 overflow-hidden flex-shrink-0">
        <div className="px-3 py-2 bg-[#14171c] flex items-center justify-between border-b border-[#1f242d] mb-2 rounded">
          <span className="text-[#ffb800] font-bold text-xs tracking-wider">EXEC CONTROL PANEL</span>
          <span className="text-[9px] border border-[#10b981] text-[#10b981] px-1.5 py-0.5 rounded font-mono font-bold">PINNED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          
          {/* TIER 1 */}
          <div className="space-y-1">
            <div className="text-[10px] text-[#5c6b7f] font-bold tracking-wider px-1">TIER 1: OLLAMA (LOCAL)</div>
            {TIER_1_LOCAL.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  selectedModel === m.id
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold'
                    : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                }`}
              >
                <span className="truncate pr-1">{m.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-[#5c6b7f] bg-[#1f242d]">{m.tag}</span>
              </button>
            ))}
          </div>

          {/* TIER 2 */}
          <div className="space-y-1">
            <div className="text-[10px] text-[#5c6b7f] font-bold tracking-wider px-1">TIER 2: HARVESTED CLUSTERS (FREE)</div>
            {TIER_2_HARVESTED.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  selectedModel === m.id
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold'
                    : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                }`}
              >
                <span className="truncate pr-1">{m.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-[#10b981] bg-[#10b981]/10">{m.tag}</span>
              </button>
            ))}
          </div>

          {/* TIER 3 */}
          <div className="space-y-1">
            <div className="text-[10px] text-[#5c6b7f] font-bold tracking-wider px-1">TIER 3: OPENROUTER (ELITE)</div>
            {TIER_3_OPENROUTER.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all ${
                  isProcessing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  selectedModel === m.id
                    ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold'
                    : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                }`}
              >
                <span className="truncate pr-1">{m.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-[#ffb800] bg-[#ffb800]/10">{m.tag}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT CHAT PANEL */}
      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2 uppercase tracking-widest font-bold">
            STATUS: <span className="text-[#10b981]">CONNECTED</span> | BRAIN: <span className="text-[#ffb800]">{selectedModel}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {lastSystemMsg && (
              <SpeakerBtn text={lastSystemMsg.text} agent={lastSystemMsg.agent || 'Monty'} label="VOICE BRIEF" />
            )}
            <button 
              onClick={() => {
                const text = chatLog.map(l => `[${l.sender}]: ${l.text}`).join('\n\n');
                navigator.clipboard.writeText(text);
                alert('Full conversation copied to clipboard.');
              }}
              className="text-[10px] text-[#ffb800] border border-[#ffb800]/40 px-2 py-0.5 rounded hover:bg-[#ffb800]/10 cursor-pointer font-mono"
            >
              COPY FULL CONVERSATION
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-text cursor-text custom-scrollbar">
          {chatLog.map(log => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center justify-between select-none">
                <span className={`font-bold text-[11px] tracking-wide ${
                  log.type === 'error' ? 'text-[#ef4444]' :
                  log.type === 'system' ? 'text-[#10b981]' : 
                  log.type === 'user' ? 'text-[#ffb800]' : 'text-[#8fa0b5]'
                }`}>
                  {log.sender}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopySingleMessage(log.id, log.text)}
                    className="flex items-center gap-1 text-[10px] text-[#8fa0b5] hover:text-[#ffb800] px-1.5 py-0.5 rounded border border-[#1f242d] hover:border-[#ffb800]/40 bg-[#0d0f12] cursor-pointer transition-all"
                    title="Copy this section only"
                  >
                    {copiedMessageId === log.id ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessageId === log.id ? 'COPIED' : 'COPY'}</span>
                  </button>

                  {log.type === 'system' && (
                    <SpeakerBtn text={log.text} agent={log.agent || 'Monty'} label="LISTEN" />
                  )}
                </div>
              </div>
              <div className={`text-xs leading-relaxed pl-3 py-2 rounded border select-text whitespace-pre-wrap ${
                log.type === 'error' 
                  ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]' 
                  : 'bg-[#101317]/60 border-[#14181f] text-[#d1d5db]'
              }`}>
                {log.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center justify-between py-2.5 px-3 border border-[#ffb800]/40 bg-[#14171c]/90 rounded shadow-[0_0_12px_rgba(255,184,0,0.15)] font-mono">
              <div className="flex items-center gap-2.5 text-[#ffb800]">
                <Loader2 className="w-4 h-4 text-[#ffb800] animate-spin" />
                <span className="text-xs font-bold tracking-wide">
                  Active Inference Sequence executing... [ELAPSED: {formatElapsed(elapsedSeconds)}]
                </span>
              </div>
              <button
                type="button"
                onClick={handleTerminateBatchJob}
                title="Immediate Override: Abort active sequence and clear terminal"
                className="px-2.5 py-1 bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#fca5a5] hover:text-white border border-[#ef4444]/50 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>TERMINATE BATCH JOB</span>
              </button>
            </div>
          )}
          <div ref={streamBottomRef} />
        </div>

        {/* Input Dock */}
        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none relative">
          
          {/* Universal Execution Lock Banner */}
          {isProcessing && (
            <div className="flex items-center justify-between bg-[#14171c] border border-[#ffb800] px-3 py-1.5 rounded text-[11px] font-mono text-[#ffb800] shadow-[0_0_12px_rgba(255,184,0,0.15)]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#ffb800] animate-spin" />
                <span className="font-bold tracking-wider">
                  SEQUENCE ACTIVE // INFERENCE IN PROGRESS [{formatElapsed(elapsedSeconds)}]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#ffb800]/70 font-bold bg-[#ffb800]/10 px-1.5 py-0.5 rounded border border-[#ffb800]/30">BUSY_LOCK</span>
                <button
                  type="button"
                  onClick={handleTerminateBatchJob}
                  className="px-2 py-0.5 bg-[#450a0a] hover:bg-[#7f1d1d] text-[#fca5a5] hover:text-white border border-[#7f1d1d] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Square className="w-2.5 h-2.5 fill-current text-[#ef4444]" />
                  <span>TERMINATE</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <div className="flex items-center gap-2">
              <label className={`flex items-center gap-2 font-bold tracking-wider transition-colors select-none ${
                isProcessing ? 'text-[#5c6b7f] cursor-not-allowed' : 'text-[#ffb800] hover:text-[#fef08a] cursor-pointer'
              }`}>
                <Paperclip className={`w-4 h-4 ${isProcessing ? 'text-[#5c6b7f]' : 'text-[#ffb800]'}`} />
                <span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
              </label>

              <button
                type="button"
                onClick={handleGenerateCleanDirective}
                disabled={isProcessing}
                title="Populate input dock with complete 5-stage institutional directive"
                className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#080a0c] hover:bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/40 rounded text-[10px] font-mono font-bold transition-all cursor-pointer"
              >
                <Wand2 className="w-3 h-3 text-[#ffb800]" />
                <span>GENERATE DIRECTIVE</span>
              </button>
            </div>

            <button
              type="button"
              onClick={toggleMic}
              disabled={isProcessing}
              title={isListening ? "Stop Chrome Mic" : "Dictate via Chrome Web Speech"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                isProcessing ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isListening 
                  ? 'bg-[#ffb800] text-black border border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.5)] animate-pulse' 
                  : 'bg-[#0d0f12] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 text-black" /> : <Mic className="w-3.5 h-3.5 text-[#ffb800]" />}
              <span>{isListening ? 'LISTENING (CLICK TO STOP)' : 'CHROME MIC'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value)}
              disabled={isProcessing}
              placeholder={
                isProcessing
                  ? `Directive sequence executing... [Elapsed: ${formatElapsed(elapsedSeconds)}]`
                  : isListening 
                  ? "Streaming voice via Chrome... speak naturally..." 
                  : `Enter command for Monty dispatch via [${selectedModel}]...`
              }
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSend();
                }
              }}
              className={`w-full bg-[#0d0f12] text-[#e2e8f0] border rounded p-2.5 text-xs font-mono focus:outline-none resize-none select-text transition-colors ${
                isProcessing
                  ? 'opacity-60 border-[#ffb800]/40 bg-[#080a0c] cursor-not-allowed'
                  : isListening
                  ? 'border-[#ffb800] ring-1 ring-[#ffb800]' 
                  : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'
              }`}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-1 font-mono">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSend}
                disabled={isProcessing || !inputBuffer.trim()}
                className={`px-4 py-1.5 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 ${
                  isProcessing || !inputBuffer.trim()
                    ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                    : 'bg-[#ffb800] text-black hover:bg-[#e6a600] cursor-pointer'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffb800]" />
                    <span className="text-[#ffb800]">EXECUTING [{formatElapsed(elapsedSeconds)}]</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handlePushToWarRoom}
                disabled={isProcessing}
                className={`px-3.5 py-1.5 bg-[#14171c] text-[#38bdf8] border border-[#232832] font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 ${
                  isProcessing ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#38bdf8]/50 cursor-pointer'
                }`}
              >
                PUSH TO WAR ROOM
              </button>

              <button
                onClick={() => alert('Refinement constraints injected.')}
                disabled={isProcessing}
                className={`px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] ${
                  isProcessing ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#1c2129] hover:text-white cursor-pointer'
                }`}
              >
                REFINE
              </button>

              <button
                onClick={handleCls}
                disabled={isProcessing}
                className={`px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] ${
                  isProcessing ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#592525] cursor-pointer'
                }`}
              >
                CLS
              </button>

              {/* ALL STOP TRIPWIRE BUTTON */}
              <button
                type="button"
                onClick={handleTerminateBatchJob}
                title="Universal Emergency Stop: Kill inference loops, daemon tasks, and release CPU"
                className="px-3 py-1.5 bg-[#450a0a]/60 hover:bg-[#7f1d1d] text-[#fca5a5] hover:text-white border border-[#7f1d1d] font-bold rounded text-[11px] flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>ALL STOP</span>
              </button>
            </div>

            <div className="text-[10px] text-[#5c6b7f]">
              Ctrl+Enter to Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
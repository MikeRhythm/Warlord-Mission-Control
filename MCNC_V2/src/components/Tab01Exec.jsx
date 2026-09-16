import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Loader2, Check, Mic, MicOff, Send, RefreshCw, AlertOctagon } from 'lucide-react';
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
    { id: 1, sender: 'CHIEF OF STAFF // MONTY', text: 'Mission Control Base 1 is live and standing by. Select an operational brain tier and submit instructions.', type: 'system' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const streamBottomRef = useRef(null);

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isProcessing]);

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

    recog.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputBuffer((prev) => (prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim()));
      }
    };

    recog.onerror = (err) => {
      console.warn('Speech recognition warning:', err.error);
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        setIsListening(false);
        alert('Microphone access blocked. Please check your browser permission settings.');
      }
    };

    recog.onend = () => {
      if (isListening) {
        try { recog.start(); } catch (e) { setIsListening(false); }
      }
    };

    recognitionRef.current = recog;
    return () => { if (recog) recog.stop(); };
  }, [isListening]);

  const toggleMic = () => {
    if (!speechSupported) {
      alert('Chrome Speech Recognition is only supported natively in Google Chrome.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async () => {
    if (!inputBuffer.trim() || isProcessing) return;

    const userText = inputBuffer.trim();
    setInputBuffer('');
    setIsListening(false);
    recognitionRef.current?.stop();

    setChatLog(prev => [
      ...prev,
      { id: Date.now(), sender: 'COMMANDER // MIKE', text: userText, type: 'user' }
    ]);

    setIsProcessing(true);

    try {
      const response = await fetch('http://127.0.0.1:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          sender: `MONTY // ${data.activeModelUsed || selectedModel}`, 
          text: data.reply || data.error || 'No response returned from daemon.', 
          type: 'system' 
        }
      ]);
    } catch (err) {
      setChatLog(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'DAEMON // ERROR', text: `Failed to reach Base 1 Master Daemon: ${err.message}`, type: 'error' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushToWarRoom = () => {
    if (!chatLog.length) return;
    const lastUserMsg = [...chatLog].reverse().find(m => m.type === 'user');
    const payload = lastUserMsg ? lastUserMsg.text : inputBuffer.trim();
    if (!payload) return;

    window.dispatchEvent(new CustomEvent('push-to-warroom', {
      detail: { payload, project: 'MCNC REACT VITE' }
    }));

    setChatLog(prev => [
      ...prev,
      { id: Date.now(), sender: 'SYSTEM // ROUTER', text: 'Payload successfully dispatched to Tab 02 War Room.', type: 'system' }
    ]);
  };

  const handleCls = () => {
    setInputBuffer('');
    setIsListening(false);
    recognitionRef.current?.stop();
    setChatLog([
      { id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal cleared. Exec pipeline re-initialized.', type: 'system' }
    ]);
  };

  const lastMontyMsg = [...chatLog].reverse().find(m => m.type === 'system');

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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
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
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
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
            {lastMontyMsg && (
              <SpeakerBtn text={lastMontyMsg.text} label="VOICE BRIEF" />
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

                {log.type === 'system' && (
                  <SpeakerBtn text={log.text} label="LISTEN" />
                )}
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
            <div className="flex items-center gap-2 text-[#ffb800] py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-mono">Monty is processing directive across neural cluster...</span>
            </div>
          )}
          <div ref={streamBottomRef} />
        </div>

        {/* Input Dock */}
        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none">
          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <label className="text-[#ffb800] hover:text-[#fef08a] flex items-center gap-2 font-bold tracking-wider transition-colors cursor-pointer select-none">
              <Paperclip className="w-4 h-4 text-[#ffb800]" />
              <span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
            </label>
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? "Stop Chrome Mic" : "Dictate via Chrome Web Speech"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                isListening 
                  ? 'bg-[#ffb800] text-black border border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.4)]' 
                  : 'bg-[#0d0f12] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 text-black" /> : <Mic className="w-3.5 h-3.5 text-[#ffb800]" />}
              <span>{isListening ? 'STOP MIC' : 'CHROME MIC'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value)}
              placeholder={
                isListening 
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
                isListening ? 'border-[#ffb800] ring-1 ring-[#ffb800]' : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'
              }`}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSend}
                disabled={isProcessing || !inputBuffer.trim()}
                className={`px-4 py-1.5 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isProcessing || !inputBuffer.trim()
                    ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                    : 'bg-[#ffb800] text-black hover:bg-[#e6a600]'
                }`}
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>SUBMIT</span>
              </button>
              <button
                onClick={handlePushToWarRoom}
                className="px-3.5 py-1.5 bg-[#14171c] text-[#38bdf8] border border-[#232832] hover:border-[#38bdf8]/50 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                PUSH TO WAR ROOM
              </button>
              <button
                onClick={() => alert('Refinement constraints injected.')}
                className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer"
              >
                REFINE
              </button>
              <button
                onClick={handleCls}
                className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] cursor-pointer"
              >
                CLS
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
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, AlertOctagon, Copy, Check, ChevronDown, ChevronUp, Sparkles, Mic, MicOff, Paperclip, ArrowRightCircle, RefreshCw, Trash2 
} from 'lucide-react';

const BRAIN_TIERS = [
  {
    category: 'TIER 1: OLLAMA (LOCAL)',
    models: [
      { id: 'llama3:latest', name: 'Llama 3 (Local)', tag: 'LOCAL' },
      { id: 'qwen2.5:latest', name: 'Qwen 2.5 (Local)', tag: 'LOCAL' },
      { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder', tag: 'LOCAL' }
    ]
  },
  {
    category: 'TIER 2: HARVESTED CLUSTERS (FREE)',
    models: [
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NIM)', tag: 'NIM' },
      { id: 'groq/llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', tag: 'GROQ' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Studio)', tag: 'GEMINI' },
      { id: 'nvidia/nemotron-70b-ultra', name: 'Nemotron 70B Ultra (NIM)', tag: 'NIM' }
    ]
  },
  {
    category: 'TIER 3: OPENROUTER (ELITE)',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5', tag: 'ELITE' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek-R1 (Paid)', tag: 'ELITE' },
      { id: 'openai/gpt-4o', name: 'GPT-4o Frontier', tag: 'ELITE' }
    ]
  }
];

export default function Tab01Exec({ ws }) {
  const [selectedBrain, setSelectedBrain] = useState('meta/llama-3.3-70b-instruct');
  const [inputPrompt, setInputPrompt] = useState('');
  const [conversation, setConversation] = useState([
    {
      id: 1,
      sender: 'CHIEF OF STAFF // MONTY',
      text: 'Mission Control Base 1 is live and standing by. Select an operational brain tier and submit instructions.',
      type: 'system',
      timestamp: 'INITIALIZED'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [conversation]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setConversation(prev => [...prev, {
        id: Date.now(),
        sender: 'SYSTEM // UPLOAD',
        text: `[ATTACHMENT STAGED]: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }]);
      e.target.value = null; 
    }
  };

  const handleSendPrompt = async () => {
    if (!inputPrompt.trim() || isLoading) return;
    
    const userText = inputPrompt.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setConversation(prev => [...prev, { id: Date.now(), sender: 'MIKE // WARLORD', text: userText, type: 'user', timestamp }]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, model: selectedBrain })
      });
      
      const data = await response.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setConversation(prev => [
        ...prev, 
        {
          id: Date.now() + 1,
          sender: data.activeModelUsed ? `MONTY // [${data.activeModelUsed}]` : 'CHIEF OF STAFF // MONTY',
          text: data.error ? `Daemon error: ${data.error}` : (data.reply || 'Action executed successfully.'),
          type: data.error ? 'error' : 'agent',
          timestamp: replyTime
        }
      ]);
    } catch (err) {
      setConversation(prev => [...prev, { id: Date.now() + 1, sender: 'CHIEF OF STAFF // MONTY', text: `Daemon failure: ${err.message}`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handlePushToWarRoom = () => {
    const transferPayload = inputPrompt.trim();
    if (!transferPayload) return;
    
    window.dispatchEvent(new CustomEvent('push-to-warroom', { 
      detail: { payload: transferPayload } 
    }));

    setInputPrompt('');
    setConversation(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ROUTER', text: `[PAYLOAD TRANSFERRED] Scope pushed to War Room matrix.`, type: 'system', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
  };

  const handleRefine = () => { setInputPrompt(prev => prev ? `[REFINEMENT CONSTRAINTS]: ${prev}` : ''); };
  const handleCls = () => { setConversation([]); setInputPrompt(''); };
  const handleCopy = (id, text) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleCopyFull = () => { navigator.clipboard.writeText(conversation.map(c => `[${c.timestamp}] ${c.sender}:\n${c.text}\n`).join('\n---\n\n')); };
  const handleAllStop = () => { 
    setIsLoading(false); 
    setConversation(prev => [...prev, { id: Date.now(), sender: 'WARLORD // OVERRIDE', text: '[!] ALL STOP INITIATED.', type: 'error', timestamp: new Date().toLocaleTimeString() }]); 
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2 select-none font-mono">
      <div className="w-80 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 overflow-hidden flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2 bg-[#14171c] border border-[#1f242d] rounded mb-2 text-[#ffb800] font-bold">
          <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /><span className="tracking-wider text-xs">EXEC CONTROL PANEL</span></div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold">PINNED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs border-b border-[#1f242d] cursor-pointer">
              <span>MONTY'S BRAIN TIERS</span>{isPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isPanelOpen && (
              <div className="p-2 space-y-3 bg-[#0a0c0e]">
                {BRAIN_TIERS.map((tierGroup) => (
                  <div key={tierGroup.category} className="space-y-1">
                    <div className="text-[10px] text-[#5c6b7f] font-bold uppercase tracking-wider px-1">{tierGroup.category}</div>
                    {tierGroup.models.map((model) => {
                      const isSelected = selectedBrain === model.id;
                      let tagColor = 'bg-[#1f242d] text-[#5c6b7f]';
                      if (isSelected) tagColor = 'bg-[#10b981] text-black';
                      else if (model.tag === 'GEMINI') tagColor = 'bg-[#38bdf8]/20 text-[#38bdf8]';
                      else if (model.tag === 'GROQ') tagColor = 'bg-[#f97316]/20 text-[#f97316]';
                      else if (model.tag === 'NIM') tagColor = 'bg-[#10b981]/20 text-[#10b981]';

                      return (
                        <button key={model.id} onClick={() => setSelectedBrain(model.id)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono cursor-pointer transition-all ${isSelected ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/60 font-bold' : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26]'}`}>
                          <span className="truncate pr-1">{model.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tagColor}`}>{model.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#5c6b7f]">STATUS:</span><span className="text-[#10b981] font-bold">CONNECTED</span><span className="text-[#333e4f]">|</span><span className="text-[#5c6b7f]">BRAIN:</span><span className="text-[#ffb800] font-bold uppercase">{selectedBrain}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyFull} className="flex items-center gap-1 px-2.5 py-1 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] border border-[#232832] rounded text-[10px] font-bold cursor-pointer transition-colors">
              <Copy className="w-3.5 h-3.5" /> <span>COPY FULL CONVERSATION</span>
            </button>
            <button onClick={handleAllStop} className="flex items-center gap-1 px-2.5 py-1 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#fca5a5] border border-[#ef4444]/50 rounded text-[10px] font-extrabold cursor-pointer transition-colors">
              <AlertOctagon className="w-3.5 h-3.5 text-[#ef4444]" /> <span>ALL STOP</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text cursor-text custom-scrollbar">
          {conversation.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center justify-between select-none">
                <span className={`font-bold text-[11px] tracking-wide ${msg.type === 'error' ? 'text-[#ef4444]' : msg.type === 'system' ? 'text-[#ffb800]' : msg.type === 'user' ? 'text-[#10b981]' : 'text-[#ffb800]'}`}>
                  {msg.sender} <span className="text-[10px] text-[#5c6b7f] font-normal ml-2">{msg.timestamp}</span>
                </span>
                <button onClick={() => handleCopy(msg.id, msg.text)} className="text-[#5c6b7f] hover:text-white cursor-pointer p-0.5 transition-colors">
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className={`text-xs leading-relaxed pl-3 py-2.5 rounded border select-text whitespace-pre-wrap ${msg.type === 'error' ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]' : msg.type === 'user' ? 'bg-[#101317]/40 border-[#1a1f26] text-[#e2e8f0]' : 'bg-[#101317]/80 border-[#1f242d] text-[#d1d5db]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#38bdf8] p-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded">
              <Loader2 className="w-4 h-4 animate-spin text-[#38bdf8]" /><span>Routing request through {selectedBrain}... Monty generating telemetry response...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none">
          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#ffb800] flex items-center gap-2 font-bold tracking-wider cursor-pointer hover:text-[#fef08a] transition-colors bg-transparent border-none outline-none">
              <Paperclip className="w-4 h-4" /><span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
            </button>
            <button type="button" onClick={() => setIsListening(!isListening)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${isListening ? 'bg-[#ffb800] text-black border border-[#ffb800]' : 'bg-[#0d0f12] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'}`}>
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}<span>CHROME MIC</span>
            </button>
          </div>

          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }}
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (!items) return;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                  const file = items[i].getAsFile();
                  setConversation(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // UPLOAD', text: `[CLIPBOARD IMAGE STAGED]: ${file.name || 'Pasted_Screenshot.png'}`, type: 'system', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
                }
              }
            }}
            placeholder={`Enter command for Monty dispatch via [${selectedBrain}]...`}
            rows={3}
            className="w-full bg-[#0d0f12] text-[#e2e8f0] border border-[#1f242d] rounded p-2.5 text-xs focus:outline-none focus:border-[#ffb800] resize-none select-text transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button onClick={handleSendPrompt} disabled={isLoading || !inputPrompt.trim()} className={`px-4 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${isLoading || !inputPrompt.trim() ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832]' : 'bg-[#ffb800] text-black hover:bg-[#e6a600]'}`}>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Send className="w-3.5 h-3.5" />} <span>SUBMIT</span>
              </button>
              <button onClick={handlePushToWarRoom} className="px-3 py-1.5 bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 text-[#38bdf8] border border-[#38bdf8]/50 font-bold rounded text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors">
                <ArrowRightCircle className="w-3.5 h-3.5" /> <span>PUSH TO WAR ROOM</span>
              </button>
              <button onClick={handleRefine} className="px-3 py-1.5 bg-[#14171c] hover:bg-[#1c2129] hover:text-white text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors">
                <RefreshCw className="w-3 h-3" /> <span>REFINE</span>
              </button>
              <button onClick={handleCls} className="px-3 py-1.5 bg-[#592525]/40 hover:bg-[#592525] text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors">
                <Trash2 className="w-3 h-3" /> <span>CLS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
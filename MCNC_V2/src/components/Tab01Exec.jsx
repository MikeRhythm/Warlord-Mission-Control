import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Paperclip, Send, X, 
  Mic, MicOff, RefreshCw, Cpu,
  Copy, Check, FileText, ChevronDown, ChevronUp,
  Wrench, Sparkles, Layers, Sliders, Users, UserCheck,
  OctagonX
} from 'lucide-react';

const BRAIN_TIERS = [
  {
    id: 'tier1',
    tier: 'TIER 1: OLLAMA (LOCAL)',
    models: [
      { id: 'ollama/llama3', name: 'Llama 3 / CodeLlama', tag: 'Local' },
      { id: 'ollama/deepseek-r1', name: 'DeepSeek-R1 (Quant)', tag: 'Local' },
      { id: 'ollama/qwen2.5-coder', name: 'Qwen 2.5 Coder', tag: 'Local' }
    ]
  },
  {
    id: 'tier2',
    tier: 'TIER 2: NVIDIA NIM',
    models: [
      { id: 'nvidia/meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', tag: 'NIM' },
      { id: 'nvidia/nvidia/nemotron-4-340b-instruct', name: 'Nemotron 340B', tag: 'NIM' }
    ]
  },
  {
    id: 'tier3',
    tier: 'TIER 3: OPENROUTER',
    models: [
      { id: 'openrouter/anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tag: 'Elite' },
      { id: 'openrouter/openai/gpt-4o', name: 'GPT-4o Frontier', tag: 'Elite' }
    ]
  }
];

const DIRECTORS = [
  { id: '00_tess', name: '00 Tess (Quant)' },
  { id: '01_silas', name: '01 Silas (Database)' },
  { id: '02_amber', name: '02 Amber (Copywriter)' },
  { id: '03_ares', name: '03 Ares (Execution)' },
  { id: '04_atlas', name: '04 Atlas (Infrastructure)' },
  { id: '05_valerie', name: '05 Valerie (Relations)' },
  { id: '06_jack', name: '06 Jack (Marketing)' },
  { id: '07_maverick', name: '07 Maverick (SEO)' },
  { id: '08_skyla', name: '08 Skyla (Frontend)' },
  { id: '09_jax', name: '09 Jax (Artwork Omega)' },
  { id: '10_roxy', name: '10 Roxy (Artwork Alpha)' },
  { id: '11_charlie', name: '11 Charlie (Code)' },
  { id: '12_askari', name: '12 The Askari (Security)' },
  { id: '13_vance', name: '13 Vance (Finance)' },
  { id: '14_justin', name: '14 Justin (Risk / Legal)' },
  { id: '15_orion', name: '15 Orion (Strategic Intelligence)' }
];

export default function Tab01Exec() {
  const [selectedModel, setSelectedModel] = useState('nvidia/meta/llama-3.2-90b-vision-instruct');
  const [selectedDirector, setSelectedDirector] = useState('11_charlie');
  const [selectedProject, setSelectedProject] = useState('MCNC');
  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  // Left sidebar accordion controls
  const [isBrainSectionOpen, setIsBrainSectionOpen] = useState(true);
  const [openTiers, setOpenTiers] = useState({ tier1: true, tier2: true, tier3: true });
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'CHIEF OF STAFF // MONTY 2 (BASE 1 PIPELINE)',
      role: 'agent',
      time: '18:15:00',
      text: 'Pipeline active. Exec staging room secured. Multimodal vision and execution bridge initialized. Awaiting direct instructions.'
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const basePromptRef = useRef('');
  const abortControllerRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = (e.clipboardData || window.clipboardData)?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setAttachedFiles((prev) => [
                ...prev,
                { name: `screenshot_${Date.now()}.png`, data: event.target.result, type: 'image' }
              ]);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          { 
            name: file.name, 
            data: event.target.result, 
            type: file.type.startsWith('image/') ? 'image' : 'file' 
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTier = (tierId) => {
    setOpenTiers((prev) => ({ ...prev, [tierId]: !prev[tierId] }));
  };

  // Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const base = basePromptRef.current ? basePromptRef.current.trim() + ' ' : '';
        setInputPrompt(base + (finalTranscript + interimTranscript).trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        basePromptRef.current = inputPrompt;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('STT Start Error:', err);
      }
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullConversation = () => {
    const fullLog = messages.map((m) => {
      const header = `[${m.time}] ${m.sender}:`;
      const atts = m.attachments && m.attachments.length > 0 
        ? `\n[ATTACHMENTS: ${m.attachments.map(a => a.name).join(', ')}]` 
        : '';
      return `${header}${atts}\n${m.text}\n`;
    }).join('\n---\n\n');

    navigator.clipboard.writeText(fullLog);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // EMERGENCY ALL STOP PROTOCOL
  const handleAllStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsStreaming(false);
    setInputPrompt('');
    basePromptRef.current = '';
    setAttachedFiles([]);

    const haltMessage = {
      id: Date.now(),
      sender: 'DEFCON 1 // ALL STOP PROTOCOL',
      role: 'system',
      time: new Date().toLocaleTimeString(),
      text: '**ALL STOP ENGAGED.** All in-flight requests terminated. Audio pipelines cut. Agent execution zeroed. Standing by.'
    };

    setMessages((prev) => [...prev, haltMessage]);
  };

  // Direct Execution Request to Monty Backend
  const executePayload = async (customPrompt, assignedDirectorName = null) => {
    const promptToSend = customPrompt !== undefined ? customPrompt : inputPrompt;
    if (!promptToSend.trim() && attachedFiles.length === 0) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const directorObj = DIRECTORS.find((d) => d.id === selectedDirector);
    const directorLabel = assignedDirectorName || directorObj?.name || 'MONTY';

    const userMessage = {
      id: Date.now(),
      sender: assignedDirectorName 
        ? `MIKE // DELEGATION ➔ [${directorLabel.toUpperCase()}]` 
        : 'MIKE // WARLORD',
      role: 'user',
      time: new Date().toLocaleTimeString(),
      text: promptToSend,
      attachments: [...attachedFiles]
    };

    setMessages((prev) => [...prev, userMessage]);
    const outgoingPrompt = promptToSend;
    const outgoingAttachments = [...attachedFiles];
    
    setInputPrompt('');
    basePromptRef.current = '';
    setAttachedFiles([]);
    setIsStreaming(true);

    // Initialize fresh AbortController for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: outgoingPrompt,
          attachments: outgoingAttachments,
          model: selectedModel,
          director: selectedDirector,
          project: selectedProject
        })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: assignedDirectorName 
            ? `CHIEF OF STAFF // MONTY ➔ [${directorLabel.toUpperCase()}]` 
            : 'CHIEF OF STAFF // MONTY 2',
          role: 'agent',
          time: new Date().toLocaleTimeString(),
          text: data.reply || data.error || 'Execution completed with empty response.'
        }
      ]);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[ALL STOP]: In-flight stream aborted by user.');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'CHIEF OF STAFF // MONTY 2',
            role: 'agent',
            time: new Date().toLocaleTimeString(),
            text: `[COMMUNICATION ERROR]: Could not reach backend daemon at /api/chat. ${err.message}`
          }
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    executePayload();
  };

  // ASSIGN Button Handler: Validates and delegates
  const handleAssign = () => {
    if (!inputPrompt.trim() && attachedFiles.length === 0) {
      alert('Please enter instructions or attach an asset before delegating to a Director.');
      return;
    }

    const directorObj = DIRECTORS.find((d) => d.id === selectedDirector);
    const directorName = directorObj ? directorObj.name : 'Director Agent';
    
    const formattedDelegationPrompt = `[DELEGATION DIRECTIVE // TARGET: ${directorName.toUpperCase()} | PROJECT: ${selectedProject}]\n${inputPrompt.trim()}`;

    executePayload(formattedDelegationPrompt, directorName);
  };

  // CLS Button Handler: Wipes viewport clean
  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'SYSTEM // TELEMETRY',
        role: 'system',
        time: new Date().toLocaleTimeString(),
        text: 'Exec terminal cleared. System ready.'
      }
    ]);
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2">
      {/* Pinned Left Menu: Vertical Accordion Categories */}
      <div className="w-80 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 select-none overflow-hidden">
        <div className="px-2 py-1 text-[#ffb800] font-bold tracking-wider text-xs flex items-center justify-between border-b border-[#1f242d] pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#ffb800]" />
            <span>EXEC CONTROL PANEL</span>
          </div>
          <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] px-1.5 py-0.5 rounded font-mono font-bold">PINNED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {/* CATEGORY 1: MONTY'S BRAIN TIERS */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button
              onClick={() => setIsBrainSectionOpen(!isBrainSectionOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>MONTY'S BRAIN TIERS</span>
              </div>
              {isBrainSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isBrainSectionOpen && (
              <div className="p-2 space-y-3 bg-[#0a0c0e]">
                {BRAIN_TIERS.map((tierGroup) => {
                  const isOpen = openTiers[tierGroup.id];
                  return (
                    <div key={tierGroup.id} className="space-y-1">
                      <button
                        onClick={() => toggleTier(tierGroup.id)}
                        className="w-full flex items-center justify-between text-[10px] text-[#5c6b7f] hover:text-[#8fa0b5] font-semibold tracking-wider px-1 py-0.5 cursor-pointer"
                      >
                        <span>{tierGroup.tier}</span>
                        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isOpen && (
                        <div className="space-y-1 pl-1">
                          {tierGroup.models.map((model) => {
                            const isSelected = selectedModel === model.id;
                            return (
                              <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981] font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                    : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                                }`}
                              >
                                <span className="truncate pr-1">{model.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                  isSelected ? 'bg-[#10b981] text-black' : 'bg-[#1f242d] text-[#5c6b7f]'
                                }`}>
                                  {model.tag}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CATEGORY 2: DIRECTOR TOOLS */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#8fa0b5] hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#38bdf8]" />
                <span>DIRECTOR TOOLS</span>
              </div>
              {isToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isToolsOpen && (
              <div className="p-2 space-y-1.5 bg-[#0a0c0e] text-[11px] text-[#5c6b7f] font-mono">
                <div className="p-1.5 bg-[#14171c] rounded border border-[#1f242d] flex justify-between">
                  <span>WS Daemon Bridge:</span>
                  <span className="text-[#10b981]">Port 8081</span>
                </div>
                <div className="p-1.5 bg-[#14171c] rounded border border-[#1f242d] flex justify-between">
                  <span>File System Access:</span>
                  <span className="text-[#10b981]">Ready</span>
                </div>
                <div className="p-1.5 bg-[#14171c] rounded border border-[#1f242d] flex justify-between">
                  <span>Multimodal Encoder:</span>
                  <span className="text-[#ffb800]">Active</span>
                </div>
              </div>
            )}
          </div>

          {/* CATEGORY 3: ACTIVE SKILLS */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button
              onClick={() => setIsSkillsOpen(!isSkillsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#8fa0b5] hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f43f5e]" />
                <span>ACTIVE SKILLS</span>
              </div>
              {isSkillsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isSkillsOpen && (
              <div className="p-2 space-y-1.5 bg-[#0a0c0e] text-[11px] font-mono">
                <div className="text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded border border-[#10b981]/20">
                  ✔ Multimodal Screenshot Parsing
                </div>
                <div className="text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-1 rounded border border-[#38bdf8]/20">
                  ✔ STT Speech Streaming
                </div>
                <div className="text-[#ffb800] bg-[#ffb800]/10 px-2 py-1 rounded border border-[#ffb800]/20">
                  ✔ 16 Director Delegation Matrix
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-[#1f242d] text-[10px] text-[#5c6b7f] flex justify-between items-center px-1">
          <span>ACTIVE PIPELINE:</span>
          <span className="text-[#10b981] font-bold truncate max-w-[140px]">{selectedModel.split('/').pop()?.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Conversational Stream Viewport & Input Dock */}
      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
        {/* Stream Header, Full Copy Bar & ALL STOP Command */}
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2">
            <span>STATUS: <span className="text-[#10b981] font-bold">CONNECTED</span></span>
            <span>|</span>
            <span>BRAIN: <span className="text-[#ffb800] font-bold">{selectedModel.split('/').pop()?.toUpperCase()}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullConversation}
              className="flex items-center gap-1.5 bg-[#14171c] hover:bg-[#1c2129] text-[#e2e8f0] border border-[#232832] hover:border-[#ffb800] px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer"
              title="Copy entire conversation history to clipboard"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[#10b981]">CONVERSATION COPIED!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-[#ffb800]" />
                  <span>COPY FULL CONVERSATION</span>
                </>
              )}
            </button>

            {/* TOP RIGHT ALL STOP EMERGENCY BUTTON */}
            <button
              onClick={handleAllStop}
              className="flex items-center gap-1.5 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#fca5a5] hover:text-white border border-[#ef4444]/60 px-3 py-1 rounded text-[11px] font-extrabold transition-all shadow-[0_0_8px_rgba(239,68,68,0.3)] cursor-pointer"
              title="Emergency Abort All Operations"
            >
              <OctagonX className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>ALL STOP</span>
            </button>
          </div>
        </div>

        {/* Chat Stream Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-text cursor-text">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1 group">
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-[11px] tracking-wide ${
                    msg.role === 'system' ? 'text-[#ef4444]' :
                    msg.role === 'agent' ? 'text-[#ffb800]' : 
                    msg.role === 'user' ? 'text-[#10b981]' : 'text-[#8fa0b5]'
                  }`}>
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-[#424d5d]">{msg.time}</span>
                </div>

                <button
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#5c6b7f] hover:text-[#ffb800] bg-[#14171c] border border-[#1f242d] px-2 py-0.5 rounded cursor-pointer select-none"
                  title="Copy this message"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#10b981]" />
                      <span className="text-[#10b981] font-bold">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 py-1 select-none">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="border border-[#1f242d] rounded p-1 bg-[#14171c] max-w-xs">
                      {att.type === 'image' ? (
                        <img src={att.data} alt="attachment" className="max-h-36 rounded object-cover" />
                      ) : (
                        <div className="text-[10px] text-[#8fa0b5] px-2 py-1 flex items-center gap-1">
                          <Paperclip className="w-3 h-3 text-[#ffb800]" /> {att.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={`text-xs leading-relaxed pl-3 py-2 rounded border select-text ${
                msg.role === 'system' 
                  ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]' 
                  : 'bg-[#101317]/60 border-[#14181f] text-[#d1d5db]'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-[#ffb800] font-bold text-sm mb-1 mt-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-[#ffb800] font-bold text-xs mb-1 mt-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-[#fef08a] font-bold" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-[#cbd5e1]" {...props} />,
                    code: ({node, inline, ...props}) => inline ? (
                      <code className="bg-[#1e232d] text-[#ffb800] px-1 py-0.5 rounded text-[11px]" {...props} />
                    ) : (
                      <pre className="bg-[#080a0c] border border-[#1f242d] p-2.5 rounded text-[11px] text-[#38bdf8] overflow-x-auto my-2 font-mono">
                        <code {...props} />
                      </pre>
                    )
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="text-[#ffb800] text-xs animate-pulse flex items-center gap-2 select-none">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> MONTY IS PROCESSING PAYLOAD...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Attachment Tray */}
        {attachedFiles.length > 0 && (
          <div className="px-3 py-2 bg-[#14171c] border-t border-[#1f242d] flex flex-wrap gap-2 items-center select-none">
            <span className="text-[10px] text-[#ffb800] font-bold">STAGED ASSETS:</span>
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-[#080a0c] border border-[#232832] px-2 py-1 rounded text-[11px] text-[#e2e8f0]">
                {file.type === 'image' ? (
                  <img src={file.data} alt="thumb" className="w-5 h-5 rounded object-cover" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5 text-[#ffb800]" />
                )}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="text-[#ef4444] hover:text-white ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Dock */}
        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none">
          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <label className="text-[#ffb800] hover:text-[#fef08a] flex items-center gap-2 font-bold tracking-wider transition-colors cursor-pointer select-none">
              <Paperclip className="w-4 h-4 text-[#ffb800]" />
              <span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple 
                className="hidden" 
              />
            </label>

            <div className="flex items-center gap-2">
              {isListening && (
                <span className="text-[#ef4444] text-[10px] font-bold animate-pulse">
                  ● LISTENING (DICTATION ACTIVE)...
                </span>
              )}
              <div className="text-[10px] text-[#10b981] font-mono border border-[#10b981]/40 bg-[#10b981]/15 px-2.5 py-0.5 rounded font-bold">
                [ {selectedModel.split('/').pop()?.toUpperCase()} ACTIVE ]
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={inputPrompt}
              onChange={(e) => {
                setInputPrompt(e.target.value);
                basePromptRef.current = e.target.value;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Enter instructions, code directives, or prompt parameters here... (Paste screenshots with Ctrl+V, or click Mic to dictate)"
              rows={3}
              className="w-full bg-[#0d0f12] text-[#e2e8f0] border border-[#1f242d] rounded p-2.5 text-xs font-mono focus:outline-none focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800] resize-none pr-10 select-text"
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 bottom-3 p-1.5 rounded transition-all cursor-pointer ${
                isListening 
                  ? 'bg-[#ef4444]/20 text-[#ef4444] animate-pulse border border-[#ef4444]' 
                  : 'text-[#5c6b7f] hover:text-[#ffb800] hover:bg-[#14171c]'
              }`}
              title={isListening ? "Stop Voice Dictation" : "Start Voice Dictation"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 bg-[#ffb800] text-black font-bold rounded text-[11px] hover:bg-[#e6a600] transition-colors cursor-pointer"
              >
                SUBMIT
              </button>
              <button 
                onClick={() => setInputPrompt((prev) => prev ? `${prev}\n+ ` : '+ ')}
                className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer"
              >
                + ADD
              </button>
              <button 
                onClick={() => setInputPrompt((prev) => prev ? `Please refine, optimize, and streamline this output:\n\n${prev}` : 'Please refine and optimize the previous response.')}
                className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer"
              >
                REFINE
              </button>
              <button 
                onClick={() => executePayload('Approved. Proceed with direct execution and lock changes into codebase.')}
                className="px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-semibold rounded text-[11px] hover:bg-[#10b981]/30 cursor-pointer"
              >
                APPROVE
              </button>
              <button 
                onClick={clearChat}
                className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] cursor-pointer"
              >
                CLS
              </button>
              {/* BOTTOM STRIP ALL STOP BUTTON */}
              <button 
                onClick={handleAllStop}
                className="px-3 py-1.5 bg-[#ef4444]/20 text-[#fca5a5] border border-[#ef4444]/60 font-extrabold rounded text-[11px] hover:bg-[#ef4444]/40 cursor-pointer flex items-center gap-1"
              >
                <OctagonX className="w-3 h-3 text-[#ef4444]" />
                <span>ALL STOP</span>
              </button>
            </div>

            {/* Project & 16-Director Routing Strip */}
            <div className="flex items-center gap-1.5">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-[#14171c] text-[#a0aec0] border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800]"
              >
                <option value="MCNC">[ PROJECT: MCNC ]</option>
                <option value="RHYTHM">[ PROJECT: RHYTHM ]</option>
                <option value="WARLORD">[ PROJECT: WARLORD ]</option>
              </select>

              <select 
                value={selectedDirector}
                onChange={(e) => setSelectedDirector(e.target.value)}
                className="bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800]"
              >
                {DIRECTORS.map((dir) => (
                  <option key={dir.id} value={dir.id} className="bg-[#0d0f12] text-[#e2e8f0]">
                    [ ASSIGN: {dir.name} ]
                  </option>
                ))}
              </select>

              <button 
                onClick={handleAssign}
                className="px-3.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/50 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                title="Delegate task directly to selected director"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>ASSIGN</span>
              </button>

              <button className="px-4 py-1.5 bg-[#d97706]/30 text-[#fef08a] border border-[#d97706] font-bold rounded text-[11px] hover:bg-[#d97706]/50 cursor-pointer">
                PUSH TO WARROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
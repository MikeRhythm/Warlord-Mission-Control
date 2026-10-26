import React, { useState, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// MCNC TAB 01 EXEC // PERSISTENT MULTI-CHAT & DOMAIN-AWARE COCKPIT
// TOKENS: Obsidian #080a0c | Wire #1f242d | Goldenrod #DAA520 | Sky Blue #38bdf8
// ============================================================================

const RAW_MODEL_TIERS = [
  {
    id: 'tier1',
    tier: 'TIER 1: OLLAMA (LOCAL)',
    models: [
      { id: 'llama3:latest', name: 'Llama 3 (Local)', badge: 'LOCAL', scores: { general: 75, code: 65, mql: 50, graphics: 20, content: 75, quant: 60 } },
      { id: 'hermes3:latest', name: 'Hermes 3 (Local)', badge: 'LOCAL', scores: { general: 82, code: 78, mql: 68, graphics: 30, content: 80, quant: 70 } },
      { id: 'qwen2.5-coder:latest', name: 'Qwen 2.5 Coder', badge: 'LOCAL', scores: { general: 70, code: 88, mql: 84, graphics: 10, content: 60, quant: 75 } }
    ]
  },
  {
    id: 'tier2',
    tier: 'TIER 2: HARVESTED CLUSTERS (FREE)',
    models: [
      { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision (NIM)', badge: 'NIM-VISION', scores: { general: 90, code: 82, mql: 75, graphics: 96, content: 88, quant: 82 } },
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NIM)', badge: 'NIM', scores: { general: 93, code: 85, mql: 78, graphics: 40, content: 92, quant: 84 } },
      { id: 'groq/llama-3.3-70b', name: 'Llama 3.3 70B (Groq)', badge: 'GROQ', scores: { general: 93, code: 85, mql: 78, graphics: 30, content: 92, quant: 84 } },
      { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro (Studio)', badge: 'GEMINI', scores: { general: 92, code: 87, mql: 76, graphics: 92, content: 96, quant: 85 } },
      { id: 'nvidia/nemotron-70b-ultra', name: 'Nemotron 70B Ultra (NIM)', badge: 'NIM', scores: { general: 91, code: 86, mql: 82, graphics: 30, content: 85, quant: 90 } }
    ]
  },
  {
    id: 'tier3',
    tier: 'TIER 3: OPENROUTER (ELITE)',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5', badge: 'ELITE', scores: { general: 96, code: 98, mql: 99, graphics: 94, content: 95, quant: 92 } },
      { id: 'openai/gpt-4o', name: 'GPT-4o Omni', badge: 'ELITE', scores: { general: 95, code: 92, mql: 85, graphics: 96, content: 94, quant: 90 } },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', badge: 'REASONING', scores: { general: 90, code: 96, mql: 95, graphics: 20, content: 80, quant: 99 } }
    ]
  },
  {
    id: 'tier4',
    tier: 'TIER 4: KAGGLE T4 (CLOUD COMPUTE)',
    models: [
      { id: 'KAGGLE/QWEN-2.5-VL-7B', name: 'Qwen 2.5-VL 7B (video)', badge: 'VISION', scores: { general: 78, code: 72, mql: 60, graphics: 95, content: 75, quant: 70 } },
      { id: 'KAGGLE/QWEN-2.5-14B', name: 'Qwen 2.5 14B (content)', badge: '128K', scores: { general: 85, code: 80, mql: 72, graphics: 40, content: 92, quant: 80 } },
      { id: 'KAGGLE/QWEN-2.5-CODER-14B', name: 'Qwen 2.5 Coder 14B (code)', badge: 'DEV', scores: { general: 80, code: 94, mql: 92, graphics: 20, content: 70, quant: 85 } },
      { id: 'KAGGLE/LLAMA-3.1-8B', name: 'Llama 3.1 8B (critique)', badge: 'FAST', scores: { general: 76, code: 74, mql: 65, graphics: 20, content: 78, quant: 72 } }
    ]
  }
];

export default function Tab01Exec({ ws }) {
  // --- Active Operational Discipline Mode ---
  const [activeMode, setActiveMode] = useState('general');

  // --- Dynamic Model Sorter ---
  const modelTiers = useMemo(() => {
    return RAW_MODEL_TIERS.map((tier) => {
      const sortedModels = [...tier.models].sort((a, b) => {
        const scoreA = a.scores[activeMode] || 0;
        const scoreB = b.scores[activeMode] || 0;
        return scoreB - scoreA;
      });
      return {
        ...tier,
        models: sortedModels
      };
    });
  }, [activeMode]);

  // --- Brain & Model Hierarchy ---
  const [selectedBrain, setSelectedBrain] = useState(() => {
    return localStorage.getItem('mcnc_selected_brain') || 'meta/llama-3.2-90b-vision-instruct';
  });

  const [collapsedTiers, setCollapsedTiers] = useState({
    tier1: true,
    tier2: false,
    tier3: true,
    tier4: false
  });

  // Unified Kaggle Status Resolver
  const [kaggleStatus, setKaggleStatus] = useState(() => {
    const raw = localStorage.getItem('kaggle_status') || localStorage.getItem('kaggle_cluster_status');
    return (raw === 'ACTIVE' || raw === 'ONLINE') ? 'ONLINE' : 'STANDBY';
  });

  // Model Selection Handler with Global Broadcast
  const handleSelectModel = (modelId) => {
    setSelectedBrain(modelId);
    localStorage.setItem('mcnc_selected_brain', modelId);
    window.dispatchEvent(new CustomEvent('mcnc-model-selected', { detail: { model: modelId } }));
  };

  // --- Multi-Chat & Master Ledger State ---
  const [activeProject, setActiveProject] = useState('CHIEF MADOTHI FUND');
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState('IDLE');
  const [isMasterChat, setIsMasterChat] = useState(true);
  const [newChatPromptOpen, setNewChatPromptOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [chatCatalog, setChatCatalog] = useState({
    'CHIEF MADOTHI FUND': [],
    'RHYTHM TRADING': [],
    'General_Chats': []
  });

  // --- Execution & Chat State ---
  const [inputCommand, setInputCommand] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDistilling, setIsDistilling] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routingRationale, setRoutingRationale] = useState('');
  const [autoRouteHover, setAutoRouteHover] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState('0.0');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stagedProposal, setStagedProposal] = useState(null);

  const [chatLog, setChatLog] = useState([
    {
      sender: 'SYSTEM',
      collaborators: [],
      title: 'Zero State',
      time: new Date().toLocaleTimeString(),
      text: 'Select a project sub-chat from the ledger on the left or click [+ NEW] to initialize a new thread.'
    }
  ]);

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // --- Auto-Scroll on Chat Updates ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, attachedFiles, isLoading, isDistilling, stagedProposal]);

  // --- Elapsed Timer ---
  useEffect(() => {
    if (isLoading || isDistilling) {
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isLoading, isDistilling]);

  // --- Mount: Load Catalog & Harmonized Listeners ---
  useEffect(() => {
    fetchChatCatalog();

    const currentStoredBrain = localStorage.getItem('mcnc_selected_brain') || selectedBrain;
    localStorage.setItem('mcnc_selected_brain', currentStoredBrain);
    window.dispatchEvent(new CustomEvent('mcnc-model-selected', { detail: { model: currentStoredBrain } }));

    const handleCustomKaggleEvent = (e) => {
      const stat = e.detail?.status;
      if (stat) {
        setKaggleStatus((stat === 'ACTIVE' || stat === 'ONLINE') ? 'ONLINE' : 'STANDBY');
      }
    };

    const handleStorageUpdate = () => {
      const stored = localStorage.getItem('kaggle_status') || localStorage.getItem('kaggle_cluster_status');
      if (stored) {
        setKaggleStatus((stored === 'ACTIVE' || stored === 'ONLINE') ? 'ONLINE' : 'STANDBY');
      }
      const brain = localStorage.getItem('mcnc_selected_brain');
      if (brain && brain !== selectedBrain) setSelectedBrain(brain);
    };
    
    const handleRevert = () => {
      console.log("[01 EXEC] Chat reverted from Vault. Refreshing active ledgers...");
      fetchChatCatalog();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('kaggle-status-changed', handleCustomKaggleEvent);
    window.addEventListener('MCNC_REVERT_CHAT', handleRevert);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('kaggle-status-changed', handleCustomKaggleEvent);
      window.removeEventListener('MCNC_REVERT_CHAT', handleRevert);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [selectedBrain]);

  // --- Catalog & Persistence API Calls ---
  const fetchChatCatalog = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/chats/all');
      const data = await res.json();
      if (data.success && data.catalog) {
        setChatCatalog(data.catalog);
      }
    } catch (err) {
      console.error('Catalog fetch error:', err);
    }
  };

  const loadMasterChat = async (project) => {
    try {
      setIsMasterChat(true);
      setActiveProject(project);
      setActiveChatId('Master');
      setActiveChatTitle(project + ' // MASTER CHAT');

      const res = await fetch('http://localhost:8082/api/chats/master?project=' + encodeURIComponent(project));
      const data = await res.json();

      if (data.success) {
        setChatLog([
          {
            sender: 'MONTY',
            collaborators: ['CHARLIE', 'JACK'],
            title: 'Chief of Staff',
            time: 'SYNCED',
            text: data.content
          }
        ]);
      }
    } catch (err) {
      console.error('Master chat load error:', err);
    }
  };

  const loadSubChat = async (project, chatId, title) => {
    try {
      setIsMasterChat(false);
      setActiveProject(project);
      setActiveChatId(chatId);
      setActiveChatTitle(title);

      const res = await fetch('http://localhost:8082/api/chats/load?project=' + encodeURIComponent(project) + '&id=' + chatId);
      const data = await res.json();

      if (data.success && data.chat) {
        setChatLog(data.chat.messages || []);
      }
    } catch (err) {
      console.error('Sub-chat load error:', err);
    }
  };

  const setZeroState = () => {
    setIsMasterChat(true);
    setActiveChatId(null);
    setActiveChatTitle('IDLE');
    setChatLog([
      {
        sender: 'SYSTEM',
        collaborators: [],
        title: 'Zero State',
        time: new Date().toLocaleTimeString(),
        text: 'Select a project sub-chat from the ledger on the left or click [+ NEW] to initialize a new thread.'
      }
    ]);
    handleClearInput();
  };

  const handleCreateNewChat = async () => {
    if (!newChatTitle.trim()) return;
    const newId = 'Chat_' + Date.now();
    const chatTitle = newChatTitle.trim();
    const initialMsg = [
      {
        sender: 'MONTY',
        collaborators: ['CHARLIE'],
        title: 'Chief of Staff',
        time: new Date().toLocaleTimeString(),
        text: 'Sub-chat thread [' + chatTitle + '] initialized under ' + activeProject + '. Ready for operational directives.'
      }
    ];

    const newChatObj = { id: newId, title: chatTitle, project: activeProject, updatedAt: new Date().toISOString() };
    setChatCatalog((prev) => ({
      ...prev,
      [activeProject]: [newChatObj, ...(prev[activeProject] || [])]
    }));

    setIsMasterChat(false);
    setActiveChatId(newId);
    setActiveChatTitle(chatTitle);
    setChatLog(initialMsg);
    setNewChatTitle('');
    setNewChatPromptOpen(false);

    try {
      await fetch('http://localhost:8082/api/chats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          id: newId,
          title: chatTitle,
          messages: initialMsg
        })
      });
      fetchChatCatalog();
    } catch (err) {
      console.error('Create chat error:', err);
    }
  };

  const handleDeleteChat = async (e, project, chatId, title) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete thread "' + title + '"?')) return;

    setChatCatalog((prev) => ({
      ...prev,
      [project]: (prev[project] || []).filter((c) => c.id !== chatId)
    }));

    if (activeChatId === chatId) {
      setZeroState();
    }

    try {
      await fetch('http://localhost:8082/api/chats/delete?project=' + encodeURIComponent(project) + '&id=' + chatId, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Delete chat error:', err);
    }
  };

  const handleArchiveChat = async (e, project, chatId, title) => {
    e.stopPropagation();
    if (!window.confirm('Archive thread "' + title + '" into ' + project + ' Master Chat and Docs?')) return;

    try {
      const res = await fetch('http://localhost:8082/api/chats/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          chatId,
          title,
          summary: 'Archived thread [' + title + '] containing ' + chatLog.length + ' exchanges. Operational artifacts committed to disk.'
        })
      });

      const data = await res.json();
      if (data.success) {
        await fetchChatCatalog();
        if (activeChatId === chatId) {
          setZeroState();
        }
      } else {
        alert('Archive failed: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Archive chat error:', err);
      alert('Archive network failure: Ensure server_pipeline.js is running on 8082');
    }
  };

  // --- Voice Handlers ---
  const toggleSpeech = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g, ''));
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputCommand((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // --- Control Bar Actions ---
  const handleCopyMsg = (text) => navigator.clipboard.writeText(text);

  const handleCopyAll = () => {
    const fullLog = chatLog.map((msg) => '[' + msg.sender + ']\n' + msg.text).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullLog);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleClearInput = () => {
    setInputCommand('');
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCLS = () => {
    handleAllStop();
    setZeroState();
  };

  const handleAllStop = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsDistilling(false);
  };

  const handleRefine = () => {
    const lastUserMsg = [...chatLog].reverse().find((msg) => msg.sender === 'MIKE');
    if (lastUserMsg) {
      const rawText = lastUserMsg.text.replace(/\[ATTACHMENT:.*\]/g, '').trim();
      setInputCommand(rawText);
      textareaRef.current?.focus();
    }
    setIsLoading(false);
    setIsDistilling(false);
  };

  // --- SUPERPOWER: AUTO-ROUTE INTELLIGENT DISPATCH SWITCH ---
  const handleAutoRouteLLM = async () => {
    const promptDraft = inputCommand.trim();
    if (!promptDraft) {
      setRoutingRationale('PROMPT DOCK EMPTY // ENTER TEXT FIRST TO AUTO-ROUTE');
      setTimeout(() => setRoutingRationale(''), 3000);
      return;
    }

    setIsRouting(true);
    setRoutingRationale('ANALYZING COGNITIVE DENSITY & TAXONOMY...');

    try {
      const res = await fetch('http://localhost:8082/api/router/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: promptDraft,
          activeMode
        })
      });

      if (!res.ok) throw new Error('Classifier conduit unavailable on 8082');
      const data = await res.json();

      if (data.recommendedModel) {
        handleSelectModel(data.recommendedModel);

        if (data.tierId) {
          setCollapsedTiers((prev) => ({
            ...prev,
            [data.tierId]: false
          }));
        }

        if (data.mode) {
          setActiveMode(data.mode);
        }

        setRoutingRationale(`ROUTED: ${data.recommendedModel.toUpperCase()} // ${data.rationale}`);
        setTimeout(() => setRoutingRationale(''), 6000);
      }
    } catch (err) {
      console.warn('Fallback local regex routing activated:', err.message);
      const text = promptDraft.toLowerCase();
      let targetModel = 'hermes3:latest';
      let tier = 'tier1';
      let rationale = 'LOCAL SOVEREIGN DISPATCH';

      if (text.includes('prd') || text.includes('war room') || text.includes('directive //')) {
        targetModel = 'deepseek/deepseek-r1';
        tier = 'tier3';
        rationale = 'REASONING ARCHITECTURE // DEEPSEEK R1';
      } else if (text.includes('landing page') || text.includes('html') || text.includes('code') || text.includes('react')) {
        targetModel = 'anthropic/claude-3.5-sonnet';
        tier = 'tier3';
        rationale = 'FRONTEND SYNTHESIS // CLAUDE 3.5 SONNET';
      } else if (text.includes('copy') || text.includes('marketing') || text.includes('story')) {
        targetModel = 'google/gemini-1.5-pro';
        tier = 'tier2';
        rationale = 'CONTENT & NARRATIVE // GEMINI 1.5 PRO';
      }

      handleSelectModel(targetModel);
      setCollapsedTiers((prev) => ({ ...prev, [tier]: false }));
      setRoutingRationale(`AUTO-LOCKED: ${targetModel.toUpperCase()} // ${rationale}`);
      setTimeout(() => setRoutingRationale(''), 5000);
    } finally {
      setIsRouting(false);
    }
  };

  const handleCreatePrompt = async () => {
    if (chatLog.length <= 1) {
      alert('Conversation log is empty. Exchange requirements with Monty first.');
      return;
    }

    setIsDistilling(true);
    setElapsedSeconds('0.0');

    try {
      const rawTranscript = chatLog.map((m) => '[' + m.sender + ']: ' + m.text).join('\n\n');
      const distillationTask = 'You are MONTY, Chief of Staff.\nAnalyze the following conversation exchange with Mike. Distill it into an executable directive for the War Room:\n' + rawTranscript;

      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedBrain,
          prompt: distillationTask,
          project: activeProject
        })
      });

      const data = await response.json();
      const synthesizedPrompt = (data.reply || '').trim();

      if (synthesizedPrompt) {
        setInputCommand(synthesizedPrompt);
        textareaRef.current?.focus();
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'MONTY [PROMPT CREATED]',
            collaborators: ['CHARLIE'],
            title: 'Chief of Staff',
            time: new Date().toLocaleTimeString(),
            text: 'Actionable directive synthesized from conversation. Ready in input dock for inspection or War Room push.'
          }
        ]);
      }
    } catch (err) {
      console.error('Distillation Error:', err);
      alert('Prompt synthesis failed: ' + err.message);
    } finally {
      setIsDistilling(false);
    }
  };

  const handlePushToWarRoom = () => {
    const promptToSend = inputCommand.trim();
    if (!promptToSend) {
      alert('No synthesized prompt in input dock. Click "CREATE PROMPT" first.');
      return;
    }
    localStorage.setItem('mcnc_warroom_seed_prompt', promptToSend);
    localStorage.setItem('mcnc_warroom_seed_project', activeProject);
    alert('Directive staged for War Room [Tab 02] under project: ' + activeProject);
  };

  // --- Message Dispatch ---
  const handleSendMessage = async () => {
    if (!inputCommand.trim() || isMasterChat || isLoading) return;

    abortControllerRef.current = new AbortController();
    const payloadText = inputCommand;
    const currentFiles = [...attachedFiles];

    const userMsg = {
      sender: 'MIKE',
      collaborators: [],
      title: 'Executive Control',
      time: new Date().toLocaleTimeString(),
      text: payloadText,
      attachments: currentFiles
    };

    const updatedLog = [...chatLog, userMsg];
    setChatLog(updatedLog);
    handleClearInput();
    setIsLoading(true);
    setElapsedSeconds('0.0');

    try {
      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          model: selectedBrain,
          prompt: payloadText,
          project: activeProject,
          chatId: activeChatId,
          attachments: currentFiles,
          history: updatedLog
        })
      });

      const data = await response.json();
      const reply = data.reply || data.output || 'Transmission processed and staged on Base 1.';

      const proposeMatch = reply.match(/```diff([\s\S]*?)```/);
      if (proposeMatch) {
        setStagedProposal({
          diffText: proposeMatch[1].trim(),
          newContent: reply.split('```diff')[0].trim()
        });
      }

      const aiMsg = {
        sender: data.sender || 'MONTY',
        collaborators: data.collaborators || ['CHARLIE', 'JACK'],
        title: data.title || 'Chief of Staff',
        time: new Date().toLocaleTimeString(),
        text: reply
      };

      const finalMessages = [...updatedLog, aiMsg];
      setChatLog(finalMessages);

      await fetch('http://localhost:8082/api/chats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          id: activeChatId,
          title: activeChatTitle,
          messages: finalMessages
        })
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setChatLog((prev) => [...prev, { sender: 'SYSTEM', collaborators: [], title: 'System', time: new Date().toLocaleTimeString(), text: 'Execution aborted by Mike.' }]);
      } else {
        console.error('Server Bridge Error:', err);
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'MONTY [FAIL]',
            collaborators: ['CHARLIE', 'JACK'],
            title: 'Chief of Staff',
            time: new Date().toLocaleTimeString(),
            text: 'Daemon link failure: ' + err.message + '. Ensure node server.js is running on Port 8081.'
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleConfirmFileWrite = async () => {
    if (!stagedProposal) return;
    try {
      const response = await fetch('http://localhost:8081/api/file/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: stagedProposal.filePath,
          content: stagedProposal.newContent,
          confirmed: true
        })
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setChatLog((prev) => [
          ...prev,
          { sender: 'SYSTEM', collaborators: [], title: 'System', time: new Date().toLocaleTimeString(), text: 'Confirmed: ' + stagedProposal.filePath + ' has been written to disk.' }
        ]);
        setStagedProposal(null);
      }
    } catch (err) {
      alert('File write failed: ' + err.message);
    }
  };

  // --- SOP 01 Identity Header Renderer ---
  const renderIdentityHeader = (msg) => {
    if (msg.sender === 'MIKE') {
      return (
        <div className="flex items-center gap-2">
          <span className="bg-[#DAA520] text-[#080a0c] px-2 py-0.5 rounded text-[10px] font-bold">
            [MIKE] Executive Control
          </span>
          <span className="text-gray-500 text-[9px]">{msg.time}</span>
        </div>
      );
    }

    if (msg.sender === 'SYSTEM') {
      return (
        <div className="flex items-center gap-2">
          <span className="bg-[#1f242d] text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold">
            [SYSTEM]
          </span>
          <span className="text-gray-500 text-[9px]">{msg.time}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="bg-[#14171c] border border-[#DAA520] text-[#DAA520] px-2 py-0.5 rounded text-[10px] font-bold">
          [{msg.sender}] here, {msg.title || 'Director'}.
        </span>
        {msg.collaborators && msg.collaborators.length > 0 && (
          <span className="text-[#94A3B8] text-[10px] flex items-center gap-1">
            Collaborating:
            {msg.collaborators.map((c, idx) => (
              <span key={idx} className="bg-[#0b0e14] border border-[#C5BD9F]/30 text-[#C5BD9F] px-1.5 py-0.5 rounded text-[9px]">
                [{c}]
              </span>
            ))}
          </span>
        )}
        <span className="text-gray-500 text-[9px] ml-auto">{msg.time}</span>
      </div>
    );
  };

  return (
    <div className="flex w-full h-[calc(100vh-40px)] max-h-full min-h-0 bg-[#080a0c] text-gray-200 font-mono overflow-hidden box-border pt-1">
      
      {/* File Upload Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            setAttachedFiles([...attachedFiles, ...Array.from(e.target.files).map((f) => f.name)]);
          }
        }}
      />

      {/* ======================================================== */}
      {/* LEFT SIDEBAR: SINGLE FLUID SCROLLABLE TRACK */}
      {/* ======================================================== */}
      <div 
        className="w-[300px] shrink-0 border-r border-[#1f242d] bg-[#080a0c] flex flex-col h-full overflow-y-auto min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f242d #080a0c' }}
      >
        
        {/* Tier Selectors */}
        <div className="p-2 flex flex-col gap-2 shrink-0">
          {modelTiers.map((tierGroup) => {
            const isCollapsed = collapsedTiers[tierGroup.id];
            const isTier4 = tierGroup.id === 'tier4';

            return (
              <div key={tierGroup.id} className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCollapsedTiers((prev) => ({ ...prev, [tierGroup.id]: !prev[tierGroup.id] }))}
                  className="flex items-center justify-between text-[10px] font-bold text-[#DAA520] hover:text-white px-1 py-1 rounded bg-[#0b0e14] border border-[#1f242d] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="truncate">{tierGroup.tier}</span>
                    {isTier4 && (
                      <span className={'text-[8px] px-1 rounded ' + (kaggleStatus === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-[#14171c] text-gray-400')}>
                        {kaggleStatus}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-[8px]">{isCollapsed ? '+' : '-'}</span>
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col gap-1 pl-1">
                    {tierGroup.models.map((m, rankIndex) => {
                      const isSelected = selectedBrain === m.id;
                      const isTopRank = rankIndex === 0;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectModel(m.id)}
                          className={'flex items-center justify-between px-2 py-1 rounded text-[10px] text-left border cursor-pointer transition-all ' + (
                            isSelected
                              ? 'bg-[#14171c] border-[#DAA520] text-[#DAA520] font-bold shadow-[0_0_8px_rgba(218,165,32,0.15)]'
                              : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#14171c]/50'
                          )}
                        >
                          <div className="flex items-center gap-1.5 truncate pr-1">
                            {isTopRank && (
                              <span className="text-[#DAA520] text-[8px] font-bold">★</span>
                            )}
                            <span className="truncate">{m.name}</span>
                          </div>
                          <span className="text-[8px] bg-[#1f242d] px-1 py-0.5 rounded text-gray-400 shrink-0">
                            {m.badge}
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

        {/* Persistent Chat Accordions */}
        <div className="mt-6 border-t border-[#1f242d] pt-3 p-2 flex flex-col shrink-0 bg-[#0d0f12]">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1f242d]">
            <span className="text-[10px] font-bold text-[#DAA520] tracking-wider uppercase">
              PROJECT CHAT LEDGERS
            </span>
            <button
              type="button"
              onClick={() => setNewChatPromptOpen(true)}
              className="bg-[#DAA520] hover:bg-[#DAA520]/80 text-[#080a0c] text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              + NEW
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {['CHIEF MADOTHI FUND', 'RHYTHM TRADING', 'General_Chats'].map((proj) => (
              <div key={proj} className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-[#DAA520] uppercase px-1">{proj}</span>

                {/* Master Ledger Button */}
                <button
                  type="button"
                  onClick={() => loadMasterChat(proj)}
                  className={'flex items-center justify-between px-2 py-1 rounded text-[10px] border cursor-pointer text-left ' + (
                    activeProject === proj && isMasterChat
                      ? 'bg-[#14171c] border-[#DAA520] text-[#DAA520] font-bold'
                      : 'bg-[#0b0e14] border-dashed border-[#1f242d] text-[#DAA520]/80 hover:bg-[#14171c] hover:text-[#DAA520]'
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#DAA520]">*</span>
                    <span className="truncate">MASTER CHAT</span>
                  </div>
                  <span className="text-[8px] text-gray-500 shrink-0">[LOCK]</span>
                </button>

                {/* Sub-Chats with Archive and Delete Buttons */}
                {(chatCatalog[proj] || []).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => loadSubChat(proj, c.id, c.title)}
                    className={'flex items-center justify-between px-2 py-1 rounded text-[10px] cursor-pointer ' + (
                      activeChatId === c.id
                        ? 'bg-[#14171c] border-l-2 border-[#DAA520] text-gray-100 font-bold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#14171c]/50'
                    )}
                  >
                    <div className="flex items-center gap-1 truncate min-w-0 pr-1">
                      <span className="text-gray-500">-</span>
                      <span className="truncate">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Archive into Master Chat"
                        onClick={(e) => handleArchiveChat(e, proj, c.id, c.title)}
                        className="text-gray-500 hover:text-[#DAA520] text-[9px] px-1 rounded hover:bg-[#1f242d]"
                      >
                        [ARC]
                      </button>
                      <button
                        type="button"
                        title="Delete chat permanently"
                        onClick={(e) => handleDeleteChat(e, proj, c.id, c.title)}
                        className="text-gray-500 hover:text-red-400 text-[9px] px-1 rounded hover:bg-[#1f242d]"
                      >
                        [DEL]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT: FEED & CONTROLS */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        
        {/* Status Header */}
        <div className="h-9 shrink-0 border-b border-[#1f242d] bg-[#0b0e14] flex items-center justify-between px-3 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              DAEMON LINKED (PORT 8081 / 8082)
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">BRAIN:</span>
            <span className="text-[#DAA520] font-bold uppercase">{selectedBrain}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-300 font-bold truncate max-w-[280px]">
              {activeChatId === null ? 'IDLE' : activeChatTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isMasterChat && activeChatId === 'Master' && (
              <span className="border border-[#DAA520] text-[#DAA520] bg-[#DAA520]/10 px-2 py-0.5 rounded text-[8px] font-bold">
                MASTER LEDGER (READ ONLY)
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleSpeech(chatLog[chatLog.length - 1]?.text)}
              className={'border px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-all ' + (
                isSpeaking
                  ? 'border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10 font-bold'
                  : 'border-[#DAA520] text-[#DAA520] hover:bg-[#DAA520]/10'
              )}
            >
              {isSpeaking ? 'STOP VOICE' : 'VOICE BRIEF'}
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              className="border border-[#1f242d] hover:border-[#DAA520] text-gray-400 hover:text-white px-1.5 py-0.5 rounded text-[8px] cursor-pointer"
            >
              {copyFeedback ? 'COPIED' : 'COPY ALL'}
            </button>
          </div>
        </div>

        {/* Message Feed Area */}
        <div
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0 relative"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f242d #080a0c' }}
        >
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className="border border-[#1f242d] bg-[#0b0e14] p-3 rounded flex flex-col gap-1.5 shrink-0"
            >
              <div className="flex items-center justify-between text-[9px] pb-1 border-b border-[#1f242d]/50">
                {renderIdentityHeader(msg)}
                <button
                  type="button"
                  onClick={() => handleCopyMsg(msg.text)}
                  className="text-gray-500 hover:text-gray-300 text-[8px] cursor-pointer"
                >
                  COPY
                </button>
              </div>

              <div className="text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                {msg.text}
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-[#1f242d]/30">
                  {msg.attachments.map((file, idx) => (
                    <span key={idx} className="text-[8px] bg-[#14171c] border border-[#1f242d] text-gray-400 px-1.5 py-0.5 rounded">
                      FILE: {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Staged Code Diff Review */}
          {stagedProposal && (
            <div className="border border-[#DAA520] bg-[#14171c] p-3 rounded flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#DAA520]">
                <span>CODE DIFF READY FOR WRITE</span>
                <button
                  type="button"
                  onClick={handleConfirmFileWrite}
                  className="bg-[#10b981] hover:bg-emerald-400 text-[#080a0c] px-3 py-1 rounded font-bold cursor-pointer"
                >
                  CONFIRM WRITE
                </button>
              </div>
              <pre className="text-[10px] text-emerald-400 bg-[#080a0c] p-2 rounded overflow-x-auto max-h-48">
                {stagedProposal.diffText}
              </pre>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ======================================================== */}
        {/* TAB 12 REVIEW STYLE: DEDICATED FULL-VIEWPORT HUD OVERLAY */}
        {/* ======================================================== */}
        {(isLoading || isDistilling) && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(8, 10, 12, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              pointerEvents: 'all'
            }}
          >
            {/* SVG Multi-Ring Gyroscope from Tab 12 */}
            <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '22px' }}>
              <svg 
                viewBox="0 0 100 100" 
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                {/* Outer Ring: Emerald (#10b981) */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="75 160"
                  style={{
                    transformOrigin: '50% 50%',
                    animation: 'spin-cw 2.4s linear infinite'
                  }}
                />

                {/* Middle Ring: Sky Blue (#38bdf8) */}
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="50 120"
                  style={{
                    transformOrigin: '50% 50%',
                    animation: 'spin-ccw 1.8s linear infinite'
                  }}
                />

                {/* Inner Ring: Acacia Gold (#ffb800) */}
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  fill="none"
                  stroke="#ffb800"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="38 90"
                  style={{
                    transformOrigin: '50% 50%',
                    animation: 'spin-cw 1.2s ease-in-out infinite'
                  }}
                />
              </svg>

              {/* Central Core Telemetry */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffb800'
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1, textShadow: '0 0 8px #ffb800' }}>✦</span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', marginTop: '2px', letterSpacing: '-0.5px' }}>
                  {elapsedSeconds}s
                </span>
              </div>
            </div>

            {/* Status Header Telemetry */}
            <div 
              style={{
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '2px',
                color: '#ffb800',
                textTransform: 'uppercase',
                marginBottom: '8px',
                textShadow: '0 0 14px rgba(255, 184, 0, 0.5)'
              }}
            >
              {isDistilling
                ? 'SYNTHESIZING ACTIONABLE DIRECTIVE...'
                : 'EXECUTING INFERENCE RUN...'}
            </div>

            {/* Engine Subtitle Banner */}
            <div 
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 700,
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>ENGINE:</span>
              <span 
                style={{
                  color: '#38bdf8',
                  backgroundColor: '#0c1a29',
                  border: '1px solid #1e3a5f',
                  padding: '3px 10px',
                  borderRadius: '3px',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)'
                }}
              >
                {selectedBrain.toUpperCase()}
              </span>
              <span style={{ color: '#334155' }}>|</span>
              <span style={{ color: '#10b981' }}>PROCESS IS LOCKED &amp; RUNNING</span>
            </div>

            <div 
              style={{
                fontSize: '9px',
                color: '#64748b',
                marginTop: '16px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
              }}
            >
              Process continues in background if navigating away
            </div>
          </div>
        )}

        {/* New Chat Popover */}
        {newChatPromptOpen && (
          <div className="mx-3 mb-2 p-2 border border-[#DAA520] bg-[#14171c] rounded flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#DAA520] shrink-0">NEW SUB-CHAT:</span>
            <input
              type="text"
              placeholder={'Thread name under ' + activeProject + '...'}
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNewChat()}
              className="flex-1 bg-[#080a0c] border border-[#1f242d] text-gray-200 px-2 py-1 text-[11px] rounded outline-none focus:border-[#DAA520]"
            />
            <button
              type="button"
              onClick={handleCreateNewChat}
              className="bg-[#DAA520] hover:bg-[#DAA520]/80 text-[#080a0c] px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              CREATE
            </button>
            <button
              type="button"
              onClick={() => setNewChatPromptOpen(false)}
              className="bg-[#1f242d] text-gray-400 hover:text-white px-2 py-1 rounded text-[10px] cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        )}

        {/* Command & Input Dock */}
        <div className="border-t border-[#1f242d] bg-[#0b0e14] p-2.5 flex flex-col gap-2 shrink-0">
          
          {/* Telemetry Rationale Flash Banner */}
          {routingRationale && (
            <div className="bg-[#07131e] border border-[#38bdf8] text-[#38bdf8] px-2.5 py-1 rounded text-[9px] font-bold flex items-center justify-between shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <span>◈ {routingRationale}</span>
              <span className="text-[#C5BD9F] text-[8px] font-normal">AUTO-ROUTER LOCKED</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#DAA520] hover:underline cursor-pointer flex items-center gap-1"
              >
                + ATTACH FILE / SCREENSHOT (CTRL+V)
              </button>
              {attachedFiles.length > 0 && (
                <span className="text-gray-400">({attachedFiles.length} file staged)</span>
              )}
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              className={'flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-all ' + (
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse font-bold'
                  : 'text-gray-400 hover:text-white border border-[#1f242d]'
              )}
            >
              <span>MIC</span> {isRecording ? 'LISTENING...' : 'CHROME MIC'}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            disabled={isMasterChat || activeChatId === null}
            rows={2}
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isMasterChat
                ? "Master Chat is read-only. Select or create an active sub-chat thread on the left."
                : 'Enter command for Monty dispatch via ' + selectedBrain + '...'
            }
            className={'w-full bg-[#080a0c] border rounded p-2 text-[11px] text-gray-200 font-mono outline-none resize-none transition-all ' + (
              isMasterChat || activeChatId === null
                ? 'border-[#1f242d] cursor-not-allowed text-gray-600'
                : 'border-[#1f242d] focus:border-[#DAA520]'
            )}
          />

          {/* Action Deck */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            
            {/* Primary Action Trigger + Auto-Route Switch */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isMasterChat || activeChatId === null || isLoading}
                onClick={handleSendMessage}
                className={'text-[10px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-all ' + (
                  isMasterChat || activeChatId === null || isLoading
                    ? 'bg-[#1f242d] text-gray-500 cursor-not-allowed'
                    : 'bg-[#DAA520] hover:bg-[#DAA520]/80 text-[#080a0c] shadow-[0_0_8px_rgba(218,165,32,0.2)]'
                )}
              >
                SUBMIT
              </button>

              {/* 3D HIGH-LUMINANCE METALLIC AUTO-ROUTE LLM HARDWARE SWITCH */}
              <button
                type="button"
                disabled={isMasterChat || activeChatId === null || isRouting}
                onClick={handleAutoRouteLLM}
                onMouseEnter={() => setAutoRouteHover(true)}
                onMouseLeave={() => setAutoRouteHover(false)}
                title="Analyze input text & auto-select optimal LLM engine"
                style={{
                  position: 'relative',
                  padding: '7px 16px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '1.2px',
                  borderRadius: '3px',
                  cursor: isMasterChat || activeChatId === null ? 'not-allowed' : 'pointer',
                  opacity: isMasterChat || activeChatId === null ? 0.45 : 1,
                  transition: 'all 0.16s ease-in-out',
                  color: autoRouteHover ? '#ffffff' : '#f0f9ff',
                  background: autoRouteHover
                    ? 'linear-gradient(180deg, #1b5b94 0%, #2982d6 45%, #196bb8 55%, #0f406e 100%)'
                    : 'linear-gradient(180deg, #144673 0%, #1f68ab 45%, #165389 55%, #0c3154 100%)',
                  border: '1px solid #38bdf8',
                  boxShadow: autoRouteHover
                    ? 'inset 0 1px 1px rgba(224, 242, 254, 0.95), inset 0 -1px 2px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(56, 189, 248, 0.6), 0 2px 5px rgba(0, 0, 0, 0.9)'
                    : 'inset 0 1px 1px rgba(186, 230, 253, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.85), 0 3px 14px rgba(2, 132, 199, 0.45), 0 1px 2px rgba(0, 0, 0, 0.8)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.95), 0 0 10px rgba(56, 189, 248, 0.65)',
                  transform: autoRouteHover ? 'translateY(-1px)' : 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 8px #38bdf8, 0 0 16px #0284c7',
                  animation: isRouting ? 'pulse 0.8s infinite' : 'none'
                }} />
                {isRouting ? 'ROUTING...' : 'AUTO-ROUTE LLM'}
              </button>
            </div>

            {/* Pipeline Controls */}
            <div className="flex items-center gap-1 bg-[#080a0c] border border-[#1f242d] px-1 py-0.5 rounded">
              <button
                type="button"
                disabled={isDistilling}
                onClick={handleCreatePrompt}
                className="border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/15 font-bold text-[9px] px-2.5 py-1 rounded cursor-pointer transition-all"
              >
                {isDistilling ? 'DISTILLING (' + elapsedSeconds + 's)' : 'CREATE PROMPT'}
              </button>

              <button
                type="button"
                onClick={handlePushToWarRoom}
                className="border border-[#C5BD9F] text-[#C5BD9F] hover:bg-[#C5BD9F]/15 font-bold text-[9px] px-2.5 py-1 rounded cursor-pointer transition-all"
              >
                PUSH TO WAR ROOM
              </button>

              <button
                type="button"
                onClick={handleRefine}
                className="border border-[#1f242d] text-gray-400 hover:text-white hover:bg-[#14171c] text-[9px] px-2 py-1 rounded cursor-pointer transition-all"
              >
                REFINE
              </button>

              <button
                type="button"
                onClick={handleCopyAll}
                className="border border-[#1f242d] text-gray-400 hover:text-white hover:bg-[#14171c] text-[9px] px-2 py-1 rounded cursor-pointer transition-all"
              >
                {copyFeedback ? 'COPIED' : 'COPY ALL'}
              </button>

              <button
                type="button"
                onClick={handleCLS}
                className="border border-[#1f242d] text-gray-400 hover:text-red-400 hover:bg-[#14171c] text-[9px] px-2 py-1 rounded cursor-pointer transition-all"
              >
                CLS
              </button>

              <button
                type="button"
                onClick={handleAllStop}
                className="border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/15 font-bold text-[9px] px-2.5 py-1 rounded cursor-pointer transition-all"
              >
                ALL STOP
              </button>
            </div>

            {/* Expansion Bay */}
            <div className="w-[110px] shrink-0" aria-hidden="true" />

            {/* + NEW CHAT */}
            <button
              type="button"
              onClick={() => setNewChatPromptOpen(true)}
              className="border border-[#DAA520] text-[#DAA520] hover:bg-[#DAA520]/20 font-bold text-[9px] px-3 py-1.5 rounded cursor-pointer transition-all shadow-[0_0_6px_rgba(218,165,32,0.15)]"
            >
              + NEW CHAT
            </button>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-[#1f242d] mx-0.5"></div>

            {/* Mode Selector */}
            <div className="flex items-center gap-1.5 bg-[#080a0c] border border-[#1f242d] px-2 py-1 rounded shadow-inner">
              <span className="text-[9px] text-[#DAA520] uppercase font-bold tracking-wider mr-0.5">
                MODE:
              </span>
              {[
                { id: 'general', label: 'GENERAL' },
                { id: 'code', label: 'CODE' },
                { id: 'mql', label: 'MQL' },
                { id: 'graphics', label: 'GRAPHICS' },
                { id: 'content', label: 'CONTENT' },
                { id: 'quant', label: 'QUANT' }
              ].map((mode) => {
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={'text-[9px] px-2.5 py-1 rounded font-bold cursor-pointer transition-all border ' + (
                      isActive
                        ? 'bg-[#DAA520] border-[#DAA520] text-[#080a0c] shadow-[0_0_10px_rgba(218,165,32,0.4)] scale-105'
                        : 'bg-[#0d0f12] border-[#1f242d] text-gray-400 hover:text-gray-100 hover:border-[#DAA520]/60 hover:bg-[#14171c]'
                    )}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Global Embedded Keyframes for SVG Orbital Gyroscope */}
      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, ChevronDown, ChevronUp, AlertOctagon, Loader2, Check, UserCheck, Mic, MicOff, X, Copy, Square, Cpu 
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab02WarRoom.css';

const ELITE_CASCADE_STEPS = [
  { id: 'TURN-1-CLAUDE', label: 'CLAUDE 3.5 SONNET', model: 'anthropic/claude-3.5-sonnet', role: 'Architectural Synthesis' },
  { id: 'TURN-2-GEMINI', label: 'GEMINI 1.5 PRO', model: 'gemini-1.5-pro', role: 'Contextual Deep Dive' },
  { id: 'TURN-3-GPT4O', label: 'GPT-4O FRONTIER', model: 'openai/gpt-4o', role: 'Logic & Code Refinement' },
  { id: 'TURN-4-DEEPSEEK', label: 'DEEPSEEK-R1', model: 'deepseek/deepseek-r1', role: 'Final Verification & PRD Lock' }
];

const FREE_CASCADE_STEPS = [
  { id: 'TURN-1-NIM', label: 'NVIDIA NIM CLUSTER', model: 'meta/llama-3.3-70b-instruct', role: 'Turn 1: Agent Discussion' },
  { id: 'TURN-2-GROQ', label: 'GROQ LPU ACCELERATOR', model: 'llama-3.3-70b-versatile', role: 'Turn 2: Director Critique' },
  { id: 'TURN-3-GEMINI', label: 'GOOGLE GEMINI CLUSTER', model: 'gemini-1.5-pro', role: 'Turn 3: Synthesis' },
  { id: 'TURN-4-NIM', label: 'NVIDIA NIM CLUSTER', model: 'nvidia/nemotron-70b-ultra', role: 'Turn 4: Refinement' },
  { id: 'TURN-5-JUDGE', label: 'THE JUDGE GATE', model: 'meta/llama-3.3-70b-instruct', role: 'Turn 5: Validation Check' }
];

// Dedicated 100% Kaggle Compute Pipeline
const KAGGLE_CASCADE_STEPS = [
  { id: 'TURN-1-KAGGLE', label: 'KAGGLE DUAL-T4 [QWEN 7B]', model: 'qwen2.5:7b', role: 'Turn 1: Agent Discussion' },
  { id: 'TURN-2-KAGGLE', label: 'KAGGLE DUAL-T4 [LLAMA 3]', model: 'llama3:latest', role: 'Turn 2: Director Critique' },
  { id: 'TURN-3-KAGGLE', label: 'KAGGLE DUAL-T4 [QWEN 7B]', model: 'qwen2.5:7b', role: 'Turn 3: Synthesis' },
  { id: 'TURN-4-KAGGLE', label: 'KAGGLE DUAL-T4 [CODER 7B]', model: 'qwen2.5-coder:7b', role: 'Turn 4: Refinement' },
  { id: 'TURN-5-KAGGLE', label: 'KAGGLE DUAL-T4 [JUDGE]', model: 'qwen2.5:7b', role: 'Turn 5: Validation Check' }
];

const BOARDROOM_OPTIONS = [
  { id: 'KAGGLE-T4', name: 'Kaggle Dual-T4 (32GB)', tag: 'STANDBY' },
  { id: 'ELITE_CASCADE', name: '4-TURN HEAVY LIFTING CASCADE', tag: 'ELITE' },
  { id: 'CLAUDE-3.5', name: 'Claude 3.5 Sonnet', tag: 'ELITE' },
  { id: 'GPT-4O', name: 'GPT-4o Frontier', tag: 'ELITE' },
  { id: 'GEMINI-1.5-PRO', name: 'Gemini 1.5 Pro (Studio)', tag: 'ELITE' },
  { id: 'DEEPSEEK-R1', name: 'DeepSeek-R1 (Paid)', tag: 'ELITE' }
];

const DIRECTOR_BOARD_CONFIG = [
  { name: 'TESS // QUANT', modelBadge: 'NEMOTRON', roleType: 'REASONING', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
  { name: 'SILAS // DATABASE', modelBadge: 'GEMINI-PRO', roleType: 'CONTEXT', color: 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/30' },
  { name: 'AMBER // COPYWRITER', modelBadge: 'LLAMA-3.3', roleType: 'CREATIVE', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30' },
  { name: 'ARES // EXECUTION', modelBadge: 'NEMOTRON', roleType: 'REASONING', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
  { name: 'ATLAS // INFRASTRUCTURE', modelBadge: 'LLAMA-70B', roleType: 'CODE', color: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/30' },
  { name: 'VALERIE // RELATIONS', modelBadge: 'LLAMA-3.3', roleType: 'CREATIVE', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30' },
  { name: 'JACK // MARKETING', modelBadge: 'LLAMA-3.3', roleType: 'CREATIVE', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30' },
  { name: 'MAVERICK // SEO', modelBadge: 'GEMINI-PRO', roleType: 'CONTEXT', color: 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/30' },
  { name: 'SKYLA // FRONTEND WEB', modelBadge: 'LLAMA-70B', roleType: 'CODE', color: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/30' },
  { name: 'JAX // ARTWORK OMEGA', modelBadge: 'LLAMA-3.3', roleType: 'CREATIVE', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30' },
  { name: 'ROXY // ARTWORK ALPHA', modelBadge: 'LLAMA-3.3', roleType: 'CREATIVE', color: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30' },
  { name: 'CHARLIE // CODE', modelBadge: 'LLAMA-70B', roleType: 'CODE', color: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/30' },
  { name: 'THE ASKARI // SECURITY', modelBadge: 'NEMOTRON', roleType: 'REASONING', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
  { name: 'VANCE // FINANCE', modelBadge: 'NEMOTRON', roleType: 'REASONING', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' },
  { name: 'JUSTIN // RISK LEGAL', modelBadge: 'GEMINI-PRO', roleType: 'CONTEXT', color: 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/30' },
  { name: 'ORION // STRATEGIC INTEL', modelBadge: 'NEMOTRON', roleType: 'REASONING', color: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' }
];

const DEFAULT_PROJECTS = ['MAKING MONEY IDEAS', 'ZAMBEZI SAFARI', 'WAR ROOM - DIRECTOR BOARD KAGGLE TEST', 'MCNC REACT VITE', 'RHYTHM WASP V8.5'];

export default function Tab02WarRoom({ ws }) {
  const [assignedDirectors, setAssignedDirectors] = useState([]);
  const [isMultiAgentExecuting, setIsMultiAgentExecuting] = useState(false);

  const [cascadeIndex, setCascadeIndex] = useState(0);
  const [isCascading, setIsCascading] = useState(false);
  const [isLLMExecuting, setIsLLMExecuting] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('BOARDROOM'); 

  const [workflowState, setWorkflowState] = useState(() => {
    return localStorage.getItem('MCNC_WARROOM_STATE') || 'IDLE';
  }); 
  
  const [isBoardroomOpen, setIsBoardroomOpen] = useState(true);
  const [isDirectorsOpen, setIsDirectorsOpen] = useState(true);

  const [selectedLLM, setSelectedLLM] = useState(() => {
    return localStorage.getItem('MCNC_SELECTED_LLM') || 'KAGGLE-T4';
  });
  
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PROJECT_LIST');
      return stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  });

  const [selectedProject, setSelectedProject] = useState(() => {
    return localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'MAKING MONEY IDEAS';
  });

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedAgentDropdown, setSelectedAgentDropdown] = useState('5-TURN ROUND-ROBIN CASCADE');
  const [inputBuffer, setInputBuffer] = useState('');

  const [streamLog, setStreamLog] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_WARROOM_STREAM');
      return stored ? JSON.parse(stored) : [
        { id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal ready. War Room initialized.', type: 'system' }
      ];
    } catch (e) {
      return [{ id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal ready. War Room initialized.', type: 'system' }];
    }
  });

  const [copiedFeed, setCopiedFeed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const isAnyExecuting = Boolean(isCascading || isMultiAgentExecuting || isLLMExecuting);

  useEffect(() => {
    try {
      localStorage.setItem('MCNC_WARROOM_STREAM', JSON.stringify(streamLog));
      localStorage.setItem('MCNC_WARROOM_STATE', workflowState);
      localStorage.setItem('MCNC_SELECTED_LLM', selectedLLM);
    } catch (e) {}
  }, [streamLog, workflowState, selectedLLM]);

  // Elapsed Timer Hook
  useEffect(() => {
    let timer;
    if (isAnyExecuting) {
      setElapsedSeconds(0);
      timer = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isAnyExecuting]);

  const [isKaggleOnline, setIsKaggleOnline] = useState(false);
  const [remainingQuotaHours, setRemainingQuotaHours] = useState('28.5');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const streamBottomRef = useRef(null);
  const abortControllerRef = useRef(null);

  const formatElapsed = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => { streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [streamLog, isAnyExecuting]);

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    localStorage.setItem('MCNC_ACTIVE_PROJECT', proj);
  };

  const updateKaggleTelemetry = async () => {
    try {
      const savedHours = localStorage.getItem('MCNC_KAGGLE_WEEKLY_HOURS');
      const used = savedHours !== null ? parseFloat(savedHours) : 1.5;
      const rem = Math.max(0, 30.0 - used).toFixed(1);
      setRemainingQuotaHours(rem);

      const res = await fetch('http://127.0.0.1:8081/api/status');
      if (res.ok) {
        const data = await res.json();
        setIsKaggleOnline(Boolean(data.kaggle_gpu_online));
      }
    } catch (e) {
      setIsKaggleOnline(false);
    }
  };

  useEffect(() => {
    updateKaggleTelemetry();
    const interval = setInterval(updateKaggleTelemetry, 8000);
    window.addEventListener('storage', updateKaggleTelemetry);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateKaggleTelemetry);
    };
  }, []);

  useEffect(() => {
    const handleGlobalStop = () => handleAllStop();
    window.addEventListener('universal-all-stop', handleGlobalStop);
    return () => window.removeEventListener('universal-all-stop', handleGlobalStop);
  }, []);

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
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) setInputBuffer(prev => (prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim()));
    };
    recog.onerror = (err) => { if (err.error === 'not-allowed' || err.error === 'service-not-allowed') setIsListening(false); };
    recog.onend = () => { if (isListening) { try { recog.start(); } catch (e) { setIsListening(false); } } };
    recognitionRef.current = recog;
    return () => { if (recog) recog.stop(); };
  }, [isListening]);

  const toggleMic = () => {
    if (!speechSupported) return alert('Chrome Speech Recognition is only supported natively in Google Chrome.');
    if (isListening) { setIsListening(false); recognitionRef.current?.stop(); } 
    else { try { recognitionRef.current?.start(); setIsListening(true); } catch (err) {} }
  };

  const handleCopyDiscussion = () => {
    if (!streamLog || streamLog.length === 0) return;
    const formattedDiscussion = streamLog
      .map(log => `[${log.sender}]:\n${log.text}`)
      .join('\n\n==================================================\n\n');

    navigator.clipboard.writeText(formattedDiscussion);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  useEffect(() => {
    const handleTransfer = (e) => {
      if (e.detail && e.detail.payload) {
        setInputBuffer(prev => prev ? prev + '\n\n' + e.detail.payload : e.detail.payload);
        if (e.detail.project) handleSelectProject(e.detail.project);
      }
    };
    window.addEventListener('push-to-warroom', handleTransfer);
    return () => window.removeEventListener('push-to-warroom', handleTransfer);
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const formatted = newProjectName.trim().toUpperCase();
    if (!projects.includes(formatted)) {
      const updated = [...projects, formatted];
      setProjects(updated);
      localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(updated));
      handleSelectProject(formatted);
    }
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const handleCls = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCascading(false); setIsMultiAgentExecuting(false); setIsLLMExecuting(false);
    setCascadeIndex(0); 
    setWorkflowState('IDLE'); 
    setInputBuffer(''); 
    setAssignedDirectors([]);
    
    const initLog = [{ id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal cleared. War Room initialized.', type: 'system' }];
    setStreamLog(initLog);
  };

  const handleAllStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCascading(false); setIsMultiAgentExecuting(false); setIsLLMExecuting(false);
    setCascadeIndex(0); setWorkflowState('IDLE');

    try {
      await fetch('http://127.0.0.1:8081/api/all-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'WARROOM_ALL_STOP_TRIGGERED', timestamp: Date.now() })
      });
    } catch (e) {}

    setStreamLog(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        sender: 'WARLORD // OVERRIDE', 
        text: `[!] BATCH JOB TERMINATED. ACTIVE CASCADE ABORTED AT [${formatElapsed(elapsedSeconds)}]. SYSTEM RESTORED TO IDLE.`, 
        type: 'error' 
      }
    ]);
  };

  const runLiveCascadeLoop = async (steps, cascadeTitle) => {
    setIsCascading(true);
    setWorkflowState('ANALYZING');
    abortControllerRef.current = new AbortController();

    let baseObjective = inputBuffer.trim();
    if (!baseObjective) {
      baseObjective = `Project Objective: Execute complete system architecture synthesis, technical specifications, and production deliverables for [${selectedProject}]. Include exact technical constraints, file structures, and zero-state execution requirements.`;
    }
    setInputBuffer('');

    let conversationChain = `### CORE INITIATIVE: ${selectedProject}\n${baseObjective}\n\n`;

    for (let i = 0; i < steps.length; i++) {
      setCascadeIndex(i);
      const step = steps[i];
      const isJudgeTurn = (i === steps.length - 1);
      
      setStreamLog(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: `${step.id} // DISPATCH`,
          text: `Executing [${step.role}] via ${step.label} for project [${selectedProject}]...`,
          type: 'system'
        }
      ]);

      const stagePrompt = `${conversationChain}
==================================================
CURRENT DIRECTIVE - ${step.id} (${step.role}):
You are acting as the executive lead for ${step.role}. 
Do NOT reply with single confirmations, greetings, or placeholders.
Deliver a comprehensive, detailed operational brief covering your role.
Provide clear technical requirements, execution specifications, and architectural parameters.

${isJudgeTurn ? `
MANDATORY FINAL DELIVERABLE:
At the very end of your review, you MUST output a formal '### DISPATCH MANIFEST' allocating execution tasks to directors from the 16-Director Matrix and binding tools from the Warlord Registry (e.g., booking_sync, donor_crm, payment_gateway, seo_radar, github_deploy, ui_inspector, smtp_dispatcher, email_osint_probe).

Format strictly as:
### DISPATCH MANIFEST
- Task: "[Action Title]" | Director: [Agent Name] | Tool: [tool_id] | Status: APPROVED
` : ''}`;

      try {
        const response = await fetch('http://127.0.0.1:8081/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({
            prompt: stagePrompt,
            model: step.model,
            project: selectedProject,
            role: step.role,
            turn: i + 1,
            enforceFullPRD: true,
            useKaggle: selectedLLM === 'KAGGLE-T4'
          })
        });

        const data = await response.json();
        const replyText = data.reply || data.error || 'No response returned from inference node.';

        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: `${step.id} // ${step.label}`,
            text: replyText,
            type: data.error ? 'error' : 'agent'
          }
        ]);

        conversationChain += `\n### [${step.id}: ${step.role}]\n${replyText}\n\n`;

      } catch (err) {
        if (err.name === 'AbortError') return;
        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: `${step.id} // FAULT`,
            text: `Inference error on node ${step.label}: ${err.message}`,
            type: 'error'
          }
        ]);
        setIsCascading(false);
        setWorkflowState('IDLE');
        return;
      }
    }

    setIsCascading(false);
    setStreamLog(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'MONTY // CHIEF OF STAFF',
        text: `${cascadeTitle} complete. Full PRD validated and held in active staging. Awaiting Authorization.`,
        type: 'system'
      }
    ]);

    setWorkflowState('MONTY_APPROVED');
    abortControllerRef.current = null;
  };

  const runDynamicMatrixLoop = async (targets) => {
    setIsMultiAgentExecuting(true);
    setWorkflowState('ANALYZING');
    abortControllerRef.current = new AbortController();
    let currentPayload = inputBuffer.trim() || `Operational Tasking: Deliver full domain execution specifications for project [${selectedProject}].`;
    setInputBuffer('');
    
    setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `Initiating sequential execution across ${targets.length} assigned directors ${selectedLLM === 'KAGGLE-T4' ? '[VIA KAGGLE COMPUTE]' : ''}.`, type: 'user' }]);

    for (let i = 0; i < targets.length; i++) {
      const targetAgent = targets[i];
      const baseName = targetAgent.split(' // ')[0];
      const role = targetAgent.split(' // ')[1];
      
      try {
        const response = await fetch('http://127.0.0.1:8081/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({ 
            prompt: currentPayload, 
            director: targetAgent, 
            project: selectedProject,
            model: selectedLLM === 'KAGGLE-T4' ? 'qwen2.5:7b' : undefined,
            useKaggle: selectedLLM === 'KAGGLE-T4'
          })
        });
        const data = await response.json();
        
        setStreamLog(prev => [...prev, {
          id: Date.now(),
          sender: `${baseName} // ${role}`,
          text: data.error ? `Daemon error: ${data.error}` : data.reply,
          type: data.error ? 'error' : 'agent'
        }]);

        currentPayload = currentPayload + `\n\n--- TURN OVERPASS FROM ${baseName} ---\n${data.reply}`;
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: `Matrix failure on node ${baseName}: ${err.message}`, type: 'error' }]);
        setIsMultiAgentExecuting(false);
        return;
      }
    }
    
    setWorkflowState('MONTY_APPROVED');
    setIsMultiAgentExecuting(false);
    abortControllerRef.current = null;
  };

  const handleAction = async (actionType) => {
    if (actionType === 'INITIATE LLM ANALYSIS') {
      setAnalysisMode('BOARDROOM'); setWorkflowState('ANALYZING'); setIsBoardroomOpen(true); setIsDirectorsOpen(false);
      
      if (selectedLLM === 'KAGGLE-T4') {
        runLiveCascadeLoop(KAGGLE_CASCADE_STEPS, '5-Turn Kaggle Dual-T4 Cascade');
      } else if (selectedLLM === 'ELITE_CASCADE') {
        runLiveCascadeLoop(ELITE_CASCADE_STEPS, '4-Turn Heavy Lifting Elite Cascade');
      } else {
        setIsLLMExecuting(true);
        abortControllerRef.current = new AbortController();
        const activePrompt = inputBuffer.trim() || `Deliver full technical and architectural specification for [${selectedProject}].`;
        setInputBuffer('');
        try {
          const response = await fetch('http://127.0.0.1:8081/api/chat', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            signal: abortControllerRef.current?.signal,
            body: JSON.stringify({ prompt: activePrompt, model: selectedLLM, project: selectedProject })
          });
          const data = await response.json();
          setStreamLog(prev => [...prev, { id: Date.now(), sender: `BOARDROOM // [${selectedLLM}]`, text: data.reply, type: 'agent' }]);
          setWorkflowState('MONTY_APPROVED');
        } catch (err) {
          if (err.name !== 'AbortError') setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: err.message, type: 'error' }]);
        } finally { 
          setIsLLMExecuting(false); 
          abortControllerRef.current = null;
        }
      }
    } 
    
    else if (actionType === 'INITIATE DIRECTOR ANALYSIS') {
      setAnalysisMode('DIRECTORS'); setIsDirectorsOpen(true); setIsBoardroomOpen(false);

      if (assignedDirectors.length === 0) {
        if (selectedAgentDropdown === '5-TURN ROUND-ROBIN CASCADE') {
          if (selectedLLM === 'KAGGLE-T4') {
            runLiveCascadeLoop(KAGGLE_CASCADE_STEPS, '5-Turn Kaggle Dual-T4 Cascade');
          } else {
            runLiveCascadeLoop(FREE_CASCADE_STEPS, '5-Turn Collective Round-Robin');
          }
        } else if (selectedAgentDropdown === 'ALL DIRECTORS // AUTO-ROUTING') {
          setIsLLMExecuting(true);
          abortControllerRef.current = new AbortController();
          const activePrompt = inputBuffer.trim();
          setInputBuffer('');
          try {
            const response = await fetch('http://127.0.0.1:8081/api/chat', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              signal: abortControllerRef.current?.signal,
              body: JSON.stringify({ prompt: activePrompt, director: 'ALL DIRECTORS', project: selectedProject, useKaggle: selectedLLM === 'KAGGLE-T4' })
            });
            const data = await response.json();
            setStreamLog(prev => [...prev, { id: Date.now(), sender: `MONTY // ROUTER`, text: data.reply, type: 'agent' }]);
            setWorkflowState('MONTY_APPROVED');
          } catch (err) {
            if (err.name !== 'AbortError') setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM', text: err.message, type: 'error' }]);
          } finally { 
            setIsLLMExecuting(false); 
            abortControllerRef.current = null;
          }
        } else {
          setAssignedDirectors([selectedAgentDropdown]);
          runDynamicMatrixLoop([selectedAgentDropdown]);
        }
      } else {
        runDynamicMatrixLoop(assignedDirectors);
      }
    }

    else if (actionType === 'REFINE') {
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // REFINE', text: `Injecting refinement constraints: ${inputBuffer}`, type: 'user' }]);
      setInputBuffer('');
    }

    else if (actionType === 'ASSIGN') {
      if (!assignedDirectors.includes(selectedAgentDropdown) && !selectedAgentDropdown.includes('CASCADE') && !selectedAgentDropdown.includes('AUTO-ROUTING')) {
        setAssignedDirectors([...assignedDirectors, selectedAgentDropdown]);
      }
    }
    
    else if (actionType === 'AUTHORIZE ACTION') {
      if (workflowState !== 'MONTY_APPROVED') return;

      const synthesizedRounds = streamLog.filter(l => l.type === 'agent' && !l.text.startsWith('Executing [')).map(l => `### ${l.sender}\n\n${l.text}`).join('\n\n---\n\n');
      const fullPRD = synthesizedRounds || 'PRD Document generated via Base 1 Collective Round-Robin.';

      try {
        await fetch('http://127.0.0.1:8081/api/projects/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: selectedProject, prdContent: fullPRD, timestamp: Date.now() })
        });
      } catch (err) {}

      setWorkflowState('AUTHORIZED');
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // GATE', text: `Action authorized for project [${selectedProject}]. Full PRD committed to Base 1 storage vault.`, type: 'system' }]);
    } 
    
    else if (actionType === 'MONTY DISPATCH') {
      if (workflowState !== 'AUTHORIZED') return;

      // PARSE THE MANIFEST DIRECTLY ON THE FRONTEND
      const fullLogText = streamLog.map(l => l.text).join('\n\n');
      const manifestMatch = fullLogText.match(/### DISPATCH MANIFEST([\s\S]*?)(?:$|===)/);
      
      const parsedTasks = [];
      if (manifestMatch) {
        const rawLines = manifestMatch[1].split('\n').filter(l => l.trim().startsWith('- Task:'));
        rawLines.forEach((line, idx) => {
          const taskName = line.match(/Task:\s*"?([^"|]+)"?/i)?.[1]?.trim() || `Execution Unit ${idx + 1}`;
          const director = line.match(/Director:\s*([^|]+)/i)?.[1]?.trim() || 'CHARLIE // CODE';
          const toolId = line.match(/Tool:\s*([^|]+)/i)?.[1]?.trim() || 'github_deploy';

          parsedTasks.push({
            id: `TASK-${Date.now()}-${idx}`,
            project: selectedProject,
            title: taskName,
            assignedDirector: director,
            toolId: toolId,
            status: 'BUILDING',
            stage: 'AGENT BUILD',
            timestamp: new Date().toISOString()
          });
        });
      }

      // SAVE DIRECTLY TO BROWSER LOCAL STORAGE FOR TABS 03, 04 & 07 TO READ
      const existingProjects = JSON.parse(localStorage.getItem('MCNC_ACTIVE_PROJECT_MANIFESTS') || '[]');
      const updatedManifests = [
        ...existingProjects.filter(p => p.name !== selectedProject),
        {
          name: selectedProject,
          totalTasks: parsedTasks.length,
          status: 'ACTIVE',
          dispatchedAt: new Date().toISOString(),
          tasks: parsedTasks
        }
      ];

      localStorage.setItem('MCNC_ACTIVE_PROJECT_MANIFESTS', JSON.stringify(updatedManifests));
      localStorage.setItem('MCNC_ACTIVE_TASKS', JSON.stringify(parsedTasks));
      localStorage.setItem('MCNC_ACTIVE_PROJECT', selectedProject);

      // FIRE A CROSS-TAB EVENT SO OTHER TABS WAKE UP IMMEDIATELY
      window.dispatchEvent(new CustomEvent('warlord-project-dispatched', {
        detail: { project: selectedProject, tasks: parsedTasks }
      }));

      try {
        fetch('http://127.0.0.1:8081/api/projects/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: selectedProject, tasks: parsedTasks, timestamp: Date.now() })
        }).catch(() => {});
      } catch (e) {}

      setWorkflowState('DISPATCHED');
      setStreamLog(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          sender: 'MONTY // DISPATCH', 
          text: `Master scope locked for [${selectedProject}]. Manifest parsed (${parsedTasks.length} tasks). Dispatched directly to Tab 03, 04 & Paperclip CEO.`, 
          type: 'user' 
        }
      ]);
    }
  };

  const lastAgentLog = [...streamLog].reverse().find(l => l.type === 'agent' || l.type === 'system');

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2 select-none">
      <div className="w-80 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 overflow-hidden flex-shrink-0">
        <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden mb-2">
          <div className="px-3 py-2 bg-[#14171c] flex items-center justify-between border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-xs tracking-wider">PROJECT CONTAINER</span>
            <button onClick={() => setIsCreatingProject(!isCreatingProject)} className="text-[9px] border border-[#ffb800] text-[#ffb800] px-1.5 py-0.5 rounded font-mono font-bold hover:bg-[#ffb800]/10 cursor-pointer">
              {isCreatingProject ? 'CANCEL' : '+ NEW PROJECT'}
            </button>
          </div>
          <div className="p-2 bg-[#0a0c0e]">
            {isCreatingProject ? (
              <div className="flex gap-1.5">
                <input type="text" placeholder="PROJECT NAME..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="flex-1 bg-[#14171c] text-white border border-[#232832] px-2 py-1.5 text-[11px] font-mono rounded focus:border-[#ffb800] outline-none" />
                <button onClick={handleCreateProject} className="bg-[#ffb800] text-black text-[11px] font-bold px-3 py-1.5 rounded hover:bg-[#e6a600] cursor-pointer">ADD</button>
              </div>
            ) : (
              <select value={selectedProject} onChange={(e) => handleSelectProject(e.target.value)} className="w-full bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer">
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => { setIsBoardroomOpen(!isBoardroomOpen); setAnalysisMode('BOARDROOM'); }} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ffb800]" />
                <span>BOARDROOM CASCADE</span>
              </span>
              {isBoardroomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isBoardroomOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e]">
                {BOARDROOM_OPTIONS.map((model) => {
                  const isSelected = selectedLLM === model.id;
                  let statusText = 'STANDBY'; 
                  let statusColor = 'text-[#5c6b7f] bg-[#1f242d]'; 
                  let isSpinning = false;

                  if (model.id === 'KAGGLE-T4') {
                    const remNum = parseFloat(remainingQuotaHours);
                    if (remNum <= 0) {
                      statusText = 'EXPIRED';
                      statusColor = 'text-[#ef4444] bg-[#ef4444]/20 border border-[#ef4444]/40';
                    } else if (isKaggleOnline) {
                      statusText = `ACTIVE (${remainingQuotaHours}h)`;
                      statusColor = 'text-[#10b981] bg-[#10b981]/20 border border-[#10b981]/40';
                    }
                  }

                  if (isSelected && isAnyExecuting) { 
                    statusText = 'ACTIVE'; 
                    statusColor = 'text-black bg-[#38bdf8]'; 
                    isSpinning = true; 
                  }

                  return (
                    <button key={model.id} onClick={() => setSelectedLLM(model.id)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${isSelected ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold shadow-[0_0_8px_rgba(56,189,248,0.2)]' : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'}`}>
                      <div className="flex items-center gap-2">
                        {isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}
                        <span className="truncate pr-1">{model.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${model.id === 'KAGGLE-T4' && !isSelected ? statusColor : (statusText === 'STANDBY' ? 'bg-[#1f242d] text-[#5c6b7f]' : statusColor)}`}>
                        {model.id === 'KAGGLE-T4' ? statusText : (statusText === 'STANDBY' ? model.tag : statusText)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => { setIsDirectorsOpen(!isDirectorsOpen); setAnalysisMode('DIRECTORS'); }} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]">
              <span>DIRECTOR BOARD</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] border border-[#38bdf8] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono font-bold">
                  {selectedLLM === 'KAGGLE-T4' ? 'KAGGLE HOSTED' : 'ONLINE (16)'}
                </span>
                {isDirectorsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {isDirectorsOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e] max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() => {
                    setSelectedAgentDropdown('5-TURN ROUND-ROBIN CASCADE');
                    setAssignedDirectors([]);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 mb-2 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    selectedAgentDropdown === '5-TURN ROUND-ROBIN CASCADE'
                      ? 'bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/50 font-bold shadow-[0_0_8px_rgba(255,184,0,0.2)]'
                      : 'bg-[#14171c] text-[#ffb800] border border-[#ffb800]/30 hover:bg-[#1a1f26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCascading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffb800]" />}
                    <span className="truncate pr-1">5-TURN ROUND-ROBIN CASCADE</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isCascading ? 'bg-[#ffb800] text-black' : 'bg-[#1f242d] text-[#5c6b7f]'}`}>
                    {isCascading ? `TURN ${cascadeIndex + 1}/5` : (selectedLLM === 'KAGGLE-T4' ? 'KAGGLE' : 'BASE 1')}
                  </span>
                </button>

                {DIRECTOR_BOARD_CONFIG.map(agentObj => {
                  const agentName = agentObj.name;
                  const isSelectedTarget = selectedAgentDropdown === agentName;
                  const isAssigned = assignedDirectors.includes(agentName);
                  const isSpinning = isMultiAgentExecuting && isAssigned;
                  
                  let badgeLabel = selectedLLM === 'KAGGLE-T4' ? 'KAGGLE' : 'STANDBY';
                  let badgeStyle = selectedLLM === 'KAGGLE-T4' ? 'text-[#00d2ff] bg-[#00d2ff]/10 border border-[#00d2ff]/30' : 'text-[#5c6b7f] bg-[#1f242d]';

                  if (isSpinning) {
                    badgeLabel = 'SCANNED';
                    badgeStyle = 'text-black bg-[#38bdf8] font-bold';
                  } else if (isAssigned) {
                    badgeLabel = 'LOCKED';
                    badgeStyle = 'text-black bg-[#10b981] font-bold';
                  } else if (isSelectedTarget) {
                    badgeLabel = selectedLLM === 'KAGGLE-T4' ? 'KAGGLE-T4' : agentObj.modelBadge;
                    badgeStyle = (selectedLLM === 'KAGGLE-T4' ? 'text-[#00d2ff] bg-[#00d2ff]/20 border border-[#00d2ff]' : agentObj.color) + ' font-bold border';
                  }

                  return (
                    <button 
                      key={agentName} 
                      onClick={() => { setSelectedAgentDropdown(agentName); setAnalysisMode('DIRECTORS'); }} 
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${isSelectedTarget ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold' : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'}`}
                    >
                      <div className="flex items-center gap-2">
                        {isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}
                        <span className="truncate pr-1">{agentName}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${badgeStyle}`}>{badgeLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden relative">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono z-10 relative">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2 uppercase tracking-widest font-bold">
            THE WAR ROOM // LIVE COMMS & PRD PIPELINE <span className="text-[#ffb800]">[{selectedProject}]</span>
            {selectedLLM === 'KAGGLE-T4' && (
              <span className="text-[10px] text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded border border-[#00d2ff]/40">
                [ENGINE: KAGGLE DUAL-T4 32GB]
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDiscussion}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider border transition-all cursor-pointer ${copiedFeed ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]' : 'bg-[#14171c] hover:bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/40 hover:border-[#ffb800]'}`}
            >
              {copiedFeed ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3 text-[#ffb800]" />}
              <span>{copiedFeed ? 'COPIED' : 'COPY ALL'}</span>
            </button>
            {lastAgentLog && (
              <SpeakerBtn text={lastAgentLog.text} label="VOICE BRIEF" />
            )}
          </div>
        </div>

        {/* STATIC STICKY BANNER INSIDE CHAT (NEVER CLIPPED) */}
        {isAnyExecuting && (
          <div className="mx-3 mt-2 py-2 px-3 border border-[#ffb800] bg-[#14171c] rounded shadow-[0_0_12px_rgba(255,184,0,0.2)] font-mono flex items-center justify-between select-none z-10">
            <div className="flex items-center gap-2.5 text-[#ffb800]">
              <Loader2 className="w-4 h-4 text-[#ffb800] animate-spin" />
              <span className="text-xs font-bold tracking-wide uppercase">
                {selectedLLM === 'KAGGLE-T4' ? 'Kaggle Dual-T4' : 'Boardroom'} Active Cascade Running... [ELAPSED: {formatElapsed(elapsedSeconds)}]
              </span>
            </div>
            <button
              type="button"
              onClick={handleAllStop}
              className="px-2.5 py-1 bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#fca5a5] hover:text-white border border-[#ef4444]/50 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(239,68,68,0.2)]"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>TERMINATE BATCH JOB</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-text cursor-text custom-scrollbar">
          {streamLog.map(log => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center justify-between select-none">
                <span className={`font-bold text-[11px] tracking-wide ${log.type === 'error' ? 'text-[#ef4444]' : log.type === 'system' ? 'text-[#10b981]' : log.type === 'user' ? 'text-[#ffb800]' : 'text-[#8fa0b5]'}`}>
                  {log.sender}
                </span>
                {(log.type === 'agent' || log.type === 'system') && (
                  <SpeakerBtn text={log.text} label="LISTEN" />
                )}
              </div>
              <div className={`text-xs leading-relaxed pl-3 py-2 rounded border select-text whitespace-pre-wrap ${log.type === 'error' ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]' : 'bg-[#101317]/60 border-[#14181f] text-[#d1d5db]'}`}>
                {log.text}
              </div>
            </div>
          ))}
          <div ref={streamBottomRef} />
        </div>

        {/* Input Dock */}
        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none relative z-10">
          
          {/* Universal Execution Lock Banner above textarea */}
          {isAnyExecuting && (
            <div className="flex items-center justify-between bg-[#14171c] border border-[#ffb800] px-3 py-1.5 rounded text-[11px] font-mono text-[#ffb800]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#ffb800] animate-spin" />
                <span className="font-bold tracking-wider">
                  SEQUENCE ACTIVE // INFERENCE RUNNING [{formatElapsed(elapsedSeconds)}]
                </span>
              </div>
              <button
                type="button"
                onClick={handleAllStop}
                className="px-2 py-0.5 bg-[#450a0a] hover:bg-[#7f1d1d] text-[#fca5a5] hover:text-white border border-[#7f1d1d] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Square className="w-2.5 h-2.5 fill-current text-[#ef4444]" />
                <span>TERMINATE</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <label className={`flex items-center gap-2 font-bold tracking-wider transition-colors select-none ${isAnyExecuting ? 'text-[#5c6b7f] cursor-not-allowed' : 'text-[#ffb800] hover:text-[#fef08a] cursor-pointer'}`}>
              <Paperclip className={`w-4 h-4 ${isAnyExecuting ? 'text-[#5c6b7f]' : 'text-[#ffb800]'}`} />
              <span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
            </label>
            <button onClick={toggleMic} disabled={isAnyExecuting} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${isAnyExecuting ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isListening ? 'bg-[#ffb800] text-black border border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.4)]' : 'bg-[#0d0f12] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'}`}>
              {isListening ? <MicOff className="w-3.5 h-3.5 text-black" /> : <Mic className="w-3.5 h-3.5 text-[#ffb800]" />}<span>{isListening ? 'STOP MIC' : 'CHROME MIC'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="warroom-input" 
              value={inputBuffer} 
              onChange={(e) => setInputBuffer(e.target.value)}
              disabled={isAnyExecuting}
              placeholder={isAnyExecuting ? `Sequence executing via [${selectedLLM}]... [Elapsed: ${formatElapsed(elapsedSeconds)}]` : isListening ? "Streaming voice via Chrome... speak naturally..." : `Enter core directive for [${selectedProject}] via [${selectedLLM}]...`}
              rows={3}
              className={`w-full bg-[#0d0f12] text-[#e2e8f0] border rounded p-2.5 text-xs font-mono focus:outline-none resize-none select-text transition-colors ${isAnyExecuting ? 'opacity-60 border-[#ffb800]/40 bg-[#080a0c] cursor-not-allowed' : isListening ? 'border-[#ffb800] ring-1 ring-[#ffb800]' : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono">
            <div className="flex items-center gap-1.5">
              <button onClick={() => handleAction('INITIATE LLM ANALYSIS')} disabled={isAnyExecuting} className={`px-4 py-1.5 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 ${isAnyExecuting ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed' : 'bg-[#ffb800] text-black hover:bg-[#e6a600] cursor-pointer'}`}>
                {isLLMExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : null}
                <span>{isLLMExecuting ? `ACTIVE [${formatElapsed(elapsedSeconds)}]` : 'INITIATE LLM'}</span>
              </button>
              
              <button onClick={() => handleAction('INITIATE DIRECTOR ANALYSIS')} disabled={isAnyExecuting} className={`px-3 py-1.5 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 ${isAnyExecuting ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed' : (analysisMode === 'DIRECTORS' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 cursor-pointer' : 'bg-[#14171c] text-[#38bdf8] border border-[#232832] hover:border-[#38bdf8]/50 cursor-pointer')}`}>
                {isMultiAgentExecuting || isCascading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" /> : null}
                <span>{isMultiAgentExecuting || isCascading ? `ACTIVE [${formatElapsed(elapsedSeconds)}]` : 'INITIATE DIR'}</span>
              </button>
              
              <button onClick={() => handleAction('REFINE')} disabled={isAnyExecuting} className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">REFINE</button>
              
              <button onClick={() => handleAction('AUTHORIZE ACTION')} disabled={isAnyExecuting || workflowState !== 'MONTY_APPROVED'} className={`px-3 py-1.5 font-semibold rounded text-[11px] transition-all flex items-center gap-1.5 ${workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer' : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'}`}>
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'AUTHORIZED' : 'AUTHORIZE'}
              </button>
              
              <button onClick={() => handleAction('MONTY DISPATCH')} disabled={isAnyExecuting || workflowState !== 'AUTHORIZED'} className={`px-3 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 ${workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'bg-[#d97706]/20 text-[#fef08a] border border-[#d97706] shadow-[0_0_12px_rgba(217,119,6,0.3)] cursor-pointer' : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'}`}>
                {workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'DISPATCHED' ? 'DISPATCHED' : 'DISPATCH'}
              </button>
              
              <button onClick={handleCls} disabled={isAnyExecuting} className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">CLS</button>
              <button onClick={handleAllStop} className="px-3 py-1.5 bg-[#450a0a]/60 hover:bg-[#7f1d1d] text-[#fca5a5] hover:text-white border border-[#7f1d1d] font-bold rounded text-[11px] flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all">
                <AlertOctagon className="w-3.5 h-3.5 text-[#ef4444]" /><span>ALL STOP</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select value={selectedProject} onChange={(e) => handleSelectProject(e.target.value)} disabled={isAnyExecuting} className="bg-[#14171c] text-[#a0aec0] border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer disabled:opacity-50">
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
              
              <div className="flex items-center bg-[#14171c] border border-[#232832] rounded overflow-hidden">
                <select value={selectedAgentDropdown} onChange={(e) => {
                  setSelectedAgentDropdown(e.target.value);
                  if (e.target.value === '5-TURN ROUND-ROBIN CASCADE' || e.target.value === 'ALL DIRECTORS // AUTO-ROUTING') {
                    setAssignedDirectors([]);
                  }
                }} disabled={isAnyExecuting} className="bg-transparent text-[#ffb800] font-bold text-[11px] px-2 py-1.5 focus:outline-none cursor-pointer disabled:opacity-50">
                  <option value="5-TURN ROUND-ROBIN CASCADE">[ ASSIGN: 5-TURN ROUND-ROBIN ]</option>
                  <option value="ALL DIRECTORS // AUTO-ROUTING">[ ASSIGN: ALL DIRECTORS // AUTO-ROUTING ]</option>
                  {DIRECTOR_BOARD_CONFIG.map(a => <option key={a.name} value={a.name} className="bg-[#0d0f12] text-[#e2e8f0]">[ TARGET: {a.name} ]</option>)}
                </select>
                {assignedDirectors.length > 0 && (
                  <div className="flex items-center gap-1 px-2 border-l border-[#232832] text-[#10b981] font-bold text-[10px]">
                    LOCKED: {assignedDirectors.length}
                    <button onClick={() => setAssignedDirectors([])} disabled={isAnyExecuting} className="ml-1 text-[#5c6b7f] hover:text-[#ef4444] cursor-pointer"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <button onClick={() => handleAction('ASSIGN')} disabled={isAnyExecuting} className="px-3.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/50 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <UserCheck className="w-3.5 h-3.5" /><span>ASSIGN TARGET</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
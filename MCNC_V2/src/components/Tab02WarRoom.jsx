import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, ChevronDown, ChevronUp, AlertOctagon, Loader2, Check, UserCheck, Mic, MicOff, X 
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab02WarRoom.css';

const ELITE_CASCADE_STEPS = [
  { id: 'TURN-1-CLAUDE', label: 'CLAUDE 3.5 SONNET', role: 'Architectural Synthesis' },
  { id: 'TURN-2-GEMINI', label: 'GEMINI 1.5 PRO', role: 'Contextual Deep Dive' },
  { id: 'TURN-3-GPT4O', label: 'GPT-4O FRONTIER', role: 'Logic & Code Refinement' },
  { id: 'TURN-4-DEEPSEEK', label: 'DEEPSEEK-R1', role: 'Final Verification & PRD Lock' }
];

const FREE_CASCADE_STEPS = [
  { id: 'TURN-1-NIM', label: 'NVIDIA NIM CLUSTER', role: 'Turn 1: Agent Discussion' },
  { id: 'TURN-2-GROQ', label: 'GROQ LPU ACCELERATOR', role: 'Turn 2: Director Critique' },
  { id: 'TURN-3-GEMINI', label: 'GOOGLE GEMINI CLUSTER', role: 'Turn 3: Synthesis' },
  { id: 'TURN-4-NIM', label: 'NVIDIA NIM CLUSTER', role: 'Turn 4: Refinement' },
  { id: 'TURN-5-JUDGE', label: 'THE JUDGE GATE', role: 'Turn 5: Validation Check' }
];

const BOARDROOM_OPTIONS = [
  { id: 'ELITE_CASCADE', name: '4-TURN HEAVY LIFTING CASCADE', tag: 'ELITE' },
  { id: 'CLAUDE-3.5', name: 'Claude 3.5 Sonnet', tag: 'ELITE' },
  { id: 'GPT-4O', name: 'GPT-4o Frontier', tag: 'ELITE' },
  { id: 'GEMINI-1.5-PRO', name: 'Gemini 1.5 Pro (Studio)', tag: 'ELITE' },
  { id: 'DEEPSEEK-R1', name: 'DeepSeek-R1 (Paid)', tag: 'ELITE' },
  { id: 'KAGGLE-T4', name: 'Kaggle Dual-T4 (32GB)', tag: 'FREE' }
];

const DIRECTOR_BOARD = [
  'TESS // QUANT', 'SILAS // DATABASE', 'AMBER // COPYWRITER', 'ARES // EXECUTION',
  'ATLAS // INFRASTRUCTURE', 'VALERIE // RELATIONS', 'JACK // MARKETING', 'MAVERICK // SEO',
  'SKYLA // FRONTEND WEB', 'JAX // ARTWORK OMEGA', 'ROXY // ARTWORK ALPHA', 'CHARLIE // CODE',
  'THE ASKARI // SECURITY', 'VANCE // FINANCE', 'JUSTIN // RISK LEGAL', 'ORION // STRATEGIC INTEL'
];

const INITIAL_PROJECTS = ['MCNC REACT VITE', 'RHYTHM WASP V8.5', 'PAPERCLIP DAEMON'];

export default function Tab02WarRoom({ ws }) {
  const [assignedDirectors, setAssignedDirectors] = useState([]);
  const [isMultiAgentExecuting, setIsMultiAgentExecuting] = useState(false);

  const [freeCascadeIndex, setFreeCascadeIndex] = useState(0);
  const [isFreeCascading, setIsFreeCascading] = useState(false);

  const [eliteCascadeIndex, setEliteCascadeIndex] = useState(0);
  const [isEliteCascading, setIsEliteCascading] = useState(false);
  
  const [isLLMExecuting, setIsLLMExecuting] = useState(false);
  
  const [analysisMode, setAnalysisMode] = useState('BOARDROOM'); 
  const [workflowState, setWorkflowState] = useState('IDLE'); 
  
  const [isBoardroomOpen, setIsBoardroomOpen] = useState(true);
  const [isDirectorsOpen, setIsDirectorsOpen] = useState(false);

  const [selectedLLM, setSelectedLLM] = useState('ELITE_CASCADE');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState('MCNC REACT VITE');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedAgentDropdown, setSelectedAgentDropdown] = useState('5-TURN ROUND-ROBIN CASCADE');
  
  const [inputBuffer, setInputBuffer] = useState('');
  const [streamLog, setStreamLog] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const streamBottomRef = useRef(null);

  useEffect(() => { streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [streamLog]);

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
      if (finalTranscript) setInputBuffer((prev) => (prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim()));
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

  useEffect(() => {
    const handleTransfer = (e) => {
      if (e.detail && e.detail.payload) {
        setInputBuffer(prev => prev ? prev + '\n\n' + e.detail.payload : e.detail.payload);
        if (e.detail.project) setSelectedProject(e.detail.project);
      }
    };
    window.addEventListener('push-to-warroom', handleTransfer);
    return () => window.removeEventListener('push-to-warroom', handleTransfer);
  }, []);

  useEffect(() => {
    if (!ws) return;
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WAR_ROOM_RESPONSE') {
          setStreamLog(prev => [...prev, { id: Date.now(), sender: data.sender || 'AGENT', text: data.payload, type: data.msgType || 'agent' }]);
        }
      } catch (err) {}
    };
    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  useEffect(() => {
    let timer;
    if (isFreeCascading && freeCascadeIndex < FREE_CASCADE_STEPS.length) {
      const step = FREE_CASCADE_STEPS[freeCascadeIndex];
      setStreamLog(prev => [...prev, { id: Date.now(), sender: `${step.id} // GLOBAL DIRECTOR LOOP`, text: `Executing [${step.role}] via ${step.label} for project [${selectedProject}]...`, type: 'agent' }]);

      timer = setTimeout(() => {
        if (freeCascadeIndex < FREE_CASCADE_STEPS.length - 1) {
          setFreeCascadeIndex(prev => prev + 1);
        } else {
          setIsFreeCascading(false);
          setWorkflowState('MONTY_APPROVED');
          setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // CHIEF OF STAFF', text: `5-Turn Collective Round-Robin complete. PRD validated by Judge Gate. Awaiting Authorization.`, type: 'system' }]);
        }
      }, 2200);
    }
    return () => clearTimeout(timer); 
  }, [isFreeCascading, freeCascadeIndex, selectedProject]);

  useEffect(() => {
    let timer;
    if (isEliteCascading && eliteCascadeIndex < ELITE_CASCADE_STEPS.length) {
      const step = ELITE_CASCADE_STEPS[eliteCascadeIndex];
      setStreamLog(prev => [...prev, { id: Date.now(), sender: `${step.id} // ELITE BOARDROOM`, text: `Executing [${step.role}] via ${step.label} for project [${selectedProject}]...`, type: 'agent' }]);

      timer = setTimeout(() => {
        if (eliteCascadeIndex < ELITE_CASCADE_STEPS.length - 1) {
          setEliteCascadeIndex(prev => prev + 1);
        } else {
          setIsEliteCascading(false);
          setWorkflowState('MONTY_APPROVED');
          setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // CHIEF OF STAFF', text: `4-Turn Heavy Lifting Cascade complete. Elite PRD finalized. Awaiting Paperclip Dispatch Authorization.`, type: 'system' }]);
        }
      }, 2200);
    }
    return () => clearTimeout(timer); 
  }, [isEliteCascading, eliteCascadeIndex, selectedProject]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const formatted = newProjectName.trim().toUpperCase();
    if (!projects.includes(formatted)) { setProjects([...projects, formatted]); setSelectedProject(formatted); }
    setNewProjectName(''); setIsCreatingProject(false);
  };

  const handleCls = () => {
    setIsEliteCascading(false); setIsFreeCascading(false); setIsMultiAgentExecuting(false); setIsLLMExecuting(false);
    setEliteCascadeIndex(0); setFreeCascadeIndex(0); setWorkflowState('IDLE'); setInputBuffer(''); setAssignedDirectors([]);
    setStreamLog([{ id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal cleared. War Room initialized.', type: 'system' }]);
  };

  const handleAllStop = () => {
    setIsEliteCascading(false); setIsFreeCascading(false); setIsMultiAgentExecuting(false); setIsLLMExecuting(false);
    setEliteCascadeIndex(0); setFreeCascadeIndex(0); setWorkflowState('IDLE');
    setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // OVERRIDE', text: '[!] ALL STOP INITIATED. PIPELINE HALTED.', type: 'error' }]);
  };

  const runDynamicMatrixLoop = async (targets) => {
    setIsMultiAgentExecuting(true);
    setWorkflowState('ANALYZING');
    let currentPayload = inputBuffer;
    
    setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `Initiating sequential Strike Team execution across ${targets.length} assigned directors.`, type: 'user' }]);

    for (let i = 0; i < targets.length; i++) {
      const targetAgent = targets[i];
      const baseName = targetAgent.split(' // ')[0];
      const role = targetAgent.split(' // ')[1];
      
      setStreamLog(prev => [...prev, { id: Date.now(), sender: `MONTY // ROUTER`, text: `Passing contextual payload to ${baseName}...`, type: 'system' }]);
      
      try {
        const response = await fetch('http://127.0.0.1:8081/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: currentPayload, director: targetAgent, project: selectedProject })
        });
        const data = await response.json();
        
        setStreamLog(prev => [...prev, {
          id: Date.now(),
          sender: `${baseName} // ${role} [${data.activeModelUsed || 'UNKNOWN'}]`,
          text: data.error ? `Daemon error: ${data.error}` : data.reply,
          type: data.error ? 'error' : 'agent'
        }]);

        currentPayload = currentPayload + `\n\n--- TURN OVERPASS FROM ${baseName} ---\n${data.reply}`;
      } catch (err) {
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: `Matrix failure on node ${baseName}: ${err.message}`, type: 'error' }]);
        setIsMultiAgentExecuting(false);
        return;
      }
    }
    
    setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // CHIEF OF STAFF', text: `Dynamic Director Strike Team complete. Validate the output and adjust parameters if necessary.`, type: 'system' }]);
    setWorkflowState('MONTY_APPROVED');
    setIsMultiAgentExecuting(false);
    setInputBuffer('');
  };

  const handleAction = async (actionType) => {
    if (!inputBuffer.trim() && (actionType.includes('ANALYSIS') || actionType === 'REFINE')) return;

    if (actionType === 'INITIATE LLM ANALYSIS') {
      setAnalysisMode('BOARDROOM'); setWorkflowState('ANALYZING'); setIsBoardroomOpen(true); setIsDirectorsOpen(false);
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `[PROJECT: ${selectedProject}] [BOARDROOM: ${selectedLLM}]: ${inputBuffer}`, type: 'user' }]);

      if (selectedLLM === 'ELITE_CASCADE') {
        setEliteCascadeIndex(0); setIsEliteCascading(true);
      } else {
        setIsLLMExecuting(true);
        try {
          const response = await fetch('http://127.0.0.1:8081/api/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: inputBuffer, model: selectedLLM, project: selectedProject })
          });
          const data = await response.json();
          setStreamLog(prev => [...prev, { id: Date.now(), sender: `BOARDROOM // [${data.activeModelUsed || selectedLLM}]`, text: data.error ? `Daemon error: ${data.error}` : data.reply, type: data.error ? 'error' : 'agent' }]);
          setWorkflowState('MONTY_APPROVED');
        } catch (err) {
          setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: err.message, type: 'error' }]);
        } finally { setIsLLMExecuting(false); }
      }
      setInputBuffer('');
    } 
    
    else if (actionType === 'INITIATE DIRECTOR ANALYSIS') {
      setAnalysisMode('DIRECTORS'); setIsDirectorsOpen(true); setIsBoardroomOpen(false);

      if (assignedDirectors.length === 0) {
        if (selectedAgentDropdown === '5-TURN ROUND-ROBIN CASCADE') {
          setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `[PROJECT: ${selectedProject}] [GLOBAL DIRECTORS]: Initiating 5-Turn Collective Round-Robin...`, type: 'user' }]);
          setFreeCascadeIndex(0);
          setIsFreeCascading(true);
        } else if (selectedAgentDropdown === 'ALL DIRECTORS // AUTO-ROUTING') {
          setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `[PROJECT: ${selectedProject}] [AUTO-ROUTING]: Matrix determining optimal director...`, type: 'user' }]);
          setIsLLMExecuting(true);
          try {
            const response = await fetch('http://127.0.0.1:8081/api/chat', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: inputBuffer, director: 'ALL DIRECTORS // AUTO-ROUTING', project: selectedProject })
            });
            const data = await response.json();
            setStreamLog(prev => [...prev, { id: Date.now(), sender: `MONTY // ROUTER [${data.activeModelUsed || 'UNKNOWN'}]`, text: data.error ? `Daemon error: ${data.error}` : data.reply, type: data.error ? 'error' : 'agent' }]);
            setWorkflowState('MONTY_APPROVED');
          } catch (err) {
            setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: err.message, type: 'error' }]);
          } finally { setIsLLMExecuting(false); }
        } else {
          setAssignedDirectors([selectedAgentDropdown]);
          runDynamicMatrixLoop([selectedAgentDropdown]);
        }
      } else {
        runDynamicMatrixLoop(assignedDirectors);
      }
      if (selectedAgentDropdown !== '5-TURN ROUND-ROBIN CASCADE') setInputBuffer('');
    }

    else if (actionType === 'REFINE') {
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // REFINE', text: `Injecting refinement constraints: ${inputBuffer}`, type: 'user' }]);
      setInputBuffer('');
    }

    else if (actionType === 'ASSIGN') {
      if (selectedAgentDropdown === '5-TURN ROUND-ROBIN CASCADE' || selectedAgentDropdown === 'ALL DIRECTORS // AUTO-ROUTING') {
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM', text: `Global Mode Selected: [${selectedAgentDropdown}]. Click INITIATE DIR to execute.`, type: 'system' }]);
        return;
      }
      if (!assignedDirectors.includes(selectedAgentDropdown)) {
        setAssignedDirectors([...assignedDirectors, selectedAgentDropdown]);
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // ALLOCATION', text: `Task scope locked and appended: [${selectedAgentDropdown}].`, type: 'system' }]);
      }
    }
    
    else if (actionType === 'AUTHORIZE ACTION') {
      if (workflowState !== 'MONTY_APPROVED') return;
      setWorkflowState('AUTHORIZED');
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // GATE', text: `Action authorized for project [${selectedProject}].`, type: 'system' }]);
    } 
    
    else if (actionType === 'MONTY DISPATCH') {
      if (workflowState !== 'AUTHORIZED') return;
      setWorkflowState('DISPATCHED');
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // DISPATCH', text: `Master scope locked for [${selectedProject}]. Handing off validated PRD to Paperclip CEO Daemon.`, type: 'user' }]);
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
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer">
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => { setIsBoardroomOpen(!isBoardroomOpen); setAnalysisMode('BOARDROOM'); }} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]">
              <span>BOARDROOM CASCADE</span>{isBoardroomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isBoardroomOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e]">
                {BOARDROOM_OPTIONS.map((model) => {
                  const isSelected = selectedLLM === model.id;
                  let statusText = 'STANDBY'; let statusColor = 'text-[#5c6b7f] bg-[#1f242d]'; let isSpinning = false;
                  if (isSelected) {
                    if (analysisMode === 'BOARDROOM' && (isEliteCascading || isLLMExecuting)) { statusText = 'ACTIVE'; statusColor = 'text-black bg-[#38bdf8]'; isSpinning = true; } 
                    else if (workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED') { statusText = 'LOCKED'; statusColor = 'text-black bg-[#10b981]'; }
                  }
                  if (isEliteCascading && selectedLLM === 'ELITE_CASCADE' && model.id !== 'ELITE_CASCADE') {
                    const activeModelId = ELITE_CASCADE_STEPS[eliteCascadeIndex]?.id;
                    if (activeModelId && activeModelId.includes(model.id.split('-')[0])) { statusText = 'ANALYZING'; statusColor = 'text-black bg-[#38bdf8]'; isSpinning = true; } 
                    else { statusText = 'LOCKED'; statusColor = 'text-black bg-[#10b981]'; }
                  }
                  let tagColor = 'bg-[#1f242d] text-[#5c6b7f]';
                  if (statusText === 'STANDBY') {
                      if (model.tag === 'ELITE') tagColor = 'bg-[#1f242d] text-[#5c6b7f]';
                      else if (model.tag === 'FREE') tagColor = 'bg-[#10b981]/20 text-[#10b981]';
                  }
                  return (
                    <button key={model.id} onClick={() => setSelectedLLM(model.id)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${isSelected ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold' : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'}`}>
                      <div className="flex items-center gap-2">{isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}<span className="truncate pr-1">{model.name}</span></div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${statusText === 'STANDBY' ? tagColor : statusColor}`}>{statusText === 'STANDBY' ? model.tag : statusText}</span>
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
                <span className="text-[9px] border border-[#38bdf8] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono font-bold">ONLINE (16)</span>
                {isDirectorsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {isDirectorsOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e] max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                
                <button
                  onClick={() => setSelectedAgentDropdown('5-TURN ROUND-ROBIN CASCADE')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 mb-2 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    selectedAgentDropdown === '5-TURN ROUND-ROBIN CASCADE'
                      ? 'bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/50 font-bold shadow-[0_0_8px_rgba(255,184,0,0.2)]'
                      : 'bg-[#14171c] text-[#ffb800] border border-[#ffb800]/30 hover:bg-[#1a1f26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFreeCascading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffb800]" />}
                    <span className="truncate pr-1">5-TURN ROUND-ROBIN CASCADE</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${isFreeCascading ? 'bg-[#ffb800] text-black' : 'bg-[#1f242d] text-[#5c6b7f]'}`}>
                    {isFreeCascading ? 'ANALYZING' : 'BASE 1'}
                  </span>
                </button>

                {DIRECTOR_BOARD.map(agent => {
                  const isSpecificTarget = assignedDirectors.includes(agent) || selectedAgentDropdown === agent;
                  const isSpinning = isMultiAgentExecuting && assignedDirectors.includes(agent); 
                  
                  let statusText = 'STANDBY'; let statusColor = 'text-[#5c6b7f] bg-[#1f242d]';
                  if (isSpinning) { statusText = 'SCANNED'; statusColor = 'text-black bg-[#38bdf8]'; } 
                  else if (assignedDirectors.includes(agent)) { statusText = 'LOCKED'; statusColor = 'text-black bg-[#10b981]'; }
                  return (
                    <button key={agent} onClick={() => setSelectedAgentDropdown(agent)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${isSpecificTarget ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold' : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'}`}>
                      <div className="flex items-center gap-2">{isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}<span className="truncate pr-1">{agent}</span></div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${statusColor}`}>{statusText}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2 uppercase tracking-widest font-bold">
            THE WAR ROOM // LIVE COMMS & PRD PIPELINE <span className="text-[#ffb800]">[{selectedProject}]</span>
          </div>
          {lastAgentLog && (
            <div className="flex items-center gap-2">
              <SpeakerBtn text={lastAgentLog.text} label="VOICE BRIEF" />
            </div>
          )}
        </div>
        
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

        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none">
          <div className="flex items-center justify-between text-[11px] bg-[#14171c] px-3 py-1.5 rounded border border-[#232832]">
            <label className="text-[#ffb800] hover:text-[#fef08a] flex items-center gap-2 font-bold tracking-wider transition-colors cursor-pointer select-none">
              <Paperclip className="w-4 h-4 text-[#ffb800]" /><span>+ ATTACH FILE / SCREENSHOT (CLICK OR PRESS CTRL+V)</span>
            </label>
            <button onClick={toggleMic} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${isListening ? 'bg-[#ffb800] text-black border border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.4)]' : 'bg-[#0d0f12] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'}`}>
              {isListening ? <MicOff className="w-3.5 h-3.5 text-black" /> : <Mic className="w-3.5 h-3.5 text-[#ffb800]" />}<span>{isListening ? 'STOP MIC' : 'CHROME MIC'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              id="warroom-input" value={inputBuffer} onChange={(e) => setInputBuffer(e.target.value)}
              placeholder={isListening ? "Streaming voice via Chrome... speak naturally..." : (analysisMode === 'BOARDROOM' ? `Enter core objective for [${selectedProject}] Elite Boardroom...` : `Enter direct scope for assigned targets [${assignedDirectors.length > 0 ? assignedDirectors.map(d => d.split(' // ')[0]).join(', ') : 'None'}]...`)}
              rows={3}
              className={`w-full bg-[#0d0f12] text-[#e2e8f0] border rounded p-2.5 text-xs font-mono focus:outline-none resize-none select-text transition-colors ${isListening ? 'border-[#ffb800] ring-1 ring-[#ffb800]' : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button onClick={() => handleAction('INITIATE LLM ANALYSIS')} disabled={isEliteCascading || isLLMExecuting || !inputBuffer.trim()} className={`px-4 py-1.5 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${isEliteCascading || isLLMExecuting || !inputBuffer.trim() ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832]' : 'bg-[#ffb800] text-black hover:bg-[#e6a600]'}`}>
                {isEliteCascading || isLLMExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isEliteCascading || isLLMExecuting ? 'ACTIVE...' : 'INITIATE LLM'}
              </button>
              
              <button onClick={() => handleAction('INITIATE DIRECTOR ANALYSIS')} disabled={isMultiAgentExecuting || isFreeCascading || !inputBuffer.trim()} className={`px-3 py-1.5 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${isMultiAgentExecuting || isFreeCascading || !inputBuffer.trim() ? 'bg-[#14171c] text-[#5c6b7f] border border-[#232832]' : (analysisMode === 'DIRECTORS' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50' : 'bg-[#14171c] text-[#38bdf8] border border-[#232832] hover:border-[#38bdf8]/50')}`}>
                {isMultiAgentExecuting || isFreeCascading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isMultiAgentExecuting || isFreeCascading ? 'ACTIVE...' : 'INITIATE DIR'}
              </button>
              
              <button onClick={() => handleAction('REFINE')} className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer">REFINE</button>
              
              <button onClick={() => handleAction('AUTHORIZE ACTION')} className={`px-3 py-1.5 font-semibold rounded text-[11px] transition-all flex items-center gap-1.5 ${workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer' : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'}`}>
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'AUTHORIZED' : 'AUTHORIZE'}
              </button>
              
              <button onClick={() => handleAction('MONTY DISPATCH')} className={`px-3 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 ${workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'bg-[#d97706]/20 text-[#fef08a] border border-[#d97706] shadow-[0_0_12px_rgba(217,119,6,0.3)] cursor-pointer' : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'}`}>
                {workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'DISPATCHED' ? 'DISPATCHED' : 'DISPATCH'}
              </button>
              
              <button onClick={handleCls} className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] cursor-pointer">CLS</button>
              <button onClick={handleAllStop} className="px-3 py-1.5 bg-[#ef4444]/20 text-[#fca5a5] border border-[#ef4444]/60 font-extrabold rounded text-[11px] hover:bg-[#ef4444]/40 cursor-pointer flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-[#ef4444]" /><span>ALL STOP</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="bg-[#14171c] text-[#a0aec0] border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer">
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
              
              <div className="flex items-center bg-[#14171c] border border-[#232832] rounded overflow-hidden">
                <select value={selectedAgentDropdown} onChange={(e) => {
                  setSelectedAgentDropdown(e.target.value);
                  if (e.target.value === '5-TURN ROUND-ROBIN CASCADE' || e.target.value === 'ALL DIRECTORS // AUTO-ROUTING') {
                    setAssignedDirectors([]);
                  }
                }} className="bg-transparent text-[#ffb800] font-bold text-[11px] px-2 py-1.5 focus:outline-none cursor-pointer">
                  <option value="5-TURN ROUND-ROBIN CASCADE">[ ASSIGN: 5-TURN ROUND-ROBIN ]</option>
                  <option value="ALL DIRECTORS // AUTO-ROUTING">[ ASSIGN: ALL DIRECTORS // AUTO-ROUTING ]</option>
                  {DIRECTOR_BOARD.map(agent => <option key={agent} value={agent} className="bg-[#0d0f12] text-[#e2e8f0]">[ TARGET: {agent} ]</option>)}
                </select>
                {assignedDirectors.length > 0 && (
                  <div className="flex items-center gap-1 px-2 border-l border-[#232832] text-[#10b981] font-bold text-[10px]">
                    LOCKED: {assignedDirectors.length}
                    <button onClick={() => setAssignedDirectors([])} className="ml-1 text-[#5c6b7f] hover:text-[#ef4444] cursor-pointer"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <button onClick={() => handleAction('ASSIGN')} className="px-3.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/50 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /><span>ASSIGN TARGET</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
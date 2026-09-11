import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, ChevronDown, ChevronUp, AlertOctagon, Loader2, Check, UserCheck, Mic, MicOff 
} from 'lucide-react';
import './Tab02WarRoom.css';

const CASCADE_LLMS = [
  { id: 'DEEPSEEK-R1', label: 'DEEPSEEK-R1', role: 'Logic & Architecture Mapping' },
  { id: 'ASKARI-LLAMA', label: 'THE ASKARI (LLAMA 3.3)', role: 'SOP & Adversarial Validation' },
  { id: 'CLAUDE-3.5', label: 'CLAUDE 3.5 SONNET', role: 'Final Execution & PRD Generation' }
];

const BOARDROOM_OPTIONS = [
  { id: 'CASCADE', name: 'LEAN 3-MODEL CASCADE', tag: 'BASE 1' },
  { id: 'CLAUDE-3.5', name: 'Claude 3.5 Sonnet', tag: 'ELITE' },
  { id: 'GPT-4O', name: 'GPT-4o Frontier', tag: 'ELITE' },
  { id: 'GEMINI-1.5', name: 'Gemini 1.5 Pro', tag: 'ELITE' },
  { id: 'DEEPSEEK-R1', name: 'DeepSeek-R1', tag: 'FREE' },
  { id: 'ASKARI-LLAMA', name: 'The Askari (Llama 3.3 70B)', tag: 'FREE' },
  { id: 'GROK-2', name: 'Grok 2', tag: 'ELITE' }
];

const DIRECTOR_BOARD = [
  'TESS // QUANT', 'SILAS // DATABASE', 'AMBER // COPYWRITER', 'ARES // EXECUTION',
  'ATLAS // INFRASTRUCTURE', 'VALERIE // RELATIONS', 'JACK // MARKETING', 'MAVERICK // SEO',
  'SKYLA // FRONTEND WEB', 'JAX // ARTWORK OMEGA', 'ROXY // ARTWORK ALPHA', 'CHARLIE // CODE',
  'THE ASKARI // SECURITY', 'VANCE // FINANCE', 'JUSTIN // RISK LEGAL', 'ORION // STRATEGIC INTEL'
];

const INITIAL_PROJECTS = ['MCNC REACT VITE', 'RHYTHM WASP V8.5', 'PAPERCLIP DAEMON'];

export default function Tab02WarRoom({ ws }) {
  const [currentCascadeIndex, setCurrentCascadeIndex] = useState(0);
  const [isCascading, setIsCascading] = useState(false);
  const [isSingleLLMScanning, setIsSingleLLMScanning] = useState(false);
  const [isDirectorScanning, setIsDirectorScanning] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('BOARDROOM'); 
  const [workflowState, setWorkflowState] = useState('IDLE'); 
  
  const [isBoardroomOpen, setIsBoardroomOpen] = useState(true);
  const [isDirectorsOpen, setIsDirectorsOpen] = useState(false);

  const [selectedLLM, setSelectedLLM] = useState('CASCADE');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState('MCNC REACT VITE');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('ALL DIRECTORS // AUTO-ROUTING');
  
  const [inputBuffer, setInputBuffer] = useState('');
  const [streamLog, setStreamLog] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

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
          setStreamLog(prev => [...prev, { 
            id: Date.now(), 
            sender: data.sender || 'AGENT', 
            text: data.payload, 
            type: data.msgType || 'agent' 
          }]);
        }
      } catch (err) {
        console.error("Failed to parse WS payload:", err);
      }
    };
    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  useEffect(() => {
    let timer;
    if (isCascading && currentCascadeIndex < CASCADE_LLMS.length) {
      const activeModel = CASCADE_LLMS[currentCascadeIndex];
      setStreamLog(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: `${activeModel.id} // COMMAND INTERFACE`,
          text: `Analyzing requirement for project [${selectedProject}] under role [${activeModel.role}]...`,
          type: 'agent'
        }
      ]);

      timer = setTimeout(() => {
        if (currentCascadeIndex < CASCADE_LLMS.length - 1) {
          setCurrentCascadeIndex(prev => prev + 1);
        } else {
          setIsCascading(false);
          setWorkflowState('MONTY_APPROVED');
          setStreamLog(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: 'MONTY // CHIEF OF STAFF',
              text: `Lean Base 1 Cascade Analysis for [${selectedProject}] complete. PRD standards met. Awaiting Authorization.`,
              type: 'system'
            }
          ]);
        }
      }, 2200);
    }
    return () => clearTimeout(timer); 
  }, [isCascading, currentCascadeIndex, selectedProject]);

  useEffect(() => {
    let timer;
    if (isSingleLLMScanning) {
      timer = setTimeout(() => {
        setIsSingleLLMScanning(false);
        setWorkflowState('MONTY_APPROVED');
        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'MONTY // CHIEF OF STAFF',
            text: `Single LLM Scan via [${selectedLLM}] complete for [${selectedProject}]. Output verified. Awaiting Authorization.`,
            type: 'system'
          }
        ]);
      }, 2800);
    }
    return () => clearTimeout(timer); 
  }, [isSingleLLMScanning, selectedLLM, selectedProject]);

  useEffect(() => {
    let timer;
    if (isDirectorScanning) {
      const isAutoRouting = selectedAgent === 'ALL DIRECTORS // AUTO-ROUTING';
      const agentName = isAutoRouting ? 'AUTO-ROUTING MATRIX' : selectedAgent;
      
      timer = setTimeout(() => {
        setIsDirectorScanning(false);
        setWorkflowState('MONTY_APPROVED');
        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'MONTY // CHIEF OF STAFF',
            text: isAutoRouting 
              ? `Director Auto-Routing complete for [${selectedProject}]. Dependencies mapped to optimal specialists. Awaiting Authorization.` 
              : `Director Scan via [${agentName}] complete for [${selectedProject}]. Output verified. Awaiting Authorization.`,
            type: 'system'
          }
        ]);
      }, 2800);
    }
    return () => clearTimeout(timer); 
  }, [isDirectorScanning, selectedAgent, selectedProject]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const formatted = newProjectName.trim().toUpperCase();
    if (!projects.includes(formatted)) {
      setProjects([...projects, formatted]);
      setSelectedProject(formatted);
    }
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const handleCls = () => {
    setIsCascading(false);
    setIsSingleLLMScanning(false);
    setIsDirectorScanning(false);
    setCurrentCascadeIndex(0);
    setWorkflowState('IDLE');
    setInputBuffer('');
    setStreamLog([
      { id: Date.now(), sender: 'SYSTEM // GATE KEEPER', text: 'Terminal cleared. War Room initialized.', type: 'system' }
    ]);
  };

  const handleAllStop = () => {
    setIsCascading(false);
    setIsSingleLLMScanning(false);
    setIsDirectorScanning(false);
    setCurrentCascadeIndex(0);
    setWorkflowState('IDLE');
    setStreamLog(prev => [...prev, { 
      id: Date.now(), 
      sender: 'WARLORD // OVERRIDE', 
      text: '[!] ALL STOP INITIATED. PIPELINE HALTED. STATE RESET TO ZERO.', 
      type: 'error' 
    }]);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'WAR_ROOM_ACTION',
        action: 'ALL STOP',
        project: selectedProject
      }));
    }
  };

  const handleAction = (actionType) => {
    if (!inputBuffer.trim() && (actionType.includes('ANALYSIS') || actionType === 'REFINE')) return;

    if (actionType === 'INITIATE LLM ANALYSIS') {
      setAnalysisMode('BOARDROOM');
      setWorkflowState('ANALYZING');
      setIsBoardroomOpen(true);
      setIsDirectorsOpen(false);
      
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'MONTY // COMMAND', 
        text: `[PROJECT: ${selectedProject}] [BOARDROOM: ${selectedLLM}]: ${inputBuffer}`, 
        type: 'user' 
      }]);

      if (selectedLLM === 'CASCADE') {
        setCurrentCascadeIndex(0);
        setIsCascading(true);
      } else {
        setIsSingleLLMScanning(true);
      }
    } 
    
    else if (actionType === 'INITIATE DIRECTOR ANALYSIS') {
      setAnalysisMode('DIRECTORS');
      setWorkflowState('ANALYZING');
      setIsDirectorsOpen(true);
      setIsBoardroomOpen(false);
      
      const isAutoRouting = selectedAgent === 'ALL DIRECTORS // AUTO-ROUTING';
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'MONTY // COMMAND', 
        text: isAutoRouting 
          ? `[PROJECT: ${selectedProject}] [AUTO-ROUTING SEQUENCE]: Evaluating prompt against 16-Agent Matrix...`
          : `[PROJECT: ${selectedProject}] [DIRECTOR: ${selectedAgent}]: ${inputBuffer}`, 
        type: 'user' 
      }]);
      setIsDirectorScanning(true);
    }

    else if (actionType === 'REFINE') {
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'WARLORD // REFINE', 
        text: `Injecting refinement constraints: ${inputBuffer}`, 
        type: 'user' 
      }]);
    }

    else if (actionType === 'ASSIGN') {
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'WARLORD // ALLOCATION', 
        text: `Task scope locked and assigned to: [${selectedAgent}].`, 
        type: 'system' 
      }]);
    }
    
    else if (actionType === 'AUTHORIZE ACTION') {
      if (workflowState !== 'MONTY_APPROVED') return;
      setWorkflowState('AUTHORIZED');
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'WARLORD // GATE', 
        text: `Action authorized for project [${selectedProject}]. Monty dispatch sequence unlocked.`, 
        type: 'system' 
      }]);
    } 
    
    else if (actionType === 'MONTY DISPATCH') {
      if (workflowState !== 'AUTHORIZED') return;
      setWorkflowState('DISPATCHED');
      setStreamLog(prev => [...prev, { 
        id: Date.now(), 
        sender: 'MONTY // DISPATCH', 
        text: `Master scope locked for [${selectedProject}]. Spawning sub-tasks to Tab 04 Kanban & Tab 03 Projects.`, 
        type: 'user' 
      }]);
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'WAR_ROOM_ACTION',
        action: actionType,
        project: selectedProject,
        llm: selectedLLM,
        directorTarget: selectedAgent,
        mode: analysisMode,
        state: workflowState,
        payload: inputBuffer
      }));
    }
    
    if (actionType.includes('ANALYSIS') || actionType === 'REFINE') {
      setInputBuffer('');
    }
  };

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2 select-none">
      {/* LEFT NAVIGATION */}
      <div className="w-80 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 overflow-hidden flex-shrink-0">
        <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden mb-2">
          <div className="px-3 py-2 bg-[#14171c] flex items-center justify-between border-b border-[#1f242d]">
            <span className="text-[#ffb800] font-bold text-xs tracking-wider">PROJECT CONTAINER</span>
            <button 
              onClick={() => setIsCreatingProject(!isCreatingProject)}
              className="text-[9px] border border-[#ffb800] text-[#ffb800] px-1.5 py-0.5 rounded font-mono font-bold hover:bg-[#ffb800]/10 cursor-pointer"
            >
              {isCreatingProject ? 'CANCEL' : '+ NEW PROJECT'}
            </button>
          </div>
          <div className="p-2 bg-[#0a0c0e]">
            {isCreatingProject ? (
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="PROJECT NAME..." 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-[#14171c] text-white border border-[#232832] px-2 py-1.5 text-[11px] font-mono rounded focus:border-[#ffb800] outline-none"
                />
                <button 
                  onClick={handleCreateProject} 
                  className="bg-[#ffb800] text-black text-[11px] font-bold px-3 py-1.5 rounded hover:bg-[#e6a600] cursor-pointer"
                >
                  ADD
                </button>
              </div>
            ) : (
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer"
              >
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {/* BOARDROOM CASCADE */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button
              onClick={() => { setIsBoardroomOpen(!isBoardroomOpen); setAnalysisMode('BOARDROOM'); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]"
            >
              <span>BOARDROOM CASCADE</span>
              {isBoardroomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isBoardroomOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e]">
                {BOARDROOM_OPTIONS.map((model) => {
                  const isSelected = selectedLLM === model.id;
                  
                  let statusText = 'STANDBY';
                  let statusColor = 'text-[#5c6b7f] bg-[#1f242d]';
                  let isSpinning = false;

                  if (isSelected) {
                    if (analysisMode === 'BOARDROOM' && (isCascading || isSingleLLMScanning)) {
                      statusText = 'ACTIVE';
                      statusColor = 'text-black bg-[#38bdf8]';
                      isSpinning = true;
                    } else if (workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED') {
                      statusText = 'LOCKED';
                      statusColor = 'text-black bg-[#10b981]';
                    }
                  }

                  if (isCascading && selectedLLM === 'CASCADE' && model.id !== 'CASCADE') {
                    const activeModelId = CASCADE_LLMS[currentCascadeIndex]?.id;
                    const modelIndex = CASCADE_LLMS.findIndex(m => m.id === model.id);
                    if (activeModelId === model.id) {
                      statusText = 'ANALYZING';
                      statusColor = 'text-black bg-[#38bdf8]';
                      isSpinning = true;
                    } else if (modelIndex < currentCascadeIndex) {
                      statusText = 'LOCKED';
                      statusColor = 'text-black bg-[#10b981]';
                    }
                  }

                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedLLM(model.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold'
                          : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}
                        <span className="truncate pr-1">{model.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${statusColor}`}>
                        {statusText === 'STANDBY' ? model.tag : statusText}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DIRECTOR BOARD */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button
              onClick={() => { setIsDirectorsOpen(!isDirectorsOpen); setAnalysisMode('DIRECTORS'); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]"
            >
              <span>DIRECTOR BOARD</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] border border-[#38bdf8] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono font-bold">ONLINE (16)</span>
                {isDirectorsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isDirectorsOpen && (
              <div className="p-2 space-y-1 bg-[#0a0c0e] max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {DIRECTOR_BOARD.map(agent => {
                  const isSelected = selectedAgent === agent || selectedAgent === 'ALL DIRECTORS // AUTO-ROUTING';
                  const isSpecificTarget = selectedAgent === agent;
                  const isSpinning = isDirectorScanning && isSelected;
                  
                  let statusText = 'STANDBY';
                  let statusColor = 'text-[#5c6b7f] bg-[#1f242d]';

                  if (isSpinning) {
                    statusText = 'SCANNING';
                    statusColor = 'text-black bg-[#38bdf8]';
                  } else if (isSpecificTarget && (workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED')) {
                    statusText = 'LOCKED';
                    statusColor = 'text-black bg-[#10b981]';
                  }

                  return (
                    <button
                      key={agent}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        isSpecificTarget
                          ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50 font-bold'
                          : 'bg-[#14171c] text-[#8fa0b5] border border-[#1f242d] hover:bg-[#1a1f26] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSpinning && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />}
                        <span className="truncate pr-1">{agent}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2 uppercase tracking-widest font-bold">
            THE WAR ROOM // LIVE COMMS & PRD PIPELINE <span className="text-[#ffb800]">[{selectedProject}]</span>
          </div>
        </div>
        
        {/* Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-text cursor-text custom-scrollbar">
          {streamLog.map(log => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center gap-2 select-none">
                <span className={`font-bold text-[11px] tracking-wide ${
                  log.type === 'error' ? 'text-[#ef4444]' :
                  log.type === 'system' ? 'text-[#10b981]' : 
                  log.type === 'user' ? 'text-[#ffb800]' : 'text-[#8fa0b5]'
                }`}>
                  {log.sender}
                </span>
              </div>
              <div className={`text-xs leading-relaxed pl-3 py-2 rounded border select-text ${
                log.type === 'error' 
                  ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]' 
                  : 'bg-[#101317]/60 border-[#14181f] text-[#d1d5db]'
              }`}>
                {log.text}
              </div>
            </div>
          ))}
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
              id="warroom-input"
              value={inputBuffer}
              onChange={(e) => setInputBuffer(e.target.value)}
              placeholder={
                isListening 
                  ? "Streaming voice via Chrome... speak naturally..." 
                  : (analysisMode === 'BOARDROOM' ? `Enter core objective for [${selectedProject}] OpenRouter Analysis...` : `Enter direct scope for [${selectedProject}] Director Board execution...`)
              }
              rows={3}
              className={`w-full bg-[#0d0f12] text-[#e2e8f0] border rounded p-2.5 text-xs font-mono focus:outline-none resize-none select-text transition-colors ${
                isListening ? 'border-[#ffb800] ring-1 ring-[#ffb800]' : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'
              }`}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAction('INITIATE LLM ANALYSIS')}
                className="px-4 py-1.5 bg-[#ffb800] text-black font-bold rounded text-[11px] hover:bg-[#e6a600] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isCascading || isSingleLLMScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isCascading || isSingleLLMScanning ? 'ACTIVE...' : 'INITIATE LLM'}
              </button>
              <button 
                onClick={() => handleAction('INITIATE DIRECTOR ANALYSIS')}
                className={`px-3 py-1.5 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  analysisMode === 'DIRECTORS' ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/50' : 'bg-[#14171c] text-[#38bdf8] border border-[#232832] hover:border-[#38bdf8]/50'
                }`}
              >
                {isDirectorScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isDirectorScanning ? 'SCANNING...' : 'INITIATE DIR'}
              </button>
              <button 
                onClick={() => handleAction('REFINE')}
                className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer"
              >
                REFINE
              </button>
              <button 
                onClick={() => handleAction('AUTHORIZE ACTION')}
                className={`px-3 py-1.5 font-semibold rounded text-[11px] transition-all flex items-center gap-1.5 ${
                  workflowState === 'MONTY_APPROVED' || workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED'
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer'
                    : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                }`}
              >
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'AUTHORIZED' : 'AUTHORIZE'}
              </button>
              <button 
                onClick={() => handleAction('MONTY DISPATCH')}
                className={`px-3 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 ${
                  workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED'
                    ? 'bg-[#d97706]/20 text-[#fef08a] border border-[#d97706] shadow-[0_0_12px_rgba(217,119,6,0.3)] cursor-pointer'
                    : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                }`}
              >
                {workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'DISPATCHED' ? 'DISPATCHED' : 'DISPATCH'}
              </button>
              <button 
                onClick={handleCls}
                className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] cursor-pointer"
              >
                CLS
              </button>
              <button 
                onClick={handleAllStop}
                className="px-3 py-1.5 bg-[#ef4444]/20 text-[#fca5a5] border border-[#ef4444]/60 font-extrabold rounded text-[11px] hover:bg-[#ef4444]/40 cursor-pointer flex items-center gap-1"
              >
                <AlertOctagon className="w-3 h-3 text-[#ef4444]" />
                <span>ALL STOP</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-[#14171c] text-[#a0aec0] border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer"
              >
                {projects.map(p => <option key={p} value={p}>[ PROJECT: {p} ]</option>)}
              </select>
              <select 
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#14171c] text-[#ffb800] font-bold border border-[#232832] text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#ffb800] cursor-pointer"
              >
                <option value="ALL DIRECTORS // AUTO-ROUTING">[ ASSIGN: ALL DIRECTORS // AUTO-ROUTING ]</option>
                {DIRECTOR_BOARD.map(agent => (
                  <option key={agent} value={agent} className="bg-[#0d0f12] text-[#e2e8f0]">
                    [ ASSIGN: {agent} ]
                  </option>
                ))}
              </select>
              <button 
                onClick={() => handleAction('ASSIGN')}
                className="px-3.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/50 font-bold rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>ASSIGN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
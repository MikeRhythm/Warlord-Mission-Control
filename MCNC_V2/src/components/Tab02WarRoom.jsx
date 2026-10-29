import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, ChevronDown, ChevronUp, AlertOctagon, Loader2, Check, UserCheck, Mic, MicOff, X, Copy, Square, Cpu, CheckSquare, Sparkles, FileText, Server, AlertTriangle, Eye, Trash2, Code, ArrowRight, Lock, RotateCcw
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';
import './Tab02WarRoom.css';

// Stage 1 Forensic Deconstruction Template Wrapper
const STAGE1_TEMPLATE_HEADER = `EXECUTE: STAGE 1 ZERO-SOLUTION FORENSIC DECONSTRUCTION
GOVERNANCE: WARLORD ROE TIER 1 - TIER 5
TARGET: 4-TURN LOCAL / FREE CLUSTER CASCADE
DOMINANT METRIC: ABSOLUTE PRECISION

[MISSION DIRECTIVE]
Ingest the core project scope. Deconstruct the requirements across the 16 MECE Directors Matrix (00_core through 15_social).
NEGATIVE CONSTRAINTS:
- Do NOT cite temperature formulas (e.g. T=0.20), top_p, or internal framework scripts.
- Do NOT explain what Monty or Omni-Director is. Jump directly into technical deconstruction.
- Never use square brackets around placeholders (e.g. do not output [Client], [Insert], [Date]).

[CASCADE RULES OF ENGAGEMENT]
- Turn 1 (NIM Llama 3.3 70B): System Architecture. Extract functional requirements and component topology.
- Turn 2 (Nemotron 70B): UI/UX & Asset Audit. Map the Authentic Africa Palette, timber tokens, and attached design references.
- Turn 3 (Groq Llama 3.3 70B): Narrative & Statutory Lead. Lock in the accurate humanitarian mission (fees & food, not building schools).
- Turn 4 (The Judge Gate): Risk & Contract Verification. Enforce rhythm_multiplier: 1.0 and output the final validated ### DISPATCH MANIFEST.

[OUTPUT FORMAT]
Output STRICT RAW JSON ONLY. No markdown code blocks, no preamble, no commentary:
{
  "pipeline_stage": 1,
  "status": "FORENSIC_DECONSTRUCTION_COMPLETE",
  "project": "__PROJECT_NAME__",
  "dominant_metric": "Absolute Precision",
  "raw_input_digest": "<clinical 1-sentence restatement>",
  "pillars": [
    {
      "domain_id": "<00 to 15>",
      "domain_name": "<exact domain name>",
      "owner": "<Director Name>",
      "functional_objective": "<objective requirement>",
      "constraints": ["<constraint 1>", "<constraint 2>"],
      "dependencies": ["<prerequisite domain_id>"],
      "rhythm_multiplier": 1.0
    }
  ],
  "unmapped_items": []
}

[INPUT SPECIFICATION]:
`;

// Stage 2 Full Code Production Scaffold
const STAGE2_CODE_PROMPT_TEMPLATE = `EXECUTE: STAGE 2 FULL SINGLE-FILE PRODUCTION DELIVERABLE
GOVERNANCE: WARLORD ROE TIER 1 - TIER 5
TARGET: FULL SINGLE-FILE READY-TO-PASTE PRODUCTION ARTIFACT
DOMINANT METRIC: ABSOLUTE PRECISION & DIRECT VISUAL FIDELITY

[MISSION DIRECTIVE]
Ingest the approved Stage 1 PRD and all attached reference assets. Deliver the 100% complete, fully functional, responsive, single-file HTML5/CSS3/Vanilla JS production code for __PROJECT_NAME__ (__TARGET_ARTIFACT__).
- Zero snippets. Zero ellipses (...). Zero diffs.
- Zero placeholder brackets (e.g. no [Client], no [Insert Code Here]).
- Output the full, complete document from <!DOCTYPE html> to </html>.

[PROJECT PALETTE & DESIGN MATRIX]
__PALETTE_RULES__

[APPROVED STAGE 1 SCOPE & PRD CONTEXT]
__STAGE1_CONTEXT__

[ATTACHED REFERENCE ASSETS DIRECTIVE]
__ASSET_DIRECTIVES__

Deliver the COMPLETE code block below:
`;

// Elite Frontier LLMs Pool - Active Pinned OpenRouter Slugs
const ELITE_MODELS_POOL = [
  { id: 'anthropic/claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet', role: 'Architectural Synthesis', tag: 'Turn 1' },
  { id: 'openai/gpt-4o-2024-11-20', name: 'GPT-4o Frontier', role: 'Logic & Scaffolding', tag: 'Turn 2' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', role: 'Contextual Deep Dive', tag: 'Turn 3' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek-R1', role: 'Validation & PRD Lock', tag: 'Turn 4' }
];

// Free Kaggle Dual-T4 32GB Models Pool
const KAGGLE_MODELS_POOL = [
  { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', role: 'System Architect & Strategy', tag: 'Turn 1' },
  { id: 'llama3:latest', name: 'Llama 3 8B', role: 'Director Critique & Ops', tag: 'Turn 2' },
  { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder', role: 'Technical Refinement & Code', tag: 'Turn 3' },
  { id: 'qwen2.5:7b-judge', name: 'Qwen 2.5 Judge Gate', role: 'Risk Audit & Verification', tag: 'Turn 4' }
];

// Local / Free Harvested Clusters Pool (NIM, Groq, Gemini, Ollama)
const LOCAL_CLUSTERS_MODELS_POOL = [
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NIM)', role: 'Core Logic & Architecture', tag: 'NIM' },
  { id: 'nvidia/nemotron-70b-ultra', name: 'Nemotron 70B (NIM)', role: 'Deep Reasoning & Audit', tag: 'NIM' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', role: 'Ultra-Fast Synthesis', tag: 'GROQ' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Studio)', role: 'Broad Context & Retrieval', tag: 'GEMINI' },
  { id: 'llama3:latest', name: 'Llama 3 (Ollama Local)', role: 'Zero-Network Sovereign', tag: 'LOCAL' }
];

const FREE_CASCADE_STEPS = [
  { id: 'TURN-1-NIM', label: 'NVIDIA NIM CLUSTER', model: 'meta-llama/llama-3.3-70b-instruct', role: 'Turn 1: Agent Discussion' },
  { id: 'TURN-2-GROQ', label: 'GROQ LPU ACCELERATOR', model: 'llama-3.3-70b-versatile', role: 'Turn 2: Director Critique' },
  { id: 'TURN-3-GEMINI', label: 'GOOGLE GEMINI CLUSTER', model: 'gemini-1.5-pro', role: 'Turn 3: Synthesis' },
  { id: 'TURN-4-NIM', label: 'NVIDIA NIM CLUSTER', model: 'nvidia/nemotron-70b-ultra', role: 'Turn 4: Refinement' },
  { id: 'TURN-5-JUDGE', label: 'THE JUDGE GATE', model: 'meta-llama/llama-3.3-70b-instruct', role: 'Turn 5: Validation Check' }
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

const DEFAULT_PROJECTS = ['The Chief Madothi Fund', 'MAKING MONEY IDEAS', 'ZAMBEZI SAFARI', 'WAR ROOM - DIRECTOR BOARD KAGGLE TEST', 'MCNC REACT VITE', 'RHYTHM WASP V8.5'];

export default function Tab02WarRoom({ ws }) {
  const [assignedDirectors, setAssignedDirectors] = useState([]);
  const [isMultiAgentExecuting, setIsMultiAgentExecuting] = useState(false);

  const [cascadeIndex, setCascadeIndex] = useState(0);
  const [isCascading, setIsCascading] = useState(false);
  const [isLLMExecuting, setIsLLMExecuting] = useState(false);
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('BOARDROOM'); 

  // Pipeline Stage: 1 = Forensic Deconstruction, 2 = Physical Artifact Delivery
  const [pipelineStage, setPipelineStage] = useState(() => {
    return parseInt(localStorage.getItem('MCNC_WARROOM_PIPELINE_STAGE') || '1', 10);
  });

  const [workflowState, setWorkflowState] = useState(() => {
    return localStorage.getItem('MCNC_WARROOM_STATE') || 'IDLE';
  }); 
  
  const [isBoardroomOpen, setIsBoardroomOpen] = useState(true);
  const [isDirectorsOpen, setIsDirectorsOpen] = useState(true);

  // Platform target: 'KAGGLE-T4', 'LOCAL_CLUSTERS', or 'ELITE_CASCADE'
  const [selectedLLM, setSelectedLLM] = useState(() => {
    return localStorage.getItem('MCNC_SELECTED_LLM') || 'LOCAL_CLUSTERS';
  });

  // Dynamic Selected Sub-Models
  const [selectedSubModels, setSelectedSubModels] = useState(() => {
    const defaultPlatform = localStorage.getItem('MCNC_SELECTED_LLM') || 'LOCAL_CLUSTERS';
    if (defaultPlatform === 'KAGGLE-T4') {
      return KAGGLE_MODELS_POOL.map(m => m.id);
    }
    if (defaultPlatform === 'LOCAL_CLUSTERS') {
      return LOCAL_CLUSTERS_MODELS_POOL.slice(0, 4).map(m => m.id);
    }
    return ELITE_MODELS_POOL.map(m => m.id);
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
    return localStorage.getItem('MCNC_ACTIVE_PROJECT') || 'The Chief Madothi Fund';
  });

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedAgentDropdown, setSelectedAgentDropdown] = useState('5-TURN ROUND-ROBIN CASCADE');
  const [inputBuffer, setInputBuffer] = useState('');

  // Telemetry: Staged critiques arriving from Tab 09 Previews
  const [incomingCritiques, setIncomingCritiques] = useState([]);
  const [isCritiqueTrayOpen, setIsCritiqueTrayOpen] = useState(true);
  const [activeArtifactTarget, setActiveArtifactTarget] = useState('index.html');

  const [streamLog, setStreamLog] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_WARROOM_STREAM');
      return stored ? JSON.parse(stored) : [
        { id: 1, sender: 'SYSTEM // GATE KEEPER', text: 'Terminal ready. War Room initialized.', type: 'system' }
      ];
    } catch (e) {
      return [{ id: 1, sender: 'SYSTEM // GATE KEEPER', text: 'Terminal ready. War Room initialized.', type: 'system' }];
    }
  });

  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedDirective, setCopiedDirective] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const isAnyExecuting = Boolean(isCascading || isMultiAgentExecuting || isLLMExecuting || isCodeGenerating);

  // Sync incoming critiques queue from Tab 09
  const syncCritiquesQueue = () => {
    try {
      const stored = localStorage.getItem('WAR_ROOM_CRITIQUES');
      if (stored) {
        const parsed = JSON.parse(stored);
        setIncomingCritiques(Array.isArray(parsed) ? parsed : []);
        if (parsed.length > 0 && parsed[0].target) {
          setActiveArtifactTarget(parsed[0].target);
        }
      } else {
        setIncomingCritiques([]);
      }
    } catch (e) {
      console.error('Failed to parse WAR_ROOM_CRITIQUES telemetry:', e);
    }
  };

  useEffect(() => {
    syncCritiquesQueue();
    const handleStorageChange = (e) => {
      if (e.key === 'WAR_ROOM_CRITIQUES') {
        syncCritiquesQueue();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(syncCritiquesQueue, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleInjectCritique = (critiqueItem, index) => {
    let revisionScaffold = `\n[RED-LINE DIRECTIVE // TAB 09 COCKPIT DISPATCH]\n`;
    revisionScaffold += `TARGET ARTIFACT: ${critiqueItem.target || 'index.html'}\n`;
    revisionScaffold += `PROJECT SCOPE: ${critiqueItem.project || selectedProject}\n`;
    revisionScaffold += `EXECUTIVE DIRECTIVE:\n${critiqueItem.critique || '(No text provided - check attached design references)'}\n`;

    if (critiqueItem.attachments && critiqueItem.attachments.length > 0) {
      revisionScaffold += `\nATTACHED REFERENCE ASSETS (${critiqueItem.attachments.length}):\n`;
      critiqueItem.attachments.forEach((att, idx) => {
        revisionScaffold += `  - [REF-${idx + 1}]: ${att.name} (${att.size})\n`;
      });
      revisionScaffold += `DIRECTIVE FOR ROXY & SKYLA: Enforce exact visual hierarchy and color palleting from attached assets. Remove generic boilerplate.\n`;
    }

    if (critiqueItem.target) {
      setActiveArtifactTarget(critiqueItem.target);
    }

    if (critiqueItem.project && !projects.includes(critiqueItem.project)) {
      setProjects(prev => [...prev, critiqueItem.project]);
      setSelectedProject(critiqueItem.project);
      localStorage.setItem('MCNC_ACTIVE_PROJECT', critiqueItem.project);
    } else if (critiqueItem.project) {
      setSelectedProject(critiqueItem.project);
      localStorage.setItem('MCNC_ACTIVE_PROJECT', critiqueItem.project);
    }

    setInputBuffer(prev => prev ? `${prev.trim()}\n\n${revisionScaffold}` : revisionScaffold.trim());

    setWorkflowState('IDLE');
    localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');

    setStreamLog(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'ROXY // REVISION GATE',
        text: `Red-line critique for [${critiqueItem.target || 'index.html'}] ingested from Tab 09. Prompt buffer updated with ${critiqueItem.attachments?.length || 0} reference assets. Workflow reset to IDLE awaiting new authorization loop.`,
        type: 'user'
      }
    ]);

    const updated = incomingCritiques.filter((_, i) => i !== index);
    setIncomingCritiques(updated);
    localStorage.setItem('WAR_ROOM_CRITIQUES', JSON.stringify(updated));
  };

  const handleDismissCritique = (index) => {
    const updated = incomingCritiques.filter((_, i) => i !== index);
    setIncomingCritiques(updated);
    localStorage.setItem('WAR_ROOM_CRITIQUES', JSON.stringify(updated));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('MCNC_WARROOM_STREAM', JSON.stringify(streamLog));
      localStorage.setItem('MCNC_WARROOM_STATE', workflowState);
      localStorage.setItem('MCNC_SELECTED_LLM', selectedLLM);
      localStorage.setItem('MCNC_WARROOM_PIPELINE_STAGE', pipelineStage.toString());
    } catch (e) {}
  }, [streamLog, workflowState, selectedLLM, pipelineStage]);

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
      const used = savedHours !== null ? parseFloat(savedHours) : 1.35;
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

  // Check speech recognition capability on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Self-Healing Web Speech Dictation Engine
  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return alert('Chrome Speech Recognition is only supported natively in Google Chrome.');
    }

    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }

      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setIsListening(true);
      };

      recog.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          setInputBuffer(prev => (prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()));
        }
      };

      recog.onerror = (err) => {
        console.warn('[MIC ERROR EVENT]:', err.error);
        if (err.error === 'not-allowed') {
          alert('Microphone access blocked. Click the tune/padlock icon in Chrome address bar and set Microphone to "Allow".');
        }
        setIsListening(false);
        recognitionRef.current = null;
      };

      recog.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recog;
      recog.start();
    } catch (err) {
      console.error('[MIC START FAILED]:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
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

  const handleCopyDirective = () => {
    if (!inputBuffer || !inputBuffer.trim()) return;
    navigator.clipboard.writeText(inputBuffer);
    setCopiedDirective(true);
    setTimeout(() => setCopiedDirective(false), 2000);
  };

  // Auto-Sync Staged Directive & Project from Tab 01
  useEffect(() => {
    const ingestStagedDirective = (targetProject, targetPrompt) => {
      if (targetProject) {
        const cleanProj = targetProject.trim();
        setProjects(prev => {
          if (!prev.includes(cleanProj)) {
            const updated = [...prev, cleanProj];
            try { localStorage.setItem('MCNC_PROJECT_LIST', JSON.stringify(updated)); } catch (e) {}
            return updated;
          }
          return prev;
        });
        setSelectedProject(cleanProj);
        try { localStorage.setItem('MCNC_ACTIVE_PROJECT', cleanProj); } catch (e) {}
      }

      if (targetPrompt && targetPrompt.trim()) {
        setInputBuffer(targetPrompt.trim());
      }

      setWorkflowState('IDLE');
      localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');
    };

    try {
      const seedPrompt = localStorage.getItem('mcnc_warroom_seed_prompt');
      const seedProject = localStorage.getItem('mcnc_warroom_seed_project');
      if (seedPrompt || seedProject) {
        ingestStagedDirective(seedProject, seedPrompt);
        localStorage.removeItem('mcnc_warroom_seed_prompt');
        localStorage.removeItem('mcnc_warroom_seed_project');
      }
    } catch (e) {}

    const handleTransfer = (e) => {
      if (e.detail) {
        ingestStagedDirective(e.detail.project, e.detail.payload || e.detail.prompt);
      }
    };

    const handleStorage = (e) => {
      if (e.key === 'mcnc_warroom_seed_prompt' && e.newValue) {
        const targetProj = localStorage.getItem('mcnc_warroom_seed_project') || selectedProject;
        ingestStagedDirective(targetProj, e.newValue);
        localStorage.removeItem('mcnc_warroom_seed_prompt');
        localStorage.removeItem('mcnc_warroom_seed_project');
      }
    };

    window.addEventListener('push-to-warroom', handleTransfer);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('push-to-warroom', handleTransfer);
      window.removeEventListener('storage', handleStorage);
    };
  }, [selectedProject]);

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

  // Dynamic Directive Generation with Project-Aware Token Governance
  const handleGenerateDirective = () => {
    if (!inputBuffer || !inputBuffer.trim()) {
      return;
    }

    if (inputBuffer.includes("EXECUTE: STAGE 1 ZERO-SOLUTION FORENSIC DECONSTRUCTION") || 
        inputBuffer.includes("EXECUTE: STAGE 2 FULL SINGLE-FILE PRODUCTION DELIVERABLE")) {
      return;
    }

    const isAfricaProject = selectedProject.toUpperCase().includes('MADOTHI') || 
                            selectedProject.toUpperCase().includes('AFRICA');

    const projectPaletteConstraint = isAfricaProject
      ? `   - UI/UX (Roxy & Skyla) strictly uses the Authentic Africa Palette & Timber Matrix:
     * Madothi Charcoal (#1A0F0A), Madothi Espresso (#2B1A11)
     * Malawi Sunset (#E35503), African Ochre (#C7923E)
     * Canopy Forest (#2B4422), Canopy Sage (#547A4E)
     * Linen Canvas (#F5F0EA) reading surfaces (no neon colors, no raw white)
     * 10-Tier Wood & Timber Matrix (W-01 through W-10)
     * Physical asset mapping from C:\\Warlord_Inc\\...\\Africa Assets (Tranches 1-7)
   - Humanitarian Mission Lock: Raising funds to pay school fees and feed vulnerable children directly (NOT building schools).
   - MQL/Trading (01) strictly uses DodgerBlue, OrangeRed, and Goldenrod lines only.`
      : `   - UI/UX (Roxy / 02) strictly uses High Finance tokens: Obsidian (#080a0c), Gold Core (#ffb800), Wire Border (#1f242d), Emerald (#10b981), Ruby (#ef4444).
   - MQL/Trading (01) strictly uses DodgerBlue, OrangeRed, and Goldenrod lines only.`;

    if (pipelineStage === 2) {
      // Stage 2 Production Scaffold Injection
      const synthesizedPRD = streamLog
        .filter(l => l.type === 'agent' && !l.text.startsWith('Executing ['))
        .map(l => `### ${l.sender}\n${l.text}`)
        .join('\n\n---\n\n') || 'Stage 1 deconstruction specifications validated in active session.';

      let assetDirectives = 'Apply exact visual hierarchy, African Ochre and Malawi Sunset borders, and wood timber textures matching all attached reference images.';
      if (incomingCritiques.length > 0 && incomingCritiques[0].attachments) {
        assetDirectives += `\nReferenced Assets (${incomingCritiques[0].attachments.length}): ` + 
          incomingCritiques[0].attachments.map(a => a.name).join(', ');
      }

      const stage2Scaffold = STAGE2_CODE_PROMPT_TEMPLATE
        .replace("__PROJECT_NAME__", selectedProject)
        .replace("__TARGET_ARTIFACT__", activeArtifactTarget)
        .replace("__PALETTE_RULES__", projectPaletteConstraint)
        .replace("__STAGE1_CONTEXT__", synthesizedPRD)
        .replace("__ASSET_DIRECTIVES__", assetDirectives);

      setInputBuffer(stage2Scaffold + inputBuffer.trim());

      setStreamLog(prev => [
        ...prev,
        { 
          id: Date.now(), 
          sender: 'CHARLIE // CODING LEAD', 
          text: `Stage 2 Full Code Production scaffold injected for [${selectedProject}] -> [${activeArtifactTarget}]. Ready for single-file artifact generation.`, 
          type: 'system' 
        }
      ]);

    } else {
      // Stage 1 Deconstruction Scaffold Injection
      const dynamicScaffold = STAGE1_TEMPLATE_HEADER
        .replace("__PROJECT_NAME__", selectedProject)
        .replace("__PALETTE_RULES__", projectPaletteConstraint);

      const wrapped = dynamicScaffold + inputBuffer.trim();
      setInputBuffer(wrapped);

      setStreamLog(prev => [
        ...prev,
        { 
          id: Date.now(), 
          sender: 'CHARLIE // CODING LEAD', 
          text: `Stage 1 Forensic Deconstruction scaffold injected into prompt buffer for [${selectedProject}] with ${isAfricaProject ? 'Africa Master' : 'High Finance'} token governance.`, 
          type: 'system' 
        }
      ]);
    }
  };

  // Explicit State Reset Hook - Resets to IDLE without losing input buffer
  const handleResetWorkflowState = () => {
    setWorkflowState('IDLE');
    localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');
    setStreamLog(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'MONTY // CHIEF OF STAFF',
        text: 'Workflow state restored to IDLE. Direct manual authorization required for new dispatches.',
        type: 'system'
      }
    ]);
  };

  const handleCls = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsCascading(false); 
    setIsMultiAgentExecuting(false); 
    setIsLLMExecuting(false);
    setIsCodeGenerating(false);
    setCascadeIndex(0); 
    setWorkflowState('IDLE'); 
    setInputBuffer(''); 
    setAssignedDirectors([]);
    setPipelineStage(1);
    
    const freshReset = [
      { 
        id: Date.now(), 
        sender: 'SYSTEM // GATE KEEPER', 
        text: 'Terminal ready. War Room initialized.', 
        type: 'system' 
      }
    ];

    try {
      localStorage.setItem('MCNC_WARROOM_STREAM', JSON.stringify(freshReset));
      localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');
      localStorage.setItem('MCNC_WARROOM_PIPELINE_STAGE', '1');
      localStorage.removeItem('MCNC_ACTIVE_PROJECT_MANIFESTS');
      sessionStorage.removeItem('MCNC_WARROOM_STREAM');
    } catch (e) {}

    setStreamLog(freshReset);
  };

  const handleAllStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCascading(false); 
    setIsMultiAgentExecuting(false); 
    setIsLLMExecuting(false);
    setIsCodeGenerating(false);
    setCascadeIndex(0); 
    setWorkflowState('IDLE');

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
        text: `[!] BATCH JOB TERMINATED. ACTIVE RUN ABORTED AT [${formatElapsed(elapsedSeconds)}]. SYSTEM RESTORED TO IDLE.`, 
        type: 'error' 
      }
    ]);
  };

  const handleSwitchPlatform = (targetPlatform) => {
    setSelectedLLM(targetPlatform);
    if (targetPlatform === 'KAGGLE-T4') {
      setSelectedSubModels(KAGGLE_MODELS_POOL.map(m => m.id));
    } else if (targetPlatform === 'LOCAL_CLUSTERS') {
      setSelectedSubModels(LOCAL_CLUSTERS_MODELS_POOL.slice(0, 4).map(m => m.id));
    } else {
      setSelectedSubModels(ELITE_MODELS_POOL.map(m => m.id));
    }
  };

  const toggleSubModel = (modelId) => {
    if (selectedSubModels.includes(modelId)) {
      if (selectedSubModels.length === 1) return; 
      setSelectedSubModels(selectedSubModels.filter(id => id !== modelId));
    } else {
      setSelectedSubModels([...selectedSubModels, modelId]);
    }
  };

  const selectAllSubModels = () => {
    let currentPool = LOCAL_CLUSTERS_MODELS_POOL;
    if (selectedLLM === 'KAGGLE-T4') currentPool = KAGGLE_MODELS_POOL;
    if (selectedLLM === 'ELITE_CASCADE') currentPool = ELITE_MODELS_POOL;
    setSelectedSubModels(currentPool.map(m => m.id));
  };

  const selectSoloSubModel = (modelId) => {
    setSelectedSubModels([modelId]);
  };

  const dispatchAndWait = async (payload) => {
    const res = await fetch('http://127.0.0.1:8081/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortControllerRef.current?.signal,
      body: JSON.stringify(payload)
    });
    const initialData = await res.json();
    
    if (initialData.status === 'PROCESSING') {
       return new Promise((resolve, reject) => {
          const handler = (event) => {
              try {
                  const wsData = JSON.parse(event.data);
                  if (wsData.type === 'CHAT_COMPLETE') {
                      if (ws) ws.removeEventListener('message', handler);
                      resolve({ reply: wsData.msg.reply, modelUsed: wsData.msg.activeModelUsed });
                  } else if (wsData.type === 'ERROR') {
                      if (ws) ws.removeEventListener('message', handler);
                      reject(new Error(wsData.msg.reply || 'Daemon error'));
                  }
              } catch (e) {}
          };
          
          if (ws && ws.readyState === WebSocket.OPEN) {
              ws.addEventListener('message', handler);
          } else {
              reject(new Error("WebSocket not connected. Cannot await background dispatch."));
          }

          if (abortControllerRef.current) {
              abortControllerRef.current.signal.addEventListener('abort', () => {
                  if (ws) ws.removeEventListener('message', handler);
                  reject(new DOMException('Aborted', 'AbortError'));
              });
          }
       });
    } else {
       if (initialData.error) throw new Error(initialData.error);
       return { reply: initialData.reply, modelUsed: initialData.modelUsed };
    }
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
          sender: `${step.id || step.tag} // DISPATCH`,
          text: `Executing [${step.role}] via ${step.name || step.label} for project [${selectedProject}]...`,
          type: 'system'
        }
      ]);

      const stagePrompt = `${conversationChain}
==================================================
CURRENT DIRECTIVE - ${step.id || step.tag} (${step.role}):
You are acting as the executive lead for ${step.role}. 
Do NOT reply with single confirmations, greetings, or placeholders.
Deliver a comprehensive, detailed operational brief covering your role.
Provide clear technical requirements, execution specifications, and architectural parameters.
NEGATIVE CONSTRAINTS:
- Do not cite temperature formulas (T=0.20), top_p, or internal framework scripts.
- Do not explain what Monty is or repeat system rules.
- Do not use brackets around text like [Client] or [Insert].

${isJudgeTurn ? `
MANDATORY FINAL DELIVERABLE:
At the very end of your review, you MUST output a formal '### DISPATCH MANIFEST' allocating execution tasks to directors from the 16-Director Matrix and binding tools from the Warlord Registry (e.g., local_disk_writer, ui_inspector, asset_vault_reader, ast_patcher).

Format strictly as:
### DISPATCH MANIFEST
- Task: "[Action Title]" | Director: [Agent Name] | Tool: [tool_id] | Status: APPROVED
` : ''}`;

      try {
        const payload = {
          prompt: stagePrompt,
          model: step.model || step.id,
          project: selectedProject,
          role: step.role,
          turn: i + 1,
          enforceFullPRD: true,
          useKaggle: selectedLLM === 'KAGGLE-T4'
        };

        const data = await dispatchAndWait(payload);
        const replyText = data.reply || 'No response returned from inference node.';

        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: `${step.tag || step.id} // ${step.name || step.label}`,
            text: replyText,
            type: 'agent'
          }
        ]);

        conversationChain += `\n### [${step.tag || step.id}: ${step.role}]\n${replyText}\n\n`;

      } catch (err) {
        if (err.name === 'AbortError') return;
        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: `${step.tag || step.id} // FAULT`,
            text: `Inference error on node ${step.name || step.label}: ${err.message}`,
            type: 'error'
          }
        ]);
        setIsCascading(false);
        setWorkflowState('IDLE');
        return;
      }
    }

    setIsCascading(false);
    
    // PROGRESSION: ADVANCE TO STAGE 2
    setPipelineStage(2);
    localStorage.setItem('MCNC_WARROOM_PIPELINE_STAGE', '2');

    setStreamLog(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'MONTY // CHIEF OF STAFF',
        text: `Stage 1 Deconstruction Complete. PRD & Manifest synthesized. System advanced to [STAGE 2 // PHYSICAL ARTIFACT PRODUCTION]. Review specifications and click AUTHORIZE when ready.`,
        type: 'system'
      }
    ]);

    setWorkflowState('MONTY_APPROVED');
    abortControllerRef.current = null;
  };

  // Dedicated Stage 2 Code Generation Execution Loop with Strict Verification
  const runStage2CodeDelivery = async () => {
    setIsCodeGenerating(true);
    setWorkflowState('EXECUTING');
    abortControllerRef.current = new AbortController();

    const timestamp = new Date().toLocaleTimeString();
    setStreamLog(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'CHARLIE // CODE ARCHITECT',
        text: `[${timestamp}] INITIATING FULL CODE GENERATION FOR [${selectedProject}] -> [${activeArtifactTarget}]...`,
        type: 'system'
      }
    ]);

    const isAfrica = selectedProject.toUpperCase().includes('MADOTHI') || selectedProject.toUpperCase().includes('AFRICA');
    const projectPaletteConstraint = isAfrica
      ? `Madothi Charcoal (#1A0F0A), Madothi Espresso (#2B1A11), Malawi Sunset (#E35503), African Ochre (#C7923E), Canopy Forest (#2B4422), Canopy Sage (#547A4E), Linen Canvas (#F5F0EA). Enforce 10-tier timber textures and African pattern borders.`
      : `Obsidian (#080a0c), Gold Core (#ffb800), Wire Border (#1f242d), Emerald (#10b981), Ruby (#ef4444).`;

    const prdSummary = streamLog
      .filter(l => l.type === 'agent' && !l.text.startsWith('Executing ['))
      .map(l => l.text)
      .join('\n\n')
      .slice(0, 4000);

    let activeDirective = inputBuffer.trim();
    if (!activeDirective) {
      activeDirective = `Generate 100% complete, fully responsive single-file index.html for The Chief Madothi Fund. Directly feed children & pay school fees directly (strictly NO building schools). Include hero section, donation tier cards, impact metrics, and footer.`;
    }

    const stage2SystemConstraint = `CRITICAL DIRECTIVE: You are an autonomous single-file code synthesizer.
OUTPUT SPECIFICATION: Output ONLY the complete, ready-to-paste single-file HTML document.
MANDATORY CONSTRAINTS:
- Do NOT output conversational text, greetings, apologies, analysis, or explanations before or after.
- Do NOT use markdown code blocks or fences.
- Your entire output MUST start with <!DOCTYPE html> on the first character and end with </html> on the last character.
- Embed all styles inline within <style> tags and all JavaScript interactions within <script> tags.
- Zero ellipses (...), zero placeholders, zero code snippets.`;

    const stage2Prompt = `${stage2SystemConstraint}

PROJECT: ${selectedProject}
TARGET ARTIFACT: ${activeArtifactTarget}
PALETTE CONSTRAINTS: ${projectPaletteConstraint}

APPROVED PRD CONTEXT:
${prdSummary}

EXECUTIVE DIRECTIVE & CRITIQUE:
${activeDirective}`;

    setInputBuffer('');

    try {
      // Pinned active endpoint for OpenRouter and NIM
      const codeModel = selectedLLM === 'ELITE_CASCADE' 
        ? 'anthropic/claude-3.5-sonnet-20241022' 
        : 'meta-llama/llama-3.3-70b-instruct';

      const payload = {
        prompt: stage2Prompt,
        model: codeModel,
        project: selectedProject,
        role: 'Full Code Generation Lead',
        useOpenRouter: selectedLLM === 'ELITE_CASCADE',
        useKaggle: selectedLLM === 'KAGGLE-T4'
      };

      const data = await dispatchAndWait(payload);
      let generatedCode = data.reply || '';

      // Strip accidental markdown fences if returned
      if (generatedCode.includes('```html')) {
        generatedCode = generatedCode.split('```html')[1].split('```')[0].trim();
      } else if (generatedCode.includes('```')) {
        generatedCode = generatedCode.split('```')[1].split('```')[0].trim();
      }

      // STRICT WARLORD VALIDATION GATE: REJECT CONVERSATIONAL COPOUTS OR SHORT SKELETONS
      if (!generatedCode || generatedCode.includes('"error"') || generatedCode.includes('404') || !generatedCode.includes('<!DOCTYPE html') || generatedCode.length < 1500) {
        throw new Error(`Inference engine failed or returned invalid HTML artifact (${generatedCode.length} bytes). Output trace: ${generatedCode.slice(0, 260)}`);
      }

      setStreamLog(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'CHARLIE & SKYLA // ARTIFACT COMPLETE',
          text: generatedCode,
          type: 'agent'
        },
        {
          id: Date.now() + 2,
          sender: 'MONTY // GATEKEEPER',
          text: `[✓] Single-file artifact for [${activeArtifactTarget}] verified and generated. Review the code above. Click AUTHORIZE to approve, then DISPATCH to provision to disk.`,
          type: 'system'
        }
      ]);

      setWorkflowState('MONTY_APPROVED');
      localStorage.setItem('MCNC_WARROOM_STATE', 'MONTY_APPROVED');

    } catch (err) {
      if (err.name !== 'AbortError') {
        setStreamLog(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'CHARLIE // EXECUTION FAULT',
            text: `Artifact generation halted: ${err.message}`,
            type: 'error'
          }
        ]);
        setWorkflowState('IDLE');
        localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');
      }
    } finally {
      setIsCodeGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const runDynamicMatrixLoop = async (targets) => {
    setIsMultiAgentExecuting(true);
    setWorkflowState('ANALYZING');
    abortControllerRef.current = new AbortController();
    let currentPayload = inputBuffer.trim() || `Operational Tasking: Deliver full domain execution specifications for project [${selectedProject}].`;
    setInputBuffer('');
    
    const isKaggle = selectedLLM === 'KAGGLE-T4';
    const tagDisplay = isKaggle ? '[VIA KAGGLE COMPUTE]' : selectedLLM === 'LOCAL_CLUSTERS' ? '[VIA LOCAL CLUSTERS]' : '[VIA OPENROUTER]';
    setStreamLog(prev => [...prev, { id: Date.now(), sender: 'MONTY // COMMAND', text: `Initiating sequential execution across ${targets.length} assigned directors ${tagDisplay}.`, type: 'user' }]);

    for (let i = 0; i < targets.length; i++) {
      const targetAgent = targets[i];
      const baseName = targetAgent.split(' // ')[0];
      const role = targetAgent.split(' // ')[1];
      
      try {
        const payload = { 
          prompt: currentPayload, 
          director: targetAgent, 
          project: selectedProject,
          model: isKaggle ? 'qwen2.5:7b' : undefined,
          useKaggle: isKaggle
        };
        const data = await dispatchAndWait(payload);
        
        setStreamLog(prev => [...prev, {
          id: Date.now(),
          sender: `${baseName} // ${role}`,
          text: data.reply,
          type: 'agent'
        }]);

        currentPayload = currentPayload + `\n\n--- TURN OVERPASS FROM ${baseName} ---\n${data.reply}`;
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: `Matrix failure on node ${baseName}: ${err.message}`, type: 'error' }]);
        setIsMultiAgentExecuting(false);
        setWorkflowState('IDLE');
        return;
      }
    }
    
    setWorkflowState('MONTY_APPROVED');
    setIsMultiAgentExecuting(false);
    abortControllerRef.current = null;
  };

  const handleAction = async (actionType) => {
    if (actionType === 'INITIATE LLM ANALYSIS') {
      if (pipelineStage === 2) {
        runStage2CodeDelivery();
        return;
      }

      setAnalysisMode('BOARDROOM'); 
      setWorkflowState('ANALYZING'); 
      setIsBoardroomOpen(true); 
      setIsDirectorsOpen(false);

      let activePool = LOCAL_CLUSTERS_MODELS_POOL;
      if (selectedLLM === 'KAGGLE-T4') activePool = KAGGLE_MODELS_POOL;
      if (selectedLLM === 'ELITE_CASCADE') activePool = ELITE_MODELS_POOL;

      const filteredExecutionChain = activePool.filter(m => selectedSubModels.includes(m.id));

      if (filteredExecutionChain.length === 0) {
        setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // WARNING', text: 'No models selected. Please check at least one model in the deck.', type: 'error' }]);
        setWorkflowState('IDLE');
        return;
      }

      if (filteredExecutionChain.length > 1) {
        const title = selectedLLM === 'KAGGLE-T4' 
          ? `${filteredExecutionChain.length}-Turn Kaggle Dual-T4 Cascade` 
          : selectedLLM === 'LOCAL_CLUSTERS'
            ? `${filteredExecutionChain.length}-Turn Local / NIM Cascade`
            : `${filteredExecutionChain.length}-Turn Elite Frontier Cascade`;
        runLiveCascadeLoop(filteredExecutionChain, title);
      } else {
        const singleModel = filteredExecutionChain[0];
        setIsLLMExecuting(true);
        abortControllerRef.current = new AbortController();
        const activePrompt = inputBuffer.trim() || `Deliver full technical and architectural specification for [${selectedProject}].`;
        setInputBuffer('');

        try {
          const payload = { 
            prompt: activePrompt, 
            model: singleModel.id, 
            project: selectedProject,
            useKaggle: selectedLLM === 'KAGGLE-T4'
          };
          const data = await dispatchAndWait(payload);
          
          setStreamLog(prev => [...prev, { id: Date.now(), sender: `BOARDROOM // [${singleModel.name}]`, text: data.reply, type: 'agent' }]);
          setWorkflowState('MONTY_APPROVED');
        } catch (err) {
          if (err.name !== 'AbortError') setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM // ERROR', text: err.message, type: 'error' }]);
          setWorkflowState('IDLE');
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
            runLiveCascadeLoop(KAGGLE_MODELS_POOL, '4-Turn Kaggle Dual-T4 Cascade');
          } else if (selectedLLM === 'LOCAL_CLUSTERS') {
            runLiveCascadeLoop(LOCAL_CLUSTERS_MODELS_POOL.slice(0, 4), '4-Turn Local / Free Cluster Cascade');
          } else {
            runLiveCascadeLoop(FREE_CASCADE_STEPS, '5-Turn Collective Round-Robin');
          }
        } else if (selectedAgentDropdown === 'ALL DIRECTORS // AUTO-ROUTING') {
          setIsLLMExecuting(true);
          abortControllerRef.current = new AbortController();
          const activePrompt = inputBuffer.trim();
          setInputBuffer('');
          try {
            const payload = { 
              prompt: activePrompt, 
              director: 'ALL DIRECTORS', 
              project: selectedProject, 
              useKaggle: selectedLLM === 'KAGGLE-T4' 
            };
            const data = await dispatchAndWait(payload);
            
            setStreamLog(prev => [...prev, { id: Date.now(), sender: `MONTY // ROUTER`, text: data.reply, type: 'agent' }]);
            setWorkflowState('MONTY_APPROVED');
          } catch (err) {
            if (err.name !== 'AbortError') setStreamLog(prev => [...prev, { id: Date.now(), sender: 'SYSTEM', text: err.message, type: 'error' }]);
            setWorkflowState('IDLE');
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
      setWorkflowState('IDLE');
      localStorage.setItem('MCNC_WARROOM_STATE', 'IDLE');
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
      localStorage.setItem('MCNC_WARROOM_STATE', 'AUTHORIZED');
      setStreamLog(prev => [...prev, { id: Date.now(), sender: 'WARLORD // GATE', text: `Action authorized for project [${selectedProject}]. Full PRD committed to Base 1 storage vault. Dispatch enabled.`, type: 'system' }]);
    } 
    
    else if (actionType === 'MONTY DISPATCH') {
      if (workflowState !== 'AUTHORIZED') return;

      const fullLogText = streamLog.map(l => l.text).join('\n\n');
      const manifestMatch = fullLogText.match(/### DISPATCH MANIFEST([\s\S]*?)(?:$|===)/);
      
      const parsedTasks = [];
      if (manifestMatch) {
        const rawLines = manifestMatch[1].split('\n').filter(l => l.trim().startsWith('- Task:'));
        rawLines.forEach((line, idx) => {
          const taskName = line.match(/Task:\s*"?([^"|]+)"?/i)?.[1]?.trim() || `Execution Unit ${idx + 1}`;
          const director = line.match(/Director:\s*([^|]+)/i)?.[1]?.trim() || 'CHARLIE // CODE';
          const toolId = line.match(/Tool:\s*([^|]+)/i)?.[1]?.trim() || 'local_disk_writer';

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
      localStorage.setItem('MCNC_WARROOM_STATE', 'DISPATCHED');
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
  
  let currentSubPool = LOCAL_CLUSTERS_MODELS_POOL;
  if (selectedLLM === 'KAGGLE-T4') currentSubPool = KAGGLE_MODELS_POOL;
  if (selectedLLM === 'ELITE_CASCADE') currentSubPool = ELITE_MODELS_POOL;
  
  const isCascadeMode = selectedSubModels.length > 1;

  return (
    <div className="flex h-full w-full bg-[#080a0c] text-xs gap-2 select-none">
      
      {/* LEFT CONTROL SIDEBAR */}
      <div className="w-84 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded p-2.5 overflow-hidden flex-shrink-0">
        
        {/* PROJECT CONTAINER SELECTOR */}
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

        {/* PIPELINE STAGE LOCK MONITOR */}
        <div className="border border-[#1f242d] rounded bg-[#101317]/70 p-2 mb-2 flex items-center justify-between font-mono">
          <div className="flex items-center gap-1.5">
            <Lock className={`w-3.5 h-3.5 ${pipelineStage === 2 ? 'text-[#10b981]' : 'text-[#ffb800]'}`} />
            <span className="text-[10px] text-[#9ca3af] font-bold">PIPELINE STAGE:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setPipelineStage(1);
                localStorage.setItem('MCNC_WARROOM_PIPELINE_STAGE', '1');
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                pipelineStage === 1 
                  ? 'bg-[#ffb800]/20 text-[#ffb800] border-[#ffb800]' 
                  : 'bg-[#14171c] text-[#6b7280] border-[#232832]'
              }`}
            >
              STAGE 1: PRD
            </button>
            <ArrowRight className="w-2.5 h-2.5 text-[#5c6b7f]" />
            <button
              onClick={() => {
                setPipelineStage(2);
                localStorage.setItem('MCNC_WARROOM_PIPELINE_STAGE', '2');
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                pipelineStage === 2 
                  ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                  : 'bg-[#14171c] text-[#6b7280] border-[#232832]'
              }`}
            >
              STAGE 2: HTML
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          
          {/* BOARDROOM CASCADE */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => { setIsBoardroomOpen(!isBoardroomOpen); setAnalysisMode('BOARDROOM'); }} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ffb800]" />
                <span>COMPUTE PLATFORM</span>
              </span>
              {isBoardroomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isBoardroomOpen && (
              <div className="p-2 space-y-2 bg-[#0a0c0e]">
                
                {/* 1. THREE-WAY TOP PLATFORM SELECTION BUTTONS */}
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleSwitchPlatform('KAGGLE-T4')}
                    className={`px-1.5 py-2 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLLM === 'KAGGLE-T4'
                        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : 'bg-[#14171c] text-[#8fa0b5] border-[#1f242d] hover:text-white'
                    }`}
                  >
                    <span className="truncate">KAGGLE T4</span>
                    <span className="text-[7.5px] opacity-75 font-normal">
                      {isKaggleOnline ? 'ONLINE' : 'STANDBY'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSwitchPlatform('LOCAL_CLUSTERS')}
                    className={`px-1.5 py-2 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLLM === 'LOCAL_CLUSTERS'
                        ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                        : 'bg-[#14171c] text-[#8fa0b5] border-[#1f242d] hover:text-white'
                    }`}
                  >
                    <span className="truncate">LOCAL / NIM</span>
                    <span className="text-[7.5px] opacity-75 font-normal">FREE CLUSTERS</span>
                  </button>

                  <button
                    onClick={() => handleSwitchPlatform('ELITE_CASCADE')}
                    className={`px-1.5 py-2 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedLLM === 'ELITE_CASCADE'
                        ? 'bg-[#ffb800]/20 text-[#ffb800] border-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.3)]'
                        : 'bg-[#14171c] text-[#8fa0b5] border-[#1f242d] hover:text-white'
                    }`}
                  >
                    <span className="truncate">4-TURN ELITE</span>
                    <span className="text-[7.5px] opacity-75 font-normal">OPENROUTER</span>
                  </button>
                </div>

                {/* 2. DYNAMIC SUB-MODELS DECK */}
                <div className="pt-2 border-t border-[#1f242d] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#5c6b7f] font-bold px-1">
                    <span className="text-[#38bdf8] uppercase">
                      {selectedLLM === 'KAGGLE-T4' ? 'KAGGLE OPEN-WEIGHTS' : selectedLLM === 'LOCAL_CLUSTERS' ? 'LOCAL & HARVESTED CLUSTERS' : 'FRONTIER LLMS'}
                    </span>
                    <button
                      onClick={selectAllSubModels}
                      className="text-[9px] text-[#ffb800] hover:underline cursor-pointer"
                    >
                      SELECT ALL
                    </button>
                  </div>

                  {currentSubPool.map((model) => {
                    const isChecked = selectedSubModels.includes(model.id);

                    return (
                      <div
                        key={model.id}
                        onClick={() => toggleSubModel(model.id)}
                        className={`p-2 rounded border transition-all cursor-pointer flex items-start gap-2 ${
                          isChecked
                            ? 'bg-[#14171c] border-[#38bdf8]/50 shadow-[0_0_6px_rgba(56,189,248,0.1)]'
                            : 'bg-[#0d0f12] border-[#191e26] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-[#5c6b7f]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#e2e8f0] text-[11px] truncate">{model.name}</span>
                            <span className="text-[8px] bg-[#1a202c] text-[#8fa0b5] px-1 py-0.2 rounded border border-[#2d3748]">
                              {model.tag}
                            </span>
                          </div>
                          <p className="text-[9px] text-[#8fa0b5] leading-tight truncate">{model.role}</p>

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectSoloSubModel(model.id);
                              }}
                              className="text-[8px] text-[#ffb800] hover:underline uppercase font-bold"
                            >
                              RUN SOLO
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CASCADE STATUS INDICATOR */}
                <div className="pt-1.5 border-t border-[#1f242d] flex items-center justify-between text-[10px] px-1">
                  <span className="text-[#5c6b7f]">EXECUTION MODE:</span>
                  <span className={`font-bold font-mono ${pipelineStage === 2 ? 'text-[#10b981]' : isCascadeMode ? 'text-[#ffb800]' : 'text-[#38bdf8]'}`}>
                    {pipelineStage === 2 ? 'STAGE 2 FULL CODE BUILD' : isCascadeMode ? `${selectedSubModels.length}-TURN CASCADE` : 'SOLO MODEL DIRECT'}
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* DIRECTOR BOARD (16 MATRIX) */}
          <div className="border border-[#1f242d] rounded bg-[#101317]/50 overflow-hidden">
            <button onClick={() => { setIsDirectorsOpen(!isDirectorsOpen); setAnalysisMode('DIRECTORS'); }} className="w-full flex items-center justify-between px-3 py-2 bg-[#14171c] hover:bg-[#1a1f26] text-[#ffb800] font-bold text-xs transition-colors cursor-pointer border-b border-[#1f242d]">
              <span>DIRECTOR BOARD</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] border border-[#38bdf8] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono font-bold">
                  {selectedLLM === 'KAGGLE-T4' ? 'KAGGLE' : selectedLLM === 'LOCAL_CLUSTERS' ? 'LOCAL/NIM' : 'OPENROUTER'}
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
                    {isCascading ? `TURN ${cascadeIndex + 1}/5` : (selectedLLM === 'KAGGLE-T4' ? 'KAGGLE' : selectedLLM === 'LOCAL_CLUSTERS' ? 'NIM/LOCAL' : 'BASE 1')}
                  </span>
                </button>

                {DIRECTOR_BOARD_CONFIG.map(agentObj => {
                  const agentName = agentObj.name;
                  const isSelectedTarget = selectedAgentDropdown === agentName;
                  const isAssigned = assignedDirectors.includes(agentName);
                  const isSpinning = isMultiAgentExecuting && isAssigned;
                  
                  let badgeLabel = selectedLLM === 'KAGGLE-T4' ? 'KAGGLE' : selectedLLM === 'LOCAL_CLUSTERS' ? agentObj.modelBadge : 'STANDBY';
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

      {/* RIGHT MAIN TERMINAL AREA */}
      <div className="flex-1 flex flex-col bg-[#0d0f12] border border-[#1f242d] rounded overflow-hidden relative">
        <div className="px-4 py-2 bg-[#0a0c0e] border-b border-[#14181f] flex justify-between items-center select-none font-mono z-10 relative">
          <div className="text-[11px] text-[#5c6b7f] flex items-center gap-2 uppercase tracking-widest font-bold">
            THE WAR ROOM // LIVE COMMS &amp; ARTIFACT PIPELINE <span className="text-[#ffb800]">[{selectedProject}]</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
              pipelineStage === 2 
                ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/40'
                : 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/40'
            }`}>
              [STAGE: {pipelineStage === 2 ? 'STAGE 2 // ARTIFACT CODE DELIVERY' : 'STAGE 1 // DECONSTRUCTION'}]
            </span>
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

        {/* INCOMING RED-LINE CRITIQUE TRAY (DISPATCHED FROM TAB 09 PREVIEWS) */}
        {incomingCritiques.length > 0 && (
          <div className="bg-[#140b09] border-b border-[#ef4444]/60 p-2 font-mono z-10 transition-all">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#ef4444]/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                <span className="text-[#ef4444] font-bold text-[11px] tracking-wider uppercase">
                  TAB 09 DISPATCH QUEUE: {incomingCritiques.length} STAGED CRITIQUE(S)
                </span>
                <span className="text-[10px] text-[#ffb800] bg-[#221510] px-1.5 py-0.5 rounded border border-[#C7923E]/30">
                  Target: {incomingCritiques[0].target || 'index.html'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCritiqueTrayOpen(!isCritiqueTrayOpen)}
                  className="text-[10px] text-[#9ca3af] hover:text-white px-2 py-0.5 rounded border border-[#232832] cursor-pointer"
                >
                  {isCritiqueTrayOpen ? 'COLLAPSE' : 'EXPAND'}
                </button>
              </div>
            </div>

            {isCritiqueTrayOpen && (
              <div className="mt-2 space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {incomingCritiques.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#1e100c] border border-[#ef4444]/30 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ef4444] font-bold text-[10px]">#{idx + 1}</span>
                        <span className="text-[#DAA520] font-bold text-[11px]">{item.target}</span>
                        <span className="text-[#9ca3af] text-[10px]">[{item.project}]</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInjectCritique(item, idx)}
                          className="px-2.5 py-1 bg-[#7f1d1d] hover:bg-[#991b1b] text-white border border-[#ef4444] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#ffb800]" />
                          <span>LOAD INTO DIRECTIVE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissCritique(idx)}
                          className="p-1 text-[#9ca3af] hover:text-[#ef4444] cursor-pointer"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#e5e7eb] whitespace-pre-wrap line-clamp-2 pl-1 border-l-2 border-[#ef4444]/50">
                      {item.critique || '(No spoken critique — reference images attached)'}
                    </div>

                    {/* ATTACHED DESIGN EXAMPLES THUMBNAILS TRAY */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto custom-scrollbar">
                        <span className="text-[9px] text-[#DAA520] font-bold uppercase tracking-wider flex-shrink-0">
                          📎 EXAMPLES ({item.attachments.length}):
                        </span>
                        {item.attachments.map((file, fileIdx) => (
                          <div
                            key={fileIdx}
                            className="flex items-center gap-1.5 bg-[#0a0706] border border-[#C7923E]/40 px-2 py-1 rounded flex-shrink-0"
                          >
                            {file.type && file.type.startsWith('image/') ? (
                              <img
                                src={file.dataUrl}
                                alt={file.name}
                                className="w-6 h-6 object-cover rounded"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-[#C7923E]" />
                            )}
                            <span className="text-[9px] text-[#F5F0EA] font-mono max-w-[120px] truncate">
                              {file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TERMINAL LOG FEED: SELECT-TEXT PERMITTED */}
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

        {/* FULL VIEWPORT ORBITAL HUD OVERLAY */}
        {isAnyExecuting && (
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
            <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '22px' }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="75 160"
                  style={{ transformOrigin: '50% 50%', animation: 'spin-cw 2.4s linear infinite' }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="50 120"
                  style={{ transformOrigin: '50% 50%', animation: 'spin-ccw 1.8s linear infinite' }}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  fill="none"
                  stroke="#ffb800"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="38 90"
                  style={{ transformOrigin: '50% 50%', animation: 'spin-cw 1.2s ease-in-out infinite' }}
                />
              </svg>

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
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            </div>

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
              {isCodeGenerating ? 'GENERATING PHYSICAL HTML ARTIFACT ON DISK...' : isCascading ? `EXECUTING TURN ${cascadeIndex + 1} OF 5 CASCADE...` : 'EXECUTING WAR ROOM INFERENCE RUN...'}
            </div>

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
                {pipelineStage === 2 ? 'CHARLIE & SKYLA CODE BRIDGE' : selectedLLM === 'KAGGLE-T4' ? 'KAGGLE DUAL-T4' : selectedLLM === 'LOCAL_CLUSTERS' ? 'LOCAL / FREE CLUSTERS' : 'OPENROUTER ELITE'}
              </span>
              <span style={{ color: '#334155' }}>|</span>
              <span style={{ color: '#10b981' }}>PROCESS IS LOCKED &amp; RUNNING</span>
            </div>

            <button
              type="button"
              onClick={handleAllStop}
              style={{
                marginTop: '18px',
                padding: '7px 18px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                fontFamily: 'monospace',
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              TERMINATE BATCH JOB
            </button>
          </div>
        )}

        {/* INPUT DOCK */}
        <div className="p-3 bg-[#0a0c0e] border-t border-[#1f242d] space-y-2 select-none relative z-10">
          
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
              placeholder={isAnyExecuting ? `Sequence executing... [Elapsed: ${formatElapsed(elapsedSeconds)}]` : isListening ? "Streaming voice via Chrome... speak naturally..." : pipelineStage === 2 ? `[STAGE 2 ACTIVE] Enter code revision directive for [${activeArtifactTarget}] or click RUN ARTIFACT BUILD...` : `Enter Stage 1 directive for [${selectedProject}]...`}
              rows={3}
              className={`w-full bg-[#0d0f12] text-[#e2e8f0] border rounded p-2.5 text-xs font-mono focus:outline-none resize-none select-text transition-colors ${isAnyExecuting ? 'opacity-60 border-[#ffb800]/40 bg-[#080a0c] cursor-not-allowed' : isListening ? 'border-[#ffb800] ring-1 ring-[#ffb800]' : pipelineStage === 2 ? 'border-[#10b981]/50 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]' : 'border-[#1f242d] focus:border-[#ffb800] focus:ring-1 focus:ring-[#ffb800]'}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              
              {/* PRIMARY EXECUTION TRIGGER (STAGE 1 VS STAGE 2 DYNAMIC ACTION) */}
              {pipelineStage === 2 ? (
                <button 
                  onClick={runStage2CodeDelivery} 
                  disabled={isAnyExecuting} 
                  className={`px-4 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isCodeGenerating
                      ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-[#10b981]/20 hover:bg-[#10b981] text-[#10b981] hover:text-black border-[#10b981]/50 hover:border-[#10b981] hover:shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isCodeGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <Code className="w-3.5 h-3.5" />}
                  <span>{isCodeGenerating ? `BUILDING HTML [${formatElapsed(elapsedSeconds)}]` : 'RUN ARTIFACT BUILD (STAGE 2)'}</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleAction('INITIATE LLM ANALYSIS')} 
                  disabled={isAnyExecuting} 
                  className={`px-3.5 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isAnyExecuting 
                      ? 'bg-[#14171c]/40 text-[#5c6b7f] border-[#232832] cursor-not-allowed' 
                      : isLLMExecuting || isCascading
                        ? 'bg-[#ffb800] text-black border-[#ffb800] shadow-[0_0_12px_rgba(255,184,0,0.5)]'
                        : 'bg-[#14171c]/40 hover:bg-[#ffb800] text-[#8fa0b5] hover:text-black border-[#232832] hover:border-[#ffb800] hover:shadow-[0_0_12px_rgba(255,184,0,0.45)]'
                  }`}
                >
                  {isLLMExecuting || isCascading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : null}
                  <span>{isLLMExecuting || isCascading ? `ACTIVE [${formatElapsed(elapsedSeconds)}]` : 'INITIATE LLM'}</span>
                </button>
              )}
              
              {/* INITIATE DIR */}
              <button 
                onClick={() => handleAction('INITIATE DIRECTOR ANALYSIS')} 
                disabled={isAnyExecuting} 
                className={`px-3.5 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isAnyExecuting 
                    ? 'bg-[#14171c]/40 text-[#5c6b7f] border-[#232832] cursor-not-allowed' 
                    : isMultiAgentExecuting
                      ? 'bg-[#38bdf8] text-black border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                      : 'bg-[#14171c]/40 hover:bg-[#38bdf8] text-[#8fa0b5] hover:text-black border-[#232832] hover:border-[#38bdf8] hover:shadow-[0_0_12px_rgba(56,189,248,0.45)]'
                }`}
              >
                {isMultiAgentExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : null}
                <span>{isMultiAgentExecuting ? `ACTIVE [${formatElapsed(elapsedSeconds)}]` : 'INITIATE DIR'}</span>
              </button>
              
              <button onClick={() => handleAction('REFINE')} disabled={isAnyExecuting} className="px-3 py-1.5 bg-[#14171c] text-[#a0aec0] border border-[#232832] font-semibold rounded text-[11px] hover:bg-[#1c2129] hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">REFINE</button>
              
              {/* DYNAMIC AUTHORIZE BUTTON */}
              <button 
                onClick={() => handleAction('AUTHORIZE ACTION')} 
                disabled={isAnyExecuting || workflowState !== 'MONTY_APPROVED'} 
                className={`px-3.5 py-1.5 font-semibold rounded text-[11px] transition-all flex items-center gap-1.5 ${
                  workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' 
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-default' 
                    : workflowState === 'MONTY_APPROVED'
                      ? 'bg-[#ffb800]/20 hover:bg-[#ffb800] text-[#ffb800] hover:text-black border border-[#ffb800] cursor-pointer shadow-[0_0_8px_rgba(255,184,0,0.3)] animate-pulse'
                      : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                }`}
              >
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'AUTHORIZED' || workflowState === 'DISPATCHED' ? 'AUTHORIZED' : 'AUTHORIZE'}
              </button>
              
              {/* DISPATCH BUTTON */}
              <button 
                onClick={() => handleAction('MONTY DISPATCH')} 
                disabled={isAnyExecuting || workflowState !== 'AUTHORIZED'} 
                className={`px-3.5 py-1.5 font-bold rounded text-[11px] transition-all flex items-center gap-1.5 ${
                  workflowState === 'AUTHORIZED' 
                    ? 'bg-[#d97706]/20 hover:bg-[#d97706] text-[#fef08a] hover:text-black border border-[#d97706] shadow-[0_0_12px_rgba(217,119,6,0.3)] cursor-pointer' 
                    : workflowState === 'DISPATCHED'
                      ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981] cursor-default'
                      : 'bg-[#14171c] text-[#5c6b7f] border border-[#232832] cursor-not-allowed'
                }`}
              >
                {workflowState === 'DISPATCHED' ? <Check className="w-3.5 h-3.5" /> : null}
                {workflowState === 'DISPATCHED' ? 'DISPATCHED' : 'DISPATCH'}
              </button>

              {/* MANUAL STATE RESET BUTTON */}
              <button
                type="button"
                onClick={handleResetWorkflowState}
                disabled={isAnyExecuting || workflowState === 'IDLE'}
                className="px-2.5 py-1.5 bg-[#14171c] hover:bg-[#1f242d] text-[#8fa0b5] hover:text-white border border-[#232832] rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reset authorization state back to default IDLE without losing prompt text"
              >
                <RotateCcw className="w-3 h-3 text-[#ffb800]" />
                <span>RESET STATE</span>
              </button>
              
              {/* CLS (PERMANENTLY UNLOCKED) */}
              <button 
                type="button"
                onClick={handleCls} 
                className="px-3 py-1.5 bg-[#592525]/40 text-[#fca5a5] border border-[#7f3535] font-semibold rounded text-[11px] hover:bg-[#592525] hover:text-white cursor-pointer transition-colors"
                title="Force-wipe all messages and reset War Room"
              >
                CLS
              </button>
              
              <button onClick={handleAllStop} className="px-3 py-1.5 bg-[#450a0a]/60 hover:bg-[#7f1d1d] text-[#fca5a5] hover:text-white border border-[#7f1d1d] font-bold rounded text-[11px] flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.2)] transition-all">
                <AlertOctagon className="w-3.5 h-3.5 text-[#ef4444]" /><span>ALL STOP</span>
              </button>

              {/* GENERATE DIRECTIVE WRAPPER BUTTON */}
              <button
                type="button"
                onClick={handleGenerateDirective}
                disabled={isAnyExecuting}
                className="px-3 py-1.5 bg-[#080a0c] hover:bg-[#ffb800] text-[#ffb800] hover:text-black border border-[#ffb800] font-bold rounded text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_6px_rgba(255,184,0,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{pipelineStage === 2 ? 'STAGE 2 SCAFFOLD' : 'STAGE 1 SCAFFOLD'}</span>
              </button>

              {/* COPY DIRECTIVE BUTTON */}
              <button
                type="button"
                onClick={handleCopyDirective}
                disabled={!inputBuffer || !inputBuffer.trim()}
                className={`px-3 py-1.5 font-bold rounded text-[11px] flex items-center gap-1.5 border transition-all cursor-pointer ${
                  copiedDirective
                    ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]'
                    : 'bg-[#14171c] hover:bg-[#ffb800]/15 text-[#ffb800] border-[#ffb800]/40 hover:border-[#ffb800]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title="Copy entire directive prompt to clipboard"
              >
                {copiedDirective ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5 text-[#ffb800]" />}
                <span>{copiedDirective ? 'COPIED' : 'COPY DIRECTIVE'}</span>
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
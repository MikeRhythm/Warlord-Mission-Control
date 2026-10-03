import React, { useState, useRef, useEffect } from 'react';

const BRAIN_TIERS = [
  {
    tier: 'TIER 1: OLLAMA (LOCAL)',
    models: [
      { id: 'llama3:latest', name: 'Llama 3 (Local)', badge: 'LOCAL' },
      { id: 'qwen2.5:latest', name: 'Qwen 2.5 (Local)', badge: 'LOCAL' },
      { id: 'qwen2.5-coder:latest', name: 'Qwen 2.5 Coder', badge: 'LOCAL' }
    ]
  },
  {
    tier: 'TIER 2: HARVESTED CLUSTERS (FREE)',
    models: [
      { id: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision (NIM)', badge: 'NIM-VISION' },
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (NIM)', badge: 'NIM' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', badge: 'GROQ' },
      { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Studio)', badge: 'GEMINI' },
      { id: 'nvidia/nemotron-70b-ultra', name: 'Nemotron 70B Ultra (NIM)', badge: 'NIM' }
    ]
  },
  {
    tier: 'TIER 3: OPENROUTER (ELITE)',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5', badge: 'ELITE' }
    ]
  }
];

export default function Tab01Exec() {
  const [selectedBrain, setSelectedBrain] = useState('meta/llama-3.2-90b-vision-instruct');
  const [inputCommand, setInputCommand] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Staged Proposal for File Modification
  const [stagedProposal, setStagedProposal] = useState(null);

  const [chatLog, setChatLog] = useState([
    {
      sender: 'CHIEF OF STAFF // MONTY',
      text: 'Mission Control Base 1 is live and standing by. Multimodal vision & file tools online. Submit instructions.'
    }
  ]);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, attachedFiles, isLoading, stagedProposal]);

  // Chrome Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setInputCommand((prev) => {
              const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
              return prev + spacer + event.results[i][0].transcript;
            });
          }
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic error:', err);
      }
    }
  };

  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMsg = (text) => navigator.clipboard.writeText(text);

  const handleCopyAll = () => {
    const fullLog = chatLog.map((msg) => `[${msg.sender}]\n${msg.text}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(fullLog);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const processFiles = (files) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImage) {
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              name: file.name || 'Pasted_Screenshot.png',
              size: (file.size / 1024).toFixed(1) + ' KB',
              type: 'image',
              data: e.target.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB',
              type: 'text',
              content: e.target.result
            }
          ]);
        };
        reader.readAsText(file);
      }
    });
  };

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData?.items;
    if (!clipboardItems) return;

    const filesToProcess = [];
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].kind === 'file') {
        const file = clipboardItems[i].getAsFile();
        if (file) filesToProcess.push(file);
      }
    }

    if (filesToProcess.length > 0) {
      e.preventDefault();
      processFiles(filesToProcess);
    }
  };

  const removeAttachment = (id) => {
    setAttachedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearInput = () => {
    setInputCommand('');
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCLS = () => {
    handleAllStop();
    setChatLog([
      {
        sender: 'CHIEF OF STAFF // MONTY',
        text: 'Mission Control Base 1 is live and standing by. Multimodal vision & file tools online. Submit instructions.'
      }
    ]);
    setStagedProposal(null);
    handleClearInput();
  };

  const handleRefine = () => {
    const lastUserMsg = [...chatLog].reverse().find((msg) => msg.sender.includes('COMMANDER'));
    if (lastUserMsg) {
      const rawText = lastUserMsg.text.replace(/\[ATTACHMENT:.*\]/g, '').trim();
      setInputCommand(rawText);
    }
  };

  const handleAllStop = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    window.speechSynthesis.cancel();
    setIsLoading(false);
  };

  // Execute Approved File Write
  const handleApproveWrite = async () => {
    if (!stagedProposal) return;
    try {
      const response = await fetch('http://localhost:8081/api/tools/write', {
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
          { sender: 'SYSTEM // FILE WRITTEN', text: `Confirmed: ${stagedProposal.filePath} has been written to disk.` }
        ]);
        setStagedProposal(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(`Write execution failed: ${err.message}`);
    }
  };

  // Main Dispatch to Server Bridge
  const dispatchToServer = async (userText, attachments) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const payload = {
        director: 'MONTY // CHIEF OF STAFF',
        model: selectedBrain,
        prompt: userText,
        message: userText,
        attachments: attachments || []
      };

      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.reply || errData.message || `Server status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Daemon returned empty response.';
      const activeModel = data.activeModelUsed ? ` [${data.activeModelUsed}]` : '';

      // Check if response contains a structured file change proposal
      const proposeMatch = reply.match(/```diff([\s\S]*?)```/);
      const fileMatch = reply.match(/FILE:\s*([^\n\r]+)/);
      if (proposeMatch && fileMatch) {
        setStagedProposal({
          filePath: fileMatch[1].trim(),
          diffText: proposeMatch[1].trim(),
          newContent: reply.split('```diff')[0].trim()
        });
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: `CHIEF OF STAFF // MONTY${activeModel}`,
          text: reply
        }
      ]);
    } catch (err) {
      if (err.name === 'AbortError') {
        setChatLog((prev) => [...prev, { sender: 'SYSTEM // ALERT', text: 'Execution aborted by Commander.' }]);
      } else {
        console.error('Server Bridge Error:', err);
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'CHIEF OF STAFF // MONTY [FAIL]',
            text: `Daemon link failure: ${err.message}. Ensure node server.js is running on Port 8081.`
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputCommand.trim() && attachedFiles.length === 0) return;

    let payloadText = inputCommand;
    if (attachedFiles.length > 0) {
      const fileSummaries = attachedFiles
        .map((f) => `[ATTACHMENT: ${f.name} (${f.size})]`)
        .join('\n');
      payloadText = `${payloadText}\n\n${fileSummaries}`;
    }

    const currentFiles = [...attachedFiles];
    const sentText = inputCommand;

    setChatLog((prev) => [
      ...prev,
      {
        sender: 'COMMANDER MIKE',
        text: payloadText,
        attachments: currentFiles
      }
    ]);

    handleClearInput();
    dispatchToServer(sentText, currentFiles);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-[#080a0c] text-gray-200 font-mono overflow-hidden box-border pt-1">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
        }}
        multiple
        className="hidden"
      />

      {/* LEFT COLUMN: EXEC CONTROL PANEL */}
      <div
        className="w-[260px] border-r border-[#1f242d] flex flex-col p-2 gap-2 select-none shrink-0 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#DAA520 #0b0e14' }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-[#14171c] shrink-0">
          <span className="text-[#DAA520] font-bold text-[10px] tracking-wider">
            EXEC CONTROL PANEL
          </span>
          <span className="border border-[#10b981] text-[#10b981] text-[8px] px-1 py-0.5 rounded font-bold">
            PINNED
          </span>
        </div>

        {BRAIN_TIERS.map((tierGroup, idx) => (
          <div key={idx} className="flex flex-col gap-1 shrink-0">
            <span className="text-[9px] text-[#8fa0b5] font-semibold tracking-tight uppercase">
              {tierGroup.tier}
            </span>
            {tierGroup.models.map((m) => {
              const isSelected = selectedBrain === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedBrain(m.id)}
                  className={`w-full h-6 px-2 flex items-center justify-between text-[10px] rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#00e5ff] text-[#00e5ff] bg-[#0c1c24]'
                      : 'border-[#1f242d] text-gray-400 bg-[#0d1015] hover:border-[#384152] hover:text-gray-200'
                  }`}
                >
                  <span className="truncate">{m.name}</span>
                  <span
                    className={`text-[8px] font-bold px-1 rounded ${
                      isSelected
                        ? 'text-[#00e5ff] bg-[#00e5ff]/20'
                        : 'text-gray-500 bg-[#161a22]'
                    }`}
                  >
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: DISPATCH CONSOLE */}
      <div className="flex-1 flex flex-col justify-between p-2 min-h-0 overflow-hidden">
        {/* PINNED STATUS HEADER */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#14171c] text-[9px] shrink-0 bg-[#080a0c] z-10">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">STATUS:</span>
            <span className="text-[#10b981] font-bold">DAEMON LINKED (PORT 8081)</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">BRAIN:</span>
            <span className="text-[#DAA520] font-bold uppercase">{selectedBrain}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => speakText(chatLog[chatLog.length - 1]?.text)}
              className="border border-[#DAA520] text-[#DAA520] px-1.5 py-0.5 rounded text-[8px] hover:bg-[#DAA520]/10 cursor-pointer"
            >
              🔊 VOICE BRIEF
            </button>
            <button
              onClick={handleCopyAll}
              className={`border px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-all ${
                copyFeedback
                  ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/20 font-bold'
                  : 'border-[#1f242d] text-gray-400 hover:text-white'
              }`}
            >
              {copyFeedback ? '✓ COPIED ALL' : 'COPY ALL'}
            </button>
          </div>
        </div>

        {/* Message Log Viewport */}
        <div
          className="flex-1 overflow-y-auto py-2 flex flex-col gap-2 min-h-0"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f242d #080a0c' }}
        >
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className="border border-[#1f242d] bg-[#0b0e14] p-2 rounded flex flex-col gap-1.5 shrink-0"
            >
              <div className="flex items-center justify-between text-[9px]">
                <span
                  className={`font-bold ${
                    msg.sender.includes('MONTY')
                      ? 'text-[#10b981]'
                      : msg.sender.includes('ALERT') || msg.sender.includes('FAIL')
                      ? 'text-[#ef4444]'
                      : 'text-[#DAA520]'
                  }`}
                >
                  {msg.sender}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyMsg(msg.text)}
                    className="text-gray-500 hover:text-gray-300 text-[8px] cursor-pointer"
                  >
                    COPY
                  </button>
                  {msg.sender.includes('MONTY') && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-gray-500 hover:text-[#DAA520] text-[8px] cursor-pointer"
                    >
                      🔊 LISTEN
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-gray-300 whitespace-pre-wrap leading-tight">
                {msg.text}
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#14171c]">
                  {msg.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-1.5 bg-[#12171f] border border-[#1f242d] p-1 rounded"
                    >
                      {file.type === 'image' ? (
                        <img
                          src={file.data}
                          alt={file.name}
                          className="h-7 w-7 object-cover rounded border border-[#2a3444]"
                        />
                      ) : (
                        <span className="text-[#DAA520] text-[10px]">📄</span>
                      )}
                      <div className="flex flex-col text-[8px]">
                        <span className="text-gray-200 font-bold truncate max-w-[120px]">
                          {file.name}
                        </span>
                        <span className="text-gray-500">{file.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Staged File Edit Approval Card */}
          {stagedProposal && (
            <div className="border border-[#DAA520] bg-[#16130b] p-3 rounded flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#DAA520] font-bold">
                  ⚠️ MONTY REQUESTING WRITE AUTHORIZATION
                </span>
                <span className="text-gray-400 font-mono">{stagedProposal.filePath}</span>
              </div>
              <pre className="bg-[#05070a] p-2 rounded text-[10px] text-gray-300 overflow-x-auto border border-[#2a3649]">
                {stagedProposal.diffText}
              </pre>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setStagedProposal(null)}
                  className="border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 text-[9px] px-3 py-1 rounded cursor-pointer"
                >
                  REJECT
                </button>
                <button
                  type="button"
                  onClick={handleApproveWrite}
                  className="bg-[#10b981] hover:bg-[#059669] text-black font-bold text-[9px] px-4 py-1 rounded cursor-pointer"
                >
                  ✓ APPROVE & WRITE TO DISK
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE SPINNER */}
          {isLoading && (
            <div className="border border-[#1f242d] bg-[#0b0e14] p-2.5 rounded flex items-center gap-3 text-[10px] text-[#00e5ff] shrink-0">
              <svg
                className="animate-spin h-4 w-4 text-[#00e5ff]"
                xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              <span className="tracking-wider font-semibold">
                MONTY PROCESSING VIA MASTER DAEMON // {selectedBrain.toUpperCase()}...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT DOCK */}
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#14171c] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex items-center gap-1 text-[#DAA520] border border-[#DAA520]/40 bg-[#16130b] hover:bg-[#261f0d] px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all"
              >
                <span>📎</span> + ATTACH FILE / SCREENSHOT (CTRL+V)
              </button>
              <button
                type="button"
                className="flex items-center gap-1 border border-[#1f242d] text-gray-400 hover:text-white px-1.5 py-0.5 rounded text-[9px] cursor-pointer"
              >
                DIRECTIVE
              </button>
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                isRecording
                  ? 'border-[#ef4444] text-[#ef4444] bg-[#2b0d0d] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  : 'border-[#1f242d] text-[#DAA520] hover:border-[#DAA520]'
              }`}
            >
              <span>{isRecording ? '🔴' : '🎤'}</span>
              <span>{isRecording ? 'REC [STOP]' : 'CHROME MIC'}</span>
            </button>
          </div>

          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 bg-[#0c1017] border border-[#1f242d] rounded">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1 bg-[#141b24] border border-[#2a3649] px-1.5 py-0.5 rounded shrink-0"
                >
                  {file.type === 'image' ? (
                    <img src={file.data} alt={file.name} className="h-5 w-5 object-cover rounded" />
                  ) : (
                    <span className="text-[9px] text-[#DAA520]">📄</span>
                  )}
                  <span className="text-[8px] text-gray-200 font-bold max-w-[100px] truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="text-red-400 hover:text-red-200 text-[9px] font-bold ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={2}
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isRecording
                ? 'Listening... speak clearly into microphone...'
                : `Enter command for Monty dispatch via Master Daemon [${selectedBrain}]...`
            }
            className={`w-full bg-[#05070a] border rounded p-1.5 text-[10px] text-gray-200 focus:outline-none resize-none transition-all leading-tight ${
              isRecording
                ? 'border-[#ef4444]/60 ring-1 ring-[#ef4444]/30'
                : 'border-[#1f242d] focus:border-[#DAA520]'
            }`}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#FFB800] hover:bg-[#e6a600] text-black font-bold text-[9px] px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3 w-3 text-black"
                      xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <span>➤</span>
                    <span>SUBMIT</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/10 font-bold text-[9px] px-2 py-1 rounded cursor-pointer"
              >
                PUSH TO WAR ROOM
              </button>
              <button
                type="button"
                onClick={handleRefine}
                className="border border-[#1f242d] text-gray-400 hover:text-white text-[9px] px-2 py-1 rounded cursor-pointer"
              >
                REFINE
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className={`border text-[9px] px-2 py-1 rounded cursor-pointer transition-all ${
                  copyFeedback
                    ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/20 font-bold'
                    : 'border-[#1f242d] text-gray-400 hover:text-white'
                }`}
              >
                {copyFeedback ? '✓ COPIED ALL' : 'COPY ALL'}
              </button>
              <button
                type="button"
                onClick={handleCLS}
                className="border border-[#1f242d] text-gray-400 hover:text-red-400 text-[9px] px-2 py-1 rounded cursor-pointer"
              >
                CLS
              </button>
              <button
                type="button"
                onClick={handleAllStop}
                className="border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 font-bold text-[9px] px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                <span>🛑</span> ALL STOP
              </button>
            </div>
            <span className="text-[8px] text-gray-600 font-mono">
              Ctrl+Enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
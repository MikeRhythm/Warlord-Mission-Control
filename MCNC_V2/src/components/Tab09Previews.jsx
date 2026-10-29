import React, { useState, useEffect, useRef } from 'react';

export default function Tab09Previews() {
  const [projects, setProjects] = useState(['The Chief Madothi Fund']);
  const [selectedProject, setSelectedProject] = useState('The Chief Madothi Fund');
  const [artifacts, setArtifacts] = useState(['index.html']);
  const [selectedArtifact, setSelectedArtifact] = useState('index.html');
  const [viewport, setViewport] = useState('1920'); // '1920', '768', '375'
  const [viewMode, setViewMode] = useState('RENDER'); // 'RENDER', 'SPLIT', 'CODE'
  const [isRedLineOpen, setIsRedLineOpen] = useState(false);
  const [critiqueText, setCritiqueText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:8083');
  const [syncStatus, setSyncStatus] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]); // [{ name, size, type, dataUrl }]

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync Conduit logic: Poll / check local Port 8083 static server
  const handleSyncConduit = async () => {
    setSyncStatus('SYNCING...');
    try {
      await fetch('http://localhost:8083', { method: 'HEAD', mode: 'no-cors' });
      setPreviewUrl(`http://localhost:8083?t=${Date.now()}`);
      setArtifacts(['index.html']);
      setSelectedArtifact('index.html');
      setSyncStatus('SYNCED');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (e) {
      setSyncStatus('OFFLINE');
      setTimeout(() => setSyncStatus(''), 2000);
    }
  };

  // Fixed Speech Recognition: Clean accumulation without infinite repeating interim loops
  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = false; // Prevents the stutter/looping bug
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          }
        }
        if (finalChunk.trim()) {
          setCritiqueText((prev) => {
            const cleanPrev = prev ? prev.trim() : '';
            return cleanPrev ? `${cleanPrev} ${finalChunk.trim()}` : finalChunk.trim();
          });
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to initialize dictation:', err);
      setIsListening(false);
    }
  };

  // Clipboard copy
  const copyCritiqueToClipboard = () => {
    if (!critiqueText) return;
    navigator.clipboard.writeText(critiqueText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Clear Screen / Input (Reset text and attachments)
  const handleClearScreen = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setCritiqueText('');
    setAttachedFiles([]);
    setCopySuccess(false);
  };

  // File Attachment Handling (Reads files as Base64 DataURLs)
  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            dataUrl: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachedFile = (indexToRemove) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Dispatch critique & attached reference files into War Room queue
  const handleDispatchCritique = () => {
    if (!critiqueText.trim() && attachedFiles.length === 0) return;

    const critiquePayload = {
      project: selectedProject,
      target: selectedArtifact,
      critique: critiqueText,
      attachments: attachedFiles,
      timestamp: new Date().toISOString()
    };

    console.log('[WAR ROOM DISPATCH WITH ATTACHMENTS]', critiquePayload);

    // Save payload to local storage queue or backend conduit
    const existingQueue = JSON.parse(localStorage.getItem('WAR_ROOM_CRITIQUES') || '[]');
    existingQueue.push(critiquePayload);
    localStorage.setItem('WAR_ROOM_CRITIQUES', JSON.stringify(existingQueue));

    // Reset and close modal
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setCritiqueText('');
    setAttachedFiles([]);
    setIsRedLineOpen(false);
  };

  const getViewportWidth = () => {
    if (viewport === '375') return '375px';
    if (viewport === '768') return '768px';
    return '100%';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0d0907',
      color: '#F5F0EA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace'
    }}>
      {/* TOP STATUS SUB-BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        backgroundColor: '#160f0c',
        borderBottom: '1px solid rgba(199, 146, 62, 0.25)',
        fontSize: '0.85rem'
      }}>
        {/* LEFT TITLE & PROJECT SELECT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#DAA520', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            09 // ARTIFACT APPROVAL COCKPIT
          </span>
          <span style={{ color: '#6b7280' }}>|</span>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>PROJECT:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              backgroundColor: '#221510',
              color: '#F5F0EA',
              border: '1px solid rgba(199, 146, 62, 0.4)',
              borderRadius: '3px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={handleSyncConduit}
            style={{
              backgroundColor: '#221510',
              border: '1px solid #C7923E',
              color: '#C7923E',
              borderRadius: '3px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {syncStatus ? syncStatus : 'SYNC CONDUIT'}
          </button>
        </div>

        {/* RIGHT CONTROLS: VIEWPORTS & MODES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setViewport('1920')}
            style={{
              backgroundColor: viewport === '1920' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '1920' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '1920' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '1920' ? 'bold' : 'normal'
            }}
          >
            🖥️ DESKTOP 1920
          </button>
          <button
            onClick={() => setViewport('768')}
            style={{
              backgroundColor: viewport === '768' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '768' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '768' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '768' ? 'bold' : 'normal'
            }}
          >
            📱 TABLET 768
          </button>
          <button
            onClick={() => setViewport('375')}
            style={{
              backgroundColor: viewport === '375' ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
              border: `1px solid ${viewport === '375' ? '#DAA520' : '#4b5563'}`,
              color: viewport === '375' ? '#DAA520' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: viewport === '375' ? 'bold' : 'normal'
            }}
          >
            📲 MOBILE 375
          </button>

          <span style={{ color: '#4b5563', margin: '0 0.25rem' }}>|</span>

          <button
            onClick={() => setViewMode('RENDER')}
            style={{
              backgroundColor: viewMode === 'RENDER' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'RENDER' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'RENDER' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            RENDER
          </button>
          <button
            onClick={() => setViewMode('SPLIT')}
            style={{
              backgroundColor: viewMode === 'SPLIT' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'SPLIT' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'SPLIT' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            SPLIT
          </button>
          <button
            onClick={() => setViewMode('CODE')}
            style={{
              backgroundColor: viewMode === 'CODE' ? '#E35503' : 'transparent',
              border: `1px solid ${viewMode === 'CODE' ? '#E35503' : '#4b5563'}`,
              color: viewMode === 'CODE' ? '#ffffff' : '#9ca3af',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            CODE
          </button>
        </div>
      </div>

      {/* MAIN COCKPIT BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT RAIL: STAGED ARTIFACTS */}
        <div style={{
          width: '240px',
          backgroundColor: '#120c09',
          borderRight: '1px solid rgba(199, 146, 62, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              STAGED ARTIFACTS ({artifacts.length})
            </div>

            {artifacts.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
                No artifacts staged for <span style={{ color: '#DAA520' }}>{selectedProject}</span>.
                <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>Deploy artifacts into Web_And_Social.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {artifacts.map((art) => (
                  <button
                    key={art}
                    onClick={() => setSelectedArtifact(art)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      backgroundColor: selectedArtifact === art ? 'rgba(218, 165, 32, 0.15)' : 'transparent',
                      border: `1px solid ${selectedArtifact === art ? '#DAA520' : 'transparent'}`,
                      color: selectedArtifact === art ? '#DAA520' : '#e5e7eb',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      cursor: 'pointer'
                    }}
                  >
                    📄 {art}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* APPROVAL & REVISION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={() => alert(`Artifact ${selectedArtifact} Approved and Locked.`)}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#22c55e',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              ACCEPT & STAGE
            </button>
            <button
              onClick={() => setIsRedLineOpen(true)}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              RED-LINE / REVISE
            </button>
          </div>
        </div>

        {/* CENTER VIEWPORT CANVAS */}
        <div style={{
          flex: 1,
          backgroundColor: '#0a0705',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: '1rem'
        }}>
          {selectedArtifact ? (
            <div style={{
              width: getViewportWidth(),
              height: '100%',
              backgroundColor: '#fff',
              boxShadow: '0 0 30px rgba(0,0,0,0.8)',
              transition: 'width 0.25s ease',
              borderRadius: viewport === '1920' ? '0px' : '8px',
              overflow: 'hidden'
            }}>
              <iframe
                title="Artifact Preview"
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                [ NO ACTIVE ARTIFACT SELECTED ]
              </div>
              <div style={{ fontSize: '0.8rem' }}>Select a staged artifact from the left manifest to preview live.</div>
            </div>
          )}
        </div>
      </div>

      {/* RED-LINE CRITIQUE MODAL WITH DICTATE, COPY, CLS, AND ATTACHMENTS */}
      {isRedLineOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '740px',
            backgroundColor: '#120d0b',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '1.25rem',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)',
            fontFamily: 'monospace'
          }}>
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                [ RED-LINE CRITIQUE // ROUTING TO TAB 02 WAR ROOM ]
              </span>
              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setIsRedLineOpen(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* METADATA */}
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1rem' }}>
              Target: <span style={{ color: '#F5F0EA' }}>{selectedArtifact || 'index.html'}</span> | Project: <span style={{ color: '#DAA520' }}>{selectedProject}</span>
            </div>

            {/* ACTION CONTROLS: DICTATE, COPY, CLS, ATTACH */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleDictation}
                style={{
                  backgroundColor: isListening ? '#dc2626' : '#221510',
                  color: isListening ? '#ffffff' : '#DAA520',
                  border: `1px solid ${isListening ? '#ef4444' : '#DAA520'}`,
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 'bold',
                  boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                }}
              >
                {isListening ? '🔴 LISTENING... (STOP)' : '🎙️ START DICTATION'}
              </button>

              <button
                type="button"
                onClick={copyCritiqueToClipboard}
                style={{
                  backgroundColor: '#221510',
                  color: '#9ca3af',
                  border: '1px solid #4b5563',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 'bold'
                }}
              >
                📋 COPY TEXT
              </button>

              {/* CLEAR SCREEN / INPUT BUTTON */}
              <button
                type="button"
                onClick={handleClearScreen}
                style={{
                  backgroundColor: '#221510',
                  color: '#f87171',
                  border: '1px solid #7f1d1d',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 'bold'
                }}
              >
                🧹 CLS
              </button>

              {/* HIDDEN FILE INPUT & ATTACH TRIGGER */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttach}
                multiple
                accept="image/*,.pdf,.txt,.md,.html"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  backgroundColor: '#221510',
                  color: '#C7923E',
                  border: '1px solid #C7923E',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 'bold'
                }}
              >
                📎 ATTACH EXAMPLES
              </button>

              {copySuccess && (
                <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>

            {/* ATTACHED FILES CHIPS LIST */}
            {attachedFiles.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginBottom: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#1b120e',
                borderRadius: '3px',
                border: '1px dashed #C7923E'
              }}>
                {attachedFiles.map((f, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#2b1a11',
                      border: '1px solid #C7923E',
                      color: '#F5F0EA',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px'
                    }}
                  >
                    📄 {f.name} ({f.size})
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginLeft: '0.2rem'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* CRITIQUE INPUT AREA */}
            <textarea
              rows={6}
              value={critiqueText}
              onChange={(e) => setCritiqueText(e.target.value)}
              placeholder="State precise required revisions or speak using the dictation button above. Attach design mockups or screenshots to guide Roxy..."
              style={{
                width: '100%',
                backgroundColor: '#0a0706',
                border: '1px solid #374151',
                borderRadius: '3px',
                color: '#e5e7eb',
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* FOOTER DISPATCH ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  if (isListening && recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setIsRedLineOpen(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #4b5563',
                  color: '#9ca3af',
                  padding: '0.5rem 1rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDispatchCritique}
                style={{
                  backgroundColor: '#7f1d1d',
                  border: '1px solid #ef4444',
                  color: '#ffffff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                }}
              >
                DISPATCH CRITIQUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
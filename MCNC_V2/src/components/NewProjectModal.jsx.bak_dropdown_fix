import React, { useState, useEffect, useRef } from 'react';

// Industry preset mapping: suggested tool stacks & base palettes
const INDUSTRY_PRESETS = {
  'Corporate Expansion': {
    tools: ['ERP Bridge', 'Local Banking API', 'Compliance Scanner', 'Executive Dashboard'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#C5BD9F' },
      { id: '2', role: 'SECONDARY', hex: '#94A3B8' },
      { id: '3', role: 'CANVAS BG', hex: '#080a0c' },
      { id: '4', role: 'ACCENT', hex: '#ffb800' }
    ]
  },
  'Commercial Real Estate / Construction': {
    tools: ['Site Telemetry', 'BIM / CAD Viewer', 'Contract Pipeline', 'Supplier Ledger'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#B87333' },
      { id: '2', role: 'SECONDARY', hex: '#708090' },
      { id: '3', role: 'CANVAS BG', hex: '#0b0c10' },
      { id: '4', role: 'ACCENT', hex: '#ff8c00' }
    ]
  },
  'Retail & Logistics / E-Commerce': {
    tools: ['Shopify / Custom Storefront', 'Inventory Relays', 'Automated Dispatch', 'Stripe / VALR'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#10b981' },
      { id: '2', role: 'SECONDARY', hex: '#38bdf8' },
      { id: '3', role: 'CANVAS BG', hex: '#080a0c' },
      { id: '4', role: 'ACCENT', hex: '#00e676' }
    ]
  },
  'Hospitality & Tourism': {
    tools: ['Booking Engine', 'WhatsApp Guest Relay', 'Review Synthesizer', 'Multi-Currency POS'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#20b2aa' },
      { id: '2', role: 'SECONDARY', hex: '#e0a96d' },
      { id: '3', role: 'CANVAS BG', hex: '#0c1014' },
      { id: '4', role: 'ACCENT', hex: '#e2725b' }
    ]
  },
  'Quantitative Finance / FinTech': {
    tools: ['MT5 Socket Bridge', 'Volatility Engine', 'Fix Protocol', 'Real-time WebSocket'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#C5BD9F' },
      { id: '2', role: 'SECONDARY', hex: '#1e90ff' },
      { id: '3', role: 'CANVAS BG', hex: '#080a0c' },
      { id: '4', role: 'ACCENT', hex: '#ffb800' }
    ]
  },
  'Humanitarian & Educational Trust': {
    tools: ['Donor CRM', 'School Logistics Ledger', 'Public Transparency Feed', 'Grant Tracker'],
    palette: [
      { id: '1', role: 'PRIMARY', hex: '#22c55e' },
      { id: '2', role: 'SECONDARY', hex: '#38bdf8' },
      { id: '3', role: 'CANVAS BG', hex: '#080a0c' },
      { id: '4', role: 'ACCENT', hex: '#ffb800' }
    ]
  }
};

const SOCIAL_CHANNELS = ['LinkedIn', 'X / Twitter', 'Instagram', 'YouTube', 'Email Marketing', 'WhatsApp Channel'];

const INITIAL_FORM = {
  name: '',
  stakeholder: '',
  contactEmail: '',
  industry: 'Corporate Expansion',
  webStatus: 'Have Existing',
  webUrl: '',
  selectedSocials: ['LinkedIn', 'Email Marketing'],
  toolStack: INDUSTRY_PRESETS['Corporate Expansion'].tools,
  palette: INDUSTRY_PRESETS['Corporate Expansion'].palette,
  uploadedFiles: [],
  objective: '',
  dominantMetric: 'Absolute Precision',
  definitionOfDone: '',
  forbiddenVectors: ''
};

export default function NewProjectModal({ isOpen, onClose, onSaveProject, onPushToWarRoom }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isListening, setIsListening] = useState(false);
  const [activeMicField, setActiveMicField] = useState(null);
  const [micStatusMsg, setMicStatusMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const recognitionRef = useRef(null);
  const activeMicFieldRef = useRef(null);

  // Keep ref synchronized to avoid stale speech listener callbacks
  useEffect(() => {
    activeMicFieldRef.current = activeMicField;
  }, [activeMicField]);

  // Robust SpeechRecognition Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatusMsg('Speech recognition API not supported in this browser. Use Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicStatusMsg('🎙️ Mic active - speak clearly...');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            interimTranscript += transcriptChunk;
          }
        }

        const targetField = activeMicFieldRef.current;
        if (targetField && finalTranscript) {
          setFormData((prev) => {
            const currentVal = prev[targetField] || '';
            const separator = currentVal.length > 0 && !currentVal.endsWith(' ') ? ' ' : '';
            return {
              ...prev,
              [targetField]: currentVal + separator + finalTranscript.trim()
            };
          });
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech Recognition Error:', e.error);
        if (e.error === 'not-allowed') {
          setMicStatusMsg('❌ Microphone blocked. Check browser URL permissions.');
        } else if (e.error === 'no-speech') {
          setMicStatusMsg('⚠️ No voice detected.');
        } else {
          setMicStatusMsg(`Mic error: ${e.error}`);
        }
        setIsListening(false);
        setActiveMicField(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveMicField(null);
        setTimeout(() => setMicStatusMsg(''), 3000);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to instantiate Web Speech:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const toggleDictation = (fieldKey) => {
    if (!recognitionRef.current) {
      alert('Speech recognition not available. Use Google Chrome over HTTPS or localhost.');
      return;
    }

    if (isListening && activeMicField === fieldKey) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
      setActiveMicField(null);
    } else {
      try {
        if (isListening) {
          recognitionRef.current.stop();
        }
        setActiveMicField(fieldKey);
        activeMicFieldRef.current = fieldKey;
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start microphone:', err);
      }
    }
  };

  const handleStartAgain = () => {
    if (window.confirm('Reset all entered fields and start intake from scratch?')) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setFormData({
        ...INITIAL_FORM,
        palette: INDUSTRY_PRESETS['Corporate Expansion'].palette,
        toolStack: INDUSTRY_PRESETS['Corporate Expansion'].tools
      });
      setStep(1);
      setActiveMicField(null);
      setIsListening(false);
    }
  };

  const handleClearField = (fieldKey) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: '' }));
  };

  const handleIndustryChange = (e) => {
    const selected = e.target.value;
    const preset = INDUSTRY_PRESETS[selected] || {
      tools: ['Web Portal', 'Analytics', 'Automated Email'],
      palette: [
        { id: '1', role: 'PRIMARY', hex: '#C5BD9F' },
        { id: '2', role: 'SECONDARY', hex: '#94A3B8' },
        { id: '3', role: 'CANVAS BG', hex: '#080a0c' },
        { id: '4', role: 'ACCENT', hex: '#ffb800' }
      ]
    };
    setFormData((prev) => ({
      ...prev,
      industry: selected,
      toolStack: preset.tools,
      palette: preset.palette
    }));
  };

  const toggleSocial = (social) => {
    setFormData((prev) => {
      const exists = prev.selectedSocials.includes(social);
      return {
        ...prev,
        selectedSocials: exists 
          ? prev.selectedSocials.filter((s) => s !== social)
          : [...prev.selectedSocials, social]
      };
    });
  };

  // Swatch actions
  const handleUpdateSwatch = (id, key, val) => {
    setFormData((prev) => ({
      ...prev,
      palette: prev.palette.map((item) => (item.id === id ? { ...item, [key]: val } : item))
    }));
  };

  const handleAddSwatch = () => {
    const newId = String(Date.now());
    setFormData((prev) => ({
      ...prev,
      palette: [...prev.palette, { id: newId, role: `ACCENT ${prev.palette.length + 1}`, hex: '#38bdf8' }]
    }));
  };

  const handleDeleteSwatch = (id) => {
    if (formData.palette.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      palette: prev.palette.filter((item) => item.id !== id)
    }));
  };

  // Dossier File Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const formatted = files.map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.name.split('.').pop().toUpperCase(),
      file: f
    }));
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...formatted]
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const handleTriggerWarRoom = () => {
    const filesSummary = formData.uploadedFiles.length > 0
      ? formData.uploadedFiles.map((f) => `- [${f.type}] ${f.name} (${f.size})`).join('\n')
      : 'None provided. Generating baseline ground truth.';

    const warRoomPayload = `
[PROJECT INTAKE MANIFEST // EXECUTION DIRECTIVE]
PROJECT: ${formData.name.toUpperCase() || 'UNNAMED PROJECT'}
CLIENT / CHAMPION: ${formData.stakeholder} (${formData.contactEmail})
INDUSTRY SECTOR: ${formData.industry}
DOMINANT METRIC: ${formData.dominantMetric}

DIGITAL FOOTPRINT & CHANNELS:
- Web Presence: ${formData.webStatus} ${formData.webUrl ? `(${formData.webUrl})` : ''}
- Active Channels: ${formData.selectedSocials.join(', ')}
- Targeted Modules: ${formData.toolStack.join(', ')}
- Visual Identity Tokens: ${formData.palette.map((p) => `${p.role}: ${p.hex}`).join(' | ')}

ATTACHED GROUND-TRUTH DOSSIER:
${filesSummary}

OPERATIONAL SCOPE:
- Objective: ${formData.objective}
- Definition of Done (DoD): ${formData.definitionOfDone}
- Guardrails & Forbidden Vectors: ${formData.forbiddenVectors}

COUNCIL INSTRUCTION:
Deconstruct this project into atomic technical tiers. Monty, establish PRD phase-gates. Anchor all design and copy directly to the attached dossier.
    `.trim();

    onPushToWarRoom(formData, warRoomPayload);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(8, 10, 12, 0.90)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <style>{`
        .mcnc-modal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .mcnc-modal-scroll::-webkit-scrollbar-track {
          background: #080a0c;
        }
        .mcnc-modal-scroll::-webkit-scrollbar-thumb {
          background: #1f242d;
          border-radius: 2px;
        }
        .mcnc-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: #ffb800;
        }
      `}</style>

      <div style={{
        width: '95%',
        maxWidth: '860px',
        maxHeight: '94vh',
        backgroundColor: '#0d0f12',
        border: '1px solid #1f242d',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(255, 184, 0, 0.12)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid #1f242d',
          backgroundColor: '#14171c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#ffb800', fontWeight: 'bold', fontSize: '13px' }}>
              [ NEW PROJECT INTAKE // DISCOVERY ENGINE ]
            </span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>
              // STEP {step} OF 3
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleStartAgain}
              title="Clear all fields and restart"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontSize: '10px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}>
              ⟲ START AGAIN
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px'
              }}>✕</button>
          </div>
        </div>

        {/* Global Mic Banner / Status Indicator */}
        {micStatusMsg && (
          <div style={{
            padding: '6px 24px',
            backgroundColor: isListening ? '#14251d' : '#231414',
            borderBottom: '1px solid #1f242d',
            fontSize: '11px',
            color: isListening ? '#10b981' : '#f87171',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{micStatusMsg}</span>
            {isListening && (
              <button
                onClick={() => toggleDictation(activeMicField)}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '2px 6px',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}>
                STOP MIC
              </button>
            )}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="mcnc-modal-scroll" style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '66vh', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* STEP 1: IDENTITY, STAKEHOLDER, INDUSTRY */}
          {step === 1 && (
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>
                    Project Name
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {formData.name && (
                      <button
                        onClick={() => handleClearField('name')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '10px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    )}
                    <button 
                      onClick={() => toggleDictation('name')}
                      style={{
                        background: activeMicField === 'name' && isListening ? '#ef4444' : '#1f242d',
                        color: activeMicField === 'name' && isListening ? '#fff' : '#ffb800',
                        border: '1px solid #333',
                        fontSize: '10px',
                        padding: '2px 8px',
                        cursor: 'pointer'
                      }}>
                      {activeMicField === 'name' && isListening ? '● RECORDING' : '🎙️ MIC'}
                    </button>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., CUMMINGS GROUP // CAPE TOWN EXPANSION"
                  style={{
                    width: '100%',
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>Key Stakeholder / CEO</label>
                    <button 
                      onClick={() => toggleDictation('stakeholder')}
                      style={{
                        background: activeMicField === 'stakeholder' && isListening ? '#ef4444' : '#1f242d',
                        color: activeMicField === 'stakeholder' && isListening ? '#fff' : '#ffb800',
                        border: '1px solid #333',
                        fontSize: '9px',
                        padding: '1px 6px',
                        cursor: 'pointer'
                      }}>
                      {activeMicField === 'stakeholder' && isListening ? '● REC' : '🎙️ MIC'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={formData.stakeholder} 
                    onChange={(e) => setFormData({ ...formData, stakeholder: e.target.value })} 
                    placeholder="e.g., Andrew Tanton"
                    style={{
                      width: '100%',
                      backgroundColor: '#080a0c',
                      border: '1px solid #1f242d',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Contact Email / Bridge</label>
                  <input 
                    type="text" 
                    value={formData.contactEmail} 
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} 
                    placeholder="e.g., andrew@cummingsgroup.com"
                    style={{
                      width: '100%',
                      backgroundColor: '#080a0c',
                      border: '1px solid #1f242d',
                      padding: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Industry Sector Track (Auto-Configures Modules & Palettes)</label>
                <select 
                  value={formData.industry}
                  onChange={handleIndustryChange}
                  style={{
                    width: '100%',
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '10px',
                    color: '#ffb800',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                  {Object.keys(INDUSTRY_PRESETS).map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* STEP 2: CHANNELS, TOOLS, SWATCHES, DOSSIER DROPZONE */}
          {step === 2 && (
            <>
              {/* Web Presence */}
              <div>
                <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Web & Digital Portal Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  {['None / Need New', 'Have Existing', 'Overhaul / Redesign'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, webStatus: status })}
                      style={{
                        padding: '8px',
                        background: formData.webStatus === status ? 'rgba(255, 184, 0, 0.15)' : '#080a0c',
                        border: formData.webStatus === status ? '1px solid #ffb800' : '1px solid #1f242d',
                        color: formData.webStatus === status ? '#ffb800' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}>
                      {status}
                    </button>
                  ))}
                </div>
                {formData.webStatus !== 'None / Need New' && (
                  <input 
                    type="text" 
                    value={formData.webUrl} 
                    onChange={(e) => setFormData({ ...formData, webUrl: e.target.value })} 
                    placeholder="e.g., https://www.cummingsgroup.com"
                    style={{
                      width: '100%',
                      backgroundColor: '#080a0c',
                      border: '1px solid #1f242d',
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                )}
              </div>

              {/* Marketing Channels */}
              <div>
                <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Target Marketing & Communication Channels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SOCIAL_CHANNELS.map((ch) => {
                    const active = formData.selectedSocials.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleSocial(ch)}
                        style={{
                          padding: '6px 12px',
                          background: active ? '#1f242d' : '#080a0c',
                          border: active ? '1px solid #10b981' : '1px solid #1f242d',
                          color: active ? '#10b981' : '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}>
                        {active ? `✓ ${ch}` : `+ ${ch}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Mapped Modules */}
              <div>
                <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Auto-Mapped Relatable System Modules</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {formData.toolStack.map((tool, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#14171c',
                        border: '1px solid #1f242d',
                        color: '#C5BD9F',
                        fontSize: '10px'
                      }}>
                      ⚡ {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Color Wheel Palette */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>
                    Brand Identity Palette (Click swatch for Color Wheel)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSwatch}
                    style={{
                      background: 'rgba(255, 184, 0, 0.1)',
                      border: '1px solid #ffb800',
                      color: '#ffb800',
                      fontSize: '10px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontFamily: 'monospace'
                    }}>
                    + ADD SWATCH
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {formData.palette.map((item) => (
                    <div 
                      key={item.id} 
                      style={{ 
                        border: '1px solid #1f242d', 
                        padding: '8px', 
                        backgroundColor: '#080a0c',
                        position: 'relative'
                      }}>
                      {formData.palette.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSwatch(item.id)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '1px 4px',
                            zIndex: 2
                          }}>
                          ✕
                        </button>
                      )}

                      <label style={{ display: 'block', cursor: 'pointer', marginBottom: '6px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '28px', 
                          backgroundColor: item.hex, 
                          borderRadius: '2px', 
                          border: '1px solid #333' 
                        }} />
                        <input 
                          type="color" 
                          value={item.hex.startsWith('#') && item.hex.length === 7 ? item.hex : '#ffb800'} 
                          onChange={(e) => handleUpdateSwatch(item.id, 'hex', e.target.value)}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <input 
                        type="text" 
                        value={item.role} 
                        onChange={(e) => handleUpdateSwatch(item.id, 'role', e.target.value.toUpperCase())}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          marginBottom: '2px'
                        }}
                      />

                      <input 
                        type="text" 
                        value={item.hex} 
                        onChange={(e) => handleUpdateSwatch(item.id, 'hex', e.target.value)}
                        style={{
                          width: '100%',
                          background: '#0d0f12',
                          border: '1px solid #1f242d',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 4px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dossier Hopper */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>
                    Project Ground-Truth Dossier (Upload Reference Files)
                  </label>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>PDF, DOCX, TXT, MD, PNG</span>
                </div>

                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  backgroundColor: '#080a0c',
                  border: '1px dashed #1f242d',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: '#ffb800', fontSize: '11px', marginBottom: '4px' }}>
                    📁 CLICK OR DRAG REFERENCE FILES HERE
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                    Charters, Feeding Budgets, Brand Assets, Operational Specs
                  </span>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload}
                    style={{ display: 'none' }} 
                  />
                </label>

                {formData.uploadedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.uploadedFiles.map((file, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#14171c',
                        border: '1px solid #1f242d',
                        padding: '4px 10px',
                        fontSize: '11px'
                      }}>
                        <span style={{ color: '#10b981' }}>[{file.type}]</span>
                        <span style={{ color: '#fff', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '9px' }}>({file.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '0 2px'
                          }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 3: CONSTRAINTS, FINE-TUNING & DEFINITION OF DONE */}
          {step === 3 && (
            <>
              {/* Primary Objective & Fine-Tuning */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>
                    Primary Objective & Scope
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {formData.objective && (
                      <button
                        onClick={() => handleClearField('objective')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '10px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFocusedField(focusedField === 'objective' ? null : 'objective')}
                      style={{
                        background: 'transparent',
                        border: '1px solid #1f242d',
                        color: focusedField === 'objective' ? '#ffb800' : '#94a3b8',
                        fontSize: '10px',
                        padding: '2px 6px',
                        cursor: 'pointer'
                      }}>
                      {focusedField === 'objective' ? 'COMPACT' : '✏️ EXPAND'}
                    </button>
                    <button 
                      onClick={() => toggleDictation('objective')}
                      style={{
                        background: activeMicField === 'objective' && isListening ? '#ef4444' : '#1f242d',
                        color: activeMicField === 'objective' && isListening ? '#fff' : '#ffb800',
                        border: '1px solid #333',
                        fontSize: '10px',
                        padding: '2px 8px',
                        cursor: 'pointer'
                      }}>
                      {activeMicField === 'objective' && isListening ? '● RECORDING' : '🎙️ MIC'}
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={focusedField === 'objective' ? 6 : 2}
                  value={formData.objective} 
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })} 
                  placeholder="e.g., Deploy regional digital infrastructure, marketing funnel, and operational dashboard."
                  style={{
                    width: '100%',
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Dominant Metric */}
              <div>
                <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Dominant Metric (Master ROE Tier 1 Constraint)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {['Speed to Market', 'Cost Efficiency', 'Absolute Precision'].map((metric) => (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => setFormData({ ...formData, dominantMetric: metric })}
                      style={{
                        padding: '8px',
                        background: formData.dominantMetric === metric ? 'rgba(255, 184, 0, 0.15)' : '#080a0c',
                        border: formData.dominantMetric === metric ? '1px solid #ffb800' : '1px solid #1f242d',
                        color: formData.dominantMetric === metric ? '#ffb800' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}>
                      {metric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Definition of Done & Fine-Tuning */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>
                    Definition of Done (DoD)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {formData.definitionOfDone && (
                      <button
                        onClick={() => handleClearField('definitionOfDone')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '10px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFocusedField(focusedField === 'definitionOfDone' ? null : 'definitionOfDone')}
                      style={{
                        background: 'transparent',
                        border: '1px solid #1f242d',
                        color: focusedField === 'definitionOfDone' ? '#ffb800' : '#94a3b8',
                        fontSize: '10px',
                        padding: '2px 6px',
                        cursor: 'pointer'
                      }}>
                      {focusedField === 'definitionOfDone' ? 'COMPACT' : '✏️ EXPAND'}
                    </button>
                    <button 
                      onClick={() => toggleDictation('definitionOfDone')}
                      style={{
                        background: activeMicField === 'definitionOfDone' && isListening ? '#ef4444' : '#1f242d',
                        color: activeMicField === 'definitionOfDone' && isListening ? '#fff' : '#ffb800',
                        border: '1px solid #333',
                        fontSize: '10px',
                        padding: '2px 8px',
                        cursor: 'pointer'
                      }}>
                      {activeMicField === 'definitionOfDone' && isListening ? '● RECORDING' : '🎙️ MIC'}
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={focusedField === 'definitionOfDone' ? 6 : 2}
                  value={formData.definitionOfDone} 
                  onChange={(e) => setFormData({ ...formData, definitionOfDone: e.target.value })} 
                  placeholder="Specific tangible deliverables that constitute 100% completion."
                  style={{
                    width: '100%',
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Forbidden Vectors */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#C5BD9F', fontSize: '11px', textTransform: 'uppercase' }}>Forbidden Vectors / Guardrails</label>
                  <button 
                    onClick={() => toggleDictation('forbiddenVectors')}
                    style={{
                      background: activeMicField === 'forbiddenVectors' && isListening ? '#ef4444' : '#1f242d',
                      color: activeMicField === 'forbiddenVectors' && isListening ? '#fff' : '#ffb800',
                      border: '1px solid #333',
                      fontSize: '9px',
                      padding: '1px 6px',
                      cursor: 'pointer'
                    }}>
                    {activeMicField === 'forbiddenVectors' && isListening ? '● REC' : '🎙️ MIC'}
                  </button>
                </div>
                <input 
                  type="text" 
                  value={formData.forbiddenVectors} 
                  onChange={(e) => setFormData({ ...formData, forbiddenVectors: e.target.value })} 
                  placeholder="e.g., No public ad-spend without sign-off; no direct mutations to core database."
                  style={{
                    width: '100%',
                    backgroundColor: '#080a0c',
                    border: '1px solid #1f242d',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #1f242d',
          backgroundColor: '#14171c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{
                  background: 'transparent',
                  border: '1px solid #1f242d',
                  color: '#94a3b8',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                ← PREVIOUS
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                style={{
                  background: '#ffb800',
                  border: 'none',
                  color: '#080a0c',
                  fontWeight: 'bold',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                NEXT STAGE →
              </button>
            ) : (
              <>
                <button 
                  onClick={() => onSaveProject(formData)}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: '#080a0c',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                  REGISTER MANIFEST
                </button>
                <button 
                  onClick={handleTriggerWarRoom}
                  style={{
                    background: '#ffb800',
                    border: 'none',
                    color: '#080a0c',
                    fontWeight: 'bold',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                  PUSH TO WAR ROOM ⚡
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  Send, 
  Terminal, 
  Loader2, 
  Check, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

const DIRECTORS = [
  { id: 'JUSTIN // RISK LEGAL', name: '16 Justin', role: 'Risk Legal & Compliance', trait: 'CONTEXT' },
  { id: 'CHARLIE // CODE', name: '03 Charlie', role: 'MQL5 / Node Lead', trait: 'CODE' },
  { id: 'TESS // QUANT', name: '02 Tess', role: 'Quant Analyst', trait: 'REASONING' },
  { id: 'SILAS // DATABASE', name: '01 Silas', role: 'Obsidian & Telemetry', trait: 'CONTEXT' },
  { id: 'SKYLA // FRONTEND WEB', name: '04 Skyla', role: 'Frontend Architect', trait: 'CODE' },
  { id: 'ATLAS // INFRASTRUCTURE', name: '05 Atlas', role: 'Hardware & Metal', trait: 'CODE' },
  { id: 'ARES // EXECUTION', name: '07 Ares', role: 'Execution Desk', trait: 'REASONING' },
  { id: 'VANCE // FINANCE', name: '08 Vance', role: 'Treasury & Ledger', trait: 'REASONING' },
  { id: 'ORION // STRATEGIC INTEL', name: '09 Orion', role: 'Macro & Recon', trait: 'REASONING' },
  { id: 'THE ASKARI // SECURITY', name: '10 The Askari', role: 'Vault Security', trait: 'REASONING' },
  { id: 'AMBER // COPYWRITER', name: '11 Amber', role: 'Copy Lead', trait: 'CREATIVE' },
  { id: 'ROXY // ARTWORK ALPHA', name: '12 Roxy', role: 'Creative Director', trait: 'CREATIVE' },
  { id: 'JAX // ARTWORK OMEGA', name: '13 Jax', role: 'Visual Rendering', trait: 'CREATIVE' },
  { id: 'JACK // MARKETING', name: '06 Jack', role: 'Marketing & PRD', trait: 'CREATIVE' },
  { id: 'VALERIE // RELATIONS', name: '14 Valerie', role: 'Sub-Worker Relations', trait: 'CREATIVE' },
  { id: 'MAVERICK // SEO', name: '15 Maverick', role: 'Telemetry & SEO', trait: 'CONTEXT' }
];

export default function MontysBrainSidebar({ onDirectorSelected }) {
  const [tiersOpen, setTiersOpen] = useState(true);
  const [directorsOpen, setDirectorsOpen] = useState(true);
  
  const [tiers, setTiers] = useState([]);
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.3-70b-instruct');
  
  const [activeDirector, setActiveDirector] = useState(DIRECTORS[0]);
  const [chatLog, setChatLog] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8081/api/models/active')
      .then(res => res.json())
      .then(data => {
        if (data.tiers) setTiers(data.tiers);
      })
      .catch(err => console.error('[SIDEBAR FETCH ERROR]:', err));
  }, []);

  const handleSelectDirector = (director) => {
    setActiveDirector(director);
    setChatLog([]);
    if (onDirectorSelected) onDirectorSelected(director);
  };

  const handleSendToDirector = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const userPrompt = inputQuery.trim();
    setInputQuery('');
    
    const newHistory = [...chatLog, { sender: 'COMMANDER MIKE', text: userPrompt }];
    setChatLog(newHistory);
    setIsProcessing(true);

    try {
      const res = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          director: activeDirector.id,
          model: selectedModel,
          message: userPrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog([
          ...newHistory,
          { 
            sender: activeDirector.name, 
            text: data.reply, 
            model: data.activeModelUsed 
          }
        ]);
      }
    } catch (err) {
      setChatLog([
        ...newHistory,
        { sender: 'SYSTEM', text: `Failed to link to ${activeDirector.name}: ${err.message}` }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      width: '340px',
      height: '100%',
      backgroundColor: '#090b0e',
      borderRight: '1px solid #1a202c',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#e2e8f0',
      boxSizing: 'border-box'
    }}>

      {/* HEADER */}
      <div style={{
        padding: '12px 14px',
        backgroundColor: '#0e1218',
        borderBottom: '1px solid #1a202c',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BrainCircuit style={{ width: '16px', height: '16px', color: 'var(--gold-core, #eab308)' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--gold-core, #eab308)', letterSpacing: '1px' }}>
          MONTY'S BRAIN
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} className="custom-scrollbar">

        {/* 1. MODEL TIERS (COLLAPSIBLE) */}
        <div style={{ marginBottom: '12px', border: '1px solid #1a202c', borderRadius: '4px', backgroundColor: '#0d1016' }}>
          <div 
            onClick={() => setTiersOpen(!tiersOpen)}
            style={{
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: '#11151e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu style={{ width: '13px', height: '13px', color: 'var(--gold-core, #eab308)' }} />
              <span style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#cbd5e1' }}>MODEL CLUSTERS</span>
            </div>
            {tiersOpen ? <ChevronDown style={{ width: '12px', height: '12px' }} /> : <ChevronRight style={{ width: '12px', height: '12px' }} />}
          </div>

          {tiersOpen && (
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tiers.map((tier, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '0.60rem', color: '#64748b', fontWeight: 'bold', marginBottom: '3px' }}>
                    {tier.category}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {tier.models && tier.models.map(m => {
                      const isSelected = selectedModel === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          style={{
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.12)' : '#141822',
                            border: isSelected ? '1px solid var(--gold-core, #eab308)' : '1px solid #1e2532',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            fontSize: '0.64rem'
                          }}
                        >
                          <span style={{ color: isSelected ? 'var(--gold-core, #eab308)' : '#94a3b8' }}>
                            {m.name || m.id}
                          </span>
                          {isSelected && <Check style={{ width: '10px', height: '10px', color: 'var(--gold-core, #eab308)' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. 16 DIRECTOR AGENTS (COLLAPSIBLE) */}
        <div style={{ border: '1px solid #1a202c', borderRadius: '4px', backgroundColor: '#0d1016' }}>
          <div 
            onClick={() => setDirectorsOpen(!directorsOpen)}
            style={{
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: '#11151e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--emerald-core, #10b981)' }} />
              <span style={{ fontSize: '0.70rem', fontWeight: 'bold', color: '#cbd5e1' }}>DIRECTOR AGENTS (16)</span>
            </div>
            {directorsOpen ? <ChevronDown style={{ width: '12px', height: '12px' }} /> : <ChevronRight style={{ width: '12px', height: '12px' }} />}
          </div>

          {directorsOpen && (
            <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto' }} className="custom-scrollbar">
              {DIRECTORS.map(d => {
                const isSelected = activeDirector.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDirector(d)}
                    style={{
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? 'rgba(0, 255, 102, 0.08)' : '#121620',
                      border: isSelected ? '1px solid var(--emerald-core, #10b981)' : '1px solid #1a202c',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: isSelected ? 'var(--emerald-core, #10b981)' : '#cbd5e1' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#64748b' }}>
                        {d.role}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.54rem', border: '1px solid #2d3748', padding: '1px 4px', borderRadius: '2px', color: '#94a3b8' }}>
                      {d.trait}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 3. DIRECT AGENT COMMS CONSOLE */}
      <div style={{
        padding: '10px',
        borderTop: '1px solid #1a202c',
        backgroundColor: '#0c0f15',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
            CHANNEL: <strong style={{ color: 'var(--emerald-core, #10b981)' }}>{activeDirector.name}</strong>
          </span>
          <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
            {selectedModel.split('/').pop()}
          </span>
        </div>

        <div style={{
          height: '140px',
          overflowY: 'auto',
          backgroundColor: '#07080b',
          border: '1px solid #1a202c',
          borderRadius: '3px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '0.65rem'
        }} className="custom-scrollbar">
          {chatLog.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', marginTop: '40px' }}>
              Direct line open to {activeDirector.name}. Submit inquiries below.
            </div>
          ) : (
            chatLog.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  fontSize: '0.58rem', 
                  color: c.sender === 'COMMANDER MIKE' ? 'var(--gold-core, #eab308)' : 'var(--emerald-core, #10b981)',
                  fontWeight: 'bold'
                }}>
                  {c.sender}:
                </span>
                <span style={{ color: '#cbd5e1', lineHeight: '1.4' }}>{c.text}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendToDirector} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text"
            placeholder={`Ask ${activeDirector.name.split(' ')[1]} directly...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '6px 8px',
              backgroundColor: '#121620',
              border: '1px solid #1f2937',
              color: '#fff',
              fontSize: '0.68rem',
              borderRadius: '2px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputQuery.trim()}
            style={{
              padding: '0 10px',
              backgroundColor: isProcessing ? '#1a202c' : 'rgba(0, 255, 102, 0.15)',
              border: '1px solid var(--emerald-core, #10b981)',
              color: 'var(--emerald-core, #10b981)',
              borderRadius: '2px',
              cursor: isProcessing || !inputQuery.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} /> : <Send style={{ width: '12px', height: '12px' }} />}
          </button>
        </form>
      </div>

    </div>
  );
}
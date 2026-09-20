import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  Send, 
  Bot, 
  ShieldAlert, 
  Terminal, 
  Loader2, 
  Check, 
  Flame 
} from 'lucide-react';

const DIRECTORS = [
  { id: 'CHARLIE // CODE', name: '03 Charlie', role: 'MQL5 / Node Lead', trait: 'CODE' },
  { id: 'SKYLA // FRONTEND WEB', name: '04 Skyla', role: 'Frontend Architect', trait: 'CODE' },
  { id: 'ATLAS // INFRASTRUCTURE', name: '05 Atlas', role: 'Hardware & Metal', trait: 'CODE' },
  { id: 'TESS // QUANT', name: '02 Tess', role: 'Quant Analyst', trait: 'REASONING' },
  { id: 'ARES // EXECUTION', name: '07 Ares', role: 'Execution Desk', trait: 'REASONING' },
  { id: 'VANCE // FINANCE', name: '08 Vance', role: 'Treasury & Ledger', trait: 'REASONING' },
  { id: 'ORION // STRATEGIC INTEL', name: '09 Orion', role: 'Macro & Recon', trait: 'REASONING' },
  { id: 'THE ASKARI // SECURITY', name: '10 The Askari', role: 'Vault Security', trait: 'REASONING' },
  { id: 'AMBER // COPYWRITER', name: '11 Amber', role: 'Copy Lead', trait: 'CREATIVE' },
  { id: 'ROXY // ARTWORK ALPHA', name: '12 Roxy', role: 'Creative Director', trait: 'CREATIVE' },
  { id: 'JAX // ARTWORK OMEGA', name: '13 Jax', role: 'Visual Rendering', trait: 'CREATIVE' },
  { id: 'JACK // MARKETING', name: '06 Jack', role: 'Marketing & PRD', trait: 'CREATIVE' },
  { id: 'VALERIE // RELATIONS', name: '14 Valerie', role: 'Sub-Worker Relations', trait: 'CREATIVE' },
  { id: 'SILAS // DATABASE', name: '01 Silas', role: 'Obsidian & Telemetry', trait: 'CONTEXT' },
  { id: 'MAVERICK // SEO', name: '15 Maverick', role: 'Telemetry & SEO', trait: 'CONTEXT' },
  { id: 'JUSTIN // RISK LEGAL', name: '16 Justin', role: 'Legal & Compliance', trait: 'CONTEXT' }
];

export default function ExecControlPanel({ onModelSelect, onDirectorQueryComplete }) {
  // Model Tier Collapsible States
  const [tiers, setTiers] = useState([]);
  const [openTiers, setOpenTiers] = useState({ 0: true, 1: true, 2: true });
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.3-70b-instruct');

  // Director Direct-Query States
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [directorPrompt, setDirectorPrompt] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8081/api/models/active')
      .then(res => res.json())
      .then(data => {
        if (data.tiers) setTiers(data.tiers);
      })
      .catch(err => console.error('Failed to load active LLM tiers:', err));
  }, []);

  const toggleTier = (idx) => {
    setOpenTiers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSelectModel = (modelId) => {
    setSelectedModel(modelId);
    if (onModelSelect) onModelSelect(modelId);
  };

  const handleDirectQuery = async (e) => {
    e.preventDefault();
    if (!selectedDirector || !directorPrompt.trim() || isQuerying) return;

    setIsQuerying(true);
    setAgentResponse(null);

    try {
      const res = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          director: selectedDirector.id,
          model: selectedModel,
          message: directorPrompt.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAgentResponse(data);
        if (onDirectorQueryComplete) onDirectorQueryComplete(data);
      }
    } catch (err) {
      console.error('Failed to execute director query:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '320px',
      height: '100%',
      backgroundColor: '#0a0d12',
      borderRight: '1px solid #1a202c',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#e2e8f0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>

      {/* PANEL TITLE */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #1a202c',
        backgroundColor: '#0e1218',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal style={{ width: '15px', height: '15px', color: 'var(--gold-core, #eab308)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--gold-core, #eab308)', letterSpacing: '0.5px' }}>
            EXEC CONTROL MATRIX
          </span>
        </div>
        <span style={{ fontSize: '0.62rem', color: 'var(--emerald-core, #10b981)', border: '1px solid #1f2937', padding: '1px 5px', borderRadius: '2px' }}>
          PORT 8081
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">

        {/* ========================================================= */}
        {/* SECTION 1: LLM CLUSTER TIERS (COLLAPSIBLE)                */}
        {/* ========================================================= */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
            ACTIVE MODEL TIERS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tiers.map((tier, idx) => (
              <div key={idx} style={{
                backgroundColor: '#11151d',
                border: '1px solid #1e2532',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => toggleTier(idx)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#131822',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu style={{ width: '12px', height: '12px', color: 'var(--gold-core, #eab308)' }} />
                    <span>{tier.category}</span>
                  </div>
                  {openTiers[idx] ? <ChevronDown style={{ width: '12px', height: '12px' }} /> : <ChevronRight style={{ width: '12px', height: '12px' }} />}
                </button>

                {openTiers[idx] && (
                  <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tier.models && tier.models.map(m => {
                      const isSelected = selectedModel === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectModel(m.id)}
                          style={{
                            padding: '5px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.12)' : '#0d1016',
                            border: isSelected ? '1px solid var(--gold-core, #eab308)' : '1px solid #171d27',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          <span style={{ fontSize: '0.66rem', color: isSelected ? 'var(--gold-core, #eab308)' : '#94a3b8', fontWeight: isSelected ? 'bold' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.name || m.id}
                          </span>
                          {isSelected && <Check style={{ width: '11px', height: '11px', color: 'var(--gold-core, #eab308)' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: 16-DIRECTOR MATRIX                             */}
        {/* ========================================================= */}
        <div>
          <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
            16-DIRECTOR ACTIVE MATRIX
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {DIRECTORS.map(d => {
              const isSelected = selectedDirector && selectedDirector.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDirector(d)}
                  style={{
                    padding: '7px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? 'rgba(0, 255, 102, 0.08)' : '#11141b',
                    border: isSelected ? '1px solid var(--emerald-core, #10b981)' : '1px solid #1a202c',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: isSelected ? 'var(--emerald-core, #10b981)' : '#cbd5e1' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: '0.60rem', color: '#64748b', marginTop: '1px' }}>
                      {d.role}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.55rem',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    border: '1px solid #2d3748',
                    color: d.trait === 'CODE' ? '#38bdf8' : d.trait === 'REASONING' ? '#f59e0b' : d.trait === 'CONTEXT' ? '#a78bfa' : '#ec4899'
                  }}>
                    {d.trait}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* SECTION 3: DIRECT AGENT DISPATCH TERMINAL                 */}
      {/* ========================================================= */}
      <div style={{
        padding: '12px',
        backgroundColor: '#0d1117',
        borderTop: '1px solid #1a202c'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
            TARGET: <strong style={{ color: selectedDirector ? 'var(--emerald-core, #10b981)' : 'var(--ruby-core, #ef4444)' }}>
              {selectedDirector ? selectedDirector.name : 'SELECT DIRECTOR'}
            </strong>
          </span>
          <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
            {selectedModel.split('/').pop()}
          </span>
        </div>

        <form onSubmit={handleDirectQuery} style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder={selectedDirector ? `Query ${selectedDirector.name}...` : "Select agent above..."}
            disabled={!selectedDirector || isQuerying}
            value={directorPrompt}
            onChange={(e) => setDirectorPrompt(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              backgroundColor: '#131822',
              border: '1px solid #1f2937',
              borderRadius: '2px',
              color: '#fff',
              fontSize: '0.68rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={!selectedDirector || isQuerying || !directorPrompt.trim()}
            style={{
              padding: '0 10px',
              backgroundColor: isQuerying ? '#1e2532' : 'rgba(0, 255, 102, 0.15)',
              border: '1px solid var(--emerald-core, #10b981)',
              color: 'var(--emerald-core, #10b981)',
              borderRadius: '2px',
              cursor: (!selectedDirector || isQuerying || !directorPrompt.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isQuerying ? <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} /> : <Send style={{ width: '12px', height: '12px' }} />}
          </button>
        </form>

        {agentResponse && (
          <div style={{
            marginTop: '8px',
            maxHeight: '110px',
            overflowY: 'auto',
            padding: '6px',
            backgroundColor: '#090b0e',
            border: '1px solid #1e293b',
            borderRadius: '2px',
            fontSize: '0.62rem',
            color: '#cbd5e1',
            lineHeight: '1.4'
          }} className="custom-scrollbar">
            <div style={{ color: 'var(--gold-core, #eab308)', fontWeight: 'bold', marginBottom: '2px' }}>
              REPLY ({agentResponse.activeModelUsed || 'DIRECTOR'}):
            </div>
            {agentResponse.reply}
          </div>
        )}
      </div>

    </div>
  );
}
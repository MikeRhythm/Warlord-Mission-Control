import React, { useState, useEffect, useRef } from 'react';

const PALETTE = {
  obsidian: '#080a0c',
  panel: '#0d0f12',
  frame: '#14171c',
  wireBorder: '#1f242d',
  goldCore: '#ffb800',
  champagne: '#c5bd9f',
  slateMist: '#94a3b8',
  emerald: '#10b981',
  ruby: '#ef4444',
  canvasBg: '#050709',
};

const VIEWPORTS = {
  DESKTOP: { id: 'desktop', label: 'DESKTOP 1920', width: '100%', icon: '🖥' },
  TABLET: { id: 'tablet', label: 'TABLET 768', width: '768px', icon: '📱' },
  MOBILE: { id: 'mobile', label: 'MOBILE 375', width: '375px', icon: '📲' },
};

export default function Tab09Previews() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [rawContent, setRawContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const [displayMode, setDisplayMode] = useState('RENDER'); // 'RENDER' | 'SPLIT' | 'CODE'
  const [viewport, setViewport] = useState('DESKTOP');
  const [redlineModal, setRedlineModal] = useState(false);
  const [redlineNotes, setRedlineNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Button Hover States
  const [acceptHover, setAcceptHover] = useState(false);
  const [reviseHover, setReviseHover] = useState(false);

  const iframeRef = useRef(null);

  useEffect(() => {
    fetchManifest();
  }, []);

  const fetchManifest = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await fetch('http://localhost:8082/api/previews/list');
      if (!res.ok) throw new Error(`HTTP_${res.status}: Conduit offline`);
      const data = await res.json();
      
      const prjs = data.projects || [];
      const arts = data.artifacts || [];
      
      setProjects(prjs);
      
      let currentPrj = selectedProject;
      if (!currentPrj && prjs.length > 0) {
        currentPrj = prjs[0];
        setSelectedProject(currentPrj);
      }
      
      setArtifacts(arts);

      const matchingArts = arts.filter(a => a.project === currentPrj);
      if (matchingArts.length > 0) {
        loadContent(matchingArts[0]);
      } else {
        setSelectedArtifact(null);
        setRawContent('');
      }
    } catch (err) {
      setErrorStatus(`Conduit Bridge Unreachable (:8082) - ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (prjName) => {
    setSelectedProject(prjName);
    const matchingArts = artifacts.filter(a => a.project === prjName);
    if (matchingArts.length > 0) {
      loadContent(matchingArts[0]);
    } else {
      setSelectedArtifact(null);
      setRawContent('');
    }
  };

  const loadContent = async (art) => {
    setSelectedArtifact(art);
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await fetch(`http://localhost:8082/api/previews/content?path=${encodeURIComponent(art.path)}`);
      if (!res.ok) throw new Error(`HTTP_${res.status}: Failed reading disk artifact`);
      const text = await res.text();
      setRawContent(text);
    } catch (err) {
      setRawContent(`<!-- Pipeline Fault: ${err.message} -->`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setStatusMessage('SOURCE PAYLOAD BUFFERED TO CLIPBOARD');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const executeAccept = async () => {
    if (!selectedArtifact) {
      setStatusMessage('NO ARTIFACT SELECTED TO STAGE');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    try {
      const res = await fetch('http://localhost:8082/api/previews/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          project: selectedProject,
          artifactId: selectedArtifact.id,
          artifactPath: selectedArtifact.path,
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Ledger write failed');
      setStatusMessage('STAGE COMMITTED // GLOBAL_LEDGER.CSV UPDATED');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setStatusMessage(`LEDGER APPEND ERROR: ${err.message}`);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const executeRedline = async () => {
    if (!selectedArtifact) {
      setStatusMessage('NO ARTIFACT SELECTED TO REVISE');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (!redlineNotes.trim()) return;
    try {
      const res = await fetch('http://localhost:8082/api/previews/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVISE',
          project: selectedProject,
          artifactId: selectedArtifact.id,
          artifactPath: selectedArtifact.path,
          critique: redlineNotes,
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error('Feedback dispatch rejected');
      setRedlineModal(false);
      setRedlineNotes('');
      setStatusMessage('RED-LINE TELEMETRY DISPATCHED TO TAB 02 WAR ROOM');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setRedlineModal(false);
      setStatusMessage(`DISPATCH ERROR: ${err.message}`);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const filteredArtifacts = artifacts.filter(a => a.project === selectedProject);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: PALETTE.obsidian,
      color: PALETTE.champagne,
      fontFamily: 'Consolas, "Fira Code", monospace',
      overflow: 'hidden'
    }}>
      {/* COCKPIT CONTROL HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        borderBottom: `1px solid ${PALETTE.wireBorder}`,
        backgroundColor: PALETTE.panel
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            color: PALETTE.goldCore,
            fontWeight: 700,
            fontSize: 'clamp(0.74rem, 0.82vw, 0.94rem)',
            letterSpacing: '1px'
          }}>
            09 // ARTIFACT APPROVAL COCKPIT
          </span>
          <span style={{ color: PALETTE.wireBorder }}>|</span>
          <label style={{ fontSize: '11px', color: PALETTE.slateMist }}>PROJECT:</label>
          <select 
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            style={{
              backgroundColor: PALETTE.frame,
              color: PALETTE.champagne,
              border: `1px solid ${PALETTE.wireBorder}`,
              padding: '4px 10px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {projects.length === 0 ? (
              <option value="">NO PROJECTS FOUND</option>
            ) : (
              projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))
            )}
          </select>

          <button
            onClick={fetchManifest}
            title="Poll disk conduits for newly staged artifacts"
            style={{
              backgroundColor: 'transparent',
              color: PALETTE.champagne,
              border: `1px solid ${PALETTE.wireBorder}`,
              padding: '4px 10px',
              fontSize: '10px',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            SYNC CONDUIT
          </button>
        </div>

        {/* VIEWPORT SELECTORS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {Object.values(VIEWPORTS).map((vp) => (
            <button
              key={vp.id}
              onClick={() => setViewport(vp.id.toUpperCase())}
              style={{
                backgroundColor: viewport === vp.id.toUpperCase() ? PALETTE.frame : 'transparent',
                color: viewport === vp.id.toUpperCase() ? PALETTE.goldCore : PALETTE.slateMist,
                border: `1px solid ${viewport === vp.id.toUpperCase() ? PALETTE.goldCore : PALETTE.wireBorder}`,
                padding: '4px 9px',
                fontSize: '10px',
                cursor: 'pointer',
                letterSpacing: '0.5px'
              }}
            >
              {vp.icon} {vp.label}
            </button>
          ))}
        </div>

        {/* WORKSPACE PRESENTATION MODE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['RENDER', 'SPLIT', 'CODE'].map((mode) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              style={{
                backgroundColor: displayMode === mode ? PALETTE.frame : 'transparent',
                color: displayMode === mode ? PALETTE.champagne : PALETTE.slateMist,
                border: `1px solid ${displayMode === mode ? PALETTE.goldCore : PALETTE.wireBorder}`,
                padding: '4px 12px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.5px'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR TELEMETRY BANNER */}
      {errorStatus && (
        <div style={{
          padding: '6px 18px',
          backgroundColor: '#1a090b',
          borderBottom: `1px solid ${PALETTE.ruby}`,
          color: PALETTE.ruby,
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>▲ {errorStatus}</span>
          <button 
            onClick={fetchManifest}
            style={{
              background: 'transparent',
              border: `1px solid ${PALETTE.ruby}`,
              color: PALETTE.ruby,
              padding: '2px 8px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            RE-ENGAGE CONDUIT
          </button>
        </div>
      )}

      {/* SUCCESS NOTIFICATION BANNER */}
      {statusMessage && (
        <div style={{
          padding: '6px 18px',
          backgroundColor: '#0d1814',
          borderBottom: `1px solid ${PALETTE.emerald}`,
          color: PALETTE.emerald,
          fontSize: '11px',
          fontWeight: 600
        }}>
          ✓ {statusMessage}
        </div>
      )}

      {/* CORE WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT MANIFEST SIDEBAR */}
        <div style={{
          width: '280px',
          backgroundColor: PALETTE.panel,
          borderRight: `1px solid ${PALETTE.wireBorder}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '10px 14px',
            fontSize: '10px',
            color: PALETTE.slateMist,
            borderBottom: `1px solid ${PALETTE.wireBorder}`,
            letterSpacing: '1px'
          }}>
            STAGED ARTIFACTS ({filteredArtifacts.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredArtifacts.length === 0 ? (
              <div style={{ padding: '16px', fontSize: '11px', color: PALETTE.slateMist, lineHeight: '1.6' }}>
                No artifacts staged for <span style={{ color: PALETTE.goldCore }}>{selectedProject || 'selected project'}</span>.
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#556377' }}>
                  Deploy artifacts into Web_And_Social, Source_Artifacts, or previews.
                </div>
              </div>
            ) : (
              filteredArtifacts.map((art) => {
                const isSelected = selectedArtifact?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => loadContent(art)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${PALETTE.wireBorder}`,
                      backgroundColor: isSelected ? PALETTE.frame : 'transparent',
                      borderLeft: isSelected ? `3px solid ${PALETTE.goldCore}` : '3px solid transparent'
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isSelected ? PALETTE.goldCore : PALETTE.champagne,
                      marginBottom: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {art.name}
                    </div>
                    <div style={{ fontSize: '9px', color: PALETTE.slateMist, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: PALETTE.champagne }}>{art.category || art.type.toUpperCase()}</span>
                      <span>{art.timestamp || 'READY'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* EDITORIAL ACTION DECK - HIGH-LUMINANCE 3D HARDWARE SWITCHES */}
          <div style={{
            padding: '18px 14px',
            borderTop: `1px solid ${PALETTE.wireBorder}`,
            backgroundColor: '#0a0d12',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}>
            {/* 3D METALLIC EMERALD COMMIT SWITCH */}
            <button
              onClick={executeAccept}
              onMouseEnter={() => setAcceptHover(true)}
              onMouseLeave={() => setAcceptHover(false)}
              style={{
                position: 'relative',
                padding: '12px 16px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.4px',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.16s ease-in-out',
                color: acceptHover ? '#ffffff' : '#d1fae5',
                // High-Luminance Brushed Emerald / Jade Gradient Suite
                background: acceptHover
                  ? 'linear-gradient(180deg, #155e43 0%, #1f8560 45%, #136347 55%, #0b3d2b 100%)'
                  : 'linear-gradient(180deg, #0d4531 0%, #17684b 45%, #0f4d37 55%, #08291d 100%)',
                border: '1px solid #238a64',
                boxShadow: acceptHover
                  ? 'inset 0 1px 1px rgba(200, 255, 230, 0.75), inset 0 -1px 2px rgba(0, 0, 0, 0.9), 0 4px 18px rgba(16, 185, 129, 0.45), 0 2px 4px rgba(0, 0, 0, 0.9)'
                  : 'inset 0 1px 1px rgba(167, 243, 208, 0.55), inset 0 -1px 2px rgba(0, 0, 0, 0.85), 0 3px 12px rgba(0, 0, 0, 0.7)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.95), 0 0 10px rgba(16, 185, 129, 0.45)',
                transform: acceptHover ? 'translateY(-1px)' : 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: selectedArtifact ? '#10b981' : '#065f46',
                boxShadow: selectedArtifact
                  ? '0 0 8px #10b981, 0 0 14px #34d399'
                  : '0 0 3px rgba(16, 185, 129, 0.6)'
              }} />
              ACCEPT &amp; STAGE
            </button>

            {/* 3D METALLIC CRIMSON & MAROON REVISE SWITCH */}
            <button
              onClick={() => {
                if (!selectedArtifact) {
                  setStatusMessage('SELECT AN ARTIFACT FIRST TO RED-LINE');
                  setTimeout(() => setStatusMessage(''), 3000);
                  return;
                }
                setRedlineModal(true);
              }}
              onMouseEnter={() => setReviseHover(true)}
              onMouseLeave={() => setReviseHover(false)}
              style={{
                position: 'relative',
                padding: '12px 16px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.4px',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.16s ease-in-out',
                color: reviseHover ? '#ffffff' : '#ffd6da',
                // High-Luminance Brushed Maroon / Crimson Gradient Suite
                background: reviseHover
                  ? 'linear-gradient(180deg, #6e1f29 0%, #9e323e 45%, #6b1b24 55%, #420f15 100%)'
                  : 'linear-gradient(180deg, #52161e 0%, #7a2631 45%, #52161e 55%, #2e090f 100%)',
                border: '1px solid #993844',
                boxShadow: reviseHover
                  ? 'inset 0 1px 1px rgba(255, 200, 210, 0.75), inset 0 -1px 2px rgba(0, 0, 0, 0.9), 0 4px 18px rgba(239, 68, 68, 0.4), 0 2px 4px rgba(0, 0, 0, 0.9)'
                  : 'inset 0 1px 1px rgba(255, 180, 190, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.85), 0 3px 12px rgba(0, 0, 0, 0.7)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.95), 0 0 10px rgba(239, 68, 68, 0.45)',
                transform: reviseHover ? 'translateY(-1px)' : 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: selectedArtifact ? '#ff4d5a' : '#80262e',
                boxShadow: selectedArtifact
                  ? '0 0 8px #ef4444, 0 0 14px #ff4d5a'
                  : '0 0 3px rgba(128, 38, 46, 0.6)'
              }} />
              RED-LINE / REVISE
            </button>
          </div>
        </div>

        {/* WORKSPACE CANVAS */}
        <div style={{
          flex: 1,
          backgroundColor: PALETTE.canvasBg,
          display: 'flex',
          flexDirection: displayMode === 'SPLIT' ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '14px',
          gap: '12px'
        }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              fontSize: '10px',
              color: PALETTE.goldCore,
              zIndex: 10
            }}>
              [ CONDUIT INGESTING... ]
            </div>
          )}

          {/* SANDBOX RENDER FRAME */}
          {(displayMode === 'RENDER' || displayMode === 'SPLIT') && (
            <div style={{
              width: displayMode === 'SPLIT' ? '50%' : VIEWPORTS[viewport].width,
              height: '100%',
              maxWidth: '100%',
              backgroundColor: PALETTE.obsidian,
              border: `1px solid ${PALETTE.wireBorder}`,
              overflow: 'hidden',
              transition: 'width 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {selectedArtifact && rawContent ? (
                <iframe
                  ref={iframeRef}
                  title="MCNC Sandboxed Preview"
                  srcDoc={rawContent}
                  sandbox="allow-scripts allow-same-origin"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#080a0c'
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: '12px',
                  color: PALETTE.slateMist
                }}>
                  <div style={{
                    border: `1px solid ${PALETTE.wireBorder}`,
                    backgroundColor: PALETTE.panel,
                    padding: '24px 32px',
                    textAlign: 'center',
                    borderRadius: '2px'
                  }}>
                    <div style={{ color: PALETTE.goldCore, fontWeight: 700, fontSize: '13px', letterSpacing: '1px' }}>
                      [ NO ACTIVE ARTIFACT SELECTED ]
                    </div>
                    <p style={{ fontSize: '11px', color: PALETTE.champagne, margin: '8px 0 0 0' }}>
                      Select a staged artifact from the left manifest to preview live.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RAW CODE INSPECTOR */}
          {(displayMode === 'CODE' || displayMode === 'SPLIT') && (
            <div style={{
              width: displayMode === 'SPLIT' ? '50%' : '100%',
              height: '100%',
              backgroundColor: PALETTE.panel,
              border: `1px solid ${PALETTE.wireBorder}`,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 14px',
                borderBottom: `1px solid ${PALETTE.wireBorder}`,
                backgroundColor: PALETTE.frame
              }}>
                <span style={{ fontSize: '11px', color: PALETTE.goldCore }}>
                  SOURCE ARTIFACT // {selectedArtifact?.name || 'NONE'}
                </span>
                <button
                  onClick={copyToClipboard}
                  disabled={!rawContent}
                  style={{
                    backgroundColor: 'transparent',
                    color: selectedArtifact ? PALETTE.champagne : PALETTE.slateMist,
                    border: `1px solid ${PALETTE.wireBorder}`,
                    padding: '3px 8px',
                    fontSize: '10px',
                    cursor: selectedArtifact ? 'pointer' : 'not-allowed'
                  }}
                >
                  COPY RAW SOURCE
                </button>
              </div>
              <textarea
                readOnly
                value={rawContent || '// No source loaded.'}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: rawContent ? PALETTE.champagne : PALETTE.slateMist,
                  fontFamily: 'Consolas, "Fira Code", monospace',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  padding: '12px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  whiteSpace: 'pre'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* RED-LINE CRITIQUE MODAL */}
      {redlineModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(8, 10, 12, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            width: '560px',
            backgroundColor: PALETTE.panel,
            border: `1px solid ${PALETTE.ruby}`,
            padding: '20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.9)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: PALETTE.ruby, fontWeight: 700, fontSize: '12px', letterSpacing: '0.5px' }}>
                [ RED-LINE CRITIQUE // ROUTING TO TAB 02 WAR ROOM ]
              </span>
              <button
                onClick={() => setRedlineModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: PALETTE.slateMist,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '11px', color: PALETTE.slateMist, margin: '0 0 10px 0' }}>
              Target: <span style={{ color: PALETTE.champagne }}>{selectedArtifact?.name}</span> | Project: <span style={{ color: PALETTE.goldCore }}>{selectedProject}</span>
            </p>
            <textarea
              rows={6}
              value={redlineNotes}
              onChange={(e) => setRedlineNotes(e.target.value)}
              placeholder="State precise required revisions. Telemetry will route directly into the War Room incoming queue..."
              style={{
                width: '100%',
                backgroundColor: PALETTE.frame,
                border: `1px solid ${PALETTE.wireBorder}`,
                color: PALETTE.champagne,
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '10px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
                marginBottom: '14px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setRedlineModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${PALETTE.wireBorder}`,
                  color: PALETTE.slateMist,
                  padding: '6px 12px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={executeRedline}
                style={{
                  padding: '10px 18px',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  background: 'linear-gradient(180deg, #6e1f29 0%, #9e323e 45%, #420f15 100%)',
                  border: '1px solid #993844',
                  boxShadow: 'inset 0 1px 1px rgba(255, 200, 210, 0.75), 0 4px 14px rgba(239, 68, 68, 0.45)'
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
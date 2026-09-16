import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  FileText 
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';

export default function Tab13Docs({ ws }) {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [nicheFilter, setNicheFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Editor and Save States
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDomain, setEditedDomain] = useState('');
  const [editedNiche, setEditedNiche] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal / New Doc States
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newContent, setNewContent] = useState('');

  // Fetch all Vault markdown files from Base 1 daemon
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/docs');
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
        if (data.length > 0 && !selectedDoc) {
          handleSelectDoc(data[0]);
        } else if (selectedDoc) {
          const updated = data.find(d => d.filename === selectedDoc.filename);
          if (updated) {
            setSelectedDoc(updated);
            if (!isEditing) {
              setEditedContent(updated.content);
              setEditedTitle(updated.title || updated.filename);
              setEditedDomain(updated.domain || '');
              setEditedNiche(updated.niche || '');
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load Vault docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();

    // Listen for the custom event from Tab 12 Review
    const handleExternalPush = () => {
      console.log("External push detected. Refreshing vault...");
      fetchDocs();
    };

    window.addEventListener('MCNC_PUSH_TO_DOCS', handleExternalPush);
    return () => {
      window.removeEventListener('MCNC_PUSH_TO_DOCS', handleExternalPush);
    };
  }, []);

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setIsEditing(false);
    setEditedTitle(doc.title || doc.filename.replace('.md', ''));
    setEditedDomain(doc.domain || '');
    setEditedNiche(doc.niche || '');
    setEditedContent(doc.content || '');
  };

  // Commit updates to existing document
  const handleSaveExistingDoc = async () => {
    if (!selectedDoc) return;
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:8081/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedDoc.filename,
          title: editedTitle,
          domain: editedDomain,
          niche: editedNiche,
          content: editedContent
        })
      });
      if (res.ok) {
        setIsEditing(false);
        await fetchDocs();
      }
    } catch (err) {
      console.error('Failed to commit doc to disk:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new dossier in the Obsidian Vault
  const handleCreateNewDoc = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      const cleanFilename = newTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') + '.md';
      const res = await fetch('http://localhost:8081/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: cleanFilename,
          title: newTitle.trim(),
          domain: newDomain.trim() || 'General',
          niche: newNiche.trim() || 'Vault',
          content: newContent
        })
      });
      if (res.ok) {
        setShowNewDocModal(false);
        setNewTitle('');
        setNewDomain('');
        setNewNiche('');
        setNewContent('');
        await fetchDocs();
      }
    } catch (err) {
      console.error('Failed to create new doc:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Derive unique filters
  const domains = ['ALL', ...new Set(docs.map(d => d.domain).filter(Boolean))];
  const niches = ['ALL', ...new Set(docs.map(d => d.niche).filter(Boolean))];

  // Filtering logic
  const filteredDocs = docs.filter(doc => {
    const matchesDomain = domainFilter === 'ALL' || doc.domain === domainFilter;
    const matchesNiche = nicheFilter === 'ALL' || doc.niche === nicheFilter;
    const matchesSearch = 
      (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.filename && doc.filename.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDomain && matchesNiche && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '16px', boxSizing: 'border-box', gap: '14px', backgroundColor: '#090b0e', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--wire-border)', paddingBottom: '12px' }}>
        <div>
          <div style={{ color: 'var(--gold-core)', fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            13 DOCS // THE OBSIDIAN VAULT & KNOWLEDGE STUDY
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-mist)', marginTop: '4px' }}>
            Live Filesystem Telemetry • Distilled Intelligence • Active Base 1 Repositories
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fetchDocs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#12151b',
              border: '1px solid var(--wire-border)',
              color: 'var(--gold-core)',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} style={{ width: '13px', height: '13px' }} />
            <span>REFRESH DISK</span>
          </button>

          <button 
            onClick={() => setShowNewDocModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(0, 255, 102, 0.1)',
              border: '1px solid var(--emerald-core)',
              color: 'var(--emerald-core)',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
          >
            <PlusCircle style={{ width: '13px', height: '13px' }} />
            <span>+ NEW DOC</span>
          </button>

          <div style={{ padding: '4px 10px', border: '1px solid #1f242e', backgroundColor: '#101318', borderRadius: '3px', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--text-mist)' }}>ARCHIVE CAPACITY: </span>
            <span style={{ color: 'var(--gold-core)', fontWeight: 'bold' }}>{docs.length} LIVE DOSSIERS</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>1. KNOWLEDGE DOMAIN</label>
          <select 
            value={domainFilter} 
            onChange={(e) => setDomainFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
          >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>2. SUBJECT / NICHE</label>
          <select 
            value={nicheFilter} 
            onChange={(e) => setNicheFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
          >
            {niches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>QUICK SEARCH ACROSS VAULT</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '8px', width: '13px', height: '13px', color: 'var(--text-mist)' }} />
            <input 
              type="text" 
              placeholder="Search vectors, filenames, models, ROEs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 10px 6px 30px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px', flex: 1, minHeight: 0 }}>
        
        {/* SIDEBAR DOSSIER LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid var(--wire-border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--wire-border)', backgroundColor: '#11141a' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold-core)', fontWeight: 'bold' }}>
              AVAILABLE DOSSIERS ({filteredDocs.length})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
            {filteredDocs.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-mist)', padding: '16px', textAlign: 'center' }}>
                No matching files found.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc && selectedDoc.filename === doc.filename;
                return (
                  <div
                    key={doc.filename}
                    onClick={() => handleSelectDoc(doc)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--emerald-core)' : '1px solid #1a1e27',
                      backgroundColor: isSelected ? 'rgba(0, 255, 102, 0.05)' : '#101319',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--emerald-core)' : '#fff', fontWeight: 'bold' }}>
                        {doc.title || doc.filename.replace('.md', '')}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-mist)', marginTop: '2px' }}>
                        {doc.domain || 'Vault'} &gt; {doc.niche || 'General'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--gold-core)', border: '1px solid #2a313d', padding: '2px 5px', borderRadius: '2px' }}>
                      MD
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN DOSSIER VIEWER & EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid var(--wire-border)', borderRadius: '4px', overflow: 'hidden' }}>
          {selectedDoc ? (
            <>
              {/* DOSSIER CONTROL STRIP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--wire-border)', backgroundColor: '#11141a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText style={{ width: '14px', height: '14px', color: 'var(--gold-core)' }} />
                  <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    {isEditing ? editedTitle : (selectedDoc.title || selectedDoc.filename)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-mist)' }}>
                    DOMAIN: <span style={{ color: 'var(--gold-core)' }}>{selectedDoc.domain || 'Unassigned'}</span>
                    {' • '}
                    NICHE: <span style={{ color: 'var(--gold-core)' }}>{selectedDoc.niche || 'Unassigned'}</span>
                  </div>

                  <span style={{ fontSize: '0.68rem', color: 'var(--emerald-core)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} /> AUTHENTIC FILE
                  </span>

                  {/* TACTICAL SPEAKER BUTTON */}
                  <SpeakerBtn text={selectedDoc.content} label="READ DOSSIER" />

                  {/* EDIT / SAVE CONTROLS */}
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={handleSaveExistingDoc}
                        disabled={isSaving}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          backgroundColor: 'rgba(0, 255, 102, 0.15)',
                          border: '1px solid var(--emerald-core)',
                          color: 'var(--emerald-core)',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          borderRadius: '3px'
                        }}
                      >
                        {isSaving ? <Loader2 className="animate-spin" style={{ width: '11px', height: '11px' }} /> : <Save style={{ width: '11px', height: '11px' }} />}
                        <span>{isSaving ? 'COMMITTING TO DISK...' : 'SAVE CHANGES'}</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          backgroundColor: '#161a22',
                          border: '1px solid var(--wire-border)',
                          color: 'var(--ruby-core)',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          borderRadius: '3px'
                        }}
                      >
                        <X style={{ width: '11px', height: '11px' }} />
                        <span>CANCEL</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        backgroundColor: '#161a22',
                        border: '1px solid var(--wire-border)',
                        color: 'var(--gold-core)',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                    >
                      <Edit3 style={{ width: '11px', height: '11px' }} />
                      <span>EDIT FILE</span>
                    </button>
                  )}
                </div>
              </div>

              {/* DOSSIER BODY (PREVIEW OR IN-PLACE EDITOR) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Document Title"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
                      />
                      <input 
                        type="text" 
                        value={editedDomain}
                        onChange={(e) => setEditedDomain(e.target.value)}
                        placeholder="Domain"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
                      />
                      <input 
                        type="text" 
                        value={editedNiche}
                        onChange={(e) => setEditedNiche(e.target.value)}
                        placeholder="Niche"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
                      />
                    </div>
                    <textarea 
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      style={{ 
                        flex: 1, 
                        width: '100%', 
                        minHeight: '380px', 
                        padding: '12px', 
                        backgroundColor: '#101318', 
                        border: '1px solid var(--wire-border)', 
                        color: '#cbd5e1', 
                        fontSize: '0.78rem', 
                        fontFamily: "'JetBrains Mono', monospace", 
                        borderRadius: '3px', 
                        resize: 'none', 
                        boxSizing: 'border-box' 
                      }}
                    />
                  </div>
                ) : (
                  <pre style={{ 
                    fontFamily: "'JetBrains Mono', monospace", 
                    fontSize: '0.78rem', 
                    color: '#cbd5e1', 
                    lineHeight: '1.6', 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word', 
                    margin: 0 
                  }}>
                    {selectedDoc.content}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-mist)', fontSize: '0.78rem' }}>
              Select a dossier from the sidebar repository to view its contents.
            </div>
          )}
        </div>

      </div>

      {/* NEW DOSSIER MODAL */}
      {showNewDocModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '600px',
            backgroundColor: '#0d1015',
            border: '1px solid var(--wire-border)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--wire-border)', backgroundColor: '#11141a' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold-core)', fontWeight: 'bold' }}>
                INITIALIZE NEW VAULT DOSSIER
              </span>
              <button 
                onClick={() => setShowNewDocModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-mist)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>DOSSIER TITLE</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rhythm V8 Option Triggers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>DOMAIN</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Quantitative Finance"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>NICHE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MQL5 Architecture"
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-mist)', display: 'block', marginBottom: '4px' }}>DOSSIER CONTENT (MARKDOWN)</label>
                <textarea 
                  rows={8}
                  placeholder="# System Specifications&#10;Distilled intelligence notes..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid var(--wire-border)', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewDocModal(false)}
                  style={{ padding: '6px 12px', backgroundColor: '#161a22', border: '1px solid var(--wire-border)', color: '#cbd5e1', fontSize: '0.72rem', cursor: 'pointer', borderRadius: '3px' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '6px 14px', 
                    backgroundColor: 'rgba(0, 255, 102, 0.15)', 
                    border: '1px solid var(--emerald-core)', 
                    color: 'var(--emerald-core)', 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    borderRadius: '3px' 
                  }}
                >
                  {isSaving ? <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} /> : <Save style={{ width: '12px', height: '12px' }} />}
                  <span>{isSaving ? 'COMMITTING TO DISK...' : 'COMMIT NEW DOSSIER'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
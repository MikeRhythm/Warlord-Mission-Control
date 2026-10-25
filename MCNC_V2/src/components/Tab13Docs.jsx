import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  RefreshCw, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  FileText,
  Copy,
  Mic,
  Send,
  Calendar,
  Zap,
  Wand2
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
  const [isReverting, setIsReverting] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);

  // Modal / New Doc States
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isModalRecording, setIsModalRecording] = useState(false);

  // To-Do Prompter States
  const [todoInput, setTodoInput] = useState('');
  const [isTodoRecording, setIsTodoRecording] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Speech Recognition Refs
  const modalRecognitionRef = useRef(null);
  const todoRecognitionRef = useRef(null);

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
          const updated = data.find(d => d.path.toLowerCase() === selectedDoc.path.toLowerCase());
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

    const handleExternalPush = () => {
      fetchDocs();
    };

    window.addEventListener('MCNC_PUSH_TO_DOCS', handleExternalPush);
    return () => {
      window.removeEventListener('MCNC_PUSH_TO_DOCS', handleExternalPush);
      if (modalRecognitionRef.current) modalRecognitionRef.current.abort();
      if (todoRecognitionRef.current) todoRecognitionRef.current.abort();
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

  const handleCopyDocContent = () => {
    if (!selectedDoc || !selectedDoc.content) return;
    navigator.clipboard.writeText(selectedDoc.content);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  // Reconstitute archived thread back into 01 Exec active chat ledger
  const handleRevertToExec = async () => {
    if (!selectedDoc) return;
    setIsReverting(true);

    try {
      const response = await fetch('http://localhost:8082/api/chats/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: selectedDoc.path,
          content: selectedDoc.content,
          project: selectedDoc.domain,
          filename: selectedDoc.filename
        })
      });

      const data = await response.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent('MCNC_REVERT_CHAT', { detail: data }));
        await fetchDocs();
      } else {
        alert(`Revert failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to revert chat to 01 Exec:', err);
    } finally {
      setIsReverting(false);
    }
  };

  // Consolidate Master Ledger via Server Pipeline
  const handleConsolidateMaster = async () => {
    if (!selectedDoc || !selectedDoc.path) return;
    setIsConsolidating(true);

    try {
      const response = await fetch('http://localhost:8082/api/docs/consolidate-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: selectedDoc.domain,
          filePath: selectedDoc.path,
          content: selectedDoc.content
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchDocs();
      } else {
        alert(`Consolidation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to consolidate master chat:', err);
    } finally {
      setIsConsolidating(false);
    }
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
          filePath: selectedDoc.path,
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
    if (e) e.preventDefault();
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
        if (modalRecognitionRef.current) modalRecognitionRef.current.abort();
        setIsModalRecording(false);
        await fetchDocs();
      }
    } catch (err) {
      console.error('Failed to create new doc:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Speech Recognition for New Doc Modal
  const toggleModalMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    if (isModalRecording) {
      if (modalRecognitionRef.current) modalRecognitionRef.current.stop();
      setIsModalRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setNewContent((prev) => {
            const spacer = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            return prev + spacer + event.results[i][0].transcript;
          });
        }
      }
    };

    recognition.onerror = () => setIsModalRecording(false);
    recognition.onend = () => setIsModalRecording(false);

    modalRecognitionRef.current = recognition;
    recognition.start();
    setIsModalRecording(true);
  };

  // Speech Recognition for To-Do Quick Prompter
  const toggleTodoMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    if (isTodoRecording) {
      if (todoRecognitionRef.current) todoRecognitionRef.current.stop();
      setIsTodoRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setTodoInput((prev) => {
            const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + spacer + event.results[i][0].transcript;
          });
        }
      }
    };

    recognition.onerror = () => setIsTodoRecording(false);
    recognition.onend = () => setIsTodoRecording(false);

    todoRecognitionRef.current = recognition;
    recognition.start();
    setIsTodoRecording(true);
  };

  const getTodayDateHeading = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleAddTodoItem = async () => {
    if (!todoInput.trim() || !selectedDoc) return;
    setIsAddingTodo(true);

    const todayHeading = getTodayDateHeading();
    let currentBody = selectedDoc.content || '';
    const cleanItem = todoInput.trim().replace(/^[•\-\*]\s*/, '');
    const formattedBullet = `• ${cleanItem}`;

    let updatedContent = '';
    if (currentBody.includes(todayHeading)) {
      const dateIndex = currentBody.indexOf(todayHeading);
      const afterDate = currentBody.slice(dateIndex);
      const nextDateMatch = afterDate.slice(todayHeading.length).search(/\n\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i);

      if (nextDateMatch !== -1) {
        const insertPos = dateIndex + todayHeading.length + nextDateMatch;
        updatedContent = currentBody.slice(0, insertPos).trimEnd() + '\n' + formattedBullet + '\n\n' + currentBody.slice(insertPos).trimStart();
      } else {
        updatedContent = currentBody.trimEnd() + '\n' + formattedBullet;
      }
    } else {
      const newSection = `\n\n${todayHeading}\n${formattedBullet}`;
      updatedContent = currentBody.trim() ? `${currentBody.trim()}${newSection}` : `${todayHeading}\n${formattedBullet}`;
    }

    try {
      const res = await fetch('http://localhost:8081/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: selectedDoc.path,
          filename: selectedDoc.filename,
          title: selectedDoc.title || selectedDoc.filename.replace('.md', ''),
          domain: selectedDoc.domain || 'Vault',
          niche: selectedDoc.niche || 'General',
          content: updatedContent
        })
      });

      if (res.ok) {
        setTodoInput('');
        if (isTodoRecording && todoRecognitionRef.current) {
          todoRecognitionRef.current.stop();
          setIsTodoRecording(false);
        }
        await fetchDocs();
      }
    } catch (err) {
      console.error('Failed to append todo item:', err);
    } finally {
      setIsAddingTodo(false);
    }
  };

  const isCurrentDocTodo = selectedDoc && (
    selectedDoc.filename.toLowerCase().includes('todo') || 
    (selectedDoc.title && selectedDoc.title.toLowerCase().includes('todo'))
  );

  // Accurate check for archived thread
  const isArchivedThread = selectedDoc && (
    (selectedDoc.content && selectedDoc.content.toLowerCase().includes('# archived thread:')) ||
    (selectedDoc.title && selectedDoc.title.toLowerCase().includes('archived thread')) ||
    (selectedDoc.filename && selectedDoc.filename.toLowerCase().startsWith('chat_'))
  );

  // Accurate check for project master ledger
  const isMasterLedger = selectedDoc && (
    selectedDoc.filename.toLowerCase() === 'master_chat.md' ||
    (selectedDoc.title && selectedDoc.title.toLowerCase().includes('master chat ledger'))
  );

  // Unique Domains List
  const domains = useMemo(() => {
    const list = Array.from(new Set(docs.map(d => (d.domain || '').trim()).filter(Boolean)));
    return ['ALL', ...list];
  }, [docs]);

  // Contextual Niches List (strictly scoped to active domain)
  const niches = useMemo(() => {
    const targetDomain = domainFilter.trim().toLowerCase();
    const relevant = targetDomain === 'all'
      ? docs 
      : docs.filter(d => (d.domain || '').trim().toLowerCase() === targetDomain);
    const list = Array.from(new Set(relevant.map(d => (d.niche || '').trim()).filter(Boolean)));
    return ['ALL', ...list];
  }, [docs, domainFilter]);

  // Strict Filtering Logic: Domain and Niche matches are enforced
  const filteredDocs = useMemo(() => {
    const cleanDomain = domainFilter.trim().toLowerCase();
    const cleanNiche = nicheFilter.trim().toLowerCase();
    const query = searchTerm.trim().toLowerCase();

    return docs.filter(doc => {
      const docDomain = (doc.domain || '').trim().toLowerCase();
      const docNiche = (doc.niche || '').trim().toLowerCase();

      const matchesDomain = cleanDomain === 'all' || docDomain === cleanDomain;
      const matchesNiche = cleanNiche === 'all' || docNiche === cleanNiche;

      const matchesSearch = !query || 
        (doc.title && doc.title.toLowerCase().includes(query)) ||
        (doc.content && doc.content.toLowerCase().includes(query)) ||
        (doc.filename && doc.filename.toLowerCase().includes(query));

      return matchesDomain && matchesNiche && matchesSearch;
    });
  }, [docs, domainFilter, nicheFilter, searchTerm]);

  // Handle Domain Switch
  const handleDomainFilterChange = (newDomain) => {
    setDomainFilter(newDomain);
    setNicheFilter('ALL');

    const cleanDomain = newDomain.trim().toLowerCase();
    const matched = docs.filter(d => cleanDomain === 'all' || (d.domain || '').trim().toLowerCase() === cleanDomain);
    if (matched.length > 0) {
      handleSelectDoc(matched[0]);
    }
  };

  // Handle Niche Switch
  const handleNicheFilterChange = (newNiche) => {
    setNicheFilter(newNiche);

    const cleanDomain = domainFilter.trim().toLowerCase();
    const cleanNiche = newNiche.trim().toLowerCase();
    const matched = docs.filter(d => {
      const matchDom = cleanDomain === 'all' || (d.domain || '').trim().toLowerCase() === cleanDomain;
      const matchNic = cleanNiche === 'all' || (d.niche || '').trim().toLowerCase() === cleanNiche;
      return matchDom && matchNic;
    });
    if (matched.length > 0) {
      handleSelectDoc(matched[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '16px', boxSizing: 'border-box', gap: '14px', backgroundColor: '#090b0e', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1f242d', paddingBottom: '12px' }}>
        <div>
          <div style={{ color: '#DAA520', fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>13 DOCS // THE OBSIDIAN VAULT & KNOWLEDGE STUDY</span>
            {/* Quiet Metallic Status Dot */}
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#475569', display: 'inline-block' }} title="Vault link nominal"></span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
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
              border: '1px solid #1f242d',
              color: '#DAA520',
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
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
          >
            <PlusCircle style={{ width: '13px', height: '13px' }} />
            <span>+ NEW DOC</span>
          </button>

          <div style={{ padding: '4px 10px', border: '1px solid #1f242d', backgroundColor: '#101318', borderRadius: '3px', fontSize: '0.7rem' }}>
            <span style={{ color: '#64748b' }}>ARCHIVE CAPACITY: </span>
            <span style={{ color: '#DAA520', fontWeight: 'bold' }}>{docs.length} LIVE DOSSIERS</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>1. KNOWLEDGE DOMAIN</label>
          <select 
            value={domainFilter} 
            onChange={(e) => handleDomainFilterChange(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', outline: 'none' }}
          >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>2. SUBJECT / NICHE</label>
          <select 
            value={nicheFilter} 
            onChange={(e) => handleNicheFilterChange(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', outline: 'none' }}
          >
            {niches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>QUICK SEARCH ACROSS VAULT</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '8px', width: '13px', height: '13px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search vectors, filenames, models, ROEs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 10px 6px 30px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px', flex: 1, minHeight: 0 }}>
        
        {/* SIDEBAR DOSSIER LIST (STRICTLY SCOPED) */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid #1f242d', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #1f242d', backgroundColor: '#11141a' }}>
            <span style={{ fontSize: '0.72rem', color: '#DAA520', fontWeight: 'bold' }}>
              AVAILABLE DOSSIERS ({filteredDocs.length})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
            {filteredDocs.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: '#64748b', padding: '16px', textAlign: 'center' }}>
                No dossiers registered under this scope.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc && selectedDoc.path.toLowerCase() === doc.path.toLowerCase();
                return (
                  <div
                    key={doc.path}
                    onClick={() => handleSelectDoc(doc)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '6px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #10b981' : '1px solid #1a1e27',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.05)' : '#101319',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ overflow: 'hidden', paddingRight: '6px' }}>
                      <div style={{ fontSize: '0.78rem', color: isSelected ? '#10b981' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title || doc.filename.replace('.md', '')}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                        {doc.domain} &gt; {doc.niche}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#DAA520', border: '1px solid #2a313d', padding: '2px 5px', borderRadius: '2px', shrink: 0 }}>
                      MD
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN DOSSIER VIEWER & EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0d1015', border: '1px solid #1f242d', borderRadius: '4px', overflow: 'hidden' }}>
          {selectedDoc ? (
            <>
              {/* DOSSIER CONTROL STRIP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #1f242d', backgroundColor: '#11141a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', paddingRight: '10px' }}>
                  <FileText style={{ width: '14px', height: '14px', color: '#DAA520', flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isEditing ? editedTitle : (selectedDoc.title || selectedDoc.filename)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    DOMAIN: <span style={{ color: '#DAA520' }}>{selectedDoc.domain}</span>
                    {' • '}
                    NICHE: <span style={{ color: '#DAA520' }}>{selectedDoc.niche}</span>
                  </div>

                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} /> AUTHENTIC FILE
                  </span>

                  {/* CONSOLIDATE & CLEANUP BUTTON (MOUNTED ON MASTER CHATS) */}
                  {isMasterLedger && (
                    <button
                      onClick={handleConsolidateMaster}
                      disabled={isConsolidating}
                      title="Run fluff-stripping SOP pass and categorize according to Project Mission"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        backgroundColor: '#161a22',
                        border: '1px solid #DAA520',
                        color: '#DAA520',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: isConsolidating ? 'not-allowed' : 'pointer',
                        borderRadius: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isConsolidating ? <Loader2 className="animate-spin" style={{ width: '11px', height: '11px' }} /> : <Wand2 style={{ width: '11px', height: '11px', strokeWidth: 3 }} />}
                      <span>{isConsolidating ? 'CONSOLIDATING...' : '✨ CONSOLIDATE & CLEANUP'}</span>
                    </button>
                  )}

                  {/* REVERT TO 01 EXEC BUTTON (MOUNTED ON ARCHIVED THREADS) */}
                  {isArchivedThread && (
                    <button
                      onClick={handleRevertToExec}
                      disabled={isReverting}
                      title="Reconstitute thread back into 01 Exec active chat ledger"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        backgroundColor: '#161a22',
                        border: '1px solid #eab308',
                        color: '#facc15',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        cursor: isReverting ? 'not-allowed' : 'pointer',
                        borderRadius: '3px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isReverting ? <Loader2 className="animate-spin" style={{ width: '11px', height: '11px' }} /> : <Zap style={{ width: '11px', height: '11px', fill: '#facc15' }} />}
                      <span>{isReverting ? 'RESTORING...' : '⚡ REVERT TO 01 EXEC'}</span>
                    </button>
                  )}

                  <SpeakerBtn text={selectedDoc.content} label="READ DOSSIER" />

                  <button
                    onClick={handleCopyDocContent}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      backgroundColor: '#161a22',
                      border: copiedDoc ? '1px solid #10b981' : '1px solid #1f242d',
                      color: copiedDoc ? '#10b981' : '#cbd5e1',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Copy style={{ width: '11px', height: '11px' }} />
                    <span>{copiedDoc ? '✓ COPIED' : 'COPY'}</span>
                  </button>

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
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10b981',
                          color: '#10b981',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          borderRadius: '3px'
                        }}
                      >
                        {isSaving ? <Loader2 className="animate-spin" style={{ width: '11px', height: '11px' }} /> : <Save style={{ width: '11px', height: '11px' }} />}
                        <span>{isSaving ? 'COMMITTING...' : 'SAVE CHANGES'}</span>
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
                          border: '1px solid #1f242d',
                          color: '#ef4444',
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
                        border: '1px solid #1f242d',
                        color: '#DAA520',
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

              {/* TO-DO LIST QUICK PROMPTER */}
              {isCurrentDocTodo && !isEditing && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#0c0f14',
                  borderBottom: '1px solid #1f242d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#DAA520', fontWeight: 'bold' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    <span>TODAY ({getTodayDateHeading()}):</span>
                  </div>

                  <input 
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTodoItem();
                    }}
                    placeholder={isTodoRecording ? 'Listening for todo task...' : 'Enter new task bullet (auto-stamps today\'s date)...'}
                    style={{
                      flex: 1,
                      backgroundColor: '#12161f',
                      border: isTodoRecording ? '1px solid #ef4444' : '1px solid #1f242d',
                      color: '#e2e8f0',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      borderRadius: '3px',
                      outline: 'none',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  />

                  <button
                    type="button"
                    onClick={toggleTodoMic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      backgroundColor: isTodoRecording ? '#2b0d0d' : '#161a22',
                      border: isTodoRecording ? '1px solid #ef4444' : '1px solid #1f242d',
                      color: isTodoRecording ? '#ef4444' : '#DAA520',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    <Mic style={{ width: '11px', height: '11px' }} />
                    <span>{isTodoRecording ? 'STOP' : 'MIC'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddTodoItem}
                    disabled={isAddingTodo || !todoInput.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      opacity: (!todoInput.trim() || isAddingTodo) ? 0.5 : 1
                    }}
                  >
                    {isAddingTodo ? <Loader2 className="animate-spin" style={{ width: '11px', height: '11px' }} /> : <Send style={{ width: '11px', height: '11px' }} />}
                    <span>ADD ITEM</span>
                  </button>
                </div>
              )}

              {/* DOSSIER BODY */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Document Title"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
                      />
                      <input 
                        type="text" 
                        value={editedDomain}
                        onChange={(e) => setEditedDomain(e.target.value)}
                        placeholder="Domain"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
                      />
                      <input 
                        type="text" 
                        value={editedNiche}
                        onChange={(e) => setEditedNiche(e.target.value)}
                        placeholder="Niche"
                        style={{ padding: '6px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px' }}
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
                        border: '1px solid #1f242d', 
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.78rem' }}>
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
            border: '1px solid #1f242d',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1f242d', backgroundColor: '#11141a' }}>
              <span style={{ fontSize: '0.85rem', color: '#DAA520', fontWeight: 'bold' }}>
                INITIALIZE NEW VAULT DOSSIER
              </span>
              <button 
                onClick={() => {
                  if (modalRecognitionRef.current) modalRecognitionRef.current.abort();
                  setIsModalRecording(false);
                  setShowNewDocModal(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>DOSSIER TITLE</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rhythm V8 Option Triggers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>DOMAIN</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Quantitative Finance"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>NICHE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MQL5 Architecture"
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', backgroundColor: '#101318', border: '1px solid #1f242d', color: '#fff', fontSize: '0.75rem', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: '#64748b' }}>DOSSIER CONTENT (MARKDOWN)</label>
                  <button
                    type="button"
                    onClick={toggleModalMic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      backgroundColor: isModalRecording ? '#2b0d0d' : '#161a22',
                      border: isModalRecording ? '1px solid #ef4444' : '1px solid #1f242d',
                      color: isModalRecording ? '#ef4444' : '#DAA520',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    <Mic style={{ width: '10px', height: '10px' }} />
                    <span>{isModalRecording ? 'REC [STOP]' : 'MIC DICTATE'}</span>
                  </button>
                </div>
                <textarea 
                  rows={8}
                  placeholder={isModalRecording ? 'Listening... dictating markdown text...' : '# System Specifications\nDistilled intelligence notes...'}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 10px', 
                    backgroundColor: '#101318', 
                    border: isModalRecording ? '1px solid #ef4444' : '1px solid #1f242d', 
                    color: '#fff', 
                    fontSize: '0.75rem', 
                    borderRadius: '3px', 
                    boxSizing: 'border-box', 
                    fontFamily: "'JetBrains Mono', monospace" 
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (modalRecognitionRef.current) modalRecognitionRef.current.abort();
                    setIsModalRecording(false);
                    setShowNewDocModal(false);
                  }}
                  style={{ padding: '6px 12px', backgroundColor: '#161a22', border: '1px solid #1f242d', color: '#cbd5e1', fontSize: '0.72rem', cursor: 'pointer', borderRadius: '3px' }}
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
                    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                    border: '1px solid #10b981', 
                    color: '#10b981', 
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
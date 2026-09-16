import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speakAgentResponse } from '../utils/ttsSpeaker';

export default function SpeakerBtn({ text, label = 'LISTEN' }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Reset state if unmounted or speech ends naturally
    const handleEnd = () => setSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('end', handleEnd);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('end', handleEnd);
      }
    };
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!text || !text.trim()) return;

    window.speechSynthesis.cancel();
    setSpeaking(true);
    speakAgentResponse(text);

    // Watch for when Chrome finishes uttering
    const checkTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        clearInterval(checkTimer);
      }
    }, 250);
  };

  return (
    <button
      onClick={handleClick}
      title={speaking ? "Stop Audio" : "Read dossier aloud"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '3px',
        fontSize: '0.68rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 'bold',
        cursor: 'pointer',
        border: speaking ? '1px solid var(--ruby-core)' : '1px solid var(--wire-border)',
        backgroundColor: speaking ? 'rgba(255, 59, 48, 0.15)' : '#12151a',
        color: speaking ? 'var(--ruby-core)' : 'var(--gold-core)',
        transition: 'all 0.15s ease'
      }}
    >
      {speaking ? (
        <>
          <Square style={{ width: '10px', height: '10px', fill: 'currentColor' }} />
          <span>STOP</span>
        </>
      ) : (
        <>
          <Volume2 style={{ width: '12px', height: '12px' }} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
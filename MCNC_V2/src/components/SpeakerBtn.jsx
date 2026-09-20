import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speakAgentResponse } from '../utils/ttsSpeaker';

export default function SpeakerBtn({ text, agent = null, label = 'LISTEN' }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
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

    // If agent is not explicitly passed, deduce it from text or fallback to Monty
    let targetAgent = agent;
    if (!targetAgent) {
      const lower = text.toLowerCase();
      if (lower.includes('roxy')) targetAgent = 'Roxy';
      else if (lower.includes('valerie') || lower.includes('valery')) targetAgent = 'Valerie';
      else if (lower.includes('jaz') || lower.includes('jasmine')) targetAgent = 'Jaz';
      else if (lower.includes('tess')) targetAgent = 'Tess';
      else if (lower.includes('amber')) targetAgent = 'Amber';
      else if (lower.includes('charlie')) targetAgent = 'Charlie';
      else targetAgent = 'Monty';
    }

    speakAgentResponse(text, targetAgent);

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
      title={speaking ? "Stop Audio" : "Read aloud"}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
        speaking
          ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]'
          : 'bg-[#14171c] text-[#ffb800] border border-[#ffb800]/40 hover:bg-[#ffb800]/10'
      }`}
    >
      {speaking ? (
        <>
          <Square className="w-2.5 h-2.5 fill-current" />
          <span>STOP</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
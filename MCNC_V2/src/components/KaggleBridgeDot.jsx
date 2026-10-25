import React, { useState, useEffect } from 'react';

/**
 * KaggleBridgeDot
 * 
 * Rules:
 * 1. ZERO network checks or timers if selectedModel is NOT in Tier 4 (Kaggle).
 * 2. When dormant: renders NOTHING (or completely invisible).
 * 3. When active: single tiny 6px Metal Rust dot (#8C3A27) with NO baby blue.
 */
export default function KaggleBridgeDot({ selectedModel = '', port = 8081 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // STRICT CHECK: Only alive if an LLM with 'KAGGLE' in the ID is chosen
  const isKaggleSelected = Boolean(
    selectedModel && selectedModel.toUpperCase().startsWith('KAGGLE')
  );

  useEffect(() => {
    // If NOT using a Kaggle LLM, do absolutely nothing. Kill everything.
    if (!isKaggleSelected) {
      setIsOpen(false);
      setIsPinging(false);
      return;
    }

    let isMounted = true;

    // Single handshake check only upon selecting the model
    const testChannel = async () => {
      setIsPinging(true);
      try {
        const res = await fetch(`http://localhost:${port}/api/kaggle/status`, {
          signal: AbortSignal.timeout(1500)
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setIsOpen(Boolean(data.active || data.online || data.status === 'ACTIVE'));
        }
      } catch (err) {
        if (isMounted) setIsOpen(false);
      } finally {
        if (isMounted) {
          setTimeout(() => setIsPinging(false), 400);
        }
      }
    };

    testChannel();

    return () => {
      isMounted = false;
    };
  }, [isKaggleSelected, selectedModel, port]);

  // Completely invisible when using Local, NIM, Groq, or OpenRouter models
  if (!isKaggleSelected) {
    return null;
  }

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#0b0e14] border border-[#1f242d] ml-1.5"
      title={isOpen ? "Kaggle T4 Channel Verified" : "Kaggle T4 Channel Standby"}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {/* Faint Metal Rust pulse - only while handshaking */}
        {isPinging && (
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ backgroundColor: '#8C3A27' }}
          />
        )}
        {/* Solid tiny pinhead dot */}
        <span 
          className="relative inline-flex rounded-full"
          style={{ 
            width: '6px', 
            height: '6px', 
            backgroundColor: isOpen ? '#8C3A27' : '#3d1c15',
            boxShadow: isOpen ? '0 0 3px #8C3A27' : 'none'
          }}
        />
      </span>
      <span 
        style={{ 
          fontSize: '9px', 
          color: '#8C3A27', 
          fontFamily: 'monospace',
          fontWeight: 'bold',
          letterSpacing: '0.05em' 
        }}
      >
        KGL
      </span>
    </div>
  );
}
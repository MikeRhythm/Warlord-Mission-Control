import React from 'react';

export default function McncSpinner({ 
  label = 'NEURAL CLUSTER BUSY // EXECUTING DIRECTIVE SEQUENCE', 
  subtext = '16-DIRECTOR MATRIX ROUTING TELEMETRY // BASE 1 ACTIVE' 
}) {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      
      {/* TACTICAL DEAD-CENTER HUD CARD */}
      <div className="pointer-events-auto bg-[#0d0f12]/95 border-2 border-[#ffb800] rounded-lg p-6 shadow-[0_0_50px_rgba(255,184,0,0.35)] flex flex-col items-center gap-4 min-w-[460px] font-mono select-none">
        
        {/* RADAR TARGET LOCK */}
        <div className="relative flex items-center justify-center w-16 h-16 bg-[#14171c] rounded-full border border-[#ffb800]/50 shadow-[0_0_20px_rgba(255,184,0,0.3)]">
          {/* Pulsing Outer Rings */}
          <span className="absolute w-16 h-16 rounded-full border-2 border-[#ffb800]/40 animate-ping" style={{ animationDuration: '1.6s' }} />
          <span className="absolute w-12 h-12 rounded-full border border-[#ffb800]/70 animate-pulse" />
          
          {/* Core Target Lock Dot */}
          <span className="absolute w-3.5 h-3.5 rounded-full bg-[#ffb800] shadow-[0_0_15px_#ffb800]" />
          
          {/* Fast Sweep Needle */}
          <div 
            className="absolute w-16 h-16 rounded-full border-t-2 border-r-2 border-[#ffb800] animate-spin" 
            style={{ animationDuration: '0.8s' }} 
          />
        </div>

        {/* STATUS READOUT */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="text-sm font-black tracking-widest text-[#ffb800] flex items-center gap-2">
            <span>{label}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ffb800] animate-ping" />
          </div>
          <div className="text-xs text-[#8fa0b5] tracking-wider font-bold">
            <span className="text-[#38bdf8]">● TELEMETRY STREAM</span>
            <span className="mx-2 text-[#5c6b7f]">|</span>
            <span>{subtext}</span>
          </div>
        </div>

        {/* METRICS & LOCK STATUS BAR */}
        <div className="w-full flex items-center justify-between border-t border-[#1f242d] pt-3 mt-1">
          {/* Signal Indicator */}
          <div className="flex items-end gap-1 h-5 px-2 py-1 bg-[#101317] border border-[#232832] rounded">
            <span className="w-1 bg-[#ffb800] rounded-sm animate-pulse h-2" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-[#ffb800] rounded-sm animate-pulse h-4" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 bg-[#ffb800] rounded-sm animate-pulse h-5" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-[#ffb800] rounded-sm animate-pulse h-3" style={{ animationDelay: '0.4s' }} />
            <span className="w-1 bg-[#ffb800] rounded-sm animate-pulse h-4" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="text-[10px] text-[#10b981] font-black tracking-widest">
            CLUSTER: 16-DIRECTOR ONLINE
          </div>

          <div className="px-2.5 py-1 bg-[#ffb800] text-black rounded text-[10px] font-black tracking-wider shadow-[0_0_8px_rgba(255,184,0,0.5)]">
            BUSY_LOCK
          </div>
        </div>

      </div>

    </div>
  );
}
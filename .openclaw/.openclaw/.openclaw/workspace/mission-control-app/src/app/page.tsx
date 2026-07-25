"use client";

import React, { useState, useEffect } from "react";

export default function MissionControl() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getStatusClass = (status) => {
    if (status === "Scanning" || status === "Active") {
      return `text-[10px] font-bold px-2.5 py-0.5 rounded-sm border bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 animate-pulse`;
    } else if (status === "Armed") {
      return `text-[10px] font-bold px-2.5 py-0.5 rounded-sm border bg-[#DAA520]/10 text-[#DAA520] border-[#DAA520]/20`;
    } else {
      return `text-[10px] font-bold px-2.5 py-0.5 rounded-sm border border-[#334155]/20 text-[#94A3B8] border-[#334155]/30`;
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] font-mono flex flex-col overflow-hidden select-none">
        {/* Top Specular Glass Banner */}
        <header className="bg-[#12161F] border-b border-[#334155]/40 px-6 py-4 flex justify-between items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div>
            <h1 className="text-[#E2E8F0] font-bold tracking-widest text-lg">RHYTHM NERVE CENTER</h1>
            <p className="text-[#94A3B8] text-xs mt-1">SYSTEM STATE: LOCALHOST // BASE 1</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-[#DAA520]/10 text-[#DAA520] border border-[#DAA520]/30 px-3 py-1 rounded-sm uppercase tracking-wider font-bold">
              Monty: Chief of Staff Active
            </span>
            <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-3 py-1 rounded-sm uppercase tracking-wider font-bold animate-pulse">
              Gateway Active
            </span>
          </div>
        </header>

        {/* Central Divider Wire */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#DAA520]/40 to-transparent w-full" />

        {/* Dashboard Body Space */}
        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden h-[calc(100vh-75px)] bg-gradient-to-b from-[#0A0C10] to-[#06070A]">

          {/* LEFT COLUMN: System Infrastructure & Controls */}
          <section className="col-span-4 flex flex-col gap-6 overflow-y-auto h-full pr-1">

            {/* Gateway Status Module */}
            <div className="bg-[#12161F] border border-[#334155]/40 rounded-sm p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <h2 className="text-[#DAA520] text-xs font-bold tracking-widest mb-4 uppercase border-b border-[#334155]/20 pb-2">Gateway Routing Status</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#334155]/10 pb-1.5">
                  <span className="text-[#94A3B8]">Runtime Gateway:</span>
                  <span className="text-[#E2E8F0] font-bold">OpenClaw v2026.6.2</span>
                </div>
                <div className="flex justify-between border-b border-[#334155]/10 pb-1.5">
                  <span className="text-[#94A3B8]">Local Loopback:</span>
                  <span className="text-[#E2E8F0]">127.0.0.1:18789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Strategic Registry:</span>
                  <span className="text-[#DAA520] font-bold">Nvidia NIM External Matrix</span>
                </div>
              </div>
            </div>

            {/* Dynamic Skill Workshop Trigger Panel */}
            <div className="bg-[#12161F] border border-[#334155]/40 rounded-sm p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <h2 className="text-[#DAA520] text-xs font-bold tracking-widest mb-4 uppercase border-b border-[#334155]/20 pb-2">Skill Workshop Control</h2>
              <p className="text-[#94A3B8] text-[11px] mb-4 leading-relaxed">Deploy and provisions automated backend workers directly from the central boardroom matrix.</p>
              <button className="w-full bg-[#DAA520]/10 hover:bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 hover:border-[#DAA520] transition-all duration-200 py-2 px-4 rounded-sm text-xs font-bold tracking-wider uppercase shadow-md">
                Initialize Skill Workshop Protocols
              </button>
            </div>

            {/* Director Fleet Allocations */}
            <div className="bg-[#12161F] border border-[#334155]/40 rounded-sm p-5 flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <h2 className="text-[#DAA520] text-xs font-bold tracking-widest mb-4 uppercase border-b border-[#334155]/20 pb-2">Director Fleet Allocation</h2>
              <div className="space-y-3 text-xs">
                <div className="bg-[#0A0C10] p-3 border border-[#334155]/30 rounded-sm flex justify-between items-center shadow-inner">
                  <div>
                    <div className="text-[#E2E8F0] font-bold">Charlie</div>
                    <div className="text-[#7A8A80] text-[10px] mt-0.5">Coding Lead (MQL5 / Python)</div>
                  </div>
                  <span className={getStatusClass("Idle")}>IDLE</span>
                </div>
                <div className="bg-[#0A0C10] p-3 border border-[#334155]/30 rounded-sm flex justify-between items-center shadow-inner">
                  <div>
                    <div className="text-[#E2E8F0] font-bold">Tess</div>
                    <div className="text-[#7AVOID"text-[10px] mt-0.5">Quant Analyst (Volatility Scan)</div>
                  </div>
                  <span className={getStatusClass("Scanning")}>SCANNING</span>
                </div>
                <div className="bg-[#0A0C10] p-3 border border-[#334155]/30 rounded-sm flex justify-between items-center shadow-inner">
                  <div>
                    <div className="text-[#E2E8F0] font-bold">Roxy</div>
                    <div className="text-[#7A8A80] text-[10px] mt-0.5">UI/UX & Branding Master</div>
                  </div>
                  <span className={getStatusClass("Active")}>ACTIVE</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Live Cascades & Telemetry */}
          <section className="col-span-8 flex flex-col gap-6 overflow-hidden h-full">

            {/* Live Execution Stream */}
            <div className="bg-[#12161F] border border-[#334155]/40 rounded-sm p-5 flex-1 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="flex justify-between items-center mb-3 border-b border-[#334155]/20 pb-2">
                <h2 className="text-[#DAA520] text-xs font-bold tracking-widest uppercase">Live Execution Trace</h2>
                <span className="text-[10px] text-[#10B981] font-bold tracking-wider animate-pulse">● STREAMING LIVE</span>
              </div>
              <div className="flex-1 bg-[#0A0C10] p-4 border border-[#334155]/40 rounded-sm font-mono text-xs overflow-y-auto space-y-2 text-[#94A3B8] shadow-inner">
                <p className="text-[#10B981]"><span className="opacity-50">[21:55:02]</span> SUCCESS DuckDuckGo plugin execution complete.</p>
                <p className="text-[#E2E8F0]"><span className="opacity-50">[21:55:03]</span> DATA Springboks tracking schema compiled successfully.</p>
                <p className="text-[#DAA520]"><span className="opacity-50">[22:05:14]</span> WARN Gateway session payload intercept active.</p>
                <p className="text-[#7A8A80]"><span className="opacity-50">[22:12:00]</span> READY Profile Omega visual parameters locked in memory.</p>
                <p className="text-[#DAA520] font-bold"><span className="opacity-50">[23:08:02]</span> READY Theme matrix synchronization locked via HI_FINANCE_PALETTE_MASTER.md</p>
              </div>
            </div>

            {/* Cron Module Scheduler */}
            <div className="bg-[#12161F] border border-[#334155]/40 rounded-sm p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <h2 className="text-[#DAA520] text-xs font-bold tracking-widest mb-4 uppercase border-b border-[#334155]/20 pb-2">Cron Module Scheduler</h2>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-12 text-[#94A3B8] text-[10px] font-bold uppercase border-b border-[#334155]/30 pb-2 tracking-wider">
                  <div className="col-span-5">Job Identifier</div>
                  <div className="col-span-5">Target Script</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="grid grid-cols-12 text-[#F8FAFC] py-2 items-center border-b border-[#334155]/10">
                  <div className="col-span-5 font-bold tracking-wide">CRON_VOL_SCAN_01</div>
                  <div className="col-span-5 text-[#7A8A80]">volatility_matrix.py</div>
                  <div className="col-span-2 text-right"><span className="text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-sm font-bold text-[10px]">ACTIVE</span></div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Activity,
  Zap,
  ShieldCheck,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CandlestickChart from './components/CandlestickChart';

const Dashboard = () => {
  const [probability, setProbability] = useState(65);
  const [direction, setDirection] = useState('CALL');
  const [activeModule, setActiveModule] = useState(0);

  // Simulated live probability drift
  useEffect(() => {
    const interval = setInterval(() => {
      setProbability(prev => {
        const drift = Math.floor(Math.random() * 5) - 2;
        const next = Math.min(Math.max(prev + drift, 45), 92);
        if (next > 75) setDirection('CALL');
        else if (next < 55) setDirection('PUT');
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      title: "Basics: What are Options?",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-400">What are Options?</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            An option is a contract that gives you the <span className="text-white font-bold">right</span>, but not the obligation, to buy or sell an asset at a specific price on or before a certain date.
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 gap-2 flex flex-col">
            <li><span className="text-emerald-400 font-bold">CALL Option</span>: Betting that the price will go <span className="uppercase italic">up</span>.</li>
            <li><span className="text-rose-400 font-bold">PUT Option</span>: Betting that the price will go <span className="uppercase italic">down</span>.</li>
          </ul>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl mt-4">
            <p className="text-xs italic text-slate-500">Think of it like an insurance policy or a reservation at a restaurant—you pay a small fee (Premium) for a future opportunity.</p>
          </div>
        </div>
      )
    },
    {
      title: "Understanding Probabilities",
      icon: <ShieldCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-400">Understanding Probabilities</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The signal ring on the right isn't a crystal ball—it's a <span className="text-white font-bold">statistical engine</span>. It calculates the likelihood of a price movement based on three key factors:
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] uppercase font-black text-blue-400">Volatility</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] uppercase font-black text-purple-400">Momentum</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
              <span className="text-[10px] uppercase font-black text-yellow-400">Volume</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic mt-2">
            A score above 75% indicates "High Conviction"—where these three factors align in one direction.
          </p>
        </div>
      )
    },
    {
      title: "The CALL/PUT Mechanics",
      icon: <Activity className="w-5 h-5" />,
      content: <p className="text-sm text-slate-400">Coming soon: How strike prices and premiums interact...</p>
    },
    {
      title: "Risk Management",
      icon: <Zap className="w-5 h-5" />,
      content: <p className="text-sm text-slate-400">Coming soon: Protecting your capital with proper sizing...</p>
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#030712] text-slate-100 p-6 gap-6 font-sans overflow-hidden">

      {/* Sidebar: Educational Modules */}
      <aside className="w-80 perspex-glass p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <BarChart3 className="text-blue-400 w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">TradeOptions.edu</h1>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Learning Path</p>
          <nav className="flex flex-col gap-2">
            {modules.map((m, i) => (
              <button
                key={i}
                onClick={() => setActiveModule(i)}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${activeModule === i
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                  : 'hover:bg-white/5 text-slate-400'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {m.icon}
                  <span className="font-medium text-sm">{m.title}</span>
                </div>
                {activeModule === i && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-yellow-500">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Pro Tip</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            High probability signals (&gt;75%) are often found in consolidation breakouts. Watch the Bollinger Bands.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6">

        {/* Top Bar: Stats */}
        <header className="h-24 perspex-glass px-8 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Asset Pairing</p>
              <h2 className="text-lg font-bold">BTC / USD</h2>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Session Volume</p>
              <h2 className="text-lg font-bold">$1.24B</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-500">NETWORK STABLE</span>
            </div>
          </div>
        </header>

        {/* Center: Chart + Signals */}
        <div className="flex-1 flex gap-6 min-h-0">

          {/* Chart Shell (Placeholder for Lightweight Charts) */}
          <div className="flex-1 perspex-glass overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/2">
              <div className="flex gap-2">
                {['1m', '5m', '15m', '1H'].map(t => (
                  <button key={t} className="px-3 py-1 bg-white/5 rounded-md text-[10px] font-bold hover:bg-white/10 transition">{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 relative bg-[#060b18]">
              <CandlestickChart />
            </div>

            {/* Educational Overlay / Module Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-64 perspex-glass p-8 flex flex-col gap-4 bg-blue-500/5 mt-auto"
              >
                {modules[activeModule].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Probability Engine */}
          <div className="w-96 flex flex-col gap-6">

            {/* Probability Block */}
            <div className="perspex-glass p-8 flex flex-col items-center justify-center gap-6 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Signal Probability</p>

              <div className="relative">
                {/* Visual Ring */}
                <svg className="w-48 h-48 -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                  <motion.circle
                    cx="96" cy="96" r="88"
                    stroke={direction === 'CALL' ? '#10b981' : '#ef4444'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="553"
                    animate={{ strokeDashoffset: 553 - (553 * probability / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={probability}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-black"
                  >
                    {probability}%
                  </motion.span>
                  <span className={`${direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'} text-xs font-bold tracking-widest`}>
                    {direction} STRENGTH
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-white/10" />

              <div className="grid grid-cols-2 w-full gap-4">
                <button className={`btn-call py-4 rounded-xl flex flex-col items-center gap-1 ${probability > 75 && direction === 'CALL' ? 'glow animate-plasma' : ''}`}>
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase">Call Signal</span>
                </button>
                <button className={`btn-put py-4 rounded-xl flex flex-col items-center gap-1 ${probability > 75 && direction === 'PUT' ? 'glow animate-plasma' : ''}`}>
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase">Put Signal</span>
                </button>
              </div>
            </div>

            {/* Signal Details */}
            <div className="perspex-glass p-6 h-40">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Market Sentiment</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">RSI (14)</span>
                  <span className="text-emerald-400">Bullish (68.2)</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">MACD</span>
                  <span className="text-rose-400">Convergence Avoided</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return <Dashboard />;
}

export default App;

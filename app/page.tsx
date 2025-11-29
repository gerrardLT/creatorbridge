'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

function Marquee({ children, direction = 'left' }: { children: React.ReactNode; direction?: 'left' | 'right' }) {
  return (
    <div className="relative flex overflow-hidden group mask-linear-fade">
      <div className={`flex min-w-full shrink-0 items-center justify-around gap-12 py-4 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`}>
        {children}
        {children}
      </div>
      <div className={`absolute top-0 flex min-w-full shrink-0 items-center justify-around gap-12 py-4 ${direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'}`} aria-hidden="true">
        {children}
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen opacity-60 animate-pulse-glow"
          style={{ transform: `translate(${offsetY * 0.05}px, ${offsetY * 0.05}px)` }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-20%] w-[800px] h-[800px] bg-fuchsia-900/10 rounded-full blur-[100px] mix-blend-screen opacity-50"
          style={{ transform: `translate(${-offsetY * 0.05}px, ${-offsetY * 0.05}px)` }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md animate-slideDown shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Protocol v1.0 Live</span>
          </div>

          <h1 className="text-6xl md:text-[7rem] font-bold tracking-tighter mb-8 leading-[0.9] perspective-container">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600 animate-fadeInUp neon-text-shadow">
              Monetize
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 animate-fadeInUp neon-text-shadow" style={{ animationDelay: '0.2s' }}>
              Intelligence
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            The programmable IP layer for the <span className="text-white font-medium border-b border-white/20">Agentic Economy</span>. Register assets, set liquid terms, and earn yield automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <Link 
              href="/explore"
              className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg transition-all duration-300 overflow-hidden active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
              <span className="relative flex items-center z-10 group-hover:text-white transition-colors">
                Explore Market <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </Link>
            <Link 
              href="/create"
              className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 active:scale-95 hover:border-white/30 text-center"
            >
              Start Creating
            </Link>
          </div>
        </div>

        {/* 3D Moving Ticker */}
        <div className="perspective-container w-full mb-32 overflow-hidden pointer-events-none">
          <div className="perspective-element bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-y border-white/5 backdrop-blur-sm py-4">
            <Marquee>
              {["STORY PROTOCOL INTEGRATED", "PROGRAMMABLE IP LICENSING", "AI AGENT NATIVE", "CROSS-CHAIN SETTLEMENT", "VERIFIABLE OWNERSHIP"].map((text, i) => (
                <span key={i} className="text-zinc-500 font-bold tracking-[0.2em] text-sm flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rotate-45 mr-6 shadow-[0_0_10px_#6366f1]" /> 
                  {text}
                </span>
              ))}
            </Marquee>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[340px]">
            {/* Card 1: Liquid IP */}
            <div className="md:col-span-7 row-span-1 md:row-span-2 group relative rounded-[2.5rem] bg-zinc-900/40 border border-white/10 overflow-hidden transition-all duration-500 grid-card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-screen pointer-events-none" />
              
              <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                <div className="max-w-md">
                   <div className="mb-8 w-16 h-16 relative">
                      <div className="absolute inset-0 border-2 border-indigo-400/30 rounded-full animate-[spin_10s_linear_infinite]" />
                      <div className="absolute inset-2 border-2 border-purple-400/50 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                      </div>
                   </div>
                   <h3 className="text-5xl font-bold mb-6 text-white leading-tight">Liquid IP<br/>Infrastructure</h3>
                   <p className="text-zinc-400 text-lg leading-relaxed">
                     Transform static assets into programmable liquidity. Agents discover, negotiate, and license your work in milliseconds.
                   </p>
                </div>
                <div className="absolute right-0 bottom-0 md:w-1/2 h-full flex items-end justify-end p-8 pointer-events-none opacity-50 md:opacity-100">
                   <div className="relative w-full h-64 flex items-end gap-2">
                      {[40, 70, 50, 90, 60, 80].map((h, i) => (
                        <div key={i} className="w-full bg-gradient-to-t from-indigo-600/80 to-purple-600/20 rounded-t-lg backdrop-blur-sm border-t border-white/20 transition-all duration-700 group-hover:to-purple-400/40" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }} />
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Card 2: Provenance */}
            <div className="md:col-span-5 row-span-1 group relative rounded-[2.5rem] bg-zinc-900/40 border border-white/10 overflow-hidden transition-all duration-500 grid-card-hover">
               <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent" />
               <div className="p-10 h-full flex flex-col relative z-10">
                 <div className="flex justify-between items-start mb-auto">
                   <div className="relative w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute w-full h-[1px] bg-emerald-400/50 top-1/2 animate-[ping_2s_linear_infinite]"></div>
                      <div className="w-6 h-8 border-2 border-emerald-400 rounded-sm"></div>
                   </div>
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                     <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                   </div>
                 </div>
                 <h3 className="text-3xl font-bold mb-3">On-Chain<br/>Provenance</h3>
                 <p className="text-zinc-400">Immutable registry on Story Protocol ensures attribution is never lost.</p>
               </div>
            </div>

            {/* Card 3: Instant Settlement */}
            <div className="md:col-span-5 row-span-1 group relative rounded-[2.5rem] bg-zinc-900/40 border border-white/10 overflow-hidden transition-all duration-500 grid-card-hover">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-10 h-full flex flex-col justify-center relative z-10">
                 <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-amber-400 border-r-amber-400 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                      <span className="text-amber-400 font-bold text-xl -rotate-45">⚡</span>
                    </div>
                    <div>
                      <span className="text-4xl font-bold font-mono text-white tracking-tighter block">0.2s</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-widest">Latency</span>
                    </div>
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Instant Settlement</h3>
                 <p className="text-zinc-400 text-sm">Smart contracts handle royalty splits and licensing rights instantly.</p>
               </div>
            </div>

            {/* Card 4: Agent Network */}
            <div className="md:col-span-12 md:row-span-1 group relative rounded-[2.5rem] bg-zinc-900/40 border border-white/10 overflow-hidden transition-all duration-500 flex flex-col md:flex-row items-center grid-card-hover">
               <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 via-transparent to-transparent" />
               <div className="p-12 flex-1 relative z-10">
                 <div className="flex space-x-1 mb-6">
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '75ms' }}></div>
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 </div>
                 <h3 className="text-3xl font-bold mb-3">Agent Native</h3>
                 <p className="text-zinc-400 max-w-lg text-lg">
                   The first marketplace designed for non-human actors. Our SDK allows autonomous agents to negotiate and purchase rights without UI.
                 </p>
               </div>
               <div className="w-full md:w-1/2 h-48 md:h-full bg-black/20 border-l border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="grid grid-cols-6 gap-2 transform -skew-x-12 opacity-40">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className={`w-12 h-12 rounded-lg border border-white/10 ${i % 3 === 0 ? 'bg-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-white/5'}`}></div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-40 text-center relative px-4 pb-20 overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-indigo-500/20 to-pink-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
           <h2 className="text-4xl md:text-7xl font-bold mb-10 relative z-10 tracking-tight">
             Ready to bridge<br/>the gap?
           </h2>
           <Link 
            href="/create"
            className="relative z-10 px-12 py-6 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_80px_rgba(255,255,255,0.3)] active:scale-95 group inline-flex items-center"
           >
             Start Registering <Sparkles className="ml-2 text-indigo-500 group-hover:rotate-12 transition-transform" />
           </Link>
        </div>
      </div>
    </div>
  );
}

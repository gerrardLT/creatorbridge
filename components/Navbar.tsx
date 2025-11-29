'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Wallet, LogOut, LayoutGrid, PlusCircle, Menu, X, User } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 transition-transform duration-500 hover:rotate-180">
      <defs>
        <linearGradient id="logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" 
        stroke="url(#logo_grad)" 
        strokeWidth="4" 
        strokeLinecap="round"
        filter="url(#glow)"
        className="opacity-80"
      />
      <path 
        d="M28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20" 
        stroke="url(#logo_grad)" 
        strokeWidth="4" 
        strokeLinecap="round"
        className="opacity-50"
      />
      <circle cx="20" cy="20" r="3" fill="white" />
    </svg>
  );
}

export function Navbar() {
  const { user, login, logout, isConnected, walletAddress } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium backdrop-blur-md ${
      isActive
        ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 py-3' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="flex items-center cursor-pointer group select-none">
            <Logo />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-none text-white">
                CreatorBridge
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                Protocol
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 rounded-full p-1.5 bg-white/5 border border-white/5 backdrop-blur-md">
            <Link href="/explore" className={navItemClass('/explore')}>
              <LayoutGrid size={16} />
              <span>Explore</span>
            </Link>
            {isConnected && (
              <Link href="/create" className={navItemClass('/create')}>
                <PlusCircle size={16} />
                <span>Create</span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {!isConnected ? (
              <button
                onClick={login}
                className="group relative flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all overflow-hidden bg-white text-black hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <Wallet size={16} className="relative z-10" />
                <span className="relative z-10">Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3 rounded-full pl-1 pr-1 py-1 border transition-all bg-zinc-900/80 border-white/10 text-white hover:border-white/20 backdrop-blur-md">
                <Link 
                  href="/profile"
                  className="flex items-center space-x-3 rounded-full pl-0 pr-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={user?.avatarUrl || `https://picsum.photos/seed/${walletAddress}/100/100`}
                      alt={user?.name || 'User'}
                      className="w-8 h-8 rounded-full border border-white/10"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-xs font-bold">{user?.name || 'Connected'}</span>
                    <span className="text-[10px] font-mono opacity-60 text-zinc-400">{walletAddress ? truncateAddress(walletAddress, 4) : ''}</span>
                  </div>
                </Link>
                <div className="h-4 w-[1px] bg-white/20"></div>
                <button
                  onClick={logout}
                  className="transition-colors p-1.5 mr-1 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                  title="Disconnect"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/90 backdrop-blur-xl border-b border-zinc-800 p-4 flex flex-col space-y-4 shadow-2xl">
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="text-white py-2 font-medium border-b border-white/5 flex items-center">
            <LayoutGrid size={16} className="mr-2"/> Explore Market
          </Link>
          {isConnected && (
            <>
              <Link href="/create" onClick={() => setMobileMenuOpen(false)} className="text-white py-2 font-medium border-b border-white/5 flex items-center">
                <PlusCircle size={16} className="mr-2"/> Create Asset
              </Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-white py-2 font-medium border-b border-white/5 flex items-center">
                <User size={16} className="mr-2"/> My Profile
              </Link>
            </>
          )}
          <button onClick={isConnected ? logout : login} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold mt-2">
            {isConnected ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </nav>
  );
}

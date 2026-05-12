'use client';

import React from 'react';
import Image from 'next/image';

interface GlassHeaderProps {
  userName: string;
  location?: string;
  onLogout?: () => void;
}

const GlassHeader: React.FC<GlassHeaderProps> = ({ userName, location, onLogout }) => {
  return (
    <div className="glass-card p-8 md:p-10 border-none shadow-none bg-white/5 backdrop-blur-md flex items-center justify-between relative overflow-visible">
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-black text-white text-shadow-lg leading-tight">
            Hola, {userName} 👋
          </h1>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-black/20 border border-white/10 hover:bg-red-500/20 hover:border-red-500/20 text-white hover:text-red-400 transition-all cursor-pointer shadow-lg"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          )}
        </div>
        {location && (
          <div className="flex items-center gap-2 text-white/80 text-xs md:text-sm font-bold tracking-wide drop-shadow-md bg-black/10 w-fit px-2 py-0.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {location}
          </div>
        )}
      </div>
      
      {/* Refined Logo Integration - Static */}
      <div className="relative ml-4">
        <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white/10 rounded-2xl border border-white/5 overflow-hidden">
          <img 
            src="/assets/logo.svg" 
            alt="Logo Las Higueras Activa" 
            className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default GlassHeader;

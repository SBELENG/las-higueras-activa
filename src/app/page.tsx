'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { THEME } from '@/config/theme';

export default function OnboardingPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasSession(!!localStorage.getItem('lh_activa_user'));
  }, []);

  if (!isClient) return null;

  const handleNavigation = (destination: string) => {
    const savedUser = localStorage.getItem('lh_activa_user');
    if (savedUser) {
      router.push(destination);
    } else {
      // Pass the intended destination so they could be redirected later if we wanted, 
      // but for now, just force them to login first.
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div className="splash-screen relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>

      <div
        className="glass-card max-w-[90vw] md:max-w-xl mx-auto flex flex-col items-center gap-10 border-white/10 text-center z-10"
      >
        <div>
          <Image
            src={THEME.assets.logo}
            alt="Las Higueras Activa"
            width={120}
            height={120}
            className="splash-logo shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="splash-title !mb-0 text-3xl md:text-5xl">
            Las Higueras Activa
          </h1>

          <p className="splash-subtitle !mb-0 mx-auto">
            Tu voz importa. Hacé tu reclamo en segundos y seguilo en tiempo real.
          </p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219a52] text-white font-black py-6 px-8 rounded-3xl border border-[#2ECC71]/30 shadow-[0_10px_40px_-10px_rgba(46,204,113,0.5)] group flex items-center justify-center gap-4 w-full transition-all transform hover:scale-[1.02] active:scale-95 text-lg tracking-wide ring-2 ring-[#2ECC71]/20 ring-offset-2 ring-offset-transparent"
            onClick={() => handleNavigation('/reclamo/nuevo')}
          >
            <span className="text-2xl">🚨</span>
            <span className="flex-1 text-left">Comenzar Reclamo</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {hasSession && (
            <>
              <button
                className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 shadow-lg group flex items-center justify-center gap-3 w-full transition-all"
                onClick={() => handleNavigation('/reclamos')}
              >
                <span className="text-xl">🚥</span>
                <span className="flex-1 text-left tracking-wide">Seguir mi Reclamo</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 shadow-lg group flex items-center justify-center gap-3 w-full transition-all"
                onClick={() => handleNavigation('/mensajes')}
              >
                <span className="text-xl">📢</span>
                <span className="flex-1 text-left tracking-wide">Ver Mensajes</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>



        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          Municipalidad de Las Higueras · Córdoba, Argentina
        </p>

        {/* Acceso Administrador (Oculto sutilmente abajo) */}
        <button 
          onClick={() => router.push('/admin')}
          className="absolute bottom-4 right-4 p-2 text-white/10 hover:text-white/30 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </button>
      </div>
    </div>
  );
}

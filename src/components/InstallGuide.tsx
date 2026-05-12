'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function InstallGuide() {
  const pathname = usePathname();
  const [showGuide, setShowGuide] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Only show on landing page ('/')
    if (pathname !== '/') return;

    // Check if dismissed before
    const isDismissed = localStorage.getItem('lh_install_guide_dismissed');
    if (isDismissed) return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // Show guide after 3 seconds
    const timer = setTimeout(() => {
      setShowGuide(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    setShowGuide(false);
    localStorage.setItem('lh_install_guide_dismissed', 'true');
  };

  if (!showGuide || platform === 'other') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-6 right-6 z-[100]"
      >
        <div className="glass-card p-5 border-[#2ECC71]/30 bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Accent light */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#2ECC71]/20 blur-3xl rounded-full"></div>
          
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2ECC71] to-[#27AE60] rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0">
              📲
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-sm">Instalá la App Oficial</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                {platform === 'ios' ? (
                  <>Para recibir alertas de tus reclamos: Tocá el botón <span className="inline-block bg-white/10 px-1.5 py-0.5 rounded mx-0.5">⎋</span> (Compartir) y luego <span className="text-white font-semibold">"Agregar a inicio"</span>.</>
                ) : (
                  <>Para recibir alertas de tus reclamos en tiempo real: Tocá los <span className="text-white font-semibold">"tres puntos"</span> del navegador y elegí <span className="text-white font-semibold">"agregar aplicación a pantalla principal"</span>.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

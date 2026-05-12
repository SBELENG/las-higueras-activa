'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function InstallGuide() {
  const pathname = usePathname();
  const [showGuide, setShowGuide] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Show only on landing page or admin panel
    const allowedPaths = ['/', '/admin'];
    if (!allowedPaths.includes(pathname)) return;

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

    // Handle Native Install Prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If we have the native prompt, show the guide immediately (as it's more interactive)
      setShowGuide(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If not native, show manual guide after 4 seconds
    const timer = setTimeout(() => {
      if (!deferredPrompt) setShowGuide(true);
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [pathname, deferredPrompt]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('lh_install_guide_dismissed', 'true');
    }
    setDeferredPrompt(null);
    setShowGuide(false);
  };

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
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-white font-bold text-sm">Instalá Las Higueras Activa</h3>
                <p className="text-white/60 text-xs leading-relaxed mt-1">
                  {deferredPrompt ? (
                    'Descargá la aplicación oficial para una mejor experiencia y notificaciones.'
                  ) : platform === 'ios' ? (
                    <>Tocá el botón <span className="inline-block bg-white/10 px-1.5 py-0.5 rounded mx-0.5">⎋</span> (Compartir) y luego <span className="text-white font-semibold">"Agregar a inicio"</span>.</>
                  ) : (
                    <>Tocá los <span className="text-white font-semibold">"tres puntos"</span> del navegador y elegí <span className="text-white font-semibold">"agregar aplicación a pantalla principal"</span>.</>
                  )}
                </p>
              </div>

              {deferredPrompt && (
                <button
                  onClick={handleNativeInstall}
                  className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  Instalar Ahora
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

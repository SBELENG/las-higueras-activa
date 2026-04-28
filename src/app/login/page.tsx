'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const USER_ROLES = [
  { id: 'vecino', label: 'Vecino común', icon: '🏠' },
  { id: 'comercio', label: 'Comercio', icon: '🏪' },
  { id: 'institucion', label: 'Institución / Asociación', icon: '🏛️' }
];

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: Profile
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Sigo con el resto pero protegiendo el render inicial
  if (!isClient) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;

    setLoading(true);
    // Simulating SMS sending
    setTimeout(() => {
      setLoading(false);
      setMessage('✅ Código enviado al ' + phone);
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 1500);
    }, 1000);
  };

  const handleFinishProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !acceptedTerms) return;

    // Simulate saving profile and logging in
    localStorage.setItem('lh_activa_user', JSON.stringify({ 
      name, 
      phone, 
      role 
    }));
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirect') || '/home';
    router.push(redirectTo);
  };

  return (
    <main className="min-h-screen relative p-6 flex items-center justify-center">
      <div className="app-bg"></div>

      <div className="w-full max-w-lg px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card space-y-8 w-full"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-6">
                  <img src="/assets/logo.svg" alt="Las Higueras Activa" className="h-16 w-auto drop-shadow-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-white text-shadow tracking-tight">Identificación</h1>
                <p className="text-white/50 text-sm">Tu puerta de confianza a Las Higueras</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">N° de Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 3584123456"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white text-lg focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {message && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-[#2ECC71] text-center text-sm font-medium"
                  >
                    {message}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.length < 8}
                  className="w-full bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-50 text-white font-bold p-4 rounded-2xl shadow-lg transition-all transform active:scale-95"
                >
                  {loading ? 'Enviando...' : 'Recibir código'}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs">
                Sin contraseñas, directo a tu teléfono.
              </p>
            </motion.div>
          ) : (
            <div
              key="profile-step"
              className="glass-card space-y-10 relative flex flex-col"
            >
              {/* Back to Phone Step */}
              <button 
                onClick={() => setStep(1)}
                className="absolute top-10 left-10 text-white/40 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white text-shadow">Completar Perfil</h1>
                <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Contanos un poco sobre vos</p>
              </div>

              <form onSubmit={handleFinishProfile} className="space-y-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tu Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Escribí tu nombre"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                <div className="space-y-6">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">¿Cómo te identificás?</label>
                  <div className="grid grid-cols-1 gap-6">
                    {USER_ROLES.map((uRole) => (
                      <label 
                        key={uRole.id}
                        className={`flex items-center gap-5 p-5 rounded-2xl border cursor-pointer transition-all ${
                          role === uRole.id 
                            ? 'bg-white/10 border-[#2ECC71] shadow-[0_0_15px_rgba(46,204,113,0.2)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          className="hidden"
                          value={uRole.id}
                          checked={role === uRole.id}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        <span className="text-3xl">{uRole.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold text-base">{uRole.label}</p>
                        </div>
                        {role === uRole.id && (
                          <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  </div>
                </div>

                {/* --- Términos y Condiciones --- */}
                <div className="pt-14 mt-6 border-t border-white/10 space-y-6">
                  <label className="flex items-start gap-5 cursor-pointer p-6 bg-black/30 rounded-2xl border-2 border-[#2ECC71]/20 hover:border-[#2ECC71]/40 transition-all shadow-lg">
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        required
                        className="w-6 h-6 accent-[#2ECC71] rounded shrink-0 cursor-pointer"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 text-sm font-semibold leading-relaxed">
                        Acepto los términos y condiciones de uso.
                      </p>
                    </div>
                  </label>

                  <a 
                    href="#" 
                    className="block text-center text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white/60 transition-colors mt-4"
                  >
                    Ver políticas de privacidad
                  </a>
                </div>

                {/* --- Botón y créditos --- */}
                <div className="pt-6 space-y-5">
                  <button
                    type="submit"
                    disabled={!name || !role || !acceptedTerms}
                    className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219a52] disabled:opacity-50 text-white font-black py-5 px-8 rounded-2xl shadow-[0_8px_30px_-8px_rgba(46,204,113,0.5)] transition-all transform active:scale-95 text-base tracking-wide"
                  >
                    Comenzar
                  </button>

                  <p className="text-center text-[#2ECC71]/40 text-[9px] font-black tracking-widest uppercase pt-2">
                    Desarrollado por Ideas Digitales
                  </p>
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

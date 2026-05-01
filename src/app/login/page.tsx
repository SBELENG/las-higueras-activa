'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const USER_ROLES = [
  { id: 'vecino', label: 'Vecino común', icon: '🏠' },
  { id: 'comercio', label: 'Comercio', icon: '🏪' },
  { id: 'institucion', label: 'Institución / Asociación', icon: '🏛️' }
];

const CODE_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: Code Verification, 3: Profile
  const [phone, setPhone] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devCode, setDevCode] = useState(''); // Only for development

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  // Auto-focus first code input when entering step 2
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    }
  }, [step]);

  // Sigo con el resto pero protegiendo el render inicial
  if (!isClient) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;

    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Error al enviar el código');
        setLoading(false);
        return;
      }

      // In development, store the code for display
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setMessage('✅ Código enviado al ' + phone);
      setResendTimer(60);
      setCodeDigits(Array(CODE_LENGTH).fill(''));

      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 1200);
    } catch {
      setErrorMessage('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    setErrorMessage('');

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    const fullCode = newDigits.join('');
    if (fullCode.length === CODE_LENGTH && newDigits.every(d => d !== '')) {
      handleVerifyCode(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pastedData.length > 0) {
      const newDigits = Array(CODE_LENGTH).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setCodeDigits(newDigits);
      
      // Focus the next empty or last input
      const nextIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === CODE_LENGTH) {
        handleVerifyCode(pastedData);
      }
    }
  };

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Código incorrecto');
        setLoading(false);
        // Clear code inputs on error
        setCodeDigits(Array(CODE_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      setMessage('✅ Teléfono verificado correctamente');
      setTimeout(() => {
        setStep(3);
        setMessage('');
        setDevCode('');
      }, 1200);
    } catch {
      setErrorMessage('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Error al reenviar');
        setLoading(false);
        return;
      }

      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setMessage('✅ Nuevo código enviado');
      setResendTimer(60);
      setCodeDigits(Array(CODE_LENGTH).fill(''));
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setErrorMessage('Error de conexión.');
    } finally {
      setLoading(false);
    }
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
          {/* ========== STEP 1: PHONE NUMBER ========== */}
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

                {errorMessage && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-red-400 text-center text-sm font-medium"
                  >
                    {errorMessage}
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

          /* ========== STEP 2: CODE VERIFICATION ========== */
          ) : step === 2 ? (
            <motion.div
              key="code-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card space-y-8 w-full"
            >
              {/* Back button */}
              <button 
                onClick={() => { setStep(1); setErrorMessage(''); setMessage(''); }}
                className="absolute top-10 left-10 text-white/40 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#2ECC71]/15 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white text-shadow tracking-tight">Verificar Teléfono</h1>
                <p className="text-white/50 text-sm leading-relaxed">
                  Ingresá el código de <strong className="text-white/70">6 dígitos</strong> que enviamos al
                </p>
                <p className="text-[#2ECC71] font-bold text-lg tracking-wide">{phone}</p>
              </div>

              {/* Code Input Boxes */}
              <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-white/5 text-white focus:outline-none transition-all duration-200 ${
                      digit 
                        ? 'border-[#2ECC71] shadow-[0_0_12px_rgba(46,204,113,0.25)]' 
                        : 'border-white/15 focus:border-[#2ECC71]/60'
                    } ${errorMessage ? 'border-red-400/60 animate-shake' : ''}`}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Messages */}
              {message && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-[#2ECC71] text-center text-sm font-medium"
                >
                  {message}
                </motion.p>
              )}

              {errorMessage && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-red-400 text-center text-sm font-medium"
                >
                  {errorMessage}
                </motion.p>
              )}

              {loading && (
                <div className="flex justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#2ECC71] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#2ECC71] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#2ECC71] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* Dev code hint - only in development */}
              {devCode && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
                >
                  <p className="text-yellow-400/80 text-[10px] font-bold uppercase tracking-widest mb-1">⚠️ Modo Desarrollo</p>
                  <p className="text-yellow-300 font-mono text-2xl font-bold tracking-[0.3em]">{devCode}</p>
                </motion.div>
              )}

              {/* Timer and Resend */}
              <div className="text-center space-y-4 pt-2">
                <p className="text-white/30 text-xs">
                  {resendTimer > 0 
                    ? `El código expira en 5 minutos` 
                    : '¿No recibiste el código?'}
                </p>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm font-semibold transition-all ${
                    resendTimer > 0 
                      ? 'text-white/20 cursor-not-allowed' 
                      : 'text-[#2ECC71] hover:text-[#27AE60] active:scale-95'
                  }`}
                >
                  {resendTimer > 0 
                    ? `Reenviar código en ${resendTimer}s` 
                    : '🔄 Reenviar código'}
                </button>
              </div>
            </motion.div>

          /* ========== STEP 3: PROFILE ========== */
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
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#2ECC71]/15 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
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

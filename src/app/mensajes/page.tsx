'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MensajesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Load messages from local storage
    const saved = localStorage.getItem('lh_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  const markAsRead = (id: number) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('lh_messages', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen relative p-6 md:p-12 flex flex-col items-center">
      <div className="app-bg"></div>
      
      <div className="w-full max-w-lg space-y-8 z-10 pt-4">
        {/* Back Button */}
        <button onClick={() => router.push('/home')} className="text-white/60 hover:text-white flex items-center gap-2 mb-2 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver
        </button>

        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-shadow">Mensajes y Avisos</h1>
          <p className="text-white/60 text-sm">Comunicaciones oficiales del Municipio hacia vos</p>
        </header>

        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => markAsRead(msg.id)}
                className={`glass-card p-8 group cursor-default transition-all border-l-4 ${
                  !msg.read ? 'border-l-[#2ECC71] border-white/20' : 'border-l-transparent border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2ECC71]">
                      {msg.from}
                    </span>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {msg.title}
                    </h2>
                  </div>
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-[#2ECC71] shadow-[0_0_10px_#2ECC71]"></span>
                  )}
                </div>
                
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {msg.body}
                </p>
                
                <div className="flex justify-between items-center text-[10px] text-white/30 font-bold uppercase tracking-wider">
                  <span>{new Date(msg.date).toLocaleDateString('es-AR')}</span>
                  {msg.type === 'alert' && <span className="text-[#E74C3C]">Aviso Crítico</span>}
                  {msg.type === 'info' && <span className="text-[#3498DB]">Información</span>}
                  {msg.type === 'update' && <span className="text-[#F1C40F]">Trámite</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 0 && (
            <div className="glass-card p-12 text-center space-y-4">
              <span className="text-4xl opacity-20">📭</span>
              <p className="text-white/40 text-sm italic">No hay mensajes nuevos en este momento</p>
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-[10px] pt-10">
          Este canal es solo para recibir avisos del Municipio.<br/>
          Para reportar un problema, usá el botón "Hacer Reclamo".
        </p>
      </div>
    </main>
  );
}
